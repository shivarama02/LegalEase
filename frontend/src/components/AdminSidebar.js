import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Scale, Users, UserCog, MessageSquare, BarChart3, LogOut, Menu, X } from 'lucide-react';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const baseBtn = 'w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200';
  const getClass = ({ isActive }) =>
    isActive
      ? `${baseBtn} bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25`
      : `${baseBtn} text-slate-300 hover:bg-white/10 hover:text-white`;

  function handleLogout() {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('authUserId');
    navigate('/login');
  }

  const links = [
    { to: '/admin/Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/law-info-management', icon: Scale, label: 'Law Info' },
    { to: '/admin/user-management', icon: Users, label: 'Users' },
    { to: '/admin/lawyer-management', icon: UserCog, label: 'Lawyers' },
    { to: '/admin/feedback-management', icon: MessageSquare, label: 'Feedback' },
    // { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  ];

  return (
    <>
      <button type="button" aria-label="Open menu"
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-slate-900/90 text-white shadow-lg backdrop-blur"
        onClick={() => setOpen(true)}>
        <Menu size={18} />
      </button>
      {open && <div className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setOpen(false)} />}

      <div className={`fixed md:sticky md:top-0 inset-y-0 left-0 z-50 w-64 h-screen bg-slate-900 shadow-xl transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col h-full p-5">
          {/* Brand */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <LayoutDashboard size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">LegalEase</h1>
                <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest">Admin Panel</p>
              </div>
            </div>
            <button type="button" aria-label="Close" className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-slate-400" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1.5">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} className={getClass} onClick={() => setOpen(false)}>
                <l.icon size={18} /> <span className="text-sm font-medium">{l.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="pt-4 border-t border-white/10">
            <button onClick={handleLogout} type="button"
              className={`${baseBtn} text-slate-400 hover:bg-red-500/10 hover:text-red-400`}>
              <LogOut size={18} /> <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
