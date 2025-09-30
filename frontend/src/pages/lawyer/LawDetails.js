import React from 'react';
import LawyerSidebar from '../../components/LawyerSidebar';

// Static replica of provided Law Details HTML (no dynamic logic yet)
export default function LawDetails() {
	return (
		<div className="min-h-screen bg-gradient-subtle flex">
			<LawyerSidebar />
			<div className="flex-1">
				<div className="max-w-7xl mx-auto p-6">
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center space-x-4">
							<button
								type="button"
								onClick={() => window.history.back()}
								className="border rounded px-3 py-2 flex items-center text-sm bg-white hover:bg-gray-50"
							>
								{/* ArrowLeft */}
								<svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
								</svg>
								Back to Laws
							</button>
						</div>
						<div className="flex items-center space-x-2">
							<button className="border rounded px-3 py-2 flex items-center text-sm bg-primary text-primary-foreground bg-white hover:bg-gray-50">
								<svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
								</svg>
								Bookmarked
							</button>
							<button className="border rounded px-3 py-2 flex items-center text-sm bg-white hover:bg-gray-50">
								<svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16h16V4H4zM4 4l16 16" />
								</svg>
								Share
							</button>
							<button className="px-3 py-2 rounded text-white bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center text-sm">
								<svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
									<path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5 5-5" />
								</svg>
								Ask About This Law
							</button>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
						{/* Main Content */}
						<div className="lg:col-span-3">
							<div className="shadow-lg rounded-lg bg-white mb-6 overflow-hidden">
								<div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-3">
											<svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A2 2 0 013 15.382V6.618a2 2 0 011.553-1.894L9 2l6 3 5-1" />
											</svg>
											<div>
												<h2 className="text-2xl">Consumer Protection Act 2023</h2>
												<div className="flex items-center space-x-4 mt-2">
													<span className="bg-white/20 text-white px-2 py-1 rounded text-sm">Consumer Law</span>
													<div className="flex items-center space-x-1 text-sm">
														<svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
															<path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
														</svg>
														<span>1,420 views</span>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="p-6">
									<p className="text-lg text-gray-600 mb-4">
										Comprehensive legislation protecting consumer rights and establishing fair trade practices.
									</p>
									<p className="text-sm text-gray-500">Last updated: 10/15/2023</p>
								</div>
							</div>

							{/* Tabs */}
							<div>
								<div className="grid grid-cols-4 border-b mb-4">
									<button className="py-2 border-b-2 border-blue-500">Full Text</button>
									<button className="py-2">Summary</button>
									<button className="py-2">Penalties</button>
									<button className="py-2">Related Laws</button>
								</div>

								{/* Full Text */}
								<div className="shadow-md rounded-lg bg-white mb-6">
									<div className="px-6 py-3 border-b flex items-center space-x-2">
										<svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
											<path strokeLinecap="round" strokeLinejoin="round" d="M12 4h9M12 4v16M12 4H3v16h9z" />
										</svg>
										<span className="font-medium">Complete Legal Text</span>
									</div>
									<div className="p-4 border rounded h-[600px] overflow-auto font-mono text-sm whitespace-pre-wrap">
{`CONSUMER PROTECTION ACT 2023

PART I - PRELIMINARY

1. Short title and commencement
(1) This Act may be cited as the Consumer Protection Act 2023.
(2) This Act shall come into operation on such date as the Minister may, by notification in the Gazette, appoint.

2. Interpretation
In this Act, unless the context otherwise requires—
"consumer" means any person who—
(a) purchases any goods for a consideration which has been paid or promised or partly paid and partly promised, or under any system of deferred payment;
(b) uses such goods with the approval of the person who purchases such goods for consideration paid or promised or partly paid and partly promised, or under any system of deferred payment, when such use is made with the knowledge or approval of the purchaser;

3. Application
This Act applies to all goods and services unless specifically exempted.

PART II - CONSUMER RIGHTS

4. Right to Safety
Every consumer has the right to be protected against goods and services which are hazardous to life and property.

5. Right to Information
Every consumer has the right to be informed about the quality, quantity, potency, purity, standard and price of goods or services.

6. Right to Choice
Every consumer has the right to be assured access to a variety of goods and services at competitive prices.

7. Right to be Heard
Every consumer has the right to be assured that consumer interests will receive due consideration at appropriate forums.

8. Right to Redress
Every consumer has the right to seek redressal against unfair trade practices or exploitation of consumers.

PART III - UNFAIR TRADE PRACTICES

9. Prohibition of unfair trade practices
No person shall engage in any unfair trade practice.

10. Definition of unfair trade practice
"Unfair trade practice" means a trade practice which, for the purpose of promoting the sale, use or supply of any goods or for the provision of any service, adopts any unfair method or unfair or deceptive practice.

PART IV - CONSUMER DISPUTES REDRESSAL

11. Establishment of Consumer Forums
Consumer Forums shall be established at District, State, and National levels for the redressal of consumer disputes.

12. Jurisdiction
The jurisdiction of Consumer Forums shall be determined by the value of goods or services and the geographical area.`}
									</div>
								</div>

								{/* Summary */}
								<div className="shadow-md rounded-lg bg-white mb-6">
									<div className="px-6 py-3 border-b">
										<h3 className="font-medium">Key Points</h3>
									</div>
									<div className="p-4 space-y-3">
										{[
											'Protects consumer rights across all transactions',
											'Establishes three-tier dispute resolution system',
											'Defines unfair trade practices clearly',
											'Provides for compensation and penalties',
											'Covers both goods and services'
										].map((text, i) => (
											<div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-100">
												<div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">{i + 1}</div>
												<p>{text}</p>
											</div>
										))}
									</div>
								</div>

								{/* Penalties */}
								<div className="shadow-md rounded-lg bg-white mb-6">
									<div className="px-6 py-3 border-b">
										<h3 className="font-medium">Penalties and Consequences</h3>
									</div>
									<div className="p-4 space-y-3">
										{[
											'Fine up to ₹10,00,000 for unfair trade practices',
											'Imprisonment up to 2 years for repeat offenses',
											'Compensation to affected consumers',
											'Recall of defective products'
										].map(p => (
											<div key={p} className="p-4 rounded-lg border-l-4 border-red-500 bg-red-50">{p}</div>
										))}
									</div>
								</div>

								{/* Related Laws */}
								<div className="shadow-md rounded-lg bg-white mb-6">
									<div className="px-6 py-3 border-b">
										<h3 className="font-medium">Related Laws</h3>
									</div>
									<div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
										{[
											'Sale of Goods Act 1930',
											'Contract Act 1872',
											'Trade Marks Act 1999',
											'Competition Act 2002'
										].map(law => (
											<div key={law} className="p-4 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 cursor-pointer hover:shadow-lg transition-all">
												<div className="flex items-center space-x-3">
													<svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
													</svg>
													<span>{law}</span>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Sidebar */}
						<div className="lg:col-span-1 space-y-6">
							<div className="shadow-md rounded-lg bg-white">
								<div className="px-4 py-3 border-b">
									<h3 className="text-lg font-medium">Quick Actions</h3>
								</div>
								<div className="p-4 space-y-2">
									{[
										'Generate Complaint',
										'Find Lawyer',
										'Ask AI Assistant'
									].map(action => (
										<button key={action} className="border rounded px-3 py-2 w-full text-left flex items-center bg-white hover:bg-gray-50">
											<svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
											</svg>
											{action}
										</button>
									))}
								</div>
							</div>

							<div className="shadow-md rounded-lg bg-white">
								<div className="px-4 py-3 border-b">
									<h3 className="text-lg font-medium">Law Information</h3>
								</div>
								<div className="p-4 space-y-4">
									<div>
										<label className="text-sm font-medium text-gray-500">Category</label>
										<p className="text-sm">Consumer Law</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-500">Last Updated</label>
										<p className="text-sm">10/15/2023</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-500">Views</label>
										<p className="text-sm">1,420</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

