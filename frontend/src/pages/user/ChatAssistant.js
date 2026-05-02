import React, { useState, useRef, useEffect } from 'react';
import UserSidebar from '../../components/UserSidebar';
import { apiUrl } from '../../api';
import {
  Bot, Send, Sparkles, Trash2, Scale, User, Zap,
  BookOpen, Shield, FileText, MessageSquare, RotateCcw
} from 'lucide-react';

export default function ChatAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const suggested = [
    { icon: Shield, text: 'What are my rights as a tenant?', color: 'from-blue-500 to-cyan-500' },
    { icon: FileText, text: 'How do I file a consumer complaint?', color: 'from-violet-500 to-purple-500' },
    { icon: Scale, text: 'What documents do I need for divorce?', color: 'from-amber-500 to-orange-500' },
    { icon: BookOpen, text: 'Explain workplace discrimination laws', color: 'from-emerald-500 to-teal-500' },
    { icon: Zap, text: 'How to register a trademark?', color: 'from-rose-500 to-pink-500' },
    { icon: Shield, text: 'What are consumer protection laws?', color: 'from-indigo-500 to-blue-500' },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function formatTime(d) {
    try { return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  }

  async function sendQuery(queryText) {
    const trimmed = queryText.trim();
    if (!trimmed || loading) return;
    setInput('');
    const userMsg = { id: Date.now() + '-u', role: 'user', text: trimmed, ts: new Date() };
    const placeholderId = Date.now() + '-a';
    setMessages(prev => [...prev, userMsg, { id: placeholderId, role: 'assistant', text: '', ts: new Date(), pending: true }]);
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/chat/ai/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed })
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) throw new Error('Non-JSON response');
      const data = await res.json();
      setMessages(prev => prev.map(m => m.id === placeholderId ? { ...m, text: data.response || data.error || 'No response', pending: false } : m));
    } catch {
      setMessages(prev => prev.map(m => m.id === placeholderId ? { ...m, text: 'I encountered an issue connecting to the AI service. Please try again in a moment.', pending: false, error: true } : m));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e) { e.preventDefault(); sendQuery(input); }
  function clearChat() { setMessages([]); }

  function parseBold(text) {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part);
  }

  function renderMarkdown(text) {
    const lines = (text || '').split('\n');
    const elements = [];
    let bulletBuffer = [];
    let numberedBuffer = [];
    const flushBullets = () => { if (bulletBuffer.length) { elements.push(<ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-1.5 ml-1">{bulletBuffer}</ul>); bulletBuffer = []; } };
    const flushNumbered = () => { if (numberedBuffer.length) { elements.push(<ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-1 my-1.5 ml-1">{numberedBuffer}</ol>); numberedBuffer = []; } };
    lines.forEach((line, i) => {
      if (line.startsWith('### ')) { flushBullets(); flushNumbered(); elements.push(<p key={i} className="font-semibold text-sm mt-3 mb-1 text-slate-800">{parseBold(line.slice(4))}</p>); }
      else if (line.startsWith('## ')) { flushBullets(); flushNumbered(); elements.push(<p key={i} className="font-bold text-sm mt-3 mb-1 text-slate-800">{parseBold(line.slice(3))}</p>); }
      else if (line.startsWith('# ')) { flushBullets(); flushNumbered(); elements.push(<p key={i} className="font-bold text-base mt-3 mb-1.5 text-slate-900">{parseBold(line.slice(2))}</p>); }
      else if (/^[-*] /.test(line)) { flushNumbered(); bulletBuffer.push(<li key={i} className="text-[13px] leading-relaxed">{parseBold(line.slice(2))}</li>); }
      else if (/^\d+\. /.test(line)) { flushBullets(); numberedBuffer.push(<li key={i} className="text-[13px] leading-relaxed">{parseBold(line.replace(/^\d+\. /, ''))}</li>); }
      else if (line.trim() === '') { flushBullets(); flushNumbered(); if (elements.length) elements.push(<div key={i} className="h-2" />); }
      else { flushBullets(); flushNumbered(); elements.push(<p key={i} className="text-[13px] leading-relaxed">{parseBold(line)}</p>); }
    });
    flushBullets(); flushNumbered();
    return <div className="space-y-0.5">{elements}</div>;
  }

  const showWelcome = messages.length === 0;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <UserSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">AI Legal Assistant</h1>
              <p className="text-xs text-slate-500">Powered by AI — Ask any legal question</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button onClick={clearChat} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {showWelcome ? (
            <div className="max-w-2xl mx-auto flex flex-col items-center justify-center h-full">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-200 mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">How can I help you today?</h2>
              <p className="text-slate-500 text-sm mb-8 text-center max-w-md">I can answer legal questions, explain laws, guide you through legal processes, and help draft documents.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {suggested.map((s, i) => (
                  <button key={i} onClick={() => sendQuery(s.text)} className="group flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-200 hover:border-violet-300 hover:shadow-md hover:shadow-violet-100 transition-all text-left">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <s.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-slate-600 group-hover:text-slate-800 leading-snug pt-1">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-5">
              {messages.map(m => (
                <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[75%] ${m.role === 'user'
                    ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-2xl rounded-tr-md px-4 py-3 shadow-md shadow-violet-200'
                    : `bg-white border ${m.error ? 'border-red-200' : 'border-slate-200'} text-slate-700 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm text-left`
                  }`}>
                    {m.pending ? (
                      <div className="flex items-center gap-2 py-1">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
                          <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                          <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>
                        <span className="text-xs text-slate-400 ml-1">Thinking...</span>
                      </div>
                    ) : (
                      <>
                        {m.role === 'assistant' ? renderMarkdown(m.text) : <p className="text-[13px] leading-relaxed">{m.text}</p>}
                        <p className={`text-[10px] mt-2 ${m.role === 'user' ? 'text-white/60' : 'text-slate-400'}`}>{formatTime(m.ts)}</p>
                      </>
                    )}
                  </div>
                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-200 px-4 md:px-8 py-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                disabled={loading}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask any legal question..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 transition-all"
              />
              {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <RotateCcw className="w-4 h-4 text-violet-400 animate-spin" />
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-center text-[10px] text-slate-400 mt-2">AI responses are informational only and do not constitute legal advice.</p>
        </div>
      </div>
    </div>
  );
}
