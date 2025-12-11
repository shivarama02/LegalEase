import React, { useEffect, useMemo, useState } from 'react';
import LawyerSidebar from '../../components/LawyerSidebar';
import { Scale, Plus, Calendar, Clock, Check, User, Mail, Phone, MapPin, Edit } from 'lucide-react';
import { apiUrl } from '../../api';

export default function AppointmentSchedule() {
	// Local state
	const [appointments, setAppointments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [activeTab, setActiveTab] = useState('today'); // today | upcoming | completed | all
	const [calendarMonth, setCalendarMonth] = useState(() => {
		const d = new Date();
		d.setDate(1);
		return d;
	});
	const [selectedDate, setSelectedDate] = useState(null); // 'YYYY-MM-DD'

	// Fetch appointments on mount
	useEffect(() => {
		let isMounted = true;
		async function load() {
			try {
				setLoading(true);
				setError('');
				const token = localStorage.getItem('authToken');
				const res = await fetch(apiUrl('/appointments/'), {
					headers: {
						'Content-Type': 'application/json',
						...(token ? { Authorization: `Token ${token}` } : {}),
					},
				});
				if (!res.ok) {
					throw new Error(`Failed to load appointments: ${res.status}`);
				}
				const data = await res.json();
				if (isMounted) setAppointments(Array.isArray(data) ? data : []);
			} catch (e) {
				console.error(e);
				if (isMounted) setError(e.message || 'Failed to load appointments');
			} finally {
				if (isMounted) setLoading(false);
			}
		}
		load();
		return () => {
			isMounted = false;
		};
	}, []);

	// Helpers for date/time and filters
	const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
	const nowTimeStr = useMemo(() => {
		const d = new Date();
		return d.toTimeString().slice(0, 8); // HH:MM:SS
	}, []);

	function fmtYYYYMMDD(d) {
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${y}-${m}-${day}`;
	}
	function daysInMonth(d) {
		return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
	}
	function startDayIndex(d) {
		// 0=Sun .. 6=Sat
		return new Date(d.getFullYear(), d.getMonth(), 1).getDay();
	}
	function prevMonth() {
		setCalendarMonth(prev => {
			const nd = new Date(prev);
			nd.setMonth(nd.getMonth() - 1);
			return new Date(nd.getFullYear(), nd.getMonth(), 1);
		});
	}
	function nextMonth() {
		setCalendarMonth(prev => {
			const nd = new Date(prev);
			nd.setMonth(nd.getMonth() + 1);
			return new Date(nd.getFullYear(), nd.getMonth(), 1);
		});
	}
	function onSelectDate(dayNum) {
		const d = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dayNum);
		const iso = fmtYYYYMMDD(d);
		setSelectedDate(iso);
		setActiveTab('date');
	}

	function isToday(a) {
		return a.appointment_date === todayStr;
	}
	function isUpcoming(a) {
		if (a.status && a.status.toLowerCase() !== 'scheduled') return false;
		if (a.appointment_date > todayStr) return true;
		if (a.appointment_date === todayStr && (a.appointment_time || '') > nowTimeStr) return true;
		return false;
	}
	function isCompleted(a) {
		return (a.status || '').toLowerCase() === 'completed';
	}

	const summary = useMemo(() => {
		const today = appointments.filter(isToday).length;
		const upcoming = appointments.filter(isUpcoming).length;
		const completed = appointments.filter(isCompleted).length;
		return { today, upcoming, completed, all: appointments.length };
	}, [appointments]);

	const filtered = useMemo(() => {
		switch (activeTab) {
			case 'today':
				return appointments.filter(isToday);
			case 'upcoming':
				return appointments.filter(isUpcoming);
			case 'completed':
				return appointments.filter(isCompleted);
      case 'date':
        return selectedDate ? appointments.filter(a => a.appointment_date === selectedDate) : appointments;
			default:
				return appointments;
		}
	}, [appointments, activeTab, selectedDate]);

	async function updateStatus(id, newStatus) {
		try {
			const token = localStorage.getItem('authToken');
			const res = await fetch(apiUrl(`/appointments/${id}/`), {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					...(token ? { Authorization: `Token ${token}` } : {}),
				},
				body: JSON.stringify({ status: newStatus }),
			});
			if (!res.ok) throw new Error('Failed to update status');
			const updated = await res.json();
			setAppointments(prev => prev.map(a => (a.id === id ? updated : a)));
		} catch (e) {
			console.error(e);
			alert(e.message || 'Update failed');
		}
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="flex min-h-screen">
				{/* Sidebar */}
				<LawyerSidebar />

				{/* Main Content */}
				<div className="flex-1 p-6">
					<div className="max-w-7xl mx-auto">
						{/* Header */}
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center space-x-4">
								
								<div className="flex items-center space-x-2">
									<Scale className="h-8 w-8 text-blue-600" />
									<h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
							{/* Calendar */}
							<div className="bg-white rounded-xl shadow p-4 lg:col-span-1">
								<h2 className="text-lg font-semibold mb-4">Calendar</h2>
								<div className="border rounded-md p-3">
									{/* Calendar header */}
									<div className="flex items-center justify-between mb-2">
										<button onClick={prevMonth} className="px-2 py-1 text-sm rounded hover:bg-gray-100">◀</button>
										<div className="font-medium">
											{calendarMonth.toLocaleString(undefined, { month: 'long' })} {calendarMonth.getFullYear()}
										</div>
										<button onClick={nextMonth} className="px-2 py-1 text-sm rounded hover:bg-gray-100">▶</button>
									</div>
									{/* Weekday labels */}
									<div className="grid grid-cols-7 text-xs text-gray-500 mb-1">
										{['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
											<div key={d} className="text-center py-1">{d}</div>
										))}
									</div>
									{/* Days grid */}
									<div className="grid grid-cols-7 gap-1">
										{Array.from({ length: startDayIndex(calendarMonth) }).map((_, i) => (
											<div key={`empty-${i}`} className="h-8" />
										))}
										{Array.from({ length: daysInMonth(calendarMonth) }).map((_, idx) => {
											const dayNum = idx + 1;
											const d = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dayNum);
											const iso = fmtYYYYMMDD(d);
											const isTodayCell = iso === todayStr;
											const isSelected = selectedDate === iso;
											const hasAppt = appointments.some(a => a.appointment_date === iso);
											return (
												<button
													key={iso}
													onClick={() => onSelectDate(dayNum)}
													className={
														`h-8 text-sm rounded flex items-center justify-center relative ` +
														(isSelected ? 'bg-blue-600 text-white ' : 'hover:bg-gray-100 ') +
														(isTodayCell && !isSelected ? 'ring-1 ring-blue-400 ' : '')
													}
													title={iso}
												>
													{dayNum}
													{hasAppt && (
														<span className={
															`absolute bottom-0.5 h-1.5 w-1.5 rounded-full ` +
															(isSelected ? 'bg-white' : 'bg-blue-500')
														} />
													)}
												</button>
											);
										})}
									</div>
									{/* Selected date info and clear */}
									<div className="mt-3 flex items-center justify-between">
										<div className="text-xs text-gray-600">
											{selectedDate ? `Selected: ${selectedDate}` : 'Select a date'}
										</div>
										{selectedDate && (
											<button
												onClick={() => { setSelectedDate(null); setActiveTab('today'); }}
												className="text-xs text-blue-600 hover:underline"
											>
												Clear
											</button>
										)}
									</div>
								</div>
							</div>

							{/* Appointments */}
							<div className="lg:col-span-3">
								{/* Summary Cards */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
									<div className="bg-white rounded-xl shadow p-4">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm text-gray-500">Today</p>
												<p className="text-2xl font-bold">{summary.today}</p>
											</div>
											<Calendar className="h-8 w-8 text-blue-600" />
										</div>
									</div>
									<div className="bg-white rounded-xl shadow p-4">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm text-gray-500">Upcoming</p>
												<p className="text-2xl font-bold">{summary.upcoming}</p>
											</div>
											<Clock className="h-8 w-8 text-orange-600" />
										</div>
									</div>
									<div className="bg-white rounded-xl shadow p-4">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm text-gray-500">Completed</p>
												<p className="text-2xl font-bold">{summary.completed}</p>
											</div>
											<Check className="h-8 w-8 text-green-600" />
										</div>
									</div>
								</div>

								{/* Tabs */}
								<div>
									<div className="flex space-x-2 border-b mb-4">
										<button onClick={() => setActiveTab('today')} className={`px-4 py-2 ${activeTab==='today' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-600 hover:text-black'}`}>Today ({summary.today})</button>
										<button onClick={() => setActiveTab('upcoming')} className={`px-4 py-2 ${activeTab==='upcoming' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-600 hover:text-black'}`}>Upcoming ({summary.upcoming})</button>
										<button onClick={() => setActiveTab('completed')} className={`px-4 py-2 ${activeTab==='completed' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-600 hover:text-black'}`}>Completed ({summary.completed})</button>
										<button onClick={() => setActiveTab('all')} className={`px-4 py-2 ${activeTab==='all' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-600 hover:text-black'}`}>All ({summary.all})</button>
                    {selectedDate && (
                      <button onClick={() => setActiveTab('date')} className={`px-4 py-2 ${activeTab==='date' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-600 hover:text-black'}`}>Date ({appointments.filter(a=>a.appointment_date===selectedDate).length})</button>
                    )}
									</div>

									{/* Results area */}
									{loading && (
										<div className="text-gray-500">Loading appointments…</div>
									)}
									{!loading && error && (
										<div className="text-red-600">{error}</div>
									)}
									{!loading && !error && filtered.length === 0 && (
										<div className="text-gray-500">No appointments found.</div>
									)}
									{!loading && !error && filtered.map((a) => {
										const status = (a.status || '').toLowerCase();
										const statusStyle = status === 'scheduled'
											? 'bg-blue-100 text-blue-800'
											: status === 'completed'
											? 'bg-green-100 text-green-800'
											: 'bg-gray-200 text-gray-800';
										return (
											<div key={a.id} className="bg-white rounded-xl shadow mb-4">
												<div className="p-4 flex items-center justify-between">
													<h3 className="text-lg font-semibold flex items-center space-x-2">
														<User className="h-4 w-4" />
														<span>{a.name || 'Unknown'}</span>
													</h3>
													<span className={`${statusStyle} text-xs px-2 py-1 rounded uppercase`}>{status || 'scheduled'}</span>
												</div>
												<div className="p-4 border-t space-y-3">
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
														<div className="space-y-2">
															<div className="flex items-center space-x-2">
																<Mail className="h-4 w-4 text-gray-500" />
																<span>{a.email || '-'}</span>
															</div>
															{/* Phone not available in model; keep placeholder hidden */}
															{/* <div className="flex items-center space-x-2">
																<Phone className="h-4 w-4 text-gray-500" />
																<span>-</span>
															</div> */}
															<div className="flex items-center space-x-2">
																<MapPin className="h-4 w-4 text-gray-500" />
																<span>{a.lawyer_type || 'Office'}</span>
															</div>
														</div>
														<div className="space-y-2">
															<div className="flex items-center space-x-2">
																<Calendar className="h-4 w-4 text-gray-500" />
																<span>{a.appointment_date}</span>
															</div>
															<div className="flex items-center space-x-2">
																<Clock className="h-4 w-4 text-gray-500" />
																<span>{a.appointment_time?.slice(0,5)}</span>
															</div>
															<div className="flex items-center space-x-2">
																<User className="h-4 w-4 text-gray-500" />
																<span>{a.case_type || 'Consultation'}</span>
															</div>
														</div>
													</div>

													{a.notes && (
														<div>
															<h4 className="font-medium mb-2">Notes:</h4>
															<p className="text-sm text-gray-500 bg-gray-100 p-3 rounded-lg">
																{a.notes}
															</p>
														</div>
													)}

													<div className="flex justify-end space-x-2">
														<button onClick={() => updateStatus(a.id, 'cancelled')} className="px-3 py-1 border rounded text-gray-700">Cancel</button>
														{status !== 'completed' && (
															<button onClick={() => updateStatus(a.id, 'completed')} className="px-3 py-1 border rounded text-gray-700">Mark Complete</button>
														)}
														<button className="px-3 py-1 border rounded text-gray-700 flex items-center">
															<Edit className="h-4 w-4 mr-2" />
															Edit
														</button>
													</div>
												</div>
											</div>
										);
									})}

								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

