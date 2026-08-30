import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getMyOrders, initiateDeliveryPayment, retryOrderPayment } from '../services/orderService';
import OrderStatusStepper from '../components/cart/OrderStatusStepper';
import Loader from '../components/common/Loader';
import { getImageUrl } from '../utils/getImageUrl';

function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

const PAYMENT_STYLES = {
  paid: 'bg-primary-50 text-primary-700',
  unpaid: 'bg-accent-50 text-accent-600',
};

function groupByCheckout(orders) {
  const groups = {};
  orders.forEach((order) => {
    const key = order.checkoutGroupId || order._id;
    if (!groups[key]) groups[key] = [];
    groups[key].push(order);
  });
  return Object.values(groups);
}

function OrderCard({ order, onPayNow, onRetry, acting }) {
  const canPayNow =
    order.paymentMethod === 'pay_on_delivery' &&
    order.paymentStatus === 'unpaid' &&
    order.status === 'delivered';

  // A card checkout that was abandoned/never completed gets lazily marked
  // 'cancelled' by the backend after an hour — this is how we surface
  // that distinctly from a normal cancelled order, with a way to recover it.
  const isFailedPayment =
    order.paymentMethod === 'card' && order.paymentStatus === 'unpaid' && order.status === 'cancelled';

  const thumbnails = order.items.slice(0, 3);
  const overflow = order.items.length - thumbnails.length;

  const optionsSummary = order.items
    .flatMap((item) =>
      Object.entries(item.selectedOptions || {}).map(([name, value]) => `${name}: ${value}`)
    )
    .join(', ');

  return (
    <div className="bg-white border border-neutral-100 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
        <div>
          <p className="text-sm font-medium text-neutral-900">{order.vendor?.storeName || 'Vendor'}</p>
          <p className="text-xs text-neutral-500">
            {order.items.length} item{order.items.length > 1 ? 's' : ''} ·{' '}
            {order.paymentMethod === 'card' ? 'Card' : 'Pay on delivery'}
          </p>
          {optionsSummary && <p className="text-xs text-neutral-500 mt-0.5">{optionsSummary}</p>}
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-md h-fit ${
            isFailedPayment ? 'bg-red-50 text-red-600' : PAYMENT_STYLES[order.paymentStatus]
          }`}
        >
          {isFailedPayment ? 'Payment failed' : order.paymentStatus}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex -space-x-2 shrink-0">
          {thumbnails.map((item, i) => {
            const image = getImageUrl(item.product?.images?.[0]);
            return (
              <div
                key={i}
                className="w-10 h-10 rounded-lg border-2 border-white bg-neutral-50 overflow-hidden flex items-center justify-center"
              >
                {image ? (
                  <img src={image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-neutral-300 text-[8px]">No img</span>
                )}
              </div>
            );
          })}
          {overflow > 0 && (
            <div className="w-10 h-10 rounded-lg border-2 border-white bg-neutral-100 flex items-center justify-center text-[10px] text-neutral-500 font-medium">
              +{overflow}
            </div>
          )}
        </div>
        {isFailedPayment ? (
          <p className="text-xs text-red-500">Checkout wasn't completed — no payment was taken.</p>
        ) : (
          <OrderStatusStepper status={order.status} />
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <p className="font-heading font-semibold text-primary-800">{formatNaira(order.totalAmount)}</p>
        <div className="flex items-center gap-3">
          <Link to={`/orders/${order._id}`} className="text-xs text-primary-600 hover:underline">
            View details
          </Link>
          {isFailedPayment && (
            <button
              onClick={() => onRetry(order._id)}
              disabled={acting}
              className="h-8 px-4 rounded-lg bg-primary-900 text-white text-xs font-medium hover:bg-primary-800 disabled:opacity-60"
            >
              {acting ? 'Redirecting...' : 'Place order again'}
            </button>
          )}
          {canPayNow && (
            <button
              onClick={() => onPayNow(order._id)}
              disabled={acting}
              className="h-8 px-4 rounded-lg bg-primary-900 text-white text-xs font-medium hover:bg-primary-800 disabled:opacity-60"
            >
              {acting ? 'Redirecting...' : 'Pay now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrderHistory() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState(null);

  useEffect(() => {
    getMyOrders()
      .then((res) => setOrders(res.data))
      .catch(() => setError('Could not load your orders.'))
      .finally(() => setLoading(false));
  }, []);

  const handlePayNow = async (orderId) => {
    setActingId(orderId);
    setError('');
    try {
      const res = await initiateDeliveryPayment(orderId);
      window.location.href = res.data.authorizationUrl;
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start payment.');
      setActingId(null);
    }
  };

  const handleRetry = async (orderId) => {
    setActingId(orderId);
    setError('');
    try {
      const res = await retryOrderPayment(orderId);
      window.location.href = res.data.authorizationUrl;
    } catch (err) {
      setError(err.response?.data?.message || 'Could not retry payment.');
      setActingId(null);
    }
  };

  if (loading) return <Loader />;

  const groups = groupByCheckout(orders);

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold text-neutral-900 mb-4">Your orders</h1>

      {location.state?.justCheckedOut && (
        <div className="bg-primary-50 text-primary-700 text-sm rounded-lg px-4 py-3 mb-4">
          Order placed successfully!
        </div>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-500 text-sm mb-4">You haven't placed any orders yet.</p>
          <Link
            to="/"
            className="inline-block h-10 px-6 rounded-lg bg-primary-900 text-white text-sm font-medium leading-10 hover:bg-primary-800"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => {
            const groupTotal = group.reduce((sum, o) => sum + o.totalAmount, 0);
            return (
              <div key={group[0].checkoutGroupId || group[0]._id}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-neutral-500">
                    Ordered {new Date(group[0].createdAt).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                    {group.length > 1 && ` · ${group.length} vendors`}
                  </p>
                  <p className="text-xs text-neutral-500">{formatNaira(groupTotal)} total</p>
                </div>
                <div className={group.length > 1 ? 'space-y-2 pl-3 border-l-2 border-neutral-100' : ''}>
                  {group.map((order) => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      onPayNow={handlePayNow}
                      onRetry={handleRetry}
                      acting={actingId === order._id}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
