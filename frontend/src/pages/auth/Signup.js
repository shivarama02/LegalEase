import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Show only User and Lawyer (Admin hidden from UI)
const ROLES = ['User', 'Lawyer'];

export default function Signup() {
  const [roleIndex, setRoleIndex] = useState(0);
  const role = ROLES[roleIndex];
  const navigate = useNavigate();

  const highlightStyle = useMemo(() => ({
    transform: `translateX(${roleIndex * 100}%)`,
  }), [roleIndex]);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    let endpoint = '';
    let payload = {};

    if (role === 'User') {
      endpoint = 'http://localhost:8000/api/auth/signup/user/';
      payload = {
        cname: form.get('fullName'),
        email: form.get('email'),
        phone: form.get('phone'),
        username: form.get('username'),
        password: form.get('password'),
      };
    } else if (role === 'Lawyer') {
      endpoint = 'http://localhost:8000/api/auth/signup/lawyer/';
      payload = {
        lname: form.get('fullName'),
        email: form.get('email'),
        phone: form.get('phone'),
        username: form.get('username'),
        password: form.get('password'),
        lawyer_id: form.get('lawyerId'),
      };
    } else if (role === 'Admin') {
      alert('Admin signup not implemented');
      return;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(json));
  console.log('Signup success:', json);
  // Optionally store a flash flag
  sessionStorage.setItem('justSignedUpRole', role.toLowerCase());
  navigate('/login');
    } catch (err) {
      console.error(err);
      alert('Signup failed: ' + err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-[70vh] flex items-center justify-center py-12">
          <div className="w-full max-w-md bg-white border rounded-2xl shadow p-6 md:p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Create an account</h2>

            {/* Sliding role selector */}
            <div className="relative mb-6">
              <div className="relative grid grid-cols-2 bg-gray-100 rounded-full p-1">
                <div
                  className="absolute top-1 left-1 h-[calc(100%-0.5rem)] w-1/2 rounded-full bg-white shadow transition-transform duration-300"
                  style={highlightStyle}
                />
                {ROLES.map((r, i) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoleIndex(i)}
                    className={`relative z-10 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                      roleIndex === i ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {role === 'User' && (
                <>
                  <div>
                    <label htmlFor="fullName" className="block text-sm mb-1 text-left">Full Name</label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="userEmail" className="block text-sm mb-1 text-left">Email</label>
                    <input
                      id="userEmail"
                      name="email"
                      type="email"
                      required
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm mb-1 text-left">Phone</label>
                    <input
                      id="phone"
                      name="phone"
                      type="text"
                      required
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="XXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label htmlFor="username" className="block text-sm mb-1 text-left">Username</label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="choose a username"
                    />
                  </div>
                  <div>
                    <label htmlFor="userPassword" className="block text-sm mb-1 text-left">Password</label>
                    <input
                      id="userPassword"
                      name="password"
                      type="password"
                      required
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                </>
              )}

              {role === 'Lawyer' && (
                <>
                  <div>
                    <label htmlFor="lawyerFullName" className="block text-sm mb-1 text-left">Full Name</label>
                    <input
                      id="lawyerFullName"
                      name="fullName"
                      type="text"
                      required
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Jane Advocate"
                    />
                  </div>
                  <div>
                    <label htmlFor="lawyerEmail" className="block text-sm mb-1 text-left">Email</label>
                    <input
                      id="lawyerEmail"
                      name="email"
                      type="email"
                      required
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="lawyer@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm mb-1 text-left">Phone</label>
                    <input
                      id="phone"
                      name="phone"
                      type="text"
                      required
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="XXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label htmlFor="username" className="block text-sm mb-1 text-left">Username</label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="choose a username"
                    />
                  </div>
                  <div>
                    <label htmlFor="lawyerId" className="block text-sm mb-1 text-left">Lawyer ID</label>
                    <input
                      id="lawyerId"
                      name="lawyerId"
                      type="text"
                      required
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="LWR-12345"
                    />
                  </div>
                  <div>
                    <label htmlFor="lawyerPassword" className="block text-sm mb-1 text-left">Password</label>
                    <input
                      id="lawyerPassword"
                      name="password"
                      type="password"
                      required
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                </>
              )}

              {/* Admin form is hidden intentionally */}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 font-medium transition"
              >
                Sign up as {role}
              </button>

              <p className="mt-4 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
