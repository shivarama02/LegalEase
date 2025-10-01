import React from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminSettings() {
	return (
		<div className="min-h-screen bg-gray-50 flex">
			<AdminSidebar />
			<div className="flex-1">
				<header className="border-b bg-white">
					<div className="container mx-auto px-4 py-4">
						<div className="flex items-center gap-4">
							<Link to="/admin-dashboard" className="p-2 rounded hover:bg-gray-100" aria-label="Back">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
								</svg>
							</Link>
							<div>
								<h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
								<p className="text-sm text-gray-500">Configure admin preferences</p>
							</div>
						</div>
					</div>
				</header>
				<main className="container mx-auto px-4 py-8">
					<div className="border rounded-lg bg-white p-6 text-gray-600">Settings content will go here.</div>
				</main>
			</div>
		</div>
	);
}
