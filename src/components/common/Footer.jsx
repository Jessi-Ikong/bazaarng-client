import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function Footer() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => {
        const topLevel = res.data.filter((c) => !c.parentCategory).slice(0, 6);
        setCategories(topLevel);
      })
      .catch(() => setCategories([]));
  }, []);

  return (
    <footer className="bg-primary-900 text-neutral-100 mt-12">
      <div className="max-w-7xl mx-auto px-4 pt-6">
        {/* Trust row */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-1.5 pb-5 border-b border-primary-800 text-sm text-primary-100">
          <span className="flex items-center gap-1.5">
            <i className="ti ti-shield-check text-accent-200" /> Verified vendors
          </span>
          <span className="flex items-center gap-1.5">
            <i className="ti ti-arrows-exchange text-accent-200" /> Negotiable pricing
          </span>
          <span className="flex items-center gap-1.5">
            <i className="ti ti-lock text-accent-200" /> Secure checkout
          </span>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6">
          <div>
            <p className="font-heading text-xs font-semibold text-accent-200 uppercase tracking-wide mb-2">
              Company
            </p>
            <ul className="space-y-1.5 text-sm text-primary-100">
              <li><a href="mailto:support@bazaarng.com" className="hover:text-white">Contact us</a></li>
              <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-heading text-xs font-semibold text-accent-200 uppercase tracking-wide mb-2">
              Customer
            </p>
            <ul className="space-y-1.5 text-sm text-primary-100">
              <li><Link to="/orders" className="hover:text-white">Track orders</Link></li>
              <li><Link to="/wishlist" className="hover:text-white">Wishlist</Link></li>
              <li><Link to="/my-offers" className="hover:text-white">My offers</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-heading text-xs font-semibold text-accent-200 uppercase tracking-wide mb-2">
              Sell on BazaarNG
            </p>
            <ul className="space-y-1.5 text-sm text-primary-100">
              <li><Link to="/register-vendor" className="hover:text-white">Become a vendor</Link></li>
              <li><Link to="/vendor" className="hover:text-white">Vendor dashboard</Link></li>
            </ul>
          </div>

          {categories.length > 0 && (
            <div>
              <p className="font-heading text-xs font-semibold text-accent-200 uppercase tracking-wide mb-2">
                Categories
              </p>
              <ul className="space-y-1.5 text-sm text-primary-100">
                {categories.map((c) => (
                  <li key={c._id}>
                    <Link to={`/category/${c.slug}`} className="hover:text-white">{c.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom bar: logo, payment badges, social icons, and copyright
            all share one row now instead of stacking as separate sections. */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4 border-t border-primary-800 text-xs">
          <p className="font-heading font-semibold text-sm shrink-0">
            Bazaar<span className="text-accent-200">NG</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-primary-200">
            <span className="flex items-center gap-1"><i className="ti ti-shield-lock text-accent-200" /> Paystack</span>
            <span className="flex items-center gap-1"><i className="ti ti-credit-card text-accent-200" /> Card</span>
            <span className="flex items-center gap-1"><i className="ti ti-building-bank text-accent-200" /> Bank transfer</span>
          </div>

          <div className="flex items-center gap-3 text-base text-primary-200 shrink-0">
            <a href="#" aria-label="Instagram" className="hover:text-white"><i className="ti ti-brand-instagram" /></a>
            <a href="#" aria-label="X (Twitter)" className="hover:text-white"><i className="ti ti-brand-x" /></a>
            <a href="#" aria-label="Facebook" className="hover:text-white"><i className="ti ti-brand-facebook" /></a>
          </div>

          <p className="text-neutral-400 shrink-0">© {new Date().getFullYear()} BazaarNG</p>
        </div>
      </div>
    </footer>
  );
}
