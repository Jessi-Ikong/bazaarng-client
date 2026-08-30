import { createContext, useState, useCallback, useEffect } from 'react';
import { getCart } from '../services/cartService';
import { useAuth } from '../hooks/useAuth';

export const CartContext = createContext(null);

// Tracks a live cart item count for the navbar badge. Any page that
// mutates the cart (add/update/remove/checkout) calls refreshCart()
// afterwards so the badge stays in sync without a full page reload.
export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(() => {
    if (!user || user.role !== 'customer') {
      setCartCount(0);
      return;
    }
    getCart()
      .then((res) => {
        const count = (res.data.items || []).reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}
