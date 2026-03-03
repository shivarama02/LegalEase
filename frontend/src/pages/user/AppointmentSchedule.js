import React, { useEffect, useMemo, useState } from 'react';
import UserSidebar from '../../components/UserSidebar';
import {
  Calendar, Clock, Mail, Phone, Edit, Trash2, RefreshCw,
  CalendarPlus, Loader2, User, FileText, MapPin, Scale,
  Briefcase, Star, ChevronDown, AlertCircle, CheckCircle2,
  XCircle, RotateCcw,
} from 'lucide-react';
import { apiUrl } from '../../api';

const STATUS_COLORS = {
  scheduled: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};
const STATUS_ICONS = {
  scheduled: <Clock size={12} />,
  completed: <CheckCircle2 size={12} />,
  cancelled: <XCircle size={12} />,
};

export default function UserAppointmentSchedule() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    case_type: '',
    lawyer_type: '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
    lawyer: null,
    location: '',
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editId, setEditId] = useState(null);
  const [lawyers, setLawyers] = useState([]);
  const [caseTypes, setCaseTypes] = useState([]);

  // ── Derived filter lists ─────────────────────────────────
  const specializations = useMemo(
    () => [...new Set(lawyers.map((l) => l.specialization).filter(Boolean))].sort(),
    [lawyers]
  );
  const locations = useMemo(
    () => [...new Set(lawyers.map((l) => l.location).filter(Boolean))].sort(),
    [lawyers]
  );

  // Lawyers filtered by selected specialization + location
  const filteredLawyers = useMemo(() => {
    let list = lawyers;
    if (form.lawyer_type) list = list.filter((l) => l.specialization === form.lawyer_type);
    if (form.location) list = list.filter((l) => l.location === form.location);
    return list;
  }, [lawyers, form.lawyer_type, form.location]);

  // Same-day overlap warning
  const sameDayAppts = useMemo(() => {
    if (!form.appointment_date) return [];
    return (appointments || []).filter(
      (a) =>
        a.appointment_date === form.appointment_date &&
        (editId ? a.id !== editId : true) &&
        String(a.status || '').toLowerCase() !== 'cancelled'
    );
  }, [appointments, form.appointment_date, editId]);

  const authHeaders = () => {
    const token = sessionStorage.getItem('authToken');
    return token ? { Authorization: `Token ${token}` } : {};
  };

  const resetForm = () => {
    setForm({
      name: '', email: '', case_type: '', lawyer_type: '',
      appointment_date: '', appointment_time: '', notes: '', lawyer: null, location: '',
    });
    setEditId(null);
  };

  async function loadAppointments() {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(apiUrl('/appointments/'), { headers: { ...authHeaders() } });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      setError(e.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [lawRes, caseRes] = await Promise.all([
          fetch(apiUrl('/lawyers/?ordering=-rating')),
          fetch(apiUrl('/case-types/')),
        ]);
        const lawData = await lawRes.json();
        const caseData = await caseRes.json();
        setLawyers(Array.isArray(lawData) ? lawData : lawData.results || []);
        setCaseTypes(Array.isArray(caseData) ? caseData : []);
      } catch (e) {
        console.warn('Failed loading lists', e);
      }
    })();
  }, []);

  // Prefill from query params (from LawyerProfileView)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefill = {};
    ['case_type', 'lawyer_type', 'appointment_date', 'appointment_time', 'name', 'email', 'notes', 'lawyer', 'location'].forEach((k) => {
      const v = params.get(k);
      if (v) prefill[k] = v;
    });
    if (Object.keys(prefill).length) setForm((f) => ({ ...f, ...prefill }));
  }, []);

  // When specialization changes, clear lawyer if it no longer matches
  useEffect(() => {
    if (form.lawyer && form.lawyer_type) {
      const match = lawyers.find((l) => String(l.id) === String(form.lawyer));
      if (match && match.specialization !== form.lawyer_type) {
        setForm((f) => ({ ...f, lawyer: null }));
      }
    }
  }, [form.lawyer_type, form.lawyer, lawyers]);

  // When location changes, clear lawyer if it no longer matches
  useEffect(() => {
    if (form.lawyer && form.location) {
      const match = lawyers.find((l) => String(l.id) === String(form.lawyer));
      if (match && match.location !== form.location) {
        setForm((f) => ({ ...f, lawyer: null }));
      }
    }
  }, [form.location, form.lawyer, lawyers]);

  async function submit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      if (sameDayAppts.length > 0) {
        const times = sameDayAppts.map((a) => a.appointment_time || '(time not set)').join(', ');
        const proceed = window.confirm(
          `You already have ${sameDayAppts.length} appointment(s) on ${form.appointment_date} (${times}).\nDo you want to proceed anyway?`
        );
        if (!proceed) {
          setSaving(false);
          return;
        }
      }
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? apiUrl(`/appointments/${editId}/`) : apiUrl('/appointments/');
      // Send only fields the backend expects
      const { location: _loc, ...payload } = form;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Failed to ${editId ? 'update' : 'create'} (${res.status})`);
      setSuccess(editId ? 'Appointment updated successfully!' : 'Appointment booked successfully!');
      resetForm();
      await loadAppointments();
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function cancelAppointment(id) {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      const res = await fetch(apiUrl(`/appointments/${id}/`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!res.ok) throw new Error('Failed to cancel');
      await loadAppointments();
    } catch (e) {
      setError(e.message || 'Cancel failed');
    }
  }

  function startEdit(appt) {
    setEditId(appt.id);
    setForm({
      name: appt.name || '',
      email: appt.email || '',
      case_type: appt.case_type || '',
      lawyer_type: appt.lawyer_type || '',
      appointment_date: appt.appointment_date || '',
      appointment_time: appt.appointment_time || '',
      notes: appt.notes || '',
      lawyer: appt.lawyer || null,
      location: '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function reschedule(id, newDate, newTime) {
    try {
      const res = await fetch(apiUrl(`/appointments/${id}/`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ appointment_date: newDate, appointment_time: newTime, status: 'scheduled' }),
      });
      if (!res.ok) throw new Error('Failed to reschedule');
      await loadAppointments();
    } catch (e) {
      setError(e.message || 'Reschedule failed');
    }
  }

  const renderStars = (rating) => {
    const r = Number(rating || 0);
    return (
      <span className="inline-flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={11} className={i <= Math.round(r) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
        ))}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <UserSidebar />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* ── Header ───────────────────────────────────────────────── */}
                <div className="text-left">
                  <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                      <CalendarPlus size={18} className="text-white" />
                    </div>
                    {editId ? 'Update Appointment' : 'Book an Appointment'}
                  </h1>

                  <p className="text-slate-500 text-sm mt-1 ml-[52px]">
                    Fill out the form to schedule a consultation with a lawyer.
                  </p>
                </div>

            {/* ── Alerts ───────────────────────────────────────────────── */}
            {success && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-2xl">
                <CheckCircle2 size={16} /> {success}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-2xl">
                <AlertCircle size={16} /> {error}
                <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600"><XCircle size={14} /></button>
              </div>
            )}

            {/* ── Form Card ────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/60 to-violet-50/60">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <FileText size={16} className="text-indigo-500" />
                  Appointment Details
                </h2>
              </div>

              <form onSubmit={submit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Name */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      <User size={12} /> Your Name
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      <Mail size={12} /> Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  {/* Type of Case */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      <FileText size={12} /> Type of Case
                    </label>
                    <div className="relative">
                      <select
                        value={form.case_type}
                        onChange={(e) => setForm((f) => ({ ...f, case_type: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none appearance-none transition"
                        required
                      >
                        <option value="">Select a case type</option>
                        {caseTypes.map((ct) => (
                          <option key={ct.key} value={ct.label}>{ct.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Type of Lawyer (Specialization) */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      <Scale size={12} /> Type of Lawyer
                    </label>
                    <div className="relative">
                      <select
                        value={form.lawyer_type}
                        onChange={(e) => setForm((f) => ({ ...f, lawyer_type: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none appearance-none transition"
                        required
                      >
                        <option value="">Select a specialization</option>
                        {specializations.map((spec) => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      <MapPin size={12} /> Location
                    </label>
                    <div className="relative">
                      <select
                        value={form.location}
                        onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none appearance-none transition"
                      >
                        <option value="">Any location</option>
                        {locations.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Choose Lawyer — only visible after both specialization + location are selected */}
                  {form.lawyer_type && form.location ? (
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        <Briefcase size={12} /> Choose Lawyer
                        <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span>
                        <span className="ml-auto text-[11px] text-indigo-500 font-medium normal-case tracking-normal">
                          {filteredLawyers.length} lawyer{filteredLawyers.length !== 1 ? 's' : ''} found
                        </span>
                      </label>
                      {filteredLawyers.length === 0 ? (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-4 py-3 rounded-xl">
                          <AlertCircle size={14} />
                          No lawyers found for <strong>{form.lawyer_type}</strong> in <strong>{form.location}</strong>. Try changing the filters.
                        </div>
                      ) : (
                        <>
                          <div className="relative">
                            <select
                              value={form.lawyer || ''}
                              onChange={(e) => setForm((f) => ({ ...f, lawyer: e.target.value || null }))}
                              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none appearance-none transition"
                            >
                              <option value="">Any best-match lawyer</option>
                              {filteredLawyers.map((l) => (
                                <option key={l.id} value={l.id}>
                                  {l.full_name || l.lname} — {l.specialization || 'General'} • {l.location || '—'}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          </div>
                          {form.lawyer && (() => {
                            const sel = lawyers.find((l) => String(l.id) === String(form.lawyer));
                            if (!sel) return null;
                            return (
                              <div className="mt-2 flex items-center gap-3 bg-indigo-50/60 border border-indigo-100 rounded-xl px-3 py-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                  {(sel.full_name || sel.lname || '?').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-800 truncate">{sel.full_name || sel.lname}</p>
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>{sel.specialization}</span>
                                    <span>•</span>
                                    <span>{sel.location || '—'}</span>
                                    <span>•</span>
                                    {renderStars(sel.rating)}
                                    <span className="font-medium text-slate-700">{Number(sel.rating || 0).toFixed(1)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        <Briefcase size={12} /> Choose Lawyer
                        <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span>
                      </label>
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 border-dashed text-slate-400 text-xs px-4 py-3 rounded-xl h-[42px]">
                        <Briefcase size={13} className="flex-shrink-0" />
                        Select specialization &amp; location first.
                      </div>
                    </div>
                  )}

                  {/* Date */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      <Calendar size={12} /> Date
                    </label>
                    <input
                      type="date"
                      value={form.appointment_date}
                      onChange={(e) => setForm((f) => ({ ...f, appointment_date: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition"
                      required
                    />
                    {sameDayAppts.length > 0 && (
                      <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                        <AlertCircle size={11} /> You already have {sameDayAppts.length} appointment(s) on this date.
                      </p>
                    )}
                  </div>

                  {/* Time */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      <Clock size={12} /> Time
                    </label>
                    <div className="relative">
                      <select
                        value={form.appointment_time}
                        onChange={(e) => setForm((f) => ({ ...f, appointment_time: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none appearance-none transition"
                        required
                      >
                        <option value="">Select a time slot</option>
                        {Array.from({ length: 21 }, (_, i) => {
                          const totalMins = 9 * 60 + i * 30;
                          const h = Math.floor(totalMins / 60);
                          const m = totalMins % 60;
                          const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                          const period = h < 12 ? 'AM' : 'PM';
                          const h12 = h % 12 === 0 ? 12 : h % 12;
                          const label = `${h12}:${String(m).padStart(2, '0')} ${period}`;
                          return <option key={value} value={value}>{label}</option>;
                        })}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      <FileText size={12} /> Notes
                      <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span>
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition resize-none"
                      rows={3}
                      placeholder="Briefly describe your case or any additional info…"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100">
                  <button
                    disabled={saving}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6 py-2.5 rounded-2xl font-semibold transition shadow-lg shadow-indigo-100 text-sm disabled:opacity-60"
                  >
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <CalendarPlus size={15} />}
                    {editId ? 'Update Appointment' : 'Book Appointment'}
                  </button>
                  {editId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-5 py-2.5 border-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl text-sm font-semibold transition"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* ── Appointments List ────────────────────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-indigo-500" />
                Your Appointments
                {appointments.length > 0 && (
                  <span className="ml-1 text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{appointments.length}</span>
                )}
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm">Loading appointments…</span>
                </div>
              ) : appointments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                  <Calendar size={32} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 text-sm">No appointments yet. Book your first consultation above!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appt) => {
                    const statusKey = String(appt.status || '').toLowerCase();
                    const colorCls = STATUS_COLORS[statusKey] || STATUS_COLORS.scheduled;
                    const icon = STATUS_ICONS[statusKey] || STATUS_ICONS.scheduled;
                    return (
                      <div
                        key={appt.id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition p-5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          {/* Left Info */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-slate-800">{appt.case_type}</span>
                              <span className="text-slate-300">·</span>
                              <span className="text-sm text-indigo-600 font-medium">{appt.lawyer_type}</span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-lg border ${colorCls}`}>
                                {icon} {appt.status}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1">
                                <Calendar size={12} className="text-slate-400" /> {appt.appointment_date}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock size={12} className="text-slate-400" /> {appt.appointment_time}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <User size={12} className="text-slate-400" /> {appt.name}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Mail size={12} className="text-slate-400" /> {appt.email}
                              </span>
                            </div>

                            {appt.lawyer_name && (
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Briefcase size={12} className="text-slate-400" />
                                <span>Lawyer: <strong className="text-slate-700">{appt.lawyer_name}</strong></span>
                                {appt.lawyer_specialization && (
                                  <span className="text-slate-400">({appt.lawyer_specialization})</span>
                                )}
                              </div>
                            )}

                            {appt.notes && (
                              <p className="text-xs text-slate-400 italic truncate">
                                Notes: {appt.notes}
                              </p>
                            )}
                          </div>

                          {/* Right Actions */}
                          {statusKey !== 'cancelled' && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => startEdit(appt)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition"
                              >
                                <Edit size={12} /> Edit
                              </button>
                              <button
                                onClick={() => {
                                  const newDate = prompt('New date (YYYY-MM-DD):', appt.appointment_date) || appt.appointment_date;
                                  const newTime = prompt('New time (HH:MM):', appt.appointment_time) || appt.appointment_time;
                                  reschedule(appt.id, newDate, newTime);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-xl text-indigo-600 hover:bg-indigo-50 transition"
                              >
                                <RotateCcw size={12} /> Reschedule
                              </button>
                              <button
                                onClick={() => cancelAppointment(appt.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-red-200 rounded-xl text-red-500 hover:bg-red-50 transition"
                              >
                                <Trash2 size={12} /> Cancel
                              </button>
                            </div>
                          )}
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
    </div>
  );
}
