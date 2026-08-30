import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CircleCheck, Inbox, Mail, ArrowUpRight, Plus, Phone } from 'lucide-react';
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
    { label: 'Total Properties', value: props.length, sub: 'in portfolio', icon: Building2 },
    { label: 'Available Units', value: available, sub: 'ready to rent', icon: CircleCheck },
    { label: 'Sessions Today', value: stats.today, sub: 'new inquiries', icon: Inbox },
    { label: 'Unread Leads', value: stats.new, sub: 'awaiting response', icon: Mail },
  ];

  if (loading) return (
    <div className="p-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => <div key={i} className="card-premium h-28 shimmer animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {CARDS.map(card => {
          const Icon = card.icon;
          return (
          <div key={card.label} className="card-premium p-5 hover-lift">
            <div className="mb-2 text-gold-500"><Icon className="w-6 h-6" /></div>
            <div className="font-display text-3xl font-black text-slate-900 dark:text-white mb-0.5">{card.value}</div>
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.label}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{card.sub}</div>
          </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Status Distribution */}
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-slate-900 dark:text-white text-sm">Portfolio Status</h2>
            <Link to="/employee/properties" className="text-gold-600 dark:text-gold-400 text-xs font-bold hover:underline inline-flex items-center gap-1">
              Manage <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-4 mb-6">
            {[
              { label: 'Available', count: available, color: 'bg-emerald-500', pct: props.length ? Math.round(available / props.length * 100) : 0 },
              { label: 'Occupied', count: occupied, color: 'bg-slate-400', pct: props.length ? Math.round(occupied / props.length * 100) : 0 },
              { label: 'Maintenance', count: maintenance, color: 'bg-amber-500', pct: props.length ? Math.round(maintenance / props.length * 100) : 0 },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 w-24">{item.label}</span>
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white w-6 text-right">{item.count}</span>
              </div>
            ))}
          </div>
          <Link to="/employee/properties/new" className="btn-luxury w-full text-center text-xs py-2">
            <Plus className="w-3.5 h-3.5" />
            Add New Property
          </Link>
        </div>

        {/* Recent Leads */}
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-slate-900 dark:text-white text-sm">Recent Leads</h2>
            <Link to="/employee/leads" className="text-gold-600 dark:text-gold-400 text-xs font-bold hover:underline inline-flex items-center gap-1">
              View Inbox <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {leads.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No recent inquiries
            </div>
          ) : (
            <div className="space-y-3">
              {leads.map(lead => (
                <div key={lead.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gold-50 dark:bg-gold-950 text-gold-600 dark:text-gold-400 font-bold text-xs flex items-center justify-center">
                    {lead.full_name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{lead.full_name}</div>
                    <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                      {lead.interest_type}
                      <Phone className="w-3 h-3 inline shrink-0" />
                      {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${lead.contacted ? 'bg-slate-300' : 'bg-gold-500 animate-pulse'}`} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
