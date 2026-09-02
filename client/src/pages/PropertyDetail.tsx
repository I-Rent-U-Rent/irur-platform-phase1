import { useState, useEffect, useRef } from 'react';
import type { KeyboardEvent, TouchEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight,
  BedDouble, Bath, Ruler, Home as HomeIcon, Sofa, PawPrint,
  CheckCircle, Calendar, Wrench,
  CalendarCheck, MessageCircle, Phone, Mail, MapPin,
  Check, Heart, Share2, Maximize2, Images, ArrowRight,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Lightbox from '../components/Lightbox';
import PropertyCard from '../components/PropertyCard';
import { propertiesApi, leadsApi } from '../api/client';
import { useFavorites } from '../hooks/useFavorites';
import type { Property } from '../types';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80';
const DESCRIPTION_CLAMP = 360;

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [similar, setSimilar] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', preferred_date: '', message: '', interest_type: 'renting' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const thumbsRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const { isSaved, toggle } = useFavorites();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    propertiesApi.getOne(Number(id))
      .then(setProperty)
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Similar homes: same city first, then anything else available.
  useEffect(() => {
    if (!property) return;
    propertiesApi.getAll({ status: 'available' })
      .then((data: Property[]) => {
        const others = (Array.isArray(data) ? data : []).filter((p) => p.id !== property.id);
        const sameCity = others.filter((p) => p.city === property.city);
        const rest = others.filter((p) => p.city !== property.city);
        setSimilar([...sameCity, ...rest].slice(0, 3));
      })
      .catch(() => setSimilar([]));
  }, [property?.id, property?.city]);

  // Keep the active thumbnail visible.
  useEffect(() => {
    const strip = thumbsRef.current;
    const el = strip?.children[activePhoto] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [activePhoto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.full_name || !form.email) { setFormError('Name and email are required.'); return; }
    setSubmitting(true);
    try {
      await leadsApi.submit({ ...form, property_id: id, source: 'property_detail' });
      setSubmitted(true);
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const share = async () => {
    if (!property) return;
    const url = window.location.href;
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ title: property.title, text: `${property.title} · ${property.city}, ${property.state}`, url });
        return;
      } catch {
        /* user dismissed the share sheet - fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <div className="pt-32 container-xl py-16" aria-busy="true">
        <div className="skeleton rounded-3xl aspect-[16/8] mb-4" />
        <div className="flex gap-3 mb-8">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton w-28 h-20 rounded-xl" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton h-8 rounded w-3/4" />
            <div className="skeleton h-5 rounded w-1/2" />
            <div className="skeleton h-40 rounded-3xl" />
          </div>
          <div className="skeleton h-56 rounded-3xl" />
        </div>
      </div>
      <Footer />
    </div>
  );

  if (!property) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <div className="pt-32 container-xl py-24 text-center">
        <HomeIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white mb-3">Property Not Found</h1>
        <Link to="/properties" className="btn-luxury">
          <HomeIcon className="w-4 h-4" />
          Browse Rentals
        </Link>
      </div>
      <Footer />
    </div>
  );

  // The gallery closes on a branded slide. '/logo.jpeg' never existed, so the old
  // value fell through to the stock placeholder on every listing.
  // The tile carries its own navy ground, so it reads on the light gallery too.
  const BRAND_SLIDE = '/logo-tile.png';
  const propertyPhotos = property.photos?.filter(
    photo => photo !== '/logo.jpeg' && photo !== '/logo-mark.png' && photo !== BRAND_SLIDE
  ) ?? [];
  const photos = [...(propertyPhotos.length ? propertyPhotos : [PLACEHOLDER]), BRAND_SLIDE];
  const mapQuery = encodeURIComponent(`${property.address}, ${property.city}, ${property.state} ${property.zip}`);
  const saved = isSaved(property.id);
  const prevPhoto = () => setActivePhoto(i => (i - 1 + photos.length) % photos.length);
  const nextPhoto = () => setActivePhoto(i => (i + 1) % photos.length);

  const onGalleryKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); prevPhoto(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); nextPhoto(); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLightboxOpen(true); }
  };
  const onTouchStart = (e: TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 40) (dx < 0 ? nextPhoto : prevPhoto)();
  };

  const description = property.description || '';
  const descIsLong = description.length > DESCRIPTION_CLAMP;
  const visibleDescription = descIsLong && !descExpanded ? `${description.slice(0, DESCRIPTION_CLAMP).trimEnd()}…` : description;

  const specItems = [
    { label: 'Bedrooms', val: `${property.bedrooms} Beds`, icon: <BedDouble className="w-5 h-5 text-gold-500" /> },
    { label: 'Bathrooms', val: `${property.bathrooms} Baths`, icon: <Bath className="w-5 h-5 text-gold-500" /> },
    { label: 'Square Feet', val: property.sqft ? `${property.sqft.toLocaleString()} sqft` : 'N/A', icon: <Ruler className="w-5 h-5 text-gold-500" /> },
    { label: 'Property Type', val: property.property_type, icon: <HomeIcon className="w-5 h-5 text-gold-500" /> },
    { label: 'Furnished', val: property.furnished ? 'Yes' : 'No', icon: <Sofa className="w-5 h-5 text-gold-500" /> },
    { label: 'Pet Friendly', val: property.pet_friendly ? 'Yes' : 'No', icon: <PawPrint className="w-5 h-5 text-gold-500" /> },
  ];

  const statusBadge = property.status === 'available' ? (
    <span className="badge-available"><CheckCircle className="w-3 h-3" /> Available Now</span>
  ) : property.status === 'occupied' ? (
    <span className="badge-occupied"><Calendar className="w-3 h-3" /> Occupied</span>
  ) : (
    <span className="badge-maintenance"><Wrench className="w-3 h-3" /> Maintenance</span>
  );

  const saveButton = (size: 'sm' | 'md' = 'md') => (
    <button
      type="button"
      onClick={() => toggle(property.id)}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved homes' : 'Save this home'}
      className={`${size === 'md' ? 'w-11 h-11' : 'w-10 h-10'} rounded-xl border flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 ${
        saved
          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-500'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:border-rose-300'
      }`}
    >
      <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <div className="pt-28 lg:pt-32 pb-28 lg:pb-20">

        {/* Breadcrumb */}
        <div className="bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 py-3">
          <nav className="container-xl flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-gold-500 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/properties" className="hover:text-gold-500 transition-colors">Rental</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800 dark:text-slate-200 font-semibold truncate" aria-current="page">{property.title}</span>
          </nav>
        </div>

        <div className="container-xl py-8">

          {/* Gallery */}
          <div className="grid grid-cols-1 gap-3 mb-8">
            <div
              className="rounded-3xl overflow-hidden min-h-[320px] sm:min-h-[400px] max-h-[600px] bg-slate-200 dark:bg-slate-800 relative group border border-slate-200/80 dark:border-slate-800 flex items-center justify-center shadow-premium-lg hover-glow cursor-zoom-in focus-visible-ring"
              tabIndex={0}
              role="button"
              aria-label="Open photo gallery"
              onClick={() => setLightboxOpen(true)}
              onKeyDown={onGalleryKeyDown}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <img
                key={photos[activePhoto]}
                src={photos[activePhoto]}
                alt={`${property.title} photo ${activePhoto + 1}`}
                className="w-full h-full object-contain fade-swap"
                onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
              />
              <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/10 transition-colors duration-300 pointer-events-none" />

              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                    aria-label="Previous photo"
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center shadow-md hover:scale-105 transition-all text-slate-800 dark:text-white hover:bg-gold-500 hover:text-white lg:opacity-0 lg:group-hover:opacity-100 lg:focus:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                    aria-label="Next photo"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center shadow-md hover:scale-105 transition-all text-slate-800 dark:text-white hover:bg-gold-500 hover:text-white lg:opacity-0 lg:group-hover:opacity-100 lg:focus:opacity-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold px-3 py-2 rounded-xl border border-slate-800 tabular-nums inline-flex items-center gap-1.5">
                    <Images className="w-3.5 h-3.5" /> {activePhoto + 1} / {photos.length}
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
                className="absolute bottom-4 right-4 inline-flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md hover:bg-gold-500 hover:text-white hover:border-gold-500 transition-all"
              >
                <Maximize2 className="w-3.5 h-3.5" /> View all photos
              </button>
            </div>

            {photos.length > 1 && (
              <div ref={thumbsRef} className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                {photos.map((ph, i) => (
                  <button
                    key={`${ph}-${i}`}
                    type="button"
                    onClick={() => setActivePhoto(i)}
                    aria-label={`Show photo ${i + 1}`}
                    aria-current={activePhoto === i}
                    className={`flex-shrink-0 w-28 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 flex items-center justify-center bg-slate-100 dark:bg-slate-800 ${
                      activePhoto === i ? 'border-gold-500 opacity-100 scale-[1.03] shadow-premium' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={ph} alt="" className="w-full h-full object-contain" loading="lazy" onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* Main column */}
            <div className="lg:col-span-2 space-y-8">

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {property.community && (
                    <span className="text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider block mb-1">
                      {property.community}
                    </span>
                  )}
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                    {property.title}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    {property.address}, {property.city}, {property.state} {property.zip}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 relative">
                  <button
                    type="button"
                    onClick={share}
                    aria-label="Share this listing"
                    className="w-11 h-11 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-gold-500 hover:border-gold-400 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  {saveButton()}
                  {copied && (
                    <span role="status" className="toast-in absolute -bottom-9 right-0 whitespace-nowrap text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-1.5 rounded-lg shadow-lg">
                      Link copied
                    </span>
                  )}
                </div>
              </div>

              {/* Specs */}
              <div className="card-premium p-6">
                <h2 className="font-display font-bold text-slate-900 dark:text-white text-base mb-4">Key Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {specItems.map((s) => (
                    <div key={s.label} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800 hover:border-gold-500/40 transition-colors duration-300 group">
                      <div className="mb-1 group-hover:scale-110 origin-left transition-transform duration-300">{s.icon}</div>
                      <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{s.label}</div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              {description && (
                <div className="card-premium p-6">
                  <h2 className="font-display font-bold text-slate-900 dark:text-white text-base mb-3">About This Home</h2>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">{visibleDescription}</p>
                  {descIsLong && (
                    <button
                      type="button"
                      onClick={() => setDescExpanded(v => !v)}
                      aria-expanded={descExpanded}
                      className="mt-3 text-sm font-semibold text-gold-600 dark:text-gold-400 hover:underline inline-flex items-center gap-1"
                    >
                      {descExpanded ? 'Show less' : 'Read more'}
                      <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${descExpanded ? '-rotate-90' : 'rotate-90'}`} />
                    </button>
                  )}
                </div>
              )}

              {/* Amenities */}
              {property.amenities?.length > 0 && (
                <div className="card-premium p-6">
                  <h2 className="font-display font-bold text-slate-900 dark:text-white text-base mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {property.amenities.map(a => (
                      <div key={a} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 group">
                        <span className="w-5 h-5 rounded-full bg-gold-50 dark:bg-gold-950 text-gold-600 dark:text-gold-400 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500 group-hover:text-white transition-colors duration-200">
                          <Check className="w-3 h-3" />
                        </span>
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map */}
              <div className="card-premium overflow-hidden">
                <div className="p-6 pb-4 flex items-center justify-between gap-3">
                  <h2 className="font-display font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gold-500" /> Location
                  </h2>
                  <a
                    href={`https://maps.google.com/?q=${mapQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-gold-600 dark:text-gold-400 hover:underline inline-flex items-center gap-1"
                  >
                    Open in Maps <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
                <div className="aspect-[16/8]">
                  <iframe
                    src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`}
                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                    title="Property location map" />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">

                <div className="card-premium p-6 border-2 border-gold-500/20">
                  <div className="mb-4 flex items-baseline gap-1">
                    <span className="font-display text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                      ${property.rent.toLocaleString()}
                    </span>
                    <span className="text-slate-400 text-sm">/month</span>
                  </div>

                  <div className="mb-6">{statusBadge}</div>

                  <a href="#inquiry-form" className="btn-luxury w-full text-center py-3 mb-3">
                    <Calendar className="w-4 h-4" />
                    Request a Tour
                  </a>
                  <Link to="/book-session" className="btn-luxury-outline w-full text-center py-3 text-xs">
                    <CalendarCheck className="w-4 h-4" />
                    Schedule Consultation
                  </Link>
                </div>

                <div className="card-premium p-6 bg-slate-900 text-white border-2 border-gold-500/30">
                  <h3 className="font-display font-bold text-base mb-1 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-gold-400" /> Questions About This Home?
                  </h3>
                  <p className="text-slate-400 text-xs mb-4">Our property managers are standing by to assist you.</p>
                  <a href="tel:+17174336793" className="text-gold-400 font-bold text-sm mb-2 hover:underline flex items-center gap-2 group">
                    <Phone className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    (717) 433-6793
                  </a>
                  <a href="mailto:info@irenturent.com" className="text-gold-400 text-xs hover:underline flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    info@irenturent.com
                  </a>
                </div>

              </div>
            </div>

          </div>

          {/* Inquiry form */}
          <div id="inquiry-form" className="max-w-2xl mt-12 scroll-mt-32">
            <div className="card-premium p-8 border-2 border-gold-500/20">
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-1">Request a Viewing</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Complete the form below and our team will get back to you within 24 hours.</p>

              {submitted ? (
                <div className="text-center py-8 zoom-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 animate-bounce-subtle">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-white text-base mb-1">Request Sent</h3>
                  <p className="text-slate-500 text-sm">We've received your request and will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label" htmlFor="inq-name">Full Name *</label>
                      <input id="inq-name" className="input" placeholder="John Smith" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} autoComplete="name" />
                    </div>
                    <div>
                      <label className="label" htmlFor="inq-email">Email *</label>
                      <input id="inq-email" type="email" className="input" placeholder="john@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} autoComplete="email" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label" htmlFor="inq-phone">Phone</label>
                      <input id="inq-phone" type="tel" className="input" placeholder="(717) 433-6793" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} autoComplete="tel" />
                    </div>
                    <div>
                      <label className="label" htmlFor="inq-date">Preferred Date</label>
                      <input id="inq-date" type="date" className="input" value={form.preferred_date} onChange={e => setForm(f => ({ ...f, preferred_date: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
                    </div>
                  </div>
                  <div>
                    <label className="label" htmlFor="inq-message">Message</label>
                    <textarea id="inq-message" className="input resize-none" rows={3} placeholder="Questions or tour preferences..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                  </div>
                  {formError && <p className="text-red-500 text-xs" role="alert">{formError}</p>}
                  <button type="submit" disabled={submitting} className="btn-luxury w-full py-3">
                    {submitting ? 'Submitting...' : 'Submit Inquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Similar homes */}
          {similar.length > 0 && (
            <section className="mt-16">
              <div className="flex items-end justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Keep Exploring</span>
                  <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white mt-1">Similar Rentals</h2>
                </div>
                <Link to="/properties" className="text-sm font-semibold text-gold-600 dark:text-gold-400 hover:underline inline-flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similar.map((p, i) => <PropertyCard key={p.id} property={p} index={i} />)}
              </div>
            </section>
          )}

        </div>
      </div>

      {/* Mobile sticky action bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#061B20]/95 backdrop-blur-md border-t border-white/10 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display text-lg font-black text-white tabular-nums leading-tight">
            ${property.rent.toLocaleString()}<span className="text-xs text-slate-400 font-medium">/mo</span>
          </div>
          <div className="text-[11px] text-slate-400 truncate capitalize">{property.status}</div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {saveButton('sm')}
          <a href="#inquiry-form" className="btn-luxury py-2.5 px-4 text-xs">
            <Calendar className="w-4 h-4" /> Request a Tour
          </a>
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox
          photos={photos}
          index={activePhoto}
          title={property.title}
          onClose={() => setLightboxOpen(false)}
          onChange={setActivePhoto}
        />
      )}

      <Footer />
    </div>
  );
}
