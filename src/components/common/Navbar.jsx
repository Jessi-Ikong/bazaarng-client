import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { getMyOffers, getVendorOffers } from "../../services/offerService";
import { getUnreadCount } from "../../services/chatService";
import { getMyOrders } from "../../services/orderService";
import { onCountsChanged } from "../../utils/notifyCountsChanged";
import { getOrdersLastViewed } from "../../utils/ordersLastViewed";

// Small badge that only renders once there's something to show.
function CountBadge({ count }) {
  if (!count || count <= 0) return null;
  return (
    <span className="absolute -top-1.5 -right-2 bg-accent-200 text-primary-900 text-[10px] font-semibold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [offersCount, setOffersCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const debounceRef = useRef(null);

  // Keep the input in sync if the URL's ?q= changes some other way
  // (e.g. back/forward navigation), so the box doesn't go stale.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (location.pathname === "/search") {
      setSearchValue(params.get("q") || "");
    }
  }, [location.pathname, location.search]);

  // Offers count reflects offers that need this user's attention right
  // now (a countered offer awaiting the buyer, or a pending one awaiting
  // the vendor) — it's a live derived count, not a "seen/unseen" flag, so
  // it naturally clears once the person actually acts on the offer.
  // Polled on an interval (not on every navigation — that was firing a
  // full backend round-trip on literally every click anywhere in the
  // app, which was a real contributor to the app feeling slow) and
  // paused while the tab isn't visible, since there's no point polling
  // for something nobody's looking at.
  useEffect(() => {
    if (!user || (user.role !== "customer" && user.role !== "vendor")) {
      setOffersCount(0);
      return;
    }

    const fetchOffersCount = () => {
      if (document.hidden) return;
      const request =
        user.role === "customer" ? getMyOffers() : getVendorOffers();
      const actionableStatus =
        user.role === "customer" ? "countered" : "pending";
      request
        .then((res) => {
          const count = res.data.filter(
            (o) => o.status === actionableStatus,
          ).length;
          setOffersCount(count);
        })
        .catch(() => {});
    };

    fetchOffersCount();
    const interval = setInterval(fetchOffersCount, 12000);
    const unsubscribe = onCountsChanged(fetchOffersCount);
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [user]);

  // Same reasoning as offers above.
  useEffect(() => {
    if (!user) {
      setUnreadMessagesCount(0);
      return;
    }

    const fetchUnread = () => {
      if (document.hidden) return;
      getUnreadCount()
        .then((res) => setUnreadMessagesCount(res.data.count))
        .catch(() => {});
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 12000);
    const unsubscribe = onCountsChanged(fetchUnread);
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [user]);

  // Orders: badges any order updated (e.g. shipped/delivered) since the
  // buyer last opened Order History. Same poll + immediate-refetch pattern
  // as offers/messages above; "last viewed" is tracked client-side since
  // there's no per-user read-state for orders on the backend.
  useEffect(() => {
    if (!user || user.role !== "customer") {
      setOrdersCount(0);
      return;
    }

    const fetchOrdersCount = () => {
      if (document.hidden) return;
      const lastViewed = getOrdersLastViewed();
      getMyOrders()
        .then((res) => {
          const count = res.data.filter(
            (o) => new Date(o.updatedAt).getTime() > lastViewed,
          ).length;
          setOrdersCount(count);
        })
        .catch(() => {});
    };

    fetchOrdersCount();
    const interval = setInterval(fetchOrdersCount, 12000);
    const unsubscribe = onCountsChanged(fetchOrdersCount);
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = value.trim();
      if (trimmed) {
        navigate(`/search?q=${encodeURIComponent(trimmed)}`, { replace: true });
      } else if (location.pathname === "/search") {
        navigate("/search", { replace: true });
      }
    }, 300);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = searchValue.trim();
    if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  // `isMobile` controls label visibility: always shown in the mobile
  // dropdown (plenty of vertical room), hidden below xl in the compact
  // desktop icon row (icon-only until there's enough width for labels too).
  const navLinks = (isMobile) => {
    const labelClass = isMobile ? "" : "hidden xl:inline";
    // Both branches need `relative` — CountBadge positions itself with
    // `absolute`, and without a positioned ancestor here it escapes to the
    // nearest one further up the tree (the sticky header), landing all
    // badges in one spot instead of pinned to their own icon. This was the
    // actual cause of badges appearing missing/wrong on mobile.
    const itemClass = isMobile
      ? "relative flex items-center gap-2 py-2 hover:text-accent-200"
      : "relative flex items-center gap-1.5 hover:text-accent-200";

    if (!user) {
      return (
        <>
          <Link
            to="/login"
            className={itemClass}
            title="Login"
            onClick={() => setMenuOpen(false)}
          >
            <i className="ti ti-login text-lg" />
            <span className={labelClass}>Login</span>
          </Link>
          <Link
            to="/register"
            title="Sign up"
            className={
              isMobile
                ? "block bg-accent-200 text-primary-900 px-3 py-2 rounded-md hover:bg-accent-400 text-center font-medium"
                : "bg-accent-200 text-primary-900 px-3 py-1.5 rounded-md hover:bg-accent-400 font-medium"
            }
            onClick={() => setMenuOpen(false)}
          >
            Sign up
          </Link>
        </>
      );
    }

    return (
      <>
        {user.role === "customer" && (
          <>
            <Link
              to="/cart"
              className={itemClass}
              title="Cart"
              onClick={() => setMenuOpen(false)}
            >
              <i className="ti ti-shopping-cart text-lg" />
              <span className={labelClass}>Cart</span>
              <CountBadge count={cartCount} />
            </Link>
            <Link
              to="/orders"
              className={itemClass}
              title="Orders"
              onClick={() => setMenuOpen(false)}
            >
              <i className="ti ti-package text-lg" />
              <span className={labelClass}>Orders</span>
              <CountBadge count={ordersCount} />
            </Link>
            <Link
              to="/my-offers"
              className={itemClass}
              title="My offers"
              onClick={() => setMenuOpen(false)}
            >
              <i className="ti ti-tag text-lg" />
              <span className={labelClass}>Offers</span>
              <CountBadge count={offersCount} />
            </Link>
            <Link
              to="/wishlist"
              className={itemClass}
              title="Wishlist"
              onClick={() => setMenuOpen(false)}
            >
              <i className="ti ti-heart text-lg" />
              <span className={labelClass}>Wishlist</span>
              <CountBadge count={wishlistCount} />
            </Link>
            <Link
              to="/messages"
              className={itemClass}
              title="Messages"
              onClick={() => setMenuOpen(false)}
            >
              <i className="ti ti-message-circle text-lg" />
              <span className={labelClass}>Messages</span>
              <CountBadge count={unreadMessagesCount} />
            </Link>
          </>
        )}
        {user.role === "vendor" && (
          <>
            <Link
              to="/vendor"
              className={itemClass}
              title="Dashboard"
              onClick={() => setMenuOpen(false)}
            >
              <i className="ti ti-layout-dashboard text-lg" />
              <span className={labelClass}>Dashboard</span>
            </Link>
            <Link
              to="/vendor/products"
              className={itemClass}
              title="My products"
              onClick={() => setMenuOpen(false)}
            >
              <i className="ti ti-box text-lg" />
              <span className={labelClass}>My products</span>
            </Link>
            <Link
              to="/vendor/orders"
              className={itemClass}
              title="Orders"
              onClick={() => setMenuOpen(false)}
            >
              <i className="ti ti-package text-lg" />
              <span className={labelClass}>Orders</span>
            </Link>
            <Link
              to="/vendor/offers"
              className={itemClass}
              title="Offers"
              onClick={() => setMenuOpen(false)}
            >
              <i className="ti ti-tag text-lg" />
              <span className={labelClass}>Offers</span>
              <CountBadge count={offersCount} />
            </Link>
            <Link
              to="/messages"
              className={itemClass}
              title="Messages"
              onClick={() => setMenuOpen(false)}
            >
              <i className="ti ti-message-circle text-lg" />
              <span className={labelClass}>Messages</span>
              <CountBadge count={unreadMessagesCount} />
            </Link>
          </>
        )}
        {user.role === "admin" && (
          <>
            <Link
              to="/admin"
              className={itemClass}
              title="Admin"
              onClick={() => setMenuOpen(false)}
            >
              <i className="ti ti-shield-check text-lg" />
              <span className={labelClass}>Admin</span>
            </Link>
            <Link
              to="/admin/messages"
              className={itemClass}
              title="Support"
              onClick={() => setMenuOpen(false)}
            >
              <i className="ti ti-message-circle text-lg" />
              <span className={labelClass}>Support</span>
              <CountBadge count={unreadMessagesCount} />
            </Link>
          </>
        )}
        <Link
          to="/profile"
          className={itemClass}
          title="Profile"
          onClick={() => setMenuOpen(false)}
        >
          <i className="ti ti-user text-lg" />
          <span className={`${labelClass} max-w-[100px] truncate`}>
            {user.name}
          </span>
        </Link>
        <button
          onClick={handleLogout}
          title="Logout"
          className={`${itemClass} text-left w-full xl:w-auto`}
        >
          <i className="ti ti-logout text-lg" />
          <span className={labelClass}>Logout</span>
        </button>
      </>
    );
  };

  return (
    <header className="bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Top row: on md+ this becomes a 3-column grid (logo | search | nav)
            so the search bar centers in the space actually left over between
            the logo and nav links, rather than always hugging the logo. */}
        <div className="flex items-center justify-between gap-4 md:grid md:grid-cols-[auto_1fr_auto] md:gap-6">
          <Link
            to="/"
            className="font-heading text-xl font-semibold tracking-tight shrink-0"
          >
            Kobo<span className="text-accent-200">Buy</span>
          </Link>

          <div className="hidden md:flex justify-center">
            <form onSubmit={handleSearchSubmit} className="w-full max-w-sm">
              <input
                name="q"
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="w-full rounded-md px-3 py-2 text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
              />
            </form>
          </div>

          <nav className="hidden md:flex items-center gap-3 lg:gap-4 text-sm font-medium">
            {navLinks(false)}
          </nav>

          <button
            className="md:hidden text-white text-2xl leading-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <i className={menuOpen ? "ti ti-x" : "ti ti-menu-2"} />
          </button>
        </div>

        {/* Search bar: own full-width row on mobile */}
        <form onSubmit={handleSearchSubmit} className="md:hidden mt-3">
          <input
            name="q"
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search products..."
            className="w-full rounded-md px-3 py-2 text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
          />
        </form>

        {/* Collapsible nav links on mobile */}
        {menuOpen && (
          <nav className="md:hidden mt-3 pt-3 border-t border-primary-800 text-sm font-medium">
            {navLinks(true)}
          </nav>
        )}
      </div>
    </header>
  );
}
