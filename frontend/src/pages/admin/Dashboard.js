import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { apiUrl } from '../../api';
import {
  Users, UserCog, Scale, MessageSquare, CalendarDays, FileText,
  BarChart3, Loader2, TrendingUp, ArrowRight, Star,
} from 'lucide-react';

export default function AdminDashboard() {
  const token = sessionStorage.getItem('authToken');
  const headers = token ? { Authorization: `Token ${token}` } : {};

  const [stats, setStats] = useState(null);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [clientsRes, lawyersRes, feedbacksRes, appointmentsRes, lawsRes, complaintsRes] =
          await Promise.all([
            fetch(apiUrl('/clients/'), { headers }),
            fetch(apiUrl('/lawyers/'), { headers }),
            fetch(apiUrl('/feedbacks/'), { headers }),
            fetch(apiUrl('/appointments/'), { headers }),
            fetch(apiUrl('/laws/'), { headers }),
            fetch(apiUrl('/complaints/'), { headers }),
          ]);

        const parse = async (res) => {
          if (!res.ok) return [];
          const d = await res.json();
          return Array.isArray(d) ? d : d.results || [];
        };

        const clients = await parse(clientsRes);
        const lawyers = await parse(lawyersRes);
        const feedbacks = await parse(feedbacksRes);
        const appointments = await parse(appointmentsRes);
        const laws = await parse(lawsRes);
        const complaints = await parse(complaintsRes);

        setStats({
          users: clients.length,
          lawyers: lawyers.length,
          feedbacks: feedbacks.length,
          appointments: appointments.length,
          laws: laws.length,
          complaints: complaints.length,
        });
        setRecentFeedback(feedbacks.slice(0, 5));
        setRecentAppointments(appointments.slice(0, 5));
      } catch { }
      finally { setLoading(false); }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const statCards = stats ? [
    { label: 'Users', value: stats.users, icon: Users, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-600', to: '/admin/user-management' },
    { label: 'Lawyers', value: stats.lawyers, icon: UserCog, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-600', to: '/admin/lawyer-management' },
    { label: 'Feedback', value: stats.feedbacks, icon: MessageSquare, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600', to: '/admin/feedback-management' },
    { label: 'Appointments', value: stats.appointments, icon: CalendarDays, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', text: 'text-violet-600', to: '/admin/reports' },
    { label: 'Laws', value: stats.laws, icon: Scale, color: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-50', text: 'text-indigo-600', to: '/admin/law-info-management' },
    { label: 'Complaints', value: stats.complaints, icon: FileText, color: 'from-rose-500 to-pink-500', bg: 'bg-rose-50', text: 'text-rose-600', to: '/admin/reports' },
  ] : [];

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <BarChart3 size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-sm text-slate-500">System overview & management</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
              <Loader2 size={20} className="animate-spin" /> Loading dashboard…
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {statCards.map(s => (
                  <Link key={s.label} to={s.to}
                    className="group bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                        <s.icon size={18} className={s.text} />
                      </div>
                      <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition" />
                    </div>
                    <p className="text-3xl font-extrabold text-slate-900">{s.value}</p>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">{s.label}</p>
                  </Link>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Recent Feedback */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Recent Feedback</h2>
                      <p className="text-xs text-slate-400">Latest user reviews</p>
                    </div>
                    <Link to="/admin/feedback-management" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View All</Link>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {recentFeedback.length === 0 ? (
                      <div className="px-5 py-8 text-center text-sm text-slate-400">No feedback yet</div>
                    ) : recentFeedback.map(fb => (
                      <div key={fb.id} className="px-5 py-3.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                          <Star size={14} className="text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{fb.client_name || fb.name || 'User'}</p>
                          <p className="text-xs text-slate-400 truncate">{fb.subject || fb.message?.substring(0, 50)}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-amber-600">{fb.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Appointments */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Recent Appointments</h2>
                      <p className="text-xs text-slate-400">Latest bookings</p>
                    </div>
                    <Link to="/admin/reports" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View All</Link>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {recentAppointments.length === 0 ? (
                      <div className="px-5 py-8 text-center text-sm text-slate-400">No appointments yet</div>
                    ) : recentAppointments.map(a => (
                      <div key={a.id} className="px-5 py-3.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                          <CalendarDays size={14} className="text-violet-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{a.name || 'Client'}</p>
                          <p className="text-xs text-slate-400">{a.case_type} • {a.appointment_date}</p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg uppercase ${
                          a.status === 'completed' ? 'bg-emerald-50 text-emerald-600'
                          : a.status === 'cancelled' ? 'bg-red-50 text-red-500'
                          : 'bg-blue-50 text-blue-600'
                        }`}>{a.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Platform Summary */}
              <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp size={20} />
                  <h3 className="text-lg font-bold">Platform Summary</h3>
                </div>
                <p className="text-white/70 text-sm mb-4">Quick overview of your legal platform's activity.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {stats && [
                    { label: 'Active Users', val: stats.users },
                    { label: 'Registered Lawyers', val: stats.lawyers },
                    { label: 'Total Feedback', val: stats.feedbacks },
                  ].map(s => (
                    <div key={s.label} className="bg-white/10 backdrop-blur rounded-xl p-3">
                      <p className="text-2xl font-extrabold">{s.val}</p>
                      <p className="text-xs text-white/70">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
