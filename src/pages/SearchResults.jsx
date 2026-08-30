import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../services/productService';
import ProductGrid from '../components/product/ProductGrid';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  useDocumentMeta(query ? `"${query}" — Search results — KoboBuy` : 'Search — KoboBuy');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    getProducts({ search: query })
      .then((res) => setProducts(res.data.products))
      .catch(() => setError('Search failed — please try again.'))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold text-neutral-900 mb-4">
        {query ? `Results for "${query}"` : 'Search'}
      </h1>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <ProductGrid
          products={products}
          loading={loading}
          emptyMessage={query ? `No results for "${query}".` : 'Type something in the search bar to get started.'}
        />
      )}
    </div>
  );
}
