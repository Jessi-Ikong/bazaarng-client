import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { getAdminAnalytics } from '../../services/analyticsService';
import Loader from '../../components/common/Loader';

function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminAnalytics()
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  const { platformSalesOverTime, topVendors, summary } = data;

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold text-neutral-900 mb-4">Platform analytics</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-neutral-100 rounded-lg p-4">
          <p className="text-xs text-neutral-500 mb-1">Total users</p>
          <p className="font-heading font-semibold text-neutral-900">{summary.totalUsers}</p>
        </div>
        <div className="bg-white border border-neutral-100 rounded-lg p-4">
          <p className="text-xs text-neutral-500 mb-1">Vendors</p>
          <p className="font-heading font-semibold text-neutral-900">{summary.totalVendors}</p>
        </div>
        <div className="bg-white border border-neutral-100 rounded-lg p-4">
          <p className="text-xs text-neutral-500 mb-1">Pending vendors</p>
          <p className="font-heading font-semibold text-neutral-900">{summary.pendingVendors}</p>
        </div>
        <div className="bg-white border border-neutral-100 rounded-lg p-4">
          <p className="text-xs text-neutral-500 mb-1">Products</p>
          <p className="font-heading font-semibold text-neutral-900">{summary.totalProducts}</p>
        </div>
        <div className="bg-white border border-neutral-100 rounded-lg p-4">
          <p className="text-xs text-neutral-500 mb-1">Total orders</p>
          <p className="font-heading font-semibold text-neutral-900">{summary.totalOrders}</p>
        </div>
        <div className="bg-white border border-neutral-100 rounded-lg p-4">
          <p className="text-xs text-neutral-500 mb-1">Platform revenue</p>
          <p className="font-heading font-semibold text-neutral-900">{formatNaira(summary.totalPlatformRevenue)}</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-100 rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-neutral-900 mb-4">Platform sales over the last 30 days</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={platformSalesOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(date) => date.slice(5)}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 11 }} width={70} tickFormatter={(v) => formatNaira(v)} />
            <Tooltip
              formatter={(value, name) => (name === 'revenue' ? formatNaira(value) : value)}
              labelFormatter={(date) => date}
            />
            <Line type="monotone" dataKey="revenue" stroke="#15803d" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-neutral-100 rounded-lg p-4">
        <p className="text-sm font-medium text-neutral-900 mb-3">Top vendors</p>
        {topVendors.length === 0 ? (
          <p className="text-sm text-neutral-500">No sales yet.</p>
        ) : (
          <div className="space-y-3">
            {topVendors.map((vendor) => (
              <div
                key={vendor.vendorId}
                className="flex items-center justify-between pb-3 border-b border-neutral-100 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm text-neutral-900">{vendor.storeName}</p>
                  <p className="text-xs text-neutral-500">{vendor.orderCount} orders</p>
                </div>
                <p className="text-sm font-medium text-neutral-900">{formatNaira(vendor.revenue)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
