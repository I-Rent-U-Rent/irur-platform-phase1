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
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Leads & Sessions</h1>
        <p className="text-gray-500 text-sm mt-1">
          {leads.length} total lead{leads.length !== 1 ? 's' : ''}{newCount > 0 ? ` · ${newCount} unread` : ''}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {([['all','All'], ['new','New'], ['contacted','Contacted']] as const).map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${filter === val ? 'bg-navy-800 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}`}>
            {label}
            {val === 'new' && newCount > 0 && <span className="ml-1.5 bg-gold-500 text-white text-xs px-1.5 py-0.5 rounded-full">{newCount}</span>}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />)}
            </div>
          ) : leads.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-card p-16 text-center">
              <div className="text-5xl mb-3">📭</div>
              <h3 className="font-semibold text-gray-700 mb-1">No leads found</h3>
              <p className="text-gray-400 text-sm">Leads submitted from the public site will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leads.map(lead => (
                <div key={lead.id}
                  onClick={() => setSelected(selected?.id === lead.id ? null : lead)}
                  className={`bg-white rounded-2xl shadow-card p-5 cursor-pointer transition-all border-2 ${selected?.id === lead.id ? 'border-gold-400 shadow-gold' : 'border-transparent hover:border-gray-200'}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center text-navy-700 font-bold text-sm flex-shrink-0">
                      {lead.full_name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-navy-900 text-sm">{lead.full_name}</span>
                        {!lead.contacted && <span className="bg-gold-100 text-gold-700 text-xs px-2 py-0.5 rounded-full font-medium">New</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lead.interest_type === 'renting' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                          {lead.interest_type === 'renting' ? '🏠 Renting' : '💼 Investing'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 truncate">{lead.email} {lead.phone ? `· ${lead.phone}` : ''}</div>
                      {lead.property_title && <div className="text-xs text-gold-600 mt-1">📍 Re: {lead.property_title}</div>}
                    </div>
                    <div className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-navy-900">Lead Details</h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 text-lg">×</button>
              </div>

              <div className="w-14 h-14 bg-navy-100 rounded-2xl flex items-center justify-center text-navy-700 font-bold text-xl mx-auto mb-4">
                {selected.full_name[0].toUpperCase()}
              </div>

              <div className="text-center mb-5">
                <div className="font-bold text-navy-900 text-lg">{selected.full_name}</div>
                <div className="text-sm text-gray-400">{selected.interest_type === 'renting' ? '🏠 Looking to rent' : '💼 Investor'}</div>
              </div>

              <div className="space-y-3 mb-5">
                {[
                  { icon: '📧', label: 'Email', val: selected.email, href: `mailto:${selected.email}` },
                  { icon: '📞', label: 'Phone', val: selected.phone, href: selected.phone ? `tel:${selected.phone}` : undefined },
                  { icon: '📅', label: 'Preferred Date', val: selected.preferred_date },
                  { icon: '⏰', label: 'Preferred Time', val: selected.preferred_time },
                  { icon: '📍', label: 'Property Interest', val: selected.property_title },
                  { icon: '🔗', label: 'Source', val: selected.source },
                ].filter(item => item.val).map(item => (
                  <div key={item.label} className="flex gap-2 items-start">
                    <span className="text-sm">{item.icon}</span>
                    <div className="text-xs">
                      <div className="text-gray-400">{item.label}</div>
                      {item.href ? (
                        <a href={item.href} className="text-navy-800 font-medium hover:text-gold-600 transition-colors">{item.val}</a>
                      ) : (
                        <div className="text-navy-800 font-medium">{item.val}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selected.message && (
                <div className="bg-gray-50 rounded-xl p-3 mb-5">
                  <div className="text-xs text-gray-400 mb-1">Message</div>
                  <p className="text-sm text-gray-700 leading-relaxed">{selected.message}</p>
                </div>
              )}

              <div className="space-y-2">
                {!selected.contacted && (
                  <button onClick={() => handleMarkContacted(selected)} disabled={marking === selected.id}
                    className="btn-primary w-full text-sm py-2.5 disabled:opacity-50">
                    {marking === selected.id ? 'Marking...' : '✓ Mark as Contacted'}
                  </button>
                )}
                {selected.contacted && (
                  <div className="text-center text-sm text-emerald-600 bg-emerald-50 py-2.5 rounded-xl font-medium">
                    ✓ Contacted
                  </div>
                )}
                <a href={`mailto:${selected.email}`} className="flex items-center justify-center gap-2 w-full btn-secondary text-sm py-2.5">
                  Send Email
                </a>
                <button onClick={() => handleDelete(selected.id)}
                  className="w-full text-sm text-red-500 hover:text-red-700 py-2 transition-colors">
                  Delete Lead
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">
                Submitted {new Date(selected.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile detail modal */}
      {selected && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-navy-900">Lead Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 text-2xl">×</button>
            </div>
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center text-navy-700 font-bold mx-auto mb-2">{selected.full_name[0]}</div>
              <div className="font-bold text-navy-900">{selected.full_name}</div>
              <div className="text-sm text-gray-400">{selected.email}</div>
            </div>
            {selected.message && <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm text-gray-700">{selected.message}</div>}
            <div className="space-y-2">
              {!selected.contacted && (
                <button onClick={() => handleMarkContacted(selected)} className="btn-primary w-full text-sm py-2.5">✓ Mark as Contacted</button>
              )}
              <a href={`mailto:${selected.email}`} className="flex justify-center items-center btn-secondary w-full text-sm py-2.5">Send Email</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
