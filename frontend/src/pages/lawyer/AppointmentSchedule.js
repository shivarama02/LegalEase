import React from 'react';
import LawyerSidebar from '../../components/LawyerSidebar';
import { ArrowLeft, Plus, Calendar, Clock, Check, User, Mail, Phone, MapPin, Edit } from 'lucide-react';

export default function AppointmentSchedule() {
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
								<button className="flex items-center text-gray-700 hover:text-black">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Back to Dashboard
								</button>
								<div>
									<h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
									<p className="text-gray-500">Manage your schedule and client meetings</p>
								</div>
							</div>
							<button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
								<Plus className="h-4 w-4 mr-2" />
								New Appointment
							</button>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
							{/* Calendar */}
							<div className="bg-white rounded-xl shadow p-4 lg:col-span-1">
								<h2 className="text-lg font-semibold mb-4">Calendar</h2>
								<div className="border rounded-md p-4 text-center text-gray-500">
									[Calendar Placeholder]
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
												<p className="text-2xl font-bold">2</p>
											</div>
											<Calendar className="h-8 w-8 text-blue-600" />
										</div>
									</div>
									<div className="bg-white rounded-xl shadow p-4">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm text-gray-500">Upcoming</p>
												<p className="text-2xl font-bold">3</p>
											</div>
											<Clock className="h-8 w-8 text-orange-600" />
										</div>
									</div>
									<div className="bg-white rounded-xl shadow p-4">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm text-gray-500">Completed</p>
												<p className="text-2xl font-bold">1</p>
											</div>
											<Check className="h-8 w-8 text-green-600" />
										</div>
									</div>
								</div>

								{/* Tabs */}
								<div>
									<div className="flex space-x-2 border-b mb-4">
										<button className="px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-semibold">Today (2)</button>
										<button className="px-4 py-2 text-gray-600 hover:text-black">Upcoming (3)</button>
										<button className="px-4 py-2 text-gray-600 hover:text-black">Completed (1)</button>
										<button className="px-4 py-2 text-gray-600 hover:text-black">All (6)</button>
									</div>

									{/* Appointment Card */}
									<div className="bg-white rounded-xl shadow mb-4">
										<div className="p-4 flex items-center justify-between">
											<h3 className="text-lg font-semibold flex items-center space-x-2">
												<User className="h-4 w-4" />
												<span>Sarah Wilson</span>
											</h3>
											<span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">SCHEDULED</span>
										</div>
										<div className="p-4 border-t space-y-3">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
												<div className="space-y-2">
													<div className="flex items-center space-x-2">
														<Mail className="h-4 w-4 text-gray-500" />
														<span>sarah.wilson@email.com</span>
													</div>
													<div className="flex items-center space-x-2">
														<Phone className="h-4 w-4 text-gray-500" />
														<span>+1 (555) 123-4567</span>
													</div>
													<div className="flex items-center space-x-2">
														<MapPin className="h-4 w-4 text-gray-500" />
														<span>Office</span>
													</div>
												</div>
												<div className="space-y-2">
													<div className="flex items-center space-x-2">
														<Calendar className="h-4 w-4 text-gray-500" />
														<span>2024-01-15</span>
													</div>
													<div className="flex items-center space-x-2">
														<Clock className="h-4 w-4 text-gray-500" />
														<span>10:00 (60min)</span>
													</div>
													<div className="flex items-center space-x-2">
														<User className="h-4 w-4 text-gray-500" />
														<span>Consultation</span>
													</div>
												</div>
											</div>

											<div>
												<h4 className="font-medium mb-2">Notes:</h4>
												<p className="text-sm text-gray-500 bg-gray-100 p-3 rounded-lg">
													Initial consultation for criminal defense case
												</p>
											</div>

											<div className="flex justify-end space-x-2">
												<button className="px-3 py-1 border rounded text-gray-700">Cancel</button>
												<button className="px-3 py-1 border rounded text-gray-700">Mark Complete</button>
												<button className="px-3 py-1 border rounded text-gray-700 flex items-center">
													<Edit className="h-4 w-4 mr-2" />
													Edit
												</button>
											</div>
										</div>
									</div>

								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

