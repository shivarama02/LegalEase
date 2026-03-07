import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LawyerSidebar from '../../components/LawyerSidebar';
import {
  Calendar, Clock, Check, CheckCircle2, XCircle, RotateCcw, ChevronLeft, ChevronRight,
  User, Mail, MapPin, FileText, Briefcase, Loader2, AlertCircle, CalendarDays,
} from 'lucide-react';
import { apiUrl } from '../../api';

const STATUS_CFG = {
  scheduled: { label: 'Pending', dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock size={13} /> },
  accepted:  { label: 'Accepted', dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200', icon: <CheckCircle2 size={13} /> },
  rescheduled: { label: 'Rescheduled', dot: 'bg-purple-500', badge: 'bg-purple-50 text-purple-700 border-purple-200', icon: <RotateCcw size={13} /> },
  completed: { label: 'Completed', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <Check size={13} /> },
  cancelled: { label: 'Cancelled', dot: 'bg-red-500', badge: 'bg-red-50 text-red-600 border-red-200', icon: <XCircle size={13} /> },
};



export default function ManageAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });

  // Today is pre-selected on load
  const isTodaySelected = selectedDate === new Date().toISOString().slice(0, 10);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('authToken');
      const res = await fetch(apiUrl('/appointments/'), {
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Token ${token}` } : {}) },
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // Calendar helpers
  function fmtDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
  const startDay = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1).getDay();

  function prevMonth() { setCalMonth(p => { const n = new Date(p); n.setMonth(n.getMonth() - 1); return new Date(n.getFullYear(), n.getMonth(), 1); }); }
  function nextMonth() { setCalMonth(p => { const n = new Date(p); n.setMonth(n.getMonth() + 1); return new Date(n.getFullYear(), n.getMonth(), 1); }); }

  // Map date → array of statuses
  const dateStatusMap = useMemo(() => {
    const map = {};
    appointments.forEach(a => {
      if (!map[a.appointment_date]) map[a.appointment_date] = new Set();
      map[a.appointment_date].add(a.status || 'scheduled');
    });
    return map;
  }, [appointments]);

  // Summary counts
  const counts = useMemo(() => {
    const c = { all: appointments.length, scheduled: 0, accepted: 0, rescheduled: 0, completed: 0, cancelled: 0 };
    appointments.forEach(a => { const s = a.status || 'scheduled'; if (c[s] !== undefined) c[s]++; });
    return c;
  }, [appointments]);

  // Filtered
  const filtered = useMemo(() => {
    let list = appointments;
    if (activeTab !== 'all') list = list.filter(a => (a.status || 'scheduled') === activeTab);
    if (selectedDate) list = list.filter(a => a.appointment_date === selectedDate);
    return list;
  }, [appointments, activeTab, selectedDate]);

  // Status action
  async function updateStatus(id, newStatus, extraBody = {}) {
    try {
      setActionLoading(id);
      const token = sessionStorage.getItem('authToken');
      const res = await fetch(apiUrl(`/appointments/${id}/`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Token ${token}` } : {}) },
        body: JSON.stringify({ status: newStatus, ...extraBody }),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      setAppointments(prev => prev.map(a => a.id === id ? updated : a));
      setRescheduleId(null);
      setRescheduleDate('');
      setRescheduleTime('');
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  function handleReschedule(id) {
    if (!rescheduleDate || !rescheduleTime) { alert('Pick a new date and time'); return; }
    updateStatus(id, 'rescheduled', { appointment_date: rescheduleDate, appointment_time: rescheduleTime });
  }

  // Priority order for dots: cancelled > completed > accepted > scheduled > rescheduled
  const DOT_ORDER = ['cancelled', 'completed', 'accepted', 'rescheduled', 'scheduled'];

  return (
    <div className="min-h-screen flex bg-slate-50">
      <LawyerSidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <CalendarDays size={20} className="text-white" />
              </div>
              Manage Appointments
            </h1>
            <p className="text-slate-500 mt-1 ml-[52px]">Accept, reschedule, or manage client appointments</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {[
              { key: 'scheduled', label: 'Pending', color: 'from-amber-400 to-amber-500', icon: Clock },
              { key: 'accepted', label: 'Accepted', color: 'from-blue-500 to-blue-600', icon: CheckCircle2 },
              { key: 'completed', label: 'Completed', color: 'from-emerald-500 to-emerald-600', icon: Check },
              { key: 'cancelled', label: 'Cancelled', color: 'from-red-500 to-red-600', icon: XCircle },
              { key: 'rescheduled', label: 'Rescheduled', color: 'from-purple-500 to-purple-600', icon: RotateCcw },
            ].map(s => (
              <div key={s.key} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setActiveTab(s.key); setSelectedDate(null); }}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shrink-0`}>
                  <s.icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{counts[s.key]}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Calendar Panel */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-emerald-600" /> Calendar
                </h2>
                {/* Month nav */}
                <div className="flex items-center justify-between mb-3">
                  <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><ChevronLeft size={18} /></button>
                  <span className="font-semibold text-slate-800">
                    {calMonth.toLocaleString(undefined, { month: 'long' })} {calMonth.getFullYear()}
                  </span>
                  <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><ChevronRight size={18} /></button>
                </div>
                {/* Weekday headers */}
                <div className="grid grid-cols-7 mb-1">
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                    <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
                  ))}
                </div>
                {/* Day cells */}
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: startDay }).map((_, i) => <div key={`e${i}`} className="h-10" />)}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const d = new Date(calMonth.getFullYear(), calMonth.getMonth(), dayNum);
                    const iso = fmtDate(d);
                    const isToday = iso === todayStr;
                    const isSelected = selectedDate === iso;
                    const statuses = dateStatusMap[iso];

                    return (
                      <button key={iso} onClick={() => { setSelectedDate(isSelected ? null : iso); setActiveTab('all'); }}
                        className={`h-10 text-sm rounded-lg flex flex-col items-center justify-center relative transition-all duration-150
                          ${isSelected ? 'bg-emerald-600 text-white shadow-md' : isToday ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'hover:bg-slate-100 text-slate-700'}`}>
                        {dayNum}
                        {statuses && (
                          <div className="flex gap-0.5 mt-0.5">
                            {DOT_ORDER.filter(s => statuses.has(s)).slice(0, 3).map(s => (
                              <span key={s} className={`w-1.5 h-1.5 rounded-full ${STATUS_CFG[s]?.dot || 'bg-slate-300'}`} />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-500 mb-2">Legend</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(STATUS_CFG).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span className={`w-2.5 h-2.5 rounded-full ${v.dot}`} /> {v.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected date info */}
                {selectedDate && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm text-slate-600">Showing: <strong>{selectedDate}</strong></span>
                    <button onClick={() => setSelectedDate(null)} className="text-xs text-emerald-600 hover:underline">Clear</button>
                  </div>
                )}
              </div>
            </div>

            {/* Appointments List */}
            <div className="lg:col-span-8">
              

              {/* Loading / Error / Empty */}
              {loading && (
                <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>
              )}
              {!loading && error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                  <AlertCircle size={32} className="text-red-400 mx-auto mb-2" />
                  <p className="text-red-600">{error}</p>
                </div>
              )}
              {!loading && !error && filtered.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <CalendarDays size={48} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-lg">No appointments found Today!</p>
                  <p className="text-slate-400 text-sm mt-1">Try a different filter or date</p>
                </div>
              )}

              {/* Appointment Cards */}
              {!loading && !error && filtered.map(a => {
                const status = a.status || 'scheduled';
                const cfg = STATUS_CFG[status] || STATUS_CFG.scheduled;
                const isRescheduling = rescheduleId === a.id;

                return (
                  <div key={a.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 hover:shadow-md transition-shadow overflow-hidden">
                    {/* Card Header */}
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                          <User size={18} className="text-slate-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{a.name || 'Unknown'}</h3>
                          <p className="text-xs text-slate-500">{a.email || ''}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${cfg.badge}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="px-5 pb-4 border-t border-slate-100 pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Briefcase size={14} className="text-slate-400" />
                          <span>{a.case_type || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-slate-400" />
                          <span>{a.lawyer_type || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          <span>{a.appointment_date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          <span>{a.appointment_time?.slice(0, 5)}</span>
                        </div>
                      </div>

                      {a.notes && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-xl text-sm text-slate-600">
                          <span className="font-medium text-slate-700">Notes: </span>{a.notes}
                        </div>
                      )}

                      {/* Reschedule Form */}
                      {isRescheduling && (
                        <div className="mt-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                          <p className="text-sm font-medium text-purple-800 mb-3">Reschedule Appointment</p>
                          <div className="flex flex-wrap gap-3">
                            <input type="date" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)}
                              min={todayStr}
                              className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            <input type="time" value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)}
                              className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            <button onClick={() => handleReschedule(a.id)} disabled={actionLoading === a.id}
                              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors">
                              {actionLoading === a.id ? <Loader2 size={14} className="animate-spin" /> : 'Confirm'}
                            </button>
                            <button onClick={() => setRescheduleId(null)}
                              className="px-4 py-2 border border-purple-200 text-purple-700 text-sm rounded-lg hover:bg-purple-100 transition-colors">
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-4 flex flex-wrap gap-2 justify-end">
                        {status === 'scheduled' && (
                          <button onClick={() => updateStatus(a.id, 'accepted')} disabled={actionLoading === a.id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-xl hover:shadow-md shadow-blue-500/25 disabled:opacity-50 transition-all">
                            {actionLoading === a.id ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle2 size={14} /> Accept</>}
                          </button>
                        )}
                        {(status === 'scheduled' || status === 'accepted') && (
                          <>
                            <button onClick={() => setRescheduleId(isRescheduling ? null : a.id)} disabled={actionLoading === a.id}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:shadow-md shadow-purple-500/25 disabled:opacity-50 transition-all">
                              <RotateCcw size={14} /> Reschedule
                            </button>
                            <button onClick={() => updateStatus(a.id, 'completed')} disabled={actionLoading === a.id}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-xl hover:shadow-md shadow-emerald-500/25 disabled:opacity-50 transition-all">
                              {actionLoading === a.id ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Complete</>}
                            </button>
                          </>
                        )}
                        {status !== 'cancelled' && status !== 'completed' && (
                          <button onClick={() => updateStatus(a.id, 'cancelled')} disabled={actionLoading === a.id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 disabled:opacity-50 transition-all">
                            {actionLoading === a.id ? <Loader2 size={14} className="animate-spin" /> : <><XCircle size={14} /> Cancel</>}
                          </button>
                        )}
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
  );
}
