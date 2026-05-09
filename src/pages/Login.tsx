import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Phone, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { auth, db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import PhoneInput, { Country, DEFAULT_COUNTRY, buildE164, isValidPhone } from '../components/PhoneInput';
import { friendlyAuthError } from '../utils/authErrors';

type Mode = 'phone' | 'email';
type Step = 'enter' | 'otp';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshProfile } = useAuth();

  const [mode, setMode] = useState<Mode>('phone');
  const [step, setStep] = useState<Step>('enter');

  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaParentRef = useRef<HTMLDivElement>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  useEffect(() => {
    return () => {
      if (verifierRef.current) {
        try { verifierRef.current.clear(); } catch { /* ignore */ }
        verifierRef.current = null;
      }
      if (recaptchaParentRef.current) recaptchaParentRef.current.innerHTML = '';
    };
  }, []);

  // Always create a brand-new RecaptchaVerifier on a fresh DOM element.
  // This avoids "reCAPTCHA already rendered" + stale-token errors after a failed attempt.
  const buildFreshVerifier = (): RecaptchaVerifier | null => {
    if (verifierRef.current) {
      try { verifierRef.current.clear(); } catch { /* ignore */ }
      verifierRef.current = null;
    }
    const parent = recaptchaParentRef.current;
    if (!parent) return null;
    parent.innerHTML = '';
    const fresh = document.createElement('div');
    parent.appendChild(fresh);
    verifierRef.current = new RecaptchaVerifier(auth, fresh, { size: 'invisible' });
    return verifierRef.current;
  };

  const routeAfterLogin = async (uid: string) => {
    await refreshProfile();
    const snap = await getDoc(doc(db, 'users', uid));
    const role = snap.exists() ? (snap.data() as { role?: string }).role : undefined;
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    if (role === 'vendor') navigate('/vendor', { replace: true });
    else navigate('/services', { replace: true });
  };

  const sendOtp = async () => {
    setError(null);
    if (!isValidPhone(country, phone)) {
      setError(`Please enter a valid ${country.name} phone number.`);
      return;
    }
    const verifier = buildFreshVerifier();
    if (!verifier) {
      setError('reCAPTCHA failed to initialise. Refresh and try again.');
      return;
    }
    setBusy(true);
    try {
      confirmationRef.current = await signInWithPhoneNumber(
        auth,
        buildE164(country, phone),
        verifier,
      );
      setStep('otp');
    } catch (err) {
      console.error('[OTP] sendOtp failed:', err);
      setError(friendlyAuthError(err));
      try { verifierRef.current?.clear(); } catch { /* ignore */ }
      verifierRef.current = null;
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    if (!confirmationRef.current) {
      setError('No active OTP request. Please resend.');
      return;
    }
    setBusy(true);
    try {
      const cred = await confirmationRef.current.confirm(otp);
      await routeAfterLogin(cred.user.uid);
    } catch (err) {
      console.error('[OTP] verifyOtp failed:', err);
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const emailLogin = async () => {
    setError(null);
    setBusy(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      await routeAfterLogin(cred.user.uid);
    } catch (err) {
      console.error('[Email login] failed:', err);
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card p-7">
        <h1 className="text-xl font-extrabold text-brand-800">Welcome back</h1>
        <p className="text-sm text-slate-500">Log in to manage your trips and bookings.</p>

        <div className="mt-5 grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
          <button
            onClick={() => { setMode('phone'); setStep('enter'); setError(null); }}
            className={`py-2 rounded-lg text-sm font-semibold ${
              mode === 'phone' ? 'bg-white text-brand-700 shadow-soft' : 'text-slate-500'
            }`}
          >
            <Phone className="w-4 h-4 inline -mt-0.5 mr-1" /> Phone OTP
          </button>
          <button
            onClick={() => { setMode('email'); setStep('enter'); setError(null); }}
            className={`py-2 rounded-lg text-sm font-semibold ${
              mode === 'email' ? 'bg-white text-brand-700 shadow-soft' : 'text-slate-500'
            }`}
          >
            <Mail className="w-4 h-4 inline -mt-0.5 mr-1" /> Email
          </button>
        </div>

        {error && (
          <div className="mt-4 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-sm border border-rose-100">
            {error}
          </div>
        )}

        {mode === 'phone' && step === 'enter' && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="label">Phone number</label>
              <PhoneInput
                country={country}
                number={phone}
                onCountryChange={setCountry}
                onNumberChange={setPhone}
                placeholder="7066994198"
              />
            </div>
            <button onClick={sendOtp} disabled={busy} className="btn-primary w-full">
              {busy ? 'Sending OTP…' : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        )}

        {mode === 'phone' && step === 'otp' && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="label">
                <ShieldCheck className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
                Enter 6-digit OTP sent to {buildE164(country, phone)}
              </label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                inputMode="numeric"
                className="input tracking-[0.5em] text-center font-bold text-lg"
              />
            </div>
            <button onClick={verifyOtp} disabled={busy} className="btn-primary w-full">
              {busy ? 'Verifying…' : 'Verify & Login'}
            </button>
            <button
              onClick={() => setStep('enter')}
              className="text-xs text-slate-500 hover:text-brand-700 font-semibold w-full text-center"
            >
              Edit phone number
            </button>
          </div>
        )}

        {mode === 'email' && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
            <button onClick={emailLogin} disabled={busy} className="btn-primary w-full">
              {busy ? 'Signing in…' : 'Login'}
            </button>
            <p className="text-xs text-slate-500 text-center">
              Email login is typically used by vendors. Customers usually sign in with phone OTP.
            </p>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-slate-500">
          New to TripVerse?{' '}
          <Link to="/signup" className="text-brand-700 font-semibold">Create an account</Link>
        </div>
        <div className="mt-1 text-center text-sm text-slate-500">
          Are you a vendor?{' '}
          <Link to="/vendor-login" className="text-brand-700 font-semibold">Vendor portal</Link>
        </div>

        <div ref={recaptchaParentRef} />
      </div>
    </div>
  );
}
