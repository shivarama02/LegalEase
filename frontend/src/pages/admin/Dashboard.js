import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
        <p className="text-gray-700">Welcome admin! (Placeholder content)</p>
      </main>
      <Footer />
    </div>
  );
}
