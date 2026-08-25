import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { leadsApi } from '../api/client';

const TIMES = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

export default function BookSession() {
  const [searchParams] = useSearchParams();
  const defaultType = (searchParams.get('type') as 'renting' | 'investing') || 'renting';

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    interest_type: defaultType,
    preferred_date: '', preferred_time: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.full_name.trim()) { setError('Please enter your full name.'); return; }
    if (!form.email.trim() || !form.email.includes('@')) { setError('Please enter a valid email address.'); return; }
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <div className="pt-28 lg:pt-32 pb-20">
        
        {/* Header */}
        <section className="bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 py-12">
          <div className="container-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Consultation Request</span>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1 mb-2">Book a Session</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl">Free, no-obligation session with our property team.</p>
          </div>
        </section>

        <div className="container-xl py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Form Column */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="card p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl mx-auto mb-4">✓</div>
                  <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">Session Requested</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                    Thank you, <strong>{form.full_name}</strong>! Our team will review your request and contact you at <strong>{form.email}</strong> within 24 hours.
                  </p>
                </div>
              ) : (
                <div className="card p-8">
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-6">Your Consultation Details</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Interest Type */}
                    <div>
                      <label className="label">I'm Interested In *</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { val: 'renting', label: '🏠 Renting a Home', desc: 'Find a property to rent' },
                          { val: 'investing', label: '💼 Listing Property', desc: 'Property management' },
                        ].map(opt => (
                          <label
                            key={opt.val}
                            className={`cursor-pointer border rounded-xl p-4 transition-all ${
                              form.interest_type === opt.val
                                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="interest_type"
                              value={opt.val}
                              checked={form.interest_type === opt.val}
                              onChange={e => set('interest_type', e.target.value)}
                              className="sr-only"
                            />
                            <div className="font-display font-bold text-slate-900 dark:text-white text-xs mb-0.5">{opt.label}</div>
                            <div className="text-slate-500 text-[11px]">{opt.desc}</div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Name & Email */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Full Name *</label>
                        <input className="input" placeholder="John Smith" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Email Address *</label>
                        <input type="email" className="input" placeholder="john@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="label">Phone Number</label>
                      <input type="tel" className="input" placeholder="(717) 433-6793" value={form.phone} onChange={e => set('phone', e.target.value)} />
                    </div>

                    {/* Date & Time */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Preferred Date</label>
                        <input
                          type="date"
                          className="input"
                          value={form.preferred_date}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={e => set('preferred_date', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Preferred Time</label>
                        <select className="input cursor-pointer" value={form.preferred_time} onChange={e => set('preferred_time', e.target.value)}>
                          <option value="" className="dark:bg-slate-900">Select a time</option>
                          {TIMES.map(t => <option key={t} value={t} className="dark:bg-slate-900">{t}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="label">Notes / Preferences</label>
                      <textarea
                        className="input resize-none"
                        rows={3}
                        placeholder={form.interest_type === 'renting' ? 'Target location, budget, bedrooms...' : 'Property location, size, timeline...'}
                        value={form.message}
                        onChange={e => set('message', e.target.value)}
                      />
                    </div>

                    {error && <p className="text-red-500 text-xs">{error}</p>}

                    <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
                      {submitting ? 'Submitting...' : 'Request Consultation'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base mb-4">What to Expect</h3>
                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex gap-2.5">
                    <span className="font-bold text-brand-500">✓</span>
                    <span><strong>Quick Response:</strong> We will confirm your session within 24 hours.</span>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="font-bold text-brand-500">✓</span>
                    <span><strong>Personalized Guidance:</strong> Tailored to your specific renting or investing goals.</span>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="font-bold text-brand-500">✓</span>
                    <span><strong>Zero Cost:</strong> No obligation, completely free consultation.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
