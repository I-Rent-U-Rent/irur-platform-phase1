import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import { propertiesApi } from '../api/client';
import type { Property } from '../types';

export default function Properties() {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || searchParams.get('city') || '';
  const maxRent = searchParams.get('maxRent') || '';
  const beds = searchParams.get('beds') || '';

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (maxRent) params.maxRent = maxRent;
    if (beds) params.beds = beds;

    propertiesApi.getAll(params)
      .then(setProperties)
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [search, maxRent, beds]);

  const { available, remaining } = useMemo(() => ({
    available: properties.filter(property => property.status === 'available'),
    remaining: properties.filter(property => property.status !== 'available'),
  }), [properties]);

  const Cards = ({ items }: { items: Property[] }) => (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.map(property => <PropertyCard key={property.id} property={property} />)}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 lg:pt-28">
        <div className="bg-navy-900 py-12">
          <div className="container-xl">
            <h1 className="text-3xl font-bold text-white mb-2">Rental Properties</h1>
            <p className="text-navy-300">
              {search ? `Rental properties matching “${search}”.` : 'Properties managed by IRUR across Pennsylvania.'}
            </p>
          </div>
        </div>

        <div className="container-xl py-10">
          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="bg-gray-200 aspect-[4/3]" />
                  <div className="p-5 space-y-3"><div className="bg-gray-200 h-4 rounded w-3/4" /><div className="bg-gray-200 h-3 rounded w-1/2" /><div className="bg-gray-200 h-8 rounded" /></div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🏠</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No rental properties found</h2>
              <p className="text-gray-400">Try a different location, price, or bedroom count.</p>
            </div>
          ) : (
            <div className="space-y-14">
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-navy-900">Available Properties</h2>
                  <p className="text-sm text-gray-500 mt-1">{available.length} home{available.length === 1 ? '' : 's'} currently available to rent.</p>
                </div>
                {available.length ? <Cards items={available} /> : <p className="text-gray-500 bg-white rounded-xl p-6">There are no available rentals matching this search.</p>}
              </section>

              {remaining.length > 0 && (
                <section className="border-t border-gray-200 pt-12">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-navy-900">Other Properties</h2>
                    <p className="text-sm text-gray-500 mt-1">Previously listed, occupied, and properties not currently available.</p>
                  </div>
                  <Cards items={remaining} />
                </section>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
