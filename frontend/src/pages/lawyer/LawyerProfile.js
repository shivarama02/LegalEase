import React, { useEffect, useState, useRef } from 'react';
import LawyerSidebar from '../../components/LawyerSidebar';
import { apiUrl, API_BASE } from '../../api';
import {
  Camera, User as UserIcon, MapPin, Phone, Mail, Briefcase,
  Languages, IndianRupee, Star, ShieldCheck, Pencil, X, Save, Loader2,
} from 'lucide-react';

/* ─── ProfileField (outside component to prevent remount on state change) ── */
function ProfileField({ label, type = 'text', isEditing, displayValue, value, onEdit, ...rest }) {
  return (
    <div className="flex-1">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      {!isEditing ? (
        <p className="text-sm font-medium text-slate-800">{displayValue || '—'}</p>
      ) : (
        <input
          type={type}
          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
          value={value ?? ''}
          onChange={e => onEdit(e.target.value)}
          {...rest}
        />
      )}
    </div>
  );
}

export default function LawyerProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lawyerId, setLawyerId] = useState(null);
  const [lawyer, setLawyer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [editData, setEditData] = useState({
    lname: '', email: '', phone: '', location: '',
    specialization: '', experience_years: '', languages: '', charge: '', bio: '',
  });

  const token = sessionStorage.getItem('authToken');
  const authHeaders = token ? { Authorization: `Token ${token}` } : {};

  /* ─── Load profile ─────────────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const headers = { ...authHeaders };
        const params = new URLSearchParams(window.location.search);
        const qpId = params.get('id');
        const storedId = qpId || sessionStorage.getItem('lawyer_id')
          || sessionStorage.getItem('lawyerId') || sessionStorage.getItem('lawyerID');
        const storedUsername = sessionStorage.getItem('lawyerUsername') || sessionStorage.getItem('username');

        let data = null;
        if (storedId) {
          const res = await fetch(apiUrl(`/lawyers/${storedId}/`), { headers });
          if (res.ok) data = await res.json();
          else {
            const sres = await fetch(apiUrl(`/lawyers/?search=${encodeURIComponent(storedId)}`), { headers });
            if (sres.ok) { const d = await sres.json(); data = (Array.isArray(d) ? d : d.results || [])[0] || null; }
          }
        }
        if (!data && storedUsername) {
          const res = await fetch(apiUrl(`/lawyers/?search=${encodeURIComponent(storedUsername)}`), { headers });
          if (res.ok) {
            const d = await res.json();
            const arr = Array.isArray(d) ? d : d.results || [];
            data = arr.find(l => String(l.username).toLowerCase() === storedUsername.toLowerCase()) || arr[0] || null;
          }
        }
        if (!data) { setError('Unable to load your profile. Please sign in again.'); return; }

        setLawyerId(data.id);
        try { localStorage.setItem('lawyerId', String(data.id)); localStorage.setItem('lawyer_id', String(data.id)); } catch {}
        setLawyer(data);
        populateEdit(data);
      } catch (e) { setError(e.message || 'Failed to load profile'); }
      finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function populateEdit(d) {
    setEditData({
      lname: d.lname || '', email: d.email || '', phone: d.phone || '',
      location: d.location || '', specialization: d.specialization || '',
      experience_years: d.experience_years ?? '', languages: d.languages || '',
      charge: d.charge ?? '', bio: d.bio || '',
    });
  }

  /* ─── Save profile ─────────────────────────────────────────────────── */
  async function saveChanges() {
    if (!lawyerId) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      const headers = { 'Content-Type': 'application/json', ...authHeaders };
      const payload = {
        lname: editData.lname, email: editData.email, phone: editData.phone,
        location: editData.location, specialization: editData.specialization,
        experience_years: editData.experience_years === '' ? 0 : Number(editData.experience_years),
        languages: editData.languages, charge: editData.charge === '' ? 0 : Number(editData.charge),
        bio: editData.bio,
      };
      const res = await fetch(apiUrl(`/lawyers/${lawyerId}/`), { method: 'PATCH', headers, body: JSON.stringify(payload) });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated?.detail || 'Failed to update profile');
      setLawyer(updated);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e.message || 'Update failed'); }
    finally { setSaving(false); }
  }

  /* ─── Upload photo ─────────────────────────────────────────────────── */
  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !lawyerId) return;
    setUploading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await fetch(`${API_BASE}/lawyers/${lawyerId}/upload-photo/`, {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated?.error || 'Upload failed');
      setLawyer(updated);
      setSuccess('Photo updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.message || 'Photo upload failed'); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  }

  /* ─── Derived data ─────────────────────────────────────────────────── */
  const fullName = lawyer?.full_name || lawyer?.lname || 'Lawyer';
  const photoSrc = lawyer?.photo_full_url || lawyer?.photo_url || '';
  const rating = Number(lawyer?.rating || 0);
  const reviewsCount = lawyer?.reviews_count || 0;

  const renderStars = (r) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={14} className={i <= Math.round(r) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
      ))}
    </div>
  );

  /* helper to bind a field for ProfileField */
  const f = (field) => ({
    isEditing,
    displayValue: field === 'charge'
      ? (lawyer?.[field] ? `₹${Number(lawyer[field]).toLocaleString('en-IN')}` : '—')
      : (lawyer?.[field] || '—'),
    value: editData[field],
    onEdit: v => setEditData(d => ({ ...d, [field]: v })),
  });

  /* ─── Render ───────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex bg-slate-50">
      <LawyerSidebar />
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

          {lawyer && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">

              {/* ── Cover + Avatar ────────────────────────────────────── */}
              <div className="relative h-44 md:h-52 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600">
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'1\'%3E%3Ccircle cx=\'1\' cy=\'1\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '20px 20px' }} />

                {/* Edit / Save buttons */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
                    >
                      <Pencil size={13} /> Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => { setIsEditing(false); populateEdit(lawyer); }}
                        className="flex items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-semibold px-3 py-2 rounded-xl transition"
                      >
                        <X size={13} /> Cancel
                      </button>
                      <button
                        onClick={saveChanges}
                        disabled={saving}
                        className="flex items-center gap-1 bg-white hover:bg-slate-50 text-indigo-700 text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm disabled:opacity-60"
                      >
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                    </>
                  )}
                </div>

                {/* Verified badge */}
                {lawyer.is_verified && (
                  <div className="absolute top-4 left-4 flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                    <ShieldCheck size={13} /> Verified
                  </div>
                )}

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
                    {/* Upload overlay — only in edit mode */}
                    {isEditing && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute inset-0 rounded-3xl bg-black/40 flex items-center justify-center cursor-pointer"
                      >
                        <div className="flex flex-col items-center text-white">
                          {uploading ? <Loader2 size={22} className="animate-spin" /> : <Camera size={22} />}
                          <span className="text-[10px] font-semibold mt-1">{uploading ? 'Uploading…' : 'Change Photo'}</span>
                        </div>
                      </button>
                    )}
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
                    <p className="text-lg font-semibold text-indigo-600 mt-0.5">{lawyer.specialization || 'General Practice'}</p>
                  </div>
                  {/* Mini stats */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {renderStars(rating)}
                      <span className="text-sm font-bold text-slate-800 ml-1">{rating.toFixed(1)}</span>
                      <span className="text-xs text-slate-400">({reviewsCount})</span>
                    </div>
                    <span className="hidden sm:block w-px h-5 bg-slate-200" />
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Briefcase size={13} className="text-slate-400" />
                      {lawyer.experience_years || 0} yrs
                    </div>
                    <span className="hidden sm:block w-px h-5 bg-slate-200" />
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <MapPin size={13} className="text-slate-400" />
                      {lawyer.location || '—'}
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100 mb-6" />

                {/* ── About ──────────────────────────────────────────── */}
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">About</h2>
                  {!isEditing ? (
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{lawyer.bio || 'No bio added yet.'}</p>
                  ) : (
                    <textarea
                      rows={4}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition resize-none"
                      value={editData.bio}
                      onChange={e => setEditData(d => ({ ...d, bio: e.target.value }))}
                    />
                  )}
                </div>

                <hr className="border-slate-100 mb-6" />

                {/* ── Contact Grid ────────────────────────────────────── */}
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Contact Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Mail size={15} className="text-indigo-500" />
                      </div>
                      <ProfileField label="Email" type="email" {...f('email')} />
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Phone size={15} className="text-indigo-500" />
                      </div>
                      <ProfileField label="Phone" {...f('phone')} />
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin size={15} className="text-indigo-500" />
                      </div>
                      <ProfileField label="Location" {...f('location')} />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100 mb-6" />

                {/* ── Professional Info Grid ──────────────────────────── */}
                <div>
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Professional Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <UserIcon size={15} className="text-violet-500" />
                      </div>
                      <ProfileField label="Full Name" {...f('lname')} />
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Briefcase size={15} className="text-violet-500" />
                      </div>
                      <ProfileField label="Specialization" {...f('specialization')} />
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Briefcase size={15} className="text-violet-500" />
                      </div>
                      <ProfileField label="Experience (years)" type="number" min="0" {...f('experience_years')} />
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Languages size={15} className="text-violet-500" />
                      </div>
                      <ProfileField label="Languages" placeholder="Comma separated" {...f('languages')} />
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <IndianRupee size={15} className="text-violet-500" />
                      </div>
                      <ProfileField label="Consultation Charge (₹)" type="number" min="0" step="0.01" {...f('charge')} />
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
