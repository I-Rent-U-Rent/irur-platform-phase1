import { useState, useEffect } from 'react';
import { leadsApi } from '../../api/client';
import type { Lead } from '../../types';

export default function LeadsInbox() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted'>('all');
  const [selected, setSelected] = useState<Lead | null>(null);
  const [marking, setMarking] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    const params = filter === 'new' ? { contacted: false } : filter === 'contacted' ? { contacted: true } : {};
    leadsApi.getAll(params).then(setLeads).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleMarkContacted = async (lead: Lead) => {
    setMarking(lead.id);
    try {
      await leadsApi.markContacted(lead.id);
      setLeads(ls => ls.map(l => l.id === lead.id ? { ...l, contacted: 1 } : l));
      if (selected?.id === lead.id) setSelected({ ...lead, contacted: 1 });
    } catch { alert('Failed to update lead.'); }
    finally { setMarking(null); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this lead?')) return;
    await leadsApi.delete(id);
    setLeads(ls => ls.filter(l => l.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const newCount = leads.filter(l => !l.contacted).length;

  return (
    <div className="p-6 md:p-8 text-slate-900 dark:text-slate-100">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">Leads & Sessions</h1>
        <p className="text-slate-500 text-xs mt-1">
          {leads.length} total lead{leads.length !== 1 ? 's' : ''}{newCount > 0 ? ` · ${newCount} unread` : ''}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {([['all','All'], ['new','New'], ['contacted','Contacted']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === val
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {label}
            {val === 'new' && newCount > 0 && (
              <span className="ml-1.5 bg-brand-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{newCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        
        {/* List Column */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="card h-20 shimmer" />)}
            </div>
          ) : leads.length === 0 ? (
            <div className="card p-16 text-center">
              <div className="text-4xl mb-3">📭</div>
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base mb-1">No leads found</h3>
              <p className="text-slate-400 text-xs">Leads submitted from the public website will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leads.map(lead => (
                <div
                  key={lead.id}
                  onClick={() => setSelected(selected?.id === lead.id ? null : lead)}
                  className={`card p-5 cursor-pointer transition-all ${
                    selected?.id === lead.id
                      ? 'border-brand-500 dark:border-brand-500 ring-1 ring-brand-500'
                      : 'hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center font-display font-bold text-sm flex-shrink-0 border border-brand-200 dark:border-brand-800">
                      {lead.full_name[0].toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-display font-bold text-slate-900 dark:text-white text-sm">{lead.full_name}</span>
                        {!lead.contacted && (
                          <span className="bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            New
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {lead.interest_type === 'renting' ? '🏠 Renting' : '💼 Listing'}
                        </span>
                      </div>
                      
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {lead.email} {lead.phone ? `· ${lead.phone}` : ''}
                      </div>

                      {lead.property_title && (
                        <div className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-1 truncate">
                          Re: {lead.property_title}
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 flex-shrink-0">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <div className="card p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">Lead Details</h3>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
              </div>

              <div className="w-12 h-12 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center font-display font-bold text-base mx-auto mb-3 border border-brand-200 dark:border-brand-800">
                {selected.full_name[0].toUpperCase()}
              </div>

              <div className="text-center mb-5">
                <div className="font-display font-bold text-slate-900 dark:text-white text-base">{selected.full_name}</div>
                <div className="text-xs text-slate-400">{selected.interest_type === 'renting' ? 'Renting Inquiry' : 'Investor Listing'}</div>
              </div>

              <div className="space-y-3 mb-5 text-xs">
                {[
                  { label: 'Email', val: selected.email, href: `mailto:${selected.email}` },
                  { label: 'Phone', val: selected.phone, href: selected.phone ? `tel:${selected.phone}` : undefined },
                  { label: 'Preferred Date', val: selected.preferred_date },
                  { label: 'Preferred Time', val: selected.preferred_time },
                  { label: 'Property Interest', val: selected.property_title },
                  { label: 'Source', val: selected.source },
                ].filter(item => item.val).map(item => (
                  <div key={item.label}>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">{item.val}</a>
                    ) : (
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{item.val}</div>
                    )}
                  </div>
                ))}
              </div>

              {selected.message && (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 mb-5 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Message</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{selected.message}</p>
                </div>
              )}

              <div className="space-y-2">
                {!selected.contacted ? (
                  <button
                    onClick={() => handleMarkContacted(selected)}
                    disabled={marking === selected.id}
                    className="btn-primary w-full text-xs py-2"
                  >
                    {marking === selected.id ? 'Marking...' : '✓ Mark as Contacted'}
                  </button>
                ) : (
                  <div className="text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    ✓ Contacted
                  </div>
                )}

                <a href={`mailto:${selected.email}`} className="btn-secondary w-full text-center text-xs py-2 block">
                  Send Email
                </a>

                <button
                  onClick={() => handleDelete(selected.id)}
                  className="w-full text-xs text-red-600 dark:text-red-400 hover:underline py-1 text-center"
                >
                  Delete Lead
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
