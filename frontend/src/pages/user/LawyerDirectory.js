import React, { useEffect, useMemo, useState } from 'react';
import UserSidebar from '../../components/UserSidebar';
import {
	Users, MapPin, Phone, Mail, Search, SlidersHorizontal, X,
	Star, Briefcase, IndianRupee, ChevronDown, Loader2, Scale,
} from 'lucide-react';
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

	// New range filters (client-side)
	const [minRating, setMinRating] = useState(0);
	const [priceRange, setPriceRange] = useState([0, 50000]);
	const [minExperience, setMinExperience] = useState(0);
	const [showFilters, setShowFilters] = useState(false);

	const ordering = useMemo(() => {
		switch (sortBy) {
			case 'Experience':
				return '-experience_years';
			case 'Reviews':
				return '-reviews_count';
			case 'Price: Low → High':
				return 'charge';
			case 'Price: High → Low':
				return '-charge';
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

	// Client-side range filtering
	const filteredLawyers = useMemo(() => {
		return lawyers.filter((l) => {
			const rating = Number(l.rating || 0);
			const charge = Number(l.charge || 0);
			const exp = Number(l.experience_years || 0);
			if (rating < minRating) return false;
			if (charge < priceRange[0] || charge > priceRange[1]) return false;
			if (exp < minExperience) return false;
			return true;
		});
	}, [lawyers, minRating, priceRange, minExperience]);

	const activeFilterCount = [
		specialization !== 'All Specializations',
		location !== 'All Locations',
		minRating > 0,
		priceRange[0] > 0 || priceRange[1] < 50000,
		minExperience > 0,
	].filter(Boolean).length;

	const clearFilters = () => {
		setSearchText('');
		setSpecialization('All Specializations');
		setLocation('All Locations');
		setSortBy('Rating');
		setMinRating(0);
		setPriceRange([0, 50000]);
		setMinExperience(0);
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

	const ratingOptions = [
		{ label: 'Any Rating', value: 0 },
		{ label: '4+ Stars', value: 4 },
		{ label: '3+ Stars', value: 3 },
		{ label: '2+ Stars', value: 2 },
	];

	const experienceOptions = [
		{ label: 'Any Experience', value: 0 },
		{ label: '1+ years', value: 1 },
		{ label: '3+ years', value: 3 },
		{ label: '5+ years', value: 5 },
		{ label: '10+ years', value: 10 },
	];

	const pricePresets = [
		{ label: 'Any Price', min: 0, max: 50000 },
		{ label: 'Under ₹500/hr', min: 0, max: 500 },
		{ label: '₹500 – ₹2,000/hr', min: 500, max: 2000 },
		{ label: '₹2,000 – ₹5,000/hr', min: 2000, max: 5000 },
		{ label: '₹5,000+/hr', min: 5000, max: 50000 },
	];

	const formatFee = (charge) => {
		if (charge === null || charge === undefined || charge === '') return 'N/A';
		const num = Number(charge);
		if (Number.isNaN(num)) return String(charge);
		return `₹${num.toLocaleString('en-IN')}/hr`;
	};

	const renderStars = (rating) => {
		const r = Number(rating || 0);
		return (
			<div className="flex items-center gap-0.5">
				{[1, 2, 3, 4, 5].map((i) => (
					<Star key={i} size={12} className={i <= Math.round(r) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
				))}
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-slate-50 flex">
			<UserSidebar />
			<div className="flex-1 overflow-y-auto">
				<div className="max-w-7xl mx-auto px-6 py-8">

					{/* ── Header ──────────────────────────────────────────── */}
					<div className="mb-8">
						<div className="flex items-center gap-3 mb-1">
							<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
								<Scale size={20} className="text-white" />
							</div>
							<div>
								<h1 className="text-2xl font-bold text-slate-900">Lawyer Directory</h1>
								<p className="text-sm text-slate-500">Find the right legal expert for your needs</p>
							</div>
						</div>
					</div>

					{/* ── Search Bar ──────────────────────────────────────── */}
					<div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6">
						<div className="flex items-center gap-3 px-5 py-4">
							<Search size={18} className="text-slate-400 flex-shrink-0" />
							<input
								type="text"
								placeholder="Search by name, specialization, or location…"
								value={searchText}
								onChange={(e) => setSearchText(e.target.value)}
								className="flex-1 text-sm outline-none bg-transparent text-slate-800 placeholder-slate-400"
							/>
							{searchText && (
								<button onClick={() => setSearchText('')} className="p-1 rounded-full hover:bg-slate-100">
									<X size={14} className="text-slate-400" />
								</button>
							)}
							<div className="w-px h-6 bg-slate-200" />
							<button
								onClick={() => setShowFilters((v) => !v)}
								className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition
									${showFilters || activeFilterCount > 0
										? 'bg-indigo-50 text-indigo-600'
										: 'text-slate-500 hover:bg-slate-100'}`}
							>
								<SlidersHorizontal size={14} />
								Filters
								{activeFilterCount > 0 && (
									<span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
										{activeFilterCount}
									</span>
								)}
							</button>
						</div>

						{/* ── Expandable Filter Panel ─────────────────────── */}
						{showFilters && (
							<div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50 rounded-b-2xl">
								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
									{/* Specialization */}
									<div>
										<label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
											Specialization
										</label>
										<div className="relative">
											<select
												value={specialization}
												onChange={(e) => setSpecialization(e.target.value)}
												className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 pr-8 bg-white text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
											>
												{specializations.map((s) => <option key={s} value={s}>{s}</option>)}
											</select>
											<ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
										</div>
									</div>

									{/* Location */}
									<div>
										<label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
											Location
										</label>
										<div className="relative">
											<select
												value={location}
												onChange={(e) => setLocation(e.target.value)}
												className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 pr-8 bg-white text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
											>
												{locations.map((l) => <option key={l} value={l}>{l}</option>)}
											</select>
											<ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
										</div>
									</div>

									{/* Rating */}
									<div>
										<label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
											Rating
										</label>
										<div className="relative">
											<select
												value={minRating}
												onChange={(e) => setMinRating(Number(e.target.value))}
												className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 pr-8 bg-white text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
											>
												{ratingOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
											</select>
											<ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
										</div>
									</div>

									{/* Price Range */}
									<div>
										<label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
											Price Range
										</label>
										<div className="relative">
											<select
												value={`${priceRange[0]}-${priceRange[1]}`}
												onChange={(e) => {
													const [min, max] = e.target.value.split('-').map(Number);
													setPriceRange([min, max]);
												}}
												className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 pr-8 bg-white text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
											>
												{pricePresets.map((p) => (
													<option key={p.label} value={`${p.min}-${p.max}`}>{p.label}</option>
												))}
											</select>
											<ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
										</div>
									</div>

									{/* Experience */}
									<div>
										<label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
											Experience
										</label>
										<div className="relative">
											<select
												value={minExperience}
												onChange={(e) => setMinExperience(Number(e.target.value))}
												className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 pr-8 bg-white text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
											>
												{experienceOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
											</select>
											<ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
										</div>
									</div>
								</div>

								{/* Sort & Clear */}
								<div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200">
									<div className="flex items-center gap-2">
										<span className="text-xs text-slate-500 font-medium">Sort by:</span>
										{['Rating', 'Experience', 'Price: Low → High', 'Price: High → Low'].map((s) => (
											<button
												key={s}
												onClick={() => setSortBy(s)}
												className={`px-3 py-1 rounded-lg text-xs font-medium transition
													${sortBy === s
														? 'bg-indigo-600 text-white shadow-sm'
														: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
											>
												{s}
											</button>
										))}
									</div>
									{activeFilterCount > 0 && (
										<button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium">
											<X size={12} /> Clear all filters
										</button>
									)}
								</div>
							</div>
						)}
					</div>

					{/* ── Active Filter Chips ────────────────────────────── */}
					{activeFilterCount > 0 && !showFilters && (
						<div className="flex flex-wrap items-center gap-2 mb-5">
							<span className="text-xs text-slate-500">Active filters:</span>
							{specialization !== 'All Specializations' && (
								<span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">
									{specialization}
									<button onClick={() => setSpecialization('All Specializations')}><X size={10} /></button>
								</span>
							)}
							{location !== 'All Locations' && (
								<span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">
									{location}
									<button onClick={() => setLocation('All Locations')}><X size={10} /></button>
								</span>
							)}
							{minRating > 0 && (
								<span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">
									{minRating}+ Stars
									<button onClick={() => setMinRating(0)}><X size={10} /></button>
								</span>
							)}
							{(priceRange[0] > 0 || priceRange[1] < 50000) && (
								<span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
									₹{priceRange[0].toLocaleString('en-IN')} – ₹{priceRange[1].toLocaleString('en-IN')}
									<button onClick={() => setPriceRange([0, 50000])}><X size={10} /></button>
								</span>
							)}
							{minExperience > 0 && (
								<span className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-700 rounded-lg text-xs font-medium">
									{minExperience}+ yrs
									<button onClick={() => setMinExperience(0)}><X size={10} /></button>
								</span>
							)}
							<button onClick={clearFilters} className="text-[11px] text-slate-400 hover:text-red-500 underline ml-1">Clear all</button>
						</div>
					)}

					{/* ── Results Count ────────────────────────────────────── */}
					<div className="mb-5 flex items-center justify-between">
						{error ? (
							<p className="text-red-600 text-sm font-medium">{error}</p>
						) : loading ? (
							<div className="flex items-center gap-2 text-slate-400">
								<Loader2 size={14} className="animate-spin" />
								<span className="text-sm">Loading lawyers…</span>
							</div>
						) : (
							<p className="text-sm text-slate-500">
								Showing <span className="font-semibold text-slate-700">{filteredLawyers.length}</span> lawyer{filteredLawyers.length !== 1 ? 's' : ''}
							</p>
						)}
					</div>

					{/* ── Lawyer Cards ─────────────────────────────────────── */}
					<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
						{filteredLawyers.map((lawyer) => (
							<div
								key={lawyer.id}
								onClick={() => navigate(`/user/lawyers/${lawyer.id}`)}
								className="group cursor-pointer bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-300"
							>
								<div className="p-5">
									{/* Top Row */}
									<div className="flex items-start gap-3.5 mb-4">
										<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center font-bold text-indigo-700 text-lg flex-shrink-0 select-none group-hover:from-indigo-200 group-hover:to-violet-200 transition-colors">
											{(lawyer.full_name || lawyer.lname || 'L').charAt(0).toUpperCase()}
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-0.5">
												<h2 className="text-base font-bold text-slate-800 truncate">{lawyer.full_name || lawyer.lname}</h2>
												{lawyer.is_verified && (
													<span className="flex-shrink-0 inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
														✓ Verified
													</span>
												)}
											</div>
											<p className="text-sm font-semibold text-indigo-600">{lawyer.specialization || 'General Practice'}</p>
											<div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
												<MapPin size={11} />
												<span>{lawyer.location || '—'}</span>
											</div>
										</div>
									</div>

									{/* Rating & Stats */}
									<div className="flex items-center gap-4 mb-4 py-2.5 px-3 bg-slate-50 rounded-xl">
										<div className="flex items-center gap-1.5">
											{renderStars(lawyer.rating)}
											<span className="text-sm font-bold text-slate-800">{Number(lawyer.rating || 0).toFixed(1)}</span>
											<span className="text-[11px] text-slate-400">({lawyer.reviews_count || 0})</span>
										</div>
										<div className="w-px h-4 bg-slate-200" />
										<div className="flex items-center gap-1 text-xs text-slate-600">
											<Briefcase size={11} />
											<span className="font-medium">{lawyer.experience_years || 0} yrs</span>
										</div>
										<div className="w-px h-4 bg-slate-200" />
										<div className="flex items-center gap-1 text-xs font-semibold text-indigo-600">
											<IndianRupee size={11} />
											<span>{formatFee(lawyer.charge).replace('₹', '')}</span>
										</div>
									</div>

									{/* Bio */}
									<p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{lawyer.bio || 'No bio available.'}</p>

									{/* Actions */}
									<div className="flex gap-2">
										<button
											onClick={(e) => { e.stopPropagation(); navigate(`/user/lawyers/${lawyer.id}`); }}
											className="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-semibold transition shadow-sm"
										>
											View Profile
										</button>
										<a
											href={lawyer.phone ? `tel:${lawyer.phone}` : undefined}
											onClick={(e) => e.stopPropagation()}
											className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition flex items-center justify-center"
										>
											<Phone size={14} className="text-slate-600" />
										</a>
										<a
											href={lawyer.email ? `mailto:${lawyer.email}` : undefined}
											onClick={(e) => e.stopPropagation()}
											className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition flex items-center justify-center"
										>
											<Mail size={14} className="text-slate-600" />
										</a>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* ── Empty State ──────────────────────────────────────── */}
					{!loading && !error && filteredLawyers.length === 0 && (
						<div className="bg-white rounded-2xl border border-slate-200 mt-6">
							<div className="py-16 px-8 text-center">
								<div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
									<Users size={28} className="text-slate-400" />
								</div>
								<h3 className="text-lg font-bold text-slate-800 mb-2">No Lawyers Found</h3>
								<p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
									No lawyers match your current filters. Try adjusting your search or clearing the filters.
								</p>
								<button
									onClick={clearFilters}
									className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
								>
									<X size={14} />
									Clear All Filters
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
