import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="container-xl py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand */}
          <div>
            <div className="mb-4">
              <Logo size="md" variant="auto" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              I Rent U Rent — Modern property technology platform connecting quality investors with trusted tenants across Pennsylvania and Florida.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ['/', 'Home'],
                ['/properties', 'Browse Properties'],
                ['/how-it-works', 'How It Works'],
                ['/about', 'About Us'],
                ['/contact', 'Contact Us'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-4">Services</h4>
            <ul className="space-y-2.5 text-sm">
              {['Tenant Placement', 'Property Management', 'Rental Agreements', 'Maintenance Support', 'Investor Reports', 'Consultation Sessions'].map(s => (
                <li key={s} className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors cursor-default">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-4">Get In Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2.5 items-start">
                <span className="text-brand-500 font-bold">📍</span>
                <span>Serving PA & FL, USA</span>
              </li>
              <li className="flex gap-2.5 items-center">
                <span className="text-brand-500 font-bold">📧</span>
                <a href="mailto:info@irur.com" className="hover:text-brand-500 transition-colors">info@irur.com</a>
              </li>
              <li className="flex gap-2.5 items-center">
                <span className="text-brand-500 font-bold">📞</span>
                <a href="tel:+17174336793" className="hover:text-brand-500 transition-colors">(717) 433-6793</a>
              </li>
            </ul>
            <Link to="/book-session" className="btn-primary mt-5 text-xs py-2 px-4 inline-flex">
              Book a Session
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800/80 mt-12 pt-8">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            <strong className="text-slate-700 dark:text-slate-300">Demo Notice:</strong> All property listings, pricing, availability, and data displayed on this site are for demonstration purposes only and do not represent real properties, active listings, or actual transactions. Features including contact forms, session booking requests, and map integrations are display-only. These components are fully functional and can be connected to live data sources, payment systems, CRMs, and third-party APIs when proceeding to real-time production.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <p>© {new Date().getFullYear()} IRUR — I Rent U Rent. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-brand-500 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-brand-500 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
