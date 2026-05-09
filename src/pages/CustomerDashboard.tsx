import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { listenCustomerBookings } from '../services/bookings';
import BookingStatusBadge from '../components/BookingStatusBadge';
import type { Booking } from '../types';

export default function CustomerDashboard() {
  const { firebaseUser, profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    const unsub = listenCustomerBookings(firebaseUser.uid, (items) => {
      setBookings(items);
      setLoading(false);
    });
    return () => unsub();
  }, [firebaseUser]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-brand-800">My Bookings</h1>
      <p className="text-slate-500">Hi {profile?.name || 'traveller'}! Here's everything you've booked.</p>

      {loading ? (
        <div className="card p-10 mt-6 text-center text-slate-500">Loading your trips…</div>
      ) : bookings.length === 0 ? (
        <div className="card p-10 mt-6 text-center">
          <div className="text-slate-700 font-semibold">No bookings yet.</div>
          <p className="text-slate-500 mt-1">Find your next adventure on TripVerse.</p>
          <Link to="/services" className="btn-primary mt-4 inline-flex">Browse services</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {bookings.map((b) => (
            <div key={b.id} className="card p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-44 aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden bg-slate-100 shrink-0">
                <img src={b.serviceImage} alt={b.serviceTitle} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <span className="chip bg-brand-50 text-brand-700 capitalize">{b.serviceType}</span>
                  <BookingStatusBadge status={b.status} />
                </div>
                <h3 className="mt-1 font-bold text-slate-800 text-lg line-clamp-1">{b.serviceTitle}</h3>
                <div className="text-sm text-slate-500">By {b.vendorName}</div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {b.travelDate}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-4 h-4" /> {b.guests} guest{b.guests > 1 ? 's' : ''}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> Booking #{b.id.slice(0, 8)}
                  </span>
                </div>

                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Total paid</div>
                    <div className="text-lg font-extrabold text-brand-700">
                      ₹{b.totalAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    Booked on {new Date(b.createdAt).toLocaleDateString()}
                    {b.status === 'delivered' && b.deliveredAt && (
                      <div className="text-emerald-600 font-semibold">
                        Completed on {new Date(b.deliveredAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
