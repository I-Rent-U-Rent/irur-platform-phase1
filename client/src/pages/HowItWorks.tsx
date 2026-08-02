import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TENANT_JOURNEY = [
  { step: 1, icon: '🔍', title: 'Search Properties', desc: 'Browse our curated selection of managed properties filtered by location, budget, and your lifestyle preferences. All listings are verified and up-to-date.' },
  { step: 2, icon: '📅', title: 'Book a Consultation', desc: 'Schedule a free session with our tenant relations team. We\'ll help match you with the right property and walk you through the entire process.' },
  { step: 3, icon: '🏃', title: 'Tour Your Top Picks', desc: 'Visit the properties you love, either in-person or virtually. Our team will be there to answer all your questions.' },
  { step: 4, icon: '📋', title: 'Apply & Get Approved', desc: 'Complete a simple application. IRUR handles background checks, credit review, and verification — transparently and fairly.' },
  { step: 5, icon: '✍️', title: 'Sign Your Lease', desc: 'Review and sign your rental agreement digitally. IRUR ensures all terms are clear, fair, and legally sound.' },
  { step: 6, icon: '🏠', title: 'Move In & Thrive', desc: 'Collect your keys and settle in! Pay rent online, submit maintenance requests, and access your lease documents anytime.' },
];

const INVESTOR_JOURNEY = [
  { step: 1, icon: '📬', title: 'Submit Your Property', desc: 'Share details about your property with IRUR. We review location, condition, and market potential to assess suitability for our managed portfolio.' },
  { step: 2, icon: '🔎', title: 'Property Assessment', desc: 'Our team conducts an inspection and market analysis. We\'ll provide a recommended rental price and estimated occupancy timeline.' },
  { step: 3, icon: '📑', title: 'Sign the Management Agreement', desc: 'Agree to IRUR\'s management terms. We handle everything — you retain ownership and earn passive income.' },
  { step: 4, icon: '📸', title: 'IRUR Prepares the Listing', desc: 'Professional photography, detailed descriptions, and optimized listings go live across our platform. Your property gets maximum visibility.' },
  { step: 5, icon: '👥', title: 'Qualified Tenants Placed', desc: 'IRUR screens all applicants. Only verified, financially stable tenants are placed in your property.' },
  { step: 6, icon: '💰', title: 'Earn & Track Revenue', desc: 'Receive consistent rental payments. Access detailed monthly reports on occupancy, revenue, expenses, and your overall ROI.' },
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
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-navy-900 to-navy-800">
        <div className="container-xl text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">How IRUR Works</h1>
          <p className="text-navy-200 text-lg max-w-xl mx-auto">A transparent, step-by-step process designed to make property rental easy for everyone involved.</p>
          <div className="flex justify-center gap-3 mt-8">
            {(['tenant', 'investor'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-full font-semibold text-sm transition-all ${activeTab === tab ? 'bg-gold-500 text-white shadow-gold' : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'}`}>
                {tab === 'tenant' ? '🏠 I\'m a Tenant' : '💼 I\'m an Investor'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Steps */}
      <section className="py-20 bg-gray-50">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="section-title">
              {activeTab === 'tenant' ? 'Your Tenant Journey' : 'Your Investor Journey'}
            </h2>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gold-200 -translate-x-1/2" />
            <div className="space-y-12 lg:space-y-16">
              {journey.map((step, i) => (
                <div key={step.step} className={`flex flex-col lg:flex-row items-center gap-8 ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? 'lg:text-right lg:pr-12' : 'lg:pl-12'}`}>
                    <div className="card p-7 inline-block max-w-sm w-full lg:w-auto">
                      <div className="text-4xl mb-3">{step.icon}</div>
                      <h3 className="font-bold text-navy-900 text-lg mb-2">{step.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-14 h-14 bg-navy-800 border-4 border-gold-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-gold z-10">
                    {step.step}
                  </div>
                  <div className="flex-1 hidden lg:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container-xl">
          <div className="max-w-2xl mx-auto">
            <h2 className="section-title text-center mb-10">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="card overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left">
                    <span className="font-medium text-navy-900 text-sm pr-4">{faq.q}</span>
                    <span className={`text-gold-500 font-bold text-xl transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-6 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gold-500">
        <div className="container-xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {activeTab === 'tenant' ? 'Ready to Find Your New Home?' : 'Ready to Start Earning Passive Income?'}
          </h2>
          <p className="text-white/85 mb-8 max-w-lg mx-auto">
            {activeTab === 'tenant' ? 'Browse available properties or book a free consultation with our team today.' : 'Submit your property and let IRUR manage everything. Start earning without the hassle.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {activeTab === 'tenant' ? (
              <>
                <Link to="/properties" className="bg-white text-gold-600 font-semibold px-8 py-3.5 rounded-lg hover:bg-gold-50 transition-colors">Browse Properties</Link>
                <Link to="/book-session" className="btn-outline-white px-8 py-3.5">Book a Session</Link>
              </>
            ) : (
              <Link to="/book-session?type=investing" className="bg-white text-gold-600 font-semibold px-8 py-3.5 rounded-lg hover:bg-gold-50 transition-colors">List Your Property</Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
