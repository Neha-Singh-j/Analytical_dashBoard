import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnalyticsProvider } from './context/AnalyticsContext';

import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';

import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CountriesPage } from './pages/CountriesPage';
import { IngestionPage } from './pages/IngestionPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

const ProtectedLayout = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AnalyticsProvider>
      <div className="flex min-h-screen bg-[#F8FAFC]">
        {/* Shared Sidebar Menu */}
        <Sidebar />

        {/* Main Layout Area */}
        <div className="pl-64 flex-1 flex flex-col min-w-0">
          {/* Shared Top Header */}
          <Header />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/countries" element={<CountriesPage />} />
              <Route path="/data" element={<IngestionPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </AnalyticsProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
