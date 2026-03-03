import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <Scale size={18} className="text-white" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                Legal<span className="text-indigo-400">Ease</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your complete legal platform — browse laws, generate complaints, find lawyers, and get AI-powered legal assistance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About Us' },
                { to: '/laws', label: 'Browse Laws' },
                { to: '/contact', label: 'Contact' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-slate-400 hover:text-indigo-400 transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Services</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>Legal Information</li>
              <li>Complaint Generator</li>
              <li>Lawyer Directory</li>
              <li>AI Legal Assistant</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2"><Mail size={14} className="text-indigo-400" /> support@legalease.in</li>
              <li className="flex items-center gap-2"><Phone size={14} className="text-indigo-400" /> +91 98765 43210</li>
              <li className="flex items-center gap-2"><MapPin size={14} className="text-indigo-400" /> Kerala, India</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} LegalEase. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link to="/about" className="hover:text-indigo-400 transition">Privacy</Link>
            <Link to="/about" className="hover:text-indigo-400 transition">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
