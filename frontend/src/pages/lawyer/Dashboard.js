import React from 'react';
import LawyerSidebar from '../../components/LawyerSidebar';

export default function LawyerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Sidebar replaced with shared LawyerSidebar component */}
        <LawyerSidebar />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Welcome back! Here's your practice overview.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Clients */}
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Total Clients</h3>
                <span className="text-gray-400">👥</span>
              </div>
              <p className="text-2xl font-bold">45</p>
              <p className="text-xs text-gray-500">+12% from last month</p>
            </div>

            {/* Active Appointments */}
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Active Appointments</h3>
                <span className="text-gray-400">📅</span>
              </div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-gray-500">3 scheduled today</p>
            </div>

            {/* Pending Requests */}
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Pending Requests</h3>
                <span className="text-gray-400">⏳</span>
              </div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-gray-500">Requires attention</p>
            </div>

            {/* Average Rating */}
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Average Rating</h3>
                <span className="text-gray-400">⭐</span>
              </div>
              <p className="text-2xl font-bold">4.8</p>
              <p className="text-xs text-gray-500">Based on 156 reviews</p>
            </div>

            {/* This Month Earnings */}
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">This Month</h3>
                <span className="text-gray-400">📈</span>
              </div>
              <p className="text-2xl font-bold">$4,500</p>
              <p className="text-xs text-gray-500">+8% from last month</p>
            </div>

            {/* Total Earnings */}
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Total Earnings</h3>
                <span className="text-gray-400">💰</span>
              </div>
              <p className="text-2xl font-bold">$25,000</p>
              <p className="text-xs text-gray-500">All time</p>
            </div>
          </div>

          {/* Tabs */}
          <div>
            <div className="flex space-x-4 border-b mb-4">
              <button className="px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-medium">Recent Requests</button>
              <button className="px-4 py-2 text-gray-600 hover:text-blue-600">Upcoming Appointments</button>
              {/* <button className="px-4 py-2 text-gray-600 hover:text-blue-600">Analytics</button> */}
            </div>

            {/* Recent Requests */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Recent Client Requests</h3>
                <button className="text-sm px-3 py-1 bg-gray-900 text-white rounded">View All</button>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-gray-500">Consultation</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>
                </div>
                <div className="flex justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Jane Smith</p>
                    <p className="text-sm text-gray-500">Legal Advice</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Approved</span>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Upcoming Appointments</h3>
                <button className="text-sm px-3 py-1 bg-gray-900 text-white rounded">Manage All</button>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Sarah Wilson</p>
                    <p className="text-sm text-gray-500">Consultation</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">10:00 AM</p>
                    <p className="text-sm text-gray-500">Today</p>
                  </div>
                </div>
                <div className="flex justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">David Brown</p>
                    <p className="text-sm text-gray-500">Follow-up</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">2:30 PM</p>
                    <p className="text-sm text-gray-500">Today</p>
                  </div>
                </div>
              </div>
            </div>

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
