import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { Star, MapPin, Calendar, Users, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { createBooking } from '../services/bookings';
import type { Service } from '../types';

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { firebaseUser, profile } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [travelDate, setTravelDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'services', id));
        if (snap.exists()) {
          setService({ id: snap.id, ...(snap.data() as Omit<Service, 'id'>) });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const totalAmount = service ? service.price * guests : 0;

  const handleBook = async () => {
    if (!service) return;
    setError(null);

    if (!firebaseUser || !profile) {
      navigate('/login', { state: { from: { pathname: `/services/${service.id}` } } });
      return;
    }
    if (profile.role !== 'customer') {
      setError('Only customer accounts can book services.');
      return;
    }
    if (!travelDate) {
      setError('Please pick a travel date.');
      return;
    }

    setBusy(true);
    try {
      const id = await createBooking({
        serviceId: service.id,
        serviceTitle: service.title,
        serviceType: service.type,
        serviceImage: service.imageUrl,
        vendorId: service.vendorId,
        vendorName: service.vendorName,
        customerId: firebaseUser.uid,
        customerName: profile.name,
        customerPhone: profile.phone || '',
        travelDate,
        guests,
        totalAmount,
        status: 'pending',
        createdAt: Date.now(),
      });
      setSuccess(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create booking');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-16 text-slate-500">Loading…</div>;
  }
  if (!service) {
    return <div className="max-w-5xl mx-auto px-4 py-16 text-slate-500">Service not found.</div>;
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="card p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-brand-800">Booking placed!</h2>
          <p className="mt-2 text-slate-600">
            Your booking <span className="font-mono text-brand-700">{success.slice(0, 8)}</span> has been
            sent to <span className="font-semibold">{service.vendorName}</span>. They will review and accept it shortly.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <button onClick={() => navigate('/my-bookings')} className="btn-primary">
              View my bookings
            </button>
            <button onClick={() => navigate('/services')} className="btn-ghost">
              Browse more
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-slate-500 hover:text-brand-700 inline-flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="aspect-[16/9] bg-slate-100">
            <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover" />
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="chip bg-brand-50 text-brand-700 capitalize">{service.type}</span>
              <span className="chip bg-amber-50 text-amber-700">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {service.rating.toFixed(1)} rated
              </span>
              <span className="chip bg-emerald-50 text-emerald-700">By {service.vendorName}</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-brand-800">{service.title}</h1>
            <div className="mt-1 flex items-center gap-1 text-slate-500">
              <MapPin className="w-4 h-4" /> {service.location}
            </div>
            <p className="mt-4 text-slate-700 leading-relaxed">{service.description}</p>

            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50">
                <div className="text-xs text-slate-500">Free cancellation</div>
                <div className="font-bold text-slate-800">Up to 24h before</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <div className="text-xs text-slate-500">Instant confirmation</div>
                <div className="font-bold text-slate-800">Usually within 1h</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <div className="text-xs text-slate-500">Verified vendor</div>
                <div className="font-bold text-slate-800 inline-flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> TripVerse certified
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="card p-6 h-fit lg:sticky lg:top-20">
          <div className="text-sm text-slate-500">Starting at</div>
          <div className="text-3xl font-extrabold text-brand-700">
            ₹{service.price.toLocaleString('en-IN')}
            <span className="text-sm font-medium text-slate-500"> / person</span>
          </div>

          {error && (
            <div className="mt-4 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-sm border border-rose-100">
              {error}
            </div>
          )}

          <div className="mt-5 space-y-4">
            <div>
              <label className="label">
                <Calendar className="w-3.5 h-3.5 inline -mt-0.5 mr-1" /> Travel date
              </label>
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">
                <Users className="w-3.5 h-3.5 inline -mt-0.5 mr-1" /> Guests
              </label>
              <input
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
                className="input"
              />
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="flex justify-between text-sm text-slate-600">
                <span>{guests} × ₹{service.price.toLocaleString('en-IN')}</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between mt-2 font-extrabold text-brand-800 text-lg">
                <span>Total</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button onClick={handleBook} disabled={busy} className="btn-accent w-full">
              {busy ? 'Booking…' : 'Book now'}
            </button>
            {!firebaseUser && (
              <p className="text-xs text-center text-slate-500">
                You will be asked to log in or sign up to confirm.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
