import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scale, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/laws', label: 'Laws' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 glass-nav transition-all duration-500 ${scrolled ? 'scrolled' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition">
              <Scale size={18} className="text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Legal<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Ease</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  pathname === l.to
                    ? 'text-indigo-700 bg-indigo-50/70'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/login"
              className="ml-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-sm transition"
            >
              Login
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden pb-4 space-y-1">
            {NAV_LINKS.map(l => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                  pathname === l.to ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block mx-3 mt-2 text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
