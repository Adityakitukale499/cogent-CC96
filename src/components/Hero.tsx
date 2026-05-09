import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel, Plane, Car, Package, Search, MapPin, Calendar, Users } from 'lucide-react';
import type { ServiceType } from '../types';

const TABS: { type: ServiceType; label: string; icon: React.ReactNode }[] = [
  { type: 'hotel', label: 'Hotels', icon: <Hotel className="w-4 h-4" /> },
  { type: 'flight', label: 'Flights', icon: <Plane className="w-4 h-4" /> },
  { type: 'cab', label: 'Cabs', icon: <Car className="w-4 h-4" /> },
  { type: 'package', label: 'Holiday Packages', icon: <Package className="w-4 h-4" /> },
];

export default function Hero() {
  const navigate = useNavigate();
  const [active, setActive] = useState<ServiceType>('hotel');
  const [where, setWhere] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('2');

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set('type', active);
    if (where) params.set('q', where);
    navigate(`/services?${params.toString()}`);
  };

  return (
    <section className="relative hero-bg hero-pattern">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32 text-white">
        <div className="max-w-2xl">
          <span className="chip bg-white/15 text-white border border-white/20">
            New • Trusted by 1M+ travellers
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold leading-tight">
            Plan your perfect trip with <span className="text-accent-500">TripVerse</span>
          </h1>
          <p className="mt-3 text-white/80 text-lg">
            Hotels, flights, cabs and curated holiday packages — all in one place. Book in seconds, travel with confidence.
          </p>
        </div>

        {/* Search card */}
        <div className="mt-10 card p-2 sm:p-3">
          <div className="flex flex-wrap gap-1 px-2 pt-2">
            {TABS.map((t) => (
              <button
                key={t.type}
                onClick={() => setActive(t.type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  active === t.type
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-500 hover:text-brand-700'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 mt-1">
            <div className="md:col-span-5">
              <label className="label">
                <MapPin className="w-3.5 h-3.5 inline -mt-0.5 mr-1" /> Where to?
              </label>
              <input
                value={where}
                onChange={(e) => setWhere(e.target.value)}
                placeholder="City, hotel, airport…"
                className="input"
              />
            </div>
            <div className="md:col-span-3">
              <label className="label">
                <Calendar className="w-3.5 h-3.5 inline -mt-0.5 mr-1" /> When
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">
                <Users className="w-3.5 h-3.5 inline -mt-0.5 mr-1" /> Guests
              </label>
              <input
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="input"
              />
            </div>
            <div className="md:col-span-2 flex items-end">
              <button onClick={handleSearch} className="btn-accent w-full h-[46px]">
                <Search className="w-4 h-4" /> Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
