import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { leadsApi } from '../api/client';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', message: '', interest_type: 'renting' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.full_name || !form.email || !form.message) { setError('Please fill in all required fields.'); return; }
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

  const CONTACTS = [
    { title: 'Headquarters', icon: MapPin, lines: ['3927 Powell Road', 'Chester Springs, Pennsylvania 19425', 'United States'] },
    { title: 'Coverage Area', icon: Globe, lines: ['Pennsylvania (PA)', 'Florida (FL)'] },
    { title: 'Phone', icon: Phone, lines: ['(717) 433-6793', 'Mon–Sat, 9am–6pm EST'] },
    { title: 'Email', icon: Mail, lines: ['info@irenturent.com', 'support@irenturent.com'] },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B111A] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 bg-white dark:bg-[#0B111A] border-b border-slate-200/80 dark:border-slate-800">
        <div className="container-xl text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-500">Get In Touch</span>
          <h1 className="font-display text-4xl font-extrabold text-slate-900 dark:text-white mt-2 mb-4 tracking-tight">Contact IRENTURENT</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">Have a question or looking to list your property? We're here to help.</p>
        </div>
      </section>

      <section className="py-12 lg:py-20">
        <div className="container-xl max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Contact Info Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-6">Contact Information</h2>
              <div className="space-y-4">
                {CONTACTS.map(c => (
                  <div key={c.title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all hover:border-gold-500/30 flex items-start gap-4">
                    <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <c.icon className="w-5 h-5 text-gold-600 dark:text-gold-500" />
                    </div>
                    <div>
                      <div className="font-display font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2">{c.title}</div>
                      <div className="space-y-1">
                        {c.lines.map((line, i) => (
                          <div key={i} className="text-slate-600 dark:text-slate-400 text-sm">{line}</div>
                        ))}
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
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-500 flex items-center justify-center mb-6">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-3">Message Received</h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">Thank you for reaching out. We will get back to you at <strong className="text-slate-900 dark:text-slate-200">{form.email}</strong> shortly.</p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 lg:p-10">
                    <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-8">Send Us a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Full Name *</label>
                          <input 
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-gold-500/70 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-gold-500/40 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                            placeholder="John Smith" 
                            value={form.full_name} 
                            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Email *</label>
                          <input 
                            type="email" 
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-gold-500/70 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-gold-500/40 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                            placeholder="john@example.com" 
                            value={form.email} 
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Phone</label>
                          <input 
                            type="tel" 
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-gold-500/70 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-gold-500/40 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                            placeholder="(717) 433-6793" 
                            value={form.phone} 
                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">I'm Interested In</label>
                          <select 
                            className="w-full appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-gold-500/70 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-gold-500/40 transition-colors cursor-pointer" 
                            value={form.interest_type} 
                            onChange={e => setForm(f => ({ ...f, interest_type: e.target.value }))}
                          >
                            <option value="renting" className="dark:bg-slate-950">Renting a property</option>
                            <option value="investing" className="dark:bg-slate-950">Listing my property</option>
                            <option value="general" className="dark:bg-slate-950">General inquiry</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Message *</label>
                        <textarea 
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-gold-500/70 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-gold-500/40 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none" 
                          rows={5} 
                          placeholder="How can we help you?" 
                          value={form.message} 
                          onChange={e => setForm(f => ({ ...f, message: e.target.value }))} 
                        />
                      </div>
                      {error && <p className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</p>}
                      <button type="submit" disabled={submitting} className="btn-luxury w-full py-4 text-base mt-2">
                        {submitting ? 'Sending Message...' : 'Send Message'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Map */}
          <div className="mt-12 lg:mt-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-slate-900 dark:text-white text-lg">Headquarters</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">3927 Powell Road, Chester Springs, Pennsylvania 19425, United States</p>
              </div>
              <a href="https://maps.google.com/?q=3927+Powell+Road,+Chester+Springs,+Pennsylvania+19425" target="_blank" rel="noopener noreferrer" className="btn-outline dark:border-slate-700 whitespace-nowrap text-xs py-2">
                Get Directions
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
