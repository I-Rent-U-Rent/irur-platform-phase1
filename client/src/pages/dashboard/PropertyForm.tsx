import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { propertiesApi } from '../../api/client';

const AMENITY_OPTIONS = [
  'Community Pool','Fitness Center','2-Car Garage','1-Car Garage','Walking Trails','Playground',
  'Clubhouse','In-unit Laundry','Stainless Appliances','Granite Countertops','Quartz Countertops',
  'Hardwood Floors','Smart Home Features','Security System','Pet-Friendly Yard',
  'Private Backyard','Finished Basement','Home Office','EV Charging Outlet',
  'Rooftop Terrace','Dog Park','Beach Club Access','Screened Lanai',
];

const STATES = ['PA','FL','AL','AK','AZ','AR','CA','CO','CT','DE','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

export default function PropertyForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', address: '', city: '', state: 'PA', zip: '', community: '',
    rent: '', bedrooms: '3', bathrooms: '2', sqft: '',
    property_type: 'Townhome', furnished: false, pet_friendly: false,
    description: '', availability_date: '', status: 'available',
  });
  const [amenities, setAmenities] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEdit) return;
    propertiesApi.getOne(Number(id)).then(p => {
      setForm({
        title: p.title, address: p.address, city: p.city, state: p.state, zip: p.zip,
        community: p.community || '', rent: String(p.rent), bedrooms: String(p.bedrooms),
        bathrooms: String(p.bathrooms), sqft: String(p.sqft || ''),
        property_type: p.property_type, furnished: !!p.furnished, pet_friendly: !!p.pet_friendly,
        description: p.description || '', availability_date: p.availability_date || '',
        status: p.status,
      });
      setAmenities(p.amenities || []);
      setExistingPhotos(p.photos || []);
    }).catch(() => navigate('/employee/properties')).finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewPhotos(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setPhotoPreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeExisting = (url: string) => setExistingPhotos(p => p.filter(x => x !== url));
  const removeNew = (i: number) => {
    setNewPhotos(p => p.filter((_, idx) => idx !== i));
    setPhotoPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const toggleAmenity = (a: string) => setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { title, address, city, state, zip, rent, bedrooms, bathrooms } = form;
    if (!title || !address || !city || !state || !zip || !rent || !bedrooms || !bathrooms) {
      setError('Please fill in all required fields.'); return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v)));
      fd.append('amenities', JSON.stringify(amenities));
      if (isEdit) fd.append('existing_photos', JSON.stringify(existingPhotos));
      newPhotos.forEach(f => fd.append('photos', f));

      if (isEdit) await propertiesApi.update(Number(id), fd);
      else await propertiesApi.create(fd);

      navigate('/employee/properties');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-4xl text-slate-900 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/employee/properties" className="text-slate-400 hover:text-gold-600 dark:hover:text-gold-400 transition-colors text-lg">F818</Link>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
            {isEdit ? 'Edit Property' : 'Add New Property'}
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">Fill in property details to update or create a listing.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info */}
        <div className="card-premium p-6">
          <h2 className="font-display font-bold text-slate-900 dark:text-white text-base mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">Property Title *</label>
              <input
                className="input"
                placeholder="e.g. River Pointe Luxury Townhome F4CD Model A"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Community / Development Name</label>
              <input
                className="input"
                placeholder="e.g. Lennar River Pointe"
                value={form.community}
                onChange={e => setForm(f => ({ ...f, community: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Street Address *</label>
              <input
                className="input"
                placeholder="123 Main Street, Unit 5"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="label">City *</label>
                <input className="input" placeholder="Bridgeport" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
              </div>
              <div>
                <label className="label">State *</label>
                <select className="input cursor-pointer" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}>
                  {STATES.map(s => <option key={s} value={s} className="dark:bg-slate-900">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">ZIP *</label>
                <input className="input" placeholder="19405" maxLength={10} value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} />
              </div>
            </div>
          </div>
        </div>

        {/* Property Specs */}
        <div className="card-premium p-6">
          <h2 className="font-display font-bold text-slate-900 dark:text-white text-base mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Specifications
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Monthly Rent ($) *</label>
              <input type="number" className="input" placeholder="2400" value={form.rent} onChange={e => setForm(f => ({ ...f, rent: e.target.value }))} />
            </div>
            <div>
              <label className="label">Bedrooms *</label>
              <select className="input cursor-pointer" value={form.bedrooms} onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))}>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n} className="dark:bg-slate-900">{n}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Bathrooms *</label>
              <select className="input cursor-pointer" value={form.bathrooms} onChange={e => setForm(f => ({ ...f, bathrooms: e.target.value }))}>
                {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(n => <option key={n} value={n} className="dark:bg-slate-900">{n}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Square Feet</label>
              <input type="number" className="input" placeholder="1800" value={form.sqft} onChange={e => setForm(f => ({ ...f, sqft: e.target.value }))} />
            </div>
            <div>
              <label className="label">Property Type</label>
              <select className="input cursor-pointer" value={form.property_type} onChange={e => setForm(f => ({ ...f, property_type: e.target.value }))}>
                {['Townhome','Single Family','Condo','Apartment','Duplex'].map(t => <option key={t} value={t} className="dark:bg-slate-900">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input cursor-pointer" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="available" className="dark:bg-slate-900">F534 Available</option>
                <option value="occupied" className="dark:bg-slate-900">F4CD Occupied</option>
                <option value="maintenance" className="dark:bg-slate-900">F4DE Maintenance</option>
              </select>
            </div>
            <div>
              <label className="label">Availability Date</label>
              <input type="date" className="input" value={form.availability_date} onChange={e => setForm(f => ({ ...f, availability_date: e.target.value }))} />
            </div>
            <div className="flex items-center gap-6 pt-6 col-span-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={form.pet_friendly} onChange={e => setForm(f => ({ ...f, pet_friendly: e.target.checked }))} className="w-4 h-4 accent-gold-500" />
                <span>F436 Pet Friendly</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={form.furnished} onChange={e => setForm(f => ({ ...f, furnished: e.target.checked }))} className="w-4 h-4 accent-gold-500" />
                <span>F4CB Furnished</span>
              </label>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card-premium p-6">
          <h2 className="font-display font-bold text-slate-900 dark:text-white text-base mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Description
          </h2>
          <textarea
            className="input resize-none"
            rows={5}
            placeholder="Describe the property F4CD features, community benefits, nearby amenities..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>

        {/* Amenities */}
        <div className="card-premium p-6">
          <h2 className="font-display font-bold text-slate-900 dark:text-white text-base mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Amenities
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {AMENITY_OPTIONS.map(a => (
              <label
                key={a}
                className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  amenities.includes(a)
                    ? 'border-gold-500 bg-gold-50/60 dark:bg-gold-950/60 text-gold-600 dark:text-gold-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-gold-500/30'
                }`}
              >
                <input type="checkbox" checked={amenities.includes(a)} onChange={() => toggleAmenity(a)} className="sr-only" />
                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] flex-shrink-0 ${amenities.includes(a) ? 'bg-gold-500 border-gold-500 text-white' : 'border-slate-300'}`}>
                  {amenities.includes(a) && 'F4F9'}
                </span>
                <span>{a}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div className="card-premium p-6">
          <h2 className="font-display font-bold text-slate-900 dark:text-white text-base mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Photos
          </h2>

          {existingPhotos.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-slate-400 mb-2">Existing Photos</p>
              <div className="flex flex-wrap gap-3">
                {existingPhotos.map(url => (
                  <div key={url} className="relative group">
                    <img src={url} alt="" className="w-24 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                    <button
                      type="button"
                      onClick={() => removeExisting(url)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                       2715
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {photoPreviews.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-slate-400 mb-2">New Uploads</p>
              <div className="flex flex-wrap gap-3">
                {photoPreviews.map((prev, i) => (
                  <div key={i} className="relative group">
                    <img src={prev} alt="" className="w-24 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                    <button
                      type="button"
                      onClick={() => removeNew(i)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-md"
                    >
                       2715
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-gold-500 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-gold-600 transition-colors text-center"
          >
            <span className="text-2xl mr-2">F4F7</span>
            Click to upload photos (JPG, PNG, WEBP F4CD max 8MB each)
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
        </div>

        {error && <div className="text-red-500 text-xs font-semibold">{error}</div>}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-luxury">
            {saving ? 'Saving...' : isEdit ? 'Update Property' : 'Create Property'}
          </button>
          <Link to="/employee/properties" className="btn-secondary">
            Cancel
          </Link>
        </div>

      </form>
    </div>
  );
}
