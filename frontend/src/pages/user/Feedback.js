import React, { useEffect, useState, useCallback } from 'react';
import UserSidebar from '../../components/UserSidebar';
import { apiUrl } from '../../api';
import {
  Star, Send, MessageSquare, Loader2, User as UserIcon, Clock,
  CheckCircle2, ChevronDown, X,
} from 'lucide-react';

export default function UserFeedback() {
  const token = sessionStorage.getItem('authToken');
  const authHeaders = token ? { Authorization: `Token ${token}` } : {};

  /* ─── State ────────────────────────────────────────────────────────── */
  const [tab, setTab] = useState('give');
  const [lawyers, setLawyers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /* ─── Fetch data ───────────────────────────────────────────────────── */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [roomsRes, apptRes, fbRes] = await Promise.all([
        fetch(apiUrl('/chat/my-rooms/'), { headers: authHeaders }),
        fetch(apiUrl('/appointments/'), { headers: authHeaders }),
        fetch(apiUrl('/feedbacks/'), { headers: authHeaders }),
      ]);

      if (fbRes.ok) {
        const fbData = await fbRes.json();
        setFeedbacks(Array.isArray(fbData) ? fbData : fbData.results || []);
      }

      const lawyerMap = new Map();

      if (roomsRes.ok) {
        const rooms = await roomsRes.json();
        (Array.isArray(rooms) ? rooms : rooms.results || []).forEach(r => {
          if (r.status === 'active' && r.lawyer_id) {
            lawyerMap.set(r.lawyer_id, {
              id: r.lawyer_id, name: r.lawyer_name || 'Lawyer',
              source: 'chat', specialization: '', location: '',
            });
          }
        });
      }

      if (apptRes.ok) {
        const appts = await apptRes.json();
        (Array.isArray(appts) ? appts : appts.results || []).forEach(a => {
          if (a.status === 'completed' && a.lawyer) {
            const existing = lawyerMap.get(a.lawyer);
            lawyerMap.set(a.lawyer, {
              id: a.lawyer,
              name: a.lawyer_name || existing?.name || 'Lawyer',
              specialization: a.lawyer_specialization || existing?.specialization || '',
              source: existing ? 'both' : 'appointment',
              location: existing?.location || '',
            });
          }
        });
      }

      // Enrich with full lawyer profiles
      for (const lid of [...lawyerMap.keys()]) {
        try {
          const lRes = await fetch(apiUrl(`/lawyers/${lid}/`), { headers: authHeaders });
          if (lRes.ok) {
            const ld = await lRes.json();
            const existing = lawyerMap.get(lid);
            lawyerMap.set(lid, {
              ...existing,
              name: ld.full_name || ld.lname || existing.name,
              specialization: ld.specialization || existing.specialization,
              location: ld.location || '',
              photo_full_url: ld.photo_full_url || ld.photo_url || '',
            });
          }
        } catch {}
      }

      setLawyers([...lawyerMap.values()]);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData(); }, [loadData]);

  /* ─── Submit ───────────────────────────────────────────────────────── */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedLawyer) { setError('Please select a lawyer to review'); return; }
    if (!rating) { setError('Please select a rating'); return; }
    if (!message.trim()) { setError('Please write your feedback'); return; }
    setSubmitting(true); setError(''); setSuccess('');
    try {
      const res = await fetch(apiUrl('/feedbacks/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          feedback_type: 'lawyer_review', rating,
          subject: subject || `Review for ${selectedLawyer.name}`,
          message: message.trim(),
          lawyer: selectedLawyer.id,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || JSON.stringify(data) || 'Submit failed');
      }
      setSuccess('Feedback submitted successfully!');
      setSelectedLawyer(null); setRating(0); setHover(0); setMessage(''); setSubject('');
      setTimeout(() => setSuccess(''), 4000);
      loadData();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  /* ─── Stars ────────────────────────────────────────────────────────── */
  const Stars = ({ value, size = 16, interactive = false, onSet, onHoverVal, hoverVal }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size}
          className={`transition-colors ${interactive ? 'cursor-pointer' : ''} ${
            i <= (interactive ? (hoverVal || value) : value)
              ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
          }`}
          onMouseEnter={interactive ? () => onHoverVal?.(i) : undefined}
          onMouseLeave={interactive ? () => onHoverVal?.(0) : undefined}
          onClick={interactive ? () => onSet?.(i) : undefined}
        />
      ))}
    </div>
  );

  /* ─── Render ───────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex bg-slate-50">
      <UserSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Feedback & Reviews</h1>
              <p className="text-sm text-slate-500">Rate lawyers you've worked with</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
            {[
              { key: 'give', label: 'Give Feedback', icon: Send },
              { key: 'history', label: 'My Reviews', icon: Clock },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}>
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>

          {/* Toasts */}
          {success && (
            <div className="mb-4 flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3 text-sm font-medium">
              <CheckCircle2 size={16} /> {success}
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-center justify-between bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
              {error}
              <button onClick={() => setError('')}><X size={14} /></button>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
              <Loader2 size={20} className="animate-spin" /> Loading…
            </div>
          )}

          {/* ── GIVE FEEDBACK TAB ─────────────────────────────────── */}
          {!loading && tab === 'give' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left — Lawyer list */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Your Lawyers</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Contacted or appointment completed</p>
                  </div>
                  <div className="max-h-[420px] overflow-y-auto">
                    {lawyers.length === 0 ? (
                      <div className="px-5 py-10 text-center text-sm text-slate-400">
                        <UserIcon size={28} className="mx-auto mb-2 text-slate-300" />
                        No lawyers to review yet.<br />Chat with or complete an appointment first.
                      </div>
                    ) : (
                      lawyers.map(l => (
                        <button key={l.id}
                          onClick={() => { setSelectedLawyer(l); setDropdownOpen(false); }}
                          className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition hover:bg-slate-50 ${
                            selectedLawyer?.id === l.id ? 'bg-indigo-50 border-l-2 border-indigo-600' : ''
                          }`}>
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {l.photo_full_url ? (
                              <img src={l.photo_full_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm font-bold text-indigo-600">{(l.name || 'L')[0].toUpperCase()}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{l.name}</p>
                            {l.specialization && <p className="text-xs text-indigo-500 truncate">{l.specialization}</p>}
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded mt-0.5 inline-block ${
                              l.source === 'chat' ? 'bg-blue-50 text-blue-600'
                                : l.source === 'appointment' ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-purple-50 text-purple-600'
                            }`}>
                              {l.source === 'chat' ? 'Chat' : l.source === 'appointment' ? 'Appointment' : 'Chat & Appt'}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right — Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5">
                    <h2 className="text-lg font-bold text-white">Write a Review</h2>
                    <p className="text-white/80 text-sm">Share your experience to help others</p>
                  </div>

                  <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                    {/* Selected lawyer */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Reviewing</label>
                      {selectedLawyer ? (
                        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-200 to-violet-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {selectedLawyer.photo_full_url ? (
                              <img src={selectedLawyer.photo_full_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm font-bold text-indigo-700">{(selectedLawyer.name || 'L')[0]}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800">{selectedLawyer.name}</p>
                            <p className="text-xs text-indigo-600">{selectedLawyer.specialization || 'General Practice'}</p>
                          </div>
                          <button type="button" onClick={() => setSelectedLawyer(null)} className="text-slate-400 hover:text-slate-600">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="relative lg:hidden">
                            <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)}
                              className="w-full flex items-center justify-between px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-500">
                              Select a lawyer… <ChevronDown size={14} />
                            </button>
                            {dropdownOpen && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                                {lawyers.map(l => (
                                  <button key={l.id} type="button"
                                    onClick={() => { setSelectedLawyer(l); setDropdownOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left">
                                    <span className="text-sm font-semibold text-slate-800">{l.name}</span>
                                    <span className="text-xs text-slate-400">{l.specialization}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="hidden lg:block text-sm text-slate-400 mt-1">← Select a lawyer from the panel</p>
                        </>
                      )}
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Your Rating *</label>
                      <div className="flex items-center gap-3">
                        <Stars value={rating} size={28} interactive onSet={setRating} onHoverVal={setHover} hoverVal={hover} />
                        {rating > 0 && (
                          <span className="text-sm font-bold text-amber-600">
                            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Subject</label>
                      <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                        placeholder="Brief summary (optional)"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition" />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Your Feedback *</label>
                      <textarea rows={5} value={message} onChange={e => setMessage(e.target.value)}
                        placeholder="Share your experience with this lawyer…"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition resize-none" />
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={submitting || !selectedLawyer || !rating}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      {submitting ? 'Submitting…' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ── MY REVIEWS TAB ────────────────────────────────────── */}
          {!loading && tab === 'history' && (
            <div>
              {feedbacks.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center">
                  <MessageSquare size={36} className="mx-auto mb-3 text-slate-300" />
                  <h3 className="text-lg font-bold text-slate-700 mb-1">No Reviews Yet</h3>
                  <p className="text-sm text-slate-400">Your submitted reviews will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map(fb => (
                    <div key={fb.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition">
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                              <Star size={18} className="text-amber-500" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{fb.lawyer_name || 'General Feedback'}</p>
                              {fb.lawyer_specialization && <p className="text-xs text-indigo-500">{fb.lawyer_specialization}</p>}
                              <div className="flex items-center gap-2 mt-1">
                                <Stars value={fb.rating} size={13} />
                                <span className="text-xs font-semibold text-amber-600">{fb.rating}.0</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase ${
                              fb.feedback_type === 'lawyer_review' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {fb.feedback_type === 'lawyer_review' ? 'Lawyer Review' : fb.feedback_type}
                            </span>
                            <p className="text-[11px] text-slate-400 mt-1">
                              {new Date(fb.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        {fb.subject && <p className="text-sm font-semibold text-slate-700 mt-3">{fb.subject}</p>}
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{fb.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
