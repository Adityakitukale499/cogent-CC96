export type UserRole = 'customer' | 'vendor';

export interface UserProfile {
  uid: string;
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
  vendorBusinessName?: string;
  createdAt: number;
}

export type ServiceType = 'hotel' | 'flight' | 'cab' | 'package';

export interface Service {
  id: string;
  vendorId: string;
  vendorName: string;
  type: ServiceType;
  title: string;
  description: string;
  location: string;
  price: number;
  imageUrl: string;
  rating: number;
  createdAt: number;
}

export type BookingStatus = 'pending' | 'accepted' | 'delivered' | 'cancelled';

export interface Booking {
  id: string;
  serviceId: string;
  serviceTitle: string;
  serviceType: ServiceType;
  serviceImage: string;
  vendorId: string;
  vendorName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  travelDate: string;
  guests: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: number;
  acceptedAt?: number;
  deliveredAt?: number;
}
