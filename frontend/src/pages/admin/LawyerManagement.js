import React from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

export default function LawyerManagement() {
	return (
		<div className="min-h-screen bg-background flex">
			{/* Admin sidebar on the left */}
			<AdminSidebar />
			<div className="flex-1">
				{/* Header */}
				<header className="border-b bg-white">
					<div className="container mx-auto px-4 py-4">
						<div className="flex items-center gap-4">
							<Link to="/admin-dashboard">
								<button className="p-2 rounded-full hover:bg-gray-100" aria-label="Back">
									{/* Arrow Left */}
									<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
									</svg>
								</button>
							</Link>
							<div>
								<h1 className="text-2xl font-bold">Lawyer Management</h1>
								<p className="text-sm text-gray-500">Manage lawyer profiles and permissions</p>
							</div>
						</div>
					</div>
				</header>

				{/* Main Content */}
				<main className="container mx-auto px-4 py-8">
					{/* Search + Add Button */}
					<div className="flex flex-col md:flex-row gap-4 mb-6">
						<div className="flex-1 relative">
							{/* Search icon */}
							<svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
							</svg>
							<input
								type="text"
								placeholder="Search lawyers..."
								className="w-full pl-10 border border-gray-300 rounded-md py-2 focus:outline-none focus:ring focus:ring-indigo-200"
							/>
						</div>
						<button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
							{/* Plus icon */}
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
							</svg>
							Add Lawyer
						</button>
					</div>

					{/* Lawyer Cards */}
					<div className="grid gap-4">
						{/* Lawyer 1 */}
						<div className="border rounded-lg shadow-sm bg-white">
							<div className="p-4 border-b">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-3">
											<h2 className="font-semibold">Adv. Rajesh Kumar</h2>
											<span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded">active</span>
										</div>
										<p className="text-sm text-gray-500 mt-2">Criminal Law • Delhi • 15 years experience</p>
									</div>
									<div className="flex gap-2">
										<button className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200" aria-label="Deactivate">
											{/* x-circle */}
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
												<circle cx="12" cy="12" r="9" strokeWidth="2" />
												<path d="M15 9l-6 6m0-6l6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										</button>
										<button className="p-2 rounded-md border hover:bg-gray-100" aria-label="Edit">
											{/* edit (simple pen) */}
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
												<path d="M12 20h9" strokeWidth="2" strokeLinecap="round" />
												<path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										</button>
										<button className="p-2 rounded-md bg-red-600 text-white hover:bg-red-700" aria-label="Delete">
											{/* trash-2 */}
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4H9v3H4" />
											</svg>
										</button>
									</div>
								</div>
							</div>
							<div className="p-4">
								<div className="flex gap-6 text-sm">
									<div>
										<span className="text-gray-500">Total Cases:</span>
										<span className="ml-2 font-medium">234</span>
									</div>
								</div>
							</div>
						</div>

						{/* Lawyer 2 */}
						<div className="border rounded-lg shadow-sm bg-white">
							<div className="p-4 border-b">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-3">
											<h2 className="font-semibold">Adv. Priya Sharma</h2>
											<span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded">active</span>
										</div>
										<p className="text-sm text-gray-500 mt-2">Family Law • Mumbai • 10 years experience</p>
									</div>
									<div className="flex gap-2">
										<button className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200" aria-label="Deactivate">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
												<circle cx="12" cy="12" r="9" strokeWidth="2" />
												<path d="M15 9l-6 6m0-6l6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										</button>
										<button className="p-2 rounded-md border hover:bg-gray-100" aria-label="Edit">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
												<path d="M12 20h9" strokeWidth="2" strokeLinecap="round" />
												<path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										</button>
										<button className="p-2 rounded-md bg-red-600 text-white hover:bg-red-700" aria-label="Delete">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4H9v3H4" />
											</svg>
										</button>
									</div>
								</div>
							</div>
							<div className="p-4">
								<div className="flex gap-6 text-sm">
									<div>
										<span className="text-gray-500">Total Cases:</span>
										<span className="ml-2 font-medium">189</span>
									</div>
								</div>
							</div>
						</div>

						{/* Lawyer 3 */}
						<div className="border rounded-lg shadow-sm bg-white">
							<div className="p-4 border-b">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-3">
											<h2 className="font-semibold">Adv. Amit Patel</h2>
											<span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">inactive</span>
										</div>
										<p className="text-sm text-gray-500 mt-2">Corporate Law • Bangalore • 8 years experience</p>
									</div>
									<div className="flex gap-2">
										<button className="p-2 rounded-md bg-green-100 text-green-600 hover:bg-green-200" aria-label="Activate">
											{/* check-circle */}
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
												<circle cx="12" cy="12" r="9" strokeWidth="2" />
												<path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										</button>
										<button className="p-2 rounded-md border hover:bg-gray-100" aria-label="Edit">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
												<path d="M12 20h9" strokeWidth="2" strokeLinecap="round" />
												<path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										</button>
										<button className="p-2 rounded-md bg-red-600 text-white hover:bg-red-700" aria-label="Delete">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4H9v3H4" />
											</svg>
										</button>
									</div>
								</div>
							</div>
							<div className="p-4">
								<div className="flex gap-6 text-sm">
									<div>
										<span className="text-gray-500">Total Cases:</span>
										<span className="ml-2 font-medium">156</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
