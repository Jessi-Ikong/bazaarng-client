import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrdersAdmin } from '../../services/adminService';
import Loader from '../../components/common/Loader';

function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_STYLES = {
  placed: 'bg-neutral-100 text-neutral-700',
  confirmed: 'bg-primary-50 text-primary-700',
  shipped: 'bg-accent-50 text-accent-600',
  delivered: 'bg-primary-100 text-primary-800',
  cancelled: 'bg-red-50 text-red-600',
};

const PAYMENT_STYLES = {
  paid: 'bg-primary-50 text-primary-700',
  unpaid: 'bg-accent-50 text-accent-600',
};

export default function ManageAllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAllOrdersAdmin()
      .then((res) => setOrders(res.data))
      .catch(() => setError('Could not load orders.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold text-neutral-900 mb-4">All orders</h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {orders.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-16">No orders on the platform yet.</p>
      ) : (
        <div className="bg-white border border-neutral-100 rounded-lg divide-y divide-neutral-100">
          {orders.map((order) => (
            <div key={order._id} className="flex items-center justify-between gap-4 p-4 flex-wrap">
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900">
                  {order.buyer?.name} → {order.vendor?.storeName}
                </p>
                <p className="text-xs text-neutral-500">
                  {order.items.length} item{order.items.length > 1 ? 's' : ''} ·{' '}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${STATUS_STYLES[order.status]}`}>
                  {order.status}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${PAYMENT_STYLES[order.paymentStatus]}`}>
                  {order.paymentStatus}
                </span>
                <p className="font-heading font-semibold text-primary-800">{formatNaira(order.totalAmount)}</p>
                <Link to={`/orders/${order._id}`} className="text-xs text-primary-600 hover:underline">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
