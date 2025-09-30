import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      <Navbar />
      <h2 className="text-2xl font-semibold mb-2">About</h2>
      <p>
        Legalease is a platform to browse legal information and connect with qualified lawyers.
      </p>
      <Footer />
    </div>
  );
}

