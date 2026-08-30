import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { leadsApi } from '../api/client';

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
    { title: 'Headquarters', lines: ['3927 Powell Road', 'Chester Springs, Pennsylvania 19425', 'United States'] },
    { title: 'Coverage Area', lines: ['Pennsylvania (PA)', 'Florida (FL)'] },
    { title: 'Phone', lines: ['(717) 433-6793', 'Mon–Sat, 9am–6pm EST'] },
    { title: 'Email', lines: ['info@irenturent.com', 'support@irenturent.com'] },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        <div className="container-xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Get In Touch</span>
          <h1 className="font-display text-4xl font-extrabold text-slate-900 dark:text-white mt-1 mb-3">Contact IRENTURENT</h1>
          <p className="text-slate-600 dark:text-slate-400 text-base max-w-xl mx-auto">Have a question or looking to list your property? We're here to help.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-xl">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Contact Info Sidebar */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-4">Contact Information</h2>
              {CONTACTS.map(c => (
                <div key={c.title} className="card p-5">
                  <div className="font-display font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">{c.title}</div>
                  {c.lines.map(line => <div key={line} className="text-slate-600 dark:text-slate-400 text-xs">{line}</div>)}
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="card p-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl mx-auto mb-3">✓</div>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-2">Message Received</h3>
                  <p className="text-slate-500 text-sm">Thank you. We will get back to you at <strong>{form.email}</strong> within 24 hours.</p>
                </div>
              ) : (
                <div className="card p-8">
                  <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-6">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Full Name *</label>
                        <input className="input" placeholder="John Smith" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label">Email *</label>
                        <input type="email" className="input" placeholder="john@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Phone</label>
                        <input type="tel" className="input" placeholder="(717) 433-6793" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label">I'm Interested In</label>
                        <select className="input cursor-pointer" value={form.interest_type} onChange={e => setForm(f => ({ ...f, interest_type: e.target.value }))}>
                          <option value="renting" className="dark:bg-slate-900">Renting a property</option>
                          <option value="investing" className="dark:bg-slate-900">Listing my property</option>
                          <option value="general" className="dark:bg-slate-900">General inquiry</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="label">Message *</label>
                      <textarea className="input resize-none" rows={4} placeholder="How can we help you?" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                    </div>
                    {error && <p className="text-red-500 text-xs">{error}</p>}
                    <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
                      {submitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </div>
              )}
            </div>

          </div>

          {/* Map */}
          <div className="mt-12 card overflow-hidden">
            <div className="p-6 pb-4">
              <h2 className="font-display font-bold text-slate-900 dark:text-white text-base">Headquarters</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">3927 Powell Road, Chester Springs, Pennsylvania 19425, United States</p>
            </div>
            <div className="aspect-[16/6]">
              <iframe
                src="https://maps.google.com/maps?q=3927+Powell+Road,+Chester+Springs,+Pennsylvania+19425,+United+States&output=embed"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                title="Headquarters map" />
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
