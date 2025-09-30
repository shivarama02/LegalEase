import React from 'react';
import { Scale } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Scale className="h-6 w-6" />
          <span className="text-lg font-semibold">LegalAssist Pro</span>
        </div>
        <p className="text-gray-400">Professional legal assistance platform designed for everyone.</p>
      </div>
    </footer>
  );
}
