import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVendorOrders, updateOrderStatus } from '../../services/orderService';
import Loader from '../../components/common/Loader';

function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

const NEXT_STATUS = {
  placed: 'confirmed',
  confirmed: 'shipped',
  shipped: 'delivered',
};

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

export default function ManageMyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [deliveryCodeInputs, setDeliveryCodeInputs] = useState({});

  const loadOrders = () => {
    getVendorOrders()
      .then((res) => setOrders(res.data))
      .catch(() => setError('Could not load your orders.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadOrders, []);

  const handleAdvance = async (order) => {
    const nextStatus = NEXT_STATUS[order.status];
    if (!nextStatus) return;

    let deliveryCode;
    if (nextStatus === 'delivered') {
      deliveryCode = (deliveryCodeInputs[order._id] || '').trim();
      if (!deliveryCode) {
        setError('Enter the delivery code the buyer gave you.');
        return;
      }
    }

    setError('');
    setUpdatingId(order._id);
    try {
      const res = await updateOrderStatus(order._id, nextStatus, deliveryCode);
      setOrders(orders.map((o) => (o._id === order._id ? res.data : o)));
      setDeliveryCodeInputs((prev) => ({ ...prev, [order._id]: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold text-neutral-900 mb-4">Orders</h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {orders.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-16">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border border-neutral-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <p className="text-sm font-medium text-neutral-900">{order.buyer?.name}</p>
                <div className="flex gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${STATUS_STYLES[order.status]}`}>
                    {order.status}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${PAYMENT_STYLES[order.paymentStatus]}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
              <p className="text-xs text-neutral-500 mb-2">
                {order.items.length} item{order.items.length > 1 ? 's' : ''} ·{' '}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <div className="flex items-center justify-between mb-3">
                <p className="font-heading font-semibold text-primary-800">
                  {formatNaira(order.totalAmount)}
                </p>
                <Link to={`/orders/${order._id}`} className="text-xs text-primary-600 hover:underline">
                  View details
                </Link>
              </div>

              {NEXT_STATUS[order.status] === 'delivered' ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="Delivery code from buyer"
                    value={deliveryCodeInputs[order._id] || ''}
                    onChange={(e) =>
                      setDeliveryCodeInputs({ ...deliveryCodeInputs, [order._id]: e.target.value })
                    }
                    className="h-8 w-40 rounded-lg border border-neutral-200 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                  <button
                    onClick={() => handleAdvance(order)}
                    disabled={updatingId === order._id}
                    className="h-8 px-4 rounded-lg bg-primary-900 text-white text-xs font-medium hover:bg-primary-800 disabled:opacity-60"
                  >
                    Confirm delivered
                  </button>
                </div>
              ) : (
                NEXT_STATUS[order.status] && (
                  <button
                    onClick={() => handleAdvance(order)}
                    disabled={updatingId === order._id}
                    className="h-8 px-4 rounded-lg bg-primary-900 text-white text-xs font-medium hover:bg-primary-800 disabled:opacity-60"
                  >
                    Mark as {NEXT_STATUS[order.status]}
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
