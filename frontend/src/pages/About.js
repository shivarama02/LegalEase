import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Scale, Target, Eye, Heart, Users, BookOpen, FileText, MessageCircle, Shield, ArrowRight, CheckCircle2,
} from 'lucide-react';

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

const VALUES = [
  { icon: Target, title: 'Our Mission', desc: 'To make legal knowledge accessible, understandable, and actionable for every citizen — regardless of their background.' },
  { icon: Eye,    title: 'Our Vision',  desc: 'A world where no one is denied justice due to lack of legal awareness or access to qualified legal professionals.' },
  { icon: Heart,  title: 'Our Values',  desc: 'Transparency, accessibility, security, and empowerment guide every feature we build into the platform.' },
];

const OFFERINGS = [
  { icon: BookOpen,       title: 'Law Database',          desc: 'Comprehensive categorized Indian laws covering criminal, civil, family, labour, cyber, and more.' },
  { icon: FileText,       title: 'Complaint Generator',   desc: 'Generate, preview, download, and save formal complaint letters with our guided 7-type system.' },
  { icon: Users,          title: 'Lawyer Directory',      desc: 'Find verified lawyers by specialization, location, and fees. View profiles and book appointments.' },
  { icon: MessageCircle,  title: 'AI Legal Chatbot',      desc: 'Ask legal questions in plain language and get AI-powered answers instantly, any time of day.' },
  { icon: Shield,         title: 'Secure Platform',       desc: 'Token-based authentication, session-based storage, and privacy-first architecture protect your data.' },
  { icon: Scale,          title: 'Real-time Chat',        desc: 'Connect with lawyers directly through our WebSocket-powered real-time messaging system.' },
];

export default function About() {
  useFadeObserver();

  return (
    <div className="min-h-screen text-slate-900">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50/60 via-white to-white" />
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-indigo-100/40 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-violet-100/40 rounded-full blur-3xl animate-float-reverse" />
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">About LegalEase</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mt-3 mb-5">
            Making Law{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Accessible</span>{' '}
            to Everyone
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
            LegalEase is a comprehensive legal platform designed to bridge the gap between citizens and the legal system.
            We combine technology and law to empower every user with knowledge, tools, and professional connections.
          </p>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white fade-section">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {VALUES.map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={i} className="fade-child bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 p-7 text-center hover:shadow-lg hover:border-indigo-100 transition">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center mx-auto mb-4">
                  <Icon size={26} className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{v.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 fade-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">What We Offer</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">Platform Capabilities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {OFFERINGS.map((o, i) => {
              const Icon = o.icon;
              return (
                <div key={i} className="fade-child bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:border-indigo-100 transition">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-indigo-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1.5">{o.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{o.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech + Team teaser
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white fade-section">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Built With Care</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2 mb-4">Modern Technology Stack</h2>
            <p className="text-slate-500 leading-relaxed mb-5">
              LegalEase is powered by a robust full-stack architecture designed for performance, security, and scalability.
            </p>
            <ul className="space-y-2.5">
              {[
                'React frontend with Tailwind CSS',
                'Django REST Framework backend',
                'WebSocket real-time chat via Daphne',
                'AI integration (Gemini / OpenRouter)',
                'Token-based auth with session storage',
                'SQLite database with Django ORM',
              ].map(t => (
                <li key={t} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-10 text-center text-white">
            <Scale size={40} className="mx-auto mb-4 opacity-80" />
            <h3 className="text-2xl font-extrabold mb-2">LegalEase</h3>
            <p className="text-sm text-white/70 mb-6">A Mini Project for MCA PG CET — S3</p>
            <Link to="/contact" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white border border-white/30 rounded-xl px-5 py-2.5 hover:bg-white/10 transition">
              Get in Touch <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section> */}

      <Footer />
    </div>
  );
}
