import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import { ArrowLeft, Search, Scale, FileText, ChevronRight, Loader2, AlertCircle, BookOpen } from 'lucide-react';

const LABEL_MAP = {
  consumer: 'Consumer Law',
  ipc: 'Criminal Law',
  civil: 'Civil Law',
  labour: 'Employment Law',
  family: 'Family Law',
  cyber: 'Cyber Crime',
  property: 'Property Law',
  corporate: 'Corporate / Company',
};

export default function LawList() {
  const { category } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const API_BASE = process.env.REACT_APP_API || 'http://localhost:8000';
    fetch(`${API_BASE}/api/lawdetails/?category=${encodeURIComponent(category)}`)
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `Failed to load laws for ${category} (HTTP ${res.status})`);
        }
        if (!contentType.includes('application/json')) {
          const txt = await res.text();
          throw new Error(`Unexpected response (not JSON): ${txt?.slice(0, 120)}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setItems(Array.isArray(data) ? data : data.results || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    return () => { isMounted = false; };
  }, [category]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(l =>
      l.title?.toLowerCase().includes(q) ||
      l.statute_name?.toLowerCase().includes(q) ||
      l.summary?.toLowerCase().includes(q) ||
      l.section_reference?.toLowerCase().includes(q)
    );
  }, [items, search]);

  const goDetail = (id) => navigate(`/user/laws/${category}/${id}`);
  const categoryLabel = LABEL_MAP[category] || category;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <UserSidebar />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">

            {/* Header */}
            <div className="mb-6">
              <button onClick={() => window.history.back()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition mb-3">
                <ArrowLeft size={15} /> Back to categories
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                  <Scale size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">{categoryLabel}</h1>
                  {!loading && <p className="text-xs text-slate-500">{items.length} law{items.length !== 1 ? 's' : ''} found</p>}
                </div>
              </div>
            </div>

            {/* Search */}
            {!loading && !error && items.length > 0 && (
              <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search within this category…"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none shadow-sm transition"
                />
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="py-24 text-center">
                <Loader2 size={28} className="mx-auto text-indigo-500 animate-spin mb-3" />
                <p className="text-sm text-slate-500">Loading laws…</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="py-16 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-3">
                  <AlertCircle size={22} className="text-red-500" />
                </div>
                <p className="text-sm text-red-600 max-w-md mx-auto">{error}</p>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && items.length === 0 && (
              <div className="py-24 text-center">
                <BookOpen size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">No laws found for this category yet.</p>
              </div>
            )}

            {/* No search results */}
            {!loading && !error && items.length > 0 && filtered.length === 0 && (
              <div className="py-16 text-center">
                <Search size={28} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">No laws match "{search}"</p>
              </div>
            )}

            {/* Cards */}
            {!loading && !error && filtered.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((law) => (
                  <div
                    key={law.id}
                    onClick={() => goDetail(law.id)}
                    className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer overflow-hidden"
                  >
                    <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500" />
                    <div className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-indigo-50 flex items-center justify-center mt-0.5">
                          <FileText size={16} className="text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-slate-800 group-hover:text-indigo-700 transition-colors leading-snug">{law.title}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{law.statute_name || '—'}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-3">{law.summary}</p>
                      <div className="flex items-center justify-between">
                        {law.section_reference && (
                          <span className="text-[11px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                            § {law.section_reference}
                          </span>
                        )}
                        <div className="flex items-center text-xs font-semibold text-indigo-600 ml-auto group-hover:gap-1.5 transition-all">
                          View <ChevronRight size={13} className="ml-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
