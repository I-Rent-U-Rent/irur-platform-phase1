import React from 'react';
import { MapPin, SlidersHorizontal, Home, DollarSign, Bed, ChevronDown, RotateCcw } from 'lucide-react';

export interface FilterState {
  location: string;
  status: string;
  propertyType: string;
  maxPrice: number;
  bedrooms: string;
}

interface PropertyFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  availableLocations?: string[];
  availableTypes?: string[];
  totalResults?: number;
  className?: string;
}

export default function PropertyFilters({
  filters,
  onChange,
  onReset,
  availableLocations = [],
  availableTypes = [],
  totalResults,
  className = '',
}: PropertyFiltersProps) {
  const isFiltered =
    filters.location !== '' ||
    filters.status !== 'all' ||
    filters.propertyType !== 'all' ||
    filters.maxPrice < 10000 ||
    filters.bedrooms !== 'any';

  const handleLocationChange = (val: string) => {
    onChange({ ...filters, location: val });
  };

  const handleStatusChange = (val: string) => {
    onChange({ ...filters, status: val });
  };

  const handleTypeChange = (val: string) => {
    onChange({ ...filters, propertyType: val });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, maxPrice: Number(e.target.value) });
  };

  const handleBedsChange = (beds: string) => {
    onChange({ ...filters, bedrooms: beds });
  };

  // Calculate slider background gradient percentage (min: 1000, max: 10000)
  const pricePercent = Math.min(100, Math.max(0, ((filters.maxPrice - 1000) / (10000 - 1000)) * 100));

  const bedroomOptions = [
    { value: 'any', label: 'Any', isPill: true },
    { value: '1', label: '1+', isPill: false },
    { value: '2', label: '2+', isPill: false },
    { value: '3', label: '3+', isPill: false },
    { value: '4', label: '4+', isPill: false },
  ];

  return (
    <aside
      className={`bg-slate-950 dark:bg-slate-950 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl ${className}`}
      aria-label="Rental Filters"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-800 mb-6">
        <div>
          <h2 className="font-serif text-2xl md:text-[26px] font-bold text-white tracking-tight">
            Filters
          </h2>
          {totalResults !== undefined && (
            <p className="text-xs text-slate-400 mt-0.5">
              {totalResults} {totalResults === 1 ? 'property' : 'properties'} found
            </p>
          )}
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-500 hover:text-gold-400 hover:underline transition-colors cursor-pointer"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* 1. LOCATION */}
        <div className="space-y-2">
          <label htmlFor="filter-location" className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-gold-500" />
            <span>LOCATION</span>
          </label>
          <div className="relative">
            <select
              id="filter-location"
              value={filters.location}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="w-full appearance-none bg-slate-900 border border-slate-700 focus:border-gold-500/70 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-gold-500/40 transition-colors pr-10 cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-200">
                City, State or Zip
              </option>
              {availableLocations.map((loc) => (
                <option key={loc} value={loc} className="bg-slate-900 text-slate-200">
                  {loc}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* 2. LISTING STATUS */}
        <div className="space-y-2">
          <label htmlFor="filter-status" className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gold-500" />
            <span>LISTING STATUS</span>
          </label>
          <div className="relative">
            <select
              id="filter-status"
              value={filters.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full appearance-none bg-slate-900 border border-slate-700 focus:border-gold-500/70 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-gold-500/40 transition-colors pr-10 cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">All Statuses</option>
              <option value="available" className="bg-slate-900 text-slate-200">Available</option>
              <option value="occupied" className="bg-slate-900 text-slate-200">Occupied</option>
              <option value="maintenance" className="bg-slate-900 text-slate-200">Maintenance</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* 3. PROPERTY TYPE */}
        <div className="space-y-2">
          <label htmlFor="filter-property-type" className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-slate-400">
            <Home className="w-3.5 h-3.5 text-gold-500" />
            <span>PROPERTY TYPE</span>
          </label>
          <div className="relative">
            <select
              id="filter-property-type"
              value={filters.propertyType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full appearance-none bg-slate-900 border border-slate-700 focus:border-gold-500/70 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-gold-500/40 transition-colors pr-10 cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">All Types</option>
              {availableTypes.length > 0 ? (
                availableTypes.map((type) => (
                  <option key={type} value={type} className="bg-slate-900 text-slate-200">
                    {type}
                  </option>
                ))
              ) : (
                <>
                  <option value="Townhome" className="bg-slate-900 text-slate-200">Townhome</option>
                  <option value="Single Family" className="bg-slate-900 text-slate-200">Single Family</option>
                  <option value="Condo" className="bg-slate-900 text-slate-200">Condo</option>
                  <option value="Apartment" className="bg-slate-900 text-slate-200">Apartment</option>
                  <option value="Multi-Family" className="bg-slate-900 text-slate-200">Multi-Family</option>
                </>
              )}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* 4. PRICE RANGE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-slate-400">
              <DollarSign className="w-3.5 h-3.5 text-gold-500" />
              <span>PRICE RANGE</span>
            </div>
            <span className="text-sm font-bold text-gold-500">
              {filters.maxPrice >= 10000 ? '$10,000+' : `$${filters.maxPrice.toLocaleString()}`}
            </span>
          </div>

          <div className="pt-1">
            <input
              type="range"
              min={1000}
              max={10000}
              step={250}
              value={filters.maxPrice}
              onChange={handlePriceChange}
              className="gold-slider w-full"
              style={{
                background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${pricePercent}%, #1e293b ${pricePercent}%, #1e293b 100%)`,
              }}
              aria-label="Price range filter"
            />
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mt-2">
              <span>$1,000</span>
              <span>$10,000+</span>
            </div>
          </div>
        </div>

        {/* 5. BEDROOMS */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-slate-400">
            <Bed className="w-3.5 h-3.5 text-gold-500" />
            <span>BEDROOMS</span>
          </div>
          
          <div className="flex flex-wrap gap-2.5">
            {bedroomOptions.map((opt) => {
              const active = filters.bedrooms === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleBedsChange(opt.value)}
                  className={`transition-all duration-150 flex items-center justify-center font-medium ${
                    opt.isPill
                      ? 'px-5 py-2.5 rounded-full text-xs font-bold'
                      : 'w-11 h-11 rounded-full text-xs font-semibold'
                  } ${
                    active
                      ? 'bg-gold-500 text-slate-950 font-bold shadow-premium scale-105'
                      : 'bg-slate-900 text-slate-200 border border-slate-700 hover:border-slate-500 hover:text-white'
                  }`}
                  aria-pressed={active}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
