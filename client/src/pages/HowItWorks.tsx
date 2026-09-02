import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, CalendarCheck, Home, ShieldCheck, FileText, Key,
  Building, Ruler, PenLine, Camera, UserCheck, TrendingUp,
  ChevronDown, Users, Briefcase, MessageCircle,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SegmentedTabs from '../components/SegmentedTabs';
import type { SegmentedTab } from '../components/SegmentedTabs';

const TENANT_JOURNEY = [
  { step: '01', title: 'Search Properties', desc: 'Browse our curated selection of managed properties filtered by location, budget, and your lifestyle preferences. All listings are verified and up-to-date.', icon: <Search className="w-5 h-5" /> },
  { step: '02', title: 'Book a Consultation', desc: 'Schedule a free session with our tenant relations team. We\'ll help match you with the right property and walk you through the entire process.', icon: <CalendarCheck className="w-5 h-5" /> },
  { step: '03', title: 'Tour Your Top Picks', desc: 'Visit the properties you love, either in-person or virtually. Our team will be there to answer all your questions.', icon: <Home className="w-5 h-5" /> },
  { step: '04', title: 'Apply & Get Approved', desc: 'Complete a simple application. IRENTURENT handles background checks, credit review, and verification — transparently and fairly.', icon: <ShieldCheck className="w-5 h-5" /> },
  { step: '05', title: 'Sign Your Lease', desc: 'Review and sign your rental agreement digitally. IRENTURENT ensures all terms are clear, fair, and legally sound.', icon: <FileText className="w-5 h-5" /> },
  { step: '06', title: 'Move In & Thrive', desc: 'Collect your keys and settle in! Pay rent online, submit maintenance requests, and access your lease documents anytime.', icon: <Key className="w-5 h-5" /> },
];

const INVESTOR_JOURNEY = [
  { step: '01', title: 'Submit Your Property', desc: 'Share details about your property with IRENTURENT. We review location, condition, and market potential to assess suitability for our managed portfolio.', icon: <Building className="w-5 h-5" /> },
  { step: '02', title: 'Property Assessment', desc: 'Our team conducts an inspection and market analysis. We\'ll provide a recommended rental price and estimated occupancy timeline.', icon: <Ruler className="w-5 h-5" /> },
  { step: '03', title: 'Sign Management Agreement', desc: 'Agree to IRENTURENT\'s management terms. We handle everything — you retain ownership and earn passive income.', icon: <PenLine className="w-5 h-5" /> },
  { step: '04', title: 'Listing & Photography', desc: 'Professional photography, detailed descriptions, and optimized listings go live across our platform for maximum visibility.', icon: <Camera className="w-5 h-5" /> },
  { step: '05', title: 'Qualified Tenants Placed', desc: 'IRENTURENT screens all applicants. Only verified, financially stable tenants are placed in your property.', icon: <UserCheck className="w-5 h-5" /> },
  { step: '06', title: 'Earn & Track Revenue', desc: 'Receive consistent rental payments. Access detailed monthly reports on occupancy, revenue, expenses, and your overall ROI.', icon: <TrendingUp className="w-5 h-5" /> },
];

const FAQ_TENANT = [
  { q: 'What does the application process involve?', a: 'IRENTURENT conducts a standard background and credit check, employment verification, and rental history review. The process typically takes 24-48 hours.' },
  { q: 'Can I have pets in my rental?', a: 'Some properties are pet-friendly. Filter by "Pet Friendly" when browsing, and confirm details with our team during your consultation.' },
  { q: 'How do I pay rent?', a: 'In Phase 2, rent can be paid online through the Tenant Portal. Currently, IRENTURENT will provide payment instructions at lease signing.' },
  { q: 'What happens if something needs repair?', a: 'IRENTURENT manages all maintenance. Report issues to us directly and we coordinate repairs with licensed vendors at no cost to you for standard maintenance.' },
];

const FAQ_INVESTOR = [
  { q: 'What percentage does IRENTURENT take?', a: 'IRENTURENT charges a competitive management fee based on the property and location. This is discussed transparently during your onboarding call.' },
  { q: 'How quickly can my property be occupied?', a: 'For eligible properties in our communities, occupancy typically occurs within 2-6 weeks of listing, depending on market conditions.' },
  { q: 'Do I have any say in tenant selection?', a: 'IRENTURENT handles tenant screening per fair housing laws. You will be informed when a qualified tenant is placed, but tenant selection decisions are made by IRENTURENT.' },
  { q: 'What reports will I receive?', a: 'Monthly performance reports covering rent collection, occupancy, maintenance costs, and net revenue. Full transparency is core to what we do.' },
];

type Audience = 'tenant' | 'investor';

const TABS: SegmentedTab<Audience>[] = [
  { value: 'tenant', label: 'For Tenants', icon: <Users className="w-3.5 h-3.5" /> },
  { value: 'investor', label: 'For Property Investors', icon: <Briefcase className="w-3.5 h-3.5" /> },
];

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<Audience>('tenant');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const journey = activeTab === 'tenant' ? TENANT_JOURNEY : INVESTOR_JOURNEY;
  const faqs = activeTab === 'tenant' ? FAQ_TENANT : FAQ_INVESTOR;

  const switchTab = (tab: Audience) => {
    setActiveTab(tab);
    setOpenFaq(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute -top-24 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" aria-hidden="true" />
        <div className="container-xl text-center relative">
          <span className="hero-in text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Step-by-Step Overview</span>
          <h1 className="hero-in font-display text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-1 mb-4" style={{ '--d': '0.1s' } as CSSProperties}>How IRENTURENT Works</h1>
          <p className="hero-in text-slate-600 dark:text-slate-400 text-base max-w-xl mx-auto leading-relaxed" style={{ '--d': '0.2s' } as CSSProperties}>
            A transparent, reliable process designed to make renting and managing property straightforward.
          </p>
          <div className="hero-in" style={{ '--d': '0.3s' } as CSSProperties}>
            <SegmentedTabs tabs={TABS} value={activeTab} onChange={switchTab} className="mt-8" ariaLabel="Choose your journey" />
          </div>
        </div>
      </section>

      {/* Journey timeline */}
      <section className="py-20">
        <div className="container-xl max-w-4xl">
          <div className="relative">
            <div className="timeline-line absolute left-6 sm:left-7 top-6 bottom-6 w-px" aria-hidden="true" />
            <ol key={activeTab} className="space-y-6">
              {journey.map((step, i) => (
                <li key={step.step} className="stagger-in relative flex items-start gap-5 sm:gap-6" style={{ '--i': i } as CSSProperties}>
                  <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 text-white border-4 border-slate-50 dark:border-slate-900 flex items-center justify-center font-display font-black text-base sm:text-lg flex-shrink-0 shadow-premium">
                    {step.step}
                  </div>
                  <div className="card-premium p-6 flex-1 hover-lift group">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="w-8 h-8 rounded-lg bg-gold-50 dark:bg-gold-950/40 border border-gold-200 dark:border-gold-800/60 text-gold-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {step.icon}
                      </span>
                      <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg">{step.title}</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800">
        <div className="container-xl max-w-3xl">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">FAQ</span>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">Frequently Asked Questions</h2>
          </div>
          <div key={activeTab} className="space-y-4">
            {faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={faq.q}
                  className={`stagger-in card-premium overflow-hidden transition-colors ${open ? 'border-gold-500/40' : ''}`}
                  style={{ '--i': i } as CSSProperties}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    aria-controls={`faq-panel-${activeTab}-${i}`}
                    id={`faq-button-${activeTab}-${i}`}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      open
                        ? 'bg-gold-500 border-gold-500 text-white rotate-180'
                        : 'border-slate-300 dark:border-slate-700 text-gold-500'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>
                  <div
                    id={`faq-panel-${activeTab}-${i}`}
                    role="region"
                    aria-labelledby={`faq-button-${activeTab}-${i}`}
                    className={`accordion-panel ${open ? 'open' : ''}`}
                  >
                    <div>
                      <p className="px-5 pb-5 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Still have questions?{' '}
            <Link to="/contact" className="inline-flex items-center gap-1 font-semibold text-gold-600 dark:text-gold-400 hover:underline">
              <MessageCircle className="w-4 h-4" /> Talk to our team
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-900 dark:bg-slate-850 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 via-transparent to-gold-500/10" aria-hidden="true" />
        <div className="container-xl text-center max-w-2xl relative">
          <h2 className="font-display text-3xl font-extrabold text-white mb-3">Ready to Take the Next Step?</h2>
          <p className="text-slate-300 text-sm mb-8">Connect with our team to discuss tenant placement or property management solutions.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <Link to="/properties" className="btn-luxury">
              <Home className="w-4 h-4" />
              Browse Rentals
            </Link>
            <Link to={`/book-session?type=${activeTab === 'tenant' ? 'renting' : 'investing'}`} className="btn-luxury-outline">
              <CalendarCheck className="w-4 h-4" />
              Book a Session
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
