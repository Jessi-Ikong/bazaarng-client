import { createContext, useState, useCallback, useEffect } from 'react';
import { getWishlist } from '../services/wishlistService';
import { useAuth } from '../hooks/useAuth';

export const WishlistContext = createContext(null);

// Same pattern as CartContext — a live wishlist count for the navbar
// badge, refreshed explicitly by whichever page adds/removes an item.
export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistCount, setWishlistCount] = useState(0);

  const refreshWishlist = useCallback(() => {
    if (!user || user.role !== 'customer') {
      setWishlistCount(0);
      return;
    }
    getWishlist()
      .then((res) => setWishlistCount((res.data.products || []).length))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  return (
    <WishlistContext.Provider value={{ wishlistCount, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}
