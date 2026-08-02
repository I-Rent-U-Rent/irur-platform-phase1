import { Link } from 'react-router-dom';
import type { Property } from '../types';

interface Props { property: Property; }

const PLACEHOLDER = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80';

export default function PropertyCard({ property: p }: Props) {
  const photo = p.photos?.[0] || PLACEHOLDER;
  const imgSrc = photo.startsWith('http') ? photo : photo;

  return (
    <Link to={`/properties/${p.id}`} className="card group overflow-hidden flex flex-col block">
      {/* Photo */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img src={imgSrc} alt={p.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }} />
        <div className="absolute top-3 left-3">
          {p.status === 'available' && <span className="badge-available shadow-sm">● Available</span>}
          {p.status === 'occupied' && <span className="badge-occupied shadow-sm">● Occupied</span>}
          {p.status === 'maintenance' && <span className="badge-maintenance shadow-sm">● Maintenance</span>}
        </div>
        {p.pet_friendly === 1 && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full text-gray-700">
            🐾 Pets OK
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        {p.community && <p className="text-xs font-medium text-gold-600 uppercase tracking-wide mb-1">{p.community}</p>}
        <h3 className="font-semibold text-navy-900 text-base leading-snug mb-1 line-clamp-2 group-hover:text-navy-700 transition-colors">
          {p.title}
        </h3>
        <p className="text-sm text-gray-500 mb-4">{p.city}, {p.state} {p.zip}</p>

        {/* Specs */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1"><span className="text-base">🛏</span> {p.bedrooms} Beds</span>
          <span className="flex items-center gap-1"><span className="text-base">🛁</span> {p.bathrooms} Bath</span>
          {p.sqft && <span className="flex items-center gap-1"><span className="text-base">📐</span> {p.sqft.toLocaleString()} sqft</span>}
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            {p.rent > 0 ? (
              <>
                <span className="text-2xl font-bold text-navy-900">${p.rent.toLocaleString()}</span>
                <span className="text-gray-400 text-sm">/mo</span>
              </>
            ) : p.sold_price ? (
              <span className="text-lg font-bold text-navy-900">Sold · ${Number(p.sold_price).toLocaleString()}</span>
            ) : (
              <span className="text-lg font-semibold text-gray-500">{p.listing_status || 'Price TBD'}</span>
            )}
          </div>
          <span className="text-sm font-medium text-gold-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            View Details <span>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
