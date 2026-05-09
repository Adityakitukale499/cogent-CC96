import { Link } from 'react-router-dom';
import { Star, MapPin, Hotel, Plane, Car, Package } from 'lucide-react';
import type { Service, ServiceType } from '../types';

const TYPE_META: Record<ServiceType, { label: string; icon: React.ReactNode; tone: string }> = {
  hotel:   { label: 'Hotel',   icon: <Hotel  className="w-3.5 h-3.5" />, tone: 'bg-blue-50 text-blue-700' },
  flight:  { label: 'Flight',  icon: <Plane  className="w-3.5 h-3.5" />, tone: 'bg-violet-50 text-violet-700' },
  cab:     { label: 'Cab',     icon: <Car    className="w-3.5 h-3.5" />, tone: 'bg-amber-50 text-amber-700' },
  package: { label: 'Package', icon: <Package className="w-3.5 h-3.5" />, tone: 'bg-emerald-50 text-emerald-700' },
};

export default function ServiceCard({ service }: { service: Service }) {
  const meta = TYPE_META[service.type];
  return (
    <Link
      to={`/services/${service.id}`}
      className="card overflow-hidden hover:shadow-card hover:-translate-y-0.5 transition group"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={service.imageUrl}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className={`chip ${meta.tone}`}>
            {meta.icon} {meta.label}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="chip bg-white/95 text-amber-600 shadow-soft">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            {service.rating.toFixed(1)}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-slate-800 line-clamp-1">{service.title}</h3>
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5" /> {service.location}
        </div>
        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{service.description}</p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="text-[11px] text-slate-500">Starting from</div>
            <div className="text-xl font-extrabold text-brand-700">
              ₹{service.price.toLocaleString('en-IN')}
            </div>
          </div>
          <span className="btn-primary !px-4 !py-2 text-sm">View Deal</span>
        </div>
      </div>
    </Link>
  );
}
