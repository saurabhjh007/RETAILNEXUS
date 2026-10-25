import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Warehouses } from './pages/Warehouses';
import { StockLevels } from './pages/StockLevels';
import { StockTransfers } from './pages/StockTransfers';
import { InventoryMovements } from './pages/InventoryMovements';
import { LowStockAlerts } from './pages/LowStockAlerts';
import { CustomerOrders } from './pages/CustomerOrders';
import { Suppliers } from './pages/Suppliers';
import { PurchaseOrders } from './pages/PurchaseOrders';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';
import { AgileDelivery } from './pages/AgileDelivery';
import { NotFound } from './pages/NotFound';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="warehouses" element={<Warehouses />} />
              <Route path="inventory" element={<StockLevels />} />
              <Route path="transfers" element={<StockTransfers />} />
              <Route path="movements" element={<InventoryMovements />} />
              <Route path="alerts" element={<LowStockAlerts />} />
              <Route path="orders" element={<CustomerOrders />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="purchase-orders" element={<PurchaseOrders />} />
              <Route path="reports" element={<Reports />} />
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredRole="ROLE_ADMIN">
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route path="agile" element={<AgileDelivery />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
