import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Send, Clock, MessageSquare } from 'lucide-react';
import { apiUrl } from '../api';

function useFadeObserver() {
  useEffect(() => {
    const els = document.querySelectorAll('.fade-section');
    if (!els.length) return;
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const CONTACT_INFO = [
  { icon: Mail,    label: 'Email',    value: 'support@legalease.in',   sub: 'We reply within 24 hours' },
  { icon: Phone,   label: 'Phone',    value: '+91 90000 00000',        sub: 'Mon–Fri, 9 AM – 6 PM IST' },
  { icon: MapPin,  label: 'Location', value: 'Kerala, India',          sub: 'Operating fully online' },
  { icon: Clock,   label: 'Hours',    value: '24/7 AI Assistant',      sub: 'Human support on weekdays' },
];

export default function Contact() {
  useFadeObserver();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;

    setSending(true);
    setError('');
    try {
      const res = await fetch(apiUrl('/contact-queries/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const msg = payload?.detail || (payload ? JSON.stringify(payload) : 'Failed to send message');
        setError(msg);
        return;
      }

      setSent(true);
      setTimeout(() => setSent(false), 4000);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const inputCls = 'w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition';

  return (
    <div className="min-h-screen text-slate-900">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50/60 via-white to-white" />
        <div className="absolute top-10 right-1/4 w-64 h-64 bg-violet-100/40 rounded-full blur-3xl animate-float" />
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Contact Us</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mt-3 mb-5">
            Get in{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">
            Have a question, suggestion, or need help? We're here for you. Reach out through any channel below.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="pb-8 px-4 sm:px-6 lg:px-8 fade-section">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONTACT_INFO.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="fade-child bg-white rounded-2xl border border-slate-100 p-5 text-center hover:shadow-lg hover:border-indigo-100 transition">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center mx-auto mb-3">
                  <Icon size={20} className="text-indigo-600" />
                </div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.label}</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{c.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{c.sub}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Form + Map area */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 fade-section">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Form */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare size={18} className="text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900">Send Us a Message</h2>
            </div>

            {sent && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 font-medium">
                Message sent successfully! We'll get back to you soon.
              </div>
            )}

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-xs font-medium text-slate-600">Full Name</label>
                  <input type="text" className={inputCls} placeholder="Your name" value={form.name} onChange={update('name')} required />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-medium text-slate-600">Email</label>
                  <input type="email" className={inputCls} placeholder="you@example.com" value={form.email} onChange={update('email')} required />
                </div>
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-medium text-slate-600">Subject</label>
                <input type="text" className={inputCls} placeholder="How can we help?" value={form.subject} onChange={update('subject')} required />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-medium text-slate-600">Message</label>
                <textarea rows={5} className={inputCls} placeholder="Write your message..." value={form.message} onChange={update('message')} required />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send size={15} /> {sending ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Side info */}
          <div className="lg:w-80 space-y-5">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-7 text-white">
              <h3 className="text-lg font-bold mb-3">Quick Support</h3>
              <p className="text-sm text-white/70 leading-relaxed mb-5">
                For urgent queries, log into your dashboard and use the AI Legal Assistant — available 24/7 and completely free.
              </p>
              <a href="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold border border-white/30 rounded-xl px-4 py-2 hover:bg-white/10 transition">
                Go to Dashboard
              </a>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
              <h4 className="text-sm font-bold text-slate-800 mb-3">FAQ</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><span className="font-medium text-slate-700">Is LegalEase free?</span><br />Yes, core features are free for all users.</li>
                <li><span className="font-medium text-slate-700">How do I find a lawyer?</span><br />Use the Lawyer Directory to search by specialization.</li>
                <li><span className="font-medium text-slate-700">Is my data secure?</span><br />We use token-auth and encrypted sessions.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

