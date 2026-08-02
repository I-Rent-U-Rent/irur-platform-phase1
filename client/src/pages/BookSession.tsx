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
      setError('Something went wrong. Please try again or call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-32">
        {/* Header */}
        <section className="bg-navy-900 py-12">
          <div className="container-xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Book a Consultation</h1>
            <p className="text-navy-300">Free, no-obligation session with our team. Tell us what you need and we'll find the right path forward.</p>
          </div>
        </section>

        <div className="container-xl py-12">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="card p-12 text-center">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✓</div>
                  <h2 className="text-2xl font-bold text-emerald-700 mb-3">Session Requested!</h2>
                  <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong>{form.full_name}</strong>! Our team will review your request and reach out to you at <strong>{form.email}</strong> within 24 hours to confirm your session.
                  </p>
                  <div className="mt-8 p-4 bg-gold-50 rounded-xl border border-gold-200">
                    <p className="text-gold-700 text-sm font-medium">Can't wait? Call us directly:</p>
                    <a href="tel:+12155550100" className="text-xl font-bold text-gold-600 hover:text-gold-700">(215) 555-0100</a>
                  </div>
                </div>
              ) : (
                <div className="card p-8">
                  <h2 className="text-xl font-bold text-navy-900 mb-6">Your Information</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Interest type */}
                    <div>
                      <label className="label">I'm interested in *</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { val: 'renting', label: '🏠 Renting a Home', desc: 'I want to find a rental property' },
                          { val: 'investing', label: '💼 Listing My Property', desc: 'I\'m an investor wanting to list' },
                        ].map(opt => (
                          <label key={opt.val} className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${form.interest_type === opt.val ? 'border-gold-500 bg-gold-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="radio" name="interest_type" value={opt.val} checked={form.interest_type === opt.val}
                              onChange={e => set('interest_type', e.target.value)} className="sr-only" />
                            <div className="font-semibold text-navy-900 text-sm mb-0.5">{opt.label}</div>
                            <div className="text-gray-400 text-xs">{opt.desc}</div>
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
                      <input type="tel" className="input" placeholder="(215) 555-0100" value={form.phone} onChange={e => set('phone', e.target.value)} />
                    </div>

                    {/* Date & Time */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Preferred Date</label>
                        <input type="date" className="input" value={form.preferred_date}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={e => set('preferred_date', e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Preferred Time</label>
                        <select className="input" value={form.preferred_time} onChange={e => set('preferred_time', e.target.value)}>
                          <option value="">Select a time</option>
                          {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="label">Tell us about your needs</label>
                      <textarea className="input resize-none" rows={4}
                        placeholder={form.interest_type === 'renting' ? 'What type of property are you looking for? Budget, location preferences, move-in timeline...' : 'Tell us about your property — location, size, current condition...'}
                        value={form.message} onChange={e => set('message', e.target.value)} />
                    </div>

                    {error && <p className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100">{error}</p>}

                    <button type="submit" disabled={submitting} className="btn-primary w-full py-4 text-base disabled:opacity-50">
                      {submitting ? 'Submitting...' : 'Request My Session'}
                    </button>

                    <p className="text-xs text-gray-400 text-center">
                      By submitting, you agree to be contacted by IRUR regarding your inquiry. We respect your privacy.
                    </p>
                  </form>
                </div>
              )}
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-bold text-navy-900 mb-4">What to Expect</h3>
                <div className="space-y-4">
                  {[
                    { icon: '⚡', title: 'Quick Response', desc: 'We\'ll confirm your session within 24 hours of submission.' },
                    { icon: '🎯', title: 'Personalized Advice', desc: 'Your session is tailored to your specific goals — renting or investing.' },
                    { icon: '🆓', title: 'Completely Free', desc: 'No obligation, no cost. Just an honest conversation about your options.' },
                    { icon: '📞', title: 'Flexible Format', desc: 'Phone, video call, or in-person — whatever works best for you.' },
                  ].map(item => (
                    <div key={item.title} className="flex gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="font-semibold text-navy-900 text-sm">{item.title}</div>
                        <div className="text-gray-500 text-xs">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6 bg-navy-900">
                <h3 className="font-semibold text-white mb-3">Prefer to call?</h3>
                <p className="text-navy-300 text-sm mb-4">Our team is available Mon–Sat, 9am–6pm EST.</p>
                <a href="tel:+12155550100" className="text-gold-400 font-bold text-xl hover:text-gold-300 block mb-2">(215) 555-0100</a>
                <a href="mailto:info@irur.com" className="text-gold-400 text-sm hover:text-gold-300">info@irur.com</a>
              </div>

              <div className="card p-6 bg-gold-50 border border-gold-200">
                <div className="text-3xl mb-3">🏆</div>
                <h3 className="font-semibold text-gold-800 mb-2">IRUR Promise</h3>
                <p className="text-gold-700 text-sm leading-relaxed">
                  Every IRUR consultation comes with complete transparency. No pressure, no hidden costs — just honest guidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
