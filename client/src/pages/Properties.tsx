import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Home as HomeIcon, RotateCcw, Filter, X, ArrowUpDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import PropertyFilters, { FilterState } from '../components/PropertyFilters';
import { propertiesApi } from '../api/client';
import type { Property } from '../types';

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'beds-desc'>('featured');
  const [searchOptions, setSearchOptions] = useState<{ cities: string[]; propertyTypes: string[] }>({
    cities: [],
    propertyTypes: [],
  });

  // Read URL search params
  const locationParam = searchParams.get('location') || searchParams.get('search') || searchParams.get('city') || '';
  const statusParam = searchParams.get('status') || 'available';
  const typeParam = searchParams.get('type') || 'all';
  const maxPriceParam = Number(searchParams.get('maxRent') || searchParams.get('maxPrice') || '10000');
  const bedroomsParam = searchParams.get('beds') || searchParams.get('bedrooms') || 'any';

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    location: locationParam,
    status: statusParam,
    propertyType: typeParam,
    maxPrice: isNaN(maxPriceParam) ? 10000 : maxPriceParam,
    bedrooms: bedroomsParam,
  });

  // Sync state when URL searchParams change
  useEffect(() => {
    setFilters({
      location: locationParam,
      status: statusParam,
      propertyType: typeParam,
      maxPrice: isNaN(maxPriceParam) ? 10000 : maxPriceParam,
      bedrooms: bedroomsParam,
    });
  }, [locationParam, statusParam, typeParam, maxPriceParam, bedroomsParam]);

  // Load search options
  useEffect(() => {
    propertiesApi.getSearchOptions()
      .then((data) => {
        if (data) {
          setSearchOptions({
            cities: Array.isArray(data.cities) ? data.cities : [],
            propertyTypes: Array.isArray(data.propertyTypes) ? data.propertyTypes : [],
          });
        }
      })
      .catch(() => {
        // Fallback default options
        setSearchOptions({
          cities: ['Bridgeport, PA', 'Phoenixville, PA', 'Spring City, PA', 'Pottstown, PA', 'St. Johns, FL'],
          propertyTypes: ['Townhome', 'Single Family', 'Condo', 'Apartment', 'Multi-Family'],
        });
      });
  }, []);

  // Fetch properties
  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (filters.location) params.search = filters.location;
    if (filters.status !== 'all') params.status = filters.status;
    if (filters.propertyType !== 'all') params.type = filters.propertyType;
    if (filters.maxPrice < 10000) params.maxRent = String(filters.maxPrice);
    if (filters.bedrooms !== 'any') params.beds = filters.bedrooms;

    propertiesApi.getAll(params)
      .then((data) => {
        setProperties(Array.isArray(data) ? data : []);
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [filters]);

  // Handle filter changes and update URL search params
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    const newParams = new URLSearchParams();
    if (newFilters.location) newParams.set('location', newFilters.location);
    if (newFilters.status !== 'all') newParams.set('status', newFilters.status);
    if (newFilters.propertyType !== 'all') newParams.set('type', newFilters.propertyType);
    if (newFilters.maxPrice < 10000) newParams.set('maxPrice', String(newFilters.maxPrice));
    if (newFilters.bedrooms !== 'any') newParams.set('beds', newFilters.bedrooms);
    setSearchParams(newParams, { replace: true });
  };

  const handleResetFilters = () => {
    const defaultFilters: FilterState = {
      location: '',
      status: 'available',
      propertyType: 'all',
      maxPrice: 10000,
      bedrooms: 'any',
    };
    setFilters(defaultFilters);
    setSearchParams({}, { replace: true });
  };

  // Filter and sort properties
  const displayedProperties = useMemo(() => {
    let list = [...properties];

    // Client-side additional safeguarding
    if (filters.status !== 'all') {
      list = list.filter((p) => p.status === filters.status);
    }
    if (filters.propertyType !== 'all') {
      list = list.filter((p) => p.property_type?.toLowerCase() === filters.propertyType.toLowerCase());
    }
    if (filters.maxPrice < 10000) {
      list = list.filter((p) => (p.rent || 0) <= filters.maxPrice);
    }
    if (filters.bedrooms !== 'any') {
      const minBeds = parseInt(filters.bedrooms, 10);
      if (!isNaN(minBeds)) {
        list = list.filter((p) => (p.bedrooms || 0) >= minBeds);
      }
    }
    if (filters.location) {
      const loc = filters.location.toLowerCase();
      list = list.filter((p) =>
        p.city?.toLowerCase().includes(loc) ||
        p.state?.toLowerCase().includes(loc) ||
        p.zip?.toLowerCase().includes(loc) ||
        p.address?.toLowerCase().includes(loc) ||
        p.community?.toLowerCase().includes(loc)
      );
    }

    // Status priority: available first, then occupied, then maintenance
    const statusOrder: Record<string, number> = { available: 0, occupied: 1, maintenance: 2 };

    // Always sort by status first, then by selected criteria within each group
    list.sort((a, b) => {
      const statusDiff = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
      if (statusDiff !== 0) return statusDiff;

      if (sortBy === 'price-asc') return (a.rent || 0) - (b.rent || 0);
      if (sortBy === 'price-desc') return (b.rent || 0) - (a.rent || 0);
      if (sortBy === 'beds-desc') return (b.bedrooms || 0) - (a.bedrooms || 0);
      return 0;
    });

    return list;
  }, [properties, filters, sortBy]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.location) count++;
    if (filters.status !== 'all') count++;
    if (filters.propertyType !== 'all') count++;
    if (filters.maxPrice < 10000) count++;
    if (filters.bedrooms !== 'any') count++;
    return count;
  }, [filters]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="pt-28 lg:pt-32 pb-20">
        {/* Header Banner */}
        <div className="bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 py-10 lg:py-12">
          <div className="container-xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="max-w-3xl">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                  Rental Directory
                </span>
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1 mb-2">
                  Rental Properties
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                  Discover verified, high-quality rental properties across Pennsylvania and Florida with flexible lease options.
                </p>
              </div>

              {/* Mobile Filter Trigger */}
              <div className="lg:hidden flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0C131D] text-white border border-[#1E293B] text-sm font-semibold shadow-md active:scale-95 transition-all"
                >
                  <Filter className="w-4 h-4 text-[#D4A359]" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="bg-[#D4A359] text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="container-xl py-8 lg:py-10">
          {/* Mobile Filter Drawer / Accordion */}
          {mobileFilterOpen && (
            <div className="lg:hidden mb-8">
              <PropertyFilters
                filters={filters}
                onChange={handleFiltersChange}
                onReset={handleResetFilters}
                availableLocations={searchOptions.cities}
                availableTypes={searchOptions.propertyTypes}
                totalResults={displayedProperties.length}
              />
            </div>
          )}

          {/* 2-Column Layout */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block w-[270px] xl:w-[290px] flex-shrink-0 sticky top-28">
              <PropertyFilters
                filters={filters}
                onChange={handleFiltersChange}
                onReset={handleResetFilters}
                availableLocations={searchOptions.cities}
                availableTypes={searchOptions.propertyTypes}
                totalResults={displayedProperties.length}
              />
            </div>

            {/* Main Listings Column */}
            <div className="flex-1 min-w-0 w-full">
              {/* Filter Chips Bar & Sort Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {displayedProperties.length} {displayedProperties.length === 1 ? 'Rental Available' : 'Rentals Available'}
                  </span>

                  {/* Active Filter Chips */}
                  {filters.location && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gold-50 dark:bg-gold-950/40 text-gold-700 dark:text-gold-300 border border-gold-200 dark:border-gold-800/40">
                      <span>{filters.location}</span>
                      <button
                        type="button"
                        onClick={() => handleFiltersChange({ ...filters, location: '' })}
                        className="hover:text-gold-900 dark:hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.status !== 'all' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <span className="capitalize">{filters.status}</span>
                      <button
                        type="button"
                        onClick={() => handleFiltersChange({ ...filters, status: 'all' })}
                        className="hover:text-slate-900 dark:hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.propertyType !== 'all' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <span>{filters.propertyType}</span>
                      <button
                        type="button"
                        onClick={() => handleFiltersChange({ ...filters, propertyType: 'all' })}
                        className="hover:text-slate-900 dark:hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.maxPrice < 10000 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <span>Up to ${filters.maxPrice.toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => handleFiltersChange({ ...filters, maxPrice: 10000 })}
                        className="hover:text-slate-900 dark:hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.bedrooms !== 'any' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <span>{filters.bedrooms}+ Beds</span>
                      <button
                        type="button"
                        onClick={() => handleFiltersChange({ ...filters, bedrooms: 'any' })}
                        className="hover:text-slate-900 dark:hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-xs font-semibold text-gold-600 dark:text-gold-400 hover:underline ml-2"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-gold-500/50 cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="beds-desc">Bedrooms: Most</option>
                  </select>
                </div>
              </div>

              {/* Grid / Loaders / Empty State */}
              {loading ? (
                <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="card-premium overflow-hidden animate-pulse">
                      <div className="shimmer aspect-[16/10] rounded-t-3xl" />
                      <div className="p-5 space-y-3">
                        <div className="shimmer h-4 rounded w-3/4" />
                        <div className="shimmer h-3 rounded w-1/2" />
                        <div className="shimmer h-6 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayedProperties.length === 0 ? (
                <div className="card-premium p-14 text-center max-w-lg mx-auto my-8">
                  <HomeIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h2 className="font-display font-bold text-slate-900 dark:text-white text-xl mb-2">
                    No Rentals Match Your Filters
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                    Try expanding your price range, clearing specific criteria, or exploring all available locations.
                  </p>
                  <button onClick={handleResetFilters} className="btn-luxury">
                    <RotateCcw className="w-4 h-4" />
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-6">
                  {displayedProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
