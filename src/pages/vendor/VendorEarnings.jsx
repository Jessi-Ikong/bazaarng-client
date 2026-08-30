import { useEffect, useState } from 'react';
import { getVendorEarnings } from '../../services/earningsService';
import Loader from '../../components/common/Loader';

function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function VendorEarnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getVendorEarnings()
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load earnings.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  const { entries, summary } = data;

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold text-neutral-900 mb-4">Earnings</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-neutral-100 rounded-lg p-4">
          <p className="text-xs text-neutral-500 mb-1">Gross sales</p>
          <p className="font-heading font-semibold text-neutral-900">{formatNaira(summary.totalGross)}</p>
        </div>
        <div className="bg-white border border-neutral-100 rounded-lg p-4">
          <p className="text-xs text-neutral-500 mb-1">Platform fees</p>
          <p className="font-heading font-semibold text-neutral-900">{formatNaira(summary.totalFees)}</p>
        </div>
        <div className="bg-white border border-neutral-100 rounded-lg p-4">
          <p className="text-xs text-neutral-500 mb-1">Net earnings</p>
          <p className="font-heading font-semibold text-primary-800">{formatNaira(summary.totalNet)}</p>
        </div>
        <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
          <p className="text-xs text-accent-700 mb-1">Unpaid balance</p>
          <p className="font-heading font-semibold text-accent-700">{formatNaira(summary.unpaidNet)}</p>
        </div>
      </div>

      <p className="text-xs text-neutral-500 mb-4">
        Payouts aren't set up yet — this is a running record of what you've earned. Once payment integration
        lands, unpaid balances here will become actual withdrawals.
      </p>

      {entries.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-16">No earnings yet.</p>
      ) : (
        <div className="bg-white border border-neutral-100 rounded-lg divide-y divide-neutral-100">
          {entries.map((entry) => (
            <div key={entry._id} className="flex items-center justify-between p-4 flex-wrap gap-2">
              <div>
                <p className="text-sm text-neutral-900">
                  Order {entry.order?.checkoutGroupId?.slice(0, 8) || entry.order?._id?.slice(-6)}
                </p>
                <p className="text-xs text-neutral-500">
                  {new Date(entry.createdAt).toLocaleDateString()} · {entry.payoutStatus}
                </p>
              </div>
              <p className="font-heading font-semibold text-primary-800">{formatNaira(entry.netAmount)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
