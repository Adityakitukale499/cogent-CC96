import { collection, getDocs, addDoc, query, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Service } from '../types';

const DEMO_SERVICES: Omit<Service, 'id'>[] = [
  {
    vendorId: 'demo-vendor-1',
    vendorName: 'Taj Hotels',
    type: 'hotel',
    title: 'Taj Lake Palace, Udaipur',
    description: 'A floating marble palace in the middle of Lake Pichola — luxury suites, lake-view dining, royal experience.',
    location: 'Udaipur, Rajasthan',
    price: 28999,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
    rating: 4.9,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    vendorId: 'demo-vendor-2',
    vendorName: 'IndiGo',
    type: 'flight',
    title: 'Delhi → Goa Direct',
    description: 'Non-stop flight, 2h 35m. Free cabin baggage and complimentary seat selection on premium fares.',
    location: 'DEL → GOI',
    price: 4499,
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200',
    rating: 4.5,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    vendorId: 'demo-vendor-3',
    vendorName: 'Ola Outstation',
    type: 'cab',
    title: 'Bengaluru → Mysuru Sedan',
    description: 'AC sedan, professional chauffeur, toll & taxes included. Door-to-door pickup and drop.',
    location: 'Bengaluru, Karnataka',
    price: 3299,
    imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200',
    rating: 4.6,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    vendorId: 'demo-vendor-4',
    vendorName: 'Thomas Cook',
    type: 'package',
    title: 'Bali Honeymoon — 5N/6D',
    description: 'Beach villa stay, candle-lit dinner, Ubud rice-terrace tour, airport transfers and breakfast included.',
    location: 'Bali, Indonesia',
    price: 84999,
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200',
    rating: 4.8,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    vendorId: 'demo-vendor-1',
    vendorName: 'Taj Hotels',
    type: 'hotel',
    title: 'Taj Mahal Palace, Mumbai',
    description: 'Iconic seafront luxury hotel facing the Gateway of India. Heritage rooms with Arabian-Sea views.',
    location: 'Mumbai, Maharashtra',
    price: 22499,
    imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200',
    rating: 4.9,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
  {
    vendorId: 'demo-vendor-2',
    vendorName: 'Vistara',
    type: 'flight',
    title: 'Mumbai → Dubai Premium',
    description: 'Premium-economy with 30kg baggage, lounge access at BOM and complimentary in-flight dining.',
    location: 'BOM → DXB',
    price: 18999,
    imageUrl: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=1200',
    rating: 4.7,
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
  },
];

let seeded = false;

export async function ensureSeeded() {
  if (seeded) return;
  try {
    const snap = await getDocs(query(collection(db, 'services'), limit(1)));
    if (!snap.empty) {
      seeded = true;
      return;
    }
    await Promise.all(
      DEMO_SERVICES.map((s) => addDoc(collection(db, 'services'), s)),
    );
    seeded = true;
  } catch (err) {
    console.warn('Seeding skipped:', err);
  }
}
