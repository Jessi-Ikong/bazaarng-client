import { useEffect, useState } from 'react';
import { getProducts } from '../services/productService';
import ProductGrid from '../components/product/ProductGrid';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function Home() {
  useDocumentMeta(
    'KoboBuy — Buy, sell, and negotiate',
    'A marketplace built on trust. Browse products from verified vendors and negotiate prices directly — pay by card or on delivery.'
  );

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getProducts()
      .then((res) => setProducts(res.data.products))
      .catch(() => setError('Could not load products right now.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="bg-primary-900 rounded-xl px-5 sm:px-8 py-7 sm:py-9 mb-6 text-white text-center">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2">
          A marketplace built on trust
        </h1>
        <p className="text-primary-100 text-sm sm:text-base mb-4">
          Every vendor is reviewed. Every price can be negotiated.
        </p>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          <span className="flex items-center gap-1.5 text-xs sm:text-sm">
            <i className="ti ti-shield-check text-accent-200" /> Verified vendors
          </span>
          <span className="flex items-center gap-1.5 text-xs sm:text-sm">
            <i className="ti ti-arrows-exchange text-accent-200" /> Negotiable pricing
          </span>
          <span className="flex items-center gap-1.5 text-xs sm:text-sm">
            <i className="ti ti-lock text-accent-200" /> Secure checkout
          </span>
        </div>
      </div>

      <h2 className="font-heading text-lg font-semibold text-neutral-900 mb-3">
        Latest products
      </h2>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <ProductGrid products={products} loading={loading} emptyMessage="No products yet — check back soon." />
      )}
    </div>
  );
}
