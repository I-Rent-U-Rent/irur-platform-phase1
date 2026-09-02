import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { Home as HomeIcon, RotateCcw, Filter, X, ArrowUpDown, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import PropertyFilters, { FilterState } from '../components/PropertyFilters';
import { propertiesApi } from '../api/client';
import { useFavorites } from '../hooks/useFavorites';
import type { Property } from '../types';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'beds-desc';

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('featured');
  const [searchOptions, setSearchOptions] = useState<{ cities: string[]; propertyTypes: string[] }>({
    cities: [],
    propertyTypes: [],
  });
  const { ids: savedIds, count: savedCount } = useFavorites();

  // Read URL search params
  const savedOnly = searchParams.get('saved') === '1';
  const locationParam = searchParams.get('location') || searchParams.get('search') || searchParams.get('city') || '';
  const statusParam = searchParams.get('status') || (savedOnly ? 'all' : 'available');
  const typeParam = searchParams.get('type') || 'all';
  const maxPriceParam = Number(searchParams.get('maxRent') || searchParams.get('maxPrice') || '10000');
  const bedroomsParam = searchParams.get('beds') || searchParams.get('bedrooms') || 'any';

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
      .then((data) => setProperties(Array.isArray(data) ? data : []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [filters]);

  // Lock scroll + Escape while the mobile filter drawer is open
  useEffect(() => {
    if (!mobileFilterOpen) return;
    document.body.classList.add('no-scroll');
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileFilterOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('no-scroll');
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileFilterOpen]);

  const writeParams = (newFilters: FilterState, keepSaved = savedOnly) => {
    const newParams = new URLSearchParams();
    if (newFilters.location) newParams.set('location', newFilters.location);
    if (newFilters.status !== 'all') newParams.set('status', newFilters.status);
    if (newFilters.propertyType !== 'all') newParams.set('type', newFilters.propertyType);
    if (newFilters.maxPrice < 10000) newParams.set('maxPrice', String(newFilters.maxPrice));
    if (newFilters.bedrooms !== 'any') newParams.set('beds', newFilters.bedrooms);
    if (keepSaved) newParams.set('saved', '1');
    setSearchParams(newParams, { replace: true });
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    writeParams(newFilters);
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

  const toggleSavedOnly = () => {
    if (savedOnly) {
      writeParams(filters, false);
    } else {
      // Saved homes may be occupied; widen status so every saved home shows.
      writeParams({ ...filters, status: 'all' }, true);
    }
  };

  // Filter and sort properties
  const displayedProperties = useMemo(() => {
    let list = [...properties];

    if (savedOnly) list = list.filter((p) => savedIds.includes(p.id));
    if (filters.status !== 'all') list = list.filter((p) => p.status === filters.status);
    if (filters.propertyType !== 'all') {
      list = list.filter((p) => p.property_type?.toLowerCase() === filters.propertyType.toLowerCase());
    }
    if (filters.maxPrice < 10000) list = list.filter((p) => (p.rent || 0) <= filters.maxPrice);
    if (filters.bedrooms !== 'any') {
      const minBeds = parseInt(filters.bedrooms, 10);
      if (!isNaN(minBeds)) list = list.filter((p) => (p.bedrooms || 0) >= minBeds);
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

    const statusOrder: Record<string, number> = { available: 0, occupied: 1, maintenance: 2 };
    list.sort((a, b) => {
      const statusDiff = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
      if (statusDiff !== 0) return statusDiff;
      if (sortBy === 'price-asc') return (a.rent || 0) - (b.rent || 0);
      if (sortBy === 'price-desc') return (b.rent || 0) - (a.rent || 0);
      if (sortBy === 'beds-desc') return (b.bedrooms || 0) - (a.bedrooms || 0);
      return 0;
    });

    return list;
  }, [properties, filters, sortBy, savedOnly, savedIds]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.location) count++;
    if (filters.status !== 'all') count++;
    if (filters.propertyType !== 'all') count++;
    if (filters.maxPrice < 10000) count++;
    if (filters.bedrooms !== 'any') count++;
    if (savedOnly) count++;
    return count;
  }, [filters, savedOnly]);

  // Re-run the card entrance animation whenever the result set changes.
  const gridKey = `${savedOnly}|${sortBy}|${JSON.stringify(filters)}|${displayedProperties.length}`;

  const resultSuffix = savedOnly
    ? ' Saved'
    : filters.status === 'available'
      ? ' Available'
      : filters.status === 'occupied'
        ? ' Occupied'
        : filters.status === 'maintenance'
          ? ' Under Maintenance'
          : '';

  const pageTitle = savedOnly
    ? 'Saved Homes'
    : filters.location
      ? `Rentals in ${filters.location}`
      : 'Rental Properties';

  const filtersPanel = (
    <PropertyFilters
      filters={filters}
      onChange={handleFiltersChange}
      onReset={handleResetFilters}
      availableLocations={searchOptions.cities}
      availableTypes={searchOptions.propertyTypes}
      totalResults={displayedProperties.length}
    />
  );

  const chip = (label: string, onRemove: () => void, tone: 'gold' | 'slate' | 'rose' = 'slate') => {
    const tones = {
      gold: 'bg-gold-50 dark:bg-gold-950/40 text-gold-700 dark:text-gold-300 border-gold-200 dark:border-gold-800/40',
      slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      rose: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40',
    };
    return (
      <span className={`zoom-in inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${tones[tone]}`}>
        <span className="capitalize">{label}</span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label} filter`}
          className="rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="pt-28 lg:pt-32 pb-20">
        {/* Header */}
        <div className="bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 py-10 lg:py-12">
          <div className="container-xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="max-w-3xl">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                  {savedOnly ? 'Your Shortlist' : 'Rental Directory'}
                </span>
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1 mb-2">
                  {pageTitle}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                  {savedOnly
                    ? 'Homes you have saved on this device. Tap the heart on any listing to add or remove it.'
                    : 'Discover verified, high-quality rental properties across Pennsylvania and Florida with flexible lease options.'}
                </p>
              </div>

              <div className="lg:hidden flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0C131D] text-white border border-[#1E293B] text-sm font-semibold shadow-md active:scale-95 transition-all"
                  aria-haspopup="dialog"
                  aria-expanded={mobileFilterOpen}
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

        <div className="container-xl py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Desktop filters */}
            <div className="hidden lg:block w-[270px] xl:w-[290px] flex-shrink-0 sticky top-28">
              {filtersPanel}
            </div>

            {/* Listings */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums" aria-live="polite">
                    {loading ? 'Searching…' : `${displayedProperties.length} ${displayedProperties.length === 1 ? 'Rental' : 'Rentals'}${resultSuffix}`}
                  </span>

                  <button
                    type="button"
                    onClick={toggleSavedOnly}
                    aria-pressed={savedOnly}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 active:scale-95 ${
                      savedOnly
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                        : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-400 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${savedOnly || savedCount > 0 ? 'fill-current' : ''}`} />
                    Saved{savedCount > 0 ? ` (${savedCount})` : ''}
                  </button>

                  {filters.location && chip(filters.location, () => handleFiltersChange({ ...filters, location: '' }), 'gold')}
                  {filters.status !== 'all' && chip(filters.status, () => handleFiltersChange({ ...filters, status: 'all' }))}
                  {filters.propertyType !== 'all' && chip(filters.propertyType, () => handleFiltersChange({ ...filters, propertyType: 'all' }))}
                  {filters.maxPrice < 10000 && chip(`Up to $${filters.maxPrice.toLocaleString()}`, () => handleFiltersChange({ ...filters, maxPrice: 10000 }))}
                  {filters.bedrooms !== 'any' && chip(`${filters.bedrooms}+ Beds`, () => handleFiltersChange({ ...filters, bedrooms: 'any' }))}

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

                <label className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortKey)}
                    className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-gold-500/50 cursor-pointer hover:border-gold-500/50 transition-colors"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="beds-desc">Bedrooms: Most</option>
                  </select>
                </label>
              </div>

              {loading ? (
                <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-6" aria-busy="true">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="card-premium overflow-hidden">
                      <div className="skeleton aspect-[16/10]" />
                      <div className="p-6 space-y-3">
                        <div className="skeleton h-3 rounded w-1/3" />
                        <div className="skeleton h-5 rounded w-3/4" />
                        <div className="skeleton h-3 rounded w-1/2" />
                        <div className="skeleton h-8 rounded mt-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayedProperties.length === 0 ? (
                <div className="card-premium p-14 text-center max-w-lg mx-auto my-8 zoom-in">
                  {savedOnly ? (
                    <>
                      <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8" />
                      </div>
                      <h2 className="font-display font-bold text-slate-900 dark:text-white text-xl mb-2">No Saved Homes Yet</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                        Tap the heart on any listing to build your shortlist. It stays on this device so you can come back anytime.
                      </p>
                      <button onClick={toggleSavedOnly} className="btn-luxury">
                        <HomeIcon className="w-4 h-4" />
                        Browse All Rentals
                      </button>
                    </>
                  ) : (
                    <>
                      <HomeIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <h2 className="font-display font-bold text-slate-900 dark:text-white text-xl mb-2">No Rentals Match Your Filters</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                        Try expanding your price range, clearing specific criteria, or exploring all available locations.
                      </p>
                      <button onClick={handleResetFilters} className="btn-luxury">
                        <RotateCcw className="w-4 h-4" />
                        Reset All Filters
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div key={gridKey} className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-6">
                  {displayedProperties.map((property, i) => (
                    <PropertyCard key={property.id} property={property} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile filter drawer */}
      {mobileFilterOpen && createPortal(
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm backdrop-in"
            onClick={() => setMobileFilterOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter rentals"
            className="drawer-panel absolute inset-y-0 right-0 w-[min(92vw,400px)] bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col"
          >
            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              aria-label="Close filters"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex-1 overflow-y-auto">
              <PropertyFilters
                filters={filters}
                onChange={handleFiltersChange}
                onReset={handleResetFilters}
                availableLocations={searchOptions.cities}
                availableTypes={searchOptions.propertyTypes}
                totalResults={displayedProperties.length}
                className="!rounded-none !border-0 !shadow-none min-h-full"
              />
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-950 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="btn-luxury w-full py-3.5"
              >
                Show {displayedProperties.length} {displayedProperties.length === 1 ? 'Rental' : 'Rentals'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <Footer />
    </div>
  );
}
