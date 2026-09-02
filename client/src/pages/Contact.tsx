import { useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { leadsApi } from '../api/client';
import { MapPin, Phone, Mail, Globe, Check, ArrowRight, ExternalLink, Send } from 'lucide-react';

type Field = 'full_name' | 'email' | 'phone' | 'message';
const MESSAGE_MAX = 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s()+.-]{7,}$/;

const INITIAL_FORM = { full_name: '', email: '', phone: '', message: '', interest_type: 'renting' };

interface ContactLine { text: string; href?: string; external?: boolean; }
interface ContactCard { title: string; icon: typeof MapPin; lines: ContactLine[]; }

const CONTACTS: ContactCard[] = [
  {
    title: 'Headquarters',
    icon: MapPin,
    lines: [
      { text: '3927 Powell Road' },
      { text: 'Chester Springs, Pennsylvania 19425' },
      { text: 'Get directions', href: 'https://maps.google.com/?q=3927+Powell+Road,+Chester+Springs,+Pennsylvania+19425', external: true },
    ],
  },
  {
    title: 'Coverage Area',
    icon: Globe,
    lines: [
      { text: 'Pennsylvania (PA)', href: '/properties?search=PA' },
      { text: 'Florida (FL)', href: '/properties?search=FL' },
    ],
  },
  {
    title: 'Phone',
    icon: Phone,
    lines: [
      { text: '(717) 433-6793', href: 'tel:+17174336793' },
      { text: 'Mon–Sat, 9am–6pm EST' },
    ],
  },
  {
    title: 'Email',
    icon: Mail,
    lines: [
      { text: 'info@irenturent.com', href: 'mailto:info@irenturent.com' },
      { text: 'support@irenturent.com', href: 'mailto:support@irenturent.com' },
    ],
  },
];

const INTERESTS = [
  { value: 'renting', label: 'Renting a property' },
  { value: 'investing', label: 'Listing my property' },
  { value: 'general', label: 'General inquiry' },
];

export default function Contact() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const fieldRefs = useRef<Partial<Record<Field, HTMLInputElement | HTMLTextAreaElement | null>>>({});

  const errors = useMemo(() => {
    const e: Partial<Record<Field, string>> = {};
    if (!form.full_name.trim()) e.full_name = 'Please enter your name.';
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Enter a valid email address.';
    if (form.phone.trim() && !PHONE_RE.test(form.phone.trim())) e.phone = 'Enter a valid phone number.';
    if (form.message.trim().length < 10) e.message = 'Tell us a little more (at least 10 characters).';
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;
  const showError = (f: Field) => (touched[f] || attempted) ? errors[f] : undefined;
  const fieldClass = (f: Field) =>
    `w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 ${
      showError(f)
        ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/25'
        : (touched[f] && !errors[f])
          ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500/20'
          : 'border-slate-200 dark:border-slate-800 focus:border-gold-500/70 focus:ring-gold-500/30'
    }`;

  const setField = (f: Field | 'interest_type', value: string) => setForm(prev => ({ ...prev, [f]: value }));
  const blur = (f: Field) => setTouched(prev => ({ ...prev, [f]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAttempted(true);
    if (!isValid) {
      const first = (['full_name', 'email', 'phone', 'message'] as Field[]).find(f => errors[f]);
      if (first) fieldRefs.current[first]?.focus();
      return;
    }
    setSubmitting(true);
    try {
      await leadsApi.submit({ ...form, source: 'contact' });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm(INITIAL_FORM);
    setTouched({});
    setAttempted(false);
    setSubmitted(false);
    setError('');
  };

  const FieldError = ({ field }: { field: Field }) => {
    const msg = showError(field);
    return msg ? <p className="text-xs text-red-500 font-medium mt-1 zoom-in" role="alert">{msg}</p> : null;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B111A] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-gold-500/5 rounded-full blur-3xl" aria-hidden="true" />
        <div className="container-xl text-center relative">
          <span className="hero-in text-[11px] font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400">Get In Touch</span>
          <h1 className="hero-in font-display text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-2 mb-4 tracking-tight" style={{ '--d': '0.1s' } as CSSProperties}>Contact IRENTURENT</h1>
          <p className="hero-in text-slate-600 dark:text-slate-400 text-base max-w-xl mx-auto leading-relaxed" style={{ '--d': '0.2s' } as CSSProperties}>Have a question or looking to list your property? We're here to help.</p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-xl max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">

            {/* Contact info */}
            <div className="lg:col-span-4 space-y-5">
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-6">Contact Information</h2>
              <div className="space-y-4">
                {CONTACTS.map((c, i) => (
                  <div
                    key={c.title}
                    style={{ '--i': i } as CSSProperties}
                    className="stagger-in card-premium p-6 flex items-start gap-4 group hover-lift"
                  >
                    <div className="bg-gradient-to-br from-gold-50 to-amber-50 dark:from-gold-950 dark:to-amber-950 p-3 rounded-xl border border-gold-200 dark:border-gold-800/60 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 flex-shrink-0">
                      <c.icon className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2">{c.title}</div>
                      <div className="space-y-1">
                        {c.lines.map((line) => {
                          if (!line.href) {
                            return <div key={line.text} className="text-slate-600 dark:text-slate-400 text-sm">{line.text}</div>;
                          }
                          const cls = 'text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors inline-flex items-center gap-1.5 group/link';
                          if (line.href.startsWith('/')) {
                            return (
                              <Link key={line.text} to={line.href} className={cls}>
                                {line.text} <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                              </Link>
                            );
                          }
                          return (
                            <a
                              key={line.text}
                              href={line.href}
                              target={line.external ? '_blank' : undefined}
                              rel={line.external ? 'noopener noreferrer' : undefined}
                              className={cls}
                            >
                              {line.text}
                              {line.external
                                ? <ExternalLink className="w-3 h-3 opacity-60" />
                                : <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-8 flex justify-end">
              <div className="w-full max-w-3xl">
                {submitted ? (
                  <div className="card-premium p-12 text-center h-full flex flex-col items-center justify-center zoom-in">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 shadow-lg animate-bounce-subtle">
                      <Check className="w-10 h-10" strokeWidth={2.5} />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-3">Message Received</h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                      Thank you, <strong className="text-slate-900 dark:text-slate-200">{form.full_name.trim()}</strong>. We will get back to you at <strong className="text-slate-900 dark:text-slate-200">{form.email.trim()}</strong> shortly.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                      <Link to="/properties" className="btn-luxury">Browse Rentals <ArrowRight className="w-4 h-4" /></Link>
                      <button type="button" onClick={reset} className="btn-outline">Send another message</button>
                    </div>
                  </div>
                ) : (
                  <div className="card-premium p-8 lg:p-10">
                    <div className="flex items-start justify-between gap-4 mb-8">
                      <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Send Us a Message</h2>
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Replies within 24h
                      </span>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="c-name" className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Full Name *</label>
                          <input
                            id="c-name"
                            ref={el => { fieldRefs.current.full_name = el; }}
                            className={fieldClass('full_name')}
                            placeholder="John Smith"
                            autoComplete="name"
                            value={form.full_name}
                            onChange={e => setField('full_name', e.target.value)}
                            onBlur={() => blur('full_name')}
                            aria-invalid={!!showError('full_name')}
                          />
                          <FieldError field="full_name" />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="c-email" className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Email *</label>
                          <input
                            id="c-email"
                            ref={el => { fieldRefs.current.email = el; }}
                            type="email"
                            className={fieldClass('email')}
                            placeholder="john@example.com"
                            autoComplete="email"
                            value={form.email}
                            onChange={e => setField('email', e.target.value)}
                            onBlur={() => blur('email')}
                            aria-invalid={!!showError('email')}
                          />
                          <FieldError field="email" />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="c-phone" className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Phone</label>
                          <input
                            id="c-phone"
                            ref={el => { fieldRefs.current.phone = el; }}
                            type="tel"
                            className={fieldClass('phone')}
                            placeholder="(717) 433-6793"
                            autoComplete="tel"
                            value={form.phone}
                            onChange={e => setField('phone', e.target.value)}
                            onBlur={() => blur('phone')}
                            aria-invalid={!!showError('phone')}
                          />
                          <FieldError field="phone" />
                        </div>
                        <div className="space-y-2">
                          <span className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">I'm Interested In</span>
                          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Interest">
                            {INTERESTS.map(opt => {
                              const active = form.interest_type === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  role="radio"
                                  aria-checked={active}
                                  onClick={() => setField('interest_type', opt.value)}
                                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 active:scale-95 ${
                                    active
                                      ? 'bg-gold-500 text-white border-gold-500 shadow-premium'
                                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-gold-500/60 hover:text-gold-600 dark:hover:text-gold-400'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label htmlFor="c-message" className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Message *</label>
                          <span className={`text-[11px] font-medium tabular-nums ${form.message.length > MESSAGE_MAX * 0.9 ? 'text-amber-500' : 'text-slate-400'}`}>
                            {form.message.length}/{MESSAGE_MAX}
                          </span>
                        </div>
                        <textarea
                          id="c-message"
                          ref={el => { fieldRefs.current.message = el; }}
                          className={`${fieldClass('message')} resize-none`}
                          rows={5}
                          maxLength={MESSAGE_MAX}
                          placeholder="How can we help you?"
                          value={form.message}
                          onChange={e => setField('message', e.target.value)}
                          onBlur={() => blur('message')}
                          aria-invalid={!!showError('message')}
                        />
                        <FieldError field="message" />
                      </div>
                      {error && <p className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800/40" role="alert">{error}</p>}
                      <button type="submit" disabled={submitting} className="btn-luxury w-full py-4 text-base font-bold mt-2">
                        {submitting ? (
                          <><span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" /> Sending Message...</>
                        ) : (
                          <><Send className="w-4 h-4" /> Send Message</>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Map */}
          <div className="mt-12 lg:mt-16 card-premium overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-slate-900 dark:text-white text-lg">Headquarters</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">3927 Powell Road, Chester Springs, Pennsylvania 19425, United States</p>
              </div>
              <a href="https://maps.google.com/?q=3927+Powell+Road,+Chester+Springs,+Pennsylvania+19425" target="_blank" rel="noopener noreferrer" className="btn-outline dark:border-slate-700 whitespace-nowrap text-xs py-2">
                Get Directions <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="aspect-[21/9] sm:aspect-[24/7] bg-slate-100 dark:bg-slate-950 relative">
              <iframe
                src="https://maps.google.com/maps?q=3927+Powell+Road,+Chester+Springs,+Pennsylvania+19425,+United+States&output=embed"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                title="Headquarters map"
                className="absolute inset-0"
              />
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
