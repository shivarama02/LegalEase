import React, { useEffect, useMemo, useState } from 'react';
import UserSidebar from '../../components/UserSidebar';
import { Calendar, Clock, Mail, Phone, Edit, Trash2, RefreshCw } from 'lucide-react';
import { apiUrl } from '../../api';

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
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [lawyers, setLawyers] = useState([]);
  const [caseTypes, setCaseTypes] = useState([]);

  const authHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Token ${token}` } : {};
  };

  const resetForm = () => {
    setForm({ name: '', email: '', case_type: '', lawyer_type: '', appointment_date: '', appointment_time: '', notes: '' });
    setEditId(null);
  };

  async function loadAppointments() {
    try {
      setLoading(true);
      setError('');
  const res = await fetch(apiUrl('/appointments/'), { headers: { ...authHeaders() } });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : (data.results || []));
    } catch (e) {
      setError(e.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAppointments(); }, []);

  useEffect(() => {
    // Load lists for selects
    (async () => {
      try {
        const [lawRes, caseRes] = await Promise.all([
          fetch(apiUrl('/lawyers/?ordering=-rating')),
          fetch(apiUrl('/case-types/')),
        ]);
        const lawData = await lawRes.json();
        const caseData = await caseRes.json();
        setLawyers(Array.isArray(lawData) ? lawData : (lawData.results || []));
        setCaseTypes(Array.isArray(caseData) ? caseData : []);
      } catch (e) {
        // Non-fatal for page usage
        console.warn('Failed loading lists', e);
      }
    })();
  }, []);

  // Prefill from query params (e.g., case_type, lawyer_type) when navigated from a lawyer profile
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefill = {};
    ['case_type','lawyer_type','appointment_date','appointment_time','name','email','notes','lawyer'].forEach(k => {
      const v = params.get(k);
      if (v) prefill[k] = v;
    });
    if (Object.keys(prefill).length) setForm(f => ({ ...f, ...prefill }));
  }, []);

  async function submit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? apiUrl(`/appointments/${editId}/`) : apiUrl('/appointments/');
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Failed to ${editId ? 'update' : 'create'} (${res.status})`);
      resetForm();
      await loadAppointments();
    } catch (e) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function cancelAppointment(id) {
    try {
      const res = await fetch(apiUrl(`/appointments/${id}/`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!res.ok) throw new Error('Failed to cancel');
      await loadAppointments();
    } catch (e) { setError(e.message || 'Cancel failed'); }
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
    } catch (e) { setError(e.message || 'Reschedule failed'); }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <UserSidebar />
        <div className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Book an Appointment</h1>
              <p className="text-gray-500">Fill out the form to schedule a consultation.</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Your Name</label>
                  <input value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))} className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Type of Case</label>
                  <select value={form.case_type} onChange={e=>setForm(f=>({...f, case_type:e.target.value}))} className="w-full border rounded px-3 py-2" required>
                    <option value="">Select a case type</option>
                    {caseTypes.map(ct => (
                      <option key={ct.key} value={ct.label}>{ct.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Type of Lawyer</label>
                  <select value={form.lawyer_type} onChange={e=>setForm(f=>({...f, lawyer_type:e.target.value}))} className="w-full border rounded px-3 py-2" required>
                    <option value="">Select a lawyer specialization</option>
                    {[...new Set(lawyers.map(l => l.specialization).filter(Boolean))].map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Choose Lawyer (optional)</label>
                  <select value={form.lawyer || ''} onChange={e=>setForm(f=>({...f, lawyer: e.target.value || null}))} className="w-full border rounded px-3 py-2">
                    <option value="">Any best-match lawyer</option>
                    {lawyers.map(l => (
                      <option key={l.id} value={l.id}>{l.full_name || l.lname} • {l.specialization || 'General'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Date</label>
                  <input type="date" value={form.appointment_date} onChange={e=>setForm(f=>({...f, appointment_date:e.target.value}))} className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Time</label>
                  <input type="time" value={form.appointment_time} onChange={e=>setForm(f=>({...f, appointment_time:e.target.value}))} className="w-full border rounded px-3 py-2" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Notes (optional)</label>
                  <textarea value={form.notes} onChange={e=>setForm(f=>({...f, notes:e.target.value}))} className="w-full border rounded px-3 py-2" rows={3} />
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <button disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">{editId ? 'Update' : 'Book'} Appointment</button>
                  {editId && <button type="button" onClick={resetForm} className="px-3 py-2 border rounded">Cancel Edit</button>}
                  {error && <span className="text-red-600 text-sm ml-2">{error}</span>}
                </div>
              </form>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Your Appointments</h2>
              {loading ? (
                <p className="text-gray-500">Loading…</p>
              ) : (
                <div className="space-y-3">
                  {appointments.map(appt => (
                    <div key={appt.id} className="bg-white rounded-xl shadow p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600">{appt.case_type} • {appt.lawyer_type}</div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="inline-flex items-center"><Calendar className="h-4 w-4 mr-1" /> {appt.appointment_date}</span>
                            <span className="inline-flex items-center"><Clock className="h-4 w-4 mr-1" /> {appt.appointment_time}</span>
                            <span className="px-2 py-0.5 text-xs rounded bg-gray-100">{appt.status}</span>
                          </div>
                          <div className="text-sm text-gray-600">{appt.name} • {appt.email}</div>
                          {appt.notes && <div className="text-sm text-gray-500">Notes: {appt.notes}</div>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(appt)} className="px-2 py-1 border rounded flex items-center text-sm"><Edit className="h-4 w-4 mr-1" /> Edit</button>
                          <button onClick={() => cancelAppointment(appt.id)} className="px-2 py-1 border rounded flex items-center text-sm"><Trash2 className="h-4 w-4 mr-1" /> Cancel</button>
                          <button onClick={() => {
                            const newDate = prompt('New date (YYYY-MM-DD):', appt.appointment_date) || appt.appointment_date;
                            const newTime = prompt('New time (HH:MM):', appt.appointment_time) || appt.appointment_time;
                            reschedule(appt.id, newDate, newTime);
                          }} className="px-2 py-1 border rounded flex items-center text-sm"><RefreshCw className="h-4 w-4 mr-1" /> Reschedule</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {appointments.length === 0 && <p className="text-gray-500">No appointments yet.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
