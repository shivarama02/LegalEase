import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { apiUrl } from '../api';
import { ArrowLeft, Scale, List, X, Loader2, AlertCircle, BookOpen, ShieldAlert, Banknote, Gavel, Eye, FileText } from 'lucide-react';

export default function LawDetails() {
  const { id } = useParams();
  const [law, setLaw] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [lawRes, secRes] = await Promise.all([
          fetch(apiUrl(`/laws/${id}/`)),
          fetch(apiUrl(`/law-sections/?law=${id}`)),
        ]);
        if (!lawRes.ok) throw new Error(`Law not found (HTTP ${lawRes.status})`);
        const lawData = await lawRes.json();
        const secData = await secRes.json();
        if (mounted) {
          setLaw(lawData);
          setSections(Array.isArray(secData) ? secData : secData.results || []);
        }
      } catch (e) { if (mounted) setError(e.message); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [id]);

  const detail = selected?.detail;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex min-h-screen">
        <div className="flex-1 overflow-y-auto p-6 pt-24">
          <div className="max-w-5xl mx-auto">
            <button onClick={() => window.history.back()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition mb-4">
              <ArrowLeft size={15} /> Back to list
            </button>

            {loading && (
              <div className="py-24 text-center"><Loader2 size={28} className="mx-auto text-indigo-500 animate-spin mb-3" /><p className="text-sm text-slate-500">Loading…</p></div>
            )}
            {error && (
              <div className="py-16 text-center"><div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-3"><AlertCircle size={22} className="text-red-500" /></div><p className="text-sm text-red-600">{error}</p></div>
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
                        <h1 className="text-xl font-extrabold text-white leading-snug">{law.law_title}</h1>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {law.short_title && <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">{law.short_title}</span>}
                          {law.enactment_year && <span className="px-2.5 py-0.5 bg-white/10 text-white/80 text-xs rounded-full">Year: {law.enactment_year}</span>}
                          {law.law_type && <span className="px-2.5 py-0.5 bg-white/10 text-white/80 text-xs rounded-full">{law.law_type}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-sm text-slate-600 leading-relaxed">{law.summary || 'No summary available.'}</p>
                    {law.authority && <p className="text-xs text-slate-400 mt-2">Authority: {law.authority}</p>}
                  </div>
                </div>

                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><List size={18} className="text-indigo-500" /> Sections ({sections.length})</h2>

                {sections.length === 0 ? (
                  <div className="py-16 text-center bg-white rounded-2xl border border-slate-200"><BookOpen size={28} className="mx-auto text-slate-300 mb-2" /><p className="text-sm text-slate-500">No sections available.</p></div>
                ) : (
                  <div className="space-y-3">
                    {sections.map(s => (
                      <div key={s.id} onClick={() => setSelected(s)}
                        className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                            <FileText size={18} className="text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">§ {s.section_number} — {s.section_title}</h3>
                              {s.chapter && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-semibold">{s.chapter}</span>}
                              {s.detail && <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-semibold">Has Details</span>}
                            </div>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.section_text}</p>
                          </div>
                          <div className="flex items-center text-xs font-semibold text-indigo-500 flex-shrink-0"><Eye size={14} className="mr-1" /> View</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">§ {selected.section_number} — {selected.section_title}</h2>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-5">
              {selected.chapter && (
                <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Chapter</p><p className="text-sm text-slate-700">{selected.chapter}</p></div>
              )}
              {selected.section_text && (
                <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Section Text</p><pre className="font-mono text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 rounded-xl p-4">{selected.section_text}</pre></div>
              )}
              {detail ? (
                <>
                  {detail.simplified_explanation && (
                    <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Simplified Explanation</p><p className="text-sm text-slate-600 leading-relaxed">{detail.simplified_explanation}</p></div>
                  )}
                  {detail.offence_description && (
                    <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Offence Description</p><p className="text-sm text-slate-600 leading-relaxed">{detail.offence_description}</p></div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {detail.imprisonment_term && (
                      <div className="bg-red-50 rounded-xl p-4"><div className="flex items-center gap-2 mb-1"><ShieldAlert size={14} className="text-red-500" /><p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Imprisonment</p></div><p className="text-sm text-red-700">{detail.imprisonment_term}</p></div>
                    )}
                    {detail.fine_amount && (
                      <div className="bg-amber-50 rounded-xl p-4"><div className="flex items-center gap-2 mb-1"><Banknote size={14} className="text-amber-500" /><p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Fine</p></div><p className="text-sm text-amber-700">{detail.fine_amount}</p></div>
                    )}
                    {detail.bailable_status && (
                      <div className="bg-blue-50 rounded-xl p-4"><div className="flex items-center gap-2 mb-1"><Gavel size={14} className="text-blue-500" /><p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Bailable Status</p></div><p className="text-sm text-blue-700">{detail.bailable_status}</p></div>
                    )}
                    {detail.cognizable_status && (
                      <div className="bg-green-50 rounded-xl p-4"><div className="flex items-center gap-2 mb-1"><Eye size={14} className="text-green-500" /><p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Cognizable Status</p></div><p className="text-sm text-green-700">{detail.cognizable_status}</p></div>
                    )}
                  </div>
                  {detail.compensation && (
                    <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Compensation</p><p className="text-sm text-slate-600 leading-relaxed">{detail.compensation}</p></div>
                  )}
                  {detail.example_scenario && (
                    <div className="bg-indigo-50 rounded-xl p-4"><p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">Example Scenario</p><p className="text-sm text-indigo-700 leading-relaxed">{detail.example_scenario}</p></div>
                  )}
                </>
              ) : (
                <div className="py-6 text-center"><BookOpen size={24} className="mx-auto text-slate-300 mb-2" /><p className="text-xs text-slate-400">No additional details available for this section.</p></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

