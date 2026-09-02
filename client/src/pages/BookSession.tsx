import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Home, Building2, Check, CalendarCheck, Clock, UserCheck, ShieldCheck, ArrowRight, Sparkles,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { leadsApi } from '../api/client';

const TIMES = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Interest = 'renting' | 'investing';

const INTEREST_OPTIONS: { value: Interest; label: string; desc: string; icon: typeof Home }[] = [
  { value: 'renting', label: 'Renting a Home', desc: 'Find a property to rent', icon: Home },
  { value: 'investing', label: 'Listing a Property', desc: 'Property management', icon: Building2 },
];

const EXPECT = [
  { icon: Clock, title: 'Quick Response', desc: 'We will confirm your session within 24 hours.' },
  { icon: UserCheck, title: 'Personalized Guidance', desc: 'Tailored to your specific renting or investing goals.' },
  { icon: ShieldCheck, title: 'Zero Cost', desc: 'No obligation, completely free consultation.' },
];

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDate(iso: string, opts: Intl.DateTimeFormatOptions) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', opts);
}

function upcomingDays(count: number) {
  const days: { iso: string; weekday: string; day: string }[] = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() + 1);
  while (days.length < count) {
    if (cursor.getDay() !== 0) { // skip Sundays (office closed)
      const iso = toISODate(cursor);
      days.push({
        iso,
        weekday: cursor.toLocaleDateString('en-US', { weekday: 'short' }),
        day: cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export default function BookSession() {
  const [searchParams] = useSearchParams();
  const defaultType = (searchParams.get('type') as Interest) || 'renting';

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    interest_type: defaultType as Interest,
    preferred_date: '', preferred_time: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [attempted, setAttempted] = useState(false);

  const quickDays = useMemo(() => upcomingDays(5), []);
  const today = useMemo(() => toISODate(new Date()), []);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const nameOk = form.full_name.trim().length > 0;
  const emailOk = EMAIL_RE.test(form.email.trim());
  const detailsOk = nameOk && emailOk;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAttempted(true);
    if (!nameOk) { setError('Please enter your full name.'); return; }
    if (!emailOk) { setError('Please enter a valid email address.'); return; }
    setSubmitting(true);
    try {
      await leadsApi.submit({ ...form, source: 'book_session' });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const summaryDate = formatDate(form.preferred_date, { weekday: 'long', month: 'long', day: 'numeric' });
  const interestLabel = INTEREST_OPTIONS.find(o => o.value === form.interest_type)?.label;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <div className="pt-28 lg:pt-32 pb-20">

        <section className="bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 py-12 relative overflow-hidden">
          <div className="absolute -top-24 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" aria-hidden="true" />
          <div className="container-xl relative">
            <span className="hero-in text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Consultation Request</span>
            <h1 className="hero-in font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1 mb-2" style={{ '--d': '0.1s' } as CSSProperties}>Book a Session</h1>
            <p className="hero-in text-slate-600 dark:text-slate-400 text-sm max-w-xl" style={{ '--d': '0.2s' } as CSSProperties}>Free, no-obligation session with our property team. Pick a time that suits you and we'll take it from there.</p>
          </div>
        </section>

        <div className="container-xl py-12">
          <div className="grid lg:grid-cols-3 gap-8 items-start">

            {/* Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="card-premium p-12 text-center zoom-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce-subtle">
                    <Check className="w-8 h-8" strokeWidth={2.5} />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">Session Requested</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-slate-900 dark:text-white">{form.full_name.trim()}</strong>! Our team will review your request and contact you at <strong className="text-slate-900 dark:text-white">{form.email.trim()}</strong> within 24 hours.
                  </p>
                  {(summaryDate || form.preferred_time) && (
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-50 dark:bg-gold-950/40 border border-gold-200 dark:border-gold-800/60 text-gold-700 dark:text-gold-300 text-sm font-semibold">
                      <CalendarCheck className="w-4 h-4" />
                      {summaryDate}{summaryDate && form.preferred_time ? ' · ' : ''}{form.preferred_time}
                    </div>
                  )}
                  <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/properties" className="btn-luxury">Browse Rentals <ArrowRight className="w-4 h-4" /></Link>
                    <Link to="/" className="btn-outline">Back to Home</Link>
                  </div>
                </div>
              ) : (
                <div className="card-premium p-6 sm:p-8">
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-6">Your Consultation Details</h2>
                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>

                    {/* Interest */}
                    <div>
                      <span className="label">I'm Interested In *</span>
                      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="I'm interested in">
                        {INTEREST_OPTIONS.map(opt => {
                          const active = form.interest_type === opt.value;
                          const Icon = opt.icon;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              onClick={() => set('interest_type', opt.value)}
                              className={`relative text-left border rounded-2xl p-4 transition-all duration-300 active:scale-[0.98] group ${
                                active
                                  ? 'border-gold-500 bg-gold-50/60 dark:bg-gold-950/30 shadow-premium -translate-y-0.5'
                                  : 'border-slate-200 dark:border-slate-800 hover:border-gold-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                              }`}
                            >
                              <span className={`absolute top-3 right-3 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 ${
                                active ? 'bg-gold-500 border-gold-500 text-white scale-100' : 'border-slate-300 dark:border-slate-700 scale-90'
                              }`}>
                                {active && <Check className="w-3 h-3" strokeWidth={3} />}
                              </span>
                              <span className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border transition-all duration-300 ${
                                active
                                  ? 'bg-gradient-to-br from-gold-500 to-gold-600 text-white border-gold-500'
                                  : 'bg-gold-50 dark:bg-gold-950/40 text-gold-600 dark:text-gold-400 border-gold-200 dark:border-gold-800/60 group-hover:scale-110'
                              }`}>
                                <Icon className="w-5 h-5" />
                              </span>
                              <div className="font-display font-bold text-slate-900 dark:text-white text-sm mb-0.5">{opt.label}</div>
                              <div className="text-slate-500 dark:text-slate-400 text-[11px]">{opt.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Name & Email */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label" htmlFor="bs-name">Full Name *</label>
                        <input
                          id="bs-name"
                          className={`input ${attempted && !nameOk ? 'input-error' : ''}`}
                          placeholder="John Smith"
                          autoComplete="name"
                          value={form.full_name}
                          onChange={e => set('full_name', e.target.value)}
                          aria-invalid={attempted && !nameOk}
                        />
                      </div>
                      <div>
                        <label className="label" htmlFor="bs-email">Email Address *</label>
                        <input
                          id="bs-email"
                          type="email"
                          className={`input ${attempted && !emailOk ? 'input-error' : ''}`}
                          placeholder="john@example.com"
                          autoComplete="email"
                          value={form.email}
                          onChange={e => set('email', e.target.value)}
                          aria-invalid={attempted && !emailOk}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label" htmlFor="bs-phone">Phone Number</label>
                      <input id="bs-phone" type="tel" className="input" placeholder="(717) 433-6793" autoComplete="tel" value={form.phone} onChange={e => set('phone', e.target.value)} />
                    </div>

                    {/* Date */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="label !mb-0" htmlFor="bs-date">Preferred Date</label>
                        {form.preferred_date && (
                          <button type="button" onClick={() => set('preferred_date', '')} className="text-[11px] font-semibold text-slate-400 hover:text-gold-500 transition-colors">Clear</button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {quickDays.map(d => {
                          const active = form.preferred_date === d.iso;
                          return (
                            <button
                              key={d.iso}
                              type="button"
                              onClick={() => set('preferred_date', active ? '' : d.iso)}
                              aria-pressed={active}
                              className={`flex flex-col items-center px-3.5 py-2 rounded-xl border text-xs transition-all duration-200 active:scale-95 ${
                                active
                                  ? 'bg-gold-500 border-gold-500 text-white shadow-premium'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-gold-500/60 hover:text-gold-600 dark:hover:text-gold-400'
                              }`}
                            >
                              <span className="font-bold uppercase tracking-wider text-[10px]">{d.weekday}</span>
                              <span className="font-semibold">{d.day}</span>
                            </button>
                          );
                        })}
                      </div>
                      <input
                        id="bs-date"
                        type="date"
                        className="input"
                        value={form.preferred_date}
                        min={today}
                        onChange={e => set('preferred_date', e.target.value)}
                        aria-label="Or pick another date"
                      />
                    </div>

                    {/* Time */}
                    <div>
                      <span className="label">Preferred Time</span>
                      <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Preferred time">
                        {TIMES.map(t => {
                          const active = form.preferred_time === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              onClick={() => set('preferred_time', active ? '' : t)}
                              className={`px-2 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 active:scale-95 ${
                                active
                                  ? 'bg-gold-500 border-gold-500 text-white shadow-premium'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-gold-500/60 hover:text-gold-600 dark:hover:text-gold-400'
                              }`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="label" htmlFor="bs-notes">Notes / Preferences</label>
                      <textarea
                        id="bs-notes"
                        className="input resize-none"
                        rows={3}
                        placeholder={form.interest_type === 'renting' ? 'Target location, budget, bedrooms...' : 'Property location, size, timeline...'}
                        value={form.message}
                        onChange={e => set('message', e.target.value)}
                      />
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-3.5 rounded-xl border border-red-200 dark:border-red-800/40" role="alert">{error}</p>}

                    <button type="submit" disabled={submitting} className="btn-luxury w-full py-3.5 text-base font-bold">
                      {submitting ? (
                        <><span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" /> Submitting...</>
                      ) : (
                        <><CalendarCheck className="w-5 h-5" /> Request Consultation</>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:sticky lg:top-28">
              {!submitted && (
                <div className="card-premium p-6 border-2 border-gold-500/20">
                  <h3 className="font-display font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold-500" /> Your Session
                  </h3>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500 dark:text-slate-400">Topic</dt>
                      <dd className="font-semibold text-slate-900 dark:text-white text-right">{interestLabel}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500 dark:text-slate-400">Date</dt>
                      <dd className={`font-semibold text-right ${summaryDate ? 'text-slate-900 dark:text-white' : 'text-slate-400 italic font-normal'}`}>
                        {summaryDate || 'Flexible'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500 dark:text-slate-400">Time</dt>
                      <dd className={`font-semibold text-right ${form.preferred_time ? 'text-slate-900 dark:text-white' : 'text-slate-400 italic font-normal'}`}>
                        {form.preferred_time || 'Flexible'}
                      </dd>
                    </div>
                  </dl>
                  <div className={`mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold transition-colors ${detailsOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${detailsOk ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700'}`}>
                      {detailsOk && <Check className="w-3 h-3" strokeWidth={3} />}
                    </span>
                    {detailsOk ? 'Contact details look good' : 'Add your name and email to continue'}
                  </div>
                </div>
              )}

              <div className="card-premium p-6">
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base mb-4">What to Expect</h3>
                <ul className="space-y-4">
                  {EXPECT.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.title} className="stagger-in flex gap-3 group" style={{ '--i': i } as CSSProperties}>
                        <span className="w-9 h-9 rounded-xl bg-gold-50 dark:bg-gold-950/40 border border-gold-200 dark:border-gold-800/60 text-gold-600 dark:text-gold-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white text-sm">{item.title}</div>
                          <div className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{item.desc}</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
