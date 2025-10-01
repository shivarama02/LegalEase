import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Scale, Users, UserCog, FileText, MessageSquare, Bell, BarChart3, LogOut, Menu, X } from 'lucide-react';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const baseBtn = 'w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors';
  const getClass = ({ isActive }) => (isActive ? `${baseBtn} bg-indigo-600 text-white` : `${baseBtn} hover:bg-gray-800 text-gray-100`);

  function handleLogout() {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('role');
      navigate('/login');
    } catch (e) {
      navigate('/login');
    }
  }

  return (
    <>
      {/* Mobile toggle */}
      <button type="button" aria-label="Open menu" className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-900/90 text-gray-100 shadow-lg" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
      </button>
      {open && <div className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40" onClick={() => setOpen(false)} />}

      <div className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-gray-100 shadow-lg transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex flex-col h-full min-h-screen">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="h-8 w-8 text-indigo-400" />
              <h1 className="text-xl font-bold">Admin</h1>
            </div>
            <button type="button" aria-label="Close menu" className="md:hidden p-2 rounded-md hover:bg-gray-800 text-gray-300" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-2 flex-1">
            <NavLink to="/admin/Dashboard" className={getClass} end>
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/admin/law-info-management" className={getClass}>
              <Scale className="h-5 w-5" />
              <span>Law Info Management</span>
            </NavLink>
            <NavLink to="/admin/lawyer-management" className={getClass}>
              <UserCog className="h-5 w-5" />
              <span>Lawyer Management</span>
            </NavLink>
            <NavLink to="/admin/user-management" className={getClass}>
              <Users className="h-5 w-5" />
              <span>User Management</span>
            </NavLink>
            <NavLink to="/admin/complaint-templates" className={getClass}>
              <FileText className="h-5 w-5" />
              <span>Complaint Templates</span>
            </NavLink>
            <NavLink to="/admin/reports" className={getClass}>
              <BarChart3 className="h-5 w-5" />
              <span>Reports</span>
            </NavLink>
            <NavLink to="/admin/feedback-management" className={getClass}>
              <MessageSquare className="h-5 w-5" />
              <span>Feedback</span>
            </NavLink>
            <NavLink to="/admin/notification-management" className={getClass}>
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </NavLink>
            {/* <NavLink to="/admin/settings" className={getClass}>
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </NavLink> */}
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
