import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { apiUrl } from '../../api';
import {
  FileText, Search, Trash2, Loader2, X, CheckCircle2, Plus, Pencil, Filter,
} from 'lucide-react';

const COMPLAINT_TYPES = [
  { value: 'consumer', label: 'Consumer Protection' },
  { value: 'ipc', label: 'Criminal / IPC' },
  { value: 'labour', label: 'Labour / Employment' },
  { value: 'family', label: 'Family / Domestic' },
  { value: 'cyber', label: 'Cyber Crime' },
  { value: 'property', label: 'Property / Tenancy' },
  { value: 'corporate', label: 'Corporate / Company' },
  { value: 'other', label: 'Other' },
];

const STATUS_CHOICES = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'reviewing', label: 'Under Review' },
  { value: 'closed', label: 'Closed' },
];

function typeLabel(value) {
  return COMPLAINT_TYPES.find(t => t.value === value)?.label || value || '—';
}

function statusPillClass(value) {
  if (value === 'closed') return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
  if (value === 'reviewing') return 'bg-amber-50 text-amber-700 border border-amber-200';
  if (value === 'submitted') return 'bg-blue-50 text-blue-600 border border-blue-200';
  return 'bg-slate-50 text-slate-600 border border-slate-200';
}

export default function ComplaintHistoryManagement() {
  const token = sessionStorage.getItem('authToken');
  const headers = token ? { Authorization: `Token ${token}` } : {};
  const jsonHeaders = { ...headers, 'Content-Type': 'application/json' };

  const [complaints, setComplaints] = useState([]);
  const [lawyers, setLawyers] = useState([]);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadLawyers = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/lawyers/'), { headers });
      if (!res.ok) return;
      const d = await res.json();
      setLawyers(Array.isArray(d) ? d : d.results || []);
    } catch { }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (typeFilter !== 'all') params.set('complaint_type', typeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const url = params.toString() ? apiUrl(`/complaints/?${params.toString()}`) : apiUrl('/complaints/');
      const res = await fetch(url, { headers });
      if (res.ok) {
        const d = await res.json();
        setComplaints(Array.isArray(d) ? d : d.results || []);
      }
    } catch { }
    finally { setLoading(false); }
  }, [search, typeFilter, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadLawyers(); }, [loadLawyers]);
  useEffect(() => {
    const t = setTimeout(loadComplaints, 250);
    return () => clearTimeout(t);
  }, [loadComplaints]);

  const lawyerOptions = useMemo(
    () => lawyers.map(l => ({ value: l.id, label: l.full_name || l.lname || l.username || `Lawyer #${l.id}` })),
    [lawyers]
  );

  const lawyerNameById = useMemo(() => {
    const map = new Map();
    lawyers.forEach(l => {
      map.set(l.id, l.full_name || l.lname || l.username || `Lawyer #${l.id}`);
    });
    return map;
  }, [lawyers]);

  function openAdd() {
    setModal({
      mode: 'add',
      data: {
        complaint_type: 'other',
        title: '',
        complainant_name: '',
        complainant_phone: '',
        complainant_email: '',
        complainant_address: '',
        complainant_id_proof: '',
        respondent_name: '',
        respondent_phone: '',
        respondent_address: '',
        incident_date: '',
        incident_time: '',
        incident_location: '',
        police_station: '',
        subject: '',
        description: '',
        damages_amount: '',
        evidence_summary: '',
        relief_sought: '',
        status: 'draft',
        assigned_lawyer: '',
        extra_data: null,
      },
    });
  }

  function openEdit(c) {
    setModal({ mode: 'edit', data: { ...c } });
  }

  function updateField(k, v) {
    setModal(m => ({ ...m, data: { ...m.data, [k]: v } }));
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this complaint permanently?')) return;
    try {
      const res = await fetch(apiUrl(`/complaints/${id}/`), { method: 'DELETE', headers });
      if (res.ok || res.status === 204) {
        setComplaints(prev => prev.filter(c => c.id !== id));
        showToast('Complaint deleted');
      }
    } catch { }
  }

  function coerceNullable(body, keys) {
    keys.forEach(k => {
      if (body[k] === '') body[k] = null;
    });
  }

  async function handleSave() {
    if (!modal) return;
    setSaving(true);
    try {
      const isEdit = modal.mode === 'edit';
      const url = isEdit ? apiUrl(`/complaints/${modal.data.id}/`) : apiUrl('/complaints/');
      const method = isEdit ? 'PUT' : 'POST';

      const body = { ...modal.data };

      // normalize nullable fields
      coerceNullable(body, [
        'incident_date', 'incident_time', 'damages_amount', 'assigned_lawyer',
        'police_station', 'subject',
      ]);

      const res = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (res.ok) {
        setModal(null);
        showToast(isEdit ? 'Complaint updated' : 'Complaint created');
        loadComplaints();
      } else {
        const err = await res.json().catch(() => null);
        showToast(err ? `Error: ${JSON.stringify(err)}` : 'Error saving complaint');
      }
    } catch {
      showToast('Error saving complaint');
    } finally {
      setSaving(false);
    }
  }

  function renderField(label, value, onChange, { type = 'text', rows = 0, options = null, required = false, placeholder = '' } = {}) {
    return (
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">{label}{required ? ' *' : ''}</label>
        {options ? (
          <select
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"
          >
            <option value="">— Select —</option>
            {options.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ) : rows > 0 ? (
          <textarea
            rows={rows}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none"
          />
        ) : (
          <input
            type={type}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          />
        )}
      </div>
    );
  }

  function renderModal() {
    if (!modal) return null;

    const disableSave = !modal.data.title || !modal.data.complaint_type || !modal.data.complainant_name || !modal.data.description;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setModal(null)}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">{modal.mode === 'edit' ? 'Edit Complaint' : 'Add Complaint'}</h2>
            <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('Type', modal.data.complaint_type, v => updateField('complaint_type', v), { options: COMPLAINT_TYPES, required: true })}
            {renderField('Status', modal.data.status, v => updateField('status', v), { options: STATUS_CHOICES, required: true })}

            <div className="md:col-span-2">
              {renderField('Title', modal.data.title, v => updateField('title', v), { required: true, placeholder: 'Complaint title' })}
            </div>

            {renderField('Complainant Name', modal.data.complainant_name, v => updateField('complainant_name', v), { required: true })}
            {renderField('Respondent Name', modal.data.respondent_name, v => updateField('respondent_name', v))}

            {renderField('Complainant Phone', modal.data.complainant_phone, v => updateField('complainant_phone', v))}
            {renderField('Respondent Phone', modal.data.respondent_phone, v => updateField('respondent_phone', v))}

            {renderField('Complainant Email', modal.data.complainant_email, v => updateField('complainant_email', v), { type: 'email' })}
            {renderField('Assigned Lawyer', modal.data.assigned_lawyer ?? '', v => updateField('assigned_lawyer', v ? Number(v) : ''), { options: lawyerOptions })}

            <div className="md:col-span-2">
              {renderField('Complainant Address', modal.data.complainant_address, v => updateField('complainant_address', v), { rows: 2 })}
            </div>
            <div className="md:col-span-2">
              {renderField('Respondent Address', modal.data.respondent_address, v => updateField('respondent_address', v), { rows: 2 })}
            </div>

            {renderField('Incident Date', modal.data.incident_date, v => updateField('incident_date', v), { type: 'date' })}
            {renderField('Incident Time', modal.data.incident_time, v => updateField('incident_time', v), { type: 'time' })}

            {renderField('Location', modal.data.incident_location, v => updateField('incident_location', v))}
            {renderField('Police Station', modal.data.police_station, v => updateField('police_station', v))}

            <div className="md:col-span-2">
              {renderField('Subject', modal.data.subject, v => updateField('subject', v))}
            </div>

            <div className="md:col-span-2">
              {renderField('Description', modal.data.description, v => updateField('description', v), { rows: 4, required: true })}
            </div>

            {renderField('Damages Amount', modal.data.damages_amount, v => updateField('damages_amount', v), { type: 'number', placeholder: 'Optional' })}
            {renderField('ID Proof', modal.data.complainant_id_proof, v => updateField('complainant_id_proof', v), { placeholder: 'Optional' })}

            <div className="md:col-span-2">
              {renderField('Evidence Summary', modal.data.evidence_summary, v => updateField('evidence_summary', v), { rows: 2 })}
            </div>
            <div className="md:col-span-2">
              {renderField('Relief Sought', modal.data.relief_sought, v => updateField('relief_sought', v), { rows: 2 })}
            </div>
          </div>

          <div className="flex justify-end gap-3 p-5 border-t border-slate-100">
            <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving || disableSave}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-md transition disabled:opacity-50"
            >
              {saving ? 'Saving…' : modal.mode === 'edit' ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Complaint History Management</h1>
                <p className="text-sm text-slate-500">View, update, and manage all complaints</p>
              </div>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-sm hover:shadow-md transition"
            >
              <Plus size={16} /> Add Complaint
            </button>
          </div>

          {toast && (
            <div className="mb-4 flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3 text-sm font-medium">
              <CheckCircle2 size={16} /> {toast}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, complainant, respondent, type…"
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 shadow-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600"
              >
                <option value="all">All Types</option>
                {COMPLAINT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600"
              >
                <option value="all">All Status</option>
                {STATUS_CHOICES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
              <Loader2 size={20} className="animate-spin" /> Loading complaints…
            </div>
          ) : complaints.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center">
              <FileText size={36} className="mx-auto mb-3 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-700">No Complaints Found</h3>
              <p className="text-sm text-slate-400 mt-1">Try different filters or search terms</p>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map(c => (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden">
                  <div className="p-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <FileText size={18} className="text-indigo-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-800 truncate">{c.title}</h3>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                            {typeLabel(c.complaint_type)}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusPillClass(c.status)}`}>
                            {STATUS_CHOICES.find(s => s.value === c.status)?.label || c.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-slate-400">
                          <span>Complainant: <span className="text-slate-500 font-medium">{c.complainant_name || '—'}</span></span>
                          {c.respondent_name && <span>Respondent: <span className="text-slate-500 font-medium">{c.respondent_name}</span></span>}
                          <span>
                            Assigned: <span className="text-slate-500 font-medium">{c.assigned_lawyer ? (lawyerNameById.get(c.assigned_lawyer) || `Lawyer #${c.assigned_lawyer}`) : '—'}</span>
                          </span>
                          {c.created_at && (
                            <span>
                              Created: <span className="text-slate-500 font-medium">{new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-2 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                        title="Delete"
                      >
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

      {renderModal()}
    </div>
  );
}
