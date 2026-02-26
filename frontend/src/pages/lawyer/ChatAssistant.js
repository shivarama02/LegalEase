import React, { useState, useRef, useEffect } from 'react';
import LawyerSidebar from '../../components/LawyerSidebar';
import { ArrowLeft, Timer, Send, MessageSquare, FileText, Users, Scale } from 'lucide-react';

// Static replica of provided chat assistant HTML layout (no dynamic chat logic yet)
export default function ChatAssistant() {
	const [messages, setMessages] = useState([
		{
			id: 'welcome',
			role: 'assistant',
			text: "Hello! I'm your AI Legal Assistant. I can help you with legal questions, guide you through legal processes, and provide information about laws and regulations. How can I assist you today?",
			ts: new Date()
		}
	]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);
	const scrollRef = useRef(null);

	const suggested = [
		'What are my rights as a tenant?',
		'How do I file a complaint against a business?',
		'What documents do I need for divorce?',
		'How to handle workplace discrimination?',
		'What are consumer protection laws?',
		'How to register a trademark?'
	];

	// Base should point to API root (with /api). Allow override via env.
	const API_BASE = (process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000/api').replace(/\/$/, '');

	useEffect(() => {
		// auto scroll on new messages
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages, loading]);

	function formatTime(d) {
		try { return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
	}

	function addMessage(msg) {
		setMessages(prev => [...prev, msg]);
	}

	async function sendQuery(queryText) {
		const trimmed = queryText.trim();
		if (!trimmed || loading) return;
		setInput('');
		const userMsg = { id: Date.now() + '-u', role: 'user', text: trimmed, ts: new Date() };
		addMessage(userMsg);
		setLoading(true);
		let placeholderId = Date.now() + '-a';
		addMessage({ id: placeholderId, role: 'assistant', text: '...', ts: new Date(), pending: true });
		try {
			const endpoint = `${API_BASE}/chat/ai/`;
			const res = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ query: trimmed })
			});
				const contentType = res.headers.get('content-type') || '';
				if (!contentType.includes('application/json')) {
					const text = await res.text();
					throw new Error(`Unexpected response (${res.status}) - not JSON. Snippet: ${text.slice(0,100)}`);
				}
				const data = await res.json();
				setMessages(prev => prev.map(m => m.id === placeholderId ? { ...m, text: data.response || data.error || 'No response', pending: false } : m));
		} catch (e) {
				setMessages(prev => prev.map(m => m.id === placeholderId ? { ...m, text: 'I encountered an issue connecting to the AI service. Please try again in a moment.', pending: false, error: true } : m));
		} finally {
			setLoading(false);
		}
	}

	function handleSubmit(e) {
		e.preventDefault();
		sendQuery(input);
	}

	function parseBold(text) {
		const parts = text.split(/\*\*(.*?)\*\*/g);
		return parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part);
	}

	function renderResponse(text, isPending, isError) {
		if (isPending) return <p className="text-sm text-gray-500 italic">Thinking...</p>;
		const lines = (text || '').split('\n');
		const elements = [];
		let bulletBuffer = [];
		let numberedBuffer = [];
		const flushBullets = () => {
			if (bulletBuffer.length) {
				elements.push(<ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-0.5 my-1">{bulletBuffer}</ul>);
				bulletBuffer = [];
			}
		};
		const flushNumbered = () => {
			if (numberedBuffer.length) {
				elements.push(<ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-0.5 my-1">{numberedBuffer}</ol>);
				numberedBuffer = [];
			}
		};
		lines.forEach((line, i) => {
			if (line.startsWith('### ')) {
				flushBullets(); flushNumbered();
				elements.push(<p key={i} className="font-semibold text-sm mt-2 mb-0.5">{parseBold(line.slice(4))}</p>);
			} else if (line.startsWith('## ')) {
				flushBullets(); flushNumbered();
				elements.push(<p key={i} className="font-bold text-sm mt-2 mb-0.5">{parseBold(line.slice(3))}</p>);
			} else if (line.startsWith('# ')) {
				flushBullets(); flushNumbered();
				elements.push(<p key={i} className="font-bold text-base mt-2 mb-1">{parseBold(line.slice(2))}</p>);
			} else if (/^[-*] /.test(line)) {
				flushNumbered();
				bulletBuffer.push(<li key={i} className="text-sm">{parseBold(line.slice(2))}</li>);
			} else if (/^\d+\. /.test(line)) {
				flushBullets();
				numberedBuffer.push(<li key={i} className="text-sm">{parseBold(line.replace(/^\d+\. /, ''))}</li>);
			} else if (line.trim() === '') {
				flushBullets(); flushNumbered();
				if (elements.length > 0) elements.push(<div key={i} className="h-1" />);
			} else {
				flushBullets(); flushNumbered();
				elements.push(<p key={i} className="text-sm leading-relaxed">{parseBold(line)}</p>);
			}
		});
		flushBullets();
		flushNumbered();
		return <div className="text-left space-y-0.5">{elements}</div>;
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex">
			<LawyerSidebar />
			<div className="flex-1 p-6">
				<div className="max-w-7xl mx-auto">
					<div className="flex items-center space-x-4 mb-6">
						<div className="flex items-center space-x-2">
							<Timer className="h-8 w-8 text-blue-600" />
							<h1 className="text-2xl font-bold text-gray-800">AI Legal Assistant</h1>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
						<div className="lg:col-span-3">
							<div className="h-[600px] flex flex-col shadow-lg rounded-lg border bg-white">
								<div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg p-4">
									<h2 className="flex items-center space-x-2 font-semibold">
										<MessageSquare className="h-5 w-5" />
										<span>Legal Chat Assistant</span>
									</h2>
								</div>
								<div className="flex-1 p-0 flex flex-col">
									<div ref={scrollRef} className="h-[450px] overflow-y-auto p-4 space-y-4">
										{messages.map(m => (
											<div key={m.id} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
												<div className={`${m.role === 'assistant' ? 'bg-gray-200 text-gray-900' : 'bg-blue-600 text-white'} p-3 rounded-lg max-w-[80%]`}> 
													<div className="flex items-start space-x-2">
														{m.role === 'assistant' ? (
															<Timer className={`h-4 w-4 mt-1 flex-shrink-0 ${m.error ? 'text-red-500' : 'text-blue-600'}`} />
														) : (
															<Scale className="h-4 w-4 mt-1 flex-shrink-0 text-white" />
														)}
														<div>
															{renderResponse(m.text, m.pending, m.error)}
															<p className="text-xs opacity-75 mt-1">{formatTime(m.ts)}</p>
														</div>
													</div>
												</div>
											</div>
										))}
										{loading && (
											<div className="flex justify-start">
												<div className="bg-gray-200 text-gray-900 p-3 rounded-lg max-w-[80%] flex items-center space-x-2">
													<Timer className="h-4 w-4 text-blue-600" />
													<div className="flex space-x-1">
														<div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
														<div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
														<div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
													</div>
												</div>
											</div>
										)}
									</div>
									<form onSubmit={handleSubmit} className="p-4 border-t flex space-x-2">
										<input
											type="text"
											value={input}
											disabled={loading}
											onChange={e => setInput(e.target.value)}
											placeholder="Type your legal question here..."
											className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
										/>
										<button type="submit" disabled={loading || !input.trim()} className="bg-gradient-to-r from-blue-600 to-indigo-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md shadow hover:opacity-90 flex items-center justify-center">
											<Send className="h-4 w-4" />
										</button>
									</form>
								</div>
							</div>
						</div>

						<div className="lg:col-span-1 space-y-4">
							<div className="shadow-md border rounded-lg bg-white">
								<div className="p-4 border-b">
									<h3 className="text-lg font-semibold">Suggested Questions</h3>
								</div>
								<div className="p-4 space-y-2">
									{suggested.map(q => (
										<button
											key={q}
											onClick={() => sendQuery(q)}
											disabled={loading}
											className="w-full border rounded-md px-3 py-2 text-xs text-left hover:bg-gray-50 disabled:opacity-50"
										>
											{q}
										</button>
									))}
								</div>
							</div>
							<div className="shadow-md border rounded-lg bg-white">
								<div className="p-4 border-b">
									<h3 className="text-lg font-semibold">Quick Actions</h3>
								</div>
								<div className="p-4 space-y-2">
									<button className="w-full border rounded-md px-3 py-2 text-sm text-left hover:bg-gray-50">Browse Laws</button>
									<button className="w-full border rounded-md px-3 py-2 text-sm text-left hover:bg-gray-50">Generate Complaint</button>
									<button className="w-full border rounded-md px-3 py-2 text-sm text-left hover:bg-gray-50">Find Lawyers</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
