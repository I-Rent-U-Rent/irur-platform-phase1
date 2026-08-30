import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import Logo from './Logo';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navLinks = [
    {
      to: '/properties',
      label: 'Rental',
    },
    {
      to: '/how-it-works',
      label: 'How It Works',
    },
    {
      to: '/about',
      label: 'About Us',
    },
    {
      to: '/contact',
      label: 'Contact',
    },
  ];

  return (
    <header
      className={`
        fixed
        top-0
        left-0
        right-0
        z-50
        overflow-visible
        pt-[env(safe-area-inset-top)]
        bg-[#061B20]
        border-b
        border-white/10
        transition-all
        duration-300
        ${
          scrolled
            ? 'shadow-[0_8px_30px_rgba(0,0,0,0.30)]'
            : ''
        }
      `}
    >
      <div className="container-xl">

        {/* =====================================================
            MAIN NAVBAR
        ====================================================== */}
        <div className="flex items-center justify-between h-[4.5rem] sm:h-20 lg:h-[5.5rem]">

          {/* ===================================================
              LOGO
          ==================================================== */}
          <Link
            to="/"
            className="
              flex-shrink-0
              overflow-visible
              transition-opacity
              duration-200
              hover:opacity-90
            "
          >
            <Logo
              size="md"
              variant="light"
              showTagline={true}
            />
          </Link>

          {/* ===================================================
              DESKTOP NAVIGATION
          ==================================================== */}
          <nav className="hidden lg:flex items-center gap-1">

            {navLinks.map((link) => {
              const active = location.pathname === link.to;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    relative
                    px-4
                    py-2
                    rounded-xl
                    text-sm
                    font-medium
                    transition-all
                    duration-200

                    ${
                      active
                        ? `
                          text-[#D2A66F]
                          font-semibold
                          bg-white/10
                        `
                        : `
                          text-[#D7DDE0]
                          hover:text-[#D2A66F]
                          hover:bg-white/5
                        `
                    }
                  `}
                >
                  {link.label}

                  {/* Active Indicator */}
                  {active && (
                    <span
                      className="
                        absolute
                        bottom-0
                        left-4
                        right-4
                        h-0.5
                        rounded-full
                        bg-gradient-to-r
                        from-[#B88952]
                        to-[#D2A66F]
                      "
                    />
                  )}
                </Link>
              );
            })}

          </nav>

          {/* ===================================================
              DESKTOP RIGHT ACTIONS
          ==================================================== */}
          <div className="hidden lg:flex items-center gap-3">

            {/* Book a Session */}
            <Link
              to="/book-session"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-5
                py-2.5
                rounded-xl
                bg-[#E98A00]
                hover:bg-[#F29A0A]
                text-white
                text-sm
                font-semibold
                shadow-lg
                shadow-orange-900/20
                transition-all
                duration-200
                hover:-translate-y-0.5
              "
            >
              <Calendar className="w-4 h-4" />
              Book a Session
            </Link>

          </div>

          {/* ===================================================
              MOBILE ACTIONS
          ==================================================== */}
          <div className="flex items-center gap-2 lg:hidden">

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileOpen((open) => !open)}
              className="
                p-2.5
                rounded-xl
                text-slate-200
                hover:bg-white/10
                transition-colors
              "
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>

          </div>
        </div>

        {/* =====================================================
            MOBILE MENU
        ====================================================== */}
        {mobileOpen && (
          <div
            className="
              lg:hidden
              border-t
              border-white/10
              py-4
              space-y-2
              bg-[#061B20]
            "
          >

            {/* Mobile Navigation Links */}
            {navLinks.map((link) => {
              const active = location.pathname === link.to;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    block
                    px-4
                    py-3
                    rounded-xl
                    text-sm
                    font-medium
                    transition-colors

                    ${
                      active
                        ? `
                          text-[#D2A66F]
                          bg-white/10
                          font-semibold
                        `
                        : `
                          text-[#D7DDE0]
                          hover:text-[#D2A66F]
                          hover:bg-white/5
                        `
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Mobile CTA */}
            <div className="px-4 pt-2 pb-2">
              <Link
                to="/book-session"
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  w-full
                  px-5
                  py-3
                  rounded-xl
                  bg-[#E98A00]
                  hover:bg-[#F29A0A]
                  text-white
                  text-sm
                  font-semibold
                  transition-all
                "
              >
                <Calendar className="w-4 h-4" />
                Book a Session
              </Link>
            </div>

          </div>
        )}

      </div>
    </header>
  );
}
