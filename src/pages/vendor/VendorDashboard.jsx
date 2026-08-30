import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyVendorProfile } from '../../services/vendorService';
import Loader from '../../components/common/Loader';

const STATUS_STYLES = {
  pending: 'bg-accent-50 text-accent-600',
  approved: 'bg-primary-50 text-primary-700',
  rejected: 'bg-red-50 text-red-600',
};

const LINKS = [
  { to: '/vendor/products', label: 'My products', description: 'Add, edit, or remove your listings' },
  { to: '/vendor/orders', label: 'Orders', description: 'View and update order status' },
  { to: '/vendor/offers', label: 'Offers', description: 'Respond to buyer price offers' },
  { to: '/vendor/earnings', label: 'Earnings', description: 'Track what you\'ve made so far' },
];

export default function VendorDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyVendorProfile()
      .then((res) => setProfile(res.data))
      .catch(() => setError('Could not load your store profile.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <div className="bg-primary-900 rounded-xl px-6 py-6 mb-6 text-white flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold">{profile?.storeName || 'Your store'}</h1>
          <p className="text-primary-100 text-sm mt-1">Vendor dashboard</p>
        </div>
        <span
          className={`text-xs font-medium px-3 py-1 rounded-md ${STATUS_STYLES[profile?.status] || 'bg-neutral-100 text-neutral-700'}`}
        >
          {profile?.status === 'pending' && 'Pending approval'}
          {profile?.status === 'approved' && 'Approved'}
          {profile?.status === 'rejected' && 'Rejected'}
        </span>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {profile?.status === 'pending' && (
        <div className="bg-accent-50 text-accent-700 text-sm rounded-lg px-4 py-3 mb-6">
          Your store is awaiting admin approval. You'll be able to list products once approved.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="bg-white border border-neutral-100 rounded-lg p-5 hover:shadow-md transition"
          >
            <p className="font-heading font-semibold text-neutral-900 mb-1">{link.label}</p>
            <p className="text-sm text-neutral-500">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
