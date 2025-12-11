import React, { useEffect, useMemo, useState } from 'react';
import LawyerSidebar from '../../components/LawyerSidebar';
import { apiUrl } from '../../api';

export default function LawyerDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lawyer, setLawyer] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeSection, setActiveSection] = useState('recent'); // 'recent' | 'upcoming'

  // Resolve and load data
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Token ${token}` } : {};

        // 1) Resolve current lawyer profile (id, rating, etc.)
        const qp = new URLSearchParams(window.location.search);
        const qpId = qp.get('id');
        const storedId = qpId
          || localStorage.getItem('lawyer_id')
          || localStorage.getItem('lawyerId')
          || localStorage.getItem('lawyerID');
        const storedUsername = localStorage.getItem('lawyerUsername') || localStorage.getItem('username');

        async function fetchLawyerById(id) {
          const res = await fetch(apiUrl(`/lawyers/${id}/`), { headers });
          if (!res.ok) return null;
          return await res.json();
        }
        async function searchLawyerByUsername(uname) {
          const res = await fetch(apiUrl(`/lawyers/?search=${encodeURIComponent(uname)}`), { headers });
          if (!res.ok) return null;
          const data = await res.json();
          const arr = Array.isArray(data) ? data : (data.results || []);
          return arr.find(l => String(l.username).toLowerCase() === String(uname).toLowerCase()) || arr[0] || null;
        }

        let lw = null;
        if (storedId) {
          lw = await fetchLawyerById(storedId);
          if (!lw && storedUsername) lw = await searchLawyerByUsername(storedUsername);
        } else if (storedUsername) {
          lw = await searchLawyerByUsername(storedUsername);
        }
        if (!lw) throw new Error('Unable to resolve your lawyer profile. Please login again.');
        if (isMounted) setLawyer(lw);
        try {
          localStorage.setItem('lawyerId', String(lw.id));
          localStorage.setItem('lawyer_id', String(lw.id));
        } catch {}

        // 2) Load complaints (assigned to this lawyer) and derive metrics
        let comps = [];
        try {
          const res = await fetch(apiUrl('/complaints/'), { headers });
          if (res.ok) {
            const data = await res.json();
            const arr = Array.isArray(data) ? data : (data.results || []);
            comps = arr.filter(c => (c.assigned_lawyer && (c.assigned_lawyer === lw.id || c.assigned_lawyer.id === lw.id)));
          }
        } catch {}
        if (isMounted) setComplaints(comps);

        // 3) Load appointments (best-effort: API returns only requester appointments)
        try {
          const resA = await fetch(apiUrl('/appointments/'), { headers });
          if (resA.ok) {
            const dataA = await resA.json();
            const arrA = Array.isArray(dataA) ? dataA : (dataA.results || []);
            // keep as-is; may be empty when authenticated as lawyer
            if (isMounted) setAppointments(arrA);
          }
        } catch {}
      } catch (e) {
        if (isMounted) setError(e.message || 'Failed to load dashboard');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  // Derived metrics
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const completedAppointments = useMemo(() => {
    return appointments.filter(a => (a.status || '').toLowerCase() === 'completed').length;
  }, [appointments]);
  const pendingRequests = useMemo(() => {
    const p = new Set(['submitted','reviewing']);
    return complaints.filter(c => p.has(String(c.status || ''))).length;
  }, [complaints]);
  const activeAppointments = useMemo(() => {
    // Attempt: scheduled and for today
    return appointments.filter(a => (a.status || '').toLowerCase() === 'scheduled' && a.appointment_date === todayStr).length;
  }, [appointments, todayStr]);
  const averageRating = lawyer?.rating ?? 0;
  const reviewsCount = lawyer?.reviews_count ?? 0;

  // Derived appointment lists
  const recentAppointments = useMemo(() => {
    const toDate = (a) => new Date(`${a.appointment_date || '1970-01-01'}T${(a.appointment_time || '00:00')}`);
    return [...appointments]
      .sort((a, b) => toDate(b) - toDate(a))
      .slice(0, 5);
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    const today = todayStr;
    const toDate = (a) => new Date(`${a.appointment_date || '2099-12-31'}T${(a.appointment_time || '23:59')}`);
    return appointments
      .filter(a => (a.status || '').toLowerCase() === 'scheduled' && (a.appointment_date || '') >= today)
      .sort((a, b) => toDate(a) - toDate(b))
      .slice(0, 5);
  }, [appointments, todayStr]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Sidebar replaced with shared LawyerSidebar component */}
        <LawyerSidebar />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Active Appointments */}
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Active Appointments</h3>
                <span className="text-gray-400">📅</span>
              </div>
              <p className="text-2xl font-bold">{activeAppointments}</p>
              <p className="text-xs text-gray-500">Scheduled for today</p>
            </div>

            {/* Pending Requests */}
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Pending Requests</h3>
                <span className="text-gray-400">⏳</span>
              </div>
              <p className="text-2xl font-bold">{pendingRequests}</p>
              <p className="text-xs text-gray-500">Submitted/Reviewing</p>
            </div>
          {/* Stats Cards */}
            {/* Completed Appointments */}
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Completed Appointments</h3>
                <span className="text-gray-400">✅</span>
              </div>
              <p className="text-2xl font-bold">{completedAppointments}</p>
              <p className="text-xs text-gray-500">All time (visible scope)</p>
            </div>

            {/* Average Rating */}
            {/* <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Average Rating</h3>
                <span className="text-gray-400">⭐</span>
              </div>
              <p className="text-2xl font-bold">{Number(averageRating).toFixed(1)}</p>
              <p className="text-xs text-gray-500">Based on {reviewsCount} reviews</p>
            </div> */}

            {/* This Month Earnings */}
            {/* <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">This Month</h3>
                <span className="text-gray-400">📈</span>
              </div>
              <p className="text-2xl font-bold">$0</p>
              <p className="text-xs text-gray-500">(earnings not tracked)</p>
            </div> */}

            {/* Total Earnings */}
            {/* <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Total Earnings</h3>
                <span className="text-gray-400">💰</span>
              </div>
              <p className="text-2xl font-bold">$0</p>
              <p className="text-xs text-gray-500">(not tracked)</p>
            </div>*/} 
          </div>

          {/* Tabs */}
          <div>
            <div className="flex space-x-4 border-b mb-4">
              <button
                onClick={()=>setActiveSection('recent')}
                className={`px-4 py-2 ${activeSection==='recent' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Recent Appointments
              </button>
              <button
                onClick={()=>setActiveSection('upcoming')}
                className={`px-4 py-2 ${activeSection==='upcoming' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Upcoming Appointments
              </button>
              {/* <button className="px-4 py-2 text-gray-600 hover:text-blue-600">Analytics</button> */}
            </div>

            {activeSection === 'recent' ? (
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Recent Appointments</h3>
                </div>
                <div className="space-y-4">
                  {recentAppointments.map(a => (
                    <div key={a.id} className="flex justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{a.name || 'Client'}</p>
                        <p className="text-sm text-gray-500">{a.case_type || 'Consultation'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{(a.appointment_time || '').slice(0,5)}</p>
                        <p className="text-sm text-gray-500">{a.appointment_date}</p>
                        <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                          (a.status || '').toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                          (a.status || '').toLowerCase() === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {String(a.status || '').replace(/\b\w/g, s => s.toUpperCase())}
                        </span>
                      </div>
                    </div>
                  ))}
                  {recentAppointments.length === 0 && (
                    <div className="text-sm text-gray-500">No recent appointments found.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Upcoming Appointments</h3>
                </div>
                <div className="space-y-4">
                  {upcomingAppointments.map(a => (
                    <div key={a.id} className="flex justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{a.name || 'Client'}</p>
                        <p className="text-sm text-gray-500">{a.case_type || 'Consultation'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{(a.appointment_time || '').slice(0,5)}</p>
                        <p className="text-sm text-gray-500">{a.appointment_date}</p>
                      </div>
                    </div>
                  ))}
                  {upcomingAppointments.length === 0 && (
                    <div className="text-sm text-gray-500">No upcoming appointments found.</div>
                  )}
                </div>
              </div>
            )}

            {/* Analytics */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold mb-4">Monthly Performance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Cases Closed</span><span className="font-bold">23</span></div>
                  <div className="flex justify-between"><span>Success Rate</span><span className="font-bold text-green-600">94%</span></div>
                  <div className="flex justify-between"><span>Client Satisfaction</span><span className="font-bold">4.8/5</span></div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold mb-4">Practice Areas</h3>
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Criminal Law</span><span className="font-bold">60%</span></div>
                  <div className="flex justify-between"><span>Civil Rights</span><span className="font-bold">25%</span></div>
                  <div className="flex justify-between"><span>Family Law</span><span className="font-bold">15%</span></div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
