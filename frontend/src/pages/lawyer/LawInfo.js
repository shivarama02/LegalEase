import React from 'react';
import { useNavigate } from 'react-router-dom';
import LawyerSidebar from '../../components/LawyerSidebar';
import { Scale, FileText, Heart, Briefcase, Home, Users } from 'lucide-react';

// Static replica of provided Legal Information page (no dynamic data yet)
export default function LawInfo() {
	const navigate = useNavigate();
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex">
			{/* Sidebar */}
			<LawyerSidebar />
			<div className="flex-1 max-w-7xl mx-auto p-6">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-2">
							<Scale className="h-8 w-8 text-blue-600" />
							<h1 className="text-3xl font-bold text-gray-900">Legal Information</h1>
						</div>
					</div>
					{/* <button className="px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow">Ask AI Assistant</button> */}
				</div>

				{/* Search Bar */}
				<div className="mb-8 shadow bg-white rounded">
					<div className="p-6 relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" /></svg>
						</span>
						<input type="text" placeholder="Search laws, categories, or topics..." className="pl-10 h-12 w-full text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" />
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Main Content */}
					<div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Card templates */}
						<LawCategoryCard onClick={()=>navigate('/lawyer/laws/ipc')} colorBg="bg-red-100 text-red-700" icon={<Scale className="h-6 w-6" />} title="Criminal Law" count="45 laws" desc="Laws dealing with crimes and punishment" tags={['Theft','Assault','Drug Offenses','+1 more']} />
						<LawCategoryCard onClick={()=>navigate('/lawyer/laws/civil')} colorBg="bg-blue-100 text-blue-700" icon={<FileText className="h-6 w-6" />} title="Civil Law" count="32 laws" desc="Private disputes between individuals or organizations" tags={['Contract Disputes','Property Rights','Torts','+1 more']} />
						<LawCategoryCard onClick={()=>navigate('/lawyer/laws/family')} colorBg="bg-pink-100 text-pink-700" icon={<Heart className="h-6 w-6" />} title="Family Law" count="28 laws" desc="Legal matters involving family relationships" tags={['Divorce','Child Custody','Adoption','+1 more']} />
						<LawCategoryCard onClick={()=>navigate('/lawyer/laws/labour')} colorBg="bg-green-100 text-green-700" icon={<Briefcase className="h-6 w-6" />} title="Employment Law" count="38 laws" desc="Rights and obligations in workplace relationships" tags={['Wrongful Termination','Discrimination','Wage Laws','+1 more']} />
						<LawCategoryCard onClick={()=>navigate('/lawyer/laws/property')} colorBg="bg-yellow-100 text-yellow-700" icon={<Home className="h-6 w-6" />} title="Property Law" count="41 laws" desc="Ownership and use of real estate and personal property" tags={['Real Estate','Landlord-Tenant','Property Rights','+1 more']} />
						<LawCategoryCard onClick={()=>navigate('/lawyer/laws/consumer')} colorBg="bg-purple-100 text-purple-700" icon={<Users className="h-6 w-6" />} title="Consumer Law" count="25 laws" desc="Protection of consumer rights and fair trade practices" tags={['Product Liability','False Advertising','Warranty','+1 more']} />
					</div>

					{/* Sidebar (right) */}
					{/* <div className="lg:col-span-1 space-y-6">
						
						<div className="shadow bg-white rounded">
							<div className="p-4 border-b border-gray-200">
								<h3 className="text-lg font-semibold">Recently Viewed Laws</h3>
							</div>
							<div className="p-4 space-y-3">
								<RecentViewed title="Consumer Protection Act 2023" category="Consumer Law" views="1420" />
								<RecentViewed title="Employment Rights Amendment" category="Employment Law" views="987" />
								<RecentViewed title="Property Dispute Resolution" category="Property Law" views="756" />
								<RecentViewed title="Family Court Procedures" category="Family Law" views="643" />
							</div>
						</div>
						
						<div className="shadow bg-white rounded">
							<div className="p-4 border-b border-gray-200">
								<h3 className="text-lg font-semibold">Quick Actions</h3>
							</div>
							<div className="p-4 space-y-2">
								<button className="w-full py-2 border border-gray-300 rounded text-left hover:bg-gray-50">Generate Complaint</button>
								<button className="w-full py-2 border border-gray-300 rounded text-left hover:bg-gray-50">Find Legal Help</button>
								<button className="w-full py-2 border border-gray-300 rounded text-left hover:bg-gray-50">Ask AI Assistant</button>
							</div>
						</div>
					</div> */}
				</div>
			</div>
		</div>
	);
}

function LawCategoryCard({ colorBg, icon, title, count, desc, tags, onClick }) {
	return (
		<div className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-100 rounded shadow p-4" onClick={onClick}>
			<div className="flex items-center justify-between">
				<div className={`p-3 rounded-lg ${colorBg}`}>{icon}</div>
				<span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">{count}</span>
			</div>
			<h2 className="text-xl mt-2 font-semibold">{title}</h2>
			<p className="text-gray-500 mb-4">{desc}</p>
			<div className="flex flex-wrap gap-2">
				{tags.map(t => (
					<span key={t} className="border border-gray-300 rounded px-2 py-1 text-xs">{t}</span>
				))}
			</div>
		</div>
	);
}

// function RecentViewed({ title, category, views }) {
// 	return (
// 		<div className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors">
// 			<h4 className="font-medium text-sm mb-1">{title}</h4>
// 			<div className="flex items-center justify-between">
// 				<span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">{category}</span>
// 				<span className="text-xs text-gray-500">{views} views</span>
// 			</div>
// 		</div>
// 	);
// }
