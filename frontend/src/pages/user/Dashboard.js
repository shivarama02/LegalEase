import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import { apiUrl } from '../../api';
import {
  Scale, FileText, Users, MessageCircle, Clock, CheckCircle, AlertCircle,
  ArrowRight, Calendar, BookOpen, Briefcase, ChevronRight, Sparkles,
} from 'lucide-react';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [chats, setChats] = useState([]);
  const [lawViews, setLawViews] = useState([]);
  const username = sessionStorage.getItem('username') || 'User';

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        setError('');
        const token = sessionStorage.getItem('authToken');
        const headers = token ? { Authorization: `Token ${token}` } : {};

        try {
          const res = await fetch(apiUrl('/complaints/'), { headers });
          if (res.ok) { const data = await res.json(); if (isMounted) setComplaints(Array.isArray(data) ? data : (data.results || [])); }
        } catch {}

        try {
          const res = await fetch(apiUrl('/appointments/'), { headers });
          if (res.ok) { const data = await res.json(); if (isMounted) setAppointments(Array.isArray(data) ? data : (data.results || [])); }
        } catch {}

        try {
          const res = await fetch(apiUrl('/chats/'), { headers });
          if (res.ok) { const data = await res.json(); if (isMounted) setChats(Array.isArray(data) ? data : (data.results || [])); }
        } catch {}

        try {
          const res = await fetch(apiUrl('/lawviews/'), { headers });
          if (res.ok) { const data = await res.json(); if (isMounted) setLawViews(Array.isArray(data) ? data : (data.results || [])); }
          else { if (isMounted) setLawViews([]); }
        } catch { if (isMounted) setLawViews([]); }
      } catch (e) {
        if (isMounted) setError(e.message || 'Failed to load dashboard');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const complaintsCount = complaints.length;
  const lawyersContacted = useMemo(() => {
    const ids = new Set();
    for (const a of appointments) {
      if (!a) continue;
      const id = a.lawyer?.id ?? a.lawyer_id ?? a.lawyer;
      if (id != null) ids.add(String(id));
    }
    return ids.size;
  }, [appointments]);
  const chatSessions = chats.length;
  const appointmentsCount = appointments.length;

  const toDate = (item) => {
    if (item.appointment_date) return new Date(`${item.appointment_date}T${(item.appointment_time || '00:00')}`);
    const d = item.updated_at || item.created_at || item.date || item.timestamp;
    return d ? new Date(d) : new Date(0);
  };

  const activities = useMemo(() => {
    const ap = appointments.map(a => ({ kind: 'appointment', title: `${a.case_type || 'Consultation'}`, subtitle: a.name || 'Lawyer Appointment', status: (a.status || '').toLowerCase(), when: toDate(a) }));
    const cp = complaints.map(c => ({ kind: 'complaint', title: c.title || c.complaint_type || 'Complaint', subtitle: c.complainant_name || 'Complaint Submitted', status: (c.status || '').toLowerCase(), when: toDate(c) }));
    const lv = lawViews.map(v => ({ kind: 'lawview', title: v.title || v.name || v.law_title || 'Law Viewed', subtitle: v.category || v.section || '', status: 'viewed', when: toDate(v) }));
    return [...ap, ...cp, ...lv].sort((a, b) => b.when - a.when).slice(0, 8);
  }, [appointments, complaints, lawViews]);

  const formatWhen = (d) => { try { return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return ''; } };

  const STATS = [
    { icon: Calendar, label: 'Appointments', value: appointmentsCount, bg: 'bg-indigo-50', text: 'text-indigo-600', link: '/user/appointments' },
    { icon: FileText, label: 'Complaints', value: complaintsCount, bg: 'bg-violet-50', text: 'text-violet-600', link: '/user/complaints/history' },
    { icon: Users, label: 'Lawyers Contacted', value: lawyersContacted, bg: 'bg-emerald-50', text: 'text-emerald-600', link: '/user/lawyers' },
    { icon: MessageCircle, label: 'Chat Sessions', value: chatSessions, bg: 'bg-amber-50', text: 'text-amber-600', link: '/user/chat' },
  ];

  const QUICK_ACTIONS = [
    { icon: MessageCircle, title: 'Chat with Lawyer', desc: 'Start a real-time conversation', color: 'from-indigo-500 to-violet-600', path: '/user/chat' },
    { icon: Sparkles, title: 'AI Legal Assistant', desc: 'Ask anything about law', color: 'from-violet-500 to-purple-600', path: '/user/aichat' },
    { icon: Scale, title: 'Browse Laws', desc: 'Explore legal categories', color: 'from-blue-500 to-cyan-600', path: '/user/laws' },
    { icon: FileText, title: 'Generate Complaint', desc: 'Create complaint letters', color: 'from-emerald-500 to-green-600', path: '/user/complaints' },
    { icon: Briefcase, title: 'Find Lawyers', desc: 'Search verified lawyers', color: 'from-amber-500 to-orange-500', path: '/user/lawyers' },
    { icon: Calendar, title: 'Appointments', desc: 'View your bookings', color: 'from-rose-500 to-pink-600', path: '/user/appointments' },
  ];

  const getActivityIcon = (it) => {
    if (it.kind === 'appointment') return it.status === 'completed'
      ? <CheckCircle size={18} className="text-emerald-500" />
      : <Calendar size={18} className="text-indigo-500" />;
    if (it.kind === 'lawview') return <BookOpen size={18} className="text-violet-500" />;
    return (it.status === 'submitted' || it.status === 'reviewing')
      ? <AlertCircle size={18} className="text-amber-500" />
      : <CheckCircle size={18} className="text-emerald-500" />;
  };

  const getStatusBadge = (status) => {
    const map = {
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      submitted: 'bg-blue-50 text-blue-700 border-blue-200',
      reviewing: 'bg-violet-50 text-violet-700 border-violet-200',
      viewed: 'bg-slate-50 text-slate-600 border-slate-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
    };
    return map[status] || 'bg-slate-50 text-slate-600 border-slate-200';
  };

  const getKindLabel = (kind) => {
    if (kind === 'appointment') return 'Appointment';
    if (kind === 'lawview') return 'Law Viewed';
    return 'Complaint';
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <UserSidebar />
      <div className="flex-1 overflow-y-auto">
        {/* Top gradient banner */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 md:px-10 pt-10 pb-28">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-left">
                  Welcome back, <span className="text-indigo-200">{username}</span>!
                </h1>
                <p className="text-indigo-200/80 text-sm mt-1.5">We're glad to have you here. Submit complaints, consult with lawyers, and stay informed about your legal matters — all in one place.</p>
              </div>
              <button onClick={() => navigate('/user/aichat')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold transition">
                <Sparkles size={16} /> Ask AI Assistant
              </button>
            </div>
          </div>
        </div>

        {/* Main content overlaps banner */}
        <div className="relative -mt-20 px-6 md:px-10 pb-10">
          <div className="max-w-7xl mx-auto space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STATS.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} onClick={() => navigate(s.link)} className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 p-5 cursor-pointer transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}><Icon size={20} className={s.text} /></div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 transition" />
                    </div>
                    <p className="text-3xl font-extrabold text-slate-900">{loading ? '–' : s.value}</p>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">{s.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {QUICK_ACTIONS.map((a) => {
                  const Icon = a.icon;
                  return (
                    <button key={a.title} onClick={() => navigate(a.path)} className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 p-5 text-left transition-all">
                      <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center shadow-sm`}><Icon size={20} className="text-white" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{a.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{a.desc}</p>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-400 shrink-0 transition" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Clock size={18} className="text-indigo-500" /> Recent Activity</h2>
                <p className="text-xs text-slate-500 mt-0.5">Your latest interactions and updates</p>
              </div>
              <div className="divide-y divide-slate-50">
                {loading ? (
                  <div className="px-6 py-10 text-center text-sm text-slate-400">Loading activity…</div>
                ) : activities.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <Clock size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">No recent activity yet. Start exploring!</p>
                    <button onClick={() => navigate('/user/laws')} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">Browse Laws <ArrowRight size={14} /></button>
                  </div>
                ) : (
                  activities.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/60 transition">
                      <div className="shrink-0 w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center">{getActivityIcon(it)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate"><span className="text-slate-500 font-normal">{getKindLabel(it.kind)}:</span> {it.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatWhen(it.when)}</p>
                      </div>
                      <span className={`shrink-0 px-2.5 py-1 text-[11px] font-semibold rounded-lg border capitalize ${getStatusBadge(it.status)}`}>{it.status || 'updated'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
