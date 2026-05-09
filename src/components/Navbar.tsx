import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Plane, LogOut, User as UserIcon, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { profile, firebaseUser, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-semibold px-3 py-2 rounded-lg transition ${
      isActive ? 'text-brand-700 bg-brand-50' : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white">
            <Plane className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <div className="font-extrabold text-brand-800 text-lg">TripVerse</div>
            <div className="text-[11px] text-slate-500 -mt-0.5">Plan your perfect trip</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/services" className={navLinkClass}>Services</NavLink>
          {profile?.role === 'customer' && (
            <NavLink to="/my-bookings" className={navLinkClass}>My Bookings</NavLink>
          )}
          {profile?.role === 'vendor' && (
            <NavLink to="/vendor" className={navLinkClass}>Vendor Dashboard</NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {!firebaseUser ? (
            <>
              <Link to="/login" className="btn-ghost hidden sm:inline-flex">
                <UserIcon className="w-4 h-4" /> Login
              </Link>
              <Link to="/signup" className="btn-primary">
                Sign Up
              </Link>
              <Link to="/vendor-login" className="btn-ghost hidden md:inline-flex">
                <Briefcase className="w-4 h-4" /> List your business
              </Link>
            </>
          ) : (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-800">
                <div className="w-7 h-7 rounded-full bg-brand-500 text-white grid place-items-center font-bold text-sm">
                  {(profile?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <div className="font-semibold leading-tight">{profile?.name || 'User'}</div>
                  <div className="text-[10px] uppercase tracking-wide text-brand-600 leading-tight">
                    {profile?.role || 'guest'}
                  </div>
                </div>
              </div>
              <button onClick={handleSignOut} className="btn-ghost" title="Sign out">
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
