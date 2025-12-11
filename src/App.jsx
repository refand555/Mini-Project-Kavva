import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Header from "./components/Layout/Header/Header";
import Footer from "./components/Layout/Footer/Footer";

import Main from "./pages/Main";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardPage from "./pages/User/Dashboard";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import CategoryPage from "./pages/Category/CategoryPage";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import AuthCallback from "./pages/AuthCallback";

import ProtectedRoute from "./route/ProtectedRoute";
import PublicRoute from "./route/PublicRoute";
import AdminRoute from "./route/AdminRoute";
import { useAuth } from "./context/authContext";

import AdminLayout from "./pages/Admin/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import ProfileAdmin from "./pages/Admin/ProfileAdmin";
import ProductsPage from "./pages/Admin/Products/ProductsPage";
import OrdersPage from "./pages/Admin/Orders/OrdersPage";
import AddProduct from "./pages/Admin/Products/AddProduct";
import EditProduct from "./pages/Admin/Products/EditProduct";
import EditVariant from "./pages/Admin/Products/EditVariants";

import ProductDetails from "./pages/ProductDetails";

import CheckoutPage from "./pages/CheckoutPage";
import Ordersuccess from "./pages/Ordersuccess";
import UserOrders from "./pages/UserOrders";
import OrderDetail from "./pages/OrderDetail";

export default function App() {
  const location = useLocation();
  const { profile, loading, profileLoading } = useAuth();

  // HAPUS REDIRECT PAKSA RESET-PASSWORD
  // (INI YANG MERUSAK RECOVERY SESSION SEBELUMNYA)

  // GLOBAL LOADING (supaya tidak flicker)
  if (loading || profileLoading) {
    return <div className="p-6">Loading...</div>;
  }

  // IZINKAN /reset-password DAN /auth/callback BEBAS DARI GUARD
  const isRecoveryPath =
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/auth/callback");

  // GLOBAL GUARD UNTUK ADMIN:
  // Admin tidak boleh masuk halaman user/public, kecuali recovery path
  if (!isRecoveryPath && profile?.role === "admin") {
    const allowedAdminPath = location.pathname.startsWith("/admin");
    if (!allowedAdminPath) {
      return <Navigate to="/admin" replace />;
    }
  }

  // HIDE HEADER & FOOTER
  const hideLayout =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/reset-password") || // recovery bebas layout
    location.pathname.startsWith("/auth/callback") || // callback bebas layout
    location.pathname.startsWith("/cart") ||
    location.pathname.startsWith("/wishlist") ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/orders") ||
    location.pathname.startsWith("/order") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/forgot-password") ||
    location.pathname.startsWith("/checkout");

  return (
    <>
      {!hideLayout && location.pathname !== "/" && <Header />}

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Main />} />

        {/* AUTH */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

        {/* SUPABASE CALLBACK (WAJIB ADA) */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* RESET PASSWORD PAGE */}
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

        {/* CATEGORY */}
        <Route path="/category/:main" element={<CategoryPage />} />
        <Route path="/category/:main/:sub" element={<CategoryPage />} />

        {/* PRODUCT */}
        <Route path="/product/:id" element={<ProductDetails />} />

        {/* USER */}
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

        {/* ORDER SYSTEM */}
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute><Ordersuccess /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><UserOrders /></ProtectedRoute>} />
        <Route path="/order/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

        {/* ADMIN */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<ProfileAdmin />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="products/:id/variants" element={<EditVariant />} />
          <Route path="orders" element={<OrdersPage />} />
        </Route>

        {/* WRONG ROUTES */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!hideLayout && <Footer />}
    </>
  );
}