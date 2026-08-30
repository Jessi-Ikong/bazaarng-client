import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPendingVendors } from '../../services/adminService';
import Loader from '../../components/common/Loader';

const LINKS = [
  { to: '/admin/vendors', label: 'Vendors', description: 'Approve, reject, and review all vendors' },
  { to: '/admin/categories', label: 'Categories', description: 'Manage the category tree' },
  { to: '/admin/products', label: 'Products', description: 'Platform-wide product oversight' },
  { to: '/admin/orders', label: 'Orders', description: 'View every order across all vendors' },
];

export default function AdminDashboard() {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPendingVendors()
      .then((res) => setPendingCount(res.data.length))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="bg-primary-900 rounded-xl px-6 py-6 mb-6 text-white">
        <h1 className="font-heading text-xl font-semibold">Admin dashboard</h1>
        <p className="text-primary-100 text-sm mt-1">Platform oversight for KoboBuy</p>
      </div>

      {!loading && pendingCount > 0 && (
        <Link
          to="/admin/vendors"
          className="block bg-accent-50 border border-accent-200 text-accent-700 text-sm rounded-lg px-4 py-3 mb-6 hover:bg-accent-100"
        >
          {pendingCount} vendor{pendingCount > 1 ? 's' : ''} waiting for approval →
        </Link>
      )}
      {loading && <Loader />}

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
