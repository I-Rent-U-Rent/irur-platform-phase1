import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import { propertiesApi } from '../api/client';
import type { Property } from '../types';

const CITIES = ['', 'Bridgeport', 'Spring City', 'Phoenixville', 'Pottstown', 'Coatesville', 'Downingtown'];
const TYPES = ['', 'Townhome', 'Single Family', 'Condo', 'Apartment'];

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
    maxRent: searchParams.get('maxRent') || '',
    minRent: searchParams.get('minRent') || '',
    beds: searchParams.get('beds') || '',
    baths: searchParams.get('baths') || '',
    type: searchParams.get('type') || '',
    petFriendly: searchParams.get('petFriendly') === 'true',
    furnished: searchParams.get('furnished') === 'true',
    community: searchParams.get('community') || '',
  });

  const fetchProps = useCallback(() => {
    setLoading(true);
    const params: Record<string, any> = {};
    if (filters.city) params.city = filters.city;
    if (filters.state) params.state = filters.state;
    if (filters.maxRent) params.maxRent = filters.maxRent;
    if (filters.minRent) params.minRent = filters.minRent;
    if (filters.beds) params.beds = filters.beds;
    if (filters.baths) params.baths = filters.baths;
    if (filters.type) params.type = filters.type;
    if (filters.petFriendly) params.petFriendly = 'true';
    if (filters.furnished) params.furnished = 'true';
    if (filters.community) params.community = filters.community;

    propertiesApi.getAll(params)
      .then(setProperties)
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchProps(); }, [fetchProps]);

  const handleFilter = (key: string, value: any) => setFilters(f => ({ ...f, [key]: value }));

  const clearFilters = () => {
    setFilters({ city: '', state: '', maxRent: '', minRent: '', beds: '', baths: '', type: '', petFriendly: false, furnished: false, community: '' });
    setSearchParams({});
  };

  const hasFilters = filters.city || filters.state || filters.maxRent || filters.minRent || filters.beds || filters.baths || filters.type || filters.petFriendly || filters.furnished || filters.community;

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <label className="label">City</label>
        <select className="input" value={filters.city} onChange={e => handleFilter('city', e.target.value)}>
          <option value="">All Cities</option>
          {CITIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="label">State</label>
        <select className="input" value={filters.state} onChange={e => handleFilter('state', e.target.value)}>
          <option value="">All States</option>
          <option value="PA">Pennsylvania (PA)</option>
        </select>
      </div>
      <div>
        <label className="label">Min Rent / Month</label>
        <input type="number" className="input" placeholder="$1,500" value={filters.minRent} onChange={e => handleFilter('minRent', e.target.value)} />
      </div>
      <div>
        <label className="label">Max Rent / Month</label>
        <input type="number" className="input" placeholder="$5,000" value={filters.maxRent} onChange={e => handleFilter('maxRent', e.target.value)} />
      </div>
      <div>
        <label className="label">Bedrooms</label>
        <select className="input" value={filters.beds} onChange={e => handleFilter('beds', e.target.value)}>
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </div>
      <div>
        <label className="label">Bathrooms</label>
        <select className="input" value={filters.baths} onChange={e => handleFilter('baths', e.target.value)}>
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
        </select>
      </div>
      <div>
        <label className="label">Property Type</label>
        <select className="input" value={filters.type} onChange={e => handleFilter('type', e.target.value)}>
          <option value="">All Types</option>
          {TYPES.filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={filters.petFriendly} onChange={e => handleFilter('petFriendly', e.target.checked)}
            className="w-4 h-4 accent-gold-500" />
          <span className="text-sm font-medium text-gray-700">🐾 Pet Friendly</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={filters.furnished} onChange={e => handleFilter('furnished', e.target.checked)}
            className="w-4 h-4 accent-gold-500" />
          <span className="text-sm font-medium text-gray-700">🛋 Furnished</span>
        </label>
      </div>
      {hasFilters && (
        <button onClick={clearFilters} className="w-full py-2.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 lg:pt-28">
        {/* Page header */}
        <div className="bg-navy-900 py-12">
          <div className="container-xl">
            <h1 className="text-3xl font-bold text-white mb-2">Browse Properties</h1>
            <p className="text-navy-300">Properties managed by IRUR across Pennsylvania.</p>
          </div>
        </div>

        <div className="container-xl py-10">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="card p-6 sticky top-28">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-navy-900">Filters</h2>
                  {hasFilters && <button onClick={clearFilters} className="text-xs text-gold-600 hover:underline">Clear all</button>}
                </div>
                <FilterPanel />
              </div>
            </aside>

            {/* Main */}
            <div className="flex-1 min-w-0">
              {/* Mobile filter toggle */}
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <p className="text-gray-500 text-sm">{loading ? 'Loading...' : `${properties.length} properties found`}</p>
                <button onClick={() => setFilterOpen(o => !o)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                  </svg>
                  Filters {hasFilters && <span className="bg-gold-500 text-white text-xs px-1.5 py-0.5 rounded-full">!</span>}
                </button>
              </div>

              {/* Mobile filter panel */}
              {filterOpen && (
                <div className="lg:hidden card p-6 mb-6">
                  <FilterPanel />
                </div>
              )}

              <p className="hidden lg:block text-gray-500 text-sm mb-6">
                {loading ? 'Loading properties...' : `${properties.length} propert${properties.length !== 1 ? 'ies' : 'y'} found`}
              </p>

              {loading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                      <div className="bg-gray-200 aspect-[4/3]" />
                      <div className="p-5 space-y-3">
                        <div className="bg-gray-200 h-4 rounded w-3/4" />
                        <div className="bg-gray-200 h-3 rounded w-1/2" />
                        <div className="bg-gray-200 h-8 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🏠</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties match your filters</h3>
                  <p className="text-gray-400 mb-6">Try adjusting your search criteria or clear filters.</p>
                  <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map(p => <PropertyCard key={p.id} property={p} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
