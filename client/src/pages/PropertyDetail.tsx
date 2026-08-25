import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight,
  BedDouble, Bath, Ruler, Home as HomeIcon, Sofa, PawPrint,
  CheckCircle, Calendar, Wrench,
  CalendarCheck, MessageCircle, Phone, Mail, MapPin,
  Check, ArrowRight,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { propertiesApi, leadsApi } from '../api/client';
import type { Property } from '../types';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80';

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', preferred_date: '', message: '', interest_type: 'renting' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!id) return;
    propertiesApi.getOne(Number(id))
      .then(setProperty)
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));
  }, [id]);

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

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <div className="pt-32 container-xl py-16">
        <div className="shimmer rounded-3xl aspect-[16/8] mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="shimmer h-8 rounded w-3/4" />
            <div className="shimmer h-5 rounded w-1/2" />
          </div>
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

  const propertyPhotos = property.photos?.filter(photo => photo !== '/logo.jpeg') ?? [];
  const photos = [...(propertyPhotos.length ? propertyPhotos : [PLACEHOLDER]), '/logo.jpeg'];
  const mapQuery = encodeURIComponent(`${property.address}, ${property.city}, ${property.state} ${property.zip}`);

  const specItems = [
    { label: 'Bedrooms', val: `${property.bedrooms} Beds`, icon: <BedDouble className="w-5 h-5 text-gold-500" /> },
    { label: 'Bathrooms', val: `${property.bathrooms} Baths`, icon: <Bath className="w-5 h-5 text-gold-500" /> },
    { label: 'Square Feet', val: property.sqft ? `${property.sqft.toLocaleString()} sqft` : 'N/A', icon: <Ruler className="w-5 h-5 text-gold-500" /> },
    { label: 'Property Type', val: property.property_type, icon: <HomeIcon className="w-5 h-5 text-gold-500" /> },
    { label: 'Furnished', val: property.furnished ? 'Yes' : 'No', icon: <Sofa className="w-5 h-5 text-gold-500" /> },
    { label: 'Pet Friendly', val: property.pet_friendly ? 'Yes' : 'No', icon: <PawPrint className="w-5 h-5 text-gold-500" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      
      <div className="pt-28 lg:pt-32 pb-20">
        
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 py-3">
          <div className="container-xl flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-gold-500 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/properties" className="hover:text-gold-500 transition-colors">Rental</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800 dark:text-slate-200 font-semibold truncate">{property.title}</span>
          </div>
        </div>

        <div className="container-xl py-8">
          
          {/* Main Gallery */}
          <div className="grid grid-cols-1 gap-3 mb-8">
            <div className="rounded-3xl overflow-hidden min-h-[400px] max-h-[600px] bg-slate-200 dark:bg-slate-800 relative group border border-slate-200/80 dark:border-slate-800 flex items-center justify-center shadow-premium-lg hover-glow">
              <img
                src={photos[activePhoto]}
                alt={property.title}
                className="w-full h-full object-contain"
                onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
              />
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setActivePhoto(i => (i - 1 + photos.length) % photos.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center shadow-md hover:scale-105 transition-all text-slate-800 dark:text-white hover:bg-gold-50 dark:hover:bg-gold-950/20"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActivePhoto(i => (i + 1) % photos.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center shadow-md hover:scale-105 transition-all text-slate-800 dark:text-white hover:bg-gold-50 dark:hover:bg-gold-950/20"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold px-4 py-2 rounded-xl border border-slate-800">
                    {activePhoto + 1} / {photos.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Row */}
            {photos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {photos.map((ph, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    className={`flex-shrink-0 w-28 h-20 rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center ${
                      activePhoto === i ? 'border-gold-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={ph} alt="" className="w-full h-full object-contain" onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Content Column */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Title & Location Header */}
              <div>
                {property.community && (
                  <span className="text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider block mb-1">
                    {property.community}
                  </span>
                )}
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                  {property.title}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.address}, {property.city}, {property.state} {property.zip}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="card-premium p-6">
                <h2 className="font-display font-bold text-slate-900 dark:text-white text-base mb-4">Key Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {specItems.map((s) => (
                    <div key={s.label} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800 hover-lift">
                      <div className="mb-1">{s.icon}</div>
                      <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{s.label}</div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div className="card-premium p-6">
                  <h2 className="font-display font-bold text-slate-900 dark:text-white text-base mb-3">About This Home</h2>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{property.description}</p>
                </div>
              )}

              {/* Amenities */}
              {property.amenities?.length > 0 && (
                <div className="card-premium p-6">
                  <h2 className="font-display font-bold text-slate-900 dark:text-white text-base mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {property.amenities.map(a => (
                      <div key={a} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span className="w-4 h-4 rounded-full bg-gold-50 dark:bg-gold-950 text-gold-600 dark:text-gold-400 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map */}
              <div className="card-premium overflow-hidden">
                <div className="p-6 pb-4">
                  <h2 className="font-display font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gold-500" /> Location
                  </h2>
                </div>
                <div className="aspect-[16/8]">
                  <iframe
                    src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`}
                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                    title="Property location map" />
                </div>
              </div>
            </div>

            {/* Sticky Sidebar Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                
                {/* Pricing & Booking Card */}
                <div className="card-premium p-6 border-2 border-gold-500/20">
                  <div className="mb-4">
                    <span className="font-display text-3xl font-black text-slate-900 dark:text-white">
                      ${property.rent.toLocaleString()}
                    </span>
                    <span className="text-slate-400 text-sm"> /month</span>
                  </div>

                  <div className="mb-6">
                    {property.status === 'available' && (
                      <span className="badge-available">
                        <CheckCircle className="w-3 h-3" /> Available Now
                      </span>
                    )}
                    {property.status === 'occupied' && (
                      <span className="badge-occupied">
                        <Calendar className="w-3 h-3" /> Occupied
                      </span>
                    )}
                    {property.status === 'maintenance' && (
                      <span className="badge-maintenance">
                        <Wrench className="w-3 h-3" /> Maintenance
                      </span>
                    )}
                  </div>

                  <a href="#inquiry-form" className="btn-luxury w-full text-center py-3 mb-3">
                    <Calendar className="w-4 h-4" />
                    Request a Tour
                  </a>
                  <Link to="/book-session" className="btn-luxury-outline w-full text-center py-3 text-xs">
                    <CalendarCheck className="w-4 h-4" />
                    Schedule Consultation
                  </Link>
                </div>

                {/* Contact Card */}
                <div className="card-premium p-6 bg-slate-900 text-white border-2 border-gold-500/30">
                  <h3 className="font-display font-bold text-base mb-1 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-gold-400" /> Questions About This Home?
                  </h3>
                  <p className="text-slate-400 text-xs mb-4">Our property managers are standing by to assist you.</p>
                  <a href="tel:+17174336793" className="text-gold-400 font-bold text-sm block mb-2 hover:underline flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    (717) 433-6793
                  </a>
                  <a href="mailto:info@irur.com" className="text-gold-400 text-xs hover:underline flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    info@irur.com
                  </a>
                </div>

              </div>
            </div>

          </div>

          {/* Inquiry Form Section */}
          <div id="inquiry-form" className="max-w-2xl mt-12">
            <div className="card-premium p-8 border-2 border-gold-500/20">
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-1">Request a Viewing</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Complete the form below and our team will get back to you within 24 hours.</p>

              {submitted ? (
                <div className="text-center py-8">
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
                      <label className="label">Full Name *</label>
                      <input className="input" placeholder="John Smith" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Email *</label>
                      <input type="email" className="input" placeholder="john@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Phone</label>
                      <input type="tel" className="input" placeholder="(717) 433-6793" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Preferred Date</label>
                      <input type="date" className="input" value={form.preferred_date} onChange={e => setForm(f => ({ ...f, preferred_date: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Message</label>
                    <textarea className="input resize-none" rows={3} placeholder="Questions or tour preferences..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                  </div>
                  {formError && <p className="text-red-500 text-xs">{formError}</p>}
                  <button type="submit" disabled={submitting} className="btn-luxury w-full py-3">
                    {submitting ? 'Submitting...' : 'Submit Inquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
