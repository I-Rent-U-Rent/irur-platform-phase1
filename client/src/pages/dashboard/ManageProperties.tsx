import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertiesApi } from '../../api/client';
import type { Property } from '../../types';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100&q=60';

export default function ManageProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    propertiesApi.getAll().then(setProperties).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id: number, status: string) => {
    await propertiesApi.patchStatus(id, status);
    setProperties(ps => ps.map(p => p.id === id ? { ...p, status: status as any } : p));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await propertiesApi.delete(deleteId);
      setProperties(ps => ps.filter(p => p.id !== deleteId));
      setDeleteId(null);
    } catch { alert('Failed to delete property.'); }
    finally { setDeleting(false); }
  };

  const filtered = properties.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    (p.community || '').toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (s: string) => {
    if (s === 'available') return <span className="badge-available">● Available</span>;
    if (s === 'occupied') return <span className="badge-occupied">● Occupied</span>;
    return <span className="badge-maintenance">● Maintenance</span>;
  };

  return (
    <div className="p-6 md:p-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">Properties</h1>
          <p className="text-slate-500 text-xs mt-1">{properties.length} properties in your portfolio</p>
        </div>
        <Link to="/employee/properties/new" className="btn-primary">
          + Add Property
        </Link>
      </div>

      {/* Search Input Card */}
      <div className="card p-4 mb-6">
        <input
          className="input"
          placeholder="Search by title, city, or community..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="card overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-5 animate-pulse">
              <div className="w-14 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="bg-slate-200 dark:bg-slate-800 h-4 rounded w-1/2" />
                <div className="bg-slate-200 dark:bg-slate-800 h-3 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-4xl mb-3">🏠</div>
          <h3 className="font-display font-bold text-slate-900 dark:text-white text-base mb-2">No properties found</h3>
          {search ? (
            <button onClick={() => setSearch('')} className="text-brand-600 dark:text-brand-400 text-xs font-bold hover:underline">
              Clear search filter
            </button>
          ) : (
            <Link to="/employee/properties/new" className="btn-primary text-xs inline-block mt-2">
              Add Your First Property
            </Link>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Property</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rent</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filtered.map((p) => {
                  const photo = p.photos?.[0] || PLACEHOLDER;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={photo}
                            alt=""
                            className="w-12 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700"
                            onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                          />
                          <div className="min-w-0">
                            <div className="font-display font-bold text-slate-900 dark:text-white text-sm truncate max-w-xs">
                              {p.title}
                            </div>
                            {p.community && (
                              <div className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 truncate">
                                {p.community}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300">
                        {p.city}, {p.state}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-display font-bold text-slate-900 dark:text-white text-sm">
                          ${p.rent.toLocaleString()}
                        </span>
                        <span className="text-slate-400 text-xs">/mo</span>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300">
                        {p.bedrooms}BR / {p.bathrooms}BA
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={p.status}
                          onChange={e => handleStatusChange(p.id, e.target.value)}
                          className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                        >
                          <option value="available" className="dark:bg-slate-900">● Available</option>
                          <option value="occupied" className="dark:bg-slate-900">● Occupied</option>
                          <option value="maintenance" className="dark:bg-slate-900">● Maintenance</option>
                        </select>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/employee/properties/${p.id}/edit`}
                            className="px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="px-3 py-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map(p => (
              <div key={p.id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={p.photos?.[0] || PLACEHOLDER}
                    alt=""
                    className="w-14 h-12 rounded-lg object-cover flex-shrink-0"
                    onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-slate-900 dark:text-white text-sm truncate">
                      {p.title}
                    </div>
                    <div className="text-xs text-slate-500">{p.city}, {p.state}</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                      ${p.rent.toLocaleString()}/mo
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {statusBadge(p.status)}
                  <div className="flex gap-2">
                    <Link to={`/employee/properties/${p.id}/edit`} className="px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg">Edit</Link>
                    <button onClick={() => setDeleteId(p.id)} className="px-3 py-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 rounded-lg">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-base text-center mb-2">Delete Property?</h3>
            <p className="text-slate-500 text-xs text-center mb-6">This action cannot be undone. The listing will be removed permanently.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 btn-secondary text-xs py-2">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-xs transition-colors">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
