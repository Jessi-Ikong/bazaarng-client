import { useState } from 'react';
import { addToWishlist, removeFromWishlist } from '../../services/wishlistService';
import { useWishlist } from '../../hooks/useWishlist';

// Controlled from outside via `saved` + `onChange` so a page that already
// fetched the wishlist (like the Wishlist page itself) can keep its own
// list in sync without this button re-fetching independently. The navbar
// badge count is refreshed internally via context, so every caller stays
// in sync automatically without needing to remember to do it themselves.
export default function WishlistButton({ productId, saved, onChange, className = '' }) {
  const [busy, setBusy] = useState(false);
  const { refreshWishlist } = useWishlist();

  const handleClick = async (e) => {
    e.preventDefault(); // stop this from also triggering a parent <Link>
    e.stopPropagation();
    setBusy(true);
    try {
      if (saved) {
        await removeFromWishlist(productId);
        onChange?.(false);
      } else {
        await addToWishlist(productId);
        onChange?.(true);
      }
      refreshWishlist();
    } catch {
      // Silently ignore — wishlist toggling isn't critical enough to
      // interrupt browsing with an error message.
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition disabled:opacity-60 ${className}`}
    >
      <i className={`ti ${saved ? 'ti-heart-filled text-red-500' : 'ti-heart text-neutral-400'}`} />
    </button>
  );
}
