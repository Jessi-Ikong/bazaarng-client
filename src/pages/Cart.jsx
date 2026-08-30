import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeCartItem } from '../services/cartService';
import CartItem from '../components/cart/CartItem';
import Loader from '../components/common/Loader';
import { useCart } from '../hooks/useCart';

function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { refreshCart } = useCart();

  const loadCart = () => {
    setLoading(true);
    getCart()
      .then((res) => setCart(res.data))
      .catch(() => setError('Could not load your cart right now.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadCart, []);

  const handleUpdateQuantity = async (itemId, quantity) => {
    setError('');
    // Optimistic update: reflect the new quantity immediately so the UI
    // doesn't feel stuck waiting on the network round-trip.
    const previousCart = cart;
    setCart({
      ...cart,
      items: cart.items.map((item) => (item._id === itemId ? { ...item, quantity } : item)),
    });

    try {
      const res = await updateCartItem(itemId, quantity);
      setCart(res.data); // reconcile with the server's populated response
      refreshCart();
    } catch (err) {
      setCart(previousCart); // roll back on failure
      setError(err.response?.data?.message || 'Could not update quantity.');
    }
  };

  const handleRemove = async (itemId) => {
    setError('');
    const previousCart = cart;
    setCart({ ...cart, items: cart.items.filter((item) => item._id !== itemId) });

    try {
      const res = await removeCartItem(itemId);
      setCart(res.data);
      refreshCart();
    } catch (err) {
      setCart(previousCart);
      setError(err.response?.data?.message || 'Could not remove item.');
    }
  };

  if (loading) return <Loader />;

  const items = cart?.items || [];
  const total = items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold text-neutral-900 mb-4">Your cart</h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-500 text-sm mb-4">Your cart is empty.</p>
          <Link
            to="/"
            className="inline-block h-10 px-6 rounded-lg bg-primary-900 text-white text-sm font-medium leading-10 hover:bg-primary-800"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white border border-neutral-100 rounded-lg px-4">
            {items.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
                updating={false}
              />
            ))}
          </div>

          <div className="bg-white border border-neutral-100 rounded-lg p-5 h-fit">
            <h2 className="font-heading text-sm font-semibold text-neutral-900 mb-3">Order summary</h2>
            <div className="flex justify-between text-sm text-neutral-600 mb-2">
              <span>Subtotal</span>
              <span>{formatNaira(total)}</span>
            </div>
            <p className="text-xs text-neutral-500 mb-4">
              Shipping is calculated at checkout — orders may split across vendors.
            </p>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full h-10 rounded-lg bg-primary-900 text-white text-sm font-medium hover:bg-primary-800"
            >
              Proceed to checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
