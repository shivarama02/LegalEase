import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LawyerSidebar from '../../components/LawyerSidebar';

// Lists laws for a selected category using backend /api/lawdetails/?category=...
export default function LawList() {
  const { category } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const goDetail = (id) => {
    navigate(`/lawyer/laws/${category}/${id}`);
  };

  const label = (key) => {
    const map = {
      consumer: 'Consumer Law',
      ipc: 'Criminal Law',
      labour: 'Employment Law',
      family: 'Family Law',
      cyber: 'Cyber Crime',
      property: 'Property Law',
      corporate: 'Corporate / Company',
    };
    return map[key] || key;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex">
      <LawyerSidebar />
      <div className="flex-1 max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{label(category)} - Laws</h1>
          <button className="border rounded px-3 py-2" onClick={() => window.history.back()}>Back</button>
        </div>
        {loading && <div>Loading…</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((law) => (
              <div key={law.id} className="p-4 rounded bg-white shadow hover:shadow-lg cursor-pointer" onClick={() => goDetail(law.id)}>
                <h3 className="font-semibold text-lg mb-1">{law.title}</h3>
                <div className="text-sm text-gray-500 mb-2">{law.statute_name || '—'}</div>
                <p className="text-sm line-clamp-3">{law.summary}</p>
                <div className="mt-2 text-xs text-gray-400">Section: {law.section_reference || '—'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
