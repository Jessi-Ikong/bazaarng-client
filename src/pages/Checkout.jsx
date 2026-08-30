import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart } from '../services/cartService';
import { checkout } from '../services/orderService';
import { getMe } from '../services/userService';
import { useCart } from '../hooks/useCart';
import Loader from '../components/common/Loader';

function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ street: '', city: '', state: '', country: 'Nigeria' });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { refreshCart } = useCart();

  useEffect(() => {
    getCart()
      .then((res) => setCart(res.data))
      .catch(() => setError('Could not load your cart.'))
      .finally(() => setLoading(false));

    // Prefill from the buyer's saved shipping address, if they have one —
    // they can still edit any field before placing the order.
    getMe()
      .then((res) => {
        const saved = res.data.shippingAddress;
        if (saved && (saved.street || saved.city)) {
          setForm((prev) => ({
            street: saved.street || prev.street,
            city: saved.city || prev.city,
            state: saved.state || prev.state,
            country: saved.country || prev.country,
          }));
        }
      })
      .catch(() => {}); // non-critical — checkout still works with a blank form
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.street || !form.city) {
      setError('Street and city are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await checkout(form, paymentMethod);
      refreshCart(); // cart is cleared server-side on checkout, either payment path

      if (paymentMethod === 'card' && res.data.authorizationUrl) {
        // Send the buyer to Paystack's hosted checkout page
        window.location.href = res.data.authorizationUrl;
        return;
      }

      // Pay on delivery — order is placed, payment happens later
      navigate('/orders', { state: { justCheckedOut: true, checkoutGroupId: res.data.checkoutGroupId } });
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  const items = cart?.items || [];
  const total = items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-neutral-500 text-sm">Your cart is empty — nothing to check out.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <h1 className="font-heading text-xl font-semibold text-neutral-900 mb-1 text-center">
        Checkout
      </h1>
      <p className="text-sm text-neutral-500 mb-6 text-center">
        {formatNaira(total)} · {items.length} item{items.length > 1 ? 's' : ''}
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-neutral-100 rounded-lg p-6 space-y-4">
        <div>
          <label htmlFor="street" className="block text-xs text-neutral-600 text-center mb-1">
            Street address
          </label>
          <input
            id="street"
            name="street"
            value={form.street}
            onChange={handleChange}
            className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="city" className="block text-xs text-neutral-600 text-center mb-1">
              City
            </label>
            <input
              id="city"
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-xs text-neutral-600 text-center mb-1">
              State
            </label>
            <input
              id="state"
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
        </div>

        <div>
          <p className="text-xs text-neutral-600 text-center mb-2">Payment method</p>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`border rounded-lg px-3 py-3 text-center cursor-pointer text-sm ${
                paymentMethod === 'card'
                  ? 'border-primary-600 bg-primary-50 text-primary-800 font-medium'
                  : 'border-neutral-200 text-neutral-600'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
                className="sr-only"
              />
              Pay now with card
            </label>
            <label
              className={`border rounded-lg px-3 py-3 text-center cursor-pointer text-sm ${
                paymentMethod === 'pay_on_delivery'
                  ? 'border-primary-600 bg-primary-50 text-primary-800 font-medium'
                  : 'border-neutral-200 text-neutral-600'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="pay_on_delivery"
                checked={paymentMethod === 'pay_on_delivery'}
                onChange={() => setPaymentMethod('pay_on_delivery')}
                className="sr-only"
              />
              Pay on delivery
            </label>
          </div>
          {paymentMethod === 'pay_on_delivery' && (
            <p className="text-xs text-neutral-500 mt-2 text-center">
              You'll pay securely through KoboBuy once your order is marked delivered — not cash in hand.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <div className="flex justify-center pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="h-10 px-6 rounded-lg bg-primary-900 text-white text-sm font-medium whitespace-nowrap hover:bg-primary-800 disabled:opacity-60 transition"
          >
            {submitting
              ? paymentMethod === 'card' ? 'Redirecting to payment...' : 'Placing order...'
              : paymentMethod === 'card' ? 'Continue to payment' : 'Place order'}
          </button>
        </div>
      </form>
    </div>
  );
}
