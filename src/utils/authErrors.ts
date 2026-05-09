// Maps Firebase auth error codes (and a few common operational errors)
// to short, user-friendly messages.

const FRIENDLY: Record<string, string> = {
  // Phone OTP — sending
  'auth/too-many-requests':
    'Too many attempts from this device. Please wait 15–30 minutes and try again, or switch network.',
  'auth/invalid-phone-number':
    'That phone number doesn\'t look right. Check the country code and digits, then try again.',
  'auth/missing-phone-number':
    'Please enter your phone number.',
  'auth/quota-exceeded':
    'SMS limit reached for now. Please try again in a little while.',
  'auth/captcha-check-failed':
    'Security check failed. Refresh the page and try once more.',
  'auth/invalid-app-credential':
    'Security check expired. Please refresh the page and try again.',
  'auth/app-not-authorized':
    'This app isn\'t authorised for phone sign-in. Please contact support.',
  'auth/operation-not-allowed':
    'Phone sign-in isn\'t enabled right now. Please contact support.',
  'auth/billing-not-enabled':
    'Phone OTP service is temporarily unavailable. Please try again later.',

  // Phone OTP — verifying
  'auth/invalid-verification-code':
    'That OTP is incorrect. Please re-check the code and try again.',
  'auth/missing-verification-code':
    'Please enter the 6-digit OTP we sent you.',
  'auth/code-expired':
    'Your OTP has expired. Tap "Resend OTP" to get a new one.',
  'auth/invalid-verification-id':
    'Verification session expired. Please request a new OTP.',

  // Email / password
  'auth/invalid-email':
    'Please enter a valid email address.',
  'auth/user-not-found':
    'No account found with this email. Try signing up instead.',
  'auth/wrong-password':
    'Incorrect password. Please try again.',
  'auth/invalid-credential':
    'Incorrect email or password. Please try again.',
  'auth/email-already-in-use':
    'An account with this email already exists. Try logging in.',
  'auth/weak-password':
    'Password is too weak. Use at least 6 characters.',
  'auth/user-disabled':
    'This account has been disabled. Please contact support.',

  // Generic
  'auth/network-request-failed':
    'Network error. Check your internet connection and try again.',
  'auth/popup-closed-by-user':
    'The sign-in window was closed. Please try again.',
  'auth/internal-error':
    'Something went wrong on our end. Please try again in a moment.',
  'auth/web-storage-unsupported':
    'Your browser blocks storage we need. Disable private mode or change browser.',
};

const FRIENDLY_TEXT_FALLBACKS: { match: RegExp; message: string }[] = [
  { match: /reCAPTCHA has already been rendered/i,
    message: 'Security check is stale. Please refresh the page and try again.' },
  { match: /network/i,
    message: 'Network error. Check your internet connection and try again.' },
];

export function friendlyAuthError(err: unknown): string {
  if (!err) return 'Something went wrong. Please try again.';

  const code = (err as { code?: string }).code;
  if (code && FRIENDLY[code]) return FRIENDLY[code];

  const message = err instanceof Error ? err.message : String(err);
  for (const f of FRIENDLY_TEXT_FALLBACKS) {
    if (f.match.test(message)) return f.message;
  }

  // Strip the "Firebase: ..." prefix and parenthesised codes for a cleaner fallback.
  const cleaned = message
    .replace(/^Firebase:\s*/i, '')
    .replace(/\s*\(auth\/[^)]+\)\.?$/, '')
    .trim();

  return cleaned || 'Something went wrong. Please try again.';
}
