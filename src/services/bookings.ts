import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Booking, BookingStatus, Service } from '../types';

export function listenServices(cb: (services: Service[]) => void) {
  const q = query(collection(db, 'services'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Service, 'id'>) }));
    cb(items);
  });
}

export async function fetchVendorServices(vendorId: string): Promise<Service[]> {
  const q = query(collection(db, 'services'), where('vendorId', '==', vendorId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Service, 'id'>) }));
}

export async function createService(s: Omit<Service, 'id'>) {
  const ref = await addDoc(collection(db, 'services'), s);
  return ref.id;
}

export async function createBooking(b: Omit<Booking, 'id'>) {
  const ref = await addDoc(collection(db, 'bookings'), b);
  return ref.id;
}

export function listenCustomerBookings(customerId: string, cb: (bookings: Booking[]) => void) {
  const q = query(collection(db, 'bookings'), where('customerId', '==', customerId));
  return onSnapshot(q, (snap) => {
    const items = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Booking, 'id'>) }))
      .sort((a, b) => b.createdAt - a.createdAt);
    cb(items);
  });
}

export function listenVendorBookings(vendorId: string, cb: (bookings: Booking[]) => void) {
  const q = query(collection(db, 'bookings'), where('vendorId', '==', vendorId));
  return onSnapshot(q, (snap) => {
    const items = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Booking, 'id'>) }))
      .sort((a, b) => b.createdAt - a.createdAt);
    cb(items);
  });
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  const patch: Record<string, unknown> = { status };
  if (status === 'accepted') patch.acceptedAt = Date.now();
  if (status === 'delivered') patch.deliveredAt = Date.now();
  await updateDoc(doc(db, 'bookings', bookingId), patch);
}
