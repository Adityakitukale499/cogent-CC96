import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Hotel, Plane, Car, Package, Search } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import { listenServices } from '../services/bookings';
import { ensureSeeded } from '../services/seed';
import type { Service, ServiceType } from '../types';

const FILTERS: { type: ServiceType | 'all'; label: string; icon: React.ReactNode }[] = [
  { type: 'all',     label: 'All',      icon: <Search  className="w-4 h-4" /> },
  { type: 'hotel',   label: 'Hotels',   icon: <Hotel   className="w-4 h-4" /> },
  { type: 'flight',  label: 'Flights',  icon: <Plane   className="w-4 h-4" /> },
  { type: 'cab',     label: 'Cabs',     icon: <Car     className="w-4 h-4" /> },
  { type: 'package', label: 'Packages', icon: <Package className="w-4 h-4" /> },
];

export default function Services() {
  const [params, setParams] = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState(params.get('q') || '');

  const activeType = (params.get('type') as ServiceType | null) || 'all';

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      await ensureSeeded();
      unsub = listenServices(setServices);
    })();
    return () => { if (unsub) unsub(); };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => {
      if (activeType !== 'all' && s.type !== activeType) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    });
  }, [services, activeType, search]);

  const setType = (t: ServiceType | 'all') => {
    const next = new URLSearchParams(params);
    if (t === 'all') next.delete('type'); else next.set('type', t);
    setParams(next, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-brand-800">Browse services</h1>
      <p className="text-slate-500">Pick a category and find your perfect deal.</p>

      <div className="mt-6 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.type}
              onClick={() => setType(f.type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition border ${
                activeType === f.type
                  ? 'bg-brand-600 text-white border-brand-600 shadow-soft'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-brand-700'
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
        <div className="md:ml-auto md:w-80">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, city or vendor"
            className="input"
          />
        </div>
      </div>

      <div className="mt-6 text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-700">{filtered.length}</span> result{filtered.length === 1 ? '' : 's'}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 mt-4 text-center text-slate-500">
          No services match your filters yet.
        </div>
      ) : (
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => <ServiceCard key={s.id} service={s} />)}
        </div>
      )}
    </div>
  );
}
