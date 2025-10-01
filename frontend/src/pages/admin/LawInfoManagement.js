import React from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

export default function LawInfoManagement() {
	return (
		<div className="min-h-screen bg-gray-50 flex">
			{/* Admin sidebar on the left */}
			<AdminSidebar />
			<div className="flex-1">
				{/* Header */}
				<header className="border-b bg-white shadow-sm">
					<div className="container mx-auto px-4 py-4">
						<div className="flex items-center gap-4">
							<Link to="/admin-dashboard">
								<button className="p-2 rounded hover:bg-gray-100" aria-label="Back">
									{/* Arrow Left */}
									<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
									</svg>
								</button>
							</Link>
							<div>
								<h1 className="text-2xl font-bold text-gray-900">Law Info Management</h1>
								<p className="text-sm text-gray-500">Add, edit, or remove legal information</p>
							</div>
						</div>
					</div>
				</header>

				{/* Main */}
				<main className="container mx-auto px-4 py-8">
					{/* Search + Add Law */}
					<div className="flex flex-col md:flex-row gap-4 mb-6">
						{/* Search */}
						<div className="flex-1 relative">
							<svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
							</svg>
							<input type="text" placeholder="Search laws..." className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
						</div>
						{/* Add Law Button */}
						<button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
							</svg>
							Add Law
						</button>
					</div>

					{/* Law Cards */}
					<div className="grid gap-4">
						{/* Law 1 */}
						<div className="border rounded-lg bg-white shadow-sm">
							<div className="p-4 flex items-start justify-between">
								<div className="flex-1">
									<h2 className="text-lg font-semibold text-gray-900">Indian Penal Code</h2>
									<p className="text-sm text-gray-500 mt-1">Criminal Law • 511 Articles</p>
								</div>
								<div className="flex gap-2">
									<button className="p-2 border rounded hover:bg-gray-100" aria-label="Edit">
										{/* Edit icon */}
										<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4h2m-1 0v16m-6-6h12" />
										</svg>
									</button>
									<button className="p-2 bg-red-600 text-white rounded hover:bg-red-700" aria-label="Delete">
										{/* Trash */}
										<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4H9v3H4" />
										</svg>
									</button>
								</div>
							</div>
							<div className="px-4 pb-4">
								<p className="text-gray-600">Main criminal code of India</p>
							</div>
						</div>

						{/* Law 2 */}
						<div className="border rounded-lg bg-white shadow-sm">
							<div className="p-4 flex items-start justify-between">
								<div className="flex-1">
									<h2 className="text-lg font-semibold text-gray-900">Consumer Protection Act</h2>
									<p className="text-sm text-gray-500 mt-1">Consumer Rights • 107 Articles</p>
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
							<div className="px-4 pb-4">
								<p className="text-gray-600">Protects consumer rights</p>
							</div>
						</div>

						{/* Law 3 */}
						<div className="border rounded-lg bg-white shadow-sm">
							<div className="p-4 flex items-start justify-between">
								<div className="flex-1">
									<h2 className="text-lg font-semibold text-gray-900">Information Technology Act</h2>
									<p className="text-sm text-gray-500 mt-1">Cyber Law • 94 Articles</p>
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
							<div className="px-4 pb-4">
								<p className="text-gray-600">Regulates digital activities</p>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
