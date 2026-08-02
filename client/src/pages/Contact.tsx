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
    { icon: '📍', title: 'Serving', lines: ['Pennsylvania (PA)', 'Florida (FL)'] },
    { icon: '📞', title: 'Phone', lines: ['(215) 555-0100', 'Mon–Sat, 9am–6pm EST'] },
    { icon: '📧', title: 'Email', lines: ['info@irur.com', 'support@irur.com'] },
    { icon: '⏰', title: 'Business Hours', lines: ['Mon–Fri: 9am – 6pm', 'Sat: 10am – 4pm'] },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-navy-900 to-navy-800">
        <div className="container-xl text-center">
          <h1 className="text-4xl font-extrabold text-white mb-3">Contact IRUR</h1>
          <p className="text-navy-300 text-lg max-w-xl mx-auto">Have a question or ready to get started? We'd love to hear from you.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-xl">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Contact Info */}
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-navy-900 mb-6">Get In Touch</h2>
              {CONTACTS.map(c => (
                <div key={c.title} className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">{c.icon}</div>
                  <div>
                    <div className="font-semibold text-navy-900 text-sm mb-1">{c.title}</div>
                    {c.lines.map(line => <div key={line} className="text-gray-500 text-sm">{line}</div>)}
                  </div>
                </div>
              ))}

              <div className="pt-4">
                <h3 className="font-semibold text-navy-900 mb-3 text-sm">Follow Us</h3>
                <div className="flex gap-3">
                  {[['F', 'Facebook'], ['I', 'Instagram'], ['L', 'LinkedIn']].map(([letter, name]) => (
                    <a key={name} href="#" title={name}
                      className="w-10 h-10 bg-navy-800 hover:bg-gold-500 rounded-lg flex items-center justify-center text-white text-xs font-bold transition-colors">
                      {letter}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="card p-10 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">✓</div>
                  <h3 className="text-xl font-bold text-emerald-700 mb-2">Message Received!</h3>
                  <p className="text-gray-500">We'll get back to you at <strong>{form.email}</strong> within 24 hours.</p>
                </div>
              ) : (
                <div className="card p-8">
                  <h2 className="text-xl font-bold text-navy-900 mb-6">Send a Message</h2>
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
                        <input type="tel" className="input" placeholder="(215) 555-0100" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label">I'm interested in</label>
                        <select className="input" value={form.interest_type} onChange={e => setForm(f => ({ ...f, interest_type: e.target.value }))}>
                          <option value="renting">Renting a property</option>
                          <option value="investing">Listing my property</option>
                          <option value="general">General inquiry</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="label">Message *</label>
                      <textarea className="input resize-none" rows={5} placeholder="How can we help you?"
                        value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                    </div>
                    {error && <p className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</p>}
                    <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 disabled:opacity-50">
                      {submitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="mt-12 card overflow-hidden">
            <div className="p-6">
              <h2 className="font-semibold text-navy-900">Our Coverage Areas</h2>
              <p className="text-gray-500 text-sm mt-1">IRUR manages properties across Pennsylvania and Florida.</p>
            </div>
            <div className="aspect-[16/6]">
              <iframe
                src="https://maps.google.com/maps?q=Pennsylvania+USA&output=embed"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" title="IRUR Coverage Map" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
