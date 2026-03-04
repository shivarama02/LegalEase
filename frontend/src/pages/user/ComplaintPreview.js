import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import { ArrowLeft, PencilLine, Save, Download, Eye, Loader2, ClipboardList } from 'lucide-react';
import { apiUrl } from '../../api';
import { COMPLAINT_TYPE_MAP } from './Complaints';

export default function ComplaintPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const draftId = location.state?.draftId;
  const complaintId = location.state?.complaintId || null;
  const [data, setData] = useState(location.state?.complaint || {});
  const [loading, setLoading] = useState((!!draftId || !!complaintId) && !location.state?.complaint);
  const [saving, setSaving] = useState(false);
  const currentDate = useMemo(() => new Date().toLocaleDateString(), []);
  const existingId = complaintId || data?.id || null;

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (!token) { if (loading) { alert('Login required'); setLoading(false); } return; }
    // Load from draft
    if (draftId && !location.state?.complaint) {
      (async () => {
        try {
          const res = await fetch(apiUrl(`/complaint-drafts/${draftId}/`), { headers: { 'Authorization': `Token ${token}` } });
          if (!res.ok) throw new Error(`Failed to load draft (${res.status})`);
          setData(await res.json());
        } catch (e) { console.error(e); alert(e.message); }
        finally { setLoading(false); }
      })();
    }
    // Load existing saved complaint
    else if (complaintId && !location.state?.complaint) {
      (async () => {
        try {
          const res = await fetch(apiUrl(`/complaints/${complaintId}/`), { headers: { 'Authorization': `Token ${token}` } });
          if (!res.ok) throw new Error(`Failed to load complaint (${res.status})`);
          setData(await res.json());
        } catch (e) { console.error(e); alert(e.message); }
        finally { setLoading(false); }
      })();
    }
  }, [draftId, complaintId, location.state]);

  const normalizeTypeToKey = (t) => {
    if (!t) return '';
    if (COMPLAINT_TYPE_MAP[t]) return t;
    const found = Object.values(COMPLAINT_TYPE_MAP).find(ct => ct.title.toLowerCase() === String(t).toLowerCase());
    return found ? found.key : '';
  };
  const displayType = useMemo(() => {
    if (!data?.complaint_type) return '';
    const key = normalizeTypeToKey(data.complaint_type);
    return COMPLAINT_TYPE_MAP[key]?.title || data.complaint_type || '';
  }, [data?.complaint_type]);

  const letter = `COMPLAINT LETTER\n\nDate: ${currentDate}\n\nTo,\nThe Consumer Forum / Appropriate Authority\n${data.respondent_address || ''}\n\nSubject: ${displayType} - Complaint against ${data.respondent_name || ''}\n\nRespected Sir/Madam,\n\nI, ${data.complainant_name || ''}, resident of ${data.complainant_address || ''}, hereby file this complaint against ${data.respondent_name || ''}, located at ${data.respondent_address || ''}.\n\nDETAILS OF THE COMPLAINT:\n\n1. Type of Complaint: ${displayType}\n\n2. Date of Incident: ${data.incident_date || ''}\n\n3. Location of Incident: ${data.incident_location || ''}\n\n4. Detailed Description of the Incident:\n${data.description || ''}\n\n5. Financial Loss/Damages: ${data.damages_amount || ''}\n\n6. Evidence Available:\n${data.evidence_summary || ''}\n\n7. Relief Sought:\n${data.relief_sought || ''}\n\nPRAYER:\n\nIn view of the above facts and circumstances, I humbly request this honorable forum to:\n- Take appropriate action against the respondent\n- Direct the respondent to provide the relief sought\n- Award compensation for the mental agony and harassment caused\n- Any other relief deemed fit and proper\n\nThanking you,\n\nYours faithfully,\n${data.complainant_name || ''}\nContact: ${data.complainant_phone || ''}\nEmail: ${data.complainant_email || ''}\n\n---\n\nVERIFICATION:\n\nI, ${data.complainant_name || ''}, do hereby verify that the contents of the above complaint are true and correct to the best of my knowledge.\n\nDate: ${currentDate}\nPlace: ${data.incident_location || ''}\n\nSignature: ________________\n${data.complainant_name || ''}`;

  const handleEdit = () => navigate('/user/complaints/generator', { state: { complaint: { ...data, id: existingId } } });

  const handleDownload = async () => {
    try {
      const payload = { ...data, current_date: currentDate };
      const token = sessionStorage.getItem('authToken');
      const res = await fetch(apiUrl('/complaints/pdf/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Token ${token}` } : {}) },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { let d = ''; try { d = (await res.json()).detail || (await res.text()); } catch (_) {} throw new Error(`PDF failed (${res.status}) ${d}`); }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'complaint_preview.pdf';
      document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Download failed: ' + e.message + '\nFallback: text export.');
      try { const t = new Blob([letter], { type: 'text/plain' }); const u = window.URL.createObjectURL(t); const a = document.createElement('a'); a.href = u; a.download = 'complaint_preview.txt'; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(u); } catch (_) {}
    }
  };

  const handleSave = async () => {
    const token = sessionStorage.getItem('authToken');
    if (!token) { alert('Please login before saving.'); return; }
    const normalizedType = normalizeTypeToKey(data.complaint_type);
    const payloadRaw = {
      complaint_type: normalizedType,
      title: data.title || (data.complaint_type ? `${data.complaint_type} Complaint` : 'Complaint'),
      complainant_name: data.complainant_name, complainant_phone: data.complainant_phone, complainant_email: data.complainant_email,
      complainant_address: data.complainant_address, respondent_name: data.respondent_name, respondent_address: data.respondent_address,
      incident_date: data.incident_date, incident_location: data.incident_location, description: data.description,
      damages_amount: data.damages_amount, evidence_summary: data.evidence_summary, relief_sought: data.relief_sought,
    };
    const payload = {};
    for (const [k, v] of Object.entries(payloadRaw)) {
      if (v === undefined) continue;
      if (typeof v === 'string') { const tr = v.trim(); if (tr === '') continue; payload[k] = tr; }
      else if (k === 'damages_amount') { const n = typeof v === 'number' ? v : parseFloat(v); if (!isNaN(n)) payload[k] = n; }
      else payload[k] = v;
    }
    if (payload.incident_date === '') delete payload.incident_date;
    if (!payload.title) { const d = COMPLAINT_TYPE_MAP[normalizedType]?.title || normalizedType || 'Complaint'; payload.title = `${d} Complaint`; }
    if (!payload.description) payload.description = 'No description provided';
    if (!payload.complainant_name) payload.complainant_name = 'Unknown';
    if (!payload.respondent_name) payload.respondent_name = 'Unknown';
    if (!payload.incident_location) payload.incident_location = 'Unknown';
    setSaving(true);
    try {
      const url = existingId ? apiUrl(`/complaints/${existingId}/`) : apiUrl('/complaints/');
      const method = existingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` }, body: JSON.stringify(payload) });
      if (!res.ok) {
        let msg = `Failed (${res.status})`;
        try { const err = await res.json(); const [f, i] = Object.entries(err)[0] || []; if (f) msg += `: ${f} - ${Array.isArray(i) ? i.join(', ') : String(i)}`; else if (err.detail) msg += `: ${err.detail}`; } catch (_) {}
        throw new Error(msg);
      }
      const saved = await res.json();
      setData(saved);
      alert(`Complaint ${existingId ? 'updated' : 'saved'} (ID: ${saved.id}).`);
      navigate('/user/complaints/history');
    } catch (e) { console.error(e); alert('Save failed: ' + e.message); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={28} className="text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <UserSidebar />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">

            {/* Back */}
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition mb-4">
              <ArrowLeft size={15} /> Back
            </button>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                  <Eye size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Complaint Preview</h1>
                  <p className="text-xs text-slate-500">Review your generated complaint letter below.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button onClick={handleEdit} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition">
                <PencilLine size={14} /> Edit
              </button>
              <button onClick={handleDownload} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition">
                <Download size={14} /> Download PDF
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-sm transition disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Saving...' : existingId ? 'Update Complaint' : 'Save Complaint'}
              </button>
            </div>

            {/* Summary Strip */}
            {displayType && (
              <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl px-5 py-3 mb-6 flex flex-wrap items-center gap-4 text-sm">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</span>
                  <p className="font-bold text-indigo-700">{displayType}</p>
                </div>
                {data.complainant_name && (
                  <div className="border-l border-indigo-200 pl-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Complainant</span>
                    <p className="font-medium text-slate-700">{data.complainant_name}</p>
                  </div>
                )}
                {data.respondent_name && (
                  <div className="border-l border-indigo-200 pl-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Respondent</span>
                    <p className="font-medium text-slate-700">{data.respondent_name}</p>
                  </div>
                )}
                {data.incident_date && (
                  <div className="border-l border-indigo-200 pl-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</span>
                    <p className="font-medium text-slate-700">{data.incident_date}</p>
                  </div>
                )}
              </div>
            )}

            {/* Letter Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2">
                <ClipboardList size={16} className="text-indigo-500" />
                <span className="text-sm font-semibold text-slate-700">Generated Complaint Letter</span>
              </div>
              <div className="p-6">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-left">
                  <pre className="whitespace-pre-wrap text-[13px] text-slate-700 font-mono leading-relaxed text-left">{letter}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}