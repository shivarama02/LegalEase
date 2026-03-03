import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import { ArrowLeft, Search, ClipboardList, Calendar, ChevronRight, Loader2, AlertCircle, Inbox } from 'lucide-react';
import { apiUrl } from '../../api';
import { COMPLAINT_TYPE_MAP } from './Complaints';

const STATUS_STYLE = {
  draft:     { label: 'Draft',        bg: 'bg-slate-100',  text: 'text-slate-600' },
  submitted: { label: 'Submitted',    bg: 'bg-blue-100',   text: 'text-blue-700' },
  reviewing: { label: 'Under Review', bg: 'bg-amber-100',  text: 'text-amber-700' },
  closed:    { label: 'Closed',       bg: 'bg-green-100',  text: 'text-green-700' },
};

export default function ComplaintHistory() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (!token) { setError('Please log in to view your complaints.'); setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(apiUrl('/complaints/'), { headers: { Authorization: `Token ${token}` } });
        if (!res.ok) throw new Error(`Failed to load complaints (${res.status})`);
        setComplaints(await res.json());
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = complaints;
    if (statusFilter !== 'all') list = list.filter(c => c.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        (c.title || '').toLowerCase().includes(q) ||
        (c.complainant_name || '').toLowerCase().includes(q) ||
        (c.respondent_name || '').toLowerCase().includes(q) ||
        (c.complaint_type || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [complaints, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const m = { all: complaints.length };
    complaints.forEach(c => { m[c.status] = (m[c.status] || 0) + 1; });
    return m;
  }, [complaints]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <UserSidebar />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">

            {/* Back */}
            <button onClick={() => navigate('/user/complaints')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition mb-4">
              <ArrowLeft size={15} /> Back to Complaints
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                <ClipboardList size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Complaint History</h1>
                <p className="text-xs text-slate-500">View and manage your submitted complaints.</p>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search complaints..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                />
              </div>
              {/* Status Tabs */}
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'draft', label: 'Draft' },
                  { key: 'submitted', label: 'Submitted' },
                  { key: 'reviewing', label: 'Reviewing' },
                  { key: 'closed', label: 'Closed' },
                ].map(s => (
                  <button
                    key={s.key}
                    onClick={() => setStatusFilter(s.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      statusFilter === s.key
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
                    }`}
                  >
                    {s.label} {statusCounts[s.key] != null ? `(${statusCounts[s.key]})` : '(0)'}
                  </button>
                ))}
              </div>
            </div>

            {/* States */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <Loader2 size={28} className="animate-spin mb-2" />
                <span className="text-sm">Loading your complaints...</span>
              </div>
            )}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-24 text-red-400">
                <AlertCircle size={28} className="mb-2" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            {!loading && !error && complaints.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <Inbox size={32} className="mb-2" />
                <span className="text-sm font-medium">No complaints yet</span>
                <p className="text-xs mt-1">File your first complaint from the complaints page.</p>
              </div>
            )}
            {!loading && !error && complaints.length > 0 && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <Search size={28} className="mb-2" />
                <span className="text-sm font-medium">No complaints match your filters</span>
              </div>
            )}

            {/* Complaint Cards */}
            {!loading && !error && filtered.length > 0 && (
              <div className="grid gap-3">
                {filtered.map(c => {
                  const typeInfo = COMPLAINT_TYPE_MAP[c.complaint_type];
                  const st = STATUS_STYLE[c.status] || STATUS_STYLE.draft;
                  const Icon = typeInfo?.icon;
                  return (
                    <div
                      key={c.id}
                      onClick={() => navigate('/user/complaints/preview', { state: { complaint: c, complaintId: c.id } })}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition group cursor-pointer">
                      <div className="flex items-start gap-4 p-5">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeInfo ? typeInfo.bg : 'bg-slate-100'}`}>
                          {Icon ? <Icon size={18} className={typeInfo.text} /> : <ClipboardList size={18} className="text-slate-400" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-slate-800 truncate">{c.title || 'Untitled Complaint'}</h3>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {typeInfo?.title || c.complaint_type}
                                {c.respondent_name ? ` — against ${c.respondent_name}` : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${st.bg} ${st.text}`}>
                                {st.label}
                              </span>
                              <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500 transition" />
                            </div>
                          </div>
                          {/* Meta */}
                          <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
                            {c.incident_date && (
                              <span className="flex items-center gap-1">
                                <Calendar size={11} /> Incident: {c.incident_date}
                              </span>
                            )}
                            {c.created_at && (
                              <span className="flex items-center gap-1">
                                <Calendar size={11} /> Filed: {new Date(c.created_at).toLocaleDateString()}
                              </span>
                            )}
                            {c.damages_amount && (
                              <span className="font-semibold text-slate-500">₹{Number(c.damages_amount).toLocaleString()}</span>
                            )}
                          </div>
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
    </div>
  );
}
