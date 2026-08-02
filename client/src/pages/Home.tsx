import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import { propertiesApi } from '../api/client';
import type { Property } from '../types';

const HERO_BG = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=80';

const STATS = [
  { value: '10+', label: 'Properties Managed' },
  { value: '5', label: 'Communities' },
  { value: '2', label: 'States (PA & FL)' },
  { value: '100%', label: 'Managed by IRUR' },
];

const TENANT_STEPS = [
  { icon: '🔍', title: 'Search & Discover', desc: 'Browse available properties filtered by your needs — location, budget, bedrooms, and lifestyle.' },
  { icon: '📅', title: 'Book a Session', desc: 'Schedule a free consultation with our team to discuss your requirements and tour properties.' },
  { icon: '📝', title: 'Sign Your Lease', desc: 'IRUR handles all rental agreements, background checks, and move-in paperwork seamlessly.' },
  { icon: '🏠', title: 'Move In & Relax', desc: 'Enjoy your new home. Pay rent, request maintenance, and manage your lease — all in one place.' },
];

const INVESTOR_STEPS = [
  { icon: '🏗️', title: 'Submit Your Property', desc: 'Share your property details with IRUR. We assess and onboard eligible investment properties.' },
  { icon: '🤝', title: 'IRUR Takes Over', desc: 'We handle listing, tenant screening, lease signing, and ongoing management so you don\'t have to.' },
  { icon: '👥', title: 'Tenants Placed', desc: 'IRUR places verified, reliable tenants. Occupancy is maximized while your risk is minimized.' },
  { icon: '💰', title: 'Earn Passive Revenue', desc: 'Collect steady rental income with full transparency. View performance reports anytime.' },
];

const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Tenant — Bridgeport, PA', quote: 'IRUR made finding my new home effortless. The process was transparent, professional, and they actually cared about finding me the right place.', rating: 5 },
  { name: 'David K.', role: 'Investor — Spring City, PA', quote: 'My two properties have been fully managed by IRUR for over a year. Zero hassle, consistent rental income, and their reports are detailed and reliable.', rating: 5 },
  { name: 'Jennifer R.', role: 'Tenant — St. Johns, FL', quote: 'Living in the Grand Isles community is a dream. IRUR handled every step from the application to move-in day. Highly recommend!', rating: 5 },
];

const COMMUNITIES = [
  { name: 'Lennar River Pointe', city: 'Bridgeport, PA', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { name: 'Lennar The Villages', city: 'Spring City, PA', img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80' },
  { name: 'Lennar SteelPointe', city: 'Phoenixville, PA', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80' },
  { name: 'Lennar Whispering Woods', city: 'Pottstown, PA', img: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400&q=80' },
  { name: 'Grand Isles at Beach Walk', city: 'St. Johns, FL', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80' },
];

export default function Home() {
  const [featuredProps, setFeaturedProps] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState<'tenant' | 'investor'>('tenant');
  const [search, setSearch] = useState({ city: '', maxRent: '', beds: '' });
  const navigate = useNavigate();

  useEffect(() => {
    propertiesApi.getAll({ status: 'available' })
      .then(data => setFeaturedProps(data.slice(0, 6)))
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.city) params.set('search', search.city);
    if (search.maxRent) params.set('maxRent', search.maxRent);
    if (search.beds) params.set('beds', search.beds);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* HERO */}
      <section
        className="relative min-h-screen flex items-center"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(8,15,31,0.92) 0%, rgba(15,30,61,0.82) 50%, rgba(27,61,133,0.75) 100%), url('${HERO_BG}')`,
          backgroundSize: 'cover', backgroundPosition: 'center'
        }}
      >
        <div className="container-xl w-full pt-32 pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-gold-300 text-sm font-medium px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-gold-400 rounded-full animate-pulse" />
              Trusted Property Management — PA & FL
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6">
              Find Your Perfect Home<br />
              <span className="text-gold-400">with IRUR</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/75 mb-10 max-w-xl leading-relaxed">
              Professional property management connecting quality investors with trusted tenants across Pennsylvania and Florida.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="bg-white/95 backdrop-blur-sm rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 px-3 pt-2">Location</label>
                <input value={search.city} onChange={e => setSearch(s => ({ ...s, city: e.target.value }))}
                  className="w-full px-3 pb-2 text-sm bg-transparent border-none outline-none text-gray-800 placeholder-gray-400"
                  placeholder="City, state or ZIP..." />
              </div>
              <div className="w-px bg-gray-200 hidden sm:block" />
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 px-3 pt-2">Max Rent</label>
                <select value={search.maxRent} onChange={e => setSearch(s => ({ ...s, maxRent: e.target.value }))}
                  className="w-full px-3 pb-2 text-sm bg-transparent border-none outline-none text-gray-800">
                  <option value="">Any price</option>
                  <option value="2000">Up to $2,000/mo</option>
                  <option value="2500">Up to $2,500/mo</option>
                  <option value="3000">Up to $3,000/mo</option>
                  <option value="3500">Up to $3,500/mo</option>
                </select>
              </div>
              <div className="w-px bg-gray-200 hidden sm:block" />
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 px-3 pt-2">Bedrooms</label>
                <select value={search.beds} onChange={e => setSearch(s => ({ ...s, beds: e.target.value }))}
                  className="w-full px-3 pb-2 text-sm bg-transparent border-none outline-none text-gray-800">
                  <option value="">Any</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
              <button type="submit" className="btn-primary px-8 flex items-center gap-2 whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-navy-800 py-10">
        <div className="container-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold text-gold-400">{s.value}</div>
                <div className="text-navy-200 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-gray-50">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="section-title">How IRUR Works</h2>
            <p className="section-subtitle mx-auto">A simple, transparent process for both tenants and investors.</p>
            <div className="flex justify-center gap-2 mt-8">
              {(['tenant', 'investor'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-8 py-3 rounded-full font-semibold text-sm transition-all ${activeTab === tab ? 'bg-navy-800 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:border-navy-300'}`}>
                  {tab === 'tenant' ? '🏠 For Tenants' : '💼 For Investors'}
                </button>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(activeTab === 'tenant' ? TENANT_STEPS : INVESTOR_STEPS).map((step, i) => (
              <div key={i} className="relative">
                {i < 3 && <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gold-200 -z-0" />}
                <div className="card p-6 relative z-10 text-center">
                  <div className="w-16 h-16 bg-gold-50 border-2 border-gold-200 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                    {step.icon}
                  </div>
                  <div className="text-xs font-bold text-gold-500 mb-2">STEP {i + 1}</div>
                  <h3 className="font-semibold text-navy-900 text-base mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/how-it-works" className="btn-secondary">Learn More →</Link>
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      {featuredProps.length > 0 && (
        <section className="py-20">
          <div className="container-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
              <div>
                <h2 className="section-title">Available Properties</h2>
                <p className="text-gray-500 mt-2">Quality homes ready for move-in across our communities.</p>
              </div>
              <Link to="/properties" className="btn-secondary whitespace-nowrap">View All →</Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {featuredProps.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* COMMUNITIES */}
      <section className="py-20 bg-navy-950">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Our Communities</h2>
            <p className="text-navy-300 mt-3">Carefully selected Lennar communities across Pennsylvania and Florida.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {COMMUNITIES.map(c => (
              <Link key={c.name} to={`/properties?community=${encodeURIComponent(c.name.replace('Lennar ',''))}`}
                className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <p className="text-gold-400 text-xs font-semibold uppercase tracking-wide mb-1">{c.city}</p>
                  <h3 className="text-white font-semibold text-sm leading-snug">{c.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY IRUR */}
      <section className="py-20 bg-white">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="section-title mb-6">Why Property Owners & Tenants Choose IRUR</h2>
              <div className="space-y-5">
                {[
                  { icon: '🛡️', title: 'Verified & Trusted', desc: 'Every tenant is thoroughly screened. Every property is inspected. No surprises.' },
                  { icon: '🔑', title: 'End-to-End Management', desc: 'From listing to lease to maintenance requests — IRUR handles it all for investors.' },
                  { icon: '📊', title: 'Full Transparency', desc: 'Investors get detailed reports. Tenants get clear lease terms. Everyone stays informed.' },
                  { icon: '🏆', title: 'Premium Communities', desc: 'We partner exclusively with top-tier Lennar master-planned communities.' },
                ].map(item => (
                  <div key={item.title} className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-gold-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">{item.icon}</div>
                    <div>
                      <h3 className="font-semibold text-navy-900 mb-1">{item.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden aspect-square shadow-2xl">
                <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80" alt="Luxury home" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
                <div className="text-3xl font-extrabold text-navy-900">5★</div>
                <div className="text-sm text-gray-500 mt-0.5">Avg. tenant satisfaction</div>
              </div>
              <div className="absolute -top-6 -right-6 bg-gold-500 rounded-2xl shadow-xl p-5">
                <div className="text-3xl font-extrabold text-white">100%</div>
                <div className="text-sm text-white/80 mt-0.5">Managed by IRUR</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-gray-50">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="section-title">What Our Clients Say</h2>
            <p className="section-subtitle mx-auto">Real stories from tenants and investors who trust IRUR.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-7">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card p-7">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => <span key={i} className="text-gold-400 text-lg">★</span>)}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-navy-100 flex items-center justify-center font-bold text-navy-700 text-sm">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-navy-900 text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 bg-gradient-to-br from-navy-900 to-navy-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-500 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="container-xl relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Find Your Next Home?</h2>
          <p className="text-navy-200 text-lg mb-8 max-w-lg mx-auto">Book a free consultation with IRUR today. Whether you're renting or investing, we're here to help.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/book-session" className="btn-primary text-base px-8 py-4">Book a Free Session</Link>
            <Link to="/properties" className="btn-outline-white text-base px-8 py-4">Browse Properties</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
