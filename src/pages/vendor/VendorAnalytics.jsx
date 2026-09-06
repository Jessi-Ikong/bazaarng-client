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
import { getVendorAnalytics } from '../../services/analyticsService';
import Loader from '../../components/common/Loader';

function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_LABELS = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function VendorAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getVendorAnalytics()
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  const { salesOverTime, topProducts, summary } = data;

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold text-neutral-900 mb-4">Analytics</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-neutral-100 rounded-lg p-4">
          <p className="text-xs text-neutral-500 mb-1">Total orders</p>
          <p className="font-heading font-semibold text-neutral-900">{summary.totalOrders}</p>
        </div>
        <div className="bg-white border border-neutral-100 rounded-lg p-4">
          <p className="text-xs text-neutral-500 mb-1">Total revenue</p>
          <p className="font-heading font-semibold text-neutral-900">{formatNaira(summary.totalRevenue)}</p>
        </div>
        <div className="bg-white border border-neutral-100 rounded-lg p-4">
          <p className="text-xs text-neutral-500 mb-1">Net earnings</p>
          <p className="font-heading font-semibold text-neutral-900">{formatNaira(summary.totalNet)}</p>
        </div>
        <div className="bg-white border border-neutral-100 rounded-lg p-4">
          <p className="text-xs text-neutral-500 mb-1">Avg order value</p>
          <p className="font-heading font-semibold text-neutral-900">{formatNaira(summary.averageOrderValue)}</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-100 rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-neutral-900 mb-4">Sales over the last 30 days</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={salesOverTime}>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-100 rounded-lg p-4">
          <p className="text-sm font-medium text-neutral-900 mb-3">Top products</p>
          {topProducts.length === 0 ? (
            <p className="text-sm text-neutral-500">No sales yet.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between pb-3 border-b border-neutral-100 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm text-neutral-900">{product.name}</p>
                    <p className="text-xs text-neutral-500">{product.unitsSold} sold</p>
                  </div>
                  <p className="text-sm font-medium text-neutral-900">{formatNaira(product.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-neutral-100 rounded-lg p-4">
          <p className="text-sm font-medium text-neutral-900 mb-3">Orders by status</p>
          <div className="space-y-3">
            {Object.entries(summary.statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <p className="text-sm text-neutral-700">{STATUS_LABELS[status] || status}</p>
                <p className="text-sm font-medium text-neutral-900">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
