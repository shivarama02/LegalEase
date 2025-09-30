import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import { apiUrl } from '../../api';
import { ArrowLeft, ShieldCheck, Star, MapPin, Phone, Mail, Briefcase, Languages } from 'lucide-react';

export default function LawyerProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(apiUrl(`/lawyers/${id}/`), { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to load lawyer (${res.status})`);
        const data = await res.json();
        setLawyer(data);
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <UserSidebar />
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => navigate(-1)} className="flex items-center text-gray-700 hover:text-black">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
            </div>

            {loading && <p className="text-gray-500">Loading profile…</p>}
            {error && !loading && <p className="text-red-600">{error}</p>}

            {lawyer && (
              <div className="bg-white rounded-xl shadow">
                {/* Header */}
                <div className="p-6 border-b">
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400 text-2xl">
                      {lawyer.photo_url ? (
                        <img src={lawyer.photo_url} alt={lawyer.full_name || lawyer.lname} className="h-full w-full object-cover" />
                      ) : (
                        (lawyer.full_name || lawyer.lname || '?').slice(0, 1)
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-gray-900">{lawyer.full_name || lawyer.lname}</h1>
                        {lawyer.is_verified && (
                          <span className="inline-flex items-center text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                            <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-blue-600 font-medium">{lawyer.specialization || 'General Practice'}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="inline-flex items-center"><MapPin className="h-4 w-4 mr-1" /> {lawyer.location || '—'}</span>
                        <span className="inline-flex items-center"><Briefcase className="h-4 w-4 mr-1" /> {lawyer.experience_years || 0} years</span>
                        <span className="inline-flex items-center"><Star className="h-4 w-4 mr-1 text-yellow-500" /> {Number(lawyer.rating || 0).toFixed(1)} ({lawyer.reviews_count || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-2">About</h2>
                      <p className="text-gray-700 whitespace-pre-line">{lawyer.bio || 'No bio available.'}</p>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold mb-2">Languages</h2>
                      <p className="text-gray-700 flex items-center"><Languages className="h-4 w-4 mr-2" /> {lawyer.languages || '—'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Contact</h3>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-center"><Mail className="h-4 w-4 mr-2 text-gray-500" /> {lawyer.email || '—'}</div>
                        <div className="flex items-center"><Phone className="h-4 w-4 mr-2 text-gray-500" /> {lawyer.phone || '—'}</div>
                        <div className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-gray-500" /> {lawyer.location || '—'}</div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-1">Consultation Fee</h3>
                      <p className="text-blue-600 font-bold">{lawyer.charge ? `₹${Number(lawyer.charge).toLocaleString('en-IN')}/hr` : 'N/A'}</p>
                    </div>
                    <button
                      onClick={() => {
                        const qp = new URLSearchParams({
                          lawyer_type: lawyer.specialization || '',
                          case_type: lawyer.specialization || '',
                          lawyer: String(lawyer.id || ''),
                        }).toString();
                        navigate(`/user/appointments?${qp}`);
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
