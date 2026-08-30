import { Link } from 'react-router-dom';
import {
  Calendar, Users, Eye, ShieldCheck, HeartHandshake, MapPin, Check,
  Building2, Search, ClipboardCheck, Home,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TEAM = [
  {
    name: 'Rama Thadisetty',
    role: 'Co-Founder & CEO',
    bio: 'Leads IRENTURENT’s vision and investor relations, with deep expertise in real estate investment and property strategy.',
    initials: 'R',
  },
  {
    name: 'Laxman Gudipati',
    role: 'Co-Founder & COO',
    bio: 'Oversees operations, tenant placement, and day-to-day management, ensuring seamless experiences for all stakeholders.',
    initials: 'L',
  },
];

const VALUES = [
  { title: 'Integrity', desc: 'We treat every client with respect and honesty. Our word is our bond — for investors, tenants, and our communities.', icon: <ShieldCheck className="w-6 h-6 text-gold-500" /> },
  { title: 'Transparency', desc: 'No hidden fees. No surprises. Every step of the investment rental process is clear and communicated.', icon: <Eye className="w-6 h-6 text-gold-500" /> },
  { title: 'Customer Satisfaction', desc: 'We are committed to helping you find the best investment rental options and providing exceptional service along the way.', icon: <HeartHandshake className="w-6 h-6 text-gold-500" /> },
];

const SERVICES = [
  { title: 'Finding Investment Properties', desc: 'We help investors and renters connect with the best homes for their needs and budget.', icon: <Search className="w-6 h-6 text-gold-500" /> },
  { title: 'Property Management', desc: 'Full-service management designed to keep the rental process easy and stress-free for landlords and tenants.', icon: <Building2 className="w-6 h-6 text-gold-500" /> },
  { title: 'Tenant Screening', desc: 'Thorough screening so the right people are placed in the right homes, with confidence for property owners.', icon: <ClipboardCheck className="w-6 h-6 text-gold-500" /> },
  { title: 'Rental Listings', desc: 'A user-friendly platform of verified rental listings — a one-stop shop for investment home rental needs.', icon: <Home className="w-6 h-6 text-gold-500" /> },
];

const STATES = [
  {
    state: 'Pennsylvania',
    communities: [
      { name: 'Lennar River Pointe', city: 'Bridgeport' },
      { name: 'Lennar The Villages', city: 'Spring City' },
      { name: 'Lennar SteelPointe', city: 'Phoenixville' },
      { name: 'Lennar Whispering Woods', city: 'Pottstown' },
    ],
  },
  {
    state: 'Florida',
    communities: [
      { name: 'Lennar Grand Isles at Beach Walk', city: 'St. Johns' },
    ],
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <section className="pt-32 pb-20 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        <div className="container-xl text-center max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">About IRENTURENT</span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-1 mb-5">
            Our Story
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            At IRENTURENT, we believe that finding the perfect home should be easy and stress-free. That’s why we started our business: to provide a one-stop shop for all your investment home rental needs.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card-premium p-8 border-l-4 border-l-gold-500 hover-lift">
              <Users className="w-8 h-8 text-gold-500 mb-3" />
              <h2 className="font-display font-bold text-slate-900 dark:text-white text-xl mb-3">Our Vision</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                At IRENTURENT, we envision a world where every person can easily find and rent their dream home. We strive to make this a reality by providing a user-friendly platform and exceptional customer service.
              </p>
            </div>
            <div className="card-premium p-8 border-l-4 border-l-gold-500 hover-lift">
              <Calendar className="w-8 h-8 text-gold-500 mb-3" />
              <h2 className="font-display font-bold text-slate-900 dark:text-white text-xl mb-3">Our Mission</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Our mission is to connect investors (landlords) and renters with the best homes for their needs and budget. We strive to provide excellent customer service and make the investment rental process as smooth as possible.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-slate-950 border-y border-slate-200/80 dark:border-slate-800">
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">What Guides Us</span>
            <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Our Values</h2>
            <p className="text-slate-500 text-sm mt-2">Integrity, transparency, and customer satisfaction in every relationship.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
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

      <section className="py-20">
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">What We Do</span>
            <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Our Services</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-2xl mx-auto">
              We offer a wide range of services designed to make the rental process as easy and stress-free as possible for both landlords and tenants.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map(s => (
              <div key={s.title} className="card-premium p-6 hover-lift">
                <div className="mb-3">{s.icon}</div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base mb-2">{s.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-slate-950 border-y border-slate-200/80 dark:border-slate-800">
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Meet the Team</span>
            <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Our Team</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-2xl mx-auto">
              Our team consists of experienced professionals in the investment home rental industry. We are dedicated to helping you find the perfect home and providing the best customer service possible.
            </p>
          </div>
          <div className="mx-auto grid max-w-3xl grid-cols-1 sm:grid-cols-2 gap-6">
            {TEAM.map(member => (
              <div key={member.name} className="card-premium p-6 sm:p-8 text-center hover-lift w-full">
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

      <section className="py-20">
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
              Start Your IRENTURENT Journey
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
