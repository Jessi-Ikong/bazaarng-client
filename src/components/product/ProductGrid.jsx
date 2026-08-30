import ProductCard from './ProductCard';
import Loader from '../common/Loader';

export default function ProductGrid({ products, loading, emptyMessage = 'No products found.' }) {
  if (loading) return <Loader />;

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 text-neutral-500 text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
