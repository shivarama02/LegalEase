import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import { Scale, FileText, Heart, Briefcase, Home, Users, Cpu, Building2, Search, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  { key: 'ipc', title: 'Criminal Law', icon: Scale, color: 'from-red-500 to-rose-600', bg: 'bg-red-50', text: 'text-red-700', count: '45 laws', desc: 'Laws dealing with crimes and punishment', tags: ['Theft', 'Assault', 'Drug Offenses'] },
  { key: 'civil', title: 'Civil Law', icon: FileText, color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50', text: 'text-blue-700', count: '32 laws', desc: 'Private disputes between individuals or organizations', tags: ['Contract Disputes', 'Property Rights', 'Torts'] },
  { key: 'family', title: 'Family Law', icon: Heart, color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50', text: 'text-pink-700', count: '28 laws', desc: 'Legal matters involving family relationships', tags: ['Divorce', 'Child Custody', 'Adoption'] },
  { key: 'labour', title: 'Employment Law', icon: Briefcase, color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', text: 'text-emerald-700', count: '38 laws', desc: 'Rights and obligations in workplace relationships', tags: ['Wrongful Termination', 'Discrimination', 'Wage Laws'] },
  { key: 'property', title: 'Property Law', icon: Home, color: 'from-amber-500 to-yellow-600', bg: 'bg-amber-50', text: 'text-amber-700', count: '41 laws', desc: 'Ownership and use of real estate and personal property', tags: ['Real Estate', 'Landlord-Tenant', 'Property Rights'] },
  { key: 'consumer', title: 'Consumer Law', icon: Users, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-700', count: '25 laws', desc: 'Protection of consumer rights and fair trade practices', tags: ['Product Liability', 'False Advertising', 'Warranty'] },
  { key: 'cyber', title: 'Cyber Crime', icon: Cpu, color: 'from-sky-500 to-indigo-600', bg: 'bg-sky-50', text: 'text-sky-700', count: '20 laws', desc: 'Online fraud, hacking, phishing & identity theft', tags: ['Hacking', 'Phishing', 'Identity Theft'] },
  { key: 'corporate', title: 'Corporate Law', icon: Building2, color: 'from-indigo-500 to-violet-600', bg: 'bg-indigo-50', text: 'text-indigo-700', count: '30 laws', desc: 'Company governance, mergers & corporate misconduct', tags: ['Governance', 'Mergers', 'Compliance'] },
];

export default function LawInfo() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return CATEGORIES;
    const q = search.toLowerCase();
    return CATEGORIES.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.desc.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <UserSidebar />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                  <Scale size={18} className="text-white" />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900">Legal Information</h1>
              </div>
              <p className="text-slate-500 text-sm ml-[52px]">Browse law categories to find relevant legal provisions.</p>
            </div>

            {/* Search */}
            <div className="relative mb-8">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search law categories or topics…"
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none shadow-sm transition"
              />
            </div>

            {/* Cards Grid */}
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Search size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm">No categories match "{search}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.key}
                      onClick={() => navigate(`/user/laws/${cat.key}`)}
                      className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer overflow-hidden"
                    >
                      <div className={`h-2 bg-gradient-to-r ${cat.color}`} />
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-11 h-11 rounded-xl ${cat.bg} flex items-center justify-center`}>
                            <Icon size={20} className={cat.text} />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{cat.count}</span>
                        </div>
                        <h2 className="text-base font-bold text-slate-800 mb-1 group-hover:text-indigo-700 transition-colors">{cat.title}</h2>
                        <p className="text-xs text-slate-500 mb-3 leading-relaxed">{cat.desc}</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {cat.tags.map(t => (
                            <span key={t} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-500">{t}</span>
                          ))}
                        </div>
                        <div className="flex items-center text-xs font-semibold text-indigo-600 group-hover:gap-2 transition-all">
                          Browse <ChevronRight size={13} className="ml-0.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
