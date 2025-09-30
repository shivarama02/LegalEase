import React, { useEffect, useState } from 'react';
import LawyerSidebar from '../../components/LawyerSidebar';
import { apiUrl } from '../../api';
import { User as UserIcon, MapPin, Phone, Mail, Star, Edit, Save } from 'lucide-react';

// Lightweight UI primitives (mirroring the structure of the provided TypeScript code)
function Card({ children, className = '' }) { return <div className={`bg-white border border-gray-200 rounded shadow-sm ${className}`}>{children}</div>; }
function CardHeader({ children, className = '' }) { return <div className={`px-6 pt-5 pb-3 border-b border-gray-200 ${className}`}>{children}</div>; }
function CardTitle({ children, className = '' }) { return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>; }
function CardContent({ children, className = '' }) { return <div className={`px-6 py-5 ${className}`}>{children}</div>; }

export default function UserProfile() {
    // Load lawyer profile from backend, show only DB-backed fields
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [lawyerId, setLawyerId] = useState(null);
    const [lawyer, setLawyer] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        lname: '',
        email: '',
        phone: '',
        specialization: '',
        experience_years: '',
        location: '',
        charge: '',
        rating: '',
        reviews_count: '',
        languages: '',
        bio: '',
    });

    useEffect(() => {
        async function loadProfile() {
            try {
                setLoading(true);
                setError('');
                const token = localStorage.getItem('authToken');
                const headers = token ? { Authorization: `Token ${token}` } : {};
                // Try to resolve lawyer id
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
                        // If ID lookup fails (e.g., storedId is an alphanumeric code), try search
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
                        // prefer exact username match if available
                        lawyerData = arr.find(l => String(l.username).toLowerCase() === storedUsername.toLowerCase()) || arr[0] || null;
                    }
                }
                if (!lawyerData) {
                    setError('Unable to load your profile. Please sign in again.');
                    return;
                }
                setLawyerId(lawyerData.id);
                // Persist standardized keys for future lookups
                try {
                    localStorage.setItem('lawyerId', String(lawyerData.id));
                    localStorage.setItem('lawyer_id', String(lawyerData.id));
                } catch {}
                setLawyer(lawyerData);
                // prime edit data
                setEditData({
                    lname: lawyerData.lname || '',
                    email: lawyerData.email || '',
                    phone: lawyerData.phone || '',
                    specialization: lawyerData.specialization || '',
                    experience_years: lawyerData.experience_years ?? '',
                    location: lawyerData.location || '',
                    charge: lawyerData.charge ?? '',
                    rating: lawyerData.rating ?? '',
                    reviews_count: lawyerData.reviews_count ?? '',
                    languages: lawyerData.languages || '',
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

    // Derived helpers from DB fields
    const fullName = (lawyer?.full_name || lawyer?.lname || lawyer?.name || '').trim();
    const specialization = lawyer?.specialization || '';
    const location = lawyer?.location || '';
    const email = lawyer?.email || '';
    const phone = lawyer?.phone || '';
    const bio = lawyer?.bio || '';
    const languages = lawyer?.languages || '';
    const experienceYears = lawyer?.experience || lawyer?.experience_years || '';
    const rating = lawyer?.rating || '';
    const fee = lawyer?.fee || lawyer?.consultation_fee || '';
    const verified = lawyer?.verified;
    const username = lawyer?.username || '';
    const feeDisplay = fee === '' ? '' : (String(fee).startsWith('₹') ? fee : `₹${fee}`);

    // Helpers for dynamic details
    function titleCase(s = '') {
        return s
            .replace(/_/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .map(w => w ? w[0].toUpperCase() + w.slice(1) : w)
            .join(' ');
    }
    const displayedKeys = new Set([
        'id','full_name','lname','name','username','email','phone','specialization','location','bio','languages',
        'experience','experience_years','rating','fee','consultation_fee','verified'
    ]);

    return (
        <div className="min-h-screen flex bg-gradient-subtle">
            <LawyerSidebar />
            <div className="flex-1 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            
                            <div className="flex items-center space-x-2">
                                <UserIcon className="h-8 w-8 text-indigo-600" />
                                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {loading && <span className="text-sm text-gray-500 mr-2">Loading…</span>}
                            {!loading && !error && lawyer && !isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex items-center px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-medium shadow"
                                >
                                    <Edit className="h-4 w-4 mr-2" /> Edit Profile
                                </button>
                            )}
                            {!loading && isEditing && (
                                <>
                                    <button
                                        onClick={() => {
                                            // reset edits to current lawyer data
                                            setEditData({
                                                lname: lawyer?.lname || '',
                                                email: lawyer?.email || '',
                                                phone: lawyer?.phone || '',
                                                specialization: lawyer?.specialization || '',
                                                experience_years: lawyer?.experience_years ?? '',
                                                location: lawyer?.location || '',
                                                charge: lawyer?.charge ?? '',
                                                rating: lawyer?.rating ?? '',
                                                reviews_count: lawyer?.reviews_count ?? '',
                                                languages: lawyer?.languages || '',
                                                bio: lawyer?.bio || '',
                                            });
                                            setIsEditing(false);
                                        }}
                                        className="px-4 py-2 border rounded text-sm bg-white hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
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
                                                    specialization: editData.specialization,
                                                    experience_years: editData.experience_years === '' ? 0 : Number(editData.experience_years),
                                                    location: editData.location,
                                                    charge: editData.charge === '' ? 0 : Number(editData.charge),
                                                    rating: editData.rating === '' ? 0 : Number(editData.rating),
                                                    reviews_count: editData.reviews_count === '' ? 0 : Number(editData.reviews_count),
                                                    languages: editData.languages,
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
                                                // refresh derived
                                            } catch (err) {
                                                setError(err.message || 'Update failed');
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="inline-flex items-center px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-medium shadow"
                                    >
                                        <Save className="h-4 w-4 mr-2" /> Save Changes
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    {error && (
                        <div className="mb-4 text-sm text-red-600">{error}</div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Overview */}
                        <div className="lg:col-span-1">
                            <Card className="shadow-custom-lg mb-6">
                                <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-center">
                                    <div className="relative mx-auto mb-4">
                                        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                                            <UserIcon className="h-12 w-12 text-white" />
                                        </div>
                                    </div>
                                    <CardTitle className="text-2xl text-white">{fullName || 'Lawyer'}</CardTitle>
                                    <p className="text-white/80 text-sm">{specialization ? `${specialization} Lawyer` : ''}</p>
                                    <div className="flex items-center justify-center space-x-1 mt-2 text-sm">
                                        <MapPin className="h-4 w-4" />
                                        <span>{location}</span>
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
                                        {typeof verified !== 'undefined' && (
                                            <div className="flex items-center space-x-2">
                                                <span className={`text-xs font-medium px-2 py-1 rounded ${verified ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                                                    {verified ? 'Verified' : 'Not Verified'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Details */}
                        <div className="lg:col-span-2">
                            <Card className="shadow-custom-md">
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="text-base font-semibold mb-2">About</h3>
                                        {!isEditing ? (
                                            <p className="text-sm text-gray-700 leading-relaxed">{bio || ''}</p>
                                        ) : (
                                            <textarea
                                                className="w-full border rounded px-3 py-2 text-sm"
                                                rows={4}
                                                value={editData.bio}
                                                onChange={e => setEditData(d => ({ ...d, bio: e.target.value }))}
                                            />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-3 border rounded">
                                            <p className="text-xs text-gray-500">Full Name</p>
                                            {!isEditing ? (
                                                <p className="text-sm font-medium">{lawyer?.lname || ''}</p>
                                            ) : (
                                                <input className="w-full border rounded px-3 py-2 text-sm" value={editData.lname} onChange={e=>setEditData(d=>({...d,lname:e.target.value}))} />
                                            )}
                                        </div>
                                        <div className="p-3 border rounded">
                                            <p className="text-xs text-gray-500">Email</p>
                                            {!isEditing ? (
                                                <p className="text-sm font-medium">{email}</p>
                                            ) : (
                                                <input type="email" className="w-full border rounded px-3 py-2 text-sm" value={editData.email} onChange={e=>setEditData(d=>({...d,email:e.target.value}))} />
                                            )}
                                        </div>
                                        <div className="p-3 border rounded">
                                            <p className="text-xs text-gray-500">Phone</p>
                                            {!isEditing ? (
                                                <p className="text-sm font-medium">{phone}</p>
                                            ) : (
                                                <input className="w-full border rounded px-3 py-2 text-sm" value={editData.phone} onChange={e=>setEditData(d=>({...d,phone:e.target.value}))} />
                                            )}
                                        </div>
                                        <div className="p-3 border rounded">
                                            <p className="text-xs text-gray-500">Specialization</p>
                                            {!isEditing ? (
                                                <p className="text-sm font-medium">{specialization}</p>
                                            ) : (
                                                <input className="w-full border rounded px-3 py-2 text-sm" value={editData.specialization} onChange={e=>setEditData(d=>({...d,specialization:e.target.value}))} />
                                            )}
                                        </div>
                                        <div className="p-3 border rounded">
                                            <p className="text-xs text-gray-500">Experience (years)</p>
                                            {!isEditing ? (
                                                <p className="text-sm font-medium">{experienceYears ? `${experienceYears}` : ''}</p>
                                            ) : (
                                                <input type="number" min="0" className="w-full border rounded px-3 py-2 text-sm" value={editData.experience_years} onChange={e=>setEditData(d=>({...d,experience_years:e.target.value}))} />
                                            )}
                                        </div>
                                        <div className="p-3 border rounded">
                                            <p className="text-xs text-gray-500">Location</p>
                                            {!isEditing ? (
                                                <p className="text-sm font-medium">{location}</p>
                                            ) : (
                                                <input className="w-full border rounded px-3 py-2 text-sm" value={editData.location} onChange={e=>setEditData(d=>({...d,location:e.target.value}))} />
                                            )}
                                        </div>
                                        <div className="p-3 border rounded">
                                            <p className="text-xs text-gray-500">Languages</p>
                                            {!isEditing ? (
                                                <p className="text-sm font-medium">{languages}</p>
                                            ) : (
                                                <input className="w-full border rounded px-3 py-2 text-sm" value={editData.languages} onChange={e=>setEditData(d=>({...d,languages:e.target.value}))} placeholder="Comma separated" />
                                            )}
                                        </div>
                                        <div className="p-3 border rounded">
                                            <p className="text-xs text-gray-500">Consultation Charge</p>
                                            {!isEditing ? (
                                                <p className="text-sm font-medium">{feeDisplay}</p>
                                            ) : (
                                                <input type="number" step="0.01" min="0" className="w-full border rounded px-3 py-2 text-sm" value={editData.charge} onChange={e=>setEditData(d=>({...d,charge:e.target.value}))} />
                                            )}
                                        </div>
                                        <div className="p-3 border rounded">
                                            <p className="text-xs text-gray-500">Rating</p>
                                            {!isEditing ? (
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 text-yellow-500" />
                                                    <span className="text-sm font-medium">{rating}</span>
                                                </div>
                                            ) : (
                                                <input type="number" step="0.01" min="0" max="5" className="w-full border rounded px-3 py-2 text-sm" value={editData.rating} onChange={e=>setEditData(d=>({...d,rating:e.target.value}))} />
                                            )}
                                        </div>
                                        <div className="p-3 border rounded">
                                            <p className="text-xs text-gray-500">Reviews Count</p>
                                            {!isEditing ? (
                                                <p className="text-sm font-medium">{lawyer?.reviews_count ?? ''}</p>
                                            ) : (
                                                <input type="number" min="0" className="w-full border rounded px-3 py-2 text-sm" value={editData.reviews_count} onChange={e=>setEditData(d=>({...d,reviews_count:e.target.value}))} />
                                            )}
                                        </div>
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
