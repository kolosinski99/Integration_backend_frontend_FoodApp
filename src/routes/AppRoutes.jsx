import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import RestaurantListPage from '../pages/client/RestaurantListPage';
import RestaurantDetailPage from '../pages/shared/RestaurantDetailPage';
import MenuPlaceholderPage from '../pages/shared/MenuPlaceholderPage';
import OwnerDashboardPage from '../pages/owner/OwnerDashboardPage';
import RestaurantFormPage from '../pages/owner/RestaurantFormPage';
import AdminDashboardPlaceholder from '../pages/admin/AdminDashboardPlaceholder';
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
    <Route
      path="/home"
      element={
        <ProtectedRoute>
          <HomePage />
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
          <MenuPlaceholderPage />
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
      path="/admin/dashboard"
      element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminDashboardPlaceholder />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
