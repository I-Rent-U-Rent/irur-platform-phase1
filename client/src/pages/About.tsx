import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TEAM = [
  { name: 'Ram', role: 'Co-Founder & CEO', bio: 'Leads IRUR\'s vision and investor relations, with deep expertise in real estate investment and property strategy.', initials: 'R' },
  { name: 'Laxman', role: 'Co-Founder & COO', bio: 'Oversees operations, tenant placement, and day-to-day management, ensuring seamless experiences for all stakeholders.', initials: 'L' },
  { name: 'Sarah Johnson', role: 'Head of Tenant Relations', bio: 'Champions the tenant experience — from inquiry to move-in, ensuring every renter feels supported and valued.', initials: 'SJ' },
  { name: 'Michael Chen', role: 'Head of Technology', bio: 'Builds and maintains the IRUR platform, keeping it fast, reliable, and continuously improving for all users.', initials: 'MC' },
];

const VALUES = [
  { title: 'Transparency', desc: 'No hidden fees. No surprises. Every step of the process is clear and communicated.' },
  { title: 'Integrity', desc: 'We do what we say. For investors, tenants, and our communities — our word is our bond.' },
  { title: 'Excellence', desc: 'Premium properties, premium service. We set high standards and hold ourselves to them.' },
  { title: 'Community Focus', desc: 'We\'re not just managing properties — we\'re building thriving neighborhoods where people want to live.' },
];

const STATES = [
  {
    state: 'Pennsylvania',
    communities: [
      { name: 'Lennar River Pointe', city: 'Bridgeport' },
      { name: 'Lennar The Villages', city: 'Spring City' },
      { name: 'Lennar SteelPointe', city: 'Phoenixville' },
      { name: 'Lennar Whispering Woods', city: 'Pottstown' },
    ]
  },
  {
    state: 'Florida',
    communities: [
      { name: 'Lennar Grand Isles at Beach Walk', city: 'St. Johns' },
    ]
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        <div className="container-xl text-center max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">About IRUR</span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-1 mb-5">
            Connecting Investors & Tenants with Confidence
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            I Rent U Rent (IRUR) is a US-based property management startup founded by Ram & Laxman with a team of experienced investors. We bridge the gap between property investors and quality tenants.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container-xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card p-8 border-l-4 border-l-brand-500">
              <h2 className="font-display font-bold text-slate-900 dark:text-white text-xl mb-3">Our Mission</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                To create a seamless, transparent, and trustworthy property rental ecosystem — where investors earn confidently and tenants live comfortably. IRUR removes complexity and delivers real value.
              </p>
            </div>
            <div className="card p-8 border-l-4 border-l-slate-700">
              <h2 className="font-display font-bold text-slate-900 dark:text-white text-xl mb-3">Our Vision</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                To become the most trusted property management platform in the United States — expanding into major master-planned developments while maintaining absolute integrity and personal service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white dark:bg-slate-950 border-y border-slate-200/80 dark:border-slate-800">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">Our Core Values</h2>
            <p className="text-slate-500 text-sm mt-2">The principles that guide every decision at IRUR.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(v => (
              <div key={v.title} className="card p-6">
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base mb-2">{v.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">Leadership & Team</h2>
            <p className="text-slate-500 text-sm mt-2">The dedicated team powering the IRUR platform.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map(member => (
              <div key={member.name} className="card p-6 text-center">
                <div className="w-16 h-16 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-display font-black text-lg flex items-center justify-center mx-auto mb-4 border border-slate-700">
                  {member.initials}
                </div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">{member.name}</h3>
                <p className="text-brand-600 dark:text-brand-400 text-xs font-semibold mb-3">{member.role}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Operational Areas */}
      <section className="py-20 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">Where We Operate</h2>
            <p className="text-slate-500 text-sm mt-2">Serving premier communities across Pennsylvania and Florida.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {STATES.map(s => (
              <div key={s.state} className="card p-6">
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg mb-4">{s.state}</h3>
                <ul className="space-y-3">
                  {s.communities.map(c => (
                    <li key={c.name} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center text-[10px]">✓</span>
                      <div>
                        <span className="font-semibold">{c.name}</span>
                        <span className="text-slate-400"> — {c.city}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/book-session" className="btn-primary">
              Start Your IRUR Journey
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
