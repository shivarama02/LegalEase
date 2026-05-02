import React, { useMemo, useState } from 'react';
import UserSidebar from '../../components/UserSidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import { COMPLAINT_TYPE_MAP } from './Complaints';
import {
  ArrowLeft, ClipboardList, Eye, User, MapPin, Calendar, FileText, IndianRupee, AlertCircle, CheckCircle2, ChevronDown,
} from 'lucide-react';
import { apiUrl } from '../../api';

export default function ComplaintGenerator() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryType = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('type');
  }, [location.search]);
  const selectedMeta = queryType && COMPLAINT_TYPE_MAP[queryType] ? COMPLAINT_TYPE_MAP[queryType] : null;

  const normalizeTypeToKey = (t) => {
    if (!t) return '';
    if (COMPLAINT_TYPE_MAP[t]) return t;
    const found = Object.values(COMPLAINT_TYPE_MAP).find(ct => ct.title.toLowerCase() === String(t).toLowerCase());
    return found ? found.key : '';
  };

  const incoming = location.state?.complaint || {};
  const [form, setForm] = useState(() => ({
    complaint_type: normalizeTypeToKey(incoming.complaint_type) || (selectedMeta ? selectedMeta.key : ''),
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

  const [errors, setErrors] = useState({});

  const validate = (values) => {
    const e = {};
    if (!values.complaint_type || String(values.complaint_type).trim() === '') e.complaint_type = 'Please select a complaint type.';
    if (!values.complainant_name || String(values.complainant_name).trim() === '') e.complainant_name = 'Full name is required.';
    if (!values.complainant_phone || String(values.complainant_phone).trim() ==='') e.complainant_phone = 'Phone number is required.';
    if (!values.complainant_email || String(values.complainant_email).trim() === '') e.complainant_email = 'Email is required.';
    if (!values.complainant_address || String(values.complainant_address).trim() === '') e.complainant_address = 'Address is required.';
    if (!values.respondent_name || String(values.respondent_name).trim() === '') e.respondent_name = 'Respondent name/company is required.';
    if (!values.respondent_address || String(values.respondent_address).trim() === '') e.respondent_address = 'Respondent address is required.';
    if (!values.incident_date || String(values.incident_date).trim() === '') e.incident_date = 'Incident date0 is required.';
    if (!values.incident_location || String(values.incident_location).trim() === '') e.incident_location = 'Incident location is required.';
    if (!values.description || String(values.description).trim() === '') e.description = 'Detailed description is required.';
    if (!values.damages_amount || String(values.damages_amount).trim() === '') e.damages_amount  = 'Please mention your damages';
    if (!values.evidence_summary || String(values.evidence_summary).trim() === '') e.evidence_summary  = 'The Evidences are Required';
    if (!values.relief_sought || String(values.relief_sought).trim() === '') e.relief_sought  = 'PLease mention your relief soughts';
    return e;
  };

  const update = (field) => (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handlePreview = async () => {
    const token = sessionStorage.getItem('authToken');
    if (!token) { alert('Please login first to create a complaint.'); return; }
    const newErrors = validate({ ...form });
    if (Object.keys(newErrors).filter(k => newErrors[k]).length > 0) {
      setErrors(newErrors);
      alert('Please fill the required fields:\n ' );
      return;
    }
    try {
      const payload = { ...form };
      payload.complaint_type = normalizeTypeToKey(payload.complaint_type);
      if (!payload.complaint_type) throw new Error('Please select a valid complaint type.');
      Object.keys(payload).forEach(k => { if (typeof payload[k] === 'string') payload[k] = payload[k].trim(); });
      payload.incident_date = payload.incident_date || null;
      if (payload.damages_amount === '' || isNaN(parseFloat(payload.damages_amount))) payload.damages_amount = null;
      if (!payload.title) {
        const disp = COMPLAINT_TYPE_MAP[payload.complaint_type]?.title || payload.complaint_type || 'Complaint';
        payload.title = `${disp} Complaint Draft`;
      }
      const res = await fetch(apiUrl('/complaint-drafts/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        let msg = `Failed to create draft (${res.status})`;
        try {
          const bodyText = await res.text();
          try {
            const errJson = JSON.parse(bodyText);
            if (errJson && typeof errJson === 'object') {
              const entries = Object.entries(errJson);
              if (entries.length > 0) { const [field, issues] = entries[0]; msg += `: ${field} - ${Array.isArray(issues) ? issues.join(', ') : String(issues)}`; }
              else if (errJson.detail) msg += `: ${errJson.detail}`;
            } else if (bodyText) msg += `: ${bodyText}`;
          } catch (_) { if (bodyText) msg += `: ${bodyText}`; }
        } catch (_) {}
        throw new Error(msg);
      }
      const draft = await res.json();
      navigate('/user/complaints/preview', { state: { draftId: draft.id } });
    } catch (e) {
      console.error(e);
      alert('Failed to create draft: ' + e.message);
    }
  };

  const inputCls = (field) =>
    `w-full bg-white border ${errors[field] ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-400'} rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 transition`;

  const filledCount = [form.complaint_type, form.complainant_name, form.complainant_phone, form.complainant_email, form.complainant_address, form.respondent_name, form.respondent_address, form.incident_date, form.incident_location, form.description, form.damages_amount, form.evidence_summary, form.relief_sought].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <UserSidebar />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">

            {/* Back */}
            <button onClick={() => navigate('/user/complaints')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition mb-4">
              <ArrowLeft size={15} /> Back to complaints
            </button>

            {/* Header */}
            <div className="mb-6 text-left">
              <div className="flex items-start gap-3">
                
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                  <ClipboardList size={18} className="text-white" />
                </div>

                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">
                    Complaint Generator
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Fill in the details below to generate your complaint draft.
                  </p>
                </div>

              </div>
            </div>

            

            {/* Auto-selected banner */}
            {selectedMeta && (
              <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-indigo-700">{selectedMeta.title}</h3>
                  <span className="text-[12px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-semibold">Auto-selected</span>
                </div>
                <p className="text-xs text-slate-500 mb-6 text-left">{selectedMeta.desc}</p>
                
              {/* Progress pills */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-2">
                {['Type', 'Complainant', 'Respondent', 'Description', 'Additional'].map((step, i) => {
                  const filled = [!!(form.complaint_type), !!(form.complainant_name && form.complainant_phone && form.complainant_email && form.complainant_address), !!(form.respondent_name && form.respondent_address), !!(form.incident_date && form.incident_location && form.description), !!(form.damages_amount && form.evidence_summary && form.relief_sought)][i];
                  return (
                    <div key={step} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${filled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                      {filled ? <CheckCircle2 size={12} /> : <span className="w-3 h-3 rounded-full border border-slate-300" />}
                      {step}
                    </div>
                  );
                })}
                
            </div>
              </div>
            )}

            {/* Form Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              {/* Complaint Type */}
              <div className="p-6 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Complaint Type</p>
                <div className="relative">
                  <select
                    className={`${inputCls('complaint_type')} appearance-none ${selectedMeta ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
                    value={form.complaint_type}
                    onChange={update('complaint_type')}
                    disabled={!!selectedMeta}
                    required
                  >
                    <option value="" disabled>{selectedMeta ? 'Selected via category' : 'Select complaint type'}</option>
                    {Object.values(COMPLAINT_TYPE_MAP).map(ct => (
                      <option key={ct.key} value={ct.key}>{ct.title}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {errors.complaint_type && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.complaint_type}</p>}
              </div> 

              {/* Complainant */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-4 flex-wrap justify-center">
                  <User size={16} className="text-indigo-500" />
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Complainant Information</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 ml-2 text-xs font-medium text-slate-600 text-left">Full Name *</label>
                    <input type="text" className={inputCls('complainant_name')} placeholder="Enter your full name" value={form.complainant_name} onChange={update('complainant_name')} />
                    {errors.complainant_name && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.complainant_name}</p>}
                  </div>
                  <div>
                    <label className="block mb-1.5 ml-2 text-xs font-medium text-slate-600 text-left">Phone Number</label>
                    <input type="text" className={inputCls('complainant_phone')} placeholder="Enter phone number" value={form.complainant_phone} onChange={update('complainant_phone')} />
                    {errors.complainant_phone && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.complainant_phone}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block mb-1.5 ml-2 text-xs font-medium text-slate-600 text-left">Email Address</label>
                  <input type="email" className={inputCls('complainant_email')} placeholder="Enter email address" value={form.complainant_email} onChange={update('complainant_email')} />
                    {errors.complainant_email && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.complainant_email}</p>}
                </div>
                <div className="mt-4">
                  <label className="block mb-1.5 ml-2 text-xs font-medium text-slate-600 text-left">Address</label>
                  <textarea rows={2} className={inputCls('complainant_address')} placeholder="Enter complete address" value={form.complainant_address} onChange={update('complainant_address')} />
                    {errors.complainant_address && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.complainant_address}</p>}
                </div>
              </div>

              {/* Respondent */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-4 flex-wrap justify-center">
                  <User size={16} className="text-violet-500" />
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Respondent Information</p>
                </div>
                <div>
                  <label className="block mb-1.5 ml-2 text-xs font-medium text-slate-600 text-left">Name / Company *</label>
                  <input type="text" className={inputCls('respondent_name')} placeholder="Name of person/company" value={form.respondent_name} onChange={update('respondent_name')} />
                  {errors.respondent_name && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.respondent_name}</p>}
                </div>
                <div className="mt-4">
                  <label className="block mb-1.5 ml-2 text-xs font-medium text-slate-600 text-left">Address</label>
                  <textarea rows={2} className={inputCls('respondent_address')} placeholder="Respondent's address" value={form.respondent_address} onChange={update('respondent_address')} />
                    {errors.respondent_address && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.respondent_address}</p>}
                </div>
              </div>

              {/* Incident */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-4 flex-wrap justify-center">
                  <MapPin size={16} className="text-amber-500" />
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Incident Details</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 ml-2 text-xs font-medium text-slate-600 text-left">Date of Incident</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type="date" className={`${inputCls('incident_date')} pl-9`} value={form.incident_date} onChange={update('incident_date')} />
                    {errors.incident_date && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.incident_date}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1.5 ml-2 text-xs font-medium text-slate-600 text-left">Location</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type="text" className={`${inputCls('incident_location')} pl-9`} placeholder="Where did it occur?" value={form.incident_location} onChange={update('incident_location')} />
                    {errors.incident_location && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.incident_location}</p>}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block mb-1.5 ml-2 text-xs font-medium text-slate-600 text-left">Detailed Description *</label>
                  <textarea rows={5} className={inputCls('description')} placeholder="Provide a detailed description of the incident..." value={form.description} onChange={update('description')} />
                  {errors.description && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.description}</p>}
                </div>
              </div>

              {/* Additional */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-4 flex-wrap justify-center">
                  <FileText size={16} className="text-emerald-500" />
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Additional Information</p>
                </div>
                <div>
                  <label className="block mb-1.5 ml-2 text-xs font-medium text-slate-600 text-left">Damages / Loss Amount</label>
                  <div className="relative">
                    {/* <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /> */}
                    <input type="text" className={`${inputCls('damages_amount')} pl-3`} placeholder="Enter monetary damages" value={form.damages_amount} onChange={update('damages_amount')} />
                    {errors.damages_amount && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.damages_amount}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block mb-1.5 ml-2 text-xs font-medium text-slate-600 text-left">Evidences Available</label>
                  <textarea rows={3} className={inputCls('evidence_summary')} placeholder="Describe any evidence (documents, screenshots, etc.)" value={form.evidence_summary} onChange={update('evidence_summary')} />
                    {errors.evidence_summary && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.evidence_summary}</p>}
                </div>
                <div className="mt-4">
                  <label className="block mb-1.5 ml-2 text-xs font-medium text-slate-600 text-left">Relief Sought</label>
                  <textarea rows={3} className={inputCls('relief_sought')} placeholder="What outcome do you seek?" value={form.relief_sought} onChange={update('relief_sought')} />
                    {errors.relief_sought && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.relief_sought}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 flex justify-end">
                <button
                  onClick={handlePreview}
                  type="button"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-sm transition"
                >
                  <Eye size={16} /> Preview Complaint
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
