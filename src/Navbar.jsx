import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const debounceRef = useRef(null);

  // Keep the input in sync if the URL's ?q= changes some other way
  // (e.g. back/forward navigation), so the box doesn't go stale.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (location.pathname === '/search') {
      setSearchValue(params.get('q') || '');
    }
  }, [location.pathname, location.search]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = value.trim();
      if (trimmed) {
        navigate(`/search?q=${encodeURIComponent(trimmed)}`, { replace: true });
      } else if (location.pathname === '/search') {
        navigate('/search', { replace: true });
      }
    }, 300);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = searchValue.trim();
    if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const navLinks = () => {
    if (!user) {
      return (
        <>
          <Link to="/login" className="block py-2 md:py-0 hover:text-accent-200" onClick={() => setMenuOpen(false)}>
            Login
          </Link>
          <Link
            to="/register"
            className="block md:inline-block bg-accent-200 text-primary-900 px-3 py-1.5 rounded-md hover:bg-accent-400 text-center"
            onClick={() => setMenuOpen(false)}
          >
            Sign up
          </Link>
        </>
      );
    }

    return (
      <>
        {user.role === 'customer' && (
          <>
            <Link to="/cart" className="block py-2 md:py-0 hover:text-accent-200" onClick={() => setMenuOpen(false)}>Cart</Link>
            <Link to="/orders" className="block py-2 md:py-0 hover:text-accent-200" onClick={() => setMenuOpen(false)}>Orders</Link>
            <Link to="/my-offers" className="block py-2 md:py-0 hover:text-accent-200" onClick={() => setMenuOpen(false)}>My offers</Link>
            <Link to="/wishlist" className="block py-2 md:py-0 hover:text-accent-200" onClick={() => setMenuOpen(false)}>Wishlist</Link>
          </>
        )}
        {user.role === 'vendor' && (
          <>
            <Link to="/vendor" className="block py-2 md:py-0 hover:text-accent-200" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/vendor/products" className="block py-2 md:py-0 hover:text-accent-200" onClick={() => setMenuOpen(false)}>My products</Link>
            <Link to="/vendor/orders" className="block py-2 md:py-0 hover:text-accent-200" onClick={() => setMenuOpen(false)}>Orders</Link>
            <Link to="/vendor/offers" className="block py-2 md:py-0 hover:text-accent-200" onClick={() => setMenuOpen(false)}>Offers</Link>
          </>
        )}
        {user.role === 'admin' && (
          <Link to="/admin" className="block py-2 md:py-0 hover:text-accent-200" onClick={() => setMenuOpen(false)}>Dashboard</Link>
        )}
        <Link to="/profile" className="block py-2 md:py-0 hover:text-accent-200" onClick={() => setMenuOpen(false)}>{user.name}</Link>
        <button onClick={handleLogout} className="block py-2 md:py-0 hover:text-accent-200 text-left w-full md:w-auto">
          Logout
        </button>
      </>
    );
  };

  return (
    <header className="bg-primary-900 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Top row: logo, search (desktop only), hamburger (mobile only) */}
        <div className="flex items-center gap-6">
          <Link to="/" className="font-heading text-xl font-semibold tracking-tight shrink-0">
            Kobo<span className="text-accent-200">Buy</span>
          </Link>

          <form onSubmit={handleSearchSubmit} className="hidden md:block flex-1 max-w-sm">
            <input
              name="q"
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="w-full rounded-md px-3 py-2 text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
            />
          </form>

          <nav className="hidden md:flex items-center gap-4 text-sm font-medium ml-auto">
            {navLinks()}
          </nav>

          <button
            className="md:hidden ml-auto text-white text-2xl leading-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? '✕' : '☰'}
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
            {navLinks()}
          </nav>
        )}
      </div>
    </header>
  );
}
