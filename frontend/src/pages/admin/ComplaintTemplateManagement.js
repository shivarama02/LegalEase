import React from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

export default function ComplaintTemplateManagement() {
	return (
		<div className="min-h-screen bg-gray-50 flex">
			{/* Admin sidebar on the left */}
			<AdminSidebar />
			<div className="flex-1">
				{/* Header */}
				<header className="border-b bg-white shadow-sm">
					<div className="container mx-auto px-4 py-4">
						<div className="flex items-center gap-4">
							<Link to="/admin/Dashboard">
								<button className="p-2 rounded hover:bg-gray-100" aria-label="Back">
									{/* Back Icon */}
									<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
									</svg>
								</button>
							</Link>
							<div>
								<h1 className="text-2xl font-bold text-gray-900">Complaint Template Management</h1>
								<p className="text-sm text-gray-500">Create and update complaint templates</p>
							</div>
						</div>
					</div>
				</header>

				{/* Main Content */}
				<main className="container mx-auto px-4 py-8">
					{/* Search & Create */}
					<div className="flex flex-col md:flex-row gap-4 mb-6">
						<div className="flex-1 relative">
							{/* Search Icon */}
							<svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
							</svg>
							<input
								type="text"
								placeholder="Search templates..."
								className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
							{/* Plus Icon */}
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
							</svg>
							Create Template
						</button>
					</div>

					{/* Templates List */}
					<div className="grid gap-4">
						{/* Template Card 1 */}
						<div className="border rounded-lg bg-white shadow-sm">
							<div className="p-4 flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-3">
										<h2 className="text-lg font-semibold text-gray-900">Consumer Complaint</h2>
										<span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">Consumer Rights</span>
									</div>
									<p className="text-sm text-gray-500 mt-2">8 fields • Used 145 times</p>
								</div>
								<div className="flex gap-2">
									<button className="p-2 border rounded hover:bg-gray-100" aria-label="Edit">
										{/* Edit Icon (generic +) */}
										<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4h2m-1 0v16m-6-6h12" />
										</svg>
									</button>
									<button className="p-2 bg-red-600 text-white rounded hover:bg-red-700" aria-label="Delete">
										{/* Trash Icon */}
										<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4H9v3H4" />
										</svg>
									</button>
								</div>
							</div>
						</div>

						{/* Template Card 2 */}
						<div className="border rounded-lg bg-white shadow-sm">
							<div className="p-4 flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-3">
										<h2 className="text-lg font-semibold text-gray-900">Cyber Crime Report</h2>
										<span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">Cyber Law</span>
									</div>
									<p className="text-sm text-gray-500 mt-2">12 fields • Used 89 times</p>
								</div>
								<div className="flex gap-2">
									<button className="p-2 border rounded hover:bg-gray-100" aria-label="Edit">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4h2m-1 0v16m-6-6h12" />
										</svg>
									</button>
									<button className="p-2 bg-red-600 text-white rounded hover:bg-red-700" aria-label="Delete">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4H9v3H4" />
										</svg>
									</button>
								</div>
							</div>
						</div>

						{/* Template Card 3 */}
						<div className="border rounded-lg bg-white shadow-sm">
							<div className="p-4 flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-3">
										<h2 className="text-lg font-semibold text-gray-900">Property Dispute</h2>
										<span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">Property Law</span>
									</div>
									<p className="text-sm text-gray-500 mt-2">10 fields • Used 67 times</p>
								</div>
								<div className="flex gap-2">
									<button className="p-2 border rounded hover:bg-gray-100" aria-label="Edit">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4h2m-1 0v16m-6-6h12" />
										</svg>
									</button>
									<button className="p-2 bg-red-600 text-white rounded hover:bg-red-700" aria-label="Delete">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4H9v3H4" />
										</svg>
									</button>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
