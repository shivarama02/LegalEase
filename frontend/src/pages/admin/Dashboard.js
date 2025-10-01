import React from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (as requested: add AdminSidebar here) */}
      <AdminSidebar />
      <div className="flex-1">
        {/* Header */}
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* lucide icon equivalent */}
                <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">System Management & Monitoring</p>
                </div>
              </div>
              <Link to="/" className="text-sm text-blue-600 hover:underline">Back to Home</Link>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="container mx-auto px-4 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Total Users</p>
              <div className="flex items-baseline justify-between mt-2">
                <h3 className="text-3xl font-bold text-gray-800">1,234</h3>
                <span className="text-sm font-medium text-blue-600">+12%</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Total Lawyers</p>
              <div className="flex items-baseline justify-between mt-2">
                <h3 className="text-3xl font-bold text-gray-800">89</h3>
                <span className="text-sm font-medium text-green-600">+5%</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Total Laws</p>
              <div className="flex items-baseline justify-between mt-2">
                <h3 className="text-3xl font-bold text-gray-800">456</h3>
                <span className="text-sm font-medium text-purple-600">+8%</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Total Complaints</p>
              <div className="flex items-baseline justify-between mt-2">
                <h3 className="text-3xl font-bold text-gray-800">342</h3>
                <span className="text-sm font-medium text-orange-600">+15%</span>
              </div>
            </div>
          </div>

          {/* Admin Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            <Link to="/admin/law-info-management" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer block">
              <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center mb-3">
                {/* scale icon */}
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3h18" />
                  <path d="M12 3v18" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Law Info Management</h3>
              <p className="text-sm text-gray-500">Add, edit, or remove legal information categories</p>
            </Link>

            <Link to="/admin/lawyer-management" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer block">
              <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center mb-3">
                {/* user-cog icon */}
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="7" r="4" />
                  <path d="M6 21v-2a4 4 0 0 1 4-4h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Lawyer Management</h3>
              <p className="text-sm text-gray-500">Full CRUD operations on lawyer profiles</p>
            </Link>

            <Link to="/admin/user-management" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer block">
              <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center mb-3">
                {/* users icon */}
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
              <p className="text-sm text-gray-500">Manage user accounts and permissions</p>
            </Link>

            <Link to="/admin/complaint-templates" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer block">
              <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center mb-3">
                {/* file-text icon */}
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Complaint Templates</h3>
              <p className="text-sm text-gray-500">Create and update complaint templates</p>
            </Link>

            <Link to="/admin/feedback-management" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer block">
              <div className="w-12 h-12 rounded-lg bg-pink-500 flex items-center justify-center mb-3">
                {/* message-square icon */}
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Feedback Management</h3>
              <p className="text-sm text-gray-500">View and analyze user feedback</p>
            </Link>

            {/* <Link to="/admin/notification-management" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer block">
              <div className="w-12 h-12 rounded-lg bg-yellow-500 flex items-center justify-center mb-3">
                
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              <p className="text-sm text-gray-500">Send notifications to users or lawyers</p>
            </Link> */}

            <Link to="/admin/reports" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer block">
              <div className="w-12 h-12 rounded-lg bg-indigo-500 flex items-center justify-center mb-3">
                {/* bar-chart-3 icon */}
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <rect x="7" y="12" width="3" height="6" />
                  <rect x="12" y="8" width="3" height="10" />
                  <rect x="17" y="5" width="3" height="13" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Reports</h3>
              <p className="text-sm text-gray-500">Generate system usage reports</p>
            </Link>

            {/* <Link to="/admin/settings" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer block">
              <div className="w-12 h-12 rounded-lg bg-gray-500 flex items-center justify-center mb-3">
                
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09c.7 0 1.31-.4 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06c.46.46 1.12.6 1.82.33H9A1.65 1.65 0 0 0 10 4.09V4a2 2 0 0 1 4 0v.09c0 .7.4 1.31 1 1.51.7.27 1.36.13 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.46.46-.6 1.12-.33 1.82V9c.6.2 1 .81 1 1.51V12a2 2 0 0 1-2 2h-.09c-.7 0-1.31.4-1.51 1z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Settings</h3>
              <p className="text-sm text-gray-500">Configure system preferences</p>
            </Link> */}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow mt-8">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
              <p className="text-sm text-gray-500">Latest system events and actions</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-800">New lawyer registered</p>
                  <p className="text-sm text-gray-500">by Dr. Sharma</p>
                </div>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-800">Complaint template updated</p>
                  <p className="text-sm text-gray-500">by Admin</p>
                </div>
                <span className="text-sm text-gray-500">5 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-800">User feedback submitted</p>
                  <p className="text-sm text-gray-500">by John Doe</p>
                </div>
                <span className="text-sm text-gray-500">1 day ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-800">New law added</p>
                  <p className="text-sm text-gray-500">by Admin</p>
                </div>
                <span className="text-sm text-gray-500">2 days ago</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
