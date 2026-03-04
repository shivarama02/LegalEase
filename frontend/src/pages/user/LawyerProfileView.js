import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import { apiUrl } from '../../api';
import { requestChat, getMyRooms } from '../../services/chatApi';
import {
  ArrowLeft, ShieldCheck, Star, MapPin, Phone, Mail,
  Briefcase, Languages, IndianRupee, MessageSquare, CalendarPlus, Loader2, Send, Clock,
} from 'lucide-react';

export default function LawyerProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [room, setRoom] = useState(null);       // full room object for this lawyer
  const [requesting, setRequesting] = useState(false);

  /* ─── Load lawyer data ──────────────────────────────────────────── */
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

  /* ─── Check if a room already exists with this lawyer ────────────── */
  useEffect(() => {
    if (!lawyer?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const rooms = await getMyRooms();
        if (cancelled) return;
        const arr = Array.isArray(rooms) ? rooms : [];
        // Find room matching this lawyer
        const existing = arr.find(
          (r) => String(r.lawyer_id) === String(lawyer.id)
        );
        setRoom(existing || null);
      } catch (_) {
        // non-fatal
      }
    })();
    return () => { cancelled = true; };
  }, [lawyer?.id]);

  /* ─── Request chat action ───────────────────────────────────────── */
  const handleRequestChat = async () => {
    if (!lawyer?.id) return;
    setRequesting(true);
    try {
      const newRoom = await requestChat(lawyer.id);
      setRoom(newRoom);
    } catch (err) {
      alert(err.message || 'Failed to send chat request');
    } finally {
      setRequesting(false);
    }
  };

  /* ─── Open existing chat ────────────────────────────────────────── */
  const handleOpenChat = () => {
    navigate('/user/chat', { state: { lawyerId: lawyer.id, roomId: room?.id } });
  };

  const renderStars = (rating) => {
    const r = Number(rating || 0);
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={16} className={i <= Math.round(r) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <UserSidebar />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">

            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 text-sm font-medium transition"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            {loading && (
              <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">Loading profile…</span>
              </div>
            )}
            {error && !loading && <p className="text-red-600 text-sm">{error}</p>}

            {lawyer && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex flex-col md:flex-row">

                  {/* ── Left — Profile Photo ───────────────────────────────── */}
                  <div className="md:w-80 flex-shrink-0 bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center p-8 md:p-10">
                    <div className="w-52 h-52 md:w-56 md:h-56 rounded-3xl bg-white shadow-lg border border-slate-100 overflow-hidden flex items-center justify-center">
                      {(lawyer.photo_full_url || lawyer.photo_url) ? (
                        <img src={lawyer.photo_full_url || lawyer.photo_url} alt={lawyer.full_name || lawyer.lname} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-7xl font-bold text-indigo-300 select-none">
                          {(lawyer.full_name || lawyer.lname || '?').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className="hidden md:block w-px bg-slate-200" />

                  {/* ── Right — All Details ─────────────────────────────────── */}
                  <div className="flex-1 p-6 md:p-8 overflow-y-auto">

                    {/* Name & Verified */}
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-3xl font-extrabold text-slate-900">
                        {lawyer.full_name || lawyer.lname}
                      </h1>
                      {lawyer.is_verified && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                          <ShieldCheck size={13} /> Verified
                        </span>
                      )}
                    </div>

                    {/* Specialization */}
                    <p className="text-xl font-semibold text-indigo-600 mb-4">
                      {lawyer.specialization || 'General Practice'}
                    </p>

                    {/* Stats Row */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-5">
                      <div className="flex items-center gap-2">
                        {renderStars(lawyer.rating)}
                        <span className="text-sm font-bold text-slate-800">{Number(lawyer.rating || 0).toFixed(1)}</span>
                        <span className="text-xs text-slate-400">({lawyer.reviews_count || 0} reviews)</span>
                      </div>
                      <span className="w-px h-5 bg-slate-200 hidden sm:block" />
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Briefcase size={14} className="text-slate-400" />
                        <span className="font-medium">{lawyer.experience_years || 0} years experience</span>
                      </div>
                      <span className="w-px h-5 bg-slate-200 hidden sm:block" />
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin size={14} className="text-slate-400" />
                        <span>{lawyer.location || '—'}</span>
                      </div>
                    </div>

                    {/* Separator */}
                    <hr className="border-slate-200 mb-5" />

                    {/* About */}
                    <div className="mb-5">
                      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">About</h2>
                      <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                        {lawyer.bio || 'No bio available.'}
                      </p>
                    </div>

                    {/* Separator */}
                    <hr className="border-slate-200 mb-5" />

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <Mail size={14} className="text-indigo-500" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Email</p>
                          <p className="text-sm text-slate-700 truncate">{lawyer.email || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <Phone size={14} className="text-indigo-500" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Phone</p>
                          <p className="text-sm text-slate-700">{lawyer.phone || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <MapPin size={14} className="text-indigo-500" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Location</p>
                          <p className="text-sm text-slate-700">{lawyer.location || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <Languages size={14} className="text-indigo-500" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Languages</p>
                          <p className="text-sm text-slate-700">{lawyer.languages || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <IndianRupee size={14} className="text-indigo-500" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Consultation Fee</p>
                          <p className="text-sm font-bold text-indigo-700">
                            {lawyer.charge ? `₹${Number(lawyer.charge).toLocaleString('en-IN')}/hr` : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Separator */}
                    <hr className="border-slate-200 mb-5" />

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => {
                          const qp = new URLSearchParams({
                            lawyer_type: lawyer.specialization || '',
                            case_type: lawyer.specialization || '',
                            lawyer: String(lawyer.id || ''),
                            location: lawyer.location || '',
                          }).toString();
                          navigate(`/user/appointments?${qp}`);
                        }}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6 py-2.5 rounded-2xl font-semibold transition shadow-lg shadow-indigo-100 text-sm"
                      >
                        <CalendarPlus size={15} />
                        Book Appointment
                      </button>

                      {/* Chat button — dynamic based on room status */}
                      {room?.status === 'active' ? (
                        <button
                          onClick={handleOpenChat}
                          className="flex items-center justify-center gap-2 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-100 px-6 py-2.5 rounded-2xl font-semibold transition text-sm"
                        >
                          <MessageSquare size={15} />
                          Chat
                        </button>
                      ) : room?.status === 'pending' ? (
                        <button
                          disabled
                          className="flex items-center justify-center gap-2 bg-amber-50 border-2 border-amber-200 text-amber-600 px-6 py-2.5 rounded-2xl font-semibold text-sm cursor-not-allowed opacity-80"
                        >
                          <Clock size={15} />
                          Request Pending
                        </button>
                      ) : (
                        <button
                          onClick={handleRequestChat}
                          disabled={requesting}
                          className="flex items-center justify-center gap-2 border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-6 py-2.5 rounded-2xl font-semibold transition text-sm disabled:opacity-60"
                        >
                          {requesting ? (
                            <><Loader2 size={15} className="animate-spin" /> Requesting…</>
                          ) : (
                            <><Send size={15} /> Request Chat</>
                          )}
                        </button>
                      )}
                    </div>
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
