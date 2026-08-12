import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import { propertiesApi } from '../api/client';
import type { Property } from '../types';

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'occupied' | 'maintenance'>('all');

  const search = searchParams.get('search') || '';
  const maxRent = searchParams.get('maxRent') || '';
  const beds = searchParams.get('beds') || '';

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (maxRent) params.maxRent = maxRent;
    if (beds) params.beds = beds;

    propertiesApi.getAll(params)
      .then(setProperties)
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [search, maxRent, beds]);

  const filtered = useMemo(() => {
    if (filter === 'all') return properties;
    return properties.filter(p => p.status === filter);
  }, [properties, filter]);

  const counts = useMemo(() => ({
    all: properties.length,
    available: properties.filter(p => p.status === 'available').length,
    occupied: properties.filter(p => p.status === 'occupied').length,
    maintenance: properties.filter(p => p.status === 'maintenance').length,
  }), [properties]);

  const clearFilters = () => setSearchParams({});

  const filterTabs = [
    { key: 'all' as const, label: 'All Properties', count: counts.all },
    { key: 'available' as const, label: 'Available', count: counts.available },
    { key: 'occupied' as const, label: 'Occupied', count: counts.occupied },
    { key: 'maintenance' as const, label: 'Maintenance', count: counts.maintenance },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="pt-24 lg:pt-28 pb-20">
        {/* Header */}
        <div className="bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 py-12">
          <div className="container-xl">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Rental Directory</span>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1 mb-3">
                Rental Properties
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                {search ? `Properties matching "${search}".` : 'Managed properties across Pennsylvania and Florida.'}
              </p>

              {(search || maxRent || beds) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  ✕ Clear Active Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Bar & Grid Container */}
        <div className="container-xl py-10">
          
          {/* Status Tabs */}
          {!loading && properties.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-8">
              {filterTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    filter === tab.key
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Skeleton Loaders */}
          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="card overflow-hidden">
                  <div className="shimmer aspect-[16/10]" />
                  <div className="p-5 space-y-3">
                    <div className="shimmer h-4 rounded w-3/4" />
                    <div className="shimmer h-3 rounded w-1/2" />
                    <div className="shimmer h-6 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-16 text-center max-w-lg mx-auto my-12">
              <div className="text-4xl mb-3">🏢</div>
              <h2 className="font-display font-bold text-slate-900 dark:text-white text-xl mb-2">No Properties Found</h2>
              <p className="text-slate-500 text-sm mb-6">Try adjusting your search criteria or clearing active filters.</p>
              <button onClick={clearFilters} className="btn-primary">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
