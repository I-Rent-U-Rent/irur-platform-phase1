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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Properties</h1>
          <p className="text-gray-500 text-sm mt-1">{properties.length} properties in your portfolio</p>
        </div>
        <Link to="/employee/properties/new" className="btn-primary text-sm py-2.5 px-5">+ Add Property</Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-card p-4 mb-6">
        <input className="input" placeholder="Search by title, city, or community..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-5 border-b border-gray-50 animate-pulse">
              <div className="w-14 h-14 bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="bg-gray-200 h-4 rounded w-1/2" />
                <div className="bg-gray-200 h-3 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-16 text-center">
          <div className="text-6xl mb-3">🏠</div>
          <h3 className="font-semibold text-gray-700 mb-2">No properties found</h3>
          {search ? <button onClick={() => setSearch('')} className="text-gold-600 text-sm hover:underline">Clear search</button> : (
            <Link to="/employee/properties/new" className="btn-primary text-sm mt-4 inline-block">Add Your First Property</Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Property</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rent</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Details</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const photo = p.photos?.[0] || PLACEHOLDER;
                  return (
                    <tr key={p.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-gold-50/30 transition-colors border-b border-gray-50 last:border-0`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={photo.startsWith('http') ? photo : photo} alt=""
                            className="w-14 h-12 rounded-xl object-cover flex-shrink-0"
                            onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }} />
                          <div>
                            <div className="font-medium text-navy-900 text-sm">{p.title}</div>
                            {p.community && <div className="text-xs text-gold-600">{p.community}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{p.city}, {p.state}</td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-navy-900 text-sm">${p.rent.toLocaleString()}</span>
                        <span className="text-gray-400 text-xs">/mo</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{p.bedrooms}BR / {p.bathrooms}BA</td>
                      <td className="px-5 py-4">
                        <select value={p.status}
                          onChange={e => handleStatusChange(p.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-gold-400">
                          <option value="available">● Available</option>
                          <option value="occupied">● Occupied</option>
                          <option value="maintenance">● Maintenance</option>
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link to={`/employee/properties/${p.id}/edit`}
                            className="px-3 py-1.5 text-xs font-medium text-navy-700 bg-navy-50 hover:bg-navy-100 rounded-lg transition-colors">
                            Edit
                          </Link>
                          <button onClick={() => setDeleteId(p.id)}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
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

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-50">
            {filtered.map(p => (
              <div key={p.id} className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <img src={p.photos?.[0] || PLACEHOLDER} alt="" className="w-16 h-14 rounded-xl object-cover flex-shrink-0"
                    onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-navy-900 text-sm truncate">{p.title}</div>
                    <div className="text-xs text-gray-400">{p.city}, {p.state}</div>
                    <div className="text-sm font-semibold text-navy-900 mt-0.5">${p.rent.toLocaleString()}/mo</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {statusBadge(p.status)}
                  <div className="flex gap-2">
                    <Link to={`/employee/properties/${p.id}/edit`} className="px-3 py-1.5 text-xs font-medium text-navy-700 bg-navy-50 rounded-lg">Edit</Link>
                    <button onClick={() => setDeleteId(p.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl">
            <div className="text-4xl mb-4 text-center">⚠️</div>
            <h3 className="font-bold text-navy-900 text-lg text-center mb-2">Delete Property?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">This action cannot be undone. The property will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 btn-secondary text-sm py-2.5">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
