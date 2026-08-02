import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TEAM = [
  { name: 'Ram', role: 'Co-Founder & CEO', bio: 'Leads IRUR\'s vision and investor relations, with deep expertise in real estate investment and property strategy.', initials: 'R', bg: 'bg-navy-700' },
  { name: 'Laxman', role: 'Co-Founder & COO', bio: 'Oversees operations, tenant placement, and day-to-day management, ensuring seamless experiences for all stakeholders.', initials: 'L', bg: 'bg-gold-600' },
  { name: 'Sarah Johnson', role: 'Head of Tenant Relations', bio: 'Champions the tenant experience — from inquiry to move-in, ensuring every renter feels supported and valued.', initials: 'SJ', bg: 'bg-emerald-600' },
  { name: 'Michael Chen', role: 'Head of Technology', bio: 'Builds and maintains the IRUR platform, keeping it fast, reliable, and continuously improving for all users.', initials: 'MC', bg: 'bg-purple-600' },
];

const VALUES = [
  { icon: '🔍', title: 'Transparency', desc: 'No hidden fees. No surprises. Every step of the process is clear and communicated.' },
  { icon: '🤝', title: 'Integrity', desc: 'We do what we say. For investors, tenants, and our communities — our word is our bond.' },
  { icon: '⭐', title: 'Excellence', desc: 'Premium properties, premium service. We set high standards and hold ourselves to them.' },
  { icon: '🏘️', title: 'Community', desc: 'We\'re not just managing properties — we\'re building thriving neighborhoods where people want to live.' },
];

const STATES = [
  {
    state: 'Pennsylvania', flag: '🏛️',
    communities: [
      { name: 'Lennar River Pointe', city: 'Bridgeport' },
      { name: 'Lennar The Villages', city: 'Spring City' },
      { name: 'Lennar SteelPointe', city: 'Phoenixville' },
      { name: 'Lennar Whispering Woods', city: 'Pottstown' },
    ]
  },
  {
    state: 'Florida', flag: '🌴',
    communities: [
      { name: 'Lennar Grand Isles at Beach Walk', city: 'St. Johns' },
    ]
  },
];

export default function About() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        </div>
        <div className="container-xl relative z-10 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-5">About IRUR</h1>
          <p className="text-navy-200 text-lg leading-relaxed">
            I Rent U Rent (IRUR) is a US-based property management startup founded by Ram & Laxman with a team of experienced investors. We bridge the gap between property investors and quality tenants — managing the entire relationship so neither side has to worry.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container-xl">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="card p-8 border-l-4 border-gold-500">
              <div className="text-3xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-navy-900 mb-3">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To create a seamless, transparent, and trustworthy property rental ecosystem — where investors earn confidently and tenants live comfortably. IRUR removes complexity, eliminates uncertainty, and delivers real value on both sides of every rental relationship.
              </p>
            </div>
            <div className="card p-8 border-l-4 border-navy-700">
              <div className="text-3xl mb-4">🔭</div>
              <h2 className="text-2xl font-bold text-navy-900 mb-3">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                To become the most trusted property management platform in the United States — expanding into every major metro while maintaining the personal attention and integrity that defines IRUR. We envision a future where managing and renting property is effortless for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="section-title">Our Core Values</h2>
            <p className="section-subtitle mx-auto">The principles that guide every decision we make at IRUR.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(v => (
              <div key={v.title} className="card p-7 text-center">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-bold text-navy-900 text-lg mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="section-title">Meet Our Team</h2>
            <p className="section-subtitle mx-auto">The passionate people behind IRUR's growth and success.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {TEAM.map(member => (
              <div key={member.name} className="card p-7 text-center">
                <div className={`w-20 h-20 ${member.bg} rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-5`}>
                  {member.initials}
                </div>
                <h3 className="font-bold text-navy-900 text-lg mb-1">{member.name}</h3>
                <p className="text-gold-600 text-sm font-medium mb-3">{member.role}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Communities */}
      <section className="py-20 bg-navy-950">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Where We Operate</h2>
            <p className="text-navy-300">Currently serving these communities — with more cities coming soon.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {STATES.map(s => (
              <div key={s.state} className="bg-navy-800 rounded-2xl p-6 border border-navy-700">
                <h3 className="font-bold text-white text-xl mb-4">{s.flag} {s.state}</h3>
                <ul className="space-y-3">
                  {s.communities.map(c => (
                    <li key={c.name} className="flex items-start gap-3">
                      <span className="w-5 h-5 bg-gold-500/20 rounded-full flex items-center justify-center text-gold-400 text-xs mt-0.5">✓</span>
                      <div>
                        <div className="text-white text-sm font-medium">{c.name}</div>
                        <div className="text-navy-400 text-xs">{c.city}, {s.state}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center text-navy-400 text-sm mt-8">🚀 Expanding to Dallas TX, Austin TX, Charlotte NC, and more in Phase 2</p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="container-xl">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="section-title mb-6">Our Story</h2>
            <div className="text-gray-600 leading-relaxed space-y-4 text-lg">
              <p>
                IRUR was founded by Ram & Laxman — two entrepreneurs who saw firsthand how difficult property investment could be for the average investor, and how stressful finding reliable housing was for renters.
              </p>
              <p>
                The name "I Rent U Rent" captures the essence perfectly: <strong className="text-navy-800">investors</strong> list properties, <strong className="text-navy-800">tenants</strong> find homes, and <strong className="text-navy-800">IRUR</strong> makes both experiences better than either could on their own.
              </p>
              <p>
                Starting with premium Lennar communities in Pennsylvania and Florida, IRUR is building the infrastructure to scale quality property management across the entire United States.
              </p>
            </div>
            <div className="mt-10">
              <Link to="/book-session" className="btn-primary px-10 py-4 text-base">Start Your IRUR Journey</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
