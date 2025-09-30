import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Scale,
  BarChart3,
  MessageCircle,
  Bell,
  User as UserIcon,
  LogOut,
  CalendarDays,
  Star,
  Menu,
  X,
} from 'lucide-react';

// LawyerSidebar mirrors the look/feel of UserSidebar with lawyer-specific items
export default function LawyerSidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // mobile drawer state
  const baseBtn = 'w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors';
  const getClass = ({ isActive }) =>
    isActive ? `${baseBtn} bg-indigo-600 text-white` : `${baseBtn} hover:bg-gray-800 text-gray-100`;

  function handleLogout() {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('role');
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
            <NavLink to="/lawyer/Dashboard" className={getClass} end>
              <BarChart3 className="h-5 w-5" />
              <span>Overview</span>
            </NavLink>
            <NavLink to="/lawyer/Laws" className={getClass}>
              <Scale className="h-5 w-5" />
              <span>Laws</span>
            </NavLink>
            <NavLink to="/lawyer/chat" className={getClass}>
              <MessageCircle className="h-5 w-5" />
              <span>Chat</span>
            </NavLink>
            {/* <NavLink to="/lawyer/profile-management" className={getClass}>
              <FileText className="h-5 w-5" />
              <span>Profile Management</span>
            </NavLink> */}
            <NavLink to="/lawyer/appointments" className={getClass}>
              <CalendarDays className="h-5 w-5" />
              <span>Appointments</span>
            </NavLink>
            <NavLink to="/lawyer/lawyerfeedback" className={getClass}>
              <Star className="h-5 w-5" />
              <span>Feedback</span>
            </NavLink>
            <NavLink to="/lawyer/lawyernotifications" className={getClass}>
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </NavLink>
            {/* <NavLink to="/lawyer/settings" className={getClass}>
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </NavLink> */}
            <NavLink to="/lawyer/LawyerProfile" className={getClass}>
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
