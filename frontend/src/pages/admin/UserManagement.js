import React from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

export default function UserManagement() {
	return (
		<div className="min-h-screen bg-background flex">
			{/* Admin sidebar on the left */}
			<AdminSidebar />
			<div className="flex-1">
				{/* Header */}
				<header className="border-b bg-white">
					<div className="container mx-auto px-4 py-4">
						<div className="flex items-center gap-4">
							<Link to="/admin-dashboard" className="p-2 rounded hover:bg-gray-100" aria-label="Back">
								{/* Arrow Left */}
								<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
								</svg>
							</Link>
							<div>
								<h1 className="text-2xl font-bold text-gray-900">User Management</h1>
								<p className="text-sm text-gray-500">Manage user accounts and permissions</p>
							</div>
						</div>
					</div>
				</header>

				{/* Main */}
				<main className="container mx-auto px-4 py-8">
					{/* Search */}
					<div className="flex flex-col md:flex-row gap-4 mb-6">
						<div className="flex-1 relative">
							{/* Search icon */}
							<svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
							</svg>
							<input
								type="text"
								placeholder="Search users..."
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
							/>
						</div>
					</div>

					{/* User Cards */}
					<div className="grid gap-4">
						{/* User Card 1 */}
						<div className="border rounded-lg shadow-sm bg-white">
							<div className="p-4 border-b flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-3">
										<h2 className="text-lg font-semibold">John Doe</h2>
										<span className="px-2 py-1 text-xs font-medium rounded bg-gray-900 text-white">active</span>
										<span className="px-2 py-1 text-xs font-medium rounded border border-gray-300 text-gray-700">user</span>
									</div>
									<p className="mt-2 text-sm text-gray-500">john@example.com • Joined 2024-01-15</p>
								</div>
								<div className="flex gap-2">
									<button className="p-2 rounded bg-red-600 text-white hover:bg-red-700" aria-label="Block">
										{/* ban */}
										<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<circle cx="12" cy="12" r="9" strokeWidth="2" />
											<path d="M5 5l14 14" strokeWidth="2" strokeLinecap="round" />
										</svg>
									</button>
									<button className="p-2 rounded border border-gray-300 hover:bg-gray-100" aria-label="Edit">
										{/* edit */}
										<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path d="M12 20h9" strokeWidth="2" strokeLinecap="round" />
											<path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									</button>
									<button className="p-2 rounded bg-red-600 text-white hover:bg-red-700" aria-label="Delete">
										{/* trash-2 */}
										<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4H9v3H4" />
										</svg>
									</button>
								</div>
							</div>
							<div className="p-4 text-sm">
								<span className="text-gray-500">Complaints Filed:</span>
								<span className="ml-2 font-medium">5</span>
							</div>
						</div>

						{/* User Card 2 */}
						<div className="border rounded-lg shadow-sm bg-white">
							<div className="p-4 border-b flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-3">
										<h2 className="text-lg font-semibold">Jane Smith</h2>
										<span className="px-2 py-1 text-xs font-medium rounded bg-gray-900 text-white">active</span>
										<span className="px-2 py-1 text-xs font-medium rounded border border-gray-300 text-gray-700">user</span>
									</div>
									<p className="mt-2 text-sm text-gray-500">jane@example.com • Joined 2024-02-20</p>
								</div>
								<div className="flex gap-2">
									<button className="p-2 rounded bg-red-600 text-white hover:bg-red-700" aria-label="Block">
										<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<circle cx="12" cy="12" r="9" strokeWidth="2" />
											<path d="M5 5l14 14" strokeWidth="2" strokeLinecap="round" />
										</svg>
									</button>
									<button className="p-2 rounded border border-gray-300 hover:bg-gray-100" aria-label="Edit">
										<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path d="M12 20h9" strokeWidth="2" strokeLinecap="round" />
											<path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									</button>
									<button className="p-2 rounded bg-red-600 text-white hover:bg-red-700" aria-label="Delete">
										<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4H9v3H4" />
										</svg>
									</button>
								</div>
							</div>
							<div className="p-4 text-sm">
								<span className="text-gray-500">Complaints Filed:</span>
								<span className="ml-2 font-medium">3</span>
							</div>
						</div>

						{/* User Card 3 */}
						<div className="border rounded-lg shadow-sm bg-white">
							<div className="p-4 border-b flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-3">
										<h2 className="text-lg font-semibold">Bob Johnson</h2>
										<span className="px-2 py-1 text-xs font-medium rounded bg-red-600 text-white">blocked</span>
										<span className="px-2 py-1 text-xs font-medium rounded border border-gray-300 text-gray-700">user</span>
									</div>
									<p className="mt-2 text-sm text-gray-500">bob@example.com • Joined 2024-03-10</p>
								</div>
								<div className="flex gap-2">
									<button className="p-2 rounded bg-gray-900 text-white hover:bg-gray-800" aria-label="Unblock">
										{/* check-circle */}
										<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<circle cx="12" cy="12" r="9" strokeWidth="2" />
											<path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									</button>
									<button className="p-2 rounded border border-gray-300 hover:bg-gray-100" aria-label="Edit">
										<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path d="M12 20h9" strokeWidth="2" strokeLinecap="round" />
											<path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									</button>
									<button className="p-2 rounded bg-red-600 text-white hover:bg-red-700" aria-label="Delete">
										<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4H9v3H4" />
										</svg>
									</button>
								</div>
							</div>
							<div className="p-4 text-sm">
								<span className="text-gray-500">Complaints Filed:</span>
								<span className="ml-2 font-medium">0</span>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
