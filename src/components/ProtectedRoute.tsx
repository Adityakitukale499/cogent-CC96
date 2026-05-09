import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  role?: UserRole;
}

export default function ProtectedRoute({ children, role }: Props) {
  const { firebaseUser, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-slate-500">Loading…</div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && profile?.role !== role) {
    const redirect = profile?.role === 'vendor' ? '/vendor' : '/';
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}
