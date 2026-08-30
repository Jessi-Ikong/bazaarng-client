import { useEffect, useState } from 'react';
import { getAllProductsAdmin, adminUpdateProductStatus } from '../../services/adminService';
import Loader from '../../components/common/Loader';

function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_STYLES = {
  active: 'bg-primary-50 text-primary-700',
  out_of_stock: 'bg-accent-50 text-accent-600',
  disabled: 'bg-red-50 text-red-600',
};

export default function ManageAllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState(null);

  const loadProducts = () => {
    getAllProductsAdmin()
      .then((res) => setProducts(res.data))
      .catch(() => setError('Could not load products.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadProducts, []);

  const handleToggle = async (product) => {
    const nextStatus = product.status === 'disabled' ? 'active' : 'disabled';
    setActingId(product._id);
    try {
      const res = await adminUpdateProductStatus(product._id, nextStatus);
      setProducts(products.map((p) => (p._id === product._id ? res.data : p)));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update product status.');
    } finally {
      setActingId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold text-neutral-900 mb-4">All products</h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {products.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-16">No products on the platform yet.</p>
      ) : (
        <div className="bg-white border border-neutral-100 rounded-lg divide-y divide-neutral-100">
          {products.map((product) => (
            <div key={product._id} className="flex items-center justify-between gap-4 p-4 flex-wrap">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-900 truncate">{product.name}</p>
                <p className="text-xs text-neutral-500">
                  {product.vendor?.storeName} · {formatNaira(product.price)} · {product.category?.name}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${STATUS_STYLES[product.status]}`}>
                  {product.status}
                </span>
                <button
                  onClick={() => handleToggle(product)}
                  disabled={actingId === product._id}
                  className={`h-8 px-3 rounded-lg text-xs font-medium disabled:opacity-60 ${
                    product.status === 'disabled'
                      ? 'bg-primary-900 text-white hover:bg-primary-800'
                      : 'border border-red-200 text-red-600 hover:bg-red-50'
                  }`}
                >
                  {product.status === 'disabled' ? 'Re-enable' : 'Disable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
