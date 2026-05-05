import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Scale, User, Briefcase, Eye, EyeOff } from 'lucide-react';
import { API_BASE } from '../../api';

const ROLES = ['User', 'Lawyer'];

export default function Signup() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const role = ROLES[roleIndex];
  const navigate = useNavigate();

  const highlightStyle = useMemo(() => ({
    transform: `translateX(${roleIndex * 100}%)`,
  }), [roleIndex]);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    let payload = null;

    if (role === 'User') {
      payload = {
        cname: form.get('fullName'),
        email: form.get('email'),
        phone: form.get('phone'),
        username: form.get('username'),
        password: form.get('password'),
      };
    } else if (role === 'Lawyer') {
      payload = {
        lname: form.get('fullName'),
        email: form.get('email'),
        phone: form.get('phone'),
        username: form.get('username'),
        password: form.get('password'),
        lawyer_id: form.get('lawyerId'),
        specialization: '',
        experience_years: 0,
        location: '',
        charge: 0,
      };
    } else if (role === 'Admin') {
      alert('Admin signup not implemented');
      return;
    }

    const email = String(payload.email || '').trim().toLowerCase();
    if (!email) {
      alert('Please enter a valid email');
      return;
    }

    // Pre-check duplicates BEFORE sending OTP
    try {
      if (role === 'User') {
        const username = String(payload.username || '').trim();
        const phone = String(payload.phone || '').trim();
        const checkRes = await fetch(`${API_BASE}/auth/signup/user/check/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, phone }),
        });
        const checkJson = await checkRes.json();

        if (!checkRes.ok) {
          if (checkRes.status === 409 && checkJson.errors) {
            const errors = checkJson.errors;

            if (errors.username) {
              alert('Username already taken');
              return;
            }

            if (errors.phone) {
              alert('Phone number already exist');
              return;
            }
          }

          alert(checkJson.detail || 'User availability check failed');
          return;
        }
      }

      if (role === 'Lawyer') {
        const lawyerId = String(payload.lawyer_id || '').trim();
        if (!lawyerId) {
          alert('Please enter a valid Lawyer ID');
          return;
        }
        const username = String(payload.username || '').trim();
        const phone = String(payload.phone || '').trim();
        const checkRes = await fetch(`${API_BASE}/auth/signup/lawyer/check/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, phone, lawyer_id: lawyerId }),
        });
        const checkJson = await checkRes.json();

        if (!checkRes.ok) {
          if (checkRes.status === 409 && checkJson.errors) {
            const errors = checkJson.errors;

            if (errors.lawyer_id) {
              alert('Lawyer ID already registered');
              return;
            }

            if (errors.username) {
              alert('Username already taken');
              return;
            }

            if (errors.phone) {
              alert('Phone number already exist');
              return;
            }
          }

          alert(checkJson.detail || 'Lawyer availability check failed');
          return;
        }
      }
    } catch (err) {
      alert('Availability check failed: ' + err.message);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/otp/send/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || 'Failed to send OTP');

      sessionStorage.setItem('pendingSignupRole', role.toLowerCase());
      sessionStorage.setItem('pendingSignupPayload', JSON.stringify(payload));
      sessionStorage.setItem('pendingOtpSent', 'true');
      navigate('/verify-otp');
    } catch (err) {
      alert('OTP send failed: ' + err.message);
    }
  }

  const inputCls = 'w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition';

  return (
    <div className="min-h-screen text-slate-900 flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50" />
        <div className="absolute top-20 -right-20 w-72 h-72 bg-violet-100/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 -left-20 w-80 h-80 bg-indigo-100/30 rounded-full blur-3xl animate-float-reverse" />

        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <Scale size={20} className="text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">
              Legal<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Ease</span>
            </span>
          </div>

          {/* Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-lg p-7">
            <h2 className="text-xl font-bold text-center mb-1">Create an account</h2>
            <p className="text-sm text-slate-500 text-center mb-6">Join LegalEase for free and get started</p>

            {/* Role selector */}
            <div className="relative mb-6">
              <div className="relative grid grid-cols-2 bg-slate-100 rounded-xl p-1">
                <div
                  className="absolute top-1 left-1 h-[calc(100%-0.5rem)] w-[calc(50%-0.25rem)] rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 shadow-sm transition-transform duration-300"
                  style={highlightStyle}
                />
                {ROLES.map((r, i) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoleIndex(i)}
                    className={`relative z-10 px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                      roleIndex === i ? 'text-white' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {i === 0 ? <User size={14} /> : <Briefcase size={14} />}
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form className="space-y-3.5" onSubmit={handleSubmit}>
              {role === 'User' && (
                <>
                  <div>
                    <label className="block mb-1.5 text-xs font-medium text-slate-600">Full Name</label>
                    <input name="fullName" type="text" required className={inputCls} placeholder="Your full name" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1.5 text-xs font-medium text-slate-600">Email</label>
                      <input
                        name="email"
                        type="email"
                        required
                        className={inputCls}
                        placeholder="you@gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-xs font-medium text-slate-600">Phone</label>
                      <input name="phone" type="text" required className={inputCls} placeholder="XXXXX XXXXX" />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-medium text-slate-600">Username</label>
                    <input name="username" type="text" required className={inputCls} placeholder="Choose a username" />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-medium text-slate-600">Password</label>
                    <div className="relative">
                      <input name="password" type={showPw ? 'text' : 'password'} required className={`${inputCls} pr-10`} placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {role === 'Lawyer' && (
                <>
                  <div>
                    <label className="block mb-1.5 text-xs font-medium text-slate-600">Full Name</label>
                    <input name="fullName" type="text" required className={inputCls} placeholder="Jane Advocate" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1.5 text-xs font-medium text-slate-600">Email</label>
                      <input
                        name="email"
                        type="email"
                        required
                        className={inputCls}
                        placeholder="lawyer@example.com"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-xs font-medium text-slate-600">Phone</label>
                      <input name="phone" type="text" required className={inputCls} placeholder="XXXXXXXXXX" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1.5 text-xs font-medium text-slate-600">Username</label>
                      <input name="username" type="text" required className={inputCls} placeholder="Choose a username" />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-xs font-medium text-slate-600">Lawyer ID</label>
                      <input name="lawyerId" type="text" required className={inputCls} placeholder="LWR-12345" />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-medium text-slate-600">Password</label>
                    <div className="relative">
                      <input name="password" type={showPw ? 'text' : 'password'} required className={`${inputCls} pr-10`} placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-sm transition"
              >
                Submit as {role}
              </button>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">Sign in</Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
