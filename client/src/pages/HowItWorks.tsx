import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TENANT_JOURNEY = [
  { step: '01', title: 'Search Properties', desc: 'Browse our curated selection of managed properties filtered by location, budget, and your lifestyle preferences. All listings are verified and up-to-date.' },
  { step: '02', title: 'Book a Consultation', desc: 'Schedule a free session with our tenant relations team. We\'ll help match you with the right property and walk you through the entire process.' },
  { step: '03', title: 'Tour Your Top Picks', desc: 'Visit the properties you love, either in-person or virtually. Our team will be there to answer all your questions.' },
  { step: '04', title: 'Apply & Get Approved', desc: 'Complete a simple application. IRUR handles background checks, credit review, and verification — transparently and fairly.' },
  { step: '05', title: 'Sign Your Lease', desc: 'Review and sign your rental agreement digitally. IRUR ensures all terms are clear, fair, and legally sound.' },
  { step: '06', title: 'Move In & Thrive', desc: 'Collect your keys and settle in! Pay rent online, submit maintenance requests, and access your lease documents anytime.' },
];

const INVESTOR_JOURNEY = [
  { step: '01', title: 'Submit Your Property', desc: 'Share details about your property with IRUR. We review location, condition, and market potential to assess suitability for our managed portfolio.' },
  { step: '02', title: 'Property Assessment', desc: 'Our team conducts an inspection and market analysis. We\'ll provide a recommended rental price and estimated occupancy timeline.' },
  { step: '03', title: 'Sign Management Agreement', desc: 'Agree to IRUR\'s management terms. We handle everything — you retain ownership and earn passive income.' },
  { step: '04', title: 'Listing & Photography', desc: 'Professional photography, detailed descriptions, and optimized listings go live across our platform for maximum visibility.' },
  { step: '05', title: 'Qualified Tenants Placed', desc: 'IRUR screens all applicants. Only verified, financially stable tenants are placed in your property.' },
  { step: '06', title: 'Earn & Track Revenue', desc: 'Receive consistent rental payments. Access detailed monthly reports on occupancy, revenue, expenses, and your overall ROI.' },
];

const FAQ_TENANT = [
  { q: 'What does the application process involve?', a: 'IRUR conducts a standard background and credit check, employment verification, and rental history review. The process typically takes 24-48 hours.' },
  { q: 'Can I have pets in my rental?', a: 'Some properties are pet-friendly. Filter by "Pet Friendly" when browsing, and confirm details with our team during your consultation.' },
  { q: 'How do I pay rent?', a: 'In Phase 2, rent can be paid online through the Tenant Portal. Currently, IRUR will provide payment instructions at lease signing.' },
  { q: 'What happens if something needs repair?', a: 'IRUR manages all maintenance. Report issues to us directly and we coordinate repairs with licensed vendors at no cost to you for standard maintenance.' },
];

const FAQ_INVESTOR = [
  { q: 'What percentage does IRUR take?', a: 'IRUR charges a competitive management fee based on the property and location. This is discussed transparently during your onboarding call.' },
  { q: 'How quickly can my property be occupied?', a: 'For eligible properties in our communities, occupancy typically occurs within 2-6 weeks of listing, depending on market conditions.' },
  { q: 'Do I have any say in tenant selection?', a: 'IRUR handles tenant screening per fair housing laws. You will be informed when a qualified tenant is placed, but tenant selection decisions are made by IRUR.' },
  { q: 'What reports will I receive?', a: 'Monthly performance reports covering rent collection, occupancy, maintenance costs, and net revenue. Full transparency is core to what we do.' },
];

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<'tenant' | 'investor'>('tenant');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const journey = activeTab === 'tenant' ? TENANT_JOURNEY : INVESTOR_JOURNEY;
  const faqs = activeTab === 'tenant' ? FAQ_TENANT : FAQ_INVESTOR;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        <div className="container-xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Step-by-Step Overview</span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-1 mb-4">How IRUR Works</h1>
          <p className="text-slate-600 dark:text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            A transparent, reliable process designed to make renting and managing property straightforward.
          </p>

          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mt-8 border border-slate-200 dark:border-slate-700">
            {(['tenant', 'investor'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab === 'tenant' ? 'For Tenants' : 'For Property Investors'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Steps */}
      <section className="py-20">
        <div className="container-xl max-w-4xl">
          <div className="space-y-6">
            {journey.map((step) => (
              <div key={step.step} className="card p-6 flex items-start gap-6">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 flex items-center justify-center font-display font-black text-sm flex-shrink-0">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg mb-1">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800">
        <div className="container-xl max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-slate-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  <span className="text-brand-500 font-bold ml-4">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-slate-600 dark:text-slate-400 text-xs leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container-xl text-center max-w-2xl">
          <h2 className="font-display text-3xl font-extrabold mb-3">Ready to Take the Next Step?</h2>
          <p className="text-slate-300 text-sm mb-8">Connect with our team to discuss tenant placement or property management solutions.</p>
          <div className="flex justify-center gap-4">
            <Link to="/properties" className="btn-primary">Browse Properties</Link>
            <Link to="/book-session" className="btn-outline-white">Book a Session</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
