import { useLocation } from 'react-router-dom';
import Navbar from '../common/Navbar';
import CategoryBar from '../common/CategoryBar';
import Footer from '../common/Footer';

// Routes that don't need the category bar — auth pages and checkout get a
// clean, focused layout instead. Add a path here for any future full-width
// page that shouldn't show category browsing.
const NO_CATEGORY_BAR_ROUTES = [
  '/login',
  '/register',
  '/register-vendor',
  '/checkout',
  '/payment/callback',
  '/forgot-password',
];
// Prefix-matched separately since /reset-password/:token has a dynamic
// segment that a plain array of exact paths can't cover.
const NO_CATEGORY_BAR_PREFIXES = ['/reset-password/'];

// Full-width utility pages that need neither the category bar nor the
// footer — a chat window doesn't benefit from either, and the footer in
// particular was making the page taller than the chat itself, pushing the
// message input out of easy view.
const FOCUSED_ROUTES = ['/messages', '/admin/messages'];

export default function MainLayout({ children }) {
  const { pathname } = useLocation();
  const hideCategoryBar =
    NO_CATEGORY_BAR_ROUTES.includes(pathname) ||
    NO_CATEGORY_BAR_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isFocused = FOCUSED_ROUTES.includes(pathname);

  if (isFocused) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="sticky top-0 z-40">
          <Navbar />
        </div>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">{children}</main>
      </div>
    );
  }

  if (hideCategoryBar) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="sticky top-0 z-40">
          <Navbar />
        </div>
        <main className="flex-1 w-full flex items-center justify-center px-4 py-6">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-40">
        <Navbar />
        <CategoryBar />
      </div>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">{children}</main>
      <Footer />
    </div>
  );
}
