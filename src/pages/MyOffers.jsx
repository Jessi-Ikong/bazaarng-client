import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyOffers, acceptCounterOffer } from '../services/offerService';
import { addItemToCart } from '../services/cartService';
import OfferCountdown from '../components/offer/OfferCountdown';
import Loader from '../components/common/Loader';
import { notifyCountsChanged } from '../utils/notifyCountsChanged';

function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_STYLES = {
  pending: 'bg-neutral-100 text-neutral-700',
  accepted: 'bg-primary-50 text-primary-700',
  rejected: 'bg-red-50 text-red-600',
  countered: 'bg-accent-50 text-accent-600',
  expired: 'bg-neutral-100 text-neutral-400',
};

export default function MyOffers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState(null);

  const loadOffers = () => {
    getMyOffers()
      .then((res) => setOffers(res.data))
      .catch(() => setError('Could not load your offers.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadOffers, []);

  const handleAcceptCounter = async (offerId) => {
    setActingId(offerId);
    try {
      const res = await acceptCounterOffer(offerId);
      setOffers(offers.map((o) => (o._id === offerId ? res.data : o)));
      notifyCountsChanged();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not accept counter-offer.');
    } finally {
      setActingId(null);
    }
  };

  const handleAddToCart = async (offer) => {
    setActingId(offer._id);
    setError('');
    try {
      // The backend always uses THIS offer's own selectedOptions (never
      // whatever's sent here) — re-picking options would be pointless and
      // could confusingly suggest a different variant is being chosen, so
      // there's nothing to select here, just confirm and add.
      await addItemToCart(offer.product._id, 1, {}, offer._id);
      navigate('/cart');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add to cart.');
      loadOffers(); // in case it just expired server-side
    } finally {
      setActingId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold text-neutral-900 mb-4">Your offers</h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {offers.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-16">
          You haven't made any offers yet.
        </p>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <div key={offer._id} className="bg-white border border-neutral-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                <p className="text-sm font-medium text-neutral-900">{offer.product?.name}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${STATUS_STYLES[offer.status]}`}>
                  {offer.status}
                </span>
              </div>

              {Object.keys(offer.selectedOptions || {}).length > 0 && (
                <p className="text-xs text-neutral-500 mb-1">
                  {Object.entries(offer.selectedOptions)
                    .map(([name, value]) => `${name}: ${value}`)
                    .join(', ')}
                </p>
              )}

              <p className="text-sm text-neutral-700 mb-3">
                Listed at <span className="font-medium">{formatNaira(offer.product?.price)}</span> ·
                You offered <span className="font-medium text-primary-700">{formatNaira(offer.proposedPrice)}</span>
                {offer.status === 'countered' && (
                  <> · Vendor countered: <span className="font-medium">{formatNaira(offer.counterPrice)}</span></>
                )}
              </p>

              {offer.status === 'countered' && (
                <button
                  onClick={() => handleAcceptCounter(offer._id)}
                  disabled={actingId === offer._id}
                  className="h-8 px-4 rounded-lg bg-primary-900 text-white text-xs font-medium hover:bg-primary-800 disabled:opacity-60"
                >
                  Accept counter-offer
                </button>
              )}

              {offer.status === 'accepted' && offer.expiresAt && (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleAddToCart(offer)}
                    disabled={actingId === offer._id}
                    className="h-8 px-4 rounded-lg bg-primary-900 text-white text-xs font-medium hover:bg-primary-800 disabled:opacity-60"
                  >
                    Add to cart at {formatNaira(offer.proposedPrice)}
                  </button>
                  <OfferCountdown expiresAt={offer.expiresAt} onExpire={loadOffers} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
