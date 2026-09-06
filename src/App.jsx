import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import VendorStorePage from "./pages/VendorStorePage";
import CategoryPage from "./pages/CategoryPage";
import SearchResults from "./pages/SearchResults";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderHistory from "./pages/OrderHistory";
import OrderDetails from "./pages/OrderDetails";
import Wishlist from "./pages/Wishlist";
import MyOffers from "./pages/MyOffers";
import PaymentCallback from "./pages/PaymentCallback";
import Terms from "./pages/Terms";
import Messages from "./pages/Messages";
import Privacy from "./pages/Privacy";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RegisterVendor from "./pages/auth/RegisterVendor";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Profile from "./pages/auth/Profile";

import VendorDashboard from "./pages/vendor/VendorDashboard";
import ManageMyProducts from "./pages/vendor/ManageMyProducts";
import ManageMyOrders from "./pages/vendor/ManageMyOrders";
import ManageMyOffers from "./pages/vendor/ManageMyOffers";
import VendorEarnings from "./pages/vendor/VendorEarnings";
import VendorAnalytics from "./pages/vendor/VendorAnalytics";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMessages from "./pages/admin/AdminMessages";
import ManageVendors from "./pages/admin/ManageVendors";
import ManageCategories from "./pages/admin/ManageCategories";
import ManageAllProducts from "./pages/admin/ManageAllProducts";
import ManageAllOrders from "./pages/admin/ManageAllOrders";
import ManagePromoSlides from "./pages/admin/ManagePromoSlides";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <MainLayout>
                <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/store/:vendorId" element={<VendorStorePage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/register-vendor" element={<RegisterVendor />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/reset-password/:token"
                  element={<ResetPassword />}
                />

                {/* Customer (any logged-in user) */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrderHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <Wishlist />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-offers"
                  element={
                    <ProtectedRoute>
                      <MyOffers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment/callback"
                  element={
                    <ProtectedRoute>
                      <PaymentCallback />
                    </ProtectedRoute>
                  }
                />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />

                {/* Vendor only */}
                <Route
                  path="/vendor"
                  element={
                    <ProtectedRoute roles={["vendor"]}>
                      <VendorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/products"
                  element={
                    <ProtectedRoute roles={["vendor"]}>
                      <ManageMyProducts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/orders"
                  element={
                    <ProtectedRoute roles={["vendor"]}>
                      <ManageMyOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/offers"
                  element={
                    <ProtectedRoute roles={["vendor"]}>
                      <ManageMyOffers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/earnings"
                  element={
                    <ProtectedRoute roles={["vendor"]}>
                      <VendorEarnings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/analytics"
                  element={
                    <ProtectedRoute roles={["vendor"]}>
                      <VendorAnalytics />
                    </ProtectedRoute>
                  }
                />

                {/* Admin only */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/messages"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminMessages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/vendors"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <ManageVendors />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <ManageCategories />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <ManageAllProducts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <ManageAllOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/promo-slides"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <ManagePromoSlides />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminAnalytics />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </MainLayout>
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
