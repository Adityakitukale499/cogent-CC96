import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Briefcase, ArrowRight } from 'lucide-react';
import { auth, db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { friendlyAuthError } from '../utils/authErrors';

type Mode = 'login' | 'signup';

export default function VendorLogin() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [mode, setMode] = useState<Mode>('login');

  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setBusy(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const profileSnap = await getDoc(doc(db, 'users', cred.user.uid));
      const role = profileSnap.exists() ? (profileSnap.data() as { role?: string }).role : undefined;
      if (role !== 'vendor') {
        setError('This account is not registered as a vendor.');
        await auth.signOut();
        return;
      }
      await refreshProfile();
      navigate('/vendor', { replace: true });
    } catch (err) {
      console.error('[Vendor login] failed:', err);
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSignup = async () => {
    setError(null);
    if (!businessName.trim()) { setError('Business name is required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: businessName.trim() });
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        role: 'vendor',
        name: businessName.trim(),
        vendorBusinessName: businessName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        createdAt: Date.now(),
      });
      await refreshProfile();
      navigate('/vendor', { replace: true });
    } catch (err) {
      console.error('[Vendor signup] failed:', err);
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card p-7">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-accent-500/10 text-accent-600 grid place-items-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-brand-800">Vendor portal</h1>
            <p className="text-sm text-slate-500">
              {mode === 'login' ? 'Log in to manage bookings & listings.' : 'Register your travel business.'}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className={`py-2 rounded-lg text-sm font-semibold ${
              mode === 'login' ? 'bg-white text-brand-700 shadow-soft' : 'text-slate-500'
            }`}
          >Login</button>
          <button
            onClick={() => { setMode('signup'); setError(null); }}
            className={`py-2 rounded-lg text-sm font-semibold ${
              mode === 'signup' ? 'bg-white text-brand-700 shadow-soft' : 'text-slate-500'
            }`}
          >Register</button>
        </div>

        {error && (
          <div className="mt-4 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-sm border border-rose-100">
            {error}
          </div>
        )}

        <div className="mt-5 space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="label">Business name</label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Sunshine Hotels Pvt Ltd"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Phone <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+911234567890"
                  className="input"
                />
              </div>
            </>
          )}

          <div>
            <label className="label">Business email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="bookings@yourhotel.com"
              className="input"
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input"
            />
          </div>

          <button
            onClick={mode === 'login' ? handleLogin : handleSignup}
            disabled={busy}
            className="btn-primary w-full"
          >
            {busy
              ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
              : <>{mode === 'login' ? 'Login as Vendor' : 'Create Vendor Account'} <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          Looking to book a trip?{' '}
          <Link to="/login" className="text-brand-700 font-semibold">Customer login</Link>
        </div>
      </div>
    </div>
  );
}
