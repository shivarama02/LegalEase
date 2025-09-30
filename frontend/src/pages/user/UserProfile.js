import React, { useEffect, useState } from 'react';
import UserSidebar from '../../components/UserSidebar';
import { apiUrl } from '../../api';
import { User as UserIcon, MapPin, Phone, Mail, Edit, Save } from 'lucide-react';

// Lightweight UI primitives
function Card({ children, className = '' }) { return <div className={`bg-white border border-gray-200 rounded shadow-sm ${className}`}>{children}</div>; }
function CardHeader({ children, className = '' }) { return <div className={`px-6 pt-5 pb-3 border-b border-gray-200 ${className}`}>{children}</div>; }
function CardTitle({ children, className = '' }) { return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>; }
function CardContent({ children, className = '' }) { return <div className={`px-6 py-5 ${className}`}>{children}</div>; }

export default function UserProfile() {
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
  });

  useEffect(() => {
    async function loadMe() {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Token ${token}` } : {};
        // Backend ClientViewSet is filtered to the authenticated user, so GET /clients/ returns one item
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
          cname: me.cname || '',
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
        dob: editData.dob || null, // allow clearing
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
    } catch (e) {
      setError(e.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  }

  const username = client?.username || '';
  const email = client?.email || '';
  const phone = client?.phone || '';
  const address = client?.address || '';

  return (
    <div className="min-h-screen flex bg-gradient-subtle">
      <UserSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            </div>
            <div className="flex items-center space-x-2">
              {loading && <span className="text-sm text-gray-500 mr-2">Loading…</span>}
              {!loading && !error && client && !isEditing && (
                <button onClick={() => setIsEditing(true)} className="inline-flex items-center px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-medium shadow">
                  <Edit className="h-4 w-4 mr-2" /> Edit Profile
                </button>
              )}
              {isEditing && (
                <>
                  <button onClick={() => { setEditData({
                    cname: client?.cname || '',
                    email: client?.email || '',
                    phone: client?.phone || '',
                    dob: client?.dob || '',
                    address: client?.address || '',
                  }); setIsEditing(false); }} className="px-4 py-2 border rounded text-sm bg-white hover:bg-gray-50">Cancel</button>
                  <button onClick={saveChanges} className="inline-flex items-center px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-medium shadow">
                    <Save className="h-4 w-4 mr-2" /> Save Changes
                  </button>
                </>
              )}
            </div>
          </div>

          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="shadow-custom-lg mb-6">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-center">
                  <CardTitle className="text-2xl text-white">{client?.cname || 'User'}</CardTitle>
                  <div className="flex items-center justify-center space-x-1 mt-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{address}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-indigo-600" />
                      <span>{email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-indigo-600" />
                      <span>{phone}</span>
                    </div>
                    {username && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium px-2 py-1 rounded bg-gray-50 text-gray-600 border border-gray-200">@{username}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="shadow-custom-md">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Full Name</label>
                      {!isEditing ? (
                        <p className="text-sm font-medium">{client?.cname || ''}</p>
                      ) : (
                        <input className="w-full border rounded px-3 py-2 text-sm" value={editData.cname} onChange={e=>setEditData(d=>({...d,cname:e.target.value}))} />
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Email</label>
                      {!isEditing ? (
                        <p className="text-sm font-medium">{email}</p>
                      ) : (
                        <input type="email" className="w-full border rounded px-3 py-2 text-sm" value={editData.email} onChange={e=>setEditData(d=>({...d,email:e.target.value}))} />
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Phone</label>
                      {!isEditing ? (
                        <p className="text-sm font-medium">{phone}</p>
                      ) : (
                        <input className="w-full border rounded px-3 py-2 text-sm" value={editData.phone} onChange={e=>setEditData(d=>({...d,phone:e.target.value}))} />
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Date of Birth</label>
                      {!isEditing ? (
                        <p className="text-sm font-medium">{client?.dob || ''}</p>
                      ) : (
                        <input type="date" className="w-full border rounded px-3 py-2 text-sm" value={editData.dob || ''} onChange={e=>setEditData(d=>({...d,dob:e.target.value}))} />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">Address</label>
                    {!isEditing ? (
                      <p className="text-sm font-medium whitespace-pre-line">{address}</p>
                    ) : (
                      <textarea rows={3} className="w-full border rounded px-3 py-2 text-sm" value={editData.address} onChange={e=>setEditData(d=>({...d,address:e.target.value}))} />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
