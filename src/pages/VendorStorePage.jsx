import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicVendorProfile } from '../services/vendorPublicService';
import { getVendorReviews } from '../services/reviewService';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import ProductGrid from '../components/product/ProductGrid';
import ReviewList from '../components/review/ReviewList';
import Loader from '../components/common/Loader';

export default function VendorStorePage() {
  const { vendorId } = useParams();
  const [store, setStore] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useDocumentMeta(
    store ? `${store.profile.storeName} — BazaarNG` : 'BazaarNG',
    store ? `Shop ${store.profile.storeName} on BazaarNG — ${store.products.length} products available.` : undefined
  );

  useEffect(() => {
    getPublicVendorProfile(vendorId)
      .then((res) => setStore(res.data))
      .catch(() => setError('This store could not be found.'))
      .finally(() => setLoading(false));

    getVendorReviews(vendorId)
      .then((res) => setReviews(res.data))
      .catch(() => {});
  }, [vendorId]);

  if (loading) return <Loader />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!store) return null;

  const { profile, products } = store;

  return (
    <div>
      <div className="bg-primary-900 rounded-xl px-6 py-7 mb-6 text-white">
        <h1 className="font-heading text-2xl font-semibold mb-1">{profile.storeName}</h1>
        {profile.storeDescription && (
          <p className="text-primary-100 text-sm mb-3 max-w-xl">{profile.storeDescription}</p>
        )}
        <div className="flex items-center gap-4 text-sm">
          {profile.ratingCount > 0 ? (
            <span className="flex items-center gap-1 text-accent-200">
              ★ {profile.ratingAverage.toFixed(1)} ({profile.ratingCount} review{profile.ratingCount > 1 ? 's' : ''})
            </span>
          ) : (
            <span className="text-primary-200">No reviews yet</span>
          )}
          <span className="text-primary-200">{products.length} product{products.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <h2 className="font-heading text-lg font-semibold text-neutral-900 mb-3">Products</h2>
      <ProductGrid products={products} loading={false} emptyMessage="This store has no active products right now." />

      <h2 className="font-heading text-lg font-semibold text-neutral-900 mt-8 mb-3">
        Reviews {reviews.length > 0 && `(${reviews.length})`}
      </h2>
      <ReviewList reviews={reviews} showProductName />
    </div>
  );
}
