import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProducts, getCategories } from '../services/productService';
import ProductGrid from '../components/product/ProductGrid';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useDocumentMeta(
    categoryName ? `${categoryName} — BazaarNG` : 'BazaarNG',
    categoryName ? `Shop ${categoryName} from verified vendors on BazaarNG.` : undefined
  );

  useEffect(() => {
    setLoading(true);
    setError('');

    // Categories don't currently expose a get-by-slug endpoint, so we find
    // the matching one from the full list to get its _id for filtering.
    getCategories()
      .then((catRes) => {
        const match = catRes.data.find((c) => c.slug === slug);
        setCategoryName(match?.name || slug);
        const categoryId = match?._id;
        return getProducts(categoryId ? { category: categoryId } : {});
      })
      .then((res) => setProducts(res.data.products))
      .catch(() => setError('Could not load this category right now.'))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold text-neutral-900 mb-4">
        {categoryName}
      </h1>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <ProductGrid
          products={products}
          loading={loading}
          emptyMessage="No products in this category yet."
        />
      )}
    </div>
  );
}
