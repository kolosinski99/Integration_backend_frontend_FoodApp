import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import RestaurantListPage from '../pages/client/RestaurantListPage';
import RestaurantDetailPage from '../pages/shared/RestaurantDetailPage';
import MenuPage from '../pages/shared/MenuPage';
import ProfilePage from '../pages/shared/ProfilePage';
import OwnerDashboardPage from '../pages/owner/OwnerDashboardPage';
import RestaurantFormPage from '../pages/owner/RestaurantFormPage';
import MenuManagementPage from '../pages/owner/MenuManagementPage';
import MenuItemFormPage from '../pages/owner/MenuItemFormPage';
import OwnerOrdersPage from '../pages/owner/OwnerOrdersPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import PartnerApplicationPage from '../pages/public/PartnerApplicationPage';
import CartPage from '../pages/client/CartPage';
import OrderHistoryPage from '../pages/client/OrderHistoryPage';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

const RootRedirect = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ padding: 24 }}>Ładowanie...</div>;
  return <Navigate to={isAuthenticated ? '/home' : '/login'} replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<RootRedirect />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/partner-application" element={<PartnerApplicationPage />} />
    <Route
      path="/home"
      element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute allowedRoles={['USER', 'OWNER']}>
          <ProfilePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/restaurants"
      element={
        <ProtectedRoute allowedRoles={['USER']}>
          <RestaurantListPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/cart"
      element={
        <ProtectedRoute allowedRoles={['USER']}>
          <CartPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/orders"
      element={
        <ProtectedRoute allowedRoles={['USER']}>
          <OrderHistoryPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/restaurants/:id"
      element={
        <ProtectedRoute allowedRoles={['USER', 'OWNER']}>
          <RestaurantDetailPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/restaurants/:id/menu"
      element={
        <ProtectedRoute allowedRoles={['USER', 'OWNER']}>
          <MenuPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/owner/dashboard"
      element={
        <ProtectedRoute allowedRoles={['OWNER']}>
          <OwnerDashboardPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/owner/restaurant/new"
      element={
        <ProtectedRoute allowedRoles={['OWNER']}>
          <RestaurantFormPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/owner/restaurant/edit"
      element={
        <ProtectedRoute allowedRoles={['OWNER']}>
          <RestaurantFormPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/owner/menu"
      element={
        <ProtectedRoute allowedRoles={['OWNER']}>
          <MenuManagementPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/owner/menu/new"
      element={
        <ProtectedRoute allowedRoles={['OWNER']}>
          <MenuItemFormPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/owner/menu/edit/:id"
      element={
        <ProtectedRoute allowedRoles={['OWNER']}>
          <MenuItemFormPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/owner/orders"
      element={
        <ProtectedRoute allowedRoles={['OWNER']}>
          <OwnerOrdersPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/dashboard"
      element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminDashboardPage />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
