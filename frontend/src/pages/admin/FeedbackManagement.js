import React, { useEffect, useState, useCallback } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { apiUrl } from '../../api';
import {
  MessageSquare, Search, Trash2, Loader2, Star, X, CheckCircle2, Filter, User,
} from 'lucide-react';

const TYPES = ['all', 'platform', 'lawyer'];

export default function FeedbackManagement() {
  const token = sessionStorage.getItem('authToken');
  const headers = token ? { Authorization: `Token ${token}` } : {};

  const [feedbacks, setFeedbacks] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/feedbacks/'), { headers });
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(Array.isArray(data) ? data : data.results || []);
      }
    } catch { }
    finally { setLoading(false); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this feedback permanently?')) return;
    try {
      const res = await fetch(apiUrl(`/feedbacks/${id}/`), { method: 'DELETE', headers });
      if (res.ok || res.status === 204) {
        setFeedbacks(prev => prev.filter(f => f.id !== id));
        setToast('Feedback deleted'); setTimeout(() => setToast(''), 3000);
      }
    } catch { }
  }

  const filtered = feedbacks.filter(f => {
    if (typeFilter !== 'all' && f.feedback_type !== typeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (f.client_name || f.name || '').toLowerCase().includes(s)
        || (f.subject || '').toLowerCase().includes(s)
        || (f.message || '').toLowerCase().includes(s)
        || (f.lawyer_name || '').toLowerCase().includes(s);
    }
    return true;
  });

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
    : '–';

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <MessageSquare size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Feedback Management</h1>
                <p className="text-sm text-slate-500">View and manage all feedback</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1 text-amber-500 font-semibold"><Star size={14} fill="currentColor" /> {avgRating}</span>
              <span className="font-semibold text-slate-400">{feedbacks.length} total</span>
            </div>
          </div>

          {/* Toast */}
          {toast && (
            <div className="mb-4 flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3 text-sm font-medium">
              <CheckCircle2 size={16} /> {toast}
            </div>
          )}

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, subject, message…"
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 shadow-sm" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              {TYPES.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition ${typeFilter === t
                    ? 'bg-amber-500 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
              <Loader2 size={20} className="animate-spin" /> Loading feedback…
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center">
              <MessageSquare size={36} className="mx-auto mb-3 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-700">No Feedback Found</h3>
              <p className="text-sm text-slate-400 mt-1">{search || typeFilter !== 'all' ? 'Try different filters' : 'No feedback submitted yet'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(f => (
                <div key={f.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden">
                  <div className="p-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                        <User size={18} className="text-amber-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-800">{f.client_name || f.name || 'Anonymous'}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            f.feedback_type === 'platform'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-violet-50 text-violet-600'
                          }`}>{f.feedback_type}</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star key={i} size={12} className={i <= (f.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                            ))}
                          </div>
                        </div>
                        {f.lawyer_name && (
                          <p className="text-xs text-violet-500 mt-0.5">For: {f.lawyer_name} ({f.lawyer_specialization || '–'})</p>
                        )}
                        {f.subject && <p className="text-xs font-semibold text-slate-600 mt-1">{f.subject}</p>}
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{f.message}</p>
                        <p className="text-[10px] text-slate-300 mt-2">{new Date(f.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(f.id)}
                      className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition" title="Delete feedback">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
