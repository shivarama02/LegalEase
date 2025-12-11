import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import { apiUrl } from '../../api';
import { Scale, FileText, Users, MessageCircle, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [chats, setChats] = useState([]);
  const [lawsViewed, setLawsViewed] = useState(0);
  const [lawViews, setLawViews] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Token ${token}` } : {};

        // Complaints for this user
        try {
          const res = await fetch(apiUrl('/complaints/'), { headers });
          if (res.ok) {
            const data = await res.json();
            const arr = Array.isArray(data) ? data : (data.results || []);
            if (isMounted) setComplaints(arr);
          }
        } catch {}

        // Appointments for this user
        try {
          const res = await fetch(apiUrl('/appointments/'), { headers });
          if (res.ok) {
            const data = await res.json();
            const arr = Array.isArray(data) ? data : (data.results || []);
            if (isMounted) setAppointments(arr);
          }
        } catch {}

        // Optional chats endpoint (if exists)
        try {
          const res = await fetch(apiUrl('/chats/'), { headers });
          if (res.ok) {
            const data = await res.json();
            const arr = Array.isArray(data) ? data : (data.results || []);
            if (isMounted) setChats(arr);
          }
        } catch {}

        // Optional laws viewed endpoint (if exists)
        try {
          const res = await fetch(apiUrl('/lawviews/'), { headers });
          if (res.ok) {
            const data = await res.json();
            const arr = Array.isArray(data) ? data : (data.results || []);
            if (isMounted) {
              setLawViews(arr);
              setLawsViewed(arr.length);
            }
          } else {
            if (isMounted) {
              setLawViews([]);
              setLawsViewed(0);
            }
          }
        } catch {
          if (isMounted) {
            setLawViews([]);
            setLawsViewed(0);
          }
        }
      } catch (e) {
        if (isMounted) setError(e.message || 'Failed to load dashboard');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const complaintsCount = complaints.length;
  const lawyersContacted = useMemo(() => {
    const ids = new Set();
    for (const a of appointments) {
      if (!a) continue;
      const id = a.lawyer?.id ?? a.lawyer_id ?? a.lawyer;
      if (id != null) ids.add(String(id));
    }
    return ids.size;
  }, [appointments]);
  const chatSessions = chats.length;
  const appointmentsCount = appointments.length;

  const toDate = (item) => {
    // Try appointment datetime
    if (item.appointment_date) {
      return new Date(`${item.appointment_date}T${(item.appointment_time || '00:00')}`);
    }
    // Try created/updated timestamps
    const d = item.updated_at || item.created_at || item.date || item.timestamp;
    return d ? new Date(d) : new Date(0);
  };

  const activities = useMemo(() => {
    const ap = appointments.map(a => ({
      kind: 'appointment',
      title: `${a.case_type || 'Consultation'}`,
      subtitle: a.name || 'Lawyer Appointment',
      status: (a.status || '').toLowerCase(),
      when: toDate(a),
    }));
    const cp = complaints.map(c => ({
      kind: 'complaint',
      title: c.title || c.complaint_type || 'Complaint',
      subtitle: c.complainant_name || 'Complaint Submitted',
      status: (c.status || '').toLowerCase(),
      when: toDate(c),
    }));
    const lv = lawViews.map(v => ({
      kind: 'lawview',
      title: v.title || v.name || v.law_title || 'Law Viewed',
      subtitle: v.category || v.section || '',
      status: 'viewed',
      when: toDate(v),
    }));
    return [...ap, ...cp, ...lv]
      .sort((a, b) => b.when - a.when)
      .slice(0, 6);
  }, [appointments, complaints, lawViews]);

  const formatWhen = (d) => {
    try {
      return d.toISOString().slice(0, 10);
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <UserSidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Stat 1 */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <Clock className="h-8 w-8 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold mb-1">{appointmentsCount}</div>
              <p className="text-sm text-gray-500">Appointments</p>
            </div>

              {/* Stat 2 */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <FileText className="h-8 w-8 text-indigo-500" />
                  
                </div>
                <div className="text-2xl font-bold mb-1">{complaintsCount}</div>
                <p className="text-sm text-gray-500">Complaints Generated</p>
              </div>

              {/* Stat 3 */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <Users className="h-8 w-8 text-indigo-500" />
                  
                </div>
                <div className="text-2xl font-bold mb-1">{lawyersContacted}</div>
                <p className="text-sm text-gray-500">Lawyers Contacted</p>
              </div>

              {/* Stat 4 */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <MessageCircle className="h-8 w-8 text-indigo-500" />
                  
                </div>
                <div className="text-2xl font-bold mb-1">{chatSessions}</div>
                <p className="text-sm text-gray-500">Chat Sessions</p>
              </div>
            </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-4 border-b">
              <h3 className="flex items-center space-x-2 font-semibold">
                <TrendingUp className="h-5 w-5" />
                <span>Quick Actions</span>
              </h3>
              <p className="text-gray-500 text-sm">Jump right into your most used features</p>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button onClick={() => navigate('/user/chat')} className="flex flex-col items-start p-4 border rounded-lg hover:shadow">
                <div className="p-2 bg-indigo-500 text-white rounded-lg">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Start Chat Assistant</div>
                  <div className="text-xs text-gray-500">Get instant legal help</div>
                </div>
              </button>

              <button onClick={() => navigate('/user/laws')} className="flex flex-col items-start p-4 border rounded-lg hover:shadow">
                <div className="p-2 bg-blue-500 text-white rounded-lg">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Browse Laws</div>
                  <div className="text-xs text-gray-500">Explore legal information</div>
                </div>
              </button>

              <button onClick={() => navigate('/user/complaints/generator')} className="flex flex-col items-start p-4 border rounded-lg hover:shadow">
                <div className="p-2 bg-green-500 text-white rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Generate Complaint</div>
                  <div className="text-xs text-gray-500">Create complaint letters</div>
                </div>
              </button>

              <button onClick={() => navigate('/user/lawyers')} className="flex flex-col items-start p-4 border rounded-lg hover:shadow">
                <div className="p-2 bg-yellow-500 text-white rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Find Lawyers</div>
                  <div className="text-xs text-gray-500">Search lawyer directory</div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="flex items-center space-x-2 font-semibold">
                <Clock className="h-5 w-5" />
                <span>Recent Activity</span>
              </h3>
              <p className="text-gray-500 text-sm">Your latest interactions and activities</p>
            </div>
            <div className="p-4 space-y-4">
              {activities.length === 0 && (
                <div className="text-sm text-gray-500">No recent activity found.</div>
              )}
              {activities.map((it, idx) => (
                <div key={idx} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-100">
                  {it.kind === 'appointment' ? (
                    it.status === 'completed' ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Clock className="h-5 w-5 text-blue-500" />
                  ) : (
                    it.kind === 'lawview' ? <FileText className="h-5 w-5 text-purple-500" /> : (it.status === 'submitted' || it.status === 'reviewing' ? <AlertCircle className="h-5 w-5 text-yellow-500" /> : <CheckCircle className="h-5 w-5 text-green-500" />)
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {it.kind === 'appointment' ? 'Appointment' : it.kind === 'lawview' ? 'Viewed Law' : 'Complaint'}{' '}
                      <span className="text-indigo-600">{it.title}</span>
                    </p>
                    <p className="text-xs text-gray-500">{formatWhen(it.when)}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded bg-gray-200">{it.status || 'updated'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
