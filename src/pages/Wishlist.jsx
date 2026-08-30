import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWishlist, removeFromWishlist } from '../services/wishlistService';
import { addItemToCart } from '../services/cartService';
import { getImageUrl } from '../utils/getImageUrl';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import Loader from '../components/common/Loader';

function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Wishlist() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const { refreshCart } = useCart();
  const { refreshWishlist } = useWishlist();

  useEffect(() => {
    getWishlist()
      .then((res) => setProducts(res.data.products))
      .catch(() => setError('Could not load your wishlist.'))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    const previous = products;
    setProducts(products.filter((p) => p._id !== productId)); // optimistic
    try {
      await removeFromWishlist(productId);
      refreshWishlist();
    } catch {
      setProducts(previous); // roll back
    }
  };

  // Moves an item from wishlist to cart — adds it to the cart, then
  // removes it from the wishlist, per the intended "move" behavior.
  const handleAddToCart = async (productId) => {
    setError('');
    setBusyId(productId);
    try {
      await addItemToCart(productId, 1, {});
      await removeFromWishlist(productId);
      setProducts(products.filter((p) => p._id !== productId));
      refreshCart();
      refreshWishlist();
    } catch (err) {
      if (err.response?.data?.message?.includes('Please select')) {
        navigate(`/products/${productId}`, {
          state: { message: 'This product has options to choose before adding to cart.' },
        });
        return;
      }
      setError(err.response?.data?.message || 'Could not add to cart.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold text-neutral-900 mb-4">Your wishlist</h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-500 text-sm mb-4">Nothing saved yet.</p>
          <Link
            to="/"
            className="inline-block h-10 px-6 rounded-lg bg-primary-900 text-white text-sm font-medium leading-10 hover:bg-primary-800"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => {
            const image = getImageUrl(product.images?.[0]);
            return (
              <div key={product._id} className="bg-white border border-neutral-100 rounded-lg overflow-hidden">
                <Link to={`/products/${product._id}`} className="block">
                  <div className="aspect-square bg-neutral-50 flex items-center justify-center overflow-hidden">
                    {image ? (
                      <img src={image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <i className="ti ti-photo text-neutral-300 text-2xl" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-neutral-900 line-clamp-2 mb-1">{product.name}</p>
                    <p className="font-heading font-semibold text-primary-800">{formatNaira(product.price)}</p>
                    <p className="text-xs text-neutral-500 mt-1">{product.vendor?.storeName}</p>
                  </div>
                </Link>
                <div className="flex border-t border-neutral-100">
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    disabled={busyId === product._id}
                    className="flex-1 text-xs text-primary-700 font-medium hover:bg-primary-50 py-2 disabled:opacity-60"
                  >
                    {busyId === product._id ? 'Adding...' : 'Add to cart'}
                  </button>
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="flex-1 text-xs text-red-600 hover:bg-red-50 py-2 border-l border-neutral-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
