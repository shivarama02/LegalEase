import React, { useEffect, useState, useRef } from 'react';
import UserSidebar from '../../components/UserSidebar';
import { apiUrl, API_BASE } from '../../api';
import {
  Camera, User as UserIcon, MapPin, Phone, Mail, Calendar,
  ShieldCheck, Pencil, X, Save, Loader2,
} from 'lucide-react';

export default function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [client, setClient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [editData, setEditData] = useState({
    cname: '', email: '', phone: '', dob: '', address: '',
  });

  const token = sessionStorage.getItem('authToken');
  const authHeaders = token ? { Authorization: `Token ${token}` } : {};

  /* ─── Load profile ─────────────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError('');
        const res = await fetch(apiUrl('/clients/'), { headers: authHeaders });
        if (!res.ok) throw new Error('Failed to load user profile');
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data.results || []);
        const me = arr[0] || null;
        if (!me) throw new Error('Profile not found');
        setClient(me);
        populateEdit(me);
      } catch (e) { setError(e.message || 'Failed to load profile'); }
      finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function populateEdit(d) {
    setEditData({
      cname: d.cname || '', email: d.email || '', phone: d.phone || '',
      dob: d.dob || '', address: d.address || '',
    });
  }

  /* ─── Save profile ─────────────────────────────────────────────────── */
  async function saveChanges() {
    if (!client?.id) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      const headers = { 'Content-Type': 'application/json', ...authHeaders };
      const payload = {
        cname: editData.cname, email: editData.email, phone: editData.phone,
        dob: editData.dob || null, address: editData.address,
      };
      const res = await fetch(apiUrl(`/clients/${client.id}/`), { method: 'PATCH', headers, body: JSON.stringify(payload) });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated?.detail || 'Failed to update profile');
      setClient(updated);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e.message || 'Update failed'); }
    finally { setSaving(false); }
  }

  /* ─── Upload photo ─────────────────────────────────────────────────── */
  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !client?.id) return;
    setUploading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await fetch(`${API_BASE}/clients/${client.id}/upload-photo/`, {
        method: 'POST', headers: authHeaders, body: formData,
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated?.error || 'Upload failed');
      setClient(updated);
      setSuccess('Photo updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.message || 'Photo upload failed'); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  }

  /* ─── Derived data ─────────────────────────────────────────────────── */
  const fullName = client?.cname || client?.username || 'User';
  const photoSrc = client?.photo_full_url || '';

  /* ─── Field helper ─────────────────────────────────────────────────── */
  const Field = ({ label, field, type = 'text', ...rest }) => (
    <div className="flex-1">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      {!isEditing ? (
        <p className="text-sm font-medium text-slate-800">{client?.[field] || '—'}</p>
      ) : (
        <input
          type={type}
          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
          value={editData[field]}
          onChange={e => setEditData(d => ({ ...d, [field]: e.target.value }))}
          {...rest}
        />
      )}
    </div>
  );

  /* ─── Render ───────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex bg-slate-50">
      <UserSidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">

          {/* Toast Messages */}
          {success && (
            <div className="mb-4 flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3 text-sm font-medium animate-fade-in">
              <ShieldCheck size={16} /> {success}
            </div>
          )}
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">{error}</div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
              <Loader2 size={20} className="animate-spin" /> Loading…
            </div>
          )}

          {client && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">

              {/* ── Cover + Avatar ────────────────────────────────────── */}
              <div className="relative h-44 md:h-52 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'1\'%3E%3Ccircle cx=\'1\' cy=\'1\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '20px 20px' }} />

                {/* Edit / Save buttons */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-xl transition">
                      <Pencil size={13} /> Edit Profile
                    </button>
                  ) : (
                    <>
                      <button onClick={() => { setIsEditing(false); populateEdit(client); }}
                        className="flex items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-semibold px-3 py-2 rounded-xl transition">
                        <X size={13} /> Cancel
                      </button>
                      <button onClick={saveChanges} disabled={saving}
                        className="flex items-center gap-1 bg-white hover:bg-slate-50 text-indigo-700 text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm disabled:opacity-60">
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                    </>
                  )}
                </div>

                {/* Avatar */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl border-4 border-white bg-white shadow-xl overflow-hidden flex items-center justify-center">
                      {photoSrc ? (
                        <img src={photoSrc} alt={fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                          <UserIcon className="w-14 h-14 text-indigo-300" />
                        </div>
                      )}
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                      className="absolute inset-0 rounded-3xl bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all cursor-pointer">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center text-white">
                        {uploading ? <Loader2 size={22} className="animate-spin" /> : <Camera size={22} />}
                        <span className="text-[10px] font-semibold mt-1">{uploading ? 'Uploading…' : 'Change Photo'}</span>
                      </div>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </div>
                </div>
              </div>

              {/* ── Body ──────────────────────────────────────────────── */}
              <div className="pt-20 md:pt-6 md:pl-48 px-6 md:px-8 pb-8">

                {/* Name row */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-6">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{fullName}</h1>
                    <p className="text-sm text-slate-500 mt-0.5">@{client.username}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap text-sm text-slate-600">
                    {client.email && (
                      <div className="flex items-center gap-1">
                        <Mail size={13} className="text-slate-400" /> {client.email}
                      </div>
                    )}
                    {client.phone && (
                      <>
                        <span className="hidden sm:block w-px h-5 bg-slate-200" />
                        <div className="flex items-center gap-1">
                          <Phone size={13} className="text-slate-400" /> {client.phone}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <hr className="border-slate-100 mb-6" />

                {/* ── Personal Info ───────────────────────────────────── */}
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <UserIcon size={15} className="text-indigo-500" />
                      </div>
                      <Field label="Full Name" field="cname" />
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Mail size={15} className="text-indigo-500" />
                      </div>
                      <Field label="Email" field="email" type="email" />
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Phone size={15} className="text-indigo-500" />
                      </div>
                      <Field label="Phone" field="phone" />
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Calendar size={15} className="text-indigo-500" />
                      </div>
                      <Field label="Date of Birth" field="dob" type="date" />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100 mb-6" />

                {/* ── Address ─────────────────────────────────────────── */}
                <div>
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Address</h2>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin size={15} className="text-violet-500" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Address</label>
                      {!isEditing ? (
                        <p className="text-sm font-medium text-slate-800 whitespace-pre-line">{client?.address || '—'}</p>
                      ) : (
                        <textarea rows={3}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition resize-none"
                          value={editData.address}
                          onChange={e => setEditData(d => ({ ...d, address: e.target.value }))}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
