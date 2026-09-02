import React from 'react';
import { MapPin, SlidersHorizontal, Home, DollarSign, Bed, ChevronDown, RotateCcw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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

const SELECT_CLASS =
  'w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-gold-500/70 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-gold-500/40 transition-colors pr-10 cursor-pointer';
const OPTION_CLASS = 'bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-200';
const LABEL_CLASS =
  'flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400';

export default function PropertyFilters({
  filters,
  onChange,
  onReset,
  availableLocations = [],
  availableTypes = [],
  totalResults,
  className = '',
}: PropertyFiltersProps) {
  const { theme } = useTheme();

  const isFiltered =
    filters.location !== '' ||
    filters.status !== 'all' ||
    filters.propertyType !== 'all' ||
    filters.maxPrice < 10000 ||
    filters.bedrooms !== 'any';

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, maxPrice: Number(e.target.value) });
  };

  // Slider fill percentage (min: 1000, max: 10000)
  const pricePercent = Math.min(100, Math.max(0, ((filters.maxPrice - 1000) / (10000 - 1000)) * 100));
  const trackColor = theme === 'dark' ? '#1e293b' : '#e2e8f0';

  const bedroomOptions = [
    { value: 'any', label: 'Any', isPill: true },
    { value: '1', label: '1+', isPill: false },
    { value: '2', label: '2+', isPill: false },
    { value: '3', label: '3+', isPill: false },
    { value: '4', label: '4+', isPill: false },
  ];

  return (
    <aside
      className={`bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-slate-900 dark:text-slate-100 shadow-premium transition-colors ${className}`}
      aria-label="Rental Filters"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800 mb-6">
        <div>
          <h2 className="font-display text-2xl md:text-[26px] font-bold text-slate-900 dark:text-white tracking-tight">
            Filters
          </h2>
          {totalResults !== undefined && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {totalResults} {totalResults === 1 ? 'property' : 'properties'} found
            </p>
          )}
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-600 dark:text-gold-500 hover:text-gold-700 dark:hover:text-gold-400 hover:underline transition-colors cursor-pointer"
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
          <label htmlFor="filter-location" className={LABEL_CLASS}>
            <MapPin className="w-3.5 h-3.5 text-gold-500" />
            <span>LOCATION</span>
          </label>
          <div className="relative">
            <select
              id="filter-location"
              value={filters.location}
              onChange={(e) => onChange({ ...filters, location: e.target.value })}
              className={SELECT_CLASS}
            >
              <option value="" className={OPTION_CLASS}>City, State or Zip</option>
              {availableLocations.map((loc) => (
                <option key={loc} value={loc} className={OPTION_CLASS}>{loc}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* 2. LISTING STATUS */}
        <div className="space-y-2">
          <label htmlFor="filter-status" className={LABEL_CLASS}>
            <SlidersHorizontal className="w-3.5 h-3.5 text-gold-500" />
            <span>LISTING STATUS</span>
          </label>
          <div className="relative">
            <select
              id="filter-status"
              value={filters.status}
              onChange={(e) => onChange({ ...filters, status: e.target.value })}
              className={SELECT_CLASS}
            >
              <option value="all" className={OPTION_CLASS}>All Statuses</option>
              <option value="available" className={OPTION_CLASS}>Available</option>
              <option value="occupied" className={OPTION_CLASS}>Occupied</option>
              <option value="maintenance" className={OPTION_CLASS}>Maintenance</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* 3. PROPERTY TYPE */}
        <div className="space-y-2">
          <label htmlFor="filter-property-type" className={LABEL_CLASS}>
            <Home className="w-3.5 h-3.5 text-gold-500" />
            <span>PROPERTY TYPE</span>
          </label>
          <div className="relative">
            <select
              id="filter-property-type"
              value={filters.propertyType}
              onChange={(e) => onChange({ ...filters, propertyType: e.target.value })}
              className={SELECT_CLASS}
            >
              <option value="all" className={OPTION_CLASS}>All Types</option>
              {availableTypes.length > 0 ? (
                availableTypes.map((type) => (
                  <option key={type} value={type} className={OPTION_CLASS}>{type}</option>
                ))
              ) : (
                <>
                  <option value="Townhome" className={OPTION_CLASS}>Townhome</option>
                  <option value="Single Family" className={OPTION_CLASS}>Single Family</option>
                  <option value="Condo" className={OPTION_CLASS}>Condo</option>
                  <option value="Apartment" className={OPTION_CLASS}>Apartment</option>
                  <option value="Multi-Family" className={OPTION_CLASS}>Multi-Family</option>
                </>
              )}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* 4. PRICE RANGE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className={LABEL_CLASS}>
              <DollarSign className="w-3.5 h-3.5 text-gold-500" />
              <span>PRICE RANGE</span>
            </div>
            <span className="text-sm font-bold text-gold-600 dark:text-gold-500">
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
                background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${pricePercent}%, ${trackColor} ${pricePercent}%, ${trackColor} 100%)`,
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
          <div className={LABEL_CLASS}>
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
                  onClick={() => onChange({ ...filters, bedrooms: opt.value })}
                  className={`transition-all duration-150 flex items-center justify-center font-medium ${
                    opt.isPill
                      ? 'px-5 py-2.5 rounded-full text-xs font-bold'
                      : 'w-11 h-11 rounded-full text-xs font-semibold'
                  } ${
                    active
                      ? 'bg-gold-500 text-slate-950 font-bold shadow-premium scale-105'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-white'
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
