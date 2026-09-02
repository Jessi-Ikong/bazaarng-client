import { useEffect, useState } from 'react';
import { getProducts } from '../services/productService';
import ProductGrid from '../components/product/ProductGrid';
import HeroRotator from '../components/home/HeroRotator';
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
      <HeroRotator />

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
