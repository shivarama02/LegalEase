import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, MessageCircle, FileText, Users, Shield, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LandingPage() {
	const navigate = useNavigate();
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
			<Navbar />

			{/* Hero Section */}
			<section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
				<div className="max-w-7xl mx-auto">
					<h2 className="text-4xl md:text-6xl font-bold mb-6">
						Your Complete{' '}
						<span className="bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">
							Legal Platform
						</span>
					</h2>
					<p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
						Access legal information, generate complaints, find lawyers, and get AI-powered assistance
						all in one comprehensive platform designed for your legal needs.
					</p>
					<div className="space-x-4">
						<button
							onClick={() => navigate('/login')}
							className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow"
						>
							Get Started
						</button>
						<button
							onClick={() => navigate('/laws')}
							className="px-6 py-3 rounded-lg border border-gray-300 text-gray-800 font-semibold hover:bg-gray-100"
						>
							Browse Laws
						</button>
					</div>
				</div>
			</section>

			{/* Features Grid */}
			<section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
				<div className="max-w-7xl mx-auto">
					<h3 className="text-3xl font-bold text-center mb-12">
						Everything You Need for Legal Assistance
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{/* Feature 1 */}
						<div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 text-center">
							<Scale className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
							<h4 className="text-xl font-semibold mb-2">Legal Information</h4>
							<p className="text-gray-600">Browse comprehensive legal information categorized by areas of law.</p>
						</div>

						{/* Feature 2 */}
						<div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 text-center">
							<MessageCircle className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
							<h4 className="text-xl font-semibold mb-2">AI Legal Assistant</h4>
							<p className="text-gray-600">Get instant answers to your legal questions with our AI-powered chatbot.</p>
						</div>

						{/* Feature 3 */}
						<div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 text-center">
							<FileText className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
							<h4 className="text-xl font-semibold mb-2">Complaint Generator</h4>
							<p className="text-gray-600">Generate professional complaint letters with our guided form system.</p>
						</div>

						{/* Feature 4 */}
						<div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 text-center">
							<Users className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
							<h4 className="text-xl font-semibold mb-2">Lawyer Directory</h4>
							<p className="text-gray-600">Find qualified lawyers by specialization, location, and fees.</p>
						</div>

						{/* Feature 5 */}
						<div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 text-center">
							<Shield className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
							<h4 className="text-xl font-semibold mb-2">Secure & Confidential</h4>
							<p className="text-gray-600">Your legal matters handled with complete privacy and security.</p>
						</div>

						{/* Feature 6 */}
						<div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 text-center">
							<Search className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
							<h4 className="text-xl font-semibold mb-2">Easy Navigation</h4>
							<p className="text-gray-600">Intuitive interface designed for quick access to legal resources.</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-500 to-blue-500 text-center text-white">
				<div className="max-w-4xl mx-auto">
					<h3 className="text-3xl font-bold mb-6">Ready to Get Legal Assistance?</h3>
					<p className="text-xl mb-8 text-white/90">
						Join thousands of users who trust LegalAssist Pro for their legal needs.
					</p>
					<button onClick={() => navigate('/login')} className="px-6 py-3 rounded-lg bg-white text-indigo-600 font-semibold shadow">
						Access Your Dashboard
					</button>
				</div>
			</section>

			<Footer />
		</div>
	);
}