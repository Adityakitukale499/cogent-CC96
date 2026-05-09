import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Headphones, BadgePercent, Sparkles } from 'lucide-react';
import Hero from '../components/Hero';
import ServiceCard from '../components/ServiceCard';
import { listenServices } from '../services/bookings';
import { ensureSeeded } from '../services/seed';
import type { Service } from '../types';

const FEATURES = [
  { icon: <ShieldCheck className="w-5 h-5" />, title: 'Secure payments', desc: 'Bank-grade encryption keeps your bookings safe.' },
  { icon: <Headphones className="w-5 h-5" />, title: '24×7 support', desc: 'Our team is one tap away, anywhere on the planet.' },
  { icon: <BadgePercent className="w-5 h-5" />, title: 'Best price guarantee', desc: 'See a lower price elsewhere? We will match it.' },
  { icon: <Sparkles  className="w-5 h-5" />, title: 'Curated experiences', desc: 'Hand-picked stays, flights and curated holiday packages.' },
];

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      await ensureSeeded();
      unsub = listenServices(setServices);
    })();
    return () => { if (unsub) unsub(); };
  }, []);

  const featured = services.slice(0, 6);

  return (
    <div>
      <Hero />

      {/* Floating features over hero/transition */}
      <section className="-mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center shrink-0">
                  {f.icon}
                </div>
                <div>
                  <div className="font-bold text-slate-800">{f.title}</div>
                  <div className="text-sm text-slate-500">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-800">Featured deals</h2>
            <p className="text-slate-500">Hand-picked stays, flights and getaways for you.</p>
          </div>
          <Link to="/services" className="btn-ghost">View all</Link>
        </div>

        {featured.length === 0 ? (
          <div className="card p-10 text-center text-slate-500">
            Loading the best deals for you…
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((s) => <ServiceCard key={s.id} service={s} />)}
          </div>
        )}
      </section>

      {/* CTA strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="card p-8 sm:p-10 bg-gradient-to-br from-brand-700 to-brand-900 text-white border-0">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-extrabold">Run a hotel, airline or cab service?</h3>
              <p className="mt-1 text-white/80 max-w-2xl">
                List your business on TripVerse, accept bookings from millions of travellers, and grow your brand with our partner tools.
              </p>
            </div>
            <Link to="/vendor-login" className="btn-accent">Become a vendor</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
