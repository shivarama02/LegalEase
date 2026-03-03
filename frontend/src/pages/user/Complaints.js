import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import { FileText, Shield, Briefcase, Home, Users, Cpu, Building2, ChevronRight, ClipboardList } from 'lucide-react';

// Complaint categories definition
export const COMPLAINT_TYPES = [
  {
    key: 'consumer',
    title: 'Consumer Protection',
    icon: FileText,
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    desc: 'Defective products, service deficiency & unfair trade practices',
    fields: ['Complainant details','Opposite party details','Product/service details','Description of defect','Evidence','Relief sought']
  },
  {
    key: 'ipc',
    title: 'Criminal (IPC / FIR)',
    icon: Shield,
    gradient: 'from-red-500 to-rose-600',
    bg: 'bg-red-50',
    text: 'text-red-700',
    desc: 'Report criminal offences & request FIR registration',
    fields: ['Complainant details','Accused details','Date/time/place of incident','Facts of the offence','Witnesses','Sections violated','Relief sought']
  },
  {
    key: 'labour',
    title: 'Labour / Employment',
    icon: Briefcase,
    gradient: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    desc: 'Wages, dismissal, harassment & workplace safety issues',
    fields: ['Employee details','Employer details','Nature of grievance','Evidence','Relief sought']
  },
  {
    key: 'family',
    title: 'Family / Domestic Violence',
    icon: Users,
    gradient: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    desc: 'Protection, maintenance, custody & domestic abuse matters',
    fields: ['Complainant details','Respondent details','Relationship','Nature of violence','Evidence','Relief sought']
  },
  {
    key: 'cyber',
    title: 'Cyber Crime',
    icon: Cpu,
    gradient: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    desc: 'Online fraud, phishing, hacking & identity theft',
    fields: ['Complainant details','Date/time of offence','Nature of offence','Evidence (screenshots/emails/transactions)','Relief sought']
  },
  {
    key: 'property',
    title: 'Property / Tenancy',
    icon: Home,
    gradient: 'from-amber-500 to-yellow-600',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    desc: 'Rent disputes, illegal eviction & property damage',
    fields: ['Complainant details','Respondent details','Property details','Nature of grievance','Evidence','Relief sought']
  },
  {
    key: 'corporate',
    title: 'Corporate / Company Law',
    icon: Building2,
    gradient: 'from-indigo-500 to-violet-600',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    desc: 'Oppression, mismanagement & corporate misconduct',
    fields: ['Shareholder/Director details','Company details','Nature of grievance','Evidence','Relief sought']
  }
];

export default function Complaints() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <UserSidebar />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">

            {/* Header */}
            <div className="mb-8 text-left">
              <div className="flex items-start justify-between">
                
                {/* Left Side */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                    <ClipboardList size={18} className="text-white" />
                  </div>

                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">
                      Complaints
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                      Select a complaint type to begin drafting your complaint.
                    </p>
                  </div>
                </div>

                {/* Right Side Button */}
                <button
                  onClick={() => navigate('/user/complaints/history')}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition"
                >
                  <FileText size={14} />
                  History
                </button>

              </div>
            </div>

            {/* How it works banner */}
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-4 mb-6">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">How it works</p>
              <div className="flex flex-wrap gap-6 text-sm text-slate-600">
                <span className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span> Select a category</span>
                <span className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</span> Fill in details</span>
                <span className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">3</span> Preview & save</span>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {COMPLAINT_TYPES.map(c => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.key}
                    onClick={() => navigate(`/user/complaints/generator?type=${c.key}`)}
                    className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer overflow-hidden"
                  >
                    <div className={`h-2 bg-gradient-to-r ${c.gradient}`} />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-11 h-11 rounded-xl ${c.bg} flex flex-wrap items-center justify-center`}>
                          <Icon size={20} className={c.text} />
                        </div>
                        
                      </div>
                      <h2 className="text-base font-bold text-slate-800 mb-1 group-hover:text-indigo-700 transition-colors">{c.title}</h2>
                      <p className="text-xs text-slate-500 mb-3 leading-relaxed">{c.desc}</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {c.fields.slice(0, 3).map(f => (
                          <span key={f} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-500">{f}</span>
                        ))}
                        {c.fields.length > 3 && (
                          <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-400">+{c.fields.length - 3}</span>
                        )}
                      </div>
                      <div className="flex items-center text-xs font-semibold text-indigo-600 group-hover:gap-2 transition-all">
                        Generate <ChevronRight size={13} className="ml-0.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export types map for generator reuse
export const COMPLAINT_TYPE_MAP = COMPLAINT_TYPES.reduce((acc, c) => { acc[c.key] = c; return acc; }, {});