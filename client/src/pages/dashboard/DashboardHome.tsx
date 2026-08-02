import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { propertiesApi, leadsApi } from '../../api/client';
import type { Property, Lead } from '../../types';

export default function DashboardHome() {
  const { user } = useAuth();
  const [props, setProps] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({ total: 0, today: 0, new: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      propertiesApi.getAll(),
      leadsApi.getAll(),
      leadsApi.getStats(),
    ]).then(([p, l, s]) => {
      setProps(p);
      setLeads(l.slice(0, 5));
      setStats(s);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const available = props.filter(p => p.status === 'available').length;
  const occupied = props.filter(p => p.status === 'occupied').length;
  const maintenance = props.filter(p => p.status === 'maintenance').length;

  const CARDS = [
    { label: 'Total Properties', value: props.length, sub: 'in portfolio', color: 'navy', icon: '🏠' },
    { label: 'Available Units', value: available, sub: 'ready to rent', color: 'emerald', icon: '✅' },
    { label: 'Sessions Today', value: stats.today, sub: 'new inquiries', color: 'gold', icon: '📅' },
    { label: 'Unread Leads', value: stats.new, sub: 'awaiting response', color: 'amber', icon: '📬' },
  ];

  if (loading) return (
    <div className="p-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900">Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {CARDS.map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <div className={`w-2 h-2 rounded-full ${card.color === 'emerald' ? 'bg-emerald-400' : card.color === 'gold' ? 'bg-gold-400' : card.color === 'amber' ? 'bg-amber-400' : 'bg-navy-400'}`} />
            </div>
            <div className="text-3xl font-extrabold text-navy-900 mb-0.5">{card.value}</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">{card.label}</div>
            <div className="text-xs text-gray-300 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Property status */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-navy-900">Property Status</h2>
            <Link to="/employee/properties" className="text-gold-600 text-xs hover:underline">View All →</Link>
          </div>
          <div className="space-y-3 mb-5">
            {[
              { label: 'Available', count: available, color: 'bg-emerald-400', pct: props.length ? Math.round(available / props.length * 100) : 0 },
              { label: 'Occupied', count: occupied, color: 'bg-blue-400', pct: props.length ? Math.round(occupied / props.length * 100) : 0 },
              { label: 'Maintenance', count: maintenance, color: 'bg-amber-400', pct: props.length ? Math.round(maintenance / props.length * 100) : 0 },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-24">{item.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                </div>
                <span className="text-sm font-semibold text-navy-900 w-6 text-right">{item.count}</span>
              </div>
            ))}
          </div>
          <Link to="/employee/properties/new" className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-gold-300 hover:text-gold-500 transition-all">
            + Add New Property
          </Link>
        </div>

        {/* Recent leads */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-navy-900">Recent Leads</h2>
            <Link to="/employee/leads" className="text-gold-600 text-xs hover:underline">View All →</Link>
          </div>
          {leads.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm">No leads yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leads.map(lead => (
                <div key={lead.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 bg-navy-100 rounded-full flex items-center justify-center text-navy-700 font-bold text-sm flex-shrink-0">
                    {lead.full_name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-navy-900 truncate">{lead.full_name}</div>
                    <div className="text-xs text-gray-400 truncate">{lead.interest_type === 'renting' ? '🏠 Renting' : '💼 Investing'} · {new Date(lead.created_at).toLocaleDateString()}</div>
                  </div>
                  <span className={`flex-shrink-0 w-2 h-2 rounded-full ${lead.contacted ? 'bg-gray-300' : 'bg-gold-400'}`} title={lead.contacted ? 'Contacted' : 'New'} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
