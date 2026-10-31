import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import AppLayout from './layouts/AppLayout';

// Public & Auth
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import { UnauthorizedPage, NotFoundPage } from './pages/auth/UnauthorizedPage';

// Shared
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

// Manager
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerFinancials from './pages/manager/ManagerFinancials';
import ManagerPrices from './pages/manager/ManagerPrices';
import ManagerProcurement from './pages/manager/ManagerProcurement';
import ManagerUsers from './pages/manager/ManagerUsers';
import ManagerReports from './pages/manager/ManagerReports';

// Office Manager
import OfficeDashboard from './pages/office/OfficeDashboard';
import OfficeInventory from './pages/office/OfficeInventory';
import OfficeConsolidation from './pages/office/OfficeConsolidation';
import OfficePayments from './pages/office/OfficePayments';
import OfficeDistribution from './pages/office/OfficeDistribution';
import OfficePrices from './pages/office/OfficePrices';
import OfficeAnnouncements from './pages/office/OfficeAnnouncements';

// Agricultural Expert
import ExpertDashboard from './pages/expert/ExpertDashboard';
import ExpertReviews from './pages/expert/ExpertReviews';
import ExpertRecommendations from './pages/expert/ExpertRecommendations';
import ExpertAdvisory from './pages/expert/ExpertAdvisory';

// Laborer
import LaborerDashboard from './pages/laborer/LaborerDashboard';
import LaborerTasks from './pages/laborer/LaborerTasks';
import LaborerStockLog from './pages/laborer/LaborerStockLog';

// Farmer
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerPlots from './pages/farmer/FarmerPlots';
import FarmerNewRequest from './pages/farmer/FarmerNewRequest';
import FarmerRequests from './pages/farmer/FarmerRequests';
import FarmerPayments from './pages/farmer/FarmerPayments';
import FarmerOrders from './pages/farmer/FarmerOrders';
import FarmerHistory from './pages/farmer/FarmerHistory';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Manager Routes */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/financials"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerFinancials />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/prices"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerPrices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/procurement"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerProcurement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/users"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/reports"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerReports />
            </ProtectedRoute>
          }
        />

        {/* Office Manager Routes */}
        <Route
          path="/office"
          element={
            <ProtectedRoute allowedRoles={['office_manager', 'manager']}>
              <OfficeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/office/inventory"
          element={
            <ProtectedRoute allowedRoles={['office_manager', 'manager']}>
              <OfficeInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/office/consolidation"
          element={
            <ProtectedRoute allowedRoles={['office_manager', 'manager']}>
              <OfficeConsolidation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/office/payments"
          element={
            <ProtectedRoute allowedRoles={['office_manager', 'manager']}>
              <OfficePayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/office/distribution"
          element={
            <ProtectedRoute allowedRoles={['office_manager', 'manager']}>
              <OfficeDistribution />
            </ProtectedRoute>
          }
        />
        <Route
          path="/office/prices"
          element={
            <ProtectedRoute allowedRoles={['office_manager', 'manager']}>
              <OfficePrices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/office/announcements"
          element={
            <ProtectedRoute allowedRoles={['office_manager', 'manager']}>
              <OfficeAnnouncements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/office/reports"
          element={
            <ProtectedRoute allowedRoles={['office_manager', 'manager']}>
              <ManagerReports />
            </ProtectedRoute>
          }
        />

        {/* Agricultural Expert Routes */}
        <Route
          path="/expert"
          element={
            <ProtectedRoute allowedRoles={['agricultural_expert', 'manager']}>
              <ExpertDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expert/reviews"
          element={
            <ProtectedRoute allowedRoles={['agricultural_expert', 'manager']}>
              <ExpertReviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expert/recommendations"
          element={
            <ProtectedRoute allowedRoles={['agricultural_expert', 'manager']}>
              <ExpertRecommendations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expert/advisory"
          element={
            <ProtectedRoute allowedRoles={['agricultural_expert', 'manager']}>
              <ExpertAdvisory />
            </ProtectedRoute>
          }
        />

        {/* Laborer Routes */}
        <Route
          path="/laborer"
          element={
            <ProtectedRoute allowedRoles={['laborer', 'office_manager']}>
              <LaborerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laborer/tasks"
          element={
            <ProtectedRoute allowedRoles={['laborer', 'office_manager']}>
              <LaborerTasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laborer/stock-logs"
          element={
            <ProtectedRoute allowedRoles={['laborer', 'office_manager']}>
              <LaborerStockLog />
            </ProtectedRoute>
          }
        />

        {/* Farmer Routes */}
        <Route
          path="/farmer"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer/plots"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <FarmerPlots />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer/requests/new"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <FarmerNewRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer/requests"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <FarmerRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer/payments"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <FarmerPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer/orders"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <FarmerOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer/history"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <FarmerHistory />
            </ProtectedRoute>
          }
        />

        {/* Shared Profile Route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
