import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3, Scale, MessageCircle, BotMessageSquare, CalendarDays, History,
  Bell, Star, User as UserIcon, LogOut, Menu, X, LayoutDashboard,
} from 'lucide-react';
import { apiUrl } from '../api';

export default function LawyerSidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadFeedback, setUnreadFeedback] = useState(0);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (!token) return;
    const headers = { Authorization: `Token ${token}` };

    const fetchCounts = () => {
      fetch(apiUrl('/notifications/stats/'), { headers })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setUnreadNotifs(d.unread || 0); })
        .catch(() => {});

      fetch(apiUrl('/feedbacks/unread-count/'), { headers })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setUnreadFeedback(d.unread || 0); })
        .catch(() => {});
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const baseBtn = 'w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200';
  const getClass = ({ isActive }) =>
    isActive
      ? `${baseBtn} bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25`
      : `${baseBtn} text-slate-300 hover:bg-white/10 hover:text-white`;

  function handleLogout() {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('authUserId');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('lawyerUsername');
    navigate('/login');
  }

  const links = [
    { to: '/lawyer/Dashboard', icon: BarChart3, label: 'Overview' },
    { to: '/lawyer/Laws', icon: Scale, label: 'Laws' },
    { to: '/lawyer/chat', icon: MessageCircle, label: 'Chat' },
    { to: '/lawyer/aichat', icon: BotMessageSquare, label: 'AI Chat' },
    { to: '/lawyer/appointments', icon: CalendarDays, label: 'Appointments' },
    { to: '/lawyer/appointment-history', icon: History, label: 'History' },
  ];

  const bottomIcons = [
    { to: '/lawyer/lawyernotifications', icon: Bell, tip: 'Notifications' },
    { to: '/lawyer/lawyerfeedback', icon: Star, tip: 'Feedback' },
    { to: '/lawyer/LawyerProfile', icon: UserIcon, tip: 'Profile' },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg flex items-center justify-between px-4">
        <button type="button" aria-label="Open menu" onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-white/15 text-white transition-colors">
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-bold text-white">Legal<span className="text-indigo-200">Ease</span></h1>
        <div className="flex items-center gap-1">
          <NavLink to="/lawyer/lawyernotifications" className="relative p-2 rounded-lg hover:bg-white/15 text-white transition-colors">
            <Bell size={20} />
            {unreadNotifs > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-indigo-600" />}
          </NavLink>
          <NavLink to="/lawyer/LawyerProfile" className="p-2 rounded-lg hover:bg-white/15 text-white transition-colors">
            <UserIcon size={20} />
          </NavLink>
        </div>
      </div>
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
                <h1 className="text-xl font-bold text-white leading-tight">Legal<span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Ease</span></h1>
              </div>
            </div>
            <button type="button" aria-label="Close" className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-slate-400" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} className={getClass} onClick={() => setOpen(false)} end={l.to.endsWith('Dashboard')}>
                <l.icon size={18} /> <span className="text-sm font-medium">{l.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Bottom icon bar */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-around">
              {bottomIcons.map(b => (
                <NavLink key={b.to} to={b.to} title={b.tip} onClick={() => setOpen(false)} 
                  className={({ isActive }) =>
                    `relative p-2.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`
                  }>
                  <b.icon size={18} />
                  {b.tip === 'Notifications' && unreadNotifs > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900" />
                  )}
                  {b.tip === 'Feedback' && unreadFeedback > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900" />
                  )}
                </NavLink>
              ))}
              <button onClick={handleLogout} type="button" title="Logout"
                className="p-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile top bar spacer */}
      <div className="md:hidden h-14 shrink-0" />
    </>
  );
}