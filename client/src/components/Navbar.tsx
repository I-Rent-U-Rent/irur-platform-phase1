import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Heart, Phone, Mail } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { useFavorites } from '../hooks/useFavorites';

const NAV_LINKS = [
  { to: '/properties', label: 'Rental' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

/** Routes whose first section is a full-bleed hero the bar floats over. */
const TRANSPARENT_ROUTES = ['/'];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { count: savedCount } = useFavorites();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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

  // Over the hero the bar sits on the video; everywhere else it sits directly
  // on the page background. Either way it never paints a surface of its own.
  const overHero = TRANSPARENT_ROUTES.includes(location.pathname) && !scrolled && !mobileOpen;

  const linkIdle = overHero
    ? 'text-white/85 hover:text-white'
    : 'text-slate-600 hover:text-slate-900 dark:text-white/75 dark:hover:text-white';
  const linkActive = overHero
    ? 'text-white font-semibold'
    : 'text-[#9A6B2F] dark:text-[#D2A66F] font-semibold';
  const iconBtn = overHero
    ? 'text-white/80 hover:text-white hover:bg-white/10'
    : 'text-slate-500 hover:text-[#9A6B2F] hover:bg-slate-900/5 dark:text-white/70 dark:hover:text-[#D2A66F] dark:hover:bg-white/10';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 overflow-visible pt-[env(safe-area-inset-top)] transition-[background-color,backdrop-filter] duration-500 ease-out ${
          mobileOpen
            // While the menu is open the bar joins the panel, so the brand and
            // icons keep the panel's contrast instead of the page behind it.
            ? 'bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xl'
            // Otherwise no colour of its own — just a soft blur once content
            // starts passing underneath, so the links stay readable.
            : `bg-transparent ${overHero ? '' : 'backdrop-blur-lg'}`
        }`}
      >
        {/* Scrim keeps the white nav text legible over bright frames of the hero video. */}
        {overHero && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[140%] bg-gradient-to-b from-black/50 via-black/20 to-transparent"
            aria-hidden="true"
          />
        )}

        <div className="container-xl relative">
          <div
            className={`flex items-center justify-between transition-[height] duration-500 ease-out ${
              scrolled ? 'h-[4.25rem] sm:h-[4.5rem] lg:h-[4.75rem]' : 'h-[4.5rem] sm:h-20 lg:h-24'
            }`}
          >
            {/* Brand lockup */}
            <Link
              to="/"
              className={`flex-shrink-0 overflow-visible rounded-xl origin-left transition-transform duration-500 ease-out focus-visible-ring ${
                scrolled ? 'lg:scale-95' : ''
              }`}
              aria-label="IRENTURENT — home"
            >
              <Logo size="md" variant={overHero ? 'light' : 'auto'} showTagline />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5" aria-label="Primary">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    aria-current={active ? 'page' : undefined}
                    className={`group relative px-4 py-2 rounded-xl text-[13px] font-medium tracking-wide transition-colors duration-300 ${
                      active ? linkActive : linkIdle
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-1 left-4 right-4 h-px rounded-full bg-gradient-to-r from-[#B88952] to-[#D2A66F] transition-transform duration-300 origin-left ${
                        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-1.5">
              <ThemeToggle onDark={overHero} />

              <Link
                to="/properties?saved=1"
                aria-label={savedCount > 0 ? `Saved homes (${savedCount})` : 'Saved homes'}
                title="Saved homes"
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                  savedActive ? 'text-rose-500 bg-rose-500/10' : iconBtn
                }`}
              >
                <Heart className={`w-5 h-5 ${savedCount > 0 ? 'fill-current text-rose-500' : ''}`} />
                {savedCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E98A00] text-white text-[10px] font-bold flex items-center justify-center">
                    {savedCount > 99 ? '99+' : savedCount}
                  </span>
                )}
              </Link>

              <span
                className={`mx-2 h-6 w-px ${overHero ? 'bg-white/20' : 'bg-slate-300/70 dark:bg-white/15'}`}
                aria-hidden="true"
              />

              <Link
                to="/book-session"
                className="btn-accent px-5 py-2.5 text-[13px] tracking-wide"
              >
                <Calendar className="w-4 h-4" />
                Book a Session
              </Link>
            </div>

            {/* Mobile actions */}
            <div className="flex items-center gap-0.5 lg:hidden">
              <ThemeToggle onDark={overHero} />

              <Link
                to="/properties?saved=1"
                aria-label={savedCount > 0 ? `Saved homes (${savedCount})` : 'Saved homes'}
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${iconBtn}`}
              >
                <Heart className={`w-5 h-5 ${savedCount > 0 ? 'fill-current text-rose-500' : ''}`} />
                {savedCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E98A00] text-white text-[10px] font-bold flex items-center justify-center">
                    {savedCount > 99 ? '99+' : savedCount}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                className={`hamburger p-2.5 rounded-xl transition-colors ${mobileOpen ? 'open' : ''} ${iconBtn}`}
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

      {/* Mobile menu (portal so the header can't clip it) */}
      {mobileOpen &&
        createPortal(
          <div className="lg:hidden fixed inset-0 z-40" id="mobile-menu">
            <div
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm backdrop-in"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <nav
              aria-label="Mobile"
              className="absolute inset-x-0 top-[calc(4.5rem+env(safe-area-inset-top))] sm:top-[calc(5rem+env(safe-area-inset-top))] bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/70 dark:border-white/10 shadow-xl menu-in max-h-[calc(100vh-4.5rem)] overflow-y-auto"
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
                          ? 'text-[#9A6B2F] dark:text-[#D2A66F] bg-slate-200/60 dark:bg-white/10 font-semibold'
                          : 'text-slate-700 dark:text-white/80 hover:text-[#9A6B2F] dark:hover:text-[#D2A66F] hover:bg-slate-200/40 dark:hover:bg-white/5'
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
                  className="stagger-in flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium text-slate-700 dark:text-white/80 hover:text-[#9A6B2F] dark:hover:text-[#D2A66F] hover:bg-slate-200/40 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Heart className={`w-4 h-4 ${savedCount > 0 ? 'fill-current text-rose-500' : ''}`} />
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
                    className="btn-accent w-full px-5 py-3.5 text-sm"
                  >
                    <Calendar className="w-4 h-4" />
                    Book a Session
                  </Link>
                </div>

                <div
                  className="stagger-in px-4 pt-3 pb-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-white/60 border-t border-slate-200 dark:border-white/10 mt-2"
                  style={{ '--i': NAV_LINKS.length + 2 } as CSSProperties}
                >
                  <a href="tel:+17174336793" className="inline-flex items-center gap-1.5 hover:text-[#9A6B2F] dark:hover:text-[#D2A66F] transition-colors">
                    <Phone className="w-3.5 h-3.5 text-[#D2A66F]" /> (717) 433-6793
                  </a>
                  <a href="mailto:info@irenturent.com" className="inline-flex items-center gap-1.5 hover:text-[#9A6B2F] dark:hover:text-[#D2A66F] transition-colors">
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
