import { Plane } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 bg-brand-900 text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 grid place-items-center text-white">
              <Plane className="w-5 h-5" />
            </div>
            <div className="font-extrabold text-white text-lg">TripVerse</div>
          </div>
          <p className="mt-3 text-sm text-white/60">
            India's friendliest travel companion. Hotels, flights, cabs and curated holidays — book in seconds.
          </p>
        </div>
        <div>
          <div className="font-semibold text-white mb-3">Company</div>
          <ul className="space-y-2 text-sm">
            <li>About us</li><li>Careers</li><li>Press</li><li>Blog</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-white mb-3">Support</div>
          <ul className="space-y-2 text-sm">
            <li>Contact</li><li>Cancellation</li><li>Refund policy</li><li>FAQs</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-white mb-3">Partner with us</div>
          <ul className="space-y-2 text-sm">
            <li>List your hotel</li><li>Become an airline partner</li><li>Cab operator</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} TripVerse. Demo project — for educational use.
      </div>
    </footer>
  );
}
