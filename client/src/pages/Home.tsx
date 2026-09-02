import { useState, useEffect, useMemo, useRef } from 'react';
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Home as HomeIcon, Search, ArrowRight, ChevronDown,
  ShieldCheck, Settings2, BarChart3, MapPin, Users, Briefcase, Building2, DollarSign, BedDouble, Hash, X,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import SegmentedTabs from '../components/SegmentedTabs';
import type { SegmentedTab } from '../components/SegmentedTabs';
import TestimonialCarousel from '../components/TestimonialCarousel';
import { propertiesApi } from '../api/client';
import type { Property } from '../types';
import { useScrollReveal, useCountUp } from '../hooks/useScrollReveal';
import { useTilt } from '../hooks/useTilt';

const HERO_VIDEO = '/cleaned.mp4';
const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&q=60';
const MAX_SUGGESTIONS = 8;

const TENANT_STEPS = [
  { step: '01', title: 'Search & Discover', desc: 'Browse available properties filtered by your needs — location, budget, bedrooms, and lifestyle.' },
  { step: '02', title: 'Book a Session', desc: 'Schedule a free consultation with our team to discuss your requirements and tour properties.' },
  { step: '03', title: 'Sign Your Lease', desc: 'IRENTURENT handles all rental agreements, background checks, and move-in paperwork seamlessly.' },
  { step: '04', title: 'Move In & Relax', desc: 'Enjoy your new home with transparent management, easy communication, and ongoing support.' },
];

const INVESTOR_STEPS = [
  { step: '01', title: 'Submit Your Property', desc: 'Share your property details with IRENTURENT. We assess and onboard eligible investment properties.' },
  { step: '02', title: 'IRENTURENT Takes Over', desc: 'We handle listing, tenant screening, lease signing, and ongoing management so you don\'t have to.' },
  { step: '03', title: 'Tenants Placed', desc: 'IRENTURENT places verified, reliable tenants. Occupancy is maximized while your risk is minimized.' },
  { step: '04', title: 'Earn Passive Revenue', desc: 'Collect steady rental income with full transparency. View performance reports anytime.' },
];

const TESTIMONIALS = [
  { name: 'Eillen', role: 'Pottstown, PA', title: 'Exceeded my expectations', quote: 'I\'m extremely satisfied with my patio/deck. I can finally use it after all these years...' },
  { name: 'Danielle', role: 'Phoenixville, PA', title: 'In love with my new kitchen!', quote: 'Words can\'t describe how happy I am with my new kitchen. Amazing home in the excellent neighborhood.' },
  { name: 'Amanda', role: 'Phoenixville, PA', title: 'I highly recommend', quote: 'Such a skilled and highly trained team. Not to mention the execution is outstanding. I\'ve even recommended friends and family.' },
  { name: 'John & Emily', role: 'Spring City, PA', title: 'Kind, dependable & punctual', quote: 'The team were such kind, dependable, and not to mention punctual people! I\'ll definitely be contracting these guys again.' },
  { name: 'Rohith & Prashanth', role: 'Boston, MA', title: 'The Best', quote: 'Couldn\'t have asked for a better investment team. When we met with Ram & Laxman, they answered all our questions and went above and beyond in meeting our needs and wants.' },
  { name: 'Rama. C', role: 'Huntingdon Valley, PA', title: 'Awesome Team', quote: 'Our common friend introduced me with Rama & Team for a great investment opportunities and provided every detailed information with high transparency and respect.' },
];

const COMMUNITIES = [
  { name: 'Lennar River Pointe', city: 'Bridgeport, PA', img: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&q=80' },
  { name: 'Lennar The Villages', city: 'Spring City, PA', img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&q=80' },
  { name: 'Lennar SteelPointe', city: 'Phoenixville, PA', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&q=80' },
  { name: 'Lennar Whispering Woods', city: 'Pottstown, PA', img: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=500&q=80' },
  { name: 'Grand Isles at Beach Walk', city: 'St. Johns, FL', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80' },
];

const FEATURES = [
  {
    title: 'Verified Applicant Screening',
    desc: 'Comprehensive background, credit, and employment verification for guaranteed peace of mind.',
    icon: ShieldCheck,
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80',
  },
  {
    title: 'Turnkey Property Operations',
    desc: 'From listing placement to lease execution and maintenance tickets — IRENTURENT manages everything.',
    icon: Settings2,
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80',
  },
  {
    title: 'Data-Driven Investor Reports',
    desc: 'Clear performance & accounting reports for property owners; fair transparent lease terms for tenants.',
    icon: BarChart3,
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80',
  },
  {
    title: 'High-Demand Locations',
    desc: 'Exclusive focus on top master-planned developments in Pennsylvania and Florida.',
    icon: MapPin,
    img: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=900&q=80',
  },
];

type Audience = 'tenant' | 'investor';

const AUDIENCE_TABS: SegmentedTab<Audience>[] = [
  { value: 'tenant', label: 'For Tenants', icon: <Users className="w-3.5 h-3.5" /> },
  { value: 'investor', label: 'For Property Investors', icon: <Briefcase className="w-3.5 h-3.5" /> },
];

const STATUS_ORDER: Record<string, number> = { available: 0, occupied: 1, maintenance: 2 };

interface StatsData {
  totalProperties: number;
  availableProperties: number;
  occupiedProperties: number;
  communitiesCount: number;
  statesCount: number;
  citiesCount: number;
}

interface LocationSuggestion {
  key: string;
  kind: 'city' | 'community' | 'zip';
  label: string;
  sub: string;
  /** City used to scope the property list. */
  city: string;
  /** Value passed to the listing page's location filter. */
  location: string;
}

function StatCounter({ value, suffix, label, start }: { value: number; suffix: string; label: string; start: boolean }) {
  const count = useCountUp(value, 1500, start);
  return (
    <div className="card p-6 text-center hover-lift group">
      <div className="font-display text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-1 tabular-nums">
        <span>{count}</span>
        <span className="text-gold-500 inline-block group-hover:scale-125 transition-transform duration-300">{suffix}</span>
      </div>
      <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</div>
    </div>
  );
}

function RevealSection({ children, delay = '', className = '' }: { children: ReactNode; delay?: string; className?: string }) {
  const { ref, inView } = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${delay} ${inView ? 'in-view' : ''} ${className}`}>
      {children}
    </div>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent text-gold-600 dark:text-gold-400 font-bold">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

function CommunityCard({ name, city, img }: { name: string; city: string; img: string }) {
  const tilt = useTilt<HTMLAnchorElement>(7, 6);
  return (
    <Link
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      to={`/properties?search=${encodeURIComponent(name.replace('Lennar ', ''))}`}
      className="tilt-card group relative overflow-hidden rounded-2xl aspect-[3/4] block shadow-subtle border border-slate-200/80 dark:border-slate-800 hover:shadow-premium-lg hover:border-gold-500/40 focus-visible-ring"
    >
      <img src={img} alt={name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
        <span className="text-gold-300 text-[10px] font-bold uppercase tracking-wider block mb-0.5">{city}</span>
        <h3 className="text-white font-display font-bold text-sm leading-snug">{name}</h3>
        <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-white/0 group-hover:text-white/90 transition-colors duration-300">
          View rentals <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}

/** One cell of the hero search bar. */
function SearchField({
  id, label, icon, children, className = '', chevron = false,
}: { id: string; label: string; icon: ReactNode; children: ReactNode; className?: string; chevron?: boolean }) {
  return (
    <div className={`relative min-w-0 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 lg:rounded-none lg:bg-transparent dark:lg:bg-transparent ${className}`}>
      <label htmlFor={id} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">
        <span className="text-gold-500">{icon}</span>
        {label}
      </label>
      <div className="relative flex items-center">
        {children}
        {chevron && <ChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
      </div>
    </div>
  );
}

const INPUT_CLASS =
  'w-full bg-transparent border-none outline-none py-1 pr-6 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 disabled:cursor-not-allowed disabled:placeholder-slate-500 truncate';
const SELECT_CLASS =
  'w-full appearance-none bg-transparent border-none outline-none pr-6 py-1 text-sm font-semibold text-slate-900 dark:text-white cursor-pointer truncate';
const LIST_CLASS =
  'absolute left-0 right-0 lg:right-auto lg:min-w-[22rem] top-full mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden zoom-in';

function formatRent(p: Property) {
  return p.rent > 0 ? `$${p.rent.toLocaleString()}/mo` : 'Price on request';
}

/** Beds/baths/sqft line, skipping anything the record doesn't have. */
function formatSpecs(p: Property) {
  const parts: string[] = [];
  if (p.bedrooms > 0) parts.push(`${p.bedrooms} bd`);
  if (p.bathrooms > 0) parts.push(`${p.bathrooms} ba`);
  if (p.sqft) parts.push(`${p.sqft.toLocaleString()} sqft`);
  return parts.length ? parts.join(' · ') : p.property_type || 'Details on request';
}

export default function Home() {
  const [featuredProps, setFeaturedProps] = useState<Property[]>([]);
  const [allProps, setAllProps] = useState<Property[]>([]);
  const [propsLoading, setPropsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Audience>('tenant');
  const [activeFeature, setActiveFeature] = useState(0);
  const [featurePaused, setFeaturePaused] = useState(false);

  const [platformStats, setPlatformStats] = useState<StatsData>({
    totalProperties: 65,
    availableProperties: 8,
    occupiedProperties: 57,
    communitiesCount: 5,
    statesCount: 1,
    citiesCount: 7,
  });

  // Search state: the chosen place + home, and the free text in each typeahead.
  const [search, setSearch] = useState({ city: '', location: '', propertyId: '', maxRent: '', beds: '' });
  const [locQuery, setLocQuery] = useState('');
  const [locOpen, setLocOpen] = useState(false);
  const [locActive, setLocActive] = useState(-1);
  const [propQuery, setPropQuery] = useState('');
  const [propOpen, setPropOpen] = useState(false);
  const [propActive, setPropActive] = useState(-1);

  const navigate = useNavigate();
  const statsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const propertyInputRef = useRef<HTMLInputElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    propertiesApi.getStats()
      .then(stats => {
        if (stats && typeof stats.totalProperties === 'number') setPlatformStats(stats);
      })
      .catch(() => {});

    propertiesApi.getAll({ status: 'available' })
      .then(data => setFeaturedProps(data.slice(0, 6)))
      .catch(() => {});

    // Every property (all statuses) powers the typeahead suggestions.
    propertiesApi.getAll({})
      .then((data: Property[]) => setAllProps(Array.isArray(data) ? data : []))
      .catch(() => setAllProps([]))
      .finally(() => setPropsLoading(false));
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

  // Close suggestion lists when clicking outside the search bar.
  useEffect(() => {
    const onDown = (e: globalThis.MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setLocOpen(false);
        setPropOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // Auto-rotate the "why" feature spotlight unless the user is interacting.
  useEffect(() => {
    if (featurePaused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setActiveFeature(i => (i + 1) % FEATURES.length), 5000);
    return () => clearInterval(t);
  }, [featurePaused]);

  /** Places the user can type: cities, communities, and ZIP codes present in the portfolio. */
  const locationIndex = useMemo<LocationSuggestion[]>(() => {
    const cities = new Map<string, { state: string; total: number; available: number }>();
    const communities = new Map<string, { city: string; state: string; total: number }>();
    const zips = new Map<string, { city: string; state: string; total: number }>();

    allProps.forEach((p) => {
      const validCity = p.city && !/^unknown$/i.test(p.city);
      if (validCity) {
        const c = cities.get(p.city) ?? { state: p.state, total: 0, available: 0 };
        c.total += 1;
        if (p.status === 'available') c.available += 1;
        cities.set(p.city, c);
      }
      if (p.community && validCity) {
        const c = communities.get(p.community) ?? { city: p.city, state: p.state, total: 0 };
        c.total += 1;
        communities.set(p.community, c);
      }
      if (p.zip && validCity) {
        const z = zips.get(p.zip) ?? { city: p.city, state: p.state, total: 0 };
        z.total += 1;
        zips.set(p.zip, z);
      }
    });

    const homes = (n: number) => `${n} ${n === 1 ? 'home' : 'homes'}`;
    const list: LocationSuggestion[] = [];
    [...cities.entries()].sort((a, b) => a[0].localeCompare(b[0])).forEach(([city, c]) => {
      list.push({ key: `city:${city}`, kind: 'city', label: `${city}, ${c.state}`, sub: `${homes(c.total)} · ${c.available} available`, city, location: city });
    });
    [...communities.entries()].sort((a, b) => a[0].localeCompare(b[0])).forEach(([name, c]) => {
      list.push({ key: `community:${name}`, kind: 'community', label: name, sub: `Community · ${c.city}, ${c.state} · ${homes(c.total)}`, city: c.city, location: name });
    });
    [...zips.entries()].sort((a, b) => a[0].localeCompare(b[0])).forEach(([zip, z]) => {
      list.push({ key: `zip:${zip}`, kind: 'zip', label: zip, sub: `${z.city}, ${z.state} · ${homes(z.total)}`, city: z.city, location: zip });
    });
    return list;
  }, [allProps]);

  const cityOptions = useMemo(() => locationIndex.filter((s) => s.kind === 'city'), [locationIndex]);

  /** Only places that match what is being typed. */
  const locationMatches = useMemo(() => {
    const q = locQuery.trim().toLowerCase();
    if (!q) return [];
    const starts: LocationSuggestion[] = [];
    const contains: LocationSuggestion[] = [];
    locationIndex.forEach((s) => {
      const label = s.label.toLowerCase();
      if (label.startsWith(q)) starts.push(s);
      else if (label.includes(q) || s.sub.toLowerCase().includes(q)) contains.push(s);
    });
    return [...starts, ...contains].slice(0, MAX_SUGGESTIONS);
  }, [locQuery, locationIndex]);

  /** Homes in the chosen place, narrowed by price/beds, available first. */
  const cityProperties = useMemo(() => {
    if (!search.city) return [];
    const maxRent = search.maxRent ? Number(search.maxRent) : Infinity;
    const minBeds = search.beds ? Number(search.beds) : 0;
    return allProps
      .filter((p) => p.city === search.city && (p.rent || 0) <= maxRent && (p.bedrooms || 0) >= minBeds)
      .sort((a, b) => (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3) || (a.rent || 0) - (b.rent || 0));
  }, [allProps, search.city, search.maxRent, search.beds]);

  /** Homes matching the typed address within the chosen place. */
  const propertyMatches = useMemo(() => {
    const q = propQuery.trim().toLowerCase();
    const list = q
      ? cityProperties.filter((p) => `${p.address} ${p.title} ${p.zip}`.toLowerCase().includes(q))
      : cityProperties;
    return list.slice(0, MAX_SUGGESTIONS);
  }, [cityProperties, propQuery]);

  // Drop a chosen home if price/beds filters no longer include it.
  useEffect(() => {
    if (search.propertyId && !cityProperties.some((p) => String(p.id) === search.propertyId)) {
      setSearch((s) => ({ ...s, propertyId: '' }));
      setPropQuery('');
    }
  }, [cityProperties, search.propertyId]);

  useEffect(() => { setLocActive(-1); }, [locationMatches]);
  useEffect(() => { setPropActive(-1); }, [propertyMatches]);

  const pickLocation = (s: LocationSuggestion) => {
    setSearch((prev) => ({ ...prev, city: s.city, location: s.location, propertyId: '' }));
    setLocQuery(s.label);
    setLocOpen(false);
    setPropQuery('');
    setPropOpen(true);
    window.setTimeout(() => propertyInputRef.current?.focus(), 50);
  };

  const clearLocation = () => {
    setSearch((prev) => ({ ...prev, city: '', location: '', propertyId: '' }));
    setLocQuery('');
    setPropQuery('');
    setLocOpen(false);
    setPropOpen(false);
  };

  const onLocationChange = (value: string) => {
    setLocQuery(value);
    setLocOpen(value.trim().length > 0);
    // Typing again invalidates the previous pick.
    if (search.city) {
      setSearch((prev) => ({ ...prev, city: '', location: '', propertyId: '' }));
      setPropQuery('');
    }
  };

  const onLocationKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { setLocOpen(false); return; }
    if (!locOpen || locationMatches.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setLocActive((i) => (i + 1) % locationMatches.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setLocActive((i) => (i - 1 + locationMatches.length) % locationMatches.length); }
    else if (e.key === 'Enter' && locActive >= 0) { e.preventDefault(); pickLocation(locationMatches[locActive]); }
  };

  const pickProperty = (p: Property) => {
    setSearch((prev) => ({ ...prev, propertyId: String(p.id) }));
    setPropQuery(p.address);
    setPropOpen(false);
  };

  const onPropertyChange = (value: string) => {
    setPropQuery(value);
    setPropOpen(true);
    if (search.propertyId) setSearch((prev) => ({ ...prev, propertyId: '' }));
  };

  const onPropertyKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { setPropOpen(false); return; }
    if (!propOpen || propertyMatches.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setPropActive((i) => (i + 1) % propertyMatches.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setPropActive((i) => (i - 1 + propertyMatches.length) % propertyMatches.length); }
    else if (e.key === 'Enter' && propActive >= 0) { e.preventDefault(); pickProperty(propertyMatches[propActive]); }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLocOpen(false);
    setPropOpen(false);
    if (search.propertyId) {
      navigate(`/properties/${search.propertyId}`);
      return;
    }
    const params = new URLSearchParams();
    if (search.location) {
      params.set('location', search.location);
      params.set('status', 'all');
    } else if (locQuery.trim()) {
      params.set('search', locQuery.trim());
    }
    if (search.maxRent) params.set('maxRent', search.maxRent);
    if (search.beds) params.set('beds', search.beds);
    const qs = params.toString();
    navigate(qs ? `/properties?${qs}` : '/properties');
  };

  const scrollToStats = () => statsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Values come straight from the API so the labels never contradict the numbers.
  const dynamicStatsList = [
    { value: platformStats.totalProperties, suffix: '+', label: 'Properties Managed' },
    { value: platformStats.availableProperties, suffix: '', label: 'Available Rentals' },
    { value: platformStats.citiesCount, suffix: '', label: 'Cities Covered' },
    { value: platformStats.statesCount, suffix: '', label: platformStats.statesCount === 1 ? 'State Covered' : 'States Covered' },
  ];

  const steps = activeTab === 'tenant' ? TENANT_STEPS : INVESTOR_STEPS;
  const searchLabel = search.propertyId ? 'View Home' : 'Search';
  const locationHasQuery = locQuery.trim().length > 0;
  const showLocationList = locOpen && locationHasQuery && !search.city;
  const showPropertyList = propOpen && !!search.city;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Navbar />

      {/* HERO */}
      <section className="relative flex min-h-[100svh] min-h-[100dvh] items-center overflow-hidden border-b border-slate-200/80 dark:border-slate-800 pt-[max(6.25rem,calc(env(safe-area-inset-top)+5.25rem))] pb-20 sm:pt-[max(7.25rem,calc(env(safe-area-inset-top)+6.25rem))] sm:pb-24 lg:pb-28">
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
          <div className="absolute inset-0 bg-slate-950/60 sm:bg-slate-950/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-slate-950/85" />
        </div>

        <div className="container-xl relative z-10 w-full">
          <div className="mx-auto max-w-5xl px-0 text-center sm:px-2">

            <div className="hero-in inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white/90 text-xs font-semibold mb-8 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
              <span className="tracking-wide">Premier Rental Properties Across PA & FL</span>
            </div>

            <h1
              className="hero-in mx-auto max-w-4xl font-display font-extrabold text-white leading-[1.08] tracking-tight mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] text-[clamp(2.5rem,5.2vw,3.85rem)]"
              style={{ '--d': '0.12s' } as CSSProperties}
            >
              <span className="block text-balance">Modern Rental Homes.</span>
              <span className="block text-balance pb-1 bg-gradient-to-r from-gold-400 via-gold-500 to-amber-400 bg-clip-text text-transparent">
                Professionally Managed.
              </span>
            </h1>

            <p className="hero-in text-white/90 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] font-medium" style={{ '--d': '0.24s' } as CSSProperties}>
              Connecting high-caliber rental properties with trusted tenants across Pennsylvania and Florida's premier master-planned communities.
            </p>

            {/* SEARCH: typeahead place -> typeahead home, plus price & beds */}
            <div className="hero-in relative max-w-5xl mx-auto text-left" style={{ '--d': '0.36s' } as CSSProperties}>
              <form
                ref={formRef}
                onSubmit={handleSearch}
                role="search"
                aria-label="Find a rental"
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/80 p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.35fr_1.55fr_1fr_0.8fr_auto] gap-1.5 lg:gap-0 items-stretch lg:divide-x lg:divide-slate-200 dark:lg:divide-slate-700/80"
              >
                {/* Location typeahead */}
                <SearchField id="hero-location" label="Location" icon={<MapPin className="w-3 h-3" />}>
                  <input
                    id="hero-location"
                    type="text"
                    value={locQuery}
                    onChange={(e) => onLocationChange(e.target.value)}
                    onFocus={() => { if (locationHasQuery && !search.city) setLocOpen(true); }}
                    onKeyDown={onLocationKeyDown}
                    placeholder={propsLoading ? 'Loading…' : 'City, community, or ZIP'}
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={showLocationList}
                    aria-controls="hero-location-list"
                    aria-autocomplete="list"
                    aria-activedescendant={showLocationList && locActive >= 0 ? `hero-location-${locActive}` : undefined}
                    className={INPUT_CLASS}
                  />
                  {locationHasQuery && (
                    <button
                      type="button"
                      onClick={clearLocation}
                      aria-label="Clear location"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {showLocationList && (
                    <div id="hero-location-list" role="listbox" className={LIST_CLASS}>
                      {locationMatches.length > 0 ? (
                        <ul className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                          {locationMatches.map((s, i) => {
                            const Icon = s.kind === 'city' ? MapPin : s.kind === 'community' ? Building2 : Hash;
                            return (
                              <li key={s.key}>
                                <button
                                  type="button"
                                  id={`hero-location-${i}`}
                                  role="option"
                                  aria-selected={i === locActive}
                                  onMouseEnter={() => setLocActive(i)}
                                  onClick={() => pickLocation(s)}
                                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                                    i === locActive ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/70'
                                  }`}
                                >
                                  <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-gold-500 flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-4 h-4" />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-semibold text-slate-900 dark:text-white truncate">
                                      <Highlight text={s.label} query={locQuery} />
                                    </span>
                                    <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">{s.sub}</span>
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="px-4 py-4 text-sm">
                          <p className="font-semibold text-slate-900 dark:text-white">No rentals found for “{locQuery.trim()}”</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            We currently list homes in {cityOptions.slice(0, 4).map((c) => c.city).join(', ')}
                            {cityOptions.length > 4 ? ` and ${cityOptions.length - 4} more` : ''}.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </SearchField>

                {/* Property typeahead (scoped to the chosen place) */}
                <SearchField
                  id="hero-property"
                  label={search.city ? `Home in ${search.city}` : 'Home'}
                  icon={<Building2 className="w-3 h-3" />}
                >
                  <input
                    id="hero-property"
                    ref={propertyInputRef}
                    type="text"
                    value={propQuery}
                    onChange={(e) => onPropertyChange(e.target.value)}
                    onFocus={() => { if (search.city) setPropOpen(true); }}
                    onKeyDown={onPropertyKeyDown}
                    disabled={!search.city}
                    placeholder={search.city ? 'Any home, or type an address' : 'Choose a location first'}
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={showPropertyList}
                    aria-controls="hero-property-list"
                    aria-autocomplete="list"
                    aria-activedescendant={showPropertyList && propActive >= 0 ? `hero-property-${propActive}` : undefined}
                    className={INPUT_CLASS}
                  />
                  {propQuery && (
                    <button
                      type="button"
                      onClick={() => { setPropQuery(''); setSearch((s) => ({ ...s, propertyId: '' })); propertyInputRef.current?.focus(); }}
                      aria-label="Clear home"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {showPropertyList && (
                    <div id="hero-property-list" role="listbox" className={`${LIST_CLASS} lg:min-w-[26rem]`}>
                      {propertyMatches.length > 0 ? (
                        <>
                          <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                            {propertyMatches.map((p, i) => (
                              <li key={p.id}>
                                <button
                                  type="button"
                                  id={`hero-property-${i}`}
                                  role="option"
                                  aria-selected={i === propActive}
                                  onMouseEnter={() => setPropActive(i)}
                                  onClick={() => pickProperty(p)}
                                  className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                                    i === propActive ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/70'
                                  }`}
                                >
                                  <img
                                    src={p.photos?.[0] || PLACEHOLDER_IMG}
                                    alt=""
                                    className="w-11 h-9 rounded-md object-cover flex-shrink-0 bg-slate-200 dark:bg-slate-800"
                                    loading="lazy"
                                  />
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-semibold text-slate-900 dark:text-white truncate">
                                      <Highlight text={p.address} query={propQuery} />
                                    </span>
                                    <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">
                                      {formatSpecs(p)}
                                    </span>
                                  </span>
                                  <span className="text-right flex-shrink-0">
                                    <span className="block text-sm font-bold text-slate-900 dark:text-white tabular-nums">{formatRent(p)}</span>
                                    <span className={`block text-[10px] font-semibold uppercase tracking-wider ${
                                      p.status === 'available' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                                    }`}>
                                      {p.status}
                                    </span>
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                          {cityProperties.length > propertyMatches.length && (
                            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60">
                              Showing {propertyMatches.length} of {cityProperties.length}. Keep typing to narrow, or press Search to see all.
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="px-4 py-4 text-sm">
                          <p className="font-semibold text-slate-900 dark:text-white">No homes match “{propQuery.trim()}”</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try a different street, or adjust price and beds.</p>
                        </div>
                      )}
                    </div>
                  )}
                </SearchField>

                <SearchField id="hero-budget" label="Max Price" icon={<DollarSign className="w-3 h-3" />} chevron>
                  <select
                    id="hero-budget"
                    value={search.maxRent}
                    onChange={(e) => setSearch((s) => ({ ...s, maxRent: e.target.value }))}
                    className={SELECT_CLASS}
                  >
                    <option value="" className="dark:bg-slate-900">Any</option>
                    <option value="2500" className="dark:bg-slate-900">Up to $2,500</option>
                    <option value="3000" className="dark:bg-slate-900">Up to $3,000</option>
                    <option value="3500" className="dark:bg-slate-900">Up to $3,500</option>
                    <option value="4000" className="dark:bg-slate-900">Up to $4,000</option>
                  </select>
                </SearchField>

                <SearchField id="hero-beds" label="Beds" icon={<BedDouble className="w-3 h-3" />} chevron>
                  <select
                    id="hero-beds"
                    value={search.beds}
                    onChange={(e) => setSearch((s) => ({ ...s, beds: e.target.value }))}
                    className={SELECT_CLASS}
                  >
                    <option value="" className="dark:bg-slate-900">Any</option>
                    <option value="2" className="dark:bg-slate-900">2+</option>
                    <option value="3" className="dark:bg-slate-900">3+</option>
                    <option value="4" className="dark:bg-slate-900">4+</option>
                  </select>
                </SearchField>

                <div className="sm:col-span-2 lg:col-span-1 flex items-stretch lg:pl-2">
                  <button
                    type="submit"
                    className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#E98A00] hover:bg-[#F29A0A] text-white text-sm font-bold shadow-md transition-all duration-200 active:scale-[0.98] whitespace-nowrap"
                  >
                    {search.propertyId ? <ArrowRight className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                    {searchLabel}
                  </button>
                </div>
              </form>

              {cityOptions.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs text-white/70 font-medium">Popular:</span>
                  {cityOptions.slice(0, 5).map((c) => {
                    const active = search.city === c.city;
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => (active ? clearLocation() : pickLocation(c))}
                        aria-pressed={active}
                        className={`px-3 py-1 rounded-md text-xs font-semibold border transition-colors duration-200 ${
                          active
                            ? 'bg-gold-500 border-gold-500 text-white'
                            : 'bg-white/10 border-white/15 text-white/90 hover:bg-white/20 hover:border-white/30'
                        }`}
                      >
                        {c.city}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Scroll cue */}
        <button
          type="button"
          onClick={scrollToStats}
          aria-label="Scroll to explore"
          className="hero-in absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/70 hover:text-gold-300 transition-colors"
          style={{ '--d': '0.9s' } as CSSProperties}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Explore</span>
          <ChevronDown className="w-5 h-5 scroll-cue" />
        </button>
      </section>

      {/* METRICS */}
      <section className="py-20 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 relative overflow-hidden scroll-mt-24" ref={statsRef}>
        <div className="container-xl relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {dynamicStatsList.map((s) => (
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
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">How IRENTURENT Works</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-3 text-base">
                End-to-end property management built for clarity, transparency, and efficiency.
              </p>
              <SegmentedTabs<Audience> tabs={AUDIENCE_TABS} value={activeTab} onChange={(tab) => setActiveTab(tab)} className="mt-6" ariaLabel="Choose your journey" />
            </div>
          </RevealSection>

          <RevealSection>
            <div className="relative">
              <div className="hidden lg:block absolute top-[2.75rem] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" aria-hidden="true" />
              <div key={activeTab} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((step, i) => (
                  <div key={step.step} className="stagger-in" style={{ '--i': i } as CSSProperties}>
                    <div className="card-premium p-6 h-full flex flex-col hover-lift group">
                      <div className="w-10 h-10 rounded-full border-2 border-gold-500 text-gold-500 group-hover:bg-gold-500 group-hover:text-white flex items-center justify-center font-display font-black text-xs mb-4 transition-colors duration-300">
                        {step.step}
                      </div>
                      <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg mb-2">{step.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed flex-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>

          <div className="text-center mt-12">
            <Link to="/how-it-works" className="btn-secondary inline-flex items-center gap-2 group">
              View Detailed Guide <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Hover a photo to flip through the gallery. Tap the heart to save a home for later.</p>
                </div>
                <Link to="/properties" className="btn-luxury-outline inline-flex items-center gap-2 group">
                  View All Listings ({platformStats.availableProperties}) <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </RevealSection>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProps.map((p, i) => (
                <RevealSection key={p.id} delay={`reveal-delay-${(i % 3) + 1}`} className="h-full">
                  <PropertyCard property={p} />
                </RevealSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COMMUNITIES */}
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
                <CommunityCard {...c} />
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* WHY IRENTURENT */}
      <section className="py-28 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
        <div className="container-xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <RevealSection>
              <div onMouseEnter={() => setFeaturePaused(true)} onMouseLeave={() => setFeaturePaused(false)}>
                <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">The IRENTURENT Difference</span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2 mb-10 leading-tight">
                  Built for Reliability & Total Transparency
                </h2>
                <div className="space-y-3" role="tablist" aria-label="Why IRENTURENT">
                  {FEATURES.map((item, i) => {
                    const Icon = item.icon;
                    const active = i === activeFeature;
                    return (
                      <button
                        type="button"
                        role="tab"
                        aria-selected={active}
                        key={item.title}
                        onClick={() => setActiveFeature(i)}
                        onMouseEnter={() => setActiveFeature(i)}
                        onFocus={() => setActiveFeature(i)}
                        className={`w-full text-left flex gap-4 items-start p-5 rounded-2xl border transition-all duration-300 group ${
                          active
                            ? 'bg-slate-50 dark:bg-slate-900/70 border-gold-500/40 -translate-y-0.5'
                            : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all duration-300 ${
                          active
                            ? 'bg-gradient-to-br from-gold-500 to-gold-600 text-white border-gold-500 scale-110'
                            : 'bg-gradient-to-br from-gold-50 to-amber-50 dark:from-gold-950 dark:to-amber-950 text-gold-600 dark:text-gold-400 border-gold-200 dark:border-gold-800/60'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg mb-1.5">{item.title}</h3>
                          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                          <span className={`block h-0.5 mt-3 rounded-full bg-gradient-to-r from-gold-500 to-amber-400 origin-left transition-transform duration-500 ${active ? 'scale-x-100' : 'scale-x-0'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </RevealSection>

            <RevealSection delay="reveal-delay-2">
              <div className="rounded-3xl overflow-hidden aspect-[4/3] border border-slate-200 dark:border-slate-800 shadow-2xl relative group bg-slate-200 dark:bg-slate-800">
                {FEATURES.map((f, i) => (
                  <img
                    key={f.title}
                    src={f.img}
                    alt={f.title}
                    loading="lazy"
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
                      i === activeFeature ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                    }`}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between gap-4">
                  <div key={activeFeature} className="fade-swap">
                    <span className="text-gold-300 text-[10px] font-bold uppercase tracking-widest block mb-1">0{activeFeature + 1} / 0{FEATURES.length}</span>
                    <h3 className="text-white font-display font-bold text-lg leading-snug">{FEATURES[activeFeature].title}</h3>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0" aria-hidden="true">
                    {FEATURES.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        tabIndex={-1}
                        onClick={() => setActiveFeature(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === activeFeature ? 'w-6 bg-gold-400' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="container-xl">
          <RevealSection>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Real stories from real clients</span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">What Our Clients Say</h2>
            </div>
          </RevealSection>

          <RevealSection delay="reveal-delay-1">
            <TestimonialCarousel items={TESTIMONIALS} />
          </RevealSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="container-xl">
          <div className="relative rounded-3xl bg-[#061B20] border border-white/10 p-12 md:p-16 text-center text-white overflow-hidden shadow-xl">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#B88952] via-[#D2A66F] to-[#B88952]" aria-hidden="true" />

            <RevealSection>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D2A66F]/40 text-[#D2A66F] text-[11px] font-bold uppercase tracking-widest mb-6">
                Free consultation
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">Ready to Find Your Next Home?</h2>
              <p className="text-[#D7DDE0]/80 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                Connect with the IRENTURENT team today. Schedule a consultation or explore available rental properties directly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/book-session"
                  className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-[#E98A00] hover:bg-[#F29A0A] text-white text-base font-bold transition-all duration-200 active:scale-[0.98]"
                >
                  <Calendar className="w-5 h-5" />
                  Book a Free Session
                </Link>
                <Link to="/properties" className="btn-outline-white py-4 px-10 text-base font-bold hover:border-[#D2A66F] hover:text-[#D2A66F]">
                  <HomeIcon className="w-5 h-5" />
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
