import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import { FileText, Shield, Briefcase, Home, Users, Cpu, Building2 } from 'lucide-react';

// Complaint categories definition
export const COMPLAINT_TYPES = [
  {
    key: 'consumer',
    title: 'Consumer Protection',
    icon: <FileText className="h-6 w-6" />,
    color: 'bg-purple-100 text-purple-700',
    desc: 'Defective products, service deficiency & unfair trade practices',
    fields: [
      'Complainant details','Opposite party details','Product/service details','Description of defect','Evidence','Relief sought'
    ]
  },
  {
    key: 'ipc',
    title: 'Criminal (IPC / FIR)',
    icon: <Shield className="h-6 w-6" />,
    color: 'bg-red-100 text-red-700',
    desc: 'Report criminal offences & request FIR registration',
    fields: [
      'Complainant details','Accused details','Date/time/place of incident','Facts of the offence','Witnesses','Sections violated','Relief sought'
    ]
  },
  {
    key: 'labour',
    title: 'Labour / Employment',
    icon: <Briefcase className="h-6 w-6" />,
    color: 'bg-green-100 text-green-700',
    desc: 'Wages, dismissal, harassment & workplace safety issues',
    fields: [
      'Employee details','Employer details','Nature of grievance','Evidence','Relief sought'
    ]
  },
  {
    key: 'family',
    title: 'Family / Domestic Violence',
    icon: <Users className="h-6 w-6" />,
    color: 'bg-pink-100 text-pink-700',
    desc: 'Protection, maintenance, custody & domestic abuse matters',
    fields: [
      'Complainant details','Respondent details','Relationship','Nature of violence','Evidence','Relief sought'
    ]
  },
  {
    key: 'cyber',
    title: 'Cyber Crime',
    icon: <Cpu className="h-6 w-6" />,
    color: 'bg-blue-100 text-blue-700',
    desc: 'Online fraud, phishing, hacking & identity theft',
    fields: [
      'Complainant details','Date/time of offence','Nature of offence','Evidence (screenshots/emails/transactions)','Relief sought'
    ]
  },
  {
    key: 'property',
    title: 'Property / Tenancy',
    icon: <Home className="h-6 w-6" />,
    color: 'bg-yellow-100 text-yellow-700',
    desc: 'Rent disputes, illegal eviction & property damage',
    fields: [
      'Complainant details','Respondent details','Property details','Nature of grievance','Evidence','Relief sought'
    ]
  },
  {
    key: 'corporate',
    title: 'Corporate / Company Law',
    icon: <Building2 className="h-6 w-6" />,
    color: 'bg-indigo-100 text-indigo-700',
    desc: 'Oppression, mismanagement & corporate misconduct',
    fields: [
      'Shareholder/Director details','Company details','Nature of grievance','Evidence','Relief sought'
    ]
  }
];

export default function Complaints() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex">
      <UserSidebar />
      <div className="flex-1 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Complaints</h1>
          </div>
          <button onClick={()=>navigate('/user/chat')} className="px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow text-sm">Ask AI Assistant</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main cards */}
            <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              {COMPLAINT_TYPES.map(c => (
                <ComplaintCard key={c.key} data={c} onClick={()=>navigate(`/user/complaints/generator?type=${c.key}`)} />
              ))}
            </div>

            {/* Side info */}
            {/* <div className="lg:col-span-1 space-y-6">
              <div className="shadow bg-white rounded">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">How It Works</h3>
                </div>
                <div className="p-4 space-y-3 text-sm text-gray-600">
                  <p>Select a complaint category based on your issue.</p>
                  <p>Fill the required fields shown in the generator form.</p>
                  <p>Preview & save your draft for legal follow-up.</p>
                </div>
              </div>
              <div className="shadow bg-white rounded">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                </div>
                <div className="p-4 space-y-2">
                  <button onClick={()=>navigate('/user/chat')} className="w-full py-2 border border-gray-300 rounded text-left hover:bg-gray-50 text-sm">Ask AI Assistant</button>
                  <button onClick={()=>navigate('/user/laws')} className="w-full py-2 border border-gray-300 rounded text-left hover:bg-gray-50 text-sm">Browse Laws</button>
                </div>
              </div>
            </div> */}
        </div>
      </div>
    </div>
  );
}

function ComplaintCard({ data, onClick }) {
  return (
    <div onClick={onClick} className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-100 rounded shadow p-4">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${data.color}`}>{data.icon}</div>
      </div>
      <h2 className="text-xl mt-2 font-semibold">{data.title}</h2>
      <p className="text-gray-500 mb-4 text-sm">{data.desc}</p>
      <div className="flex flex-wrap gap-2">
        {data.fields.slice(0,3).map(f => (
          <span key={f} className="border border-gray-300 rounded px-2 py-1 text-xs">{f}</span>
        ))}
        {data.fields.length > 3 && <span className="border border-gray-300 rounded px-2 py-1 text-xs">+{data.fields.length-3} more</span>}
      </div>
    </div>
  );
}

// Export types map for generator reuse (optional import elsewhere)
export const COMPLAINT_TYPE_MAP = COMPLAINT_TYPES.reduce((acc, c) => { acc[c.key] = c; return acc; }, {});