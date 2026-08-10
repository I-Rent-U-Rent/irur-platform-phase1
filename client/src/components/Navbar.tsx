import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demoVisible, setDemoVisible] = useState(() =>
    localStorage.getItem('irur_demo_dismissed') !== '1'
  );

  const dismissDemo = () => {
    localStorage.setItem('irur_demo_dismissed', '1');
    setDemoVisible(false);
  };
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const transparent = isHome && !scrolled && !mobileOpen;

  const navLinks = [
    { to: '/properties', label: 'Properties' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${transparent ? 'bg-transparent' : 'bg-white/95 shadow-[0_2px_20px_rgba(0,0,0,0.06)] backdrop-blur-xl'}`}>
      {demoVisible && (
        <div className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 text-white text-xs py-2 px-4 text-center relative">
          <strong>Demo Mode</strong> — All property data is for demonstration only and does not represent real listings. Contact forms, booking, and map features are display-only and can be connected to live systems for production.
          <button onClick={dismissDemo} aria-label="Dismiss" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white font-bold text-base leading-none">×</button>
        </div>
      )}
      <div className="container-xl">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 transition-transform hover:scale-[1.02]">
            <Logo size="md" variant={transparent ? 'light' : 'dark'} />
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors group ${
                  location.pathname === l.to
                    ? transparent ? 'text-gold-300 font-semibold' : 'text-gold-600 font-semibold'
                    : transparent ? 'text-white/85 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>
                {l.label}
                <span className={`absolute left-1/2 -bottom-0.5 h-0.5 bg-gold-500 rounded-full transition-all duration-300 ${location.pathname === l.to ? 'w-6 -translate-x-1/2' : 'w-0 group-hover:w-6 group-hover:-translate-x-1/2'}`} />
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/book-session" className="btn-primary text-sm py-2.5">
              Book a Session
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(o => !o)} className={`lg:hidden p-2 rounded-lg transition-colors ${transparent ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-100'}`}>
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 py-4 space-y-1 animate-[fadeIn_0.2s_ease-out]">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === l.to ? 'text-gold-600 bg-gold-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                {l.label}
              </Link>
            ))}
            <div className="px-4 pt-2">
              <Link to="/book-session" className="btn-primary text-sm w-full text-center block">Book a Session</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
