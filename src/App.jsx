import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/pages/login&signup/LoginPage";
import Signup from "./components/pages/login&signup/Signup";
import AdminDashboard from "./components/pages/admin/adminDashboard";
import AgentManagement from './components/pages/admin/AgentManagement';
import AdminAnalytic from './components/pages/admin/AdminAnalytic';
import VersionSelectPage from "./components/pages/VersionSelect/VersionSelectPage";
import AgentDashboard from "./components/pages/agent/AgentDashboard";
import TicketList from "./components/pages/agent/TicketList";
import LandingPage from "./components/pages/LandingPage/LandingPage";
import HelpCenter from "./components/pages/HelpCenter/HelpCenter";
import StandaloneHelpCenter from "./components/pages/HelpCenter/StandaloneHelpCenter";
import CreateTicket from "./components/pages/CreateTicket/CreateTicket";
import CustomerLayout from "./components/layout/CustomerLayout";
import CustomerHome from "./components/pages/customer/CustomerHome";
import CustomerDashboard from "./components/pages/customer/CustomerDashboard";
import TicketDetails from "./components/pages/customer/TicketDetails";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Private route component to protect routes that require authentication
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Render children if authenticated
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/select-version" element={<VersionSelectPage />} />
          
          {/* Login routes for different roles */}
          <Route path="/login" element={<LoginPage userType="customer" />} />
          <Route path="/admin/login" element={<LoginPage userType="admin" />} />
          <Route path="/agent/login" element={<LoginPage userType="agent" />} />
          
          {/* Signup routes for different roles */}
          <Route path="/signup" element={<Signup userType="customer" />} />
          <Route path="/admin/signup" element={<Signup userType="admin" />} />
          <Route path="/agent/signup" element={<Signup userType="agent" />} />
          
          {/* Customer ticket creation - protected route */}
          <Route path="/customer/create-ticket" element={
            <PrivateRoute>
              <CreateTicket />
            </PrivateRoute>
          } />
          <Route path="/create-ticket" element={<Navigate to="/customer/create-ticket" replace />} />
          
          {/* Dashboard routes - protected routes */}
          <Route path="/admin" element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/agents" element={
            <PrivateRoute>
              <AgentManagement />
            </PrivateRoute>
          } />
          <Route path="/admin/analytics" element={
            <PrivateRoute>
              <AdminAnalytic />
            </PrivateRoute>
          } />
          <Route path="/agent" element={
            <PrivateRoute>
              <AgentDashboard />
            </PrivateRoute>
          } />
          <Route path="/agent/tickets" element={
            <PrivateRoute>
              <TicketList />
            </PrivateRoute>
          } />
          
          {/* Customer Dashboard Routes - protected routes */}
          <Route path="/customer" element={
            <PrivateRoute>
              <CustomerLayout />
            </PrivateRoute>
          }>
            <Route index element={<CustomerHome />} />
            <Route path="dashboard" element={<Navigate to="/customer" replace />} />
            <Route path="tickets" element={<CustomerDashboard />} />
            <Route path="ticket/:ticketId" element={<TicketDetails />} />
            <Route path="help-center" element={<HelpCenter />} />
          </Route>
          
          {/* Public Help Center Route */}
          <Route path="/help-center" element={<StandaloneHelpCenter />} />
          
          {/* Redirects for old routes */}
          <Route path="/knowledge-base" element={<Navigate to="/help-center#knowledge" replace />} />
          <Route path="/faq" element={<Navigate to="/help-center#faq" replace />} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;