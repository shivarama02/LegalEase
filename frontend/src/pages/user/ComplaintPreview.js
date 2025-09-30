import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import { PencilLine, Save, Download } from 'lucide-react';
import { apiUrl } from '../../api';

export default function ComplaintPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const draftId = location.state?.draftId;
  const [data, setData] = useState(location.state?.complaint || {});
  const [loading, setLoading] = useState(!!draftId && !location.state?.complaint);
  const currentDate = useMemo(() => new Date().toLocaleDateString(), []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if(draftId && !location.state?.complaint){
      if(!token){
        alert('Login required');
        return;
      }
      (async () => {
        try {
          const res = await fetch(apiUrl(`/complaint-drafts/${draftId}/`), {
            headers: { 'Authorization': `Token ${token}` }
          });
          if(!res.ok) throw new Error(`Failed to load draft (${res.status})`);
          const json = await res.json();
            setData(json);
        } catch(e){
          console.error(e);
          alert(e.message);
        } finally { setLoading(false); }
      })();
    }
  }, [draftId, location.state]);

  // Build letter body using same placeholders from provided HTML layout
  const letter = `COMPLAINT LETTER\n\nDate: ${currentDate}\n\nTo,\nThe Consumer Forum / Appropriate Authority\n${data.respondent_address || ''}\n\nSubject: ${data.complaint_type || ''} - Complaint against ${data.respondent_name || ''}\n\nRespected Sir/Madam,\n\nI, ${data.complainant_name || ''}, resident of ${data.complainant_address || ''}, hereby file this complaint against ${data.respondent_name || ''}, located at ${data.respondent_address || ''}.\n\nDETAILS OF THE COMPLAINT:\n\n1. Type of Complaint: ${data.complaint_type || ''}\n\n2. Date of Incident: ${data.incident_date || ''}\n\n3. Location of Incident: ${data.incident_location || ''}\n\n4. Detailed Description of the Incident:\n${data.description || ''}\n\n5. Financial Loss/Damages: ${data.damages_amount || ''}\n\n6. Evidence Available:\n${data.evidence_summary || ''}\n\n7. Relief Sought:\n${data.relief_sought || ''}\n\nPRAYER:\n\nIn view of the above facts and circumstances, I humbly request this honorable forum to:\n- Take appropriate action against the respondent\n- Direct the respondent to provide the relief sought\n- Award compensation for the mental agony and harassment caused\n- Any other relief deemed fit and proper\n\nThanking you,\n\nYours faithfully,\n${data.complainant_name || ''}\nContact: ${data.complainant_phone || ''}\nEmail: ${data.complainant_email || ''}\n\n---\n\nVERIFICATION:\n\nI, ${data.complainant_name || ''}, do hereby verify that the contents of the above complaint are true and correct to the best of my knowledge.\n\nDate: ${currentDate}\nPlace: ${data.incident_location || ''}\n\nSignature: ________________\n${data.complainant_name || ''}`;

  const handleEdit = () => navigate('/user/complaints/generator', { state: { complaint: data } });
  const handleDownload = async () => {
    try {
      const payload = { ...data, current_date: currentDate };
      const token = localStorage.getItem('authToken');
      const res = await fetch(apiUrl('/complaints/pdf/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Token ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });
      if(!res.ok){
        let detail = '';
        try { detail = (await res.json()).detail || (await res.text()); } catch(_) {}
        throw new Error(`Failed to generate PDF (${res.status}) ${detail}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'complaint_preview.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Download failed: ' + e.message + '\nTrying fallback text export.');
      try {
        const txt = new Blob([letter], { type: 'text/plain' });
        const url = window.URL.createObjectURL(txt);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'complaint_preview.txt';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch(_) {}
    }
  };
  const handleSave = async () => {
    const token = localStorage.getItem('authToken');
    if(!token){
      alert('Please login before saving a complaint.');
      return;
    }
    // Build payload restricted to serializer fields
    const payload = {
      complaint_type: data.complaint_type || '',
      title: data.title || (data.complaint_type ? `${data.complaint_type} Complaint` : 'Complaint'),
      complainant_name: data.complainant_name || '',
      complainant_phone: data.complainant_phone || '',
      complainant_email: data.complainant_email || '',
      complainant_address: data.complainant_address || '',
      respondent_name: data.respondent_name || '',
      respondent_address: data.respondent_address || '',
      incident_date: data.incident_date || '',
      incident_location: data.incident_location || '',
      description: data.description || '',
      damages_amount: data.damages_amount || '',
      evidence_summary: data.evidence_summary || '',
      relief_sought: data.relief_sought || '',
      law_reference_ids: data.law_reference_ids || [],
    };
    try {
      const res = await fetch(apiUrl('/complaints/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(payload)
      });
      if(!res.ok){
        let detail='';
        try { detail = (await res.json()).detail || (await res.text()); } catch(_) {}
        throw new Error(`Failed to save complaint (${res.status}) ${detail}`);
      }
      const saved = await res.json();
      alert(`Complaint saved successfully (ID: ${saved.id}).`);
    } catch(e){
      console.error(e);
      alert('Save failed: ' + e.message);
    }
  };

  if(loading){
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">Loading draft...</div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <UserSidebar />
      <div className="flex-1">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate(-1)} className="flex items-center px-4 py-2 border rounded-md text-sm bg-white hover:bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <h1 className="text-3xl font-bold text-gray-900">Complaint Preview</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">

              <button onClick={handleEdit} className="border rounded px-3 py-2 flex items-center text-sm bg-white hover:bg-gray-50">
                <PencilLine className="h-4 w-4 mr-2" />Edit
              </button>
              <button onClick={handleDownload} className="border rounded px-3 py-2 flex items-center text-sm bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />Download
              </button>
              <button onClick={handleSave} className="border rounded px-3 py-2 flex items-center text-sm bg-white hover:bg-gray-50">
                <Save className="h-4 w-4 mr-2" />Save
              </button>
            </div>
            {/* <div className="flex items-center space-x-2">
              <button onClick={handleEdit} className="flex items-center px-4 py-2 border rounded-md text-sm bg-white hover:bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 20h9" />
                </svg>
                Edit
              </button>
              <button onClick={handlePrint} className="flex items-center px-4 py-2 border rounded-md text-sm bg-white hover:bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 9h12M6 13h12M6 17h12" />
                </svg>
                Download
              </button>
              <button onClick={handleSave} className="flex items-center px-4 py-2 border rounded-md text-sm bg-white hover:bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M4 4h16v16H4z" />
                </svg>
                Save
              </button>
            </div> */}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* Preview Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-indigo-600 text-white px-6 py-3">
                  <h2 className="text-xl">Generated Complaint Letter</h2>
                </div>
                <div className="p-6">
                  <div className="bg-gray-50 border rounded-lg p-6 shadow-inner">
                    <pre className="whitespace-pre-wrap text-left text-sm text-gray-800 font-mono leading-relaxed">{letter}</pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar column intentionally left (matching provided HTML which had commented blocks) */}
            <div className="lg:col-span-1 space-y-6">
              {/* Future sidebar cards (summary/actions/next steps) can go here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}