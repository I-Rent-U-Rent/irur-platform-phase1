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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 lg:pt-28">
        {/* Hero header */}
        <div className="relative bg-navy-900 py-16 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-navy-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="container-xl relative z-10">
            <div className="inline-flex items-center gap-2 glass-dark text-white/80 text-sm font-medium px-4 py-2 rounded-full mb-4">
              <span className="w-2 h-2 bg-gold-400 rounded-full animate-pulse-ring" />
              {counts.available} homes available now
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 animate-slide-up">
              Rental Properties
            </h1>
            <p className="text-navy-300 text-lg max-w-2xl">
              {search ? `Rental properties matching "${search}".` : 'Properties managed by IRUR across Pennsylvania and Florida.'}
            </p>
            {(search || maxRent || beds) && (
              <button onClick={clearFilters} className="mt-4 text-sm text-gold-400 hover:text-gold-300 font-medium flex items-center gap-1.5 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="container-xl py-10">
          {/* Filter tabs */}
          {!loading && properties.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {filterTabs.map(tab => (
                <button key={tab.key} onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                    filter === tab.key
                      ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-gold'
                      : 'bg-white text-gray-600 hover:bg-gray-100 shadow-card'
                  }`}>
                  {tab.label}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${filter === tab.key ? 'bg-white/20' : 'bg-gray-100'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-2xl overflow-hidden">
                  <div className="shimmer aspect-[4/3]" />
                  <div className="p-5 space-y-3">
                    <div className="shimmer h-4 rounded w-3/4" />
                    <div className="shimmer h-3 rounded w-1/2" />
                    <div className="shimmer h-8 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">🏠</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No rental properties found</h2>
              <p className="text-gray-400 mb-6">Try a different location, price, or bedroom count.</p>
              <button onClick={clearFilters} className="btn-primary">Clear All Filters</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((property, i) => (
                <div key={property.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
