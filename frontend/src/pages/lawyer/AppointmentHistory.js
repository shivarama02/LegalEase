import React, { useEffect, useMemo, useState, useCallback } from 'react';
import LawyerSidebar from '../../components/LawyerSidebar';
import {
  Calendar, Clock, Check, CheckCircle2, XCircle, RotateCcw, Search,
  User, Mail, MapPin, Briefcase, Loader2, AlertCircle, History,
  ChevronDown, Filter, ArrowUpDown,
} from 'lucide-react';
import { apiUrl } from '../../api';

const STATUS_CFG = {
  scheduled:   { label: 'Pending',     badge: 'bg-amber-50 text-amber-700 border-amber-200',    icon: <Clock size={13} /> },
  accepted:    { label: 'Accepted',    badge: 'bg-blue-50 text-blue-700 border-blue-200',       icon: <CheckCircle2 size={13} /> },
  rescheduled: { label: 'Rescheduled', badge: 'bg-purple-50 text-purple-700 border-purple-200', icon: <RotateCcw size={13} /> },
  completed:   { label: 'Completed',   badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <Check size={13} /> },
  cancelled:   { label: 'Cancelled',   badge: 'bg-red-50 text-red-600 border-red-200',          icon: <XCircle size={13} /> },
};

export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest'); // newest | oldest

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('authToken');
      const res = await fetch(apiUrl('/appointments/'), {
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Token ${token}` } : {}) },
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // Stats
  const stats = useMemo(() => {
    const s = { total: appointments.length, completed: 0, cancelled: 0, accepted: 0 };
    appointments.forEach(a => {
      if (a.status === 'completed') s.completed++;
      else if (a.status === 'cancelled') s.cancelled++;
      else if (a.status === 'accepted') s.accepted++;
    });
    return s;
  }, [appointments]);

  // Filtered & sorted
  const filtered = useMemo(() => {
    let list = [...appointments];
    if (statusFilter !== 'all') list = list.filter(a => a.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(a =>
        (a.name || '').toLowerCase().includes(q) ||
        (a.email || '').toLowerCase().includes(q) ||
        (a.case_type || '').toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const da = new Date(`${a.appointment_date}T${a.appointment_time || '00:00'}`);
      const db = new Date(`${b.appointment_date}T${b.appointment_time || '00:00'}`);
      return sortOrder === 'newest' ? db - da : da - db;
    });
    return list;
  }, [appointments, statusFilter, search, sortOrder]);

  function fmtDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <LawyerSidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <History size={20} className="text-white" />
              </div>
              Appointment History
            </h1>
            <p className="text-slate-500 mt-1 ml-[52px]">Complete record of all your appointments</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total', count: stats.total, color: 'from-slate-500 to-slate-600', icon: Calendar },
              { label: 'Accepted', count: stats.accepted, color: 'from-blue-500 to-blue-600', icon: CheckCircle2 },
              { label: 'Completed', count: stats.completed, color: 'from-emerald-500 to-emerald-600', icon: Check },
              { label: 'Cancelled', count: stats.cancelled, color: 'from-red-500 to-red-600', icon: XCircle },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shrink-0`}>
                  <s.icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{s.count}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, email, or case type..."
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent" />
              </div>
              {/* Status filter */}
              <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="appearance-none pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer">
                  <option value="all">All Statuses</option>
                  <option value="scheduled">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {/* Sort */}
              <button onClick={() => setSortOrder(p => p === 'newest' ? 'oldest' : 'newest')}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                <ArrowUpDown size={14} /> {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
              </button>
            </div>
          </div>

          {/* Results */}
          {loading && (
            <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
          )}
          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <AlertCircle size={32} className="text-red-400 mx-auto mb-2" />
              <p className="text-red-600">{error}</p>
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <History size={48} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-lg">No appointments found</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Timeline-style cards */}
          {!loading && !error && filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((a, idx) => {
                const status = a.status || 'scheduled';
                const cfg = STATUS_CFG[status] || STATUS_CFG.scheduled;

                return (
                  <div key={a.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <div className="flex">
                      {/* Left date strip */}
                      <div className={`w-24 md:w-28 shrink-0 flex flex-col items-center justify-center p-3 border-r border-slate-100
                        ${status === 'completed' ? 'bg-emerald-50' : status === 'cancelled' ? 'bg-red-50' : status === 'accepted' ? 'bg-blue-50' : 'bg-slate-50'}`}>
                        <span className="text-2xl font-bold text-slate-800">{a.appointment_date?.slice(8)}</span>
                        <span className="text-xs text-slate-500">{fmtDate(a.appointment_date).split(',')[0]}</span>
                        <span className="text-xs text-slate-400 mt-0.5">{a.appointment_date?.slice(0, 7)}</span>
                        <span className="text-sm font-semibold text-slate-600 mt-1">{a.appointment_time?.slice(0, 5)}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                              <User size={16} className="text-slate-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900 text-sm">{a.name || 'Unknown'}</h3>
                              <p className="text-xs text-slate-500">{a.email || ''}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.badge}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                          <span className="inline-flex items-center gap-1"><Briefcase size={12} /> {a.case_type || '-'}</span>
                          <span className="inline-flex items-center gap-1"><MapPin size={12} /> {a.lawyer_type || '-'}</span>
                          {a.created_at && (
                            <span className="inline-flex items-center gap-1"><Calendar size={12} /> Booked: {new Date(a.created_at).toLocaleDateString()}</span>
                          )}
                        </div>

                        {a.notes && (
                          <p className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-2 line-clamp-2">{a.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Count footer */}
          {!loading && !error && filtered.length > 0 && (
            <div className="mt-4 text-center text-sm text-slate-400">
              Showing {filtered.length} of {appointments.length} appointments
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
