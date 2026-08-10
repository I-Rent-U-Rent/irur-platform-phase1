import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-800 border-t border-gray-100">
      <div className="container-xl py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <Logo size="md" variant="dark" />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              I Rent U Rent — Connecting quality property investors with trusted tenants. Professional management, full transparency.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-gray-600">
              {[['/', 'Home'],['/properties','Browse Properties'],['/how-it-works','How It Works'],['/about','About Us'],['/contact','Contact']].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-gold-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Services</h4>
            <ul className="space-y-2.5 text-sm text-gray-600">
              {['Tenant Placement','Property Management','Rental Agreements','Maintenance Support','Investor Reports','Consultation Sessions'].map(s => (
                <li key={s} className="hover:text-gold-400 transition-colors cursor-default">{s}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Get In Touch</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex gap-2.5 items-start">
                <span className="text-gold-400 mt-0.5">📍</span>
                <span>Serving Pennsylvania<br />& Florida, USA</span>
              </li>
              <li className="flex gap-2.5 items-center">
                <span className="text-gold-400">📧</span>
                <a href="mailto:info@irur.com" className="hover:text-gold-400 transition-colors">info@irur.com</a>
              </li>
              <li className="flex gap-2.5 items-center">
                <span className="text-gold-400">📞</span>
                <a href="tel:+17174336793" className="hover:text-gold-400 transition-colors">(717) 433-6793</a>
              </li>
            </ul>
            <Link to="/book-session" className="inline-block mt-5 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
              Book a Session
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-6 pb-4">
          <p className="text-xs text-gray-500 text-center leading-relaxed mb-6">
            <span className="font-semibold text-gray-700">Demo Notice:</span> All property listings, pricing, availability, and data displayed on this site are for demonstration purposes only and do not represent real properties, active listings, or actual transactions. Features including contact forms, session booking requests, and map integrations are display-only. These components are fully functional and can be connected to live data sources, payment systems, CRMs, and third-party APIs when proceeding to real-time production.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} IRUR — I Rent U Rent. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gold-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gold-400 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
