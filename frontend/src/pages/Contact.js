import React from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      <Navbar />
      <h2 className="text-2xl font-semibold mb-2">Contact</h2>
      <p>Email: support@legalease.local</p>
      <p>Phone: +1 (555) 123-4567</p>
      <Footer />
    </div>
  );
}

