import { Link } from 'react-router-dom';
import type { Property } from '../types';

interface Props { property: Property; }

const PLACEHOLDER = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80';

export default function PropertyCard({ property: p }: Props) {
  const photo = p.photos?.[0] || PLACEHOLDER;
  const imgSrc = photo.startsWith('http') ? photo : photo;

  return (
    <Link to={`/properties/${p.id}`} className="card group overflow-hidden flex flex-col block hover:-translate-y-1.5">
      {/* Photo */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img src={imgSrc} alt={p.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }} />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {p.status === 'available' && <span className="badge-available shadow-sm backdrop-blur-sm bg-emerald-100/90">● Available</span>}
          {p.status === 'occupied' && <span className="badge-occupied shadow-sm backdrop-blur-sm bg-gray-100/90">● Occupied</span>}
          {p.status === 'maintenance' && <span className="badge-maintenance shadow-sm backdrop-blur-sm bg-amber-100/90">● Maintenance</span>}
        </div>

        {/* Pet friendly badge */}
        {p.pet_friendly === 1 && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded-full text-gray-700 shadow-sm transition-transform group-hover:scale-110">
            🐾 Pets OK
          </div>
        )}

        {/* Quick view overlay */}
        <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-75">
          <svg className="w-5 h-5 text-navy-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        {p.community && <p className="text-xs font-medium text-gold-600 uppercase tracking-wide mb-1">{p.community}</p>}
        <h3 className="font-semibold text-navy-900 text-base leading-snug mb-1 line-clamp-2 group-hover:text-gold-600 transition-colors duration-300">
          {p.title}
        </h3>
        <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {p.city}, {p.state} {p.zip}
        </p>

        {/* Specs */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1.5 transition-colors group-hover:text-navy-700">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h2m4 0h6m4 0h2M3 6h18M3 18h18" />
            </svg>
            {p.bedrooms} Beds
          </span>
          <span className="flex items-center gap-1.5 transition-colors group-hover:text-navy-700">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v10a2 2 0 002 2h12a2 2 0 002-2V4M4 16v4h16v-4" />
            </svg>
            {p.bathrooms} Bath
          </span>
          {p.sqft && <span className="flex items-center gap-1.5 transition-colors group-hover:text-navy-700">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4z" />
            </svg>
            {p.sqft.toLocaleString()} sqft
          </span>}
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            {p.rent > 0 ? (
              <>
                <span className="text-2xl font-bold text-navy-900 group-hover:text-gold-600 transition-colors">${p.rent.toLocaleString()}</span>
                <span className="text-gray-400 text-sm">/mo</span>
              </>
            ) : p.sold_price ? (
              <span className="text-lg font-bold text-navy-900">Sold · ${Number(p.sold_price).toLocaleString()}</span>
            ) : (
              <span className="text-lg font-semibold text-gray-500">{p.listing_status || 'Price TBD'}</span>
            )}
          </div>
          <span className="text-sm font-medium text-gold-600 flex items-center gap-1 group-hover:gap-2.5 transition-all">
            View Details <span>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
