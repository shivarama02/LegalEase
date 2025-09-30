import React, { useMemo, useState } from 'react';
import UserSidebar from '../../components/UserSidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import { COMPLAINT_TYPE_MAP } from './Complaints';
import {
	ChevronLeft,
} from 'lucide-react';
import { apiUrl } from '../../api';

// Static replica of provided complaint generator HTML (no logic yet)
export default function ComplaintGenerator() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryType = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('type');
  }, [location.search]);
  const selectedMeta = queryType && COMPLAINT_TYPE_MAP[queryType] ? COMPLAINT_TYPE_MAP[queryType] : null;
  // Minimal local state for preview (not full controlled form refactor)
  const incoming = location.state?.complaint || {};
  const [form, setForm] = useState(() => ({
    complaint_type: incoming.complaint_type || (selectedMeta ? selectedMeta.title : ''),
    complainant_name: incoming.complainant_name || '',
    complainant_phone: incoming.complainant_phone || '',
    complainant_email: incoming.complainant_email || '',
    complainant_address: incoming.complainant_address || '',
    respondent_name: incoming.respondent_name || '',
    respondent_address: incoming.respondent_address || '',
    incident_date: incoming.incident_date || '',
    incident_location: incoming.incident_location || '',
    description: incoming.description || '',
    damages_amount: incoming.damages_amount || '',
    evidence_summary: incoming.evidence_summary || '',
    relief_sought: incoming.relief_sought || '',
    title: incoming.title || '',
  }));

  const update = (field) => (e) => setForm(prev => ({...prev, [field]: e.target.value }));
  const handlePreview = async () => {
    const token = localStorage.getItem('authToken');
    if(!token){
      alert('Please login first to create a complaint.');
      return;
    }
    try {
      // Normalize payload: convert empty strings to null for nullable fields
      const payload = { ...form };
      payload.incident_date = payload.incident_date || null;
      if(payload.damages_amount === '' || isNaN(parseFloat(payload.damages_amount))) {
        payload.damages_amount = null;
      }
      const res = await fetch(apiUrl('/complaint-drafts/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify(payload)
      });
      if(!res.ok){
        let detail='';
        try { detail = (await res.json()).detail || (await res.text()); } catch(_) {}
        throw new Error(detail || `Status ${res.status}`);
      }
      const draft = await res.json();
      navigate('/user/complaints/preview', { state: { draftId: draft.id } });
    } catch(e){
      console.error(e);
      alert('Failed to create draft: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex">
      <UserSidebar />
      <div className="flex-1">
        <div className="max-w-6xl mx-auto p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
								onClick={() => navigate('/user/complaints')}
								className="border rounded px-3 py-2 flex items-center text-sm bg-white hover:bg-gray-50"
							>
								<ChevronLeft className="h-4 w-4" />
							</button>
              <div className="flex items-center space-x-2">
                {/* FileText */}
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v12a2 2 0 01-2 2z" />
                </svg>
                <h1 className="text-3xl font-bold text-gray-900">Complaint Generator</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="shadow-lg rounded-lg bg-white overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3">
                  <h2 className="text-xl">Complaint Details Form</h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* Selected Type Banner */}
                  {selectedMeta && (
                    <div className="border rounded p-4 bg-gradient-to-r from-indigo-50 to-purple-50 mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-indigo-700">{selectedMeta.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-600 text-white">Auto-selected</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{selectedMeta.desc}</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedMeta.fields.map(f => (
                          <span key={f} className="text-[10px] px-2 py-0.5 border border-gray-300 rounded">{f}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Complaint Type */}
                  <div>
                    <label className="block mb-1 text-sm font-medium">Type of Complaint *</label>
                    <select className="w-full border rounded px-3 py-2" value={form.complaint_type} onChange={update('complaint_type')}>
                      <option value="" disabled>{selectedMeta ? 'Selected via category' : 'Select complaint type'}</option>
                      <option>Consumer Dispute</option>
                      <option>Property Dispute</option>
                      <option>Employment Issue</option>
                      <option>Service Deficiency</option>
                      <option>Product Defect</option>
                      <option>Unfair Trade Practice</option>
                      <option>Insurance Claim</option>
                      <option>Medical Negligence</option>
                      <option>Online Fraud</option>
                      <option>Other</option>
                    </select>
                  </div>

                  {/* Complainant Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Complainant Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">Full Name *</label>
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Enter your full name" value={form.complainant_name} onChange={update('complainant_name')} />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">Phone Number</label>
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Enter phone number" value={form.complainant_phone} onChange={update('complainant_phone')} />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Email Address</label>
                      <input type="email" className="w-full border rounded px-3 py-2" placeholder="Enter email address" value={form.complainant_email} onChange={update('complainant_email')} />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Address</label>
                      <textarea rows={2} className="w-full border rounded px-3 py-2" placeholder="Enter complete address" value={form.complainant_address} onChange={update('complainant_address')}></textarea>
                    </div>
                  </div>

                  {/* Respondent Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Respondent Information</h3>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Name/Company *</label>
                      <input type="text" className="w-full border rounded px-3 py-2" placeholder="Name of person/company" value={form.respondent_name} onChange={update('respondent_name')} />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Address</label>
                      <textarea rows={2} className="w-full border rounded px-3 py-2" placeholder="Respondent's address" value={form.respondent_address} onChange={update('respondent_address')}></textarea>
                    </div>
                  </div>

                  {/* Incident Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Incident Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">Date of Incident</label>
                        <input type="date" className="w-full border rounded px-3 py-2" value={form.incident_date} onChange={update('incident_date')} />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">Location</label>
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Where did the incident occur?" value={form.incident_location} onChange={update('incident_location')} />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Detailed Description *</label>
                      <textarea rows={6} className="w-full border rounded px-3 py-2" placeholder="Provide a detailed description..." value={form.description} onChange={update('description')}></textarea>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Additional Information</h3>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Damages/Loss Amount</label>
                      <input type="text" className="w-full border rounded px-3 py-2" placeholder="Enter monetary damages" value={form.damages_amount} onChange={update('damages_amount')} />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Evidence Available</label>
                      <textarea rows={3} className="w-full border rounded px-3 py-2" placeholder="Describe any evidence..." value={form.evidence_summary} onChange={update('evidence_summary')}></textarea>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Relief Sought</label>
                      <textarea rows={3} className="w-full border rounded px-3 py-2" placeholder="What outcome do you want?" value={form.relief_sought} onChange={update('relief_sought')}></textarea>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button onClick={handlePreview} type="button" className="px-4 py-2 rounded text-white bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center">
                      {/* Eye */}
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview Complaint
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar
            <div className="lg:col-span-1">
              <div className="shadow-md rounded-lg mb-6 bg-white">
                <div className="px-4 py-3 border-b">
                  <h3 className="text-lg">Form Progress</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Complaint Type</span>
                    <span className="text-xs text-gray-400">○</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Complainant Info</span>
                    <span className="text-xs text-gray-400">○</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Respondent Info</span>
                    <span className="text-xs text-gray-400">○</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Description</span>
                    <span className="text-xs text-gray-400">○</span>
                  </div>
                </div>
              </div>

              <div className="shadow-md rounded-lg bg-white">
                <div className="px-4 py-3 border-b">
                  <h3 className="text-lg">Need Help?</h3>
                </div>
                <div className="p-4 space-y-2">
                  <button className="border rounded px-3 py-2 w-full text-left text-sm bg-white hover:bg-gray-50">Ask AI Assistant</button>
                  <button className="border rounded px-3 py-2 w-full text-left text-sm bg-white hover:bg-gray-50">Find Legal Help</button>
                  <button className="border rounded px-3 py-2 w-full text-left text-sm bg-white hover:bg-gray-50">Browse Laws</button>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
