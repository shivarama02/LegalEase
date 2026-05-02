import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Scale, MailCheck } from 'lucide-react';
import { API_BASE } from '../../api';

export default function OtpVerify() {
  const navigate = useNavigate();
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpStatus, setOtpStatus] = useState('');

  const pendingPayload = useMemo(() => {
    const raw = sessionStorage.getItem('pendingSignupPayload');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const role = useMemo(() => sessionStorage.getItem('pendingSignupRole') || '', []);
  const email = useMemo(() => {
    if (!pendingPayload) return '';
    return String(pendingPayload.email || '').trim().toLowerCase();
  }, [pendingPayload]);

  useEffect(() => {
    if (!email || !role || !pendingPayload) {
      navigate('/signup');
      return;
    }
  }, [email, role, pendingPayload, navigate]);

  useEffect(() => {
    if (!email || !role || !pendingPayload) {
      return;
    }

    const alreadySent = sessionStorage.getItem('pendingOtpSent') === 'true';
    if (!alreadySent) {
      handleSendOtp();
    }
  }, [email, role, pendingPayload]);

  async function handleSendOtp() {
    if (!email) {
      setOtpStatus('Email not found. Please sign up again.');
      return;
    }
    setOtpBusy(true);
    setOtpStatus('Sending OTP...');
    try {
      const res = await fetch(`${API_BASE}/auth/otp/send/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || 'Failed to send OTP');
      setOtpVerified(false);
      setOtpStatus('OTP sent to your email. It is valid for 2 minutes.');
      sessionStorage.setItem('pendingOtpSent', 'true');
    } catch (err) {
      setOtpStatus(`OTP send failed: ${err.message}`);
    } finally {
      setOtpBusy(false);
    }
  }

  async function handleVerifyOtp() {
    if (!email || !otpCode.trim()) {
      setOtpStatus('Enter OTP to continue');
      return;
    }
    setOtpBusy(true);
    setOtpStatus('Verifying OTP...');
    try {
      const res = await fetch(`${API_BASE}/auth/otp/verify/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || 'Invalid OTP');
      setOtpVerified(true);
      setOtpStatus('Email verified successfully');

      const endpoint = role === 'lawyer'
        ? `${API_BASE}/auth/signup/lawyer/`
        : `${API_BASE}/auth/signup/user/`;

      const signupRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingPayload),
      });
      const signupJson = await signupRes.json();
      if (!signupRes.ok) {
        const errDetail = typeof signupJson === 'string'
          ? signupJson
          : signupJson.detail || JSON.stringify(signupJson);
        throw new Error(errDetail || 'Signup failed');
      }

      sessionStorage.removeItem('pendingSignupRole');
      sessionStorage.removeItem('pendingSignupPayload');
      sessionStorage.removeItem('pendingOtpSent');
      sessionStorage.setItem('justSignedUpRole', role);
      navigate('/login');
    } catch (err) {
      setOtpVerified(false);
      setOtpStatus(`OTP verification failed: ${err.message}`);
    } finally {
      setOtpBusy(false);
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
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <Scale size={20} className="text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">
              Legal<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Ease</span>
            </span>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-lg p-7">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <MailCheck size={18} />
              </div>
              <h2 className="text-xl font-bold">Verify your email</h2>
            </div>
            <p className="text-sm text-slate-500 text-center mb-6">
              We sent a one-time code to <span className="font-semibold text-slate-700">{email || 'your email'}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-medium text-slate-600">OTP code</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className={inputCls}
                  placeholder="6-digit OTP"
                  maxLength={6}
                />
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={otpBusy || !otpCode.trim()}
                className="w-full py-2.5 rounded-xl text-xs font-semibold border border-emerald-300 text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
              >
                Verify & Create Account
              </button>

              {otpStatus && (
                <p className={`text-xs ${otpVerified ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {otpStatus}
                </p>
              )}

              <p className="text-center text-sm text-slate-500">
                Entered wrong email?{' '}
                <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-semibold">Go back</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
