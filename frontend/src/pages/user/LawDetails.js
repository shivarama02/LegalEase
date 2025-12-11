import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';

// Dynamic Law Details page – fetches a single LawDetail by id and renders it
export default function LawDetails() {
	const { id } = useParams(); // expects route /user/laws/:category/:id
	const [law, setLaw] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeTab, setActiveTab] = useState('full'); // 'full' | 'penalties' | 'related'

	const API_BASE = useMemo(() => process.env.REACT_APP_API || 'http://localhost:8000', []);

	useEffect(() => {
		let isMounted = true;
		async function fetchLaw() {
			setLoading(true);
			setError(null);
			try {
				const url = `${API_BASE}/api/lawdetails/${id}/`;
				const res = await fetch(url, { headers: { Accept: 'application/json' } });
				const contentType = res.headers.get('content-type') || '';
				if (!res.ok) {
					const text = await res.text();
					throw new Error(`Failed to fetch: ${res.status} ${res.statusText} - ${text.slice(0, 200)}`);
				}
				if (!contentType.includes('application/json')) {
					const text = await res.text();
					throw new Error(`Unexpected response type: ${contentType}. Body: ${text.slice(0, 200)}`);
				}
				const data = await res.json();
				if (isMounted) setLaw(data);
			} catch (e) {
				if (isMounted) setError(e.message || String(e));
			} finally {
				if (isMounted) setLoading(false);
			}
		}
		if (id) fetchLaw();
		return () => {
			isMounted = false;
		};
	}, [API_BASE, id]);

	const categoryMap = {
		consumer: 'Consumer Law',
		ipc: 'Criminal / IPC',
		labour: 'Employment Law',
		family: 'Family / Domestic',
		cyber: 'Cyber Crime',
		property: 'Property / Tenancy',
		corporate: 'Corporate / Company',
		civil: 'Civil Law',
	};

	function formatDate(iso) {
		try {
			return iso ? new Date(iso).toLocaleDateString() : '';
		} catch {
			return iso || '';
		}
	}

	return (
		<div className="min-h-screen bg-gradient-subtle flex">
			<UserSidebar />
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
								Back
							</button>
						</div>
						<div className="flex items-center space-x-2" />
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
												<h2 className="text-2xl">{law?.title || (loading ? 'Loading…' : 'Law not found')}</h2>
												<div className="flex items-center space-x-4 mt-2">
													{law?.category ? (
														<span className="bg-white/20 text-white px-2 py-1 rounded text-sm">{categoryMap[law.category] || law.category}</span>
													) : null}
													<div className="flex items-center space-x-1 text-sm">
														<svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
															<path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
														</svg>
														<span className="opacity-80">{law ? `Updated: ${formatDate(law.updated_at)}` : ''}</span>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="p-6">
									{error ? (
										<p className="text-sm text-red-600">{error}</p>
									) : (
										<>
											<p className="text-lg text-gray-600 mb-4">{law?.summary || (loading ? 'Loading details…' : 'No summary available.')}</p>
											<p className="text-sm text-gray-500">{law ? `Last updated: ${formatDate(law.updated_at)}` : ''}</p>
										</>
									)}
								</div>
							</div>

							{/* Tabs */}
							<div>
								<div className="grid grid-cols-3 border-b mb-4">
									<button onClick={() => setActiveTab('full')} className={`py-2 ${activeTab==='full' ? 'border-b-2 border-blue-500 font-medium' : ''}`}>Full Text</button>
									<button onClick={() => setActiveTab('penalties')} className={`py-2 ${activeTab==='penalties' ? 'border-b-2 border-blue-500 font-medium' : ''}`}>Penalties and Consequences</button>
									<button onClick={() => setActiveTab('related')} className={`py-2 ${activeTab==='related' ? 'border-b-2 border-blue-500 font-medium' : ''}`}>Related Sections</button>
								</div>

								{/* Panels */}
								{activeTab === 'full' && (
									<div className="shadow-md rounded-lg bg-white mb-6">
										<div className="px-6 py-3 border-b flex items-center space-x-2">
											<svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
												<path strokeLinecap="round" strokeLinejoin="round" d="M12 4h9M12 4v16M12 4H3v16h9z" />
											</svg>
											<span className="font-medium">Complete Legal Text</span>
										</div>
										<div className="p-4 border rounded h-[600px] overflow-auto font-mono text-sm whitespace-pre-wrap">
											{loading ? 'Loading…' : (law?.full_text || law?.summary || 'No content available for this law.')}
										</div>
									</div>
								)}

								{activeTab === 'penalties' && (
									<div className="shadow-md rounded-lg bg-white mb-6">
										<div className="px-6 py-3 border-b flex items-center space-x-2">
											<svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M7 8h10M5 4h14v16H5z" />
											</svg>
											<span className="font-medium">Penalties and Consequences</span>
										</div>
										<div className="p-4 border rounded whitespace-pre-wrap text-sm min-h-[200px]">
											{loading ? 'Loading…' : (law?.penalties || 'No penalties information provided for this law.')}
										</div>
									</div>
								)}

								{activeTab === 'related' && (
									<div className="shadow-md rounded-lg bg-white mb-6">
										<div className="px-6 py-3 border-b flex items-center space-x-2">
											<svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
											</svg>
											<span className="font-medium">Related Sections & Metadata</span>
										</div>
										<div className="p-4 border rounded text-sm space-y-3">
											{loading ? 'Loading…' : (
												<div className="space-y-3">
													{law?.statute_name ? (
														<p><span className="font-medium">Statute:</span> {law.statute_name}</p>
													) : null}
													{law?.section_reference ? (
														<p><span className="font-medium">Section Ref:</span> {law.section_reference}</p>
													) : null}
													{law?.related_sections ? (
														<div>
															<p className="font-medium mb-2">Related Sections</p>
															<div className="flex flex-wrap gap-2">
																{String(law.related_sections).split(',').map((s, i) => (
																	<span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs">{s.trim()}</span>
																))}
															</div>
														</div>
													) : <p className="text-gray-500">No related sections provided.</p>}
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

				</div>
			</div>
		</div>
	);
}

