import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Home as HomeIcon, Search, ArrowRight, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import { propertiesApi } from '../api/client';
import type { Property } from '../types';
import { useScrollReveal, useCountUp } from '../hooks/useScrollReveal';

const HERO_VIDEO = '/cleaned.mp4';
const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80';

const TENANT_STEPS = [
  { step: '01', title: 'Search & Discover', desc: 'Browse available properties filtered by your needs — location, budget, bedrooms, and lifestyle.' },
  { step: '02', title: 'Book a Session', desc: 'Schedule a free consultation with our team to discuss your requirements and tour properties.' },
  { step: '03', title: 'Sign Your Lease', desc: 'IRUR handles all rental agreements, background checks, and move-in paperwork seamlessly.' },
  { step: '04', title: 'Move In & Relax', desc: 'Enjoy your new home with transparent management, easy communication, and ongoing support.' },
];

const INVESTOR_STEPS = [
  { step: '01', title: 'Submit Your Property', desc: 'Share your property details with IRUR. We assess and onboard eligible investment properties.' },
  { step: '02', title: 'IRUR Takes Over', desc: 'We handle listing, tenant screening, lease signing, and ongoing management so you don\'t have to.' },
  { step: '03', title: 'Tenants Placed', desc: 'IRUR places verified, reliable tenants. Occupancy is maximized while your risk is minimized.' },
  { step: '04', title: 'Earn Passive Revenue', desc: 'Collect steady rental income with full transparency. View performance reports anytime.' },
];

const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Tenant — Bridgeport, PA', quote: 'IRUR made finding my new home effortless. The process was transparent, professional, and they cared about finding me the right place.' },
  { name: 'David K.', role: 'Investor — Spring City, PA', quote: 'My properties have been fully managed by IRUR for over a year. Zero hassle, consistent rental income, and reliable reporting.' },
  { name: 'Jennifer R.', role: 'Tenant — St. Johns, FL', quote: 'Living in the Grand Isles community is a dream. IRUR handled every step from the application to move-in day seamlessly.' },
];

const COMMUNITIES = [
  { name: 'Lennar River Pointe', city: 'Bridgeport, PA', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80' },
  { name: 'Lennar The Villages', city: 'Spring City, PA', img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&q=80' },
  { name: 'Lennar SteelPointe', city: 'Phoenixville, PA', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&q=80' },
  { name: 'Lennar Whispering Woods', city: 'Pottstown, PA', img: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=500&q=80' },
  { name: 'Grand Isles at Beach Walk', city: 'St. Johns, FL', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80' },
];

interface StatsData {
  totalProperties: number;
  availableProperties: number;
  occupiedProperties: number;
  communitiesCount: number;
  statesCount: number;
  citiesCount: number;
}

function StatCounter({ value, suffix, label, start }: { value: number; suffix: string; label: string; start: boolean }) {
  const count = useCountUp(value, 1500, start);
  return (
    <div className="card p-6 text-center hover-lift">
      <div className="font-display text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-1">
        <span>{count}</span>
        <span className="text-gold-500">{suffix}</span>
      </div>
      <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</div>
    </div>
  );
}

function RevealSection({ children, delay = '' }: { children: React.ReactNode; delay?: string }) {
  const { ref, inView } = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${delay} ${inView ? 'in-view' : ''}`}>
      {children}
    </div>
  );
}

export default function Home() {
  const [featuredProps, setFeaturedProps] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState<'tenant' | 'investor'>('tenant');
  
  const [platformStats, setPlatformStats] = useState<StatsData>({
    totalProperties: 65,
    availableProperties: 8,
    occupiedProperties: 57,
    communitiesCount: 5,
    statesCount: 2,
    citiesCount: 7,
  });

  const [searchOptions, setSearchOptions] = useState<{ cities: string[]; communities: string[]; propertyTypes: string[] }>({
    cities: [],
    communities: [],
    propertyTypes: [],
  });

  const [search, setSearch] = useState({ city: '', maxRent: '', beds: '', type: '' });
  const [suggestions, setSuggestions] = useState<Property[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const navigate = useNavigate();
  const statsRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    propertiesApi.getStats()
      .then(stats => {
        if (stats && typeof stats.totalProperties === 'number') {
          setPlatformStats(stats);
        }
      })
      .catch(() => {});

    propertiesApi.getSearchOptions()
      .then(options => {
        if (options) setSearchOptions(options);
      })
      .catch(() => {});

    propertiesApi.getAll({ status: 'available' })
      .then(data => setFeaturedProps(data.slice(0, 6)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    const playIfAllowed = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        video.pause();
        return;
      }
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      void video.play().catch(() => {});
    };

    playIfAllowed();
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    media.addEventListener('change', playIfAllowed);
    return () => media.removeEventListener('change', playIfAllowed);
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsVisible(true); observer.unobserve(entry.target); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const query = search.city.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      propertiesApi.getAll({ search: query })
        .then(res => {
          setSuggestions(res.slice(0, 5));
          setShowSuggestions(true);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setIsSearching(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [search.city]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (search.city) params.set('search', search.city);
    if (search.maxRent) params.set('maxRent', search.maxRent);
    if (search.beds) params.set('beds', search.beds);
    if (search.type) params.set('type', search.type);
    navigate(`/properties?${params.toString()}`);
  };

  const selectSuggestion = (prop: Property) => {
    setShowSuggestions(false);
    navigate(`/properties/${prop.id}`);
  };

  const dynamicStatsList = [
    { value: platformStats.totalProperties || 65, suffix: '+', label: 'Properties Managed' },
    { value: platformStats.availableProperties || 8, suffix: '', label: 'Available Rentals' },
    { value: platformStats.communitiesCount || 5, suffix: '', label: 'Master Communities' },
    { value: platformStats.statesCount || 2, suffix: '', label: 'States (PA & FL)' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative flex min-h-[100svh] min-h-[100dvh] items-center overflow-hidden border-b border-slate-200/80 dark:border-slate-800 pt-[max(6.25rem,calc(env(safe-area-inset-top)+5.25rem))] pb-16 sm:pt-[max(7.25rem,calc(env(safe-area-inset-top)+6.25rem))] sm:pb-20 lg:pb-24">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          <video
            ref={heroVideoRef}
            className="absolute left-1/2 top-1/2 h-full min-h-full w-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover object-center"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-slate-950/50 sm:bg-slate-950/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-slate-950/70" />
        </div>

        <div className="absolute top-20 left-10 hidden h-20 w-20 rounded-full bg-gold-500/10 blur-2xl animate-float sm:block" />
        <div className="absolute bottom-20 right-10 hidden h-32 w-32 rounded-full bg-brand-500/10 blur-2xl animate-float sm:block" style={{ animationDelay: '-3s' }} />

        <div className="container-xl relative z-10 w-full">
          <div className="mx-auto max-w-3xl px-0 text-center sm:px-2">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-50/95 dark:bg-gold-950/70 border border-gold-200 dark:border-gold-800/60 text-gold-600 dark:text-gold-400 text-xs font-semibold mb-6 badge-luxury">
              <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
              <span>Premier Rental Properties Across PA & FL</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)]">
              Modern Rental Homes. <br className="hidden sm:inline" />
              <span className="text-gradient">Professionally Managed.</span>
            </h1>

            <p className="text-white/85 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
              Connecting high-caliber rental properties with trusted tenants across Pennsylvania and Florida's premier master-planned communities.
            </p>

            {/* SEARCH BAR INTERFACE */}
            <div ref={searchContainerRef} className="relative max-w-3xl mx-auto text-left">
              <form
                onSubmit={handleSearch}
                className="glass p-3 rounded-2xl shadow-premium-lg border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
              >
                {/* Location Input */}
                <div className="sm:col-span-5 relative">
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 pt-1">
                    Location or Keyword
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={search.city}
                      onChange={e => setSearch(s => ({ ...s, city: e.target.value }))}
                      onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                      className="w-full px-3 py-1.5 text-sm font-semibold bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400"
                      placeholder="City, community, ZIP..."
                    />
                    {isSearching && (
                      <div className="absolute right-3 w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-3 bg-white dark:bg-slate-850 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
                      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 flex justify-between">
                        <span>Matching Rentals ({suggestions.length})</span>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                        {suggestions.map(prop => (
                          <button
                            key={prop.id}
                            type="button"
                            onClick={() => selectSuggestion(prop)}
                            className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 group"
                          >
                            <img src={prop.photos?.[0] || PLACEHOLDER_IMG} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate group-hover:text-gold-500">{prop.title}</h4>
                              <p className="text-[11px] text-slate-500 truncate">{prop.city}, {prop.state} · {prop.bedrooms} Bed, {prop.bathrooms} Bath</p>
                            </div>
                            <div className="text-right flex-shrink-0 font-bold text-xs text-slate-900 dark:text-white">
                              ${prop.rent > 0 ? prop.rent.toLocaleString() : 'N/A'}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-800" />

                {/* Max Budget */}
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 pt-1">
                    Max Price
                  </label>
                  <select
                    value={search.maxRent}
                    onChange={e => setSearch(s => ({ ...s, maxRent: e.target.value }))}
                    className="w-full px-3 py-1.5 text-sm font-semibold bg-transparent border-none outline-none text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="" className="dark:bg-slate-900">Any Budget</option>
                    <option value="2500" className="dark:bg-slate-900">Up to $2,500/mo</option>
                    <option value="3000" className="dark:bg-slate-900">Up to $3,000/mo</option>
                    <option value="3500" className="dark:bg-slate-900">Up to $3,500/mo</option>
                  </select>
                </div>

                <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-800" />

                {/* Bedrooms */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 pt-1">
                    Beds
                  </label>
                  <select
                    value={search.beds}
                    onChange={e => setSearch(s => ({ ...s, beds: e.target.value }))}
                    className="w-full px-3 py-1.5 text-sm font-semibold bg-transparent border-none outline-none text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="" className="dark:bg-slate-900">Any</option>
                    <option value="2" className="dark:bg-slate-900">2+ Beds</option>
                    <option value="3" className="dark:bg-slate-900">3+ Beds</option>
                    <option value="4" className="dark:bg-slate-900">4+ Beds</option>
                  </select>
                </div>

                {/* Submit button */}
                <div className="sm:col-span-2">
                  <button type="submit" className="btn-luxury w-full py-3">
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                </div>
              </form>

              {/* Popular City Chips */}
              {searchOptions.cities.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs text-white/70 font-medium">Popular:</span>
                  {searchOptions.cities.slice(0, 5).map(city => (
                    <button
                      key={city}
                      onClick={() => {
                        setSearch(s => ({ ...s, city }));
                        navigate(`/properties?search=${encodeURIComponent(city)}`);
                      }}
                      className="px-3 py-1 rounded-md text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-gold-500 hover:text-gold-600 transition-colors"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* METRICS STRIP */}
      <section className="py-16 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800" ref={statsRef}>
        <div className="container-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {dynamicStatsList.map(s => (
              <StatCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} start={statsVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="container-xl">
          <RevealSection>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Streamlined Process</span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">How IRUR Works</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-3 text-base">
                End-to-end property management built for clarity, transparency, and efficiency.
              </p>

              {/* Tab Selector */}
              <div className="inline-flex p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl mt-6 border border-slate-300/60 dark:border-slate-700">
                {(['tenant', 'investor'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === tab
                        ? 'bg-white dark:bg-slate-900 text-gold-600 dark:text-gold-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab === 'tenant' ? 'For Tenants' : 'For Property Investors'}
                  </button>
                ))}
              </div>
            </div>
          </RevealSection>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(activeTab === 'tenant' ? TENANT_STEPS : INVESTOR_STEPS).map((step, i) => (
              <RevealSection key={`${activeTab}-${i}`} delay={`reveal-delay-${i + 1}`}>
                <div className="card-premium p-6 h-full flex flex-col hover-lift">
                  <div className="text-xs font-black text-gold-500 uppercase tracking-widest mb-3">{step.step}</div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg mb-2">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed flex-1">{step.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/how-it-works" className="btn-secondary inline-flex items-center gap-2">
              View Detailed Guide <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED RENTALS */}
      {featuredProps.length > 0 && (
        <section className="py-24 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
          <div className="container-xl">
            <RevealSection>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Available Portfolio</span>
                  <h2 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">Featured Rentals</h2>
                </div>
                <Link to="/properties" className="btn-luxury-outline inline-flex items-center gap-2">
                  View All Listings ({platformStats.availableProperties}) <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </RevealSection>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProps.map((p, i) => (
                <RevealSection key={p.id} delay={`reveal-delay-${(i % 3) + 1}`}>
                  <PropertyCard property={p} />
                </RevealSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COMMUNITIES SHOWCASE */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="container-xl">
          <RevealSection>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Master Neighborhoods</span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">Premier Communities</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">Top-rated Lennar communities across Pennsylvania & Florida.</p>
            </div>
          </RevealSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {COMMUNITIES.map((c, i) => (
              <RevealSection key={c.name} delay={`reveal-delay-${(i % 4) + 1}`}>
                <Link
                  to={`/properties?search=${encodeURIComponent(c.name.replace('Lennar ', ''))}`}
                  className="group relative overflow-hidden rounded-2xl aspect-[3/4] block shadow-subtle border border-slate-200/80 dark:border-slate-800 hover-lift"
                >
                  <img src={c.img} alt={c.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="text-gold-300 text-[10px] font-bold uppercase tracking-wider block mb-0.5">{c.city}</span>
                    <h3 className="text-white font-display font-bold text-sm leading-snug">{c.name}</h3>
                  </div>
                </Link>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* WHY IRUR */}
      <section className="py-24 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <RevealSection>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">The IRUR Difference</span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2 mb-8 leading-tight">
                  Built for Reliability & Total Transparency
                </h2>
                <div className="space-y-6">
                  {[
                    { title: 'Verified Applicant Screening', desc: 'Comprehensive background, credit, and employment verification for guaranteed peace of mind.' },
                    { title: 'Turnkey Property Operations', desc: 'From listing placement to lease execution and maintenance tickets — IRUR manages everything.' },
                    { title: 'Data-Driven Investor Reports', desc: 'Clear performance & accounting reports for property owners; fair transparent lease terms for tenants.' },
                    { title: 'High-Demand Locations', desc: 'Exclusive focus on top master-planned developments in Pennsylvania and Florida.' },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4 items-start hover-lift p-4 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-gold-50 dark:bg-gold-950 text-gold-600 dark:text-gold-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-gold-200 dark:border-gold-800/60">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-slate-900 dark:text-white text-base mb-1">{item.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>

            <RevealSection delay="reveal-delay-2">
              <div className="rounded-3xl overflow-hidden aspect-4/3 border border-slate-200 dark:border-slate-800 shadow-premium-lg hover-glow">
                <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80" alt="Luxury home" className="w-full h-full object-cover" />
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="container-xl">
          <RevealSection>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Client Reviews</span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">What Our Clients Say</h2>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <RevealSection key={t.name} delay={`reveal-delay-${i + 1}`}>
                <div className="card-premium p-8 h-full flex flex-col justify-between hover-lift">
                  <div className="text-gold-500 text-2xl mb-4">"</div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">{t.quote}</p>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="font-display font-bold text-slate-900 dark:text-white text-sm">{t.name}</div>
                    <div className="text-xs text-slate-400 font-medium">{t.role}</div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container-xl">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-10 md:p-14 text-center text-white border border-slate-800 shadow-2xl hover-glow">
            <RevealSection>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-3">Ready to Find Your Next Home?</h2>
              <p className="text-slate-300 text-base mb-8 max-w-xl mx-auto">
                Connect with the IRUR team today. Schedule a consultation or explore available rental properties directly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/book-session" className="btn-luxury py-3.5 px-8">
                  <Calendar className="w-4 h-4" />
                  Book a Free Session
                </Link>
                <Link to="/properties" className="btn-luxury-outline py-3.5 px-8">
                  <HomeIcon className="w-4 h-4" />
                  Browse Rentals
                </Link>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
