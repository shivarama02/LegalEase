import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Scale, MessageCircle, FileText, Users, Shield, Search,
  ArrowRight, BookOpen, Gavel, ChevronRight, Star, CheckCircle2,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/* ── Intersection Observer hook for fade-in sections ── */
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

const FEATURES = [
  { icon: Scale,          title: 'Legal Information',    desc: 'Browse comprehensive legal information categorized by areas of law with detailed sections and penalties.' },
  { icon: MessageCircle,  title: 'AI Legal Assistant',   desc: 'Get instant answers to your legal questions with our AI-powered chatbot available around the clock.' },
  { icon: FileText,       title: 'Complaint Generator',  desc: 'Generate professional complaint letters with our guided form system and download as PDF.' },
  { icon: Users,          title: 'Lawyer Directory',     desc: 'Find qualified lawyers by specialization, location, and fees — book appointments directly.' },
  { icon: Shield,         title: 'Secure & Confidential',desc: 'Your legal matters handled with complete privacy, secure authentication, and encrypted data.' },
  { icon: Search,         title: 'Easy Navigation',      desc: 'Intuitive interface designed for quick access to legal resources even without legal background.' },
];

const STATS = [
  { value: '500+', label: 'Laws Covered' },
  { value: '200+', label: 'Verified Lawyers' },
  { value: '1000+', label: 'Complaints Filed' },
  { value: '24/7', label: 'AI Assistant' },
];

const STEPS = [
  { num: '01', title: 'Create Account',     desc: 'Sign up as a user or a lawyer in under a minute.' },
  { num: '02', title: 'Explore Resources',  desc: 'Browse laws, find lawyers, or ask the AI chatbot.' },
  { num: '03', title: 'Take Action',        desc: 'File complaints, book appointments, or chat with a lawyer.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  useFadeObserver();

  return (
    <div className="min-h-screen text-slate-900 overflow-x-hidden">
      {/* Fixed full-page background image */}
      <div className="fixed inset-0 -z-10">
        <img
          src="https://plus.unsplash.com/premium_photo-1697730370455-0040cd34c580?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <Navbar />

      {/* ════════ HERO ════════ */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        {/* Light overlay for readability */}
        <div className="absolute inset-0 -z-[1] bg-gradient-to-b from-white/60 via-white/20 to-transparent" />

        {/* Floating decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-violet-200/30 rounded-full blur-3xl animate-float-reverse" />

        <div className="max-w-4xl mx-auto relative z-10 pt-20">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-6">
            <Star size={12} className="fill-indigo-500 text-indigo-500" /> Trusted Legal Platform
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Your Complete{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Legal Platform
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Access legal information, generate complaints, find lawyers, and get AI-powered assistance —
            all in one comprehensive platform designed for your legal needs.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-lg shadow-indigo-200/50 transition flex items-center gap-2"
            >
              Get Started <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/laws')}
              className="px-7 py-3.5 rounded-xl border border-slate-200 bg-white/80 text-slate-700 font-semibold hover:border-indigo-200 hover:text-indigo-600 transition flex items-center gap-2"
            >
              <BookOpen size={16} /> Browse Laws
            </button>
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map(s => (
              <div key={s.label} className="bg-white/60 backdrop-blur-sm border border-slate-100 rounded-2xl py-4 px-3">
                <p className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{s.value}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FEATURES ════════ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 fade-section">
        <div className="absolute inset-0 -z-[1] bg-white/100 backdrop-blur-sm" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">Everything You Need for Legal Assistance</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">One platform that brings together laws, lawyers, complaints, and AI — designed so everyone can navigate the legal system with confidence.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="fade-child group bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:border-indigo-100 transition">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center mb-4 group-hover:from-indigo-100 group-hover:to-violet-100 transition">
                    <Icon size={22} className="text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 fade-section">
        <div className="absolute inset-0 -z-[1] bg-white/40 backdrop-blur-sm" />
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">Get Started in 3 Simple Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div key={i} className="fade-child relative bg-white rounded-2xl border border-slate-100 p-7 text-center">
                <span className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{s.num}</span>
                <h3 className="text-lg font-bold text-slate-800 mt-3 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <ChevronRight size={20} className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 text-indigo-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ ABOUT PREVIEW ════════ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 fade-section">
        <div className="absolute inset-0 -z-[1] bg-white/100 backdrop-blur-sm" />
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">About Us</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-4">Making Law Accessible to Everyone</h2>
            <p className="text-slate-500 leading-relaxed mb-4">
              LegalEase is built with the vision of democratizing legal knowledge. We believe everyone deserves easy access
              to legal information, professional complaint generation, and direct connections with qualified lawyers.
            </p>
            <ul className="space-y-2 mb-6">
              {['Comprehensive Indian law database', 'AI-powered legal Q&A', 'Verified lawyer network', 'Secure complaint management'].map(t => (
                <li key={t} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" /> {t}
                </li>
              ))}
            </ul>
            <Link to="/about" className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">
              Learn more about us <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-6 text-center">
              <Gavel size={28} className="text-indigo-600 mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-slate-800">8+</p>
              <p className="text-xs text-slate-500 font-medium">Law Categories</p>
            </div>
            <div className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl p-6 text-center">
              <FileText size={28} className="text-violet-600 mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-slate-800">7</p>
              <p className="text-xs text-slate-500 font-medium">Complaint Types</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 text-center">
              <Users size={28} className="text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-slate-800">Real-time</p>
              <p className="text-xs text-slate-500 font-medium">Chat with Lawyers</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 text-center">
              <MessageCircle size={28} className="text-amber-600 mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-slate-800">AI</p>
              <p className="text-xs text-slate-500 font-medium">Legal Chatbot</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ CONTACT PREVIEW ════════ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 fade-section">
        <div className="absolute inset-0 -z-[1] bg-white/40 backdrop-blur-sm" />
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Get In Touch</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-4">Have Questions?</h2>
          <p className="text-slate-500 mb-8">We'd love to hear from you. Reach out for support, feedback, or partnership inquiries.</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-lg shadow-indigo-200/50 transition"
          >
            Contact Us <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-violet-600 text-center text-white fade-section">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Ready to Get Legal Assistance?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Join thousands of users who trust LegalEase for their legal needs — it's free to get started.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-3.5 rounded-xl bg-white text-indigo-700 font-semibold shadow-lg hover:shadow-xl transition"
          >
            Create Free Account
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}