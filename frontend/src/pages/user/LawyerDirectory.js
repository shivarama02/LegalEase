import React, { useEffect, useMemo, useState } from 'react';
import UserSidebar from '../../components/UserSidebar';
import { Users, MapPin, Phone, Mail, Search, Filter } from 'lucide-react';
import { apiUrl } from '../../api';
import { useNavigate } from 'react-router-dom';

export default function LawyerDirectory() {
	const navigate = useNavigate();
	const [searchText, setSearchText] = useState('');
	const [specialization, setSpecialization] = useState('All Specializations');
	const [location, setLocation] = useState('All Locations');
	const [sortBy, setSortBy] = useState('Rating');
	const [lawyers, setLawyers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const ordering = useMemo(() => {
		switch (sortBy) {
			case 'Experience':
				return '-experience_years';
			case 'Reviews':
				return '-reviews_count';
			case 'Rating':
			default:
				return '-rating';
		}
	}, [sortBy]);

	useEffect(() => {
		const controller = new AbortController();
		(async () => {
			setLoading(true);
			setError('');
			try {
				const params = new URLSearchParams();
				if (searchText.trim()) params.set('search', searchText.trim());
				if (specialization && specialization !== 'All Specializations') params.set('specialization', specialization);
				if (location && location !== 'All Locations') params.set('location', location);
				if (ordering) params.set('ordering', ordering);
				const res = await fetch(apiUrl(`/lawyers/?${params.toString()}`), { signal: controller.signal });
				if (!res.ok) throw new Error(`Failed to load lawyers (${res.status})`);
				const data = await res.json();
				setLawyers(Array.isArray(data) ? data : (data.results || []));
			} catch (e) {
				if (e.name !== 'AbortError') setError(e.message || 'Failed to load');
			} finally {
				setLoading(false);
			}
		})();
		return () => controller.abort();
	}, [searchText, specialization, location, ordering]);

	const clearFilters = () => {
		setSearchText('');
		setSpecialization('All Specializations');
		setLocation('All Locations');
		setSortBy('Rating');
	};

	const specializations = [
		'All Specializations',
		'Consumer Law',
		'Employment Law',
		'Family Law',
		'Property Law',
		'Criminal Law',
		'Civil Law',
	];
	const locations = [
		'All Locations',
		'Mumbai',
		'Delhi',
		'Bangalore',
		'Ahmedabad',
		'Hyderabad',
		'Chennai',
	];

	const formatFee = (charge) => {
		if (charge === null || charge === undefined || charge === '') return 'N/A';
		const num = Number(charge);
		if (Number.isNaN(num)) return String(charge);
		return `₹${num.toLocaleString('en-IN')}/hr`;
	};

	return (
		<div className="min-h-screen bg-gradient-subtle flex">
			<UserSidebar />
			<div className="flex-1">
				<style>{`
					.bg-gradient-subtle { background: linear-gradient(to bottom right, #f9fafb, #e5e7eb); }
					.bg-gradient-primary { background: linear-gradient(90deg, #4f46e5, #6366f1); color: #fff; }
					.bg-gradient-card { background: linear-gradient(135deg, #ffffff, #f3f4f6); }
					.shadow-custom-md { box-shadow: 0 4px 10px rgba(0,0,0,0.08); }
					.shadow-professional { box-shadow: 0 6px 15px rgba(0,0,0,0.12); }
					.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
				`}</style>

				<div className="max-w-7xl mx-auto p-6">
					<div className="flex items-center justify-between mb-8">
						<div className="flex items-center space-x-2">
							<Users className="h-8 w-8 text-blue-600" />
							<h1 className="text-3xl font-bold text-gray-900">Lawyer Directory</h1>
						</div>
						<button className="px-4 py-2 rounded bg-gradient-primary shadow-sm text-sm">Ask AI for Recommendations</button>
					</div>

					<div className="mb-8 shadow-custom-md bg-white rounded">
						<div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
							<div className="lg:col-span-2 relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
								<input
									type="text"
									placeholder="Search lawyers by name or specialization..."
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
									className="pl-10 border border-gray-300 rounded w-full py-2 text-sm focus:outline-none"
								/>
							</div>

							<select
								value={specialization}
								onChange={(e) => setSpecialization(e.target.value)}
								className="border border-gray-300 rounded w-full py-2 text-sm focus:outline-none"
							>
								{specializations.map((s) => (
									<option key={s} value={s}>{s}</option>
								))}
							</select>

							<select
								value={location}
								onChange={(e) => setLocation(e.target.value)}
								className="border border-gray-300 rounded w-full py-2 text-sm focus:outline-none"
							>
								{locations.map((l) => (
									<option key={l} value={l}>{l}</option>
								))}
							</select>

							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
								className="border border-gray-300 rounded w-full py-2 text-sm focus:outline-none"
							>
								<option>Rating</option>
								<option>Experience</option>
								<option>Reviews</option>
							</select>
						</div>
					</div>

					<div className="mb-6">
						{error ? (
							<p className="text-red-600 text-sm">{error}</p>
						) : (
							<p className="text-gray-500 text-sm">{loading ? 'Loading lawyers…' : `Showing ${lawyers.length} lawyers matching your filters`}</p>
						)}
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
						{lawyers.map((lawyer) => (
							<div key={lawyer.id} className="cursor-pointer hover:shadow-professional transition-all duration-300 bg-gradient-card rounded shadow-custom-md">
								<div className="p-4">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center space-x-2 mb-2">
												<h2 className="text-xl font-semibold">{lawyer.full_name || lawyer.lname}</h2>
												{lawyer.is_verified ? (
													<span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Verified</span>
												) : null}
											</div>
											<p className="text-blue-600 font-semibold text-sm">{lawyer.specialization || 'General Practice'}</p>
											<div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
												<MapPin className="h-4 w-4" />
												<span>{lawyer.location || '—'}</span>
											</div>
										</div>
										<div className="text-right">
											<div className="flex items-center space-x-1 mb-1">
												<span className="text-yellow-400 text-xs leading-none">★ ★ ★ ★ ★</span>
												<span className="text-sm font-semibold">{Number(lawyer.rating || 0).toFixed(1)}</span>
											</div>
											<p className="text-xs text-gray-500">({lawyer.reviews_count || 0} reviews)</p>
										</div>
									</div>
									<p className="text-sm text-gray-500 mb-4 line-clamp-2">{lawyer.bio || '—'}</p>
									<div className="space-y-2 text-sm">
										<div className="flex items-center justify-between">
											<span className="text-gray-500">Experience:</span>
											<span className="font-medium">{lawyer.experience_years || 0} years</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-gray-500">Fee:</span>
											<span className="font-medium text-blue-600">{formatFee(lawyer.charge)}</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-gray-500">Languages:</span>
											<span className="font-medium">{lawyer.languages || '—'}</span>
										</div>
									</div>
									<div className="flex space-x-2 mt-4">
										<button onClick={() => navigate(`/user/lawyers/${lawyer.id}`)} className="flex-1 py-2 rounded bg-gradient-primary text-white text-sm">View Profile</button>
										<a href={lawyer.phone ? `tel:${lawyer.phone}` : undefined} className="flex-1 py-2 rounded border border-gray-300 flex items-center justify-center text-sm bg-white hover:bg-gray-50">
											<Phone className="h-3 w-3 mr-1" /> Call
										</a>
										<a href={lawyer.email ? `mailto:${lawyer.email}` : undefined} className="flex-1 py-2 rounded border border-gray-300 flex items-center justify-center text-sm bg-white hover:bg-gray-50">
											<Mail className="h-3 w-3 mr-1" /> Email
										</a>
									</div>
								</div>
							</div>
						))}
					</div>

					{!loading && !error && lawyers.length === 0 && (
						<div className="shadow-custom-md bg-white rounded mt-6">
							<div className="p-8 text-center">
								<Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold text-gray-900 mb-2">No Lawyers Found</h3>
								<p className="text-gray-500 mb-4 text-sm">No lawyers match your current search criteria. Try adjusting your filters.</p>
								<button onClick={clearFilters} className="border border-gray-300 rounded px-3 py-2 flex items-center justify-center mx-auto text-sm">
									<Filter className="h-4 w-4 mr-2" />
									Clear Filters
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
