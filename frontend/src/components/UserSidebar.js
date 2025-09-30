import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Scale,
  BarChart3,
  FileText,
  Users,
  MessageCircle,
  Bell,
  Settings,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Calendar,
} from 'lucide-react';

// Exact visual replica of the provided static HTML sidebar.
// First item (Overview) is styled as active; others have hover states only.
// No behavior/state management added to avoid altering the requested UI.
export default function UserSidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // mobile drawer state
  const baseBtn = 'w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors';
  const getClass = ({ isActive }) =>
    isActive ? `${baseBtn} bg-indigo-600 text-white` : `${baseBtn} hover:bg-gray-800 text-gray-100`;

  function handleLogout() {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('role');
      // You could also clear other cached items here if added later
      navigate('/login');
    } catch (e) {
      console.error('Logout error:', e);
      navigate('/login');
    }
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        aria-label="Open menu"
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-900/90 text-gray-100 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-gray-100 shadow-lg transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="p-6 flex flex-col h-full min-h-screen">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <Scale className="h-8 w-8 text-indigo-400" />
              <h1 className="text-xl font-bold">LegalEase</h1>
            </div>
            {/* Close button mobile */}
            <button
              type="button"
              aria-label="Close menu"
              className="md:hidden p-2 rounded-md hover:bg-gray-800 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-2 flex-1">
          <NavLink to="/user/Dashboard" className={getClass} end>
            <BarChart3 className="h-5 w-5" />
            <span>Overview</span>
          </NavLink>
          <NavLink to="/user/laws" className={getClass}>
            <Scale className="h-5 w-5" />
            <span>Laws</span>
          </NavLink>
          <NavLink to="/user/chat" className={getClass}>
            <MessageCircle className="h-5 w-5" />
            <span>Chat</span>
          </NavLink>
          <NavLink to="/user/complaints" className={getClass}>
            <FileText className="h-5 w-5" />
            <span>Complaints</span>
          </NavLink>
            <NavLink to="/user/appointments" className={getClass}>
              <Calendar className="h-5 w-5" />
              <span>Appointments</span>
            </NavLink>
          <NavLink to="/user/lawyers" className={getClass}>
            <Users className="h-5 w-5" />
            <span>Lawyers</span>
          </NavLink>
          <NavLink to="/user/notifications" className={getClass}>
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </NavLink>
          {/* <NavLink to="/user/settings" className={getClass}>
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </NavLink> */}
          <NavLink to="/user/profile" className={getClass}>
            <UserIcon className="h-5 w-5" />
            <span>Profile</span>
          </NavLink>
          <button onClick={handleLogout} className={`${baseBtn} hover:bg-gray-800 text-gray-100 w-full text-left`} type="button">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
          </button>
          </nav>
        </div>
      </div>
    </>
  );
}
