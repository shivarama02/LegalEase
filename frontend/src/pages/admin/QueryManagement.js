import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { apiUrl } from '../../api';
import {
  Mail, Search, Trash2, Loader2, X, Filter,
} from 'lucide-react';

const STATUS_CHOICES = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

function statusLabel(value) {
  return STATUS_CHOICES.find(s => s.value === value)?.label || value || '—';
}

function statusPillClass(value) {
  if (value === 'resolved') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (value === 'in_progress') return 'bg-amber-50 text-amber-800 border border-amber-200';
  return 'bg-blue-50 text-blue-700 border border-blue-200';
}

export default function QueryManagement() {
  const token = sessionStorage.getItem('authToken');
  const headers = token ? { Authorization: `Token ${token}` } : {};
  const jsonHeaders = { ...headers, 'Content-Type': 'application/json' };

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [toast, setToast] = useState('');
  const [viewItem, setViewItem] = useState(null);
  const [editStatus, setEditStatus] = useState('new');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const url = params.toString()
        ? apiUrl(`/contact-queries/?${params.toString()}`)
        : apiUrl('/contact-queries/');

      const res = await fetch(url, { headers });
      if (res.ok) {
        const d = await res.json();
        setItems(Array.isArray(d) ? d : d.results || []);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(loadItems, 250);
    return () => clearTimeout(t);
  }, [loadItems]);

  const canUse = Boolean(token);

  const counts = useMemo(() => {
    const c = { all: items.length, new: 0, in_progress: 0, resolved: 0 };
    items.forEach(i => {
      if (i.status && c[i.status] != null) c[i.status] += 1;
    });
    return c;
  }, [items]);

  function openView(q) {
    setViewItem(q);
    setEditStatus(q?.status || 'new');
    setEditNotes(q?.admin_notes || '');
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this query permanently?')) return;
    try {
      const res = await fetch(apiUrl(`/contact-queries/${id}/`), { method: 'DELETE', headers });
      if (res.ok || res.status === 204) {
        setItems(prev => prev.filter(i => i.id !== id));
        showToast('Query deleted');
      } else {
        showToast('Failed to delete');
      }
    } catch {
      showToast('Failed to delete');
    }
  }

  async function handleSave() {
    if (!viewItem) return;
    setSaving(true);
    try {
      const url = apiUrl(`/contact-queries/${viewItem.id}/`);
      const body = { status: editStatus, admin_notes: editNotes };

      const res = await fetch(url, { method: 'PATCH', headers: jsonHeaders, body: JSON.stringify(body) });
      if (res.ok) {
        const updated = await res.json().catch(() => null);
        const merged = updated ? { ...viewItem, ...updated } : { ...viewItem, ...body };
        setViewItem(merged);
        setItems(prev => prev.map(i => (i.id === viewItem.id ? { ...i, ...merged } : i)));
        showToast('Saved');
      } else {
        const err = await res.json().catch(() => null);
        showToast(err?.detail ? `Error: ${err.detail}` : 'Error saving query');
      }
    } catch {
      showToast('Error saving query');
    } finally {
      setSaving(false);
    }
  }

  function renderViewModal() {
    if (!viewItem) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setViewItem(null)}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900 truncate">{viewItem.subject || 'Query'}</h2>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{viewItem.name} • {viewItem.email}</p>
            </div>
            <button onClick={() => setViewItem(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className={`border rounded-full px-3 py-1 text-xs font-semibold bg-white ${statusPillClass(editStatus)}`}
                >
                  {STATUS_CHOICES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <span className="text-xs text-slate-500">
                {viewItem.created_at ? new Date(viewItem.created_at).toLocaleString() : '—'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Name</p>
                <p className="text-sm text-slate-800 break-words">{viewItem.name || '—'}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</p>
                <p className="text-sm text-slate-800 break-words">{viewItem.email || '—'}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 md:col-span-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Subject</p>
                <p className="text-sm text-slate-800 break-words">{viewItem.subject || '—'}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Created</p>
                <p className="text-sm text-slate-800 break-words">{viewItem.created_at ? new Date(viewItem.created_at).toLocaleString() : '—'}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">IP Address</p>
                <p className="text-sm text-slate-800 break-words">{viewItem.ip_address || '—'}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Message</p>
              <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">{viewItem.message || '—'}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Admin Notes</p>
              <textarea
                rows={4}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Internal notes (optional)"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none"
              />
            </div>
          </div>

          <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              onClick={() => setViewItem(null)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <AdminSidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <Mail size={18} className="text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-lg font-extrabold text-slate-900">Queries</h1>
                  <p className="text-xs text-slate-500">Contact form submissions</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Click a row to view</span>
              </div>
            </div>

            {!canUse && (
              <div className="p-5">
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 font-medium">
                  Admin token missing. Please login as admin.
                </div>
              </div>
            )}

            <div className="p-5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Search size={16} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, subject…"
                  className="flex-1 bg-transparent outline-none text-sm text-slate-700"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-white">
                  <Filter size={16} className="text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-sm outline-none bg-transparent"
                  >
                    <option value="all">All ({counts.all})</option>
                    <option value="new">New ({counts.new})</option>
                    <option value="in_progress">In Progress ({counts.in_progress})</option>
                    <option value="resolved">Resolved ({counts.resolved})</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-slate-500">
                  <Loader2 className="animate-spin mr-2" size={18} /> Loading…
                </div>
              ) : items.length === 0 ? (
                <div className="border border-slate-100 rounded-2xl bg-slate-50 p-8 text-center text-slate-500 text-sm">
                  No queries found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                        <th className="py-3 pr-3">From</th>
                        <th className="py-3 pr-3">Subject</th>
                        <th className="py-3 pr-3">Status</th>
                        <th className="py-3 pr-3">Created</th>
                        <th className="py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((q) => (
                        <tr
                          key={q.id}
                          className="hover:bg-slate-50 cursor-pointer"
                          onClick={() => openView(q)}
                        >
                          <td className="py-3 pr-3">
                            <div className="font-semibold text-slate-800 truncate max-w-[220px]">{q.name}</div>
                            <div className="text-xs text-slate-500 truncate max-w-[220px]">{q.email}</div>
                          </td>
                          <td className="py-3 pr-3">
                            <div className="font-semibold text-slate-800 truncate max-w-[360px]">{q.subject}</div>
                            <div className="text-xs text-slate-500 truncate max-w-[360px]">{q.message}</div>
                          </td>
                          <td className="py-3 pr-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusPillClass(q.status)}`}>
                              {statusLabel(q.status)}
                            </span>
                          </td>
                          <td className="py-3 pr-3 text-slate-600">
                            {q.created_at ? new Date(q.created_at).toLocaleString() : '—'}
                          </td>
                          <td className="py-3 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }}
                                className="p-2 rounded-xl hover:bg-red-50 text-red-600"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-5 right-5 bg-slate-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">
            {toast}
          </div>
        )}

        {renderViewModal()}
      </div>
    </div>
  );
}
