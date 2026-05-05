import React, { useEffect, useState, useCallback } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { apiUrl } from '../../api';
import {
  FileText, Search, Trash2, Loader2, X, CheckCircle2, Plus, Pencil, BookOpen, List, ScrollText, Globe, FolderOpen,
  ChevronRight,
} from 'lucide-react';

const LEVELS = {
  domains: 'domains',
  categories: 'categories',
  laws: 'laws',
  sections: 'sections',
  details: 'details',
};

export default function LawInfoManagement() {
  const token = sessionStorage.getItem('authToken');
  const headers = token ? { Authorization: `Token ${token}` } : {};
  const jsonHeaders = { ...headers, 'Content-Type': 'application/json' };

  const [level, setLevel] = useState(LEVELS.domains);
  const [toast, setToast] = useState('');

  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLaw, setSelectedLaw] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  useEffect(() => {
    if (level === LEVELS.categories && !selectedDomain) setLevel(LEVELS.domains);
    if (level === LEVELS.laws && !selectedCategory) setLevel(LEVELS.domains);
    if (level === LEVELS.sections && !selectedLaw) setLevel(LEVELS.domains);
    if (level === LEVELS.details && !selectedSection) setLevel(LEVELS.domains);
  }, [level, selectedDomain, selectedCategory, selectedLaw, selectedSection]);

  // Domain state
  const [domains, setDomains] = useState([]);
  const [domainSearch, setDomainSearch] = useState('');
  const [domainLoading, setDomainLoading] = useState(true);
  const [domainModal, setDomainModal] = useState(null);
  const [domainSaving, setDomainSaving] = useState(false);

  // Category state
  const [categories, setCategories] = useState([]);
  const [catSearch, setCatSearch] = useState('');
  const [catLoading, setCatLoading] = useState(true);
  const [catModal, setCatModal] = useState(null);
  const [catSaving, setCatSaving] = useState(false);

  // Law state
  const [laws, setLaws] = useState([]);
  const [lawSearch, setLawSearch] = useState('');
  const [lawLoading, setLawLoading] = useState(true);
  const [lawModal, setLawModal] = useState(null);
  const [lawSaving, setLawSaving] = useState(false);

  // Section state
  const [sections, setSections] = useState([]);
  const [secSearch, setSecSearch] = useState('');
  const [secLoading, setSecLoading] = useState(true);
  const [secModal, setSecModal] = useState(null);
  const [secSaving, setSecSaving] = useState(false);

  // Detail state
  const [details, setDetails] = useState([]);
  const [detSearch, setDetSearch] = useState('');
  const [detLoading, setDetLoading] = useState(true);
  const [detModal, setDetModal] = useState(null);
  const [detSaving, setDetSaving] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // ———— LOAD FUNCTIONS ————
  const loadDomains = useCallback(async () => {
    setDomainLoading(true);
    try {
      const url = domainSearch ? apiUrl(`/law-domains/?search=${encodeURIComponent(domainSearch)}`) : apiUrl('/law-domains/');
      const res = await fetch(url, { headers });
      if (res.ok) { const d = await res.json(); setDomains(Array.isArray(d) ? d : d.results || []); }
    } catch { } finally { setDomainLoading(false); }
  }, [domainSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCategories = useCallback(async () => {
    if (!selectedDomain?.id) {
      setCategories([]);
      setCatLoading(false);
      return;
    }
    setCatLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('domain', selectedDomain.id);
      if (catSearch) params.set('search', catSearch);
      const url = apiUrl(`/law-categories/?${params.toString()}`);
      const res = await fetch(url, { headers });
      if (res.ok) { const d = await res.json(); setCategories(Array.isArray(d) ? d : d.results || []); }
    } catch { } finally { setCatLoading(false); }
  }, [catSearch, selectedDomain?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadLaws = useCallback(async () => {
    if (!selectedCategory?.id) {
      setLaws([]);
      setLawLoading(false);
      return;
    }
    setLawLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('category', selectedCategory.id);
      if (lawSearch) params.set('search', lawSearch);
      const url = apiUrl(`/laws/?${params.toString()}`);
      const res = await fetch(url, { headers });
      if (res.ok) { const d = await res.json(); setLaws(Array.isArray(d) ? d : d.results || []); }
    } catch { } finally { setLawLoading(false); }
  }, [lawSearch, selectedCategory?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSections = useCallback(async () => {
    if (!selectedLaw?.id) {
      setSections([]);
      setSecLoading(false);
      return;
    }
    setSecLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('law', selectedLaw.id);
      if (secSearch) params.set('search', secSearch);
      const url = apiUrl(`/law-sections/?${params.toString()}`);
      const res = await fetch(url, { headers });
      if (res.ok) { const d = await res.json(); setSections(Array.isArray(d) ? d : d.results || []); }
    } catch { } finally { setSecLoading(false); }
  }, [secSearch, selectedLaw?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDetails = useCallback(async () => {
    if (!selectedSection?.id) {
      setDetails([]);
      setDetLoading(false);
      return;
    }
    setDetLoading(true);
    try {
      const url = detSearch ? apiUrl(`/law-section-details/?search=${encodeURIComponent(detSearch)}`) : apiUrl('/law-section-details/');
      const res = await fetch(url, { headers });
      if (res.ok) {
        const d = await res.json();
        const arr = Array.isArray(d) ? d : d.results || [];
        setDetails(arr.filter(x => String(x.section) === String(selectedSection.id)));
      }
    } catch { } finally { setDetLoading(false); }
  }, [detSearch, selectedSection?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { const t = setTimeout(loadDomains, 300); return () => clearTimeout(t); }, [loadDomains]);
  useEffect(() => { const t = setTimeout(loadCategories, 300); return () => clearTimeout(t); }, [loadCategories]);
  useEffect(() => { const t = setTimeout(loadLaws, 300); return () => clearTimeout(t); }, [loadLaws]);
  useEffect(() => { const t = setTimeout(loadSections, 300); return () => clearTimeout(t); }, [loadSections]);
  useEffect(() => { const t = setTimeout(loadDetails, 300); return () => clearTimeout(t); }, [loadDetails]);

  // ———— GENERIC CRUD ————
  async function handleDelete(endpoint, id, setter, label) {
    if (!window.confirm(`Delete this ${label} permanently?`)) return;
    try {
      const res = await fetch(apiUrl(`/${endpoint}/${id}/`), { method: 'DELETE', headers });
      if (res.ok || res.status === 204) { setter(prev => prev.filter(i => i.id !== id)); showToast(`${label} deleted`); }
    } catch { }
  }

  async function handleSave(endpoint, modal, setModal, setSaving, reload, label) {
    if (!modal) return;
    setSaving(true);
    try {
      const isEdit = modal.mode === 'edit';
      const url = isEdit ? apiUrl(`/${endpoint}/${modal.data.id}/`) : apiUrl(`/${endpoint}/`);
      const method = isEdit ? 'PUT' : 'POST';
      const body = { ...modal.data };
      Object.keys(body).forEach(k => { if (body[k] === '') body[k] = body[k]; }); // keep empty strings
      const res = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (res.ok) { setModal(null); showToast(isEdit ? `${label} updated` : `${label} added`); reload(); }
      else { const err = await res.json().catch(() => null); if (err) showToast(`Error: ${JSON.stringify(err)}`); }
    } catch { } finally { setSaving(false); }
  }

  function autoSlug(title) { return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

  // ———— RENDER HELPERS ————
  function renderSearch(value, onChange, placeholder) {
    return (
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 shadow-sm" />
        {value && <button onClick={() => onChange('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={14} /></button>}
      </div>
    );
  }
  function renderLoading(text) { return <div className="flex items-center justify-center py-20 gap-2 text-slate-400"><Loader2 size={20} className="animate-spin" /> {text}</div>; }
  function renderEmpty(search, label) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center">
        <BookOpen size={36} className="mx-auto mb-3 text-slate-300" />
        <h3 className="text-lg font-bold text-slate-700">No {label} Found</h3>
        <p className="text-sm text-slate-400 mt-1">{search ? 'Try a different search' : `Add your first ${label.toLowerCase()}`}</p>
      </div>
    );
  }
  function renderField(label, value, onChange, { type = 'text', required = false, rows = 0, options = null, placeholder = '', disabled = false } = {}) {
    return (
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">{label}{required && ' *'}</label>
        {options ? (
          <select value={value || ''} onChange={e => onChange(e.target.value)} disabled={disabled}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 bg-white disabled:bg-slate-50 disabled:text-slate-400">
            <option value="">— Select —</option>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : rows > 0 ? (
          <textarea rows={rows} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 resize-none disabled:bg-slate-50 disabled:text-slate-400" />
        ) : (
          <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 disabled:bg-slate-50 disabled:text-slate-400" />
        )}
      </div>
    );
  }
  function renderModal(modal, setModal, saving, onSave, title, disableSave) {
    if (!modal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setModal(null)}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">{modal.mode === 'edit' ? `Edit ${title}` : `Add ${title}`}</h2>
            <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
          </div>
          <div className="p-5 space-y-4">{modal.fields}</div>
          <div className="flex justify-end gap-3 p-5 border-t border-slate-100">
            <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
            <button onClick={onSave} disabled={saving || disableSave}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:shadow-md transition disabled:opacity-50">
              {saving ? 'Saving…' : modal.mode === 'edit' ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function resetToDomains() {
    setLevel(LEVELS.domains);
    setSelectedDomain(null);
    setSelectedCategory(null);
    setSelectedLaw(null);
    setSelectedSection(null);
    setCatSearch('');
    setLawSearch('');
    setSecSearch('');
    setDetSearch('');
  }

  function goToCategories(domain) {
    setSelectedDomain(domain);
    setSelectedCategory(null);
    setSelectedLaw(null);
    setSelectedSection(null);
    setCatSearch('');
    setLawSearch('');
    setSecSearch('');
    setDetSearch('');
    setLevel(LEVELS.categories);
  }

  function goToLaws(category) {
    setSelectedCategory(category);
    setSelectedLaw(null);
    setSelectedSection(null);
    setLawSearch('');
    setSecSearch('');
    setDetSearch('');
    setLevel(LEVELS.laws);
  }

  function goToSections(law) {
    setSelectedLaw(law);
    setSelectedSection(null);
    setSecSearch('');
    setDetSearch('');
    setLevel(LEVELS.sections);
  }

  function goToDetails(section) {
    setSelectedSection(section);
    setDetSearch('');
    setLevel(LEVELS.details);
  }

  function renderBreadcrumb() {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 mb-6">
        <button onClick={resetToDomains} className={`font-semibold hover:text-slate-900 ${level === LEVELS.domains ? 'text-slate-900' : ''}`}>
          Domains
        </button>
        {selectedDomain && (
          <>
            <ChevronRight size={16} className="text-slate-300" />
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedLaw(null);
                setSelectedSection(null);
                setLawSearch('');
                setSecSearch('');
                setDetSearch('');
                setLevel(LEVELS.categories);
              }}
              className={`font-semibold hover:text-slate-900 ${level === LEVELS.categories ? 'text-slate-900' : ''}`}
            >
              {selectedDomain.domain_name}
            </button>
          </>
        )}
        {selectedCategory && (
          <>
            <ChevronRight size={16} className="text-slate-300" />
            <button
              onClick={() => {
                setSelectedLaw(null);
                setSelectedSection(null);
                setSecSearch('');
                setDetSearch('');
                setLevel(LEVELS.laws);
              }}
              className={`font-semibold hover:text-slate-900 ${level === LEVELS.laws ? 'text-slate-900' : ''}`}
            >
              {selectedCategory.category_name}
            </button>
          </>
        )}
        {selectedLaw && (
          <>
            <ChevronRight size={16} className="text-slate-300" />
            <button
              onClick={() => {
                setSelectedSection(null);
                setDetSearch('');
                setLevel(LEVELS.sections);
              }}
              className={`font-semibold hover:text-slate-900 ${level === LEVELS.sections ? 'text-slate-900' : ''}`}
            >
              {selectedLaw.short_title || selectedLaw.law_title}
            </button>
          </>
        )}
        {selectedSection && (
          <>
            <ChevronRight size={16} className="text-slate-300" />
            <span className={`font-semibold ${level === LEVELS.details ? 'text-slate-900' : ''}`}>
              {selectedSection.section_number}
            </span>
          </>
        )}
      </div>
    );
  }

  function renderCard({
    title,
    subtitle,
    meta,
    icon: Icon,
    onClick,
    onEdit,
    onDelete,
  }) {
    return (
      <div
        onClick={onClick}
        className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 cursor-pointer overflow-hidden"
      >
        <div className="h-2 bg-gradient-to-r from-teal-500 to-emerald-500" />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-teal-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-slate-800 truncate group-hover:text-teal-700 transition-colors">{title}</h3>
                {subtitle && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{subtitle}</p>}
                {meta && <div className="text-[10px] text-slate-400 mt-1">{meta}</div>}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {onEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  className="p-2 rounded-lg text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition"
                >
                  <Pencil size={16} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center text-xs font-semibold text-teal-600 mt-1 group-hover:gap-2 transition-all">
            Open <ChevronRight size={14} className="ml-0.5" />
          </div>
        </div>
      </div>
    );
  }

  // ──────── DOMAINS LEVEL ────────
  function updateDomain(k, v) { setDomainModal(m => ({ ...m, data: { ...m.data, [k]: v } })); }
  function renderDomainsLevel() {
    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">Top-level grouping: Criminal, Civil, Family, etc.</p>
          <button onClick={() => setDomainModal({ mode: 'add', data: { domain_name: '', description: '', display_order: 0 } })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow-sm hover:shadow-md transition">
            <Plus size={16} /> Add Domain
          </button>
        </div>
        {renderSearch(domainSearch, setDomainSearch, 'Search domains…')}
        {domainLoading ? renderLoading('Loading…') : domains.length === 0 ? renderEmpty(domainSearch, 'Domains') : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {domains.map(d => (
              <div key={d.id}>
                {renderCard({
                  title: d.domain_name,
                  subtitle: d.description,
                  meta: `Order: ${d.display_order} · ${(d.categories?.length || 0)} categories`,
                  icon: Globe,
                  onClick: () => goToCategories(d),
                  onEdit: () => setDomainModal({ mode: 'edit', data: { ...d } }),
                  onDelete: async () => {
                    await handleDelete('law-domains', d.id, setDomains, 'Domain');
                    if (selectedDomain?.id === d.id) resetToDomains();
                  },
                })}
              </div>
            ))}
          </div>
        )}
      </>
    );
  }
  function renderDomainModal() {
    if (!domainModal) return null;
    const fields = (
      <>
        {renderField('Domain Name', domainModal.data.domain_name, v => updateDomain('domain_name', v), { required: true })}
        {renderField('Description', domainModal.data.description, v => updateDomain('description', v), { rows: 3 })}
        {renderField('Display Order', domainModal.data.display_order, v => updateDomain('display_order', Number(v) || 0), { type: 'number' })}
      </>
    );
    return renderModal({ ...domainModal, fields }, setDomainModal, domainSaving,
      () => handleSave('law-domains', domainModal, setDomainModal, setDomainSaving, loadDomains, 'Domain'),
      'Domain', !domainModal.data.domain_name);
  }

  // ──────── CATEGORIES LEVEL ────────
  function updateCat(k, v) { setCatModal(m => { const u = { ...m, data: { ...m.data, [k]: v } }; if (k === 'category_name') u.data.slug = autoSlug(v); return u; }); }
  function renderCategoriesLevel() {
    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">Categories under: <span className="font-semibold text-slate-700">{selectedDomain?.domain_name}</span></p>
          <button onClick={() => setCatModal({ mode: 'add', data: { domain: selectedDomain?.id || '', category_name: '', slug: '', description: '' } })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow-sm hover:shadow-md transition">
            <Plus size={16} /> Add Category
          </button>
        </div>
        {renderSearch(catSearch, setCatSearch, 'Search categories…')}
        {catLoading ? renderLoading('Loading…') : categories.length === 0 ? renderEmpty(catSearch, 'Categories') : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {categories.map(c => (
              <div key={c.id}>
                {renderCard({
                  title: c.category_name,
                  subtitle: c.description,
                  meta: `Slug: ${c.slug} · ${c.laws_count ?? 0} laws`,
                  icon: FolderOpen,
                  onClick: () => goToLaws(c),
                  onEdit: () => setCatModal({ mode: 'edit', data: { ...c } }),
                  onDelete: async () => {
                    await handleDelete('law-categories', c.id, setCategories, 'Category');
                    if (selectedCategory?.id === c.id) {
                      setSelectedCategory(null);
                      setSelectedLaw(null);
                      setSelectedSection(null);
                      setLawSearch('');
                      setSecSearch('');
                      setDetSearch('');
                      setLevel(LEVELS.categories);
                    }
                  },
                })}
              </div>
            ))}
          </div>
        )}
      </>
    );
  }
  function renderCatModal() {
    if (!catModal) return null;
    const domainOpts = domains.map(d => ({ value: d.id, label: d.domain_name }));
    const lockDomain = !!selectedDomain?.id && catModal.mode === 'add';
    const fields = (
      <>
        {renderField('Domain', catModal.data.domain, v => updateCat('domain', Number(v) || ''), { options: domainOpts, required: true, disabled: lockDomain })}
        {renderField('Category Name', catModal.data.category_name, v => updateCat('category_name', v), { required: true })}
        {renderField('Slug', catModal.data.slug, v => updateCat('slug', v), { placeholder: 'auto-generated' })}
        {renderField('Description', catModal.data.description, v => updateCat('description', v), { rows: 3 })}
      </>
    );
    return renderModal({ ...catModal, fields }, setCatModal, catSaving,
      () => handleSave('law-categories', catModal, setCatModal, setCatSaving, loadCategories, 'Category'),
      'Category', !catModal.data.category_name);
  }

  // ──────── LAWS LEVEL ────────
  function updateLaw(k, v) { setLawModal(m => ({ ...m, data: { ...m.data, [k]: v } })); }
  function renderLawsLevel() {
    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">Laws under: <span className="font-semibold text-slate-700">{selectedCategory?.category_name}</span></p>
          <button onClick={() => setLawModal({ mode: 'add', data: { category: selectedCategory?.id || '', law_title: '', short_title: '', enactment_year: '', law_type: '', authority: '', summary: '' } })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow-sm hover:shadow-md transition">
            <Plus size={16} /> Add Law
          </button>
        </div>
        {renderSearch(lawSearch, setLawSearch, 'Search laws…')}
        {lawLoading ? renderLoading('Loading…') : laws.length === 0 ? renderEmpty(lawSearch, 'Laws') : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {laws.map(l => (
              <div key={l.id}>
                {renderCard({
                  title: l.short_title || l.law_title,
                  subtitle: l.summary,
                  meta: `${l.enactment_year ? `Year: ${l.enactment_year} · ` : ''}${l.sections_count ?? 0} sections`,
                  icon: FileText,
                  onClick: () => goToSections(l),
                  onEdit: () => setLawModal({ mode: 'edit', data: { ...l } }),
                  onDelete: async () => {
                    await handleDelete('laws', l.id, setLaws, 'Law');
                    if (selectedLaw?.id === l.id) {
                      setSelectedLaw(null);
                      setSelectedSection(null);
                      setSecSearch('');
                      setDetSearch('');
                      setLevel(LEVELS.laws);
                    }
                  },
                })}
              </div>
            ))}
          </div>
        )}
      </>
    );
  }
  function renderLawModal() {
    if (!lawModal) return null;
    const catOpts = categories.map(c => ({ value: c.id, label: c.category_name }));
    const lockCategory = !!selectedCategory?.id && lawModal.mode === 'add';
    const fields = (
      <>
        {renderField('Category', lawModal.data.category, v => updateLaw('category', Number(v) || ''), { options: catOpts, required: true, disabled: lockCategory })}
        {renderField('Law Title', lawModal.data.law_title, v => updateLaw('law_title', v), { required: true })}
        {renderField('Short Title', lawModal.data.short_title, v => updateLaw('short_title', v))}
        {renderField('Enactment Year', lawModal.data.enactment_year, v => updateLaw('enactment_year', v ? Number(v) : ''), { type: 'number' })}
        {renderField('Law Type', lawModal.data.law_type, v => updateLaw('law_type', v), { placeholder: 'e.g. Act, Code, Rules' })}
        {renderField('Authority', lawModal.data.authority, v => updateLaw('authority', v), { placeholder: 'e.g. Parliament of India' })}
        {renderField('Summary', lawModal.data.summary, v => updateLaw('summary', v), { rows: 4 })}
      </>
    );
    return renderModal({ ...lawModal, fields }, setLawModal, lawSaving,
      () => handleSave('laws', lawModal, setLawModal, setLawSaving, loadLaws, 'Law'),
      'Law', !lawModal.data.law_title);
  }

  // ──────── SECTIONS LEVEL ────────
  function updateSec(k, v) { setSecModal(m => ({ ...m, data: { ...m.data, [k]: v } })); }
  function renderSectionsLevel() {
    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">Sections under: <span className="font-semibold text-slate-700">{selectedLaw?.short_title || selectedLaw?.law_title}</span></p>
          <button onClick={() => setSecModal({ mode: 'add', data: { law: selectedLaw?.id || '', section_number: '', section_title: '', chapter: '', section_text: '' } })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow-sm hover:shadow-md transition">
            <Plus size={16} /> Add Section
          </button>
        </div>
        {renderSearch(secSearch, setSecSearch, 'Search sections…')}
        {secLoading ? renderLoading('Loading…') : sections.length === 0 ? renderEmpty(secSearch, 'Sections') : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sections.map(s => (
              <div key={s.id}>
                {renderCard({
                  title: `${s.section_number} — ${s.section_title}`,
                  subtitle: s.section_text,
                  meta: `${s.chapter ? `Chapter: ${s.chapter} · ` : ''}${s.detail ? 'Has detail' : 'No detail'}`,
                  icon: List,
                  onClick: () => goToDetails(s),
                  onEdit: () => setSecModal({ mode: 'edit', data: { ...s } }),
                  onDelete: async () => {
                    await handleDelete('law-sections', s.id, setSections, 'Section');
                    if (selectedSection?.id === s.id) {
                      setSelectedSection(null);
                      setDetSearch('');
                      setLevel(LEVELS.sections);
                    }
                  },
                })}
              </div>
            ))}
          </div>
        )}
      </>
    );
  }
  function renderSecModal() {
    if (!secModal) return null;
    const lawOpts = laws.map(l => ({ value: l.id, label: l.law_title }));
    const lockLaw = !!selectedLaw?.id && secModal.mode === 'add';
    const fields = (
      <>
        {renderField('Law', secModal.data.law, v => updateSec('law', Number(v) || ''), { options: lawOpts, required: true, disabled: lockLaw })}
        {renderField('Section Number', secModal.data.section_number, v => updateSec('section_number', v), { required: true, placeholder: 'e.g. 302, 420' })}
        {renderField('Section Title', secModal.data.section_title, v => updateSec('section_title', v), { required: true })}
        {renderField('Chapter', secModal.data.chapter, v => updateSec('chapter', v))}
        {renderField('Section Text', secModal.data.section_text, v => updateSec('section_text', v), { rows: 5 })}
      </>
    );
    return renderModal({ ...secModal, fields }, setSecModal, secSaving,
      () => handleSave('law-sections', secModal, setSecModal, setSecSaving, loadSections, 'Section'),
      'Section', !secModal.data.section_number);
  }

  // ──────── DETAILS LEVEL ────────
  function updateDet(k, v) { setDetModal(m => ({ ...m, data: { ...m.data, [k]: v } })); }
  function renderDetailsLevel() {
    const hasDetail = details.length > 0;
    const firstDetail = details[0];
    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">Detail for: <span className="font-semibold text-slate-700">Section {selectedSection?.section_number}</span></p>
          <button
            onClick={() => {
              if (hasDetail && firstDetail) setDetModal({ mode: 'edit', data: { ...firstDetail } });
              else setDetModal({ mode: 'add', data: { section: selectedSection?.id || '', simplified_explanation: '', offence_description: '', imprisonment_term: '', fine_amount: '', compensation: '', bailable_status: '', cognizable_status: '', example_scenario: '' } });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow-sm hover:shadow-md transition">
            <Plus size={16} /> {hasDetail ? 'Edit Detail' : 'Add Detail'}
          </button>
        </div>
        {renderSearch(detSearch, setDetSearch, 'Search details…')}
        {detLoading ? renderLoading('Loading…') : details.length === 0 ? renderEmpty(detSearch, 'Section Details') : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {details.map(d => (
              <div key={d.id}>
                {renderCard({
                  title: `Section #${selectedSection?.section_number}`,
                  subtitle: d.simplified_explanation,
                  meta: `${d.imprisonment_term ? `Imprisonment: ${d.imprisonment_term} · ` : ''}${d.fine_amount ? `Fine: ${d.fine_amount}` : ''}`.trim() || 'Detail',
                  icon: ScrollText,
                  onClick: () => setDetModal({ mode: 'edit', data: { ...d } }),
                  onEdit: () => setDetModal({ mode: 'edit', data: { ...d } }),
                  onDelete: async () => {
                    await handleDelete('law-section-details', d.id, setDetails, 'Detail');
                  },
                })}
              </div>
            ))}
          </div>
        )}
      </>
    );
  }
  function renderDetModal() {
    if (!detModal) return null;
    const secOpts = sections.map(s => ({ value: s.id, label: `${s.section_number} — ${s.section_title}` }));
    const lockSection = !!selectedSection?.id && detModal.mode === 'add';
    const fields = (
      <>
        {renderField('Section', detModal.data.section, v => updateDet('section', Number(v) || ''), { options: secOpts, required: true, disabled: lockSection })}
        {renderField('Simplified Explanation', detModal.data.simplified_explanation, v => updateDet('simplified_explanation', v), { rows: 3 })}
        {renderField('Offence Description', detModal.data.offence_description, v => updateDet('offence_description', v), { rows: 3 })}
        {renderField('Imprisonment Term', detModal.data.imprisonment_term, v => updateDet('imprisonment_term', v), { placeholder: 'e.g. 3-7 years rigorous' })}
        {renderField('Fine Amount', detModal.data.fine_amount, v => updateDet('fine_amount', v), { placeholder: 'e.g. Up to ₹1,00,000' })}
        {renderField('Compensation', detModal.data.compensation, v => updateDet('compensation', v), { rows: 2 })}
        {renderField('Bailable Status', detModal.data.bailable_status, v => updateDet('bailable_status', v), { placeholder: 'e.g. Bailable / Non-bailable' })}
        {renderField('Cognizable Status', detModal.data.cognizable_status, v => updateDet('cognizable_status', v), { placeholder: 'e.g. Cognizable / Non-cognizable' })}
        {renderField('Example Scenario', detModal.data.example_scenario, v => updateDet('example_scenario', v), { rows: 3 })}
      </>
    );
    return renderModal({ ...detModal, fields }, setDetModal, detSaving,
      () => handleSave('law-section-details', detModal, setDetModal, setDetSaving, loadDetails, 'Detail'),
      'Detail', !detModal.data.section);
  }

  // ──────── MAIN RENDER ────────
  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Law Management</h1>
              <p className="text-sm text-slate-500">Manage domains, categories, laws, sections & details</p>
            </div>
          </div>

          {toast && (
            <div className="mb-4 flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3 text-sm font-medium">
              <CheckCircle2 size={16} /> {toast}
            </div>
          )}

          {renderBreadcrumb()}

          {level === LEVELS.domains && renderDomainsLevel()}
          {level === LEVELS.categories && renderCategoriesLevel()}
          {level === LEVELS.laws && renderLawsLevel()}
          {level === LEVELS.sections && renderSectionsLevel()}
          {level === LEVELS.details && renderDetailsLevel()}
        </div>
      </div>

      {renderDomainModal()}
      {renderCatModal()}
      {renderLawModal()}
      {renderSecModal()}
      {renderDetModal()}
    </div>
  );
}
