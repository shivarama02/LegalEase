import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';

export default function UserFeedback() {
	const [rating, setRating] = useState(0);
	const [hover, setHover] = useState(0);
	const [form, setForm] = useState({
		feedback_type: '',
		name: '',
		email: '',
		subject: '',
		message: '',
	});

	// Optional lawyer context via URL, e.g., /user/feedback?lawyerId=3
	const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
	const lawyerId = search ? search.get('lawyerId') : null;

	const token = localStorage.getItem('token');

	const onChange = (e) => {
		const { id, value } = e.target;
		setForm((prev) => ({ ...prev, [id]: value }));
	};

	const submit = async (e) => {
		e.preventDefault();
		if (!rating) {
			alert('Please select a rating');
			return;
		}
		if (!form.feedback_type) {
			alert('Please select feedback type');
			return;
		}
		try {
			const res = await fetch('/api/feedbacks/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(token ? { Authorization: `Token ${token}` } : {}),
				},
				body: JSON.stringify({
					feedback_type: mapType(form.feedback_type),
					rating,
					name: form.name,
					email: form.email,
					subject: form.subject,
					message: form.message,
					// attach lawyer when available and when reviewing a lawyer
					...(lawyerId && mapType(form.feedback_type) === 'lawyer_review' ? { lawyer: parseInt(lawyerId, 10) } : {}),
				}),
			});
			if (!res.ok) {
				let detail = 'Failed to submit feedback';
				try {
					const text = await res.text();
					try {
						const j = JSON.parse(text);
						detail = j.detail || JSON.stringify(j);
					} catch (e) {
						detail = text || detail;
					}
				} catch (_) {}
				throw new Error(`${detail} (HTTP ${res.status})`);
			}
			// reset form
			setRating(0);
			setHover(0);
			setForm({ feedback_type: '', name: '', email: '', subject: '', message: '' });
			alert('Thank you! Your feedback has been submitted.');
		} catch (err) {
			alert(err.message);
		}
	};

	const mapType = (label) => {
		switch (label) {
			case 'Lawyer Review':
				return 'lawyer_review';
			case 'Platform Feedback':
				return 'platform';
			case 'AI Assistant Feedback':
				return 'assistant';
			case 'Bug Report':
				return 'bug';
			case 'Feature Request':
				return 'feature';
			case 'General Inquiry':
				return 'general';
			default:
				return '';
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
			{/* User sidebar on the left */}
			<UserSidebar />
			<div className="flex-1">
				<div className="max-w-4xl mx-auto p-2">
					{/* Header */}
					<div className="flex items-center justify-between mb-8">
						<div className="flex items-center space-x-4">
							{/* <Link to="/user/Dashboard" className="flex items-center px-4 py-2 border rounded-md text-sm">
								
								<svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
								</svg>
								Back to Dashboard
							</Link> */}
							<div className="flex items-center space-x-2">
								{/* MessageSquare Icon */}
								<svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
								</svg>
								<h1 className="text-3xl font-bold text-gray-800">Feedback & Reviews</h1>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-1 gap-2">
						{/* Main Form */}
						<div className="lg:col-span-2">
							<div className="bg-white shadow-lg rounded-lg overflow-hidden">
								<div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
									<h2 className="text-xl font-semibold">Share Your Experience</h2>
									<p className="text-white/90">Help us improve our services with your valuable feedback</p>
								</div>
								<div className="p-6">
									<form className="space-y-6" onSubmit={submit}>
										{/* Feedback Type */}
										<div>
											<label htmlFor="feedback_type" className="block text-sm font-medium text-gray-700">Type of Feedback *</label>
											<select id="feedback_type" value={form.feedback_type} onChange={(e)=>setForm(prev=>({...prev, feedback_type: e.target.value}))} className="mt-2 w-full border rounded-md p-2">
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
												{[1,2,3,4,5].map((star) => {
													const active = (hover || rating) >= star;
													return (
														<svg
															key={star}
															onMouseEnter={() => setHover(star)}
															onMouseLeave={() => setHover(0)}
															onClick={() => setRating(star)}
															className={`h-6 w-6 ${active ? 'text-yellow-400' : 'text-gray-300'} fill-current cursor-pointer`}
															viewBox="0 0 24 24"
															aria-label={`${star} star`}
															role="button"
														>
															<path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"></path>
														</svg>
													);
												})}
											</div>
										</div>

										{/* Personal Info */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Name *</label>
												<input id="name" value={form.name} onChange={onChange} type="text" placeholder="Enter your full name" className="mt-2 w-full border rounded-md p-2" />
											</div>
											<div>
												<label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address *</label>
												<input id="email" value={form.email} onChange={onChange} type="email" placeholder="Enter your email" className="mt-2 w-full border rounded-md p-2" />
											</div>
										</div>

										{/* Subject */}
										<div>
											<label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
											<input id="subject" value={form.subject} onChange={onChange} type="text" placeholder="Brief subject line for your feedback" className="mt-2 w-full border rounded-md p-2" />
										</div>

										{/* Message */}
										<div>
											<label htmlFor="message" className="block text-sm font-medium text-gray-700">Your Feedback *</label>
											<textarea id="message" value={form.message} onChange={onChange} rows="6" placeholder="Please share your detailed feedback..." className="mt-2 w-full border rounded-md p-2"></textarea>
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

						
					</div>
				</div>
			</div>
		</div>
	);
}
