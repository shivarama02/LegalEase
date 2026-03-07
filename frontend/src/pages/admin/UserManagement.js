import React, { useEffect, useState, useCallback } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { apiUrl } from '../../api';
import {
  Users, Search, Trash2, Loader2, Mail, Phone, Calendar, User as UserIcon, X, CheckCircle2,
} from 'lucide-react';

export default function UserManagement() {
  const token = sessionStorage.getItem('authToken');
  const headers = token ? { Authorization: `Token ${token}` } : {};

  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = search ? apiUrl(`/clients/?search=${encodeURIComponent(search)}`) : apiUrl('/clients/');
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setClients(Array.isArray(data) ? data : data.results || []);
      }
    } catch { }
    finally { setLoading(false); }
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      const res = await fetch(apiUrl(`/clients/${id}/`), { method: 'DELETE', headers });
      if (res.ok || res.status === 204) {
        setClients(prev => prev.filter(c => c.id !== id));
        setToast('User deleted'); setTimeout(() => setToast(''), 3000);
      }
    } catch { }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                <p className="text-sm text-slate-500">Manage registered clients</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-slate-400">{clients.length} users</span>
          </div>

          {/* Toast */}
          {toast && (
            <div className="mb-4 flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3 text-sm font-medium">
              <CheckCircle2 size={16} /> {toast}
            </div>
          )}

          {/* Search */}
          <div className="relative mb-6">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, phone…"
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 shadow-sm" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
              <Loader2 size={20} className="animate-spin" /> Loading users…
            </div>
          ) : clients.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center">
              <UserIcon size={36} className="mx-auto mb-3 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-700">No Users Found</h3>
              <p className="text-sm text-slate-400 mt-1">{search ? 'Try a different search term' : 'No registered clients yet'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.map(c => (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden">
                  <div className="p-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {c.photo_full_url ? (
                          <img src={c.photo_full_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-blue-600">{(c.cname || 'U')[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{c.cname}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">@{c.username}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Mail size={11} /> {c.email}</span>
                          <span className="flex items-center gap-1"><Phone size={11} /> {c.phone}</span>
                          {c.dob && <span className="flex items-center gap-1"><Calendar size={11} /> DOB: {c.dob}</span>}
                          <span className="flex items-center gap-1"><Calendar size={11} /> Joined: {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(c.id)}
                      className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition" title="Delete user">
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
