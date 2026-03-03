import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LawyerSidebar from '../../components/LawyerSidebar';
import { apiUrl } from '../../api';
import {
  Scale, FileText, Users, MessageCircle, Clock, CheckCircle, AlertCircle,
  ArrowRight, Calendar, BookOpen, Briefcase, ChevronRight, Sparkles, Star,
} from 'lucide-react';

export default function LawyerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lawyer, setLawyer] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const username = sessionStorage.getItem('lawyerUsername') || sessionStorage.getItem('username') || 'Lawyer';

  // Resolve and load data
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        setError('');
        const token = sessionStorage.getItem('authToken');
        const headers = token ? { Authorization: `Token ${token}` } : {};

        // 1) Resolve current lawyer profile (id, rating, etc.)
        const qp = new URLSearchParams(window.location.search);
        const qpId = qp.get('id');
        const storedId = qpId
          || sessionStorage.getItem('lawyer_id')
          || sessionStorage.getItem('lawyerId')
          || sessionStorage.getItem('lawyerID');
        const storedUsername = sessionStorage.getItem('lawyerUsername') || sessionStorage.getItem('username');

        async function fetchLawyerById(id) {
          const res = await fetch(apiUrl(`/lawyers/${id}/`), { headers });
          if (!res.ok) return null;
          return await res.json();
        }
        async function searchLawyerByUsername(uname) {
          const res = await fetch(apiUrl(`/lawyers/?search=${encodeURIComponent(uname)}`), { headers });
          if (!res.ok) return null;
          const data = await res.json();
          const arr = Array.isArray(data) ? data : (data.results || []);
          return arr.find(l => String(l.username).toLowerCase() === String(uname).toLowerCase()) || arr[0] || null;
        }

        let lw = null;
        if (storedId) {
          lw = await fetchLawyerById(storedId);
          if (!lw && storedUsername) lw = await searchLawyerByUsername(storedUsername);
        } else if (storedUsername) {
          lw = await searchLawyerByUsername(storedUsername);
        }
        if (!lw) throw new Error('Unable to resolve your lawyer profile. Please login again.');
        if (isMounted) setLawyer(lw);
        try {
          localStorage.setItem('lawyerId', String(lw.id));
          localStorage.setItem('lawyer_id', String(lw.id));
        } catch {}

        // 2) Load complaints (assigned to this lawyer) and derive metrics
        let comps = [];
        try {
          const res = await fetch(apiUrl('/complaints/'), { headers });
          if (res.ok) {
            const data = await res.json();
            const arr = Array.isArray(data) ? data : (data.results || []);
            comps = arr.filter(c => (c.assigned_lawyer && (c.assigned_lawyer === lw.id || c.assigned_lawyer.id === lw.id)));
          }
        } catch {}
        if (isMounted) setComplaints(comps);

        // 3) Load appointments (best-effort: API returns only requester appointments)
        try {
          const resA = await fetch(apiUrl('/appointments/'), { headers });
          if (resA.ok) {
            const dataA = await resA.json();
            const arrA = Array.isArray(dataA) ? dataA : (dataA.results || []);
            // keep as-is; may be empty when authenticated as lawyer
            if (isMounted) setAppointments(arrA);
          }
        } catch {}
      } catch (e) {
        if (isMounted) setError(e.message || 'Failed to load dashboard');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  // Derived metrics
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const completedAppointments = useMemo(() => {
    return appointments.filter(a => (a.status || '').toLowerCase() === 'completed').length;
  }, [appointments]);
  const pendingRequests = useMemo(() => {
    const p = new Set(['submitted','reviewing']);
    return complaints.filter(c => p.has(String(c.status || ''))).length;
  }, [complaints]);
  const activeAppointments = useMemo(() => {
    // Attempt: scheduled and for today
    return appointments.filter(a => (a.status || '').toLowerCase() === 'scheduled' && a.appointment_date === todayStr).length;
  }, [appointments, todayStr]);
  const averageRating = lawyer?.rating ?? 0;
  const reviewsCount = lawyer?.reviews_count ?? 0;

  // Derived appointment lists
  const recentAppointments = useMemo(() => {
    const toDate = (a) => new Date(`${a.appointment_date || '1970-01-01'}T${(a.appointment_time || '00:00')}`);
    return [...appointments]
      .sort((a, b) => toDate(b) - toDate(a))
      .slice(0, 5);
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    const today = todayStr;
    const toDate = (a) => new Date(`${a.appointment_date || '2099-12-31'}T${(a.appointment_time || '23:59')}`);
    return appointments
      .filter(a => (a.status || '').toLowerCase() === 'scheduled' && (a.appointment_date || '') >= today)
      .sort((a, b) => toDate(a) - toDate(b))
      .slice(0, 5);
  }, [appointments, todayStr]);

  const formatDate = (d) => { try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d || ''; } };

  const STATS = [
    { icon: Calendar, label: 'Active Today', value: activeAppointments, bg: 'bg-indigo-50', text: 'text-indigo-600', link: '/lawyer/appointments' },
    { icon: Clock, label: 'Pending Requests', value: pendingRequests, bg: 'bg-amber-50', text: 'text-amber-600', link: '/lawyer/appointments' },
    { icon: CheckCircle, label: 'Completed', value: completedAppointments, bg: 'bg-emerald-50', text: 'text-emerald-600', link: '/lawyer/appointments' },
    { icon: Users, label: 'Total Appointments', value: appointments.length, bg: 'bg-violet-50', text: 'text-violet-600', link: '/lawyer/appointments' },
  ];

  const QUICK_ACTIONS = [
    { icon: MessageCircle, title: 'Client Chat', desc: 'Respond to client messages', color: 'from-indigo-500 to-violet-600', path: '/lawyer/chat' },
    { icon: Sparkles, title: 'AI Legal Assistant', desc: 'Research with AI help', color: 'from-violet-500 to-purple-600', path: '/lawyer/aichat' },
    { icon: Scale, title: 'Browse Laws', desc: 'Explore legal database', color: 'from-blue-500 to-cyan-600', path: '/lawyer/laws' },
    { icon: Calendar, title: 'Appointments', desc: 'Manage your schedule', color: 'from-emerald-500 to-green-600', path: '/lawyer/appointments' },
    { icon: Star, title: 'Feedback', desc: 'View client reviews', color: 'from-amber-500 to-orange-500', path: '/lawyer/lawyerfeedback' },
    { icon: Briefcase, title: 'My Profile', desc: 'Update your profile', color: 'from-rose-500 to-pink-600', path: '/lawyer/LawyerProfile' },
  ];

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    const map = {
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return map[s] || 'bg-slate-50 text-slate-600 border-slate-200';
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <LawyerSidebar />
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
                <p className="text-indigo-200/80 text-sm mt-1.5">We're glad to have you here. Manage your clients, appointments, and legal resources — all in one place.</p>
              </div>
              <button onClick={() => navigate('/lawyer/aichat')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold transition">
                <Sparkles size={16} /> AI Legal Research
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

            {/* Appointments — two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Appointments */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Clock size={18} className="text-indigo-500" /> Recent Appointments</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Your latest client appointments</p>
                </div>
                <div className="divide-y divide-slate-50">
                  {loading ? (
                    <div className="px-6 py-10 text-center text-sm text-slate-400">Loading…</div>
                  ) : recentAppointments.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                      <Calendar size={28} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-sm text-slate-500">No recent appointments.</p>
                    </div>
                  ) : (
                    recentAppointments.map((a) => (
                      <div key={a.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/60 transition">
                        <div className="shrink-0 w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                          <Calendar size={16} className="text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{a.name || 'Client'} — {a.case_type || 'Consultation'}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{formatDate(a.appointment_date)} at {(a.appointment_time || '').slice(0, 5)}</p>
                        </div>
                        <span className={`shrink-0 px-2.5 py-1 text-[11px] font-semibold rounded-lg border capitalize ${getStatusBadge(a.status)}`}>{a.status || 'unknown'}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><ArrowRight size={18} className="text-emerald-500" /> Upcoming</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Scheduled appointments ahead</p>
                </div>
                <div className="divide-y divide-slate-50">
                  {loading ? (
                    <div className="px-6 py-10 text-center text-sm text-slate-400">Loading…</div>
                  ) : upcomingAppointments.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                      <CheckCircle size={28} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-sm text-slate-500">No upcoming appointments.</p>
                    </div>
                  ) : (
                    upcomingAppointments.map((a) => (
                      <div key={a.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/60 transition">
                        <div className="shrink-0 w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                          <Calendar size={16} className="text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{a.name || 'Client'} — {a.case_type || 'Consultation'}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{formatDate(a.appointment_date)} at {(a.appointment_time || '').slice(0, 5)}</p>
                        </div>
                        <span className="shrink-0 px-2.5 py-1 text-[11px] font-semibold rounded-lg border capitalize bg-blue-50 text-blue-700 border-blue-200">Scheduled</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
