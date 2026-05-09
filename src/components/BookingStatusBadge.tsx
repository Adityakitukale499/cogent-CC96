import { Clock, CheckCircle2, PackageCheck, XCircle } from 'lucide-react';
import type { BookingStatus } from '../types';

const META: Record<BookingStatus, { label: string; tone: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',      tone: 'bg-amber-50 text-amber-700',     icon: <Clock          className="w-3.5 h-3.5" /> },
  accepted:  { label: 'Accepted',     tone: 'bg-blue-50 text-blue-700',       icon: <CheckCircle2  className="w-3.5 h-3.5" /> },
  delivered: { label: 'Delivered',    tone: 'bg-emerald-50 text-emerald-700', icon: <PackageCheck  className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Cancelled',    tone: 'bg-rose-50 text-rose-700',       icon: <XCircle       className="w-3.5 h-3.5" /> },
};

export default function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const m = META[status];
  return <span className={`chip ${m.tone}`}>{m.icon} {m.label}</span>;
}
