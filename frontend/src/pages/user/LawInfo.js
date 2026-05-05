import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import { apiUrl } from '../../api';
import { Scale, FolderOpen, Search, ChevronRight, Loader2 } from 'lucide-react';

const COLORS = [
  { color: 'from-red-500 to-rose-600', bg: 'bg-red-50', text: 'text-red-700' },
  { color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50', text: 'text-blue-700' },
  { color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50', text: 'text-pink-700' },
  { color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  { color: 'from-amber-500 to-yellow-600', bg: 'bg-amber-50', text: 'text-amber-700' },
  { color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-700' },
  { color: 'from-sky-500 to-indigo-600', bg: 'bg-sky-50', text: 'text-sky-700' },
  { color: 'from-indigo-500 to-violet-600', bg: 'bg-indigo-50', text: 'text-indigo-700' },
];

export default function LawInfo() {
  const navigate = useNavigate();
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(apiUrl('/law-domains/'))
      .then(r => r.json())
      .then(d => setDomains(Array.isArray(d) ? d : d.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = [];
    domains.forEach(d =>
      (d.categories || []).forEach(c =>
        cats.push({
          ...c,
          domainName: d.domain_name,
        })
      )
    );
    return cats;
  }, [domains]);

  const domainOrder = useMemo(() => {
    const seen = new Set();
    const order = [];
    domains.forEach(d => {
      const name = (d.domain_name || '').trim();
      if (!name || seen.has(name)) return;
      seen.add(name);
      order.push(name);
    });
    return order;
  }, [domains]);

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter(c =>
      (c.category_name || '').toLowerCase().includes(q) ||
      (c.domainName || '').toLowerCase().includes(q)
    );
  }, [categories, search]);

  const grouped = useMemo(() => {
    const map = new Map();
    domainOrder.forEach(name => map.set(name, []));

    filtered.forEach(cat => {
      const name = (cat.domainName || '').trim() || 'Other';
      if (!map.has(name)) map.set(name, []);
      map.get(name).push(cat);
    });

    return Array.from(map.entries())
      .map(([domainName, items]) => ({ domainName, items }))
      .filter(section => section.items.length > 0);
  }, [filtered, domainOrder]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <UserSidebar />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                    <Scale size={18} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-extrabold text-slate-900">Legal Information</h1>
                </div>
                <p className="text-slate-500 text-sm ml-[52px] text-left">Browse law categories to find relevant legal provisions.</p>
              </div>

              <div className="relative w-full sm:w-[420px]">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search law categories or topics…"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none shadow-sm transition"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-24 text-center"><Loader2 size={28} className="mx-auto text-indigo-500 animate-spin mb-3" /><p className="text-sm text-slate-500">Loading categories…</p></div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center"><Search size={32} className="mx-auto text-slate-300 mb-3" /><p className="text-slate-500 text-sm">{search ? `No categories match "${search}"` : 'No categories available.'}</p></div>
            ) : (
              <div className="space-y-10">
                {grouped.map(section => {
                  return (
                    <div key={section.domainName}>
                      <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-lg font-extrabold text-slate-900">{section.domainName}</h2>
                        <div className="h-px flex-1 bg-slate-200" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                        {section.items.map((cat, i) => {
                          const c = COLORS[i % COLORS.length];
                          return (
                            <div key={cat.id} onClick={() => navigate(`/user/laws/${cat.slug}`)}
                              className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer overflow-hidden">
                              <div className={`h-2 bg-gradient-to-r ${c.color}`} />
                              <div className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                  <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center`}>
                                    <FolderOpen size={20} className={c.text} />
                                  </div>
                                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{cat.laws_count ?? 0} laws</span>
                                </div>
                                <h3 className="text-base font-bold text-slate-800 mb-1 group-hover:text-indigo-700 transition-colors">{cat.category_name}</h3>
                                <p className="text-xs text-slate-500 mb-2 leading-relaxed line-clamp-2">{cat.description}</p>
                                <div className="flex items-center text-xs font-semibold text-indigo-600 mt-3 group-hover:gap-2 transition-all">
                                  Browse <ChevronRight size={13} className="ml-0.5" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
