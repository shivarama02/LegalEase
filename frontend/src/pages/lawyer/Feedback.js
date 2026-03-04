import React, { useEffect, useState, useCallback } from 'react';
import LawyerSidebar from '../../components/LawyerSidebar';
import { apiUrl } from '../../api';
import {
  Star, MessageSquare, Loader2, User as UserIcon,
  TrendingUp, BarChart3, Filter,
} from 'lucide-react';

export default function Feedback() {
  const token = sessionStorage.getItem('authToken');
  const authHeaders = token ? { Authorization: `Token ${token}` } : {};

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, 5, 4, 3, 2, 1

  /* ─── Fetch reviews addressed to this lawyer ───────────────────────── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/feedbacks/'), { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(Array.isArray(data) ? data : data.results || []);
      }
    } catch {}
    finally { setLoading(false); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  /* ─── Derived stats ────────────────────────────────────────────────── */
  const total = feedbacks.length;
  const avg = total ? (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / total).toFixed(1) : '0.0';
  const ratingCounts = [5, 4, 3, 2, 1].map(r => feedbacks.filter(f => f.rating === r).length);

  const displayed = filter === 'all' ? feedbacks : feedbacks.filter(f => f.rating === Number(filter));

  /* ─── Stars helper ─────────────────────────────────────────────────── */
  const Stars = ({ value, size = 14 }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size}
          className={i <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      <LawyerSidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Client Feedback</h1>
              <p className="text-sm text-slate-500">Reviews from your clients</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
              <Loader2 size={20} className="animate-spin" /> Loading…
            </div>
          ) : (
            <>
              {/* ── Stats Cards ────────────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {/* Average */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Star size={18} className="text-amber-500" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Rating</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">{avg}</span>
                    <Stars value={Math.round(Number(avg))} size={16} />
                  </div>
                </div>

                {/* Total */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <BarChart3 size={18} className="text-indigo-500" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reviews</span>
                  </div>
                  <span className="text-3xl font-extrabold text-slate-900">{total}</span>
                </div>

                {/* 5-star % */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <TrendingUp size={18} className="text-emerald-500" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">5-Star Rate</span>
                  </div>
                  <span className="text-3xl font-extrabold text-slate-900">
                    {total ? Math.round((ratingCounts[0] / total) * 100) : 0}%
                  </span>
                </div>
              </div>

              {/* ── Rating Breakdown ──────────────────────────────── */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Rating Distribution</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star, idx) => {
                    const pct = total ? Math.round((ratingCounts[idx] / total) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-500 w-4">{star}</span>
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
                            style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 w-10 text-right">{ratingCounts[idx]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Filter / Reviews ─────────────────────────────── */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Reviews ({displayed.length})</h2>
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-slate-400" />
                  <select value={filter} onChange={e => setFilter(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400">
                    <option value="all">All Ratings</option>
                    {[5, 4, 3, 2, 1].map(r => (
                      <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {displayed.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center">
                  <UserIcon size={36} className="mx-auto mb-3 text-slate-300" />
                  <h3 className="text-lg font-bold text-slate-700 mb-1">No Reviews Yet</h3>
                  <p className="text-sm text-slate-400">
                    {filter !== 'all' ? 'No reviews match this filter' : 'Client reviews will appear here'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayed.map(fb => (
                    <div key={fb.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-violet-600">
                                {(fb.client_name || fb.name || 'C')[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{fb.client_name || fb.name || 'Client'}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Stars value={fb.rating} size={13} />
                                <span className="text-xs font-semibold text-amber-600">{fb.rating}.0</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase ${
                              fb.feedback_type === 'lawyer_review' ? 'bg-violet-50 text-violet-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {fb.feedback_type === 'lawyer_review' ? 'Review' : fb.feedback_type}
                            </span>
                            <p className="text-[11px] text-slate-400 mt-1">
                              {new Date(fb.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        {fb.subject && <p className="text-sm font-semibold text-slate-700 mt-3">{fb.subject}</p>}
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed italic">"{fb.message}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

