import React, { useEffect, useState } from 'react';
import LawyerSidebar from '../../components/LawyerSidebar';
import { apiUrl } from '../../api';
import { User as UserIcon, MapPin, Phone, Mail } from 'lucide-react';

// Lightweight UI primitives (to mirror UserProfile UI)
function Card({ children, className = '' }) { return <div className={`bg-white border border-gray-200 rounded shadow-sm ${className}`}>{children}</div>; }
function CardContent({ children, className = '' }) { return <div className={`px-6 py-5 ${className}`}>{children}</div>; }

export default function LawyerProfile() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [lawyerId, setLawyerId] = useState(null);
    const [lawyer, setLawyer] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        lname: '',
        email: '',
        phone: '',
        location: '',
        specialization: '',
        experience_years: '',
        languages: '',
        charge: '',
        bio: '',
    });

    useEffect(() => {
        async function loadProfile() {
            try {
                setLoading(true);
                setError('');
                const token = localStorage.getItem('authToken');
                const headers = token ? { Authorization: `Token ${token}` } : {};
                // Resolve lawyer id from query or storage; fallback to username search
                const params = new URLSearchParams(window.location.search);
                const qpId = params.get('id');
                const storedId = qpId
                    || localStorage.getItem('lawyer_id')
                    || localStorage.getItem('lawyerId')
                    || localStorage.getItem('lawyerID');
                const storedUsername = localStorage.getItem('lawyerUsername') || localStorage.getItem('username');
                let lawyerData = null;
                if (storedId) {
                    const res = await fetch(apiUrl(`/lawyers/${storedId}/`), { headers });
                    if (res.ok) {
                        lawyerData = await res.json();
                    } else {
                        const sres = await fetch(apiUrl(`/lawyers/?search=${encodeURIComponent(storedId)}`), { headers });
                        if (sres.ok) {
                            const data = await sres.json();
                            const arr = Array.isArray(data) ? data : (data.results || []);
                            lawyerData = arr[0] || null;
                        }
                    }
                }
                if (!lawyerData && storedUsername) {
                    const res = await fetch(apiUrl(`/lawyers/?search=${encodeURIComponent(storedUsername)}`), { headers });
                    if (res.ok) {
                        const data = await res.json();
                        const arr = Array.isArray(data) ? data : (data.results || []);
                        lawyerData = arr.find(l => String(l.username).toLowerCase() === storedUsername.toLowerCase()) || arr[0] || null;
                    }
                }
                if (!lawyerData) {
                    setError('Unable to load your profile. Please sign in again.');
                    return;
                }
                setLawyerId(lawyerData.id);
                try {
                    localStorage.setItem('lawyerId', String(lawyerData.id));
                    localStorage.setItem('lawyer_id', String(lawyerData.id));
                } catch {}
                setLawyer(lawyerData);
                setEditData({
                    lname: lawyerData.lname || '',
                    email: lawyerData.email || '',
                    phone: lawyerData.phone || '',
                    location: lawyerData.location || '',
                    specialization: lawyerData.specialization || '',
                    experience_years: lawyerData.experience_years ?? '',
                    languages: lawyerData.languages || '',
                    charge: lawyerData.charge ?? '',
                    bio: lawyerData.bio || '',
                });
            } catch (e) {
                setError(e.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);

    // Derived
    const fullName = (lawyer?.full_name || lawyer?.lname || lawyer?.name || 'Lawyer').trim();
    const email = lawyer?.email || '';
    const phone = lawyer?.phone || '';
    const location = lawyer?.location || '';
    const specialization = lawyer?.specialization || '';
    const languages = lawyer?.languages || '';
    const experienceYears = lawyer?.experience_years ?? lawyer?.experience ?? '';
    const charge = lawyer?.charge ?? lawyer?.fee ?? lawyer?.consultation_fee ?? '';

    async function saveChanges() {
        if (!lawyerId) return;
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('authToken');
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Token ${token}` } : {}),
            };
            const payload = {
                lname: editData.lname,
                email: editData.email,
                phone: editData.phone,
                location: editData.location,
                specialization: editData.specialization,
                experience_years: editData.experience_years === '' ? 0 : Number(editData.experience_years),
                languages: editData.languages,
                charge: editData.charge === '' ? 0 : Number(editData.charge),
                bio: editData.bio,
            };
            const res = await fetch(apiUrl(`/lawyers/${lawyerId}/`), {
                method: 'PATCH',
                headers,
                body: JSON.stringify(payload),
            });
            const updated = await res.json();
            if (!res.ok) {
                throw new Error(updated?.detail || 'Failed to update profile');
            }
            setLawyer(updated);
            setIsEditing(false);
        } catch (e) {
            setError(e.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex bg-gradient-subtle">
            <LawyerSidebar />
            <div className="flex-1 p-6 ">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-end mb-8">
                        <div className="flex items-center space-x-2">
                            {loading && <span className="text-sm text-gray-500">Loading…</span>}
                            {!loading && lawyer && !isEditing && (
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
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditData({
                                                lname: lawyer?.lname || '',
                                                email: lawyer?.email || '',
                                                phone: lawyer?.phone || '',
                                                location: lawyer?.location || '',
                                                specialization: lawyer?.specialization || '',
                                                experience_years: lawyer?.experience_years ?? '',
                                                languages: lawyer?.languages || '',
                                                charge: lawyer?.charge ?? '',
                                                bio: lawyer?.bio || '',
                                            });
                                        }}
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

                    {/* Single Profile Card (UI parity with UserProfile) */}
                    <Card className="shadow-custom-lg">
                        {/* Gradient header with avatar */}
                        <div className="text-center pt-8 pb-6 bg-gradient-primary">
                            <div className="relative inline-block">
                                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 overflow-hidden">
                                    <UserIcon className="h-16 w-16 text-white" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-white mt-4">{fullName}</h1>
                            <p className="text-white/80 text-sm">{specialization ? `${specialization} Lawyer` : ''}</p>
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
                                        <p className="text-sm font-medium truncate max-w-[220px]" title={location}>{location || '—'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Basic Information */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">Full Name</label>
                                            {!isEditing ? (
                                                <p className="text-sm font-medium">{lawyer?.lname || ''}</p>
                                            ) : (
                                                <input
                                                    className="w-full border rounded px-3 py-2 text-sm"
                                                    value={editData.lname}
                                                    onChange={e=>setEditData(d=>({...d,lname:e.target.value}))}
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
                                            <label className="block mb-1 text-sm font-medium">Location</label>
                                            {!isEditing ? (
                                                <p className="text-sm font-medium">{location || '—'}</p>
                                            ) : (
                                                <input
                                                    className="w-full border rounded px-3 py-2 text-sm"
                                                    value={editData.location}
                                                    onChange={e=>setEditData(d=>({...d,location:e.target.value}))}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Information */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">Specialization</label>
                                            {!isEditing ? (
                                                <p className="text-sm font-medium">{specialization || '—'}</p>
                                            ) : (
                                                <input
                                                    className="w-full border rounded px-3 py-2 text-sm"
                                                    value={editData.specialization}
                                                    onChange={e=>setEditData(d=>({...d,specialization:e.target.value}))}
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">Experience (years)</label>
                                            {!isEditing ? (
                                                <p className="text-sm font-medium">{experienceYears || '—'}</p>
                                            ) : (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-full border rounded px-3 py-2 text-sm"
                                                    value={editData.experience_years}
                                                    onChange={e=>setEditData(d=>({...d,experience_years:e.target.value}))}
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">Languages</label>
                                            {!isEditing ? (
                                                <p className="text-sm font-medium">{languages || '—'}</p>
                                            ) : (
                                                <input
                                                    className="w-full border rounded px-3 py-2 text-sm"
                                                    value={editData.languages}
                                                    onChange={e=>setEditData(d=>({...d,languages:e.target.value}))}
                                                    placeholder="Comma separated"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">Consultation Charge</label>
                                            {!isEditing ? (
                                                <p className="text-sm font-medium">{charge === '' ? '—' : (String(charge).startsWith('₹') ? charge : `₹${charge}`)}</p>
                                            ) : (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    className="w-full border rounded px-3 py-2 text-sm"
                                                    value={editData.charge}
                                                    onChange={e=>setEditData(d=>({...d,charge:e.target.value}))}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-4">About</h3>
                                    {!isEditing ? (
                                        <p className="text-sm text-gray-700 leading-relaxed">{lawyer?.bio || ''}</p>
                                    ) : (
                                        <textarea
                                            rows={4}
                                            className="w-full border rounded px-3 py-2 text-sm"
                                            value={editData.bio}
                                            onChange={e=>setEditData(d=>({...d,bio:e.target.value}))}
                                        />
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
