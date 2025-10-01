import React from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

export default function FeedbackManagement() {
	const Star = ({ filled = false }) => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			className={filled ? 'lucide lucide-star w-4 h-4 text-yellow-400 fill-yellow-400' : 'lucide lucide-star w-4 h-4 text-gray-400'}
			fill={filled ? 'currentColor' : 'none'}
			stroke="currentColor"
			strokeWidth="1.5"
		>
			<path d="M12 17.27l-5.18 3.11 1.4-5.98L3 9.63l6.09-.52L12 3.5l2.91 5.61 6.09.52-5.22 4.77 1.4 5.98L12 17.27z"/>
		</svg>
	);

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
								<h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
								<p className="text-sm text-gray-500">View and analyze user feedback</p>
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
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="lucide lucide-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
							</svg>
							<input
								type="text"
								placeholder="Search feedback..."
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
							/>
						</div>
					</div>

					{/* Feedback Cards */}
					<div className="grid gap-4">
						{/* Feedback 1 */}
						<div className="border rounded-lg shadow-sm bg-white">
							<div className="p-4 border-b flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-3">
										<h2 className="text-lg font-semibold">John Doe</h2>
										<span className="px-2 py-1 text-xs font-medium rounded bg-gray-900 text-white">platform</span>
										<div className="flex items-center gap-1">
											<Star filled />
											<Star filled />
											<Star filled />
											<Star filled />
											<Star filled />
										</div>
									</div>
									<p className="mt-2 text-sm text-gray-500">2024-12-10</p>
								</div>
								<button className="p-2 rounded bg-red-600 text-white hover:bg-red-700" aria-label="Delete">
									{/* trash-2 */}
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4H9v3H4" />
									</svg>
								</button>
							</div>
							<div className="p-4 text-sm text-gray-600">Excellent platform, very helpful!</div>
						</div>

						{/* Feedback 2 */}
						<div className="border rounded-lg shadow-sm bg-white">
							<div className="p-4 border-b flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-3">
										<h2 className="text-lg font-semibold">Jane Smith</h2>
										<span className="px-2 py-1 text-xs font-medium rounded bg-gray-200 text-gray-800">lawyer</span>
										<div className="flex items-center gap-1">
											<Star filled />
											<Star filled />
											<Star filled />
											<Star filled />
											<Star filled={false} />
										</div>
									</div>
									<p className="mt-2 text-sm text-gray-500">For Adv. Kumar • 2024-12-09</p>
								</div>
								<button className="p-2 rounded bg-red-600 text-white hover:bg-red-700" aria-label="Delete">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4H9v3H4" />
									</svg>
								</button>
							</div>
							<div className="p-4 text-sm text-gray-600">Professional service</div>
						</div>

						{/* Feedback 3 */}
						<div className="border rounded-lg shadow-sm bg-white">
							<div className="p-4 border-b flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-3">
										<h2 className="text-lg font-semibold">Bob Johnson</h2>
										<span className="px-2 py-1 text-xs font-medium rounded bg-gray-900 text-white">platform</span>
										<div className="flex items-center gap-1">
											<Star filled />
											<Star filled />
											<Star filled />
											<Star filled={false} />
											<Star filled={false} />
										</div>
									</div>
									<p className="mt-2 text-sm text-gray-500">2024-12-08</p>
								</div>
								<button className="p-2 rounded bg-red-600 text-white hover:bg-red-700" aria-label="Delete">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4H9v3H4" />
									</svg>
								</button>
							</div>
							<div className="p-4 text-sm text-gray-600">Good but needs improvement</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
