import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 container-xl py-16 animate-pulse">
        <div className="bg-gray-200 rounded-3xl aspect-[16/7] mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gray-200 h-8 rounded w-3/4" />
            <div className="bg-gray-200 h-5 rounded w-1/2" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (!property) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 container-xl py-24 text-center">
        <div className="text-6xl mb-4">🏠</div>
        <h1 className="text-2xl font-bold text-gray-700 mb-3">Property Not Found</h1>
        <Link to="/properties" className="btn-primary">Browse All Properties</Link>
      </div>
      <Footer />
    </div>
  );

  const photos = property.photos?.length ? property.photos : [PLACEHOLDER];
  const mapQuery = encodeURIComponent(`${property.address}, ${property.city}, ${property.state} ${property.zip}`);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 lg:pt-28">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100 py-3">
          <div className="container-xl flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-navy-700">Home</Link>
            <span>/</span>
            <Link to="/properties" className="hover:text-navy-700">Properties</Link>
            <span>/</span>
            <span className="text-navy-800 font-medium">{property.title}</span>
          </div>
        </div>

        <div className="container-xl py-8">
          {/* Gallery */}
          <div className="grid grid-cols-1 gap-3 mb-8 max-w-5xl">
            <div className="rounded-2xl overflow-hidden aspect-[16/8] bg-gray-200">
              <img src={photos[activePhoto]} alt={property.title}
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }} />
            </div>
            {photos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {photos.map((ph, i) => (
                  <button key={i} onClick={() => setActivePhoto(i)}
                    className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${activePhoto === i ? 'border-gold-500 shadow-gold' : 'border-transparent opacity-60 hover:opacity-90'}`}>
                    <img src={ph} alt="" className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-7">
              <div>
                {property.community && <p className="text-gold-600 text-sm font-semibold uppercase tracking-wide mb-2">{property.community}</p>}
                <h1 className="text-2xl md:text-3xl font-bold text-navy-900 mb-2">{property.title}</h1>
                <p className="text-gray-500">📍 {property.address}, {property.city}, {property.state} {property.zip}</p>
              </div>

              {/* Specs */}
              <div className="card p-6">
                <h2 className="font-semibold text-navy-900 mb-4">Property Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { icon: '🛏', label: 'Bedrooms', val: `${property.bedrooms} Beds` },
                    { icon: '🛁', label: 'Bathrooms', val: `${property.bathrooms} Bath` },
                    { icon: '📐', label: 'Square Feet', val: property.sqft ? `${property.sqft.toLocaleString()} sqft` : 'Contact us' },
                    { icon: '🏠', label: 'Property Type', val: property.property_type },
                    { icon: '🛋', label: 'Furnished', val: property.furnished ? 'Yes' : 'No' },
                    { icon: '🐾', label: 'Pet Friendly', val: property.pet_friendly ? 'Yes' : 'No' },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="text-xs text-gray-400 mb-0.5">{s.label}</div>
                      <div className="font-semibold text-navy-900 text-sm">{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div className="card p-6">
                  <h2 className="font-semibold text-navy-900 mb-3">About This Property</h2>
                  <p className="text-gray-600 leading-relaxed">{property.description}</p>
                </div>
              )}

              {/* Amenities */}
              {property.amenities?.length > 0 && (
                <div className="card p-6">
                  <h2 className="font-semibold text-navy-900 mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {property.amenities.map(a => (
                      <div key={a} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="w-5 h-5 bg-gold-100 rounded-full flex items-center justify-center text-gold-600 flex-shrink-0 text-xs">✓</span>
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map */}
              <div className="card overflow-hidden">
                <div className="p-6 pb-0">
                  <h2 className="font-semibold text-navy-900 mb-4">Location</h2>
                </div>
                <div className="aspect-[16/9]">
                  <iframe
                    src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`}
                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade" title="Property location map" />
                </div>
              </div>
            </div>

            {/* Sticky sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-5">
                {/* Pricing card */}
                <div className="card p-6">
                  <div className="mb-4">
                    <span className="text-4xl font-extrabold text-navy-900">${property.rent.toLocaleString()}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <div className="mb-5">
                    {property.status === 'available' && (
                      <>
                        <span className="badge-available text-sm px-3 py-1">● Available</span>
                        {property.availability_date && (
                          <p className="text-sm text-gray-500 mt-2">Available from {new Date(property.availability_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        )}
                      </>
                    )}
                    {property.status === 'occupied' && <span className="badge-occupied text-sm px-3 py-1">● Currently Occupied</span>}
                    {property.status === 'maintenance' && <span className="badge-maintenance text-sm px-3 py-1">● Under Maintenance</span>}
                  </div>
                  <a href="#inquiry-form" className="btn-primary w-full text-center block mb-3">Book a Viewing</a>
                  <Link to="/book-session" className="btn-secondary w-full text-center block text-sm py-2.5">Schedule Consultation</Link>
                </div>

                {/* Contact card */}
                <div className="card p-6 bg-navy-900">
                  <h3 className="font-semibold text-white mb-1">Have Questions?</h3>
                  <p className="text-navy-300 text-sm mb-4">Our team is ready to help you.</p>
                  <a href="tel:+12155550100" className="flex items-center gap-2 text-gold-400 text-sm font-medium mb-2 hover:text-gold-300">
                    <span>📞</span> (215) 555-0100
                  </a>
                  <a href="mailto:info@irur.com" className="flex items-center gap-2 text-gold-400 text-sm font-medium hover:text-gold-300">
                    <span>📧</span> info@irur.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div id="inquiry-form" className="max-w-2xl mt-10">
            <div className="card p-8">
              <h2 className="text-xl font-bold text-navy-900 mb-1">Request a Viewing</h2>
              <p className="text-gray-500 text-sm mb-6">Fill out the form and we'll get back to you within 24 hours.</p>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
                  <h3 className="font-semibold text-emerald-700 text-lg mb-2">Request Sent!</h3>
                  <p className="text-gray-500 text-sm">Our team will reach out to you within 24 hours to schedule your viewing.</p>
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
                      <input type="tel" className="input" placeholder="(215) 555-0100" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Preferred Date</label>
                      <input type="date" className="input" value={form.preferred_date} onChange={e => setForm(f => ({ ...f, preferred_date: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Message</label>
                    <textarea className="input resize-none" rows={3} placeholder="Any specific questions about this property?" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                  </div>
                  {formError && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2">{formError}</p>}
                  <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 disabled:opacity-50">
                    {submitting ? 'Sending...' : 'Send Inquiry'}
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
