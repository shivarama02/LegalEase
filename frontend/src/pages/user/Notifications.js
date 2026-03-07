import React, { useState, useEffect, useCallback } from 'react';
import UserSidebar from '../../components/UserSidebar';
import { apiUrl } from '../../api';
import {
  Bell, BellOff, Calendar, Star, MessageSquare, Shield, Clock,
  CheckCheck, Trash2, Filter, RefreshCw, Inbox, AlertCircle
} from 'lucide-react';

const TYPE_CONFIG = {
  appointment: { icon: Calendar, label: 'Appointment', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  feedback:    { icon: Star, label: 'Feedback', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  chat:        { icon: MessageSquare, label: 'Chat', color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', text: 'text-violet-700' },
  system:      { icon: Shield, label: 'System', color: 'from-slate-500 to-slate-600', bg: 'bg-slate-50', text: 'text-slate-700' },
  verification:{ icon: CheckCheck, label: 'Verification', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  reminder:    { icon: Clock, label: 'Reminder', color: 'from-rose-500 to-pink-500', bg: 'bg-rose-50', text: 'text-rose-700' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const token = sessionStorage.getItem('authToken');
  const headers = { 'Content-Type': 'application/json', Authorization: `Token ${token}` };

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?notification_type=${filter}` : '';
      const [nRes, sRes] = await Promise.all([
        fetch(apiUrl(`/notifications/${params}`), { headers }),
        fetch(apiUrl('/notifications/stats/'), { headers }),
      ]);
      if (nRes.ok) { const data = await nRes.json(); setNotifications(Array.isArray(data) ? data : data.results || []); }
      if (sRes.ok) setStats(await sRes.json());
    } catch { /* silent */ }
    setLoading(false);
  }, [filter, token]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  async function markRead(id) {
    await fetch(apiUrl(`/notifications/${id}/read/`), { method: 'POST', headers });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
  }

  async function markAllRead() {
    await fetch(apiUrl('/notifications/read-all/'), { method: 'POST', headers });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setStats(prev => ({ ...prev, unread: 0 }));
  }

  async function deleteNotification(id) {
    await fetch(apiUrl(`/notifications/${id}/`), { method: 'DELETE', headers });
    setNotifications(prev => prev.filter(n => n.id !== id));
    setStats(prev => ({ ...prev, total: prev.total - 1 }));
  }

  const typeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.system;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <UserSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
                <p className="text-sm text-slate-500">
                  {stats.unread > 0 ? <span className="text-violet-600 font-medium">{stats.unread} unread</span> : 'All caught up!'} &middot; {stats.total} total
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchNotifications} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Refresh">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              {stats.unread > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total', value: stats.total, icon: Bell, color: 'from-slate-500 to-slate-600' },
              { label: 'Unread', value: stats.unread, icon: AlertCircle, color: 'from-violet-500 to-indigo-600' },
              { label: 'Appointments', value: notifications.filter(n => n.notification_type === 'appointment').length, icon: Calendar, color: 'from-blue-500 to-cyan-500' },
              { label: 'Reviews', value: notifications.filter(n => n.notification_type === 'feedback').length, icon: Star, color: 'from-amber-500 to-orange-500' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                    <s.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xl font-bold text-slate-800">{s.value}</span>
                </div>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {['all', 'appointment', 'feedback', 'chat', 'system', 'reminder'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${filter === f ? 'bg-violet-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                {f === 'all' ? 'All' : typeConfig(f).label}
              </button>
            ))}
          </div>

          {/* Notification List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-6 h-6 text-violet-400 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">No notifications</h3>
              <p className="text-sm text-slate-500">You're all caught up! New notifications will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map(n => {
                const cfg = typeConfig(n.notification_type);
                const Icon = cfg.icon;
                return (
                  <div key={n.id} className={`group bg-white rounded-xl border shadow-sm p-4 flex items-start gap-4 transition-all hover:shadow-md ${n.is_read ? 'border-slate-200' : 'border-violet-200 bg-violet-50/30'}`}>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className={`text-sm font-semibold ${n.is_read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</h4>
                            {!n.is_read && <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          {!n.is_read && (
                            <button onClick={() => markRead(n.id)} className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="Mark read">
                              <CheckCheck className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => deleteNotification(n.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {n.time_ago || new Date(n.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
