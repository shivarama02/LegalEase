import React from 'react';
import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scale className="h-8 w-8 text-indigo-500" />
            <h1 className="text-2xl font-bold">LegalEase</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/" className="px-4 py-2 rounded-lg text-gray-800 hover:bg-gray-100 font-medium">Home</Link>
            <Link to="/about" className="px-4 py-2 rounded-lg text-gray-800 hover:bg-gray-100 font-medium">About</Link>
            <Link to="/contact" className="px-4 py-2 rounded-lg text-gray-800 hover:bg-gray-100 font-medium">Contact</Link>
            <Link to="/login" className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow">Login</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
