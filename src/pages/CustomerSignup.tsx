import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Phone, ShieldCheck, ArrowRight, RotateCw } from 'lucide-react';
import { auth, db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import PhoneInput, { Country, DEFAULT_COUNTRY, buildE164, isValidPhone } from '../components/PhoneInput';
import { friendlyAuthError } from '../utils/authErrors';

type Step = 'details' | 'otp' | 'done';

export default function CustomerSignup() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [step, setStep] = useState<Step>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaParentRef = useRef<HTMLDivElement>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

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

  // Resend countdown
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const validateDetails = () => {
    if (!name.trim()) return 'Please enter your full name.';
    if (!isValidPhone(country, phone)) {
      return `Please enter a valid ${country.name} phone number.`;
    }
    return null;
  };

  const sendOtp = async () => {
    setError(null);
    const v = validateDetails();
    if (v) {
      setError(v);
      return;
    }
    const verifier = buildFreshVerifier();
    if (!verifier) {
      setError('reCAPTCHA failed to initialise. Refresh and try again.');
      return;
    }
    setBusy(true);
    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        buildE164(country, phone),
        verifier,
      );
      confirmationRef.current = confirmation;
      setStep('otp');
      setResendIn(30);
    } catch (err) {
      console.error('[OTP] sendOtp failed:', err);
      setError(friendlyAuthError(err));
      // reset verifier so the next attempt starts fresh
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
    if (otp.length < 6) {
      setError('Enter the 6-digit OTP we sent to your phone.');
      return;
    }
    setBusy(true);
    try {
      const cred = await confirmationRef.current.confirm(otp);
      const user = cred.user;
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        role: 'customer',
        name: name.trim(),
        email: email.trim() || undefined,
        phone: buildE164(country, phone),
        createdAt: Date.now(),
      });
      await refreshProfile();
      setStep('done');
      setTimeout(() => navigate('/services'), 800);
    } catch (err) {
      console.error('[OTP] verifyOtp failed:', err);
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card p-7">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 grid place-items-center">
            {step === 'otp' ? <ShieldCheck className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-brand-800">
              {step === 'otp' ? 'Verify your phone' : 'Create your account'}
            </h1>
            <p className="text-sm text-slate-500">
              {step === 'otp'
                ? `We sent a 6-digit code to ${buildE164(country, phone)}.`
                : 'Sign up with your phone — we will send you an OTP.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-sm border border-rose-100">
            {error}
          </div>
        )}

        {step === 'details' && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="label">Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aditya Kitukale"
                className="input"
              />
            </div>
            <div>
              <label className="label">Email <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
              />
            </div>
            <div>
              <label className="label">Phone number</label>
              <PhoneInput
                country={country}
                number={phone}
                onCountryChange={setCountry}
                onNumberChange={setPhone}
                placeholder="7066994198"
              />
              <p className="mt-1 text-xs text-slate-500">
                Pick your country and enter your number — defaults to India (+91).
              </p>
            </div>
            <button onClick={sendOtp} disabled={busy} className="btn-primary w-full">
              {busy ? 'Sending OTP…' : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="label">6-digit OTP</label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                inputMode="numeric"
                className="input tracking-[0.5em] text-center font-bold text-lg"
              />
            </div>
            <button onClick={verifyOtp} disabled={busy} className="btn-primary w-full">
              {busy ? 'Verifying…' : <>Verify & Continue <ArrowRight className="w-4 h-4" /></>}
            </button>
            <div className="flex items-center justify-between text-xs">
              <button
                onClick={() => setStep('details')}
                className="text-slate-500 hover:text-brand-700 font-semibold"
              >
                Edit phone number
              </button>
              <button
                disabled={resendIn > 0 || busy}
                onClick={sendOtp}
                className="font-semibold text-brand-700 disabled:text-slate-400 inline-flex items-center gap-1"
              >
                <RotateCw className="w-3.5 h-3.5" />
                {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend OTP'}
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="mt-6 text-center text-emerald-700 font-semibold">
            Welcome aboard! Redirecting…
          </div>
        )}

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-700 font-semibold">Log in</Link>
        </div>

        <div ref={recaptchaParentRef} />
      </div>
    </div>
  );
}
