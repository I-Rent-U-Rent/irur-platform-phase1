import { Link } from 'react-router-dom';
import { CheckCircle, Calendar, Wrench, PawPrint, ArrowRight } from 'lucide-react';
import type { Property } from '../types';

interface Props {
  property: Property;
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80';

export default function PropertyCard({ property: p }: Props) {
  const photo = p.photos?.[0] || PLACEHOLDER;

  return (
    <Link
      to={`/properties/${p.id}`}
      className="card-premium group overflow-hidden flex flex-col h-full hover:border-gold-500/40 dark:hover:border-gold-500/40 hover:shadow-premium-lg transition-all duration-300 hover-lift"
    >
      {/* Photo Container */}
      <div className="relative overflow-hidden min-h-[240px] max-h-[320px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <img
          src={photo}
          alt={p.title}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
        />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {p.status === 'available' && (
            <span className="badge-available">
              <CheckCircle className="w-3 h-3" /> Available
            </span>
          )}
          {p.status === 'occupied' && (
            <span className="badge-occupied">
              <Calendar className="w-3 h-3" /> Occupied
            </span>
          )}
          {p.status === 'maintenance' && (
            <span className="badge-maintenance">
              <Wrench className="w-3 h-3" /> Maintenance
            </span>
          )}
        </div>

        {p.pet_friendly === 1 && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[11px] font-semibold px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-1">
            <PawPrint className="w-3 h-3" /> Pets Allowed
          </div>
        )}

        {/* Premium overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info Body */}
      <div className="p-5 flex flex-col flex-1">
        {p.community && (
          <p className="text-[11px] font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider mb-1 truncate">
            {p.community}
          </p>
        )}

        <h3 className="font-display font-bold text-slate-900 dark:text-white text-base leading-snug mb-1.5 line-clamp-1 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
          {p.title}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{p.city}, {p.state} {p.zip}</span>
        </p>

        {/* Specs Row */}
        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mb-5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="font-medium">{p.bedrooms} Beds</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="font-medium">{p.bathrooms} Baths</span>
          {p.sqft && (
            <>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="font-medium">{p.sqft.toLocaleString()} sqft</span>
            </>
          )}
        </div>

        {/* Price & CTA */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            {p.rent > 0 ? (
              <div className="flex items-baseline gap-1">
                <span className="font-display text-xl font-black text-slate-900 dark:text-white">
                  ${p.rent.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-normal">/mo</span>
              </div>
            ) : p.sold_price ? (
              <span className="font-display text-sm font-bold text-slate-700 dark:text-slate-300">
                Sold · ${Number(p.sold_price).toLocaleString()}
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-500">Contact for price</span>
            )}
          </div>

          <span className="text-xs font-bold text-gold-600 dark:text-gold-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            View Listing <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
