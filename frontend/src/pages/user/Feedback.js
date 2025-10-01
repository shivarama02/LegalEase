import React from 'react';
import { Link } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';

export default function UserFeedback() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
			{/* User sidebar on the left */}
			<UserSidebar />
			<div className="flex-1">
				<div className="max-w-4xl mx-auto p-6">
					{/* Header */}
					<div className="flex items-center justify-between mb-8">
						<div className="flex items-center space-x-4">
							<Link to="/user/Dashboard" className="flex items-center px-4 py-2 border rounded-md text-sm">
								{/* ArrowLeft Icon */}
								<svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
								</svg>
								Back to Dashboard
							</Link>
							<div className="flex items-center space-x-2">
								{/* MessageSquare Icon */}
								<svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
								</svg>
								<h1 className="text-3xl font-bold text-gray-800">Feedback & Reviews</h1>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Main Form */}
						<div className="lg:col-span-2">
							<div className="bg-white shadow-lg rounded-lg overflow-hidden">
								<div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
									<h2 className="text-xl font-semibold">Share Your Experience</h2>
									<p className="text-white/90">Help us improve our services with your valuable feedback</p>
								</div>
								<div className="p-6">
									<form className="space-y-6">
										{/* Feedback Type */}
										<div>
											<label htmlFor="feedbackType" className="block text-sm font-medium text-gray-700">Type of Feedback *</label>
											<select id="feedbackType" className="mt-2 w-full border rounded-md p-2">
												<option>Select feedback type</option>
												<option>Lawyer Review</option>
												<option>Platform Feedback</option>
												<option>AI Assistant Feedback</option>
												<option>Bug Report</option>
												<option>Feature Request</option>
												<option>General Inquiry</option>
											</select>
										</div>

										{/* Rating */}
										<div>
											<label className="block text-sm font-medium text-gray-700">Overall Rating *</label>
											<div className="flex items-center space-x-2 mt-2">
												{/* Stars */}
												<svg className="h-6 w-6 text-yellow-400 fill-current cursor-pointer" viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"></path></svg>
												<svg className="h-6 w-6 text-yellow-400 fill-current cursor-pointer" viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"></path></svg>
												<svg className="h-6 w-6 text-yellow-400 fill-current cursor-pointer" viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"></path></svg>
												<svg className="h-6 w-6 text-gray-300 cursor-pointer" viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"></path></svg>
												<svg className="h-6 w-6 text-gray-300 cursor-pointer" viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"></path></svg>
												<span className="text-sm text-gray-500 ml-2">Click to rate</span>
											</div>
										</div>

										{/* Personal Info */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Name *</label>
												<input id="name" type="text" placeholder="Enter your full name" className="mt-2 w-full border rounded-md p-2" />
											</div>
											<div>
												<label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address *</label>
												<input id="email" type="email" placeholder="Enter your email" className="mt-2 w-full border rounded-md p-2" />
											</div>
										</div>

										{/* Subject */}
										<div>
											<label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
											<input id="subject" type="text" placeholder="Brief subject line for your feedback" className="mt-2 w-full border rounded-md p-2" />
										</div>

										{/* Message */}
										<div>
											<label htmlFor="message" className="block text-sm font-medium text-gray-700">Your Feedback *</label>
											<textarea id="message" rows="6" placeholder="Please share your detailed feedback..." className="mt-2 w-full border rounded-md p-2"></textarea>
										</div>

										<button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-md flex items-center justify-center">
											{/* Send Icon */}
											<svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 2L11 13"></path>
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 2L15 22l-4-9-9-4L22 2z"></path>
											</svg>
											Submit Feedback
										</button>
									</form>
								</div>
							</div>
						</div>

						{/* Sidebar */}
						<div className="lg:col-span-1 space-y-6">
							{/* Why Feedback Matters */}
							<div className="bg-white shadow-md rounded-lg p-6">
								<h3 className="text-lg font-semibold mb-3">Why Your Feedback Matters</h3>
								<ul className="space-y-3 text-sm">
									<li className="flex items-start space-x-2">
										<svg className="h-4 w-4 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 9l-1-1-4 4 1 1 4-4z"></path></svg>
										<p>Helps us improve our services and user experience</p>
									</li>
									<li className="flex items-start space-x-2">
										<svg className="h-4 w-4 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 9l-1-1-4 4 1 1 4-4z"></path></svg>
										<p>Assists other users in making informed decisions</p>
									</li>
								</ul>
							</div>

							{/* Feedback Guidelines */}
							<div className="bg-white shadow-md rounded-lg p-6">
								<h3 className="text-lg font-semibold mb-3">Feedback Guidelines</h3>
								<ul className="text-sm space-y-2">
									<li>• Be honest and constructive in your feedback</li>
									<li>• Provide specific details about your experience</li>
									<li>• Keep feedback professional and respectful</li>
									<li>• Include suggestions for improvement</li>
									<li>• We typically respond within 24-48 hours</li>
								</ul>
							</div>

							{/* Quick Actions */}
							<div className="bg-white shadow-md rounded-lg p-6">
								<h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
								<div className="space-y-2">
									<button className="w-full border rounded-md py-2 px-3 text-sm text-left">Find Lawyers to Review</button>
									<button className="w-full border rounded-md py-2 px-3 text-sm text-left">Give AI Assistant Feedback</button>
									<Link to="/user/Dashboard" className="w-full border rounded-md py-2 px-3 text-sm text-left inline-block">Back to Dashboard</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
