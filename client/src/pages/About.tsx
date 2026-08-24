import { Link } from 'react-router-dom';
import { Calendar, Users, Eye, ShieldCheck, Star, MapPin, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TEAM = [
  { name: 'Ram', role: 'Co-Founder & CEO', bio: 'Leads IRUR\'s vision and investor relations, with deep expertise in real estate investment and property strategy.', initials: 'R' },
  { name: 'Laxman', role: 'Co-Founder & COO', bio: 'Oversees operations, tenant placement, and day-to-day management, ensuring seamless experiences for all stakeholders.', initials: 'L' },
  { name: 'Sarah Johnson', role: 'Head of Tenant Relations', bio: 'Champions the tenant experience — from inquiry to move-in, ensuring every renter feels supported and valued.', initials: 'SJ' },
  { name: 'Michael Chen', role: 'Head of Technology', bio: 'Builds and maintains the IRUR platform, keeping it fast, reliable, and continuously improving for all users.', initials: 'MC' },
];

const VALUES = [
  { title: 'Transparency', desc: 'No hidden fees. No surprises. Every step of the process is clear and communicated.', icon: <Eye className="w-6 h-6 text-gold-500" /> },
  { title: 'Integrity', desc: 'We do what we say. For investors, tenants, and our communities — our word is our bond.', icon: <ShieldCheck className="w-6 h-6 text-gold-500" /> },
  { title: 'Excellence', desc: 'Premium properties, premium service. We set high standards and hold ourselves to them.', icon: <Star className="w-6 h-6 text-gold-500" /> },
  { title: 'Community Focus', desc: 'We\'re not just managing properties — we\'re building thriving neighborhoods where people want to live.', icon: <Users className="w-6 h-6 text-gold-500" /> },
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
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">About IRUR</span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-1 mb-5">
            Connecting Investors & Tenants <br /> with <span className="text-gradient">Confidence</span>
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
            <div className="card-premium p-8 border-l-4 border-l-gold-500 hover-lift">
              <Calendar className="w-8 h-8 text-gold-500 mb-3" />
              <h2 className="font-display font-bold text-slate-900 dark:text-white text-xl mb-3">Our Mission</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                To create a seamless, transparent, and trustworthy property rental ecosystem — where investors earn confidently and tenants live comfortably. IRUR removes complexity and delivers real value.
              </p>
            </div>
            <div className="card-premium p-8 border-l-4 border-l-gold-500 hover-lift">
              <Users className="w-8 h-8 text-gold-500 mb-3" />
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
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Core Principles</span>
            <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Our Core Values</h2>
            <p className="text-slate-500 text-sm mt-2">The principles that guide every decision at IRUR.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(v => (
              <div key={v.title} className="card-premium p-6 hover-lift">
                <div className="mb-3">{v.icon}</div>
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
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Meet the Team</span>
            <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Leadership & Team</h2>
            <p className="text-slate-500 text-sm mt-2">The dedicated team powering the IRUR platform.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map(member => (
              <div key={member.name} className="card-premium p-6 text-center hover-lift">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 text-white font-display font-black text-lg flex items-center justify-center mx-auto mb-4 border-2 border-gold-500">
                  {member.initials}
                </div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">{member.name}</h3>
                <p className="text-gold-600 dark:text-gold-400 text-xs font-semibold mb-3">{member.role}</p>
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
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Service Areas</span>
            <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Where We Operate</h2>
            <p className="text-slate-500 text-sm mt-2">Serving premier communities across Pennsylvania and Florida.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {STATES.map(s => (
              <div key={s.state} className="card-premium p-6 hover-lift">
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gold-500" /> {s.state}
                </h3>
                <ul className="space-y-3">
                  {s.communities.map(c => (
                    <li key={c.name} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-gold-50 dark:bg-gold-950 text-gold-600 dark:text-gold-400 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
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
            <Link to="/book-session" className="btn-luxury">
              <Calendar className="w-4 h-4" />
              Start Your IRUR Journey
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
