import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Calendar } from 'lucide-react';
import Logo from './Logo';

const LINKS = [
  ['/', 'Home'],
  ['/properties', 'Rental'],
  ['/how-it-works', 'How It Works'],
  ['/about', 'About Us'],
  ['/contact', 'Contact Us'],
] as const;

export default function Footer() {
  // No surface of its own — it sits straight on the page background.
  return (
    <footer className="bg-transparent text-slate-600 dark:text-white/70">
      <div className="container-xl py-8 sm:py-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          {/* Brand */}
          <Link
            to="/"
            className="shrink-0 rounded-xl transition-opacity hover:opacity-90 focus-visible-ring"
            aria-label="IRENTURENT — home"
          >
            <Logo size="md" variant="auto" showTagline />
          </Link>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm" aria-label="Footer">
            {LINKS.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="text-slate-600 dark:text-white/70 hover:text-[#9A6B2F] dark:hover:text-[#D2A66F] transition-colors whitespace-nowrap"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 shrink-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
              <span className="inline-flex items-center gap-1.5 max-w-[18rem] sm:max-w-none">
                <MapPin className="w-3.5 h-3.5 text-[#D2A66F] shrink-0" />
                3927 Powell Road, Chester Springs, PA 19425
              </span>
              <a href="mailto:info@irenturent.com" className="inline-flex items-center gap-1.5 hover:text-[#9A6B2F] dark:hover:text-[#D2A66F] transition-colors">
                <Mail className="w-3.5 h-3.5 text-[#D2A66F] shrink-0" />
                info@irenturent.com
              </a>
              <a href="tel:+17174336793" className="inline-flex items-center gap-1.5 hover:text-[#9A6B2F] dark:hover:text-[#D2A66F] transition-colors">
                <Phone className="w-3.5 h-3.5 text-[#D2A66F] shrink-0" />
                (717) 433-6793
              </a>
            </div>
            <Link
              to="/book-session"
              className="btn-accent gap-1.5 px-4 py-2 text-xs whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5" />
              Book a Session
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-200/70 dark:border-white/10 mt-8 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-slate-500 dark:text-white/50">
          <p>© {new Date().getFullYear()} IRENTURENT. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-[#9A6B2F] dark:hover:text-[#D2A66F] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#9A6B2F] dark:hover:text-[#D2A66F] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
