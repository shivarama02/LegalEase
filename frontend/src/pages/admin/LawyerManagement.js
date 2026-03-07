import React, { useEffect, useState, useCallback } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { apiUrl } from '../../api';
import {
  UserCog, Search, Trash2, Loader2, Mail, Phone, MapPin, Briefcase, Star,
  ShieldCheck, ShieldOff, X, CheckCircle2, Scale,
} from 'lucide-react';

export default function LawyerManagement() {
  const token = sessionStorage.getItem('authToken');
  const headers = token ? { Authorization: `Token ${token}` } : {};

  const [lawyers, setLawyers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = search ? apiUrl(`/lawyers/?search=${encodeURIComponent(search)}`) : apiUrl('/lawyers/');
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setLawyers(Array.isArray(data) ? data : data.results || []);
      }
    } catch { }
    finally { setLoading(false); }
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  async function toggleVerify(lawyer) {
    try {
      const res = await fetch(apiUrl(`/lawyers/${lawyer.id}/`), {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_verified: !lawyer.is_verified }),
      });
      if (res.ok) {
        setLawyers(prev => prev.map(l => l.id === lawyer.id ? { ...l, is_verified: !l.is_verified } : l));
        setToast(lawyer.is_verified ? 'Lawyer unverified' : 'Lawyer verified');
        setTimeout(() => setToast(''), 3000);
      }
    } catch { }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this lawyer permanently?')) return;
    try {
      const res = await fetch(apiUrl(`/lawyers/${id}/`), { method: 'DELETE', headers });
      if (res.ok || res.status === 204) {
        setLawyers(prev => prev.filter(l => l.id !== id));
        setToast('Lawyer deleted'); setTimeout(() => setToast(''), 3000);
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <UserCog size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Lawyer Management</h1>
                <p className="text-sm text-slate-500">Manage lawyer profiles & verification</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-slate-400">{lawyers.length} lawyers</span>
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
              placeholder="Search by name, specialization, location…"
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 shadow-sm" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
              <Loader2 size={20} className="animate-spin" /> Loading lawyers…
            </div>
          ) : lawyers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center">
              <Scale size={36} className="mx-auto mb-3 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-700">No Lawyers Found</h3>
              <p className="text-sm text-slate-400 mt-1">{search ? 'Try a different search term' : 'No registered lawyers yet'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lawyers.map(l => (
                <div key={l.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden">
                  <div className="p-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {l.photo_full_url ? (
                          <img src={l.photo_full_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-violet-600">{(l.lname || l.full_name || 'L')[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-800">{l.full_name || l.lname}</h3>
                          {l.is_verified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold uppercase tracking-wider">
                              <ShieldCheck size={10} /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-semibold uppercase tracking-wider">
                              <ShieldOff size={10} /> Unverified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">@{l.username}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                          {l.specialization && <span className="flex items-center gap-1"><Briefcase size={11} /> {l.specialization}</span>}
                          {l.location && <span className="flex items-center gap-1"><MapPin size={11} /> {l.location}</span>}
                          {l.experience_years && <span className="flex items-center gap-1"><Briefcase size={11} /> {l.experience_years} yrs exp</span>}
                          <span className="flex items-center gap-1"><Mail size={11} /> {l.email}</span>
                          {l.phone && <span className="flex items-center gap-1"><Phone size={11} /> {l.phone}</span>}
                          <span className="flex items-center gap-1 text-amber-500"><Star size={11} fill="currentColor" /> {l.rating ?? '–'} ({l.reviews_count ?? 0})</span>
                          {l.charge && <span className="font-semibold text-slate-700">₹{l.charge}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => toggleVerify(l)}
                        className={`p-2 rounded-lg transition ${l.is_verified ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                        title={l.is_verified ? 'Unverify' : 'Verify'}>
                        {l.is_verified ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
                      </button>
                      <button onClick={() => handleDelete(l.id)}
                        className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition" title="Delete lawyer">
                        <Trash2 size={16} />
                      </button>
                    </div>
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
