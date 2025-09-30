import React from 'react';
import LawyerSidebar from '../../components/LawyerSidebar';
import { ArrowLeft } from 'lucide-react';

export default function Feedback() {
	return (
		<div className="min-h-screen bg-background">
			<div className="flex min-h-screen">
				{/* Sidebar */}
				<LawyerSidebar />

				{/* Main */}
				<div className="flex-1 p-6">
					<div className="max-w-4xl mx-auto">
						{/* Header */}
						<div className="flex items-center space-x-4 mb-6">
							<button className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Dashboard
							</button>
							<div>
								<h1 className="text-3xl font-bold">Client Feedback</h1>
								<p className="text-gray-500">Review feedback from your clients</p>
							</div>
						</div>

						{/* Reviews List */}
						<div className="space-y-4">
							{/* Review 1 */}
							<div className="border rounded-xl shadow-sm bg-white">
								<div className="p-6">
									<div className="flex items-start justify-between mb-4">
										<div className="flex items-center space-x-3">
											<div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
												{/* user avatar icon */}
												<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A10.97 10.97 0 0112 15c2.21 0 4.254.64 5.879 1.736M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
												</svg>
											</div>
											<div>
												<h4 className="font-medium">Sarah M.</h4>
												<div className="flex items-center space-x-1 mt-1">
													{/* 5 stars */}
													{Array.from({ length: 5 }).map((_, i) => (
														<svg key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
															<path d="M10 15l-5.878 3.09L5.82 12.18 1 8.09l6.09-.88L10 2l2.91 5.21 6.09.88-4.82 4.09 1.698 5.91z" />
														</svg>
													))}
												</div>
											</div>
										</div>
										<div className="text-right">
											<span className="px-2 py-1 text-sm border rounded-lg">DUI Defense</span>
											<p className="text-sm text-gray-500 mt-1">2024-01-10</p>
										</div>
									</div>
									<p className="text-gray-600 italic">"Excellent lawyer! Very professional and got great results for my case."</p>
								</div>
							</div>

							{/* Review 2 */}
							<div className="border rounded-xl shadow-sm bg-white">
								<div className="p-6">
									<div className="flex items-start justify-between mb-4">
										<div className="flex items-center space-x-3">
											<div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A10.97 10.97 0 0112 15c2.21 0 4.254.64 5.879 1.736M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
												</svg>
											</div>
											<div>
												<h4 className="font-medium">Michael R.</h4>
												<div className="flex items-center space-x-1 mt-1">
													{Array.from({ length: 5 }).map((_, i) => (
														<svg key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
															<path d="M10 15l-5.878 3.09L5.82 12.18 1 8.09l6.09-.88L10 2l2.91 5.21 6.09.88-4.82 4.09 1.698 5.91z" />
														</svg>
													))}
												</div>
											</div>
										</div>
										<div className="text-right">
											<span className="px-2 py-1 text-sm border rounded-lg">Criminal Defense</span>
											<p className="text-sm text-gray-500 mt-1">2024-01-05</p>
										</div>
									</div>
									<p className="text-gray-600 italic">"John was incredibly knowledgeable and supportive throughout my case."</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

