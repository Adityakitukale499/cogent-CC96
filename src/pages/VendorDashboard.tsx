import { useEffect, useMemo, useState } from 'react';
import {
  Calendar, Users, Phone, CheckCircle2, PackageCheck, Plus, Hotel, Plane, Car, Package,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  listenVendorBookings,
  updateBookingStatus,
  fetchVendorServices,
  createService,
} from '../services/bookings';
import BookingStatusBadge from '../components/BookingStatusBadge';
import type { Booking, BookingStatus, Service, ServiceType } from '../types';

const STATUS_TABS: { key: BookingStatus | 'all'; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'pending',   label: 'Pending' },
  { key: 'accepted',  label: 'Accepted' },
  { key: 'delivered', label: 'Delivered' },
];

const TYPE_ICON: Record<ServiceType, React.ReactNode> = {
  hotel:   <Hotel  className="w-4 h-4" />,
  flight:  <Plane  className="w-4 h-4" />,
  cab:     <Car    className="w-4 h-4" />,
  package: <Package className="w-4 h-4" />,
};

export default function VendorDashboard() {
  const { firebaseUser, profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<BookingStatus | 'all'>('all');
  const [services, setServices] = useState<Service[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;
    const unsub = listenVendorBookings(firebaseUser.uid, setBookings);
    fetchVendorServices(firebaseUser.uid).then(setServices);
    return () => unsub();
  }, [firebaseUser]);

  const counts = useMemo(() => {
    const c: Record<BookingStatus | 'all', number> = {
      all: bookings.length, pending: 0, accepted: 0, delivered: 0, cancelled: 0,
    };
    bookings.forEach((b) => { c[b.status] = (c[b.status] || 0) + 1; });
    return c;
  }, [bookings]);

  const filtered = tab === 'all' ? bookings : bookings.filter((b) => b.status === tab);

  const handleAccept = async (id: string) => updateBookingStatus(id, 'accepted');
  const handleDeliver = async (id: string) => updateBookingStatus(id, 'delivered');

  const refreshServices = async () => {
    if (!firebaseUser) return;
    const list = await fetchVendorServices(firebaseUser.uid);
    setServices(list);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-800">Vendor dashboard</h1>
          <p className="text-slate-500">
            Welcome back, <span className="font-semibold">{profile?.vendorBusinessName || profile?.name}</span>.
            Manage incoming bookings and your listings.
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-accent">
          <Plus className="w-4 h-4" /> Add new listing
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATUS_TABS.map((s) => (
          <button
            key={s.key}
            onClick={() => setTab(s.key)}
            className={`card p-4 text-left transition ${
              tab === s.key ? 'ring-2 ring-brand-400' : ''
            }`}
          >
            <div className="text-xs text-slate-500 uppercase tracking-wide">{s.label}</div>
            <div className="text-3xl font-extrabold text-brand-700">
              {counts[s.key] ?? 0}
            </div>
          </button>
        ))}
      </div>

      {/* Bookings */}
      <h2 className="mt-10 text-xl font-bold text-brand-800">Bookings</h2>
      {filtered.length === 0 ? (
        <div className="card p-10 mt-3 text-center text-slate-500">
          {tab === 'all' ? 'No bookings yet — your listings are visible to customers.' : `No ${tab} bookings.`}
        </div>
      ) : (
        <div className="mt-3 grid gap-3">
          {filtered.map((b) => (
            <div key={b.id} className="card p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-32 aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden bg-slate-100 shrink-0">
                <img src={b.serviceImage} alt={b.serviceTitle} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <span className="chip bg-brand-50 text-brand-700 capitalize">{b.serviceType}</span>
                  <BookingStatusBadge status={b.status} />
                  <span className="text-xs text-slate-400">#{b.id.slice(0, 8)}</span>
                </div>
                <h3 className="mt-1 font-bold text-slate-800 line-clamp-1">{b.serviceTitle}</h3>
                <div className="text-sm text-slate-600 mt-1">
                  <span className="font-semibold">Customer:</span> {b.customerName}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {b.travelDate}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-4 h-4" /> {b.guests}
                  </span>
                  {b.customerPhone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-4 h-4" /> {b.customerPhone}
                    </span>
                  )}
                  <span className="ml-auto font-bold text-brand-700">
                    ₹{b.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {b.status === 'pending' && (
                    <button onClick={() => handleAccept(b.id)} className="btn-primary !py-2 !px-4 text-sm">
                      <CheckCircle2 className="w-4 h-4" /> Accept booking
                    </button>
                  )}
                  {b.status === 'accepted' && (
                    <button onClick={() => handleDeliver(b.id)} className="btn-accent !py-2 !px-4 text-sm">
                      <PackageCheck className="w-4 h-4" /> Mark as delivered
                    </button>
                  )}
                  {b.status === 'delivered' && (
                    <span className="text-sm text-emerald-700 font-semibold inline-flex items-center gap-1">
                      <PackageCheck className="w-4 h-4" /> Service completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Listings */}
      <h2 className="mt-12 text-xl font-bold text-brand-800">My listings</h2>
      {services.length === 0 ? (
        <div className="card p-8 mt-3 text-center text-slate-500">
          You haven't created any listings yet.{' '}
          <button onClick={() => setShowAdd(true)} className="text-brand-700 font-semibold">
            Add your first one
          </button>.
        </div>
      ) : (
        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s.id} className="card overflow-hidden">
              <div className="aspect-[4/3] bg-slate-100">
                <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <span className="chip bg-brand-50 text-brand-700 capitalize inline-flex">
                  {TYPE_ICON[s.type]} {s.type}
                </span>
                <h3 className="mt-2 font-bold text-slate-800 line-clamp-1">{s.title}</h3>
                <div className="text-sm text-slate-500">{s.location}</div>
                <div className="mt-2 font-extrabold text-brand-700">
                  ₹{s.price.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddListingModal
          onClose={() => setShowAdd(false)}
          onCreated={async () => { setShowAdd(false); await refreshServices(); }}
        />
      )}
    </div>
  );
}

function AddListingModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => Promise<void> }) {
  const { firebaseUser, profile } = useAuth();
  const [type, setType] = useState<ServiceType>('hotel');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState<number>(2999);
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200',
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!firebaseUser || !profile) return;
    if (!title.trim() || !location.trim() || price <= 0) {
      setError('Title, location and a positive price are required.');
      return;
    }
    setBusy(true);
    try {
      await createService({
        vendorId: firebaseUser.uid,
        vendorName: profile.vendorBusinessName || profile.name,
        type,
        title: title.trim(),
        description: description.trim() || 'Great service.',
        location: location.trim(),
        price,
        imageUrl: imageUrl.trim(),
        rating: 4.7,
        createdAt: Date.now(),
      });
      await onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create listing');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-lg p-6 max-h-[90vh] overflow-auto"
      >
        <h3 className="text-xl font-extrabold text-brand-800">Add a new listing</h3>
        <p className="text-sm text-slate-500">Customers will see this on the services page.</p>

        {error && (
          <div className="mt-4 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-sm border border-rose-100">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-3">
          <div>
            <label className="label">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {(['hotel','flight','cab','package'] as ServiceType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-2 rounded-lg text-sm font-semibold border capitalize ${
                    type === t ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Beachside Villa, Goa" />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, country" />
          </div>
          <div>
            <label className="label">Price (₹ per person)</label>
            <input type="number" min={1} className="input" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Image URL</label>
            <input className="input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[80px]" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        <div className="mt-5 flex gap-2 justify-end">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={handleSubmit} disabled={busy} className="btn-primary">
            {busy ? 'Saving…' : 'Publish listing'}
          </button>
        </div>
      </div>
    </div>
  );
}
