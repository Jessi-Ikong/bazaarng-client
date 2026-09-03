import { useEffect, useState } from 'react';
import { getVendorOffers, respondToOffer } from '../../services/offerService';
import Loader from '../../components/common/Loader';
import { notifyCountsChanged } from '../../utils/notifyCountsChanged';

function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_STYLES = {
  pending: 'bg-accent-50 text-accent-600',
  accepted: 'bg-primary-50 text-primary-700',
  rejected: 'bg-red-50 text-red-600',
  countered: 'bg-neutral-100 text-neutral-700',
};

export default function ManageMyOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [respondingId, setRespondingId] = useState(null);
  const [counterInputs, setCounterInputs] = useState({});

  const loadOffers = () => {
    getVendorOffers()
      .then((res) => setOffers(res.data))
      .catch(() => setError('Could not load offers.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadOffers, []);

  const handleRespond = async (offerId, action) => {
    setError('');
    const counterPrice = action === 'counter' ? Number(counterInputs[offerId]) : undefined;

    if (action === 'counter' && (!counterPrice || counterPrice <= 0)) {
      setError('Enter a valid counter price first.');
      return;
    }

    setRespondingId(offerId);
    try {
      const res = await respondToOffer(offerId, action, counterPrice);
      setOffers(offers.map((o) => (o._id === offerId ? res.data : o)));
      notifyCountsChanged();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not respond to offer.');
    } finally {
      setRespondingId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold text-neutral-900 mb-4">Offers</h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {offers.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-16">No offers yet.</p>
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
              <p className="text-xs text-neutral-500 mb-2">From {offer.buyer?.name}</p>
              {Object.keys(offer.selectedOptions || {}).length > 0 && (
                <p className="text-xs text-neutral-500 mb-2">
                  {Object.entries(offer.selectedOptions)
                    .map(([name, value]) => `${name}: ${value}`)
                    .join(', ')}
                </p>
              )}
              <p className="text-sm text-neutral-700 mb-3">
                Listed at <span className="font-medium">{formatNaira(offer.product?.price)}</span> ·
                Offered <span className="font-medium text-primary-700">{formatNaira(offer.proposedPrice)}</span>
                {offer.status === 'countered' && (
                  <> · Your counter: <span className="font-medium">{formatNaira(offer.counterPrice)}</span></>
                )}
              </p>

              {offer.status === 'pending' && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleRespond(offer._id, 'accept')}
                    disabled={respondingId === offer._id}
                    className="h-8 px-3 rounded-lg bg-primary-900 text-white text-xs font-medium hover:bg-primary-800 disabled:opacity-60"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespond(offer._id, 'reject')}
                    disabled={respondingId === offer._id}
                    className="h-8 px-3 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    Reject
                  </button>
                  <input
                    type="number"
                    placeholder="Counter ₦"
                    value={counterInputs[offer._id] || ''}
                    onChange={(e) => setCounterInputs({ ...counterInputs, [offer._id]: e.target.value })}
                    className="h-8 w-28 rounded-lg border border-neutral-200 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                  <button
                    onClick={() => handleRespond(offer._id, 'counter')}
                    disabled={respondingId === offer._id}
                    className="h-8 px-3 rounded-lg bg-accent-200 text-primary-900 text-xs font-medium hover:bg-accent-400 disabled:opacity-60"
                  >
                    Counter
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
