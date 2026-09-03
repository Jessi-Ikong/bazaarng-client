import { useState } from 'react';
import { createOffer } from '../../services/offerService';

function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function OfferModal({ product, onClose }) {
  const [proposedPrice, setProposedPrice] = useState('');
  const [selectedOptions, setSelectedOptions] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Same rule as the product page: nothing to require when there are no
  // option groups at all; otherwise every group needs a chosen value.
  const allOptionsSelected =
    !product.options ||
    product.options.length === 0 ||
    product.options.every((group) => selectedOptions[group.name]);

  // The ceiling this offer must stay below — whichever price actually
  // applies to the currently-selected variant, matching the same variant
  // override the product page itself shows. Falls back to the base price
  // until a full, matching selection is made.
  const matchedVariantPrice =
    allOptionsSelected && product.variantPrices?.length > 0
      ? product.variantPrices.find((vp) => {
          const keys = Object.keys(vp.combination);
          return (
            keys.length === Object.keys(selectedOptions).length &&
            keys.every((k) => selectedOptions[k] === vp.combination[k])
          );
        })?.price
      : undefined;
  const listedPrice = matchedVariantPrice ?? product.price;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!allOptionsSelected) {
      setError('Please select an option for every choice above.');
      return;
    }

    const price = Number(proposedPrice);
    if (!price || price <= 0) {
      setError('Enter a valid offer amount.');
      return;
    }
    if (price >= listedPrice) {
      setError(`Your offer should be below the listed price of ${formatNaira(listedPrice)}.`);
      return;
    }

    setSubmitting(true);
    try {
      await createOffer(product._id, price, selectedOptions);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit your offer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-primary-900 px-5 py-4 flex items-center justify-between">
          <p className="font-heading text-white font-semibold">Make an offer</p>
          <button onClick={onClose} className="text-white/80 hover:text-white text-lg leading-none">
            ✕
          </button>
        </div>

        <div className="p-5">
          {success ? (
            <div className="text-center py-4">
              <p className="text-primary-700 font-medium mb-1">Offer sent!</p>
              <p className="text-sm text-neutral-600 mb-4">
                The vendor will accept, reject, or counter your offer. Check "My offers" in the menu to see the outcome.
              </p>
              <button
                onClick={onClose}
                className="h-10 px-6 rounded-lg bg-primary-900 text-white text-sm font-medium hover:bg-primary-800"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="text-sm text-neutral-600 mb-1 text-center">{product.name}</p>
              <p className="text-xs text-neutral-500 mb-4 text-center">
                Listed at {formatNaira(listedPrice)}
              </p>

              {product.options?.length > 0 && (
                <div className="mb-4 space-y-3">
                  {product.options.map((group) => (
                    <div key={group.name}>
                      <p className="text-xs text-neutral-600 mb-1.5 text-center">{group.name}</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {group.values.map((value) => {
                          const isSelected = selectedOptions[group.name] === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() =>
                                setSelectedOptions((prev) => ({
                                  ...prev,
                                  [group.name]: value,
                                }))
                              }
                              className={`h-9 px-3 rounded-lg border text-sm transition ${
                                isSelected
                                  ? "border-primary-600 bg-primary-50 text-primary-800 font-medium"
                                  : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                              }`}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <label htmlFor="proposedPrice" className="block text-xs text-neutral-600 text-center mb-1">
                Your offer (₦)
              </label>
              <input
                id="proposedPrice"
                type="number"
                min="1"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                placeholder="e.g. 280000"
                className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-400"
              />

              {error && <p className="text-sm text-red-600 text-center mt-2">{error}</p>}

              <div className="flex justify-center gap-2 mt-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 px-5 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !allOptionsSelected}
                  className="h-10 px-5 rounded-lg bg-accent-200 text-primary-900 text-sm font-medium hover:bg-accent-400 disabled:opacity-60"
                >
                  {submitting ? 'Sending...' : 'Send offer'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
