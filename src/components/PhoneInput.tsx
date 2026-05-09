import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface Country {
  code: string;       // dial code, e.g. "+91"
  iso: string;        // ISO-3166 alpha-2, e.g. "IN"
  name: string;
  flag: string;       // emoji
  maxLen: number;     // max national number length (digits)
}

export const COUNTRIES: Country[] = [
  { code: '+91',  iso: 'IN', name: 'India',          flag: '🇮🇳', maxLen: 10 },
  { code: '+1',   iso: 'US', name: 'United States',  flag: '🇺🇸', maxLen: 10 },
  { code: '+44',  iso: 'GB', name: 'United Kingdom', flag: '🇬🇧', maxLen: 10 },
  { code: '+971', iso: 'AE', name: 'UAE',            flag: '🇦🇪', maxLen: 9  },
  { code: '+65',  iso: 'SG', name: 'Singapore',      flag: '🇸🇬', maxLen: 8  },
  { code: '+61',  iso: 'AU', name: 'Australia',      flag: '🇦🇺', maxLen: 9  },
  { code: '+1',   iso: 'CA', name: 'Canada',         flag: '🇨🇦', maxLen: 10 },
  { code: '+49',  iso: 'DE', name: 'Germany',        flag: '🇩🇪', maxLen: 11 },
  { code: '+33',  iso: 'FR', name: 'France',         flag: '🇫🇷', maxLen: 9  },
  { code: '+81',  iso: 'JP', name: 'Japan',          flag: '🇯🇵', maxLen: 10 },
  { code: '+86',  iso: 'CN', name: 'China',          flag: '🇨🇳', maxLen: 11 },
  { code: '+92',  iso: 'PK', name: 'Pakistan',       flag: '🇵🇰', maxLen: 10 },
  { code: '+880', iso: 'BD', name: 'Bangladesh',     flag: '🇧🇩', maxLen: 10 },
  { code: '+94',  iso: 'LK', name: 'Sri Lanka',      flag: '🇱🇰', maxLen: 9  },
  { code: '+977', iso: 'NP', name: 'Nepal',          flag: '🇳🇵', maxLen: 10 },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // India

interface Props {
  country: Country;
  number: string;
  onCountryChange: (c: Country) => void;
  onNumberChange: (n: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function PhoneInput({
  country, number, onCountryChange, onNumberChange, placeholder, disabled,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`flex rounded-lg border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-brand-400 focus-within:border-transparent overflow-visible ${disabled ? 'opacity-60' : ''}`}>
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className="h-full px-3 flex items-center gap-1.5 border-r border-slate-200 hover:bg-slate-50 rounded-l-lg text-slate-700 font-semibold"
        >
          <span className="text-lg leading-none">{country.flag}</span>
          <span className="text-sm">{country.code}</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>

        {open && (
          <>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-10 cursor-default"
              aria-hidden
            />
            <div className="absolute left-0 mt-1 z-20 w-72 max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white shadow-card">
              {COUNTRIES.map((c) => (
                <button
                  type="button"
                  key={`${c.iso}-${c.code}`}
                  onClick={() => { onCountryChange(c); setOpen(false); }}
                  className={`w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-brand-50 ${
                    c.iso === country.iso && c.code === country.code ? 'bg-brand-50/70 text-brand-700' : 'text-slate-700'
                  }`}
                >
                  <span className="text-lg leading-none">{c.flag}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-slate-500 font-semibold">{c.code}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <input
        type="tel"
        inputMode="numeric"
        disabled={disabled}
        value={number}
        onChange={(e) => onNumberChange(e.target.value.replace(/\D/g, '').slice(0, country.maxLen))}
        placeholder={placeholder ?? '9876543210'}
        className="flex-1 px-4 py-2.5 bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
      />
    </div>
  );
}

export function buildE164(country: Country, number: string): string {
  return `${country.code}${number.replace(/\D/g, '')}`;
}

export function isValidPhone(country: Country, number: string): boolean {
  const digits = number.replace(/\D/g, '');
  // most countries: 7-15 digits national; we'll require at least 7 and respect maxLen
  return digits.length >= 7 && digits.length <= country.maxLen;
}
