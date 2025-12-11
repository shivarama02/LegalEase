import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import { apiUrl } from '../../api';
import { ArrowLeft, User as UserIcon, MapPin, Phone, Mail } from 'lucide-react';

// Lightweight UI primitives (to mirror the referenced UI components)
function Card({ children, className = '' }) { return <div className={`bg-white border border-gray-200 rounded shadow-sm ${className}`}>{children}</div>; }
function CardHeader({ children, className = '' }) { return <div className={`px-6 pt-5 pb-3 border-b border-gray-200 ${className}`}>{children}</div>; }
function CardTitle({ children, className = '' }) { return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>; }
function CardContent({ children, className = '' }) { return <div className={`px-6 py-5 ${className}`}>{children}</div>; }

export default function UserProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [client, setClient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    cname: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    photo_url: '',
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadMe() {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Token ${token}` } : {};
        const res = await fetch(apiUrl('/clients/'), { headers });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || 'Failed to load user profile');
        }
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data.results || []);
        const me = arr[0] || null;
        if (!me) {
          throw new Error('Profile not found for the current user');
        }
        setClient(me);
        setEditData({
          cname: me.cname || me.username || '',
          email: me.email || '',
          phone: me.phone || '',
          dob: me.dob || '',
          address: me.address || '',
        });
      } catch (e) {
        setError(e.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    }
    loadMe();
  }, []);

  const fullName = client?.cname || client?.username || 'User';
  const email = client?.email || '';
  const phone = client?.phone || '';
  const dob = client?.dob || '';
  const address = client?.address || '';
  const photoUrl = (isEditing ? (photoPreview || editData.photo_url) : (client?.photo_url || '')) || '';

  async function saveChanges() {
    if (!client?.id) return;
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Token ${token}` } : {}),
      };
      const payload = {
        cname: editData.cname,
        email: editData.email,
        phone: editData.phone,
        dob: editData.dob || null,
        address: editData.address,
      };
      const res = await fetch(apiUrl(`/clients/${client.id}/`), {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });
      const updated = await res.json();
      if (!res.ok) {
        throw new Error(updated?.detail || 'Failed to update profile');
      }
      setClient(updated);
      setIsEditing(false);
      setPhotoPreview('');
    } catch (e) {
      setError(e.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  }

  function onPickPhoto() {
    fileInputRef.current?.click();
  }

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Preview locally (not persisted). Saving requires a public URL (photo_url).
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }

  return (
    <div className="min-h-screen flex bg-gradient-subtle">
      <UserSidebar />
      <div className="flex-1 p-6 ">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-end mb-8">
            
            <div className="flex items-center space-x-2">
              {loading && <span className="text-sm text-gray-500">Loading…</span>}
              {!loading && client && !isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-medium shadow"
                >
                  Edit Profile
                </button>
              )}
              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setPhotoPreview(''); setEditData({
                      cname: client?.cname || client?.username || '',
                      email: client?.email || '',
                      phone: client?.phone || '',
                      dob: client?.dob || '',
                      address: client?.address || '',
                    }); }}
                    className="px-4 py-2 border rounded text-sm bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveChanges}
                    className="inline-flex items-center px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-medium shadow"
                  >
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>

          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

          {/* Single Profile Card (Personal Info only) */}
          <Card className="shadow-custom-lg">
            {/* Profile Picture Section */}
            <div className="text-center pt-8 pb-6 bg-gradient-primary">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 overflow-hidden">
                  {photoUrl ? (
                    <img src={photoUrl} alt={fullName} className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-16 w-16 text-white" />
                  )}
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={onPickPhoto}
                    className="absolute bottom-2 right-2 rounded-full bg-white/20 hover:bg-white/30 w-10 h-10 p-0 flex items-center justify-center"
                    title="Upload photo (preview only)"
                  >
                    {/* Camera icon */}
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h4l2-3h6l2 3h4v12H3z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              </div>
              <h1 className="text-3xl font-bold text-white mt-4">{fullName}</h1>
              {/* Occupation omitted since we're focusing on personal information */}
              
            </div>

            <CardContent className="p-8">
              {/* Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 pb-6 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium break-all">{email || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{phone || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium truncate max-w-[220px]" title={address}>{address || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Personal Information (read-only) */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Full Name</label>
                      {!isEditing ? (
                        <p className="text-sm font-medium">{fullName}</p>
                      ) : (
                        <input
                          className="w-full border rounded px-3 py-2 text-sm"
                          value={editData.cname}
                          onChange={e=>setEditData(d=>({...d,cname:e.target.value}))}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Email Address</label>
                      {!isEditing ? (
                        <p className="text-sm font-medium break-all">{email || '—'}</p>
                      ) : (
                        <input
                          type="email"
                          className="w-full border rounded px-3 py-2 text-sm"
                          value={editData.email}
                          onChange={e=>setEditData(d=>({...d,email:e.target.value}))}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Phone Number</label>
                      {!isEditing ? (
                        <p className="text-sm font-medium">{phone || '—'}</p>
                      ) : (
                        <input
                          className="w-full border rounded px-3 py-2 text-sm"
                          value={editData.phone}
                          onChange={e=>setEditData(d=>({...d,phone:e.target.value}))}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Date of Birth</label>
                      {!isEditing ? (
                        <p className="text-sm font-medium">{dob || '—'}</p>
                      ) : (
                        <input
                          type="date"
                          className="w-full border rounded px-3 py-2 text-sm"
                          value={editData.dob || ''}
                          onChange={e=>setEditData(d=>({...d,dob:e.target.value}))}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Address Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Address</label>
                      {!isEditing ? (
                        <p className="text-sm font-medium whitespace-pre-line">{address || '—'}</p>
                      ) : (
                        <textarea
                          rows={3}
                          className="w-full border rounded px-3 py-2 text-sm"
                          value={editData.address}
                          onChange={e=>setEditData(d=>({...d,address:e.target.value}))}
                        />
                      )}
                    </div>
                    {/* City/State/PIN omitted due to unavailable fields in current profile */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
