import { useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle, Calendar, Wrench, PawPrint, ArrowRight, Heart, MapPin, Images, Sofa,
} from 'lucide-react';
import type { Property } from '../types';
import { useFavorites } from '../hooks/useFavorites';

interface Props {
  property: Property;
  /** Position in a list; drives the staggered entrance animation. */
  index?: number;
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80';
const MAX_HOVER_PHOTOS = 5;

function formatAvailability(date: string | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  if (d.getTime() <= Date.now()) return 'Move in today';
  return `Available ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

export default function PropertyCard({ property: p, index }: Props) {
  const photos = useMemo(() => {
    const list = (p.photos || []).filter((ph) => ph && !/logo\./i.test(ph));
    return (list.length ? list : [PLACEHOLDER]).slice(0, MAX_HOVER_PHOTOS);
  }, [p.photos]);

  const [photoIdx, setPhotoIdx] = useState(0);
  const preloaded = useRef(false);
  const { isSaved, toggle } = useFavorites();
  const saved = isSaved(p.id);
  const [pop, setPop] = useState(false);

  const isOccupied = p.status === 'occupied';
  const availability = p.status === 'available' ? formatAvailability(p.availability_date) : null;

  const specs = useMemo(() => {
    const list: { value: string; label: string }[] = [];
    if (p.bedrooms > 0) list.push({ value: String(p.bedrooms), label: p.bedrooms === 1 ? 'Bed' : 'Beds' });
    if (p.bathrooms > 0) list.push({ value: String(p.bathrooms), label: p.bathrooms === 1 ? 'Bath' : 'Baths' });
    if (p.sqft) list.push({ value: p.sqft.toLocaleString(), label: 'sqft' });
    return list;
  }, [p.bedrooms, p.bathrooms, p.sqft]);

  const preloadPhotos = () => {
    if (preloaded.current) return;
    preloaded.current = true;
    photos.slice(1).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  };

  // Sweep the cursor across the photo to flip through the gallery.
  const onPhotoMove = (e: MouseEvent<HTMLDivElement>) => {
    if (photos.length < 2) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const next = Math.min(photos.length - 1, Math.max(0, Math.floor(ratio * photos.length)));
    if (next !== photoIdx) setPhotoIdx(next);
  };

  const onSave = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(p.id);
    setPop(true);
    window.setTimeout(() => setPop(false), 400);
  };

  return (
    <Link
      to={`/properties/${p.id}`}
      className={`card-premium group overflow-hidden flex flex-col h-full hover:border-gold-500/50 dark:hover:border-gold-500/50 transition-all duration-500 ease-out hover-lift focus-visible-ring ${
        index !== undefined ? 'stagger-in' : ''
      }`}
      style={index !== undefined ? ({ '--i': index } as CSSProperties) : undefined}
      aria-label={`${p.title}, ${p.city}, ${p.state}`}
    >
      {/* Photo */}
      <div
        className="relative overflow-hidden aspect-[16/10] bg-slate-100 dark:bg-slate-800"
        onMouseEnter={preloadPhotos}
        onMouseMove={onPhotoMove}
        onMouseLeave={() => setPhotoIdx(0)}
      >
        <img
          src={photos[photoIdx]}
          alt={p.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {p.status === 'available' && (
            <span className="badge-available transform group-hover:scale-105 transition-transform duration-200">
              <CheckCircle className="w-3 h-3" /> Available
            </span>
          )}
          {p.status === 'occupied' && (
            <span className="badge-occupied transform group-hover:scale-105 transition-transform duration-200">
              <Calendar className="w-3 h-3" /> Occupied
            </span>
          )}
          {p.status === 'maintenance' && (
            <span className="badge-maintenance transform group-hover:scale-105 transition-transform duration-200">
              <Wrench className="w-3 h-3" /> Maintenance
            </span>
          )}
        </div>

        {/* Save + perks */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={onSave}
            aria-label={saved ? 'Remove from saved homes' : 'Save this home'}
            aria-pressed={saved}
            title={saved ? 'Saved' : 'Save'}
            className={`w-9 h-9 rounded-full backdrop-blur-sm border shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
              saved
                ? 'bg-white text-rose-500 border-rose-200'
                : 'bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''} ${pop ? 'heart-pop' : ''}`} />
          </button>
          {p.pet_friendly === 1 && (
            <span className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm text-[11px] font-semibold px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 shadow-md border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transform group-hover:scale-105 transition-transform duration-200">
              <PawPrint className="w-3.5 h-3.5" /> Pets OK
            </span>
          )}
        </div>

        {/* Gallery affordances */}
        {photos.length > 1 && (
          <>
            <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-950/70 text-white text-[11px] font-semibold backdrop-blur-sm">
              <Images className="w-3.5 h-3.5" /> {photoIdx + 1}/{photos.length}
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5" aria-hidden="true">
              {photos.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === photoIdx ? 'w-5 bg-gold-400' : 'w-1.5 bg-white/70'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-3 mb-2">
          {p.community ? (
            <p className="text-[10px] font-bold text-gold-600 dark:text-gold-400 uppercase tracking-widest truncate">
              {p.community}
            </p>
          ) : <span />}
          {availability && (
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
              {availability}
            </span>
          )}
        </div>

        <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg leading-snug mb-2 line-clamp-2 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors duration-300">
          {p.title}
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="truncate">{p.city}, {p.state} {p.zip}</span>
        </p>

        {/* Specs — only what the record actually has */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400 mb-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          {specs.length > 0 ? (
            specs.map((spec, i) => (
              <div key={spec.label} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-slate-300 dark:text-slate-700 mr-2.5">·</span>}
                <span className="font-bold text-slate-700 dark:text-slate-300">{spec.value}</span>
                <span className="text-slate-400">{spec.label}</span>
              </div>
            ))
          ) : (
            <span className="text-slate-400">{p.property_type || 'Details on request'}</span>
          )}
          {p.furnished ? (
            <div className="flex items-center gap-1 text-slate-400">
              <span className="text-slate-300 dark:text-slate-700 mr-2.5">·</span>
              <Sofa className="w-3.5 h-3.5" /> Furnished
            </div>
          ) : null}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            {isOccupied ? (
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 italic">
                Currently Occupied
              </span>
            ) : p.rent > 0 ? (
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                  ${p.rent.toLocaleString()}
                </span>
                <span className="text-sm text-slate-400 font-medium">/mo</span>
              </div>
            ) : p.sold_price ? (
              <span className="font-display text-base font-bold text-slate-700 dark:text-slate-300">
                Sold · ${Number(p.sold_price).toLocaleString()}
              </span>
            ) : (
              <span className="text-sm font-semibold text-slate-500">Contact for price</span>
            )}
          </div>

          <span className="text-sm font-bold text-gold-600 dark:text-gold-400 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform duration-300">
            View Listing <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
