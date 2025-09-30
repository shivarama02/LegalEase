import React from 'react';
import UserSidebar from '../../components/UserSidebar';
import {
  Scale,
  FileText,
  Users,
  MessageCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function UserDashboard() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <UserSidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
            <p className="text-gray-500">Welcome back! Here's what's happening with your legal activities.</p>
          </div>

          {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Stat 1 */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <Scale className="h-8 w-8 text-indigo-500" />
                  <span className="px-2 py-1 text-xs rounded bg-gray-200">+12%</span>
                </div>
                <div className="text-2xl font-bold mb-1">23</div>
                <p className="text-sm text-gray-500">Laws Viewed</p>
              </div>

              {/* Stat 2 */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <FileText className="h-8 w-8 text-indigo-500" />
                  <span className="px-2 py-1 text-xs rounded bg-gray-200">+2</span>
                </div>
                <div className="text-2xl font-bold mb-1">5</div>
                <p className="text-sm text-gray-500">Complaints Generated</p>
              </div>

              {/* Stat 3 */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <Users className="h-8 w-8 text-indigo-500" />
                  <span className="px-2 py-1 text-xs rounded bg-gray-200">New</span>
                </div>
                <div className="text-2xl font-bold mb-1">3</div>
                <p className="text-sm text-gray-500">Lawyers Contacted</p>
              </div>

              {/* Stat 4 */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <MessageCircle className="h-8 w-8 text-indigo-500" />
                  <span className="px-2 py-1 text-xs rounded bg-gray-200">+5</span>
                </div>
                <div className="text-2xl font-bold mb-1">18</div>
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
              <button className="flex flex-col items-start p-4 border rounded-lg hover:shadow">
                <div className="p-2 bg-indigo-500 text-white rounded-lg">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Start Chat Assistant</div>
                  <div className="text-xs text-gray-500">Get instant legal help</div>
                </div>
              </button>

              <button className="flex flex-col items-start p-4 border rounded-lg hover:shadow">
                <div className="p-2 bg-blue-500 text-white rounded-lg">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Browse Laws</div>
                  <div className="text-xs text-gray-500">Explore legal information</div>
                </div>
              </button>

              <button className="flex flex-col items-start p-4 border rounded-lg hover:shadow">
                <div className="p-2 bg-green-500 text-white rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Generate Complaint</div>
                  <div className="text-xs text-gray-500">Create complaint letters</div>
                </div>
              </button>

              <button className="flex flex-col items-start p-4 border rounded-lg hover:shadow">
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
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-gray-100">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Viewed <span className="text-indigo-600">Consumer Protection Act</span></p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
                <span className="px-2 py-1 text-xs rounded bg-gray-200">completed</span>
              </div>

              <div className="flex items-center space-x-4 p-3 rounded-lg bg-gray-100">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Generated <span className="text-indigo-600">Complaint Letter - Property Dispute</span></p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
                <span className="px-2 py-1 text-xs rounded bg-gray-200">completed</span>
              </div>

              <div className="flex items-center space-x-4 p-3 rounded-lg bg-gray-100">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Contacted <span className="text-indigo-600">Lawyer: Sarah Johnson</span></p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
                <span className="px-2 py-1 text-xs rounded bg-gray-200">pending</span>
              </div>

              <div className="flex items-center space-x-4 p-3 rounded-lg bg-gray-100">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Chat Session <span className="text-indigo-600">Employment Law Inquiry</span></p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
                <span className="px-2 py-1 text-xs rounded bg-gray-200">completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
