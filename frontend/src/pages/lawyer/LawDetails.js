import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import LawyerSidebar from '../../components/LawyerSidebar';
import { ArrowLeft, Scale, FileText, AlertTriangle, Link2, Calendar, Loader2, AlertCircle, BookOpen } from 'lucide-react';

const categoryMap = {
  consumer: 'Consumer Law',
  ipc: 'Criminal / IPC',
  labour: 'Employment Law',
  family: 'Family / Domestic',
  cyber: 'Cyber Crime',
  property: 'Property / Tenancy',
  corporate: 'Corporate / Company',
  civil: 'Civil Law',
};

const TABS = [
  { key: 'full', label: 'Full Text', icon: FileText },
  { key: 'penalties', label: 'Penalties', icon: AlertTriangle },
  { key: 'related', label: 'Related Sections', icon: Link2 },
];

export default function LawDetails() {
  const { id } = useParams();
  const [law, setLaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('full');

  const API_BASE = useMemo(() => process.env.REACT_APP_API || 'http://localhost:8000', []);

  useEffect(() => {
    let isMounted = true;
    async function fetchLaw() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/lawdetails/${id}/`, { headers: { Accept: 'application/json' } });
        const ct = res.headers.get('content-type') || '';
        if (!res.ok) { const t = await res.text(); throw new Error(t || `HTTP ${res.status}`); }
        if (!ct.includes('application/json')) { const t = await res.text(); throw new Error(`Not JSON: ${t.slice(0, 200)}`); }
        const data = await res.json();
        if (isMounted) setLaw(data);
      } catch (e) {
        if (isMounted) setError(e.message || String(e));
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (id) fetchLaw();
    return () => { isMounted = false; };
  }, [API_BASE, id]);

  const fmtDate = (iso) => { try { return iso ? new Date(iso).toLocaleDateString() : ''; } catch { return iso || ''; } };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <LawyerSidebar />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">

            <button onClick={() => window.history.back()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition mb-4">
              <ArrowLeft size={15} /> Back to list
            </button>

            {loading && (
              <div className="py-24 text-center">
                <Loader2 size={28} className="mx-auto text-indigo-500 animate-spin mb-3" />
                <p className="text-sm text-slate-500">Loading law details…</p>
              </div>
            )}

            {error && (
              <div className="py-16 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-3">
                  <AlertCircle size={22} className="text-red-500" />
                </div>
                <p className="text-sm text-red-600 max-w-md mx-auto">{error}</p>
              </div>
            )}

            {!loading && !error && law && (
              <>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                  <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                        <Scale size={22} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-extrabold text-white leading-snug">{law.title}</h1>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {law.category && (
                            <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                              {categoryMap[law.category] || law.category}
                            </span>
                          )}
                          {law.statute_name && (
                            <span className="px-2.5 py-0.5 bg-white/10 backdrop-blur-sm text-white/80 text-xs rounded-full">
                              {law.statute_name}
                            </span>
                          )}
                          {law.section_reference && (
                            <span className="px-2.5 py-0.5 bg-white/10 backdrop-blur-sm text-white/80 text-xs rounded-full">
                              § {law.section_reference}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-sm text-slate-600 leading-relaxed">{law.summary || 'No summary available.'}</p>
                    {law.updated_at && (
                      <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
                        <Calendar size={12} /> Last updated: {fmtDate(law.updated_at)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  {TABS.map(t => {
                    const Icon = t.icon;
                    const active = activeTab === t.key;
                    return (
                      <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          active
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
                        }`}
                      >
                        <Icon size={14} /> {t.label}
                      </button>
                    );
                  })}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {activeTab === 'full' && (
                    <>
                      <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2">
                        <FileText size={16} className="text-indigo-500" />
                        <span className="text-sm font-semibold text-slate-700">Complete Legal Text</span>
                      </div>
                      <div className="p-5 max-h-[600px] overflow-auto">
                        <pre className="font-mono text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {law.full_text || law.summary || 'No content available for this law.'}
                        </pre>
                      </div>
                    </>
                  )}

                  {activeTab === 'penalties' && (
                    <>
                      <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-500" />
                        <span className="text-sm font-semibold text-slate-700">Penalties & Consequences</span>
                      </div>
                      <div className="p-5">
                        {law.penalties ? (
                          <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{law.penalties}</p>
                        ) : (
                          <div className="py-10 text-center">
                            <BookOpen size={24} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-xs text-slate-400">No penalties information provided for this law.</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {activeTab === 'related' && (
                    <>
                      <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2">
                        <Link2 size={16} className="text-violet-500" />
                        <span className="text-sm font-semibold text-slate-700">Related Sections & Metadata</span>
                      </div>
                      <div className="p-5 space-y-4">
                        {law.statute_name && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Statute</p>
                            <p className="text-sm text-slate-700">{law.statute_name}</p>
                          </div>
                        )}
                        {law.section_reference && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Section Reference</p>
                            <p className="text-sm text-slate-700">{law.section_reference}</p>
                          </div>
                        )}
                        {law.related_sections ? (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Related Sections</p>
                            <div className="flex flex-wrap gap-2">
                              {String(law.related_sections).split(',').map((s, i) => (
                                <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">{s.trim()}</span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="py-8 text-center">
                            <Link2 size={24} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-xs text-slate-400">No related sections provided.</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

