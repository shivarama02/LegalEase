import React from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

export default function Reports() {
	return (
		<div className="min-h-screen bg-gray-50 flex">
			{/* Admin sidebar on the left */}
			<AdminSidebar />
			<div className="flex-1">
				{/* Header */}
				<header className="border-b bg-white">
					<div className="container mx-auto px-4 py-4">
						<div className="flex items-center gap-4">
							<Link to="/admin-dashboard" className="p-2 rounded hover:bg-gray-100" aria-label="Back">
								{/* Arrow Left */}
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
								</svg>
							</Link>
							<div>
								<h1 className="text-2xl font-bold text-gray-900">Reports</h1>
								<p className="text-sm text-gray-500">Generate system usage and activity reports</p>
							</div>
						</div>
					</div>
				</header>

				{/* Main */}
				<main className="container mx-auto px-4 py-8">
					{/* Reports Grid */}
					<div className="grid md:grid-cols-2 gap-6">
						{/* Report 1 */}
						<div className="border rounded-lg shadow-sm bg-white">
							<div className="p-4 border-b">
								<div className="flex items-start gap-3">
									<div className="p-2 bg-blue-100 rounded-lg">
										{/* users icon */}
										<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
											<circle cx="9" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
											<path d="M23 21v-2a4 4 0 00-3-3.87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
											<path d="M16 3.13a4 4 0 010 7.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									</div>
									<div>
										<h2 className="text-lg font-semibold">User Registration Report</h2>
										<p className="text-sm text-gray-500 mt-1">Monthly user growth analytics</p>
									</div>
								</div>
							</div>
							<div className="p-4 flex items-center justify-between">
								<div className="text-sm text-gray-500">
									Total Records: <span className="font-medium text-gray-900">1234</span>
								</div>
								<button className="px-3 py-1 border rounded-md text-sm flex items-center gap-2 hover:bg-gray-100">
									{/* download icon */}
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
										<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										<path d="M7 10l5 5 5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										<path d="M12 15V3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
									Export
								</button>
							</div>
						</div>

						{/* Report 2 */}
						<div className="border rounded-lg shadow-sm bg-white">
							<div className="p-4 border-b">
								<div className="flex items-start gap-3">
									<div className="p-2 bg-blue-100 rounded-lg">
										{/* scale icon */}
										<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path d="M12 3v18" strokeWidth="2" strokeLinecap="round" />
											<path d="M3 7h18" strokeWidth="2" strokeLinecap="round" />
											<path d="M6 7l-3 6h6l-3-6z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
											<path d="M18 7l-3 6h6l-3-6z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									</div>
									<div>
										<h2 className="text-lg font-semibold">Lawyer Activity Report</h2>
										<p className="text-sm text-gray-500 mt-1">Lawyer engagement and case statistics</p>
									</div>
								</div>
							</div>
							<div className="p-4 flex items-center justify-between">
								<div className="text-sm text-gray-500">
									Total Records: <span className="font-medium text-gray-900">89</span>
								</div>
								<button className="px-3 py-1 border rounded-md text-sm flex items-center gap-2 hover:bg-gray-100">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
										<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										<path d="M7 10l5 5 5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										<path d="M12 15V3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
									Export
								</button>
							</div>
						</div>

						{/* Report 3 */}
						<div className="border rounded-lg shadow-sm bg-white">
							<div className="p-4 border-b">
								<div className="flex items-start gap-3">
									<div className="p-2 bg-blue-100 rounded-lg">
										{/* file-text icon */}
										<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
											<path d="M14 2v6h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
											<path d="M16 13H8" strokeWidth="2" strokeLinecap="round" />
											<path d="M16 17H8" strokeWidth="2" strokeLinecap="round" />
										</svg>
									</div>
									<div>
										<h2 className="text-lg font-semibold">Complaint Statistics</h2>
										<p className="text-sm text-gray-500 mt-1">Complaint filing trends and resolution</p>
									</div>
								</div>
							</div>
							<div className="p-4 flex items-center justify-between">
								<div className="text-sm text-gray-500">
									Total Records: <span className="font-medium text-gray-900">342</span>
								</div>
								<button className="px-3 py-1 border rounded-md text-sm flex items-center gap-2 hover:bg-gray-100">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
										<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										<path d="M7 10l5 5 5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										<path d="M12 15V3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
									Export
								</button>
							</div>
						</div>

						{/* Report 4 */}
						<div className="border rounded-lg shadow-sm bg-white">
							<div className="p-4 border-b">
								<div className="flex items-start gap-3">
									<div className="p-2 bg-blue-100 rounded-lg">
										{/* trending-up icon */}
										<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path d="M23 7l-7 7-4-4-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
											<path d="M17 7h6v6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									</div>
									<div>
										<h2 className="text-lg font-semibold">System Usage Report</h2>
										<p className="text-sm text-gray-500 mt-1">Overall platform usage metrics</p>
									</div>
								</div>
							</div>
							<div className="p-4 flex items-center justify-between">
								<div className="text-sm text-gray-500">
									Total Records: <span className="font-medium text-gray-900">5678</span>
								</div>
								<button className="px-3 py-1 border rounded-md text-sm flex items-center gap-2 hover:bg-gray-100">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
										<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										<path d="M7 10l5 5 5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										<path d="M12 15V3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
									Export
								</button>
							</div>
						</div>
					</div>

					{/* Quick Statistics */}
					<div className="border rounded-lg shadow-sm bg-white mt-6">
						<div className="p-4 border-b">
							<h2 className="font-semibold">Quick Statistics</h2>
							<p className="text-sm text-gray-500">Overview of system performance</p>
						</div>
						<div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="p-4 border rounded-lg">
								<p className="text-sm text-gray-500">Total Users</p>
								<p className="text-2xl font-bold text-gray-900 mt-1">1,234</p>
								<p className="text-xs text-green-600 mt-1">+12% this month</p>
							</div>
							<div className="p-4 border rounded-lg">
								<p className="text-sm text-gray-500">Active Lawyers</p>
								<p className="text-2xl font-bold text-gray-900 mt-1">89</p>
								<p className="text-xs text-green-600 mt-1">+5% this month</p>
							</div>
							<div className="p-4 border rounded-lg">
								<p className="text-sm text-gray-500">Total Complaints</p>
								<p className="text-2xl font-bold text-gray-900 mt-1">342</p>
								<p className="text-xs text-green-600 mt-1">+15% this month</p>
							</div>
							<div className="p-4 border rounded-lg">
								<p className="text-sm text-gray-500">Laws Database</p>
								<p className="text-2xl font-bold text-gray-900 mt-1">456</p>
								<p className="text-xs text-green-600 mt-1">+8% this month</p>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
