import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Heart, Phone, Mail } from 'lucide-react';
import Logo from './Logo';
import { useFavorites } from '../hooks/useFavorites';

const NAV_LINKS = [
  { to: '/properties', label: 'Rental' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { count: savedCount } = useFavorites();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the menu on navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  // Lock scroll + Escape to close while the menu is open.
  useEffect(() => {
    if (!mobileOpen) return;
    document.body.classList.add('no-scroll');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('no-scroll');
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(`${to}/`);

  const savedActive = location.pathname === '/properties' && location.search.includes('saved=1');

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 overflow-visible pt-[env(safe-area-inset-top)] bg-[#061B20]/95 backdrop-blur-md border-b border-white/10 transition-all duration-500 ease-out ${
          scrolled ? 'shadow-[0_8px_30px_rgba(0,0,0,0.40)] bg-[#061B20]/98' : ''
        }`}
      >
        <div className="container-xl">
          <div
            className={`flex items-center justify-between h-[4.5rem] sm:h-20 transition-[height] duration-500 ease-out ${
              scrolled ? 'lg:h-[4.75rem]' : 'lg:h-[5.5rem]'
            }`}
          >
            {/* Logo */}
            <Link
              to="/"
              className={`flex-shrink-0 overflow-visible transition-transform duration-500 ease-out hover:scale-105 focus-visible-ring rounded-lg origin-left ${
                scrolled ? 'lg:scale-90' : ''
              }`}
              aria-label="IRENTURENT home"
            >
              <Logo size="md" variant="light" showTagline={true} />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    aria-current={active ? 'page' : undefined}
                    className={`group relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ease-out ${
                      active
                        ? 'text-[#D2A66F] font-semibold bg-white/10'
                        : 'text-[#D7DDE0] hover:text-[#D2A66F] hover:bg-white/5 active:scale-95'
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-0.5 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-[#B88952] to-[#D2A66F] transition-transform duration-300 origin-left ${
                        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/properties?saved=1"
                aria-label={savedCount > 0 ? `Saved homes (${savedCount})` : 'Saved homes'}
                title="Saved homes"
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  savedActive
                    ? 'text-rose-400 bg-white/10'
                    : 'text-[#D7DDE0] hover:text-rose-400 hover:bg-white/5'
                }`}
              >
                <Heart className={`w-5 h-5 ${savedCount > 0 ? 'fill-current text-rose-400' : ''}`} />
                {savedCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E98A00] text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                    {savedCount > 99 ? '99+' : savedCount}
                  </span>
                )}
              </Link>

              <Link
                to="/book-session"
                className="relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E98A00] to-[#D97706] hover:from-[#F29A0A] hover:to-[#E98A00] text-white text-sm font-semibold shadow-lg shadow-orange-900/30 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-900/40 active:translate-y-0 active:scale-95 overflow-hidden"
              >
                <Calendar className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Book a Session</span>
              </Link>
            </div>

            {/* Mobile actions */}
            <div className="flex items-center gap-1 lg:hidden">
              <Link
                to="/properties?saved=1"
                aria-label={savedCount > 0 ? `Saved homes (${savedCount})` : 'Saved homes'}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center text-[#D7DDE0] hover:bg-white/10 transition-colors"
              >
                <Heart className={`w-5 h-5 ${savedCount > 0 ? 'fill-current text-rose-400' : ''}`} />
                {savedCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E98A00] text-white text-[10px] font-bold flex items-center justify-center">
                    {savedCount > 99 ? '99+' : savedCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                className={`hamburger p-2.5 rounded-xl text-slate-200 hover:bg-white/10 transition-colors ${mobileOpen ? 'open' : ''}`}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu (portal so the header's backdrop-filter can't trap it) */}
      {mobileOpen &&
        createPortal(
          <div className="lg:hidden fixed inset-0 z-40" id="mobile-menu">
            <div
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm backdrop-in"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <nav
              aria-label="Mobile"
              className="absolute inset-x-0 top-[calc(4.5rem+env(safe-area-inset-top))] sm:top-[calc(5rem+env(safe-area-inset-top))] bg-[#061B20] border-b border-white/10 shadow-2xl menu-in max-h-[calc(100vh-4.5rem)] overflow-y-auto"
            >
              <div className="container-xl py-4 space-y-1">
                {NAV_LINKS.map((link, i) => {
                  const active = isActive(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      style={{ '--i': i } as CSSProperties}
                      aria-current={active ? 'page' : undefined}
                      className={`stagger-in flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${
                        active
                          ? 'text-[#D2A66F] bg-white/10 font-semibold'
                          : 'text-[#D7DDE0] hover:text-[#D2A66F] hover:bg-white/5'
                      }`}
                    >
                      {link.label}
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-[#D2A66F]" />}
                    </Link>
                  );
                })}

                <Link
                  to="/properties?saved=1"
                  style={{ '--i': NAV_LINKS.length } as CSSProperties}
                  className="stagger-in flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium text-[#D7DDE0] hover:text-[#D2A66F] hover:bg-white/5 transition-colors"
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Heart className={`w-4 h-4 ${savedCount > 0 ? 'fill-current text-rose-400' : ''}`} />
                    Saved Homes
                  </span>
                  {savedCount > 0 && (
                    <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#E98A00] text-white text-xs font-bold flex items-center justify-center">
                      {savedCount}
                    </span>
                  )}
                </Link>

                <div className="px-4 pt-3 pb-2 stagger-in" style={{ '--i': NAV_LINKS.length + 1 } as CSSProperties}>
                  <Link
                    to="/book-session"
                    className="inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#E98A00] to-[#D97706] hover:from-[#F29A0A] hover:to-[#E98A00] text-white text-sm font-semibold shadow-lg shadow-orange-900/30 transition-all active:scale-[0.98]"
                  >
                    <Calendar className="w-4 h-4" />
                    Book a Session
                  </Link>
                </div>

                <div
                  className="stagger-in px-4 pt-3 pb-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#D7DDE0]/70 border-t border-white/10 mt-2"
                  style={{ '--i': NAV_LINKS.length + 2 } as CSSProperties}
                >
                  <a href="tel:+17174336793" className="inline-flex items-center gap-1.5 hover:text-[#D2A66F] transition-colors">
                    <Phone className="w-3.5 h-3.5 text-[#D2A66F]" /> (717) 433-6793
                  </a>
                  <a href="mailto:info@irenturent.com" className="inline-flex items-center gap-1.5 hover:text-[#D2A66F] transition-colors">
                    <Mail className="w-3.5 h-3.5 text-[#D2A66F]" /> info@irenturent.com
                  </a>
                </div>
              </div>
            </nav>
          </div>,
          document.body
        )}
    </>
  );
}
