import React, { useEffect } from "react";
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
import CustomerProfile from "./components/pages/profile/CustomerProfile";
import AdminProfile from "./components/pages/profile/AdminProfile";
import AgentProfile from "./components/pages/profile/AgentProfile";
import { AuthProvider, useAuth } from "./context/AuthContext";
import VerifyEmail from './components/pages/login&signup/VerifyEmail';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
              <p className="mt-2 text-gray-600">{this.state.error?.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Private route component to protect routes that require authentication
const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to appropriate dashboard if user role doesn't match required role
  if (requiredRole && user && user.role !== requiredRole) {
    // Redirect based on user role
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'agent') {
      return <Navigate to="/agent" replace />;
    } else {
      return <Navigate to="/customer" replace />;
    }
  }
  
  // Render children if authenticated and authorized
  return children;
};

// Loading component for initial app load
const LoadingScreen = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
  </div>
);

function App() {
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    console.log('App component mounted');
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
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
              <PrivateRoute requiredRole="customer">
                <CreateTicket />
              </PrivateRoute>
            } />
            <Route path="/create-ticket" element={<Navigate to="/customer/create-ticket" replace />} />
            
            {/* Dashboard routes - protected routes */}
            <Route path="/admin" element={
              <PrivateRoute requiredRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            } />
            <Route path="/admin/agents" element={
              <PrivateRoute requiredRole="admin">
                <AgentManagement />
              </PrivateRoute>
            } />
            <Route path="/admin/analytics" element={
              <PrivateRoute requiredRole="admin">
                <AdminAnalytic />
              </PrivateRoute>
            } />
            <Route path="/admin/profile" element={
              <PrivateRoute requiredRole="admin">
                <AdminProfile />
              </PrivateRoute>
            } />
            <Route path="/agent" element={
              <PrivateRoute requiredRole="agent">
                <AgentDashboard />
              </PrivateRoute>
            } />
            <Route path="/agent/tickets" element={
              <PrivateRoute requiredRole="agent">
                <TicketList />
              </PrivateRoute>
            } />
            <Route path="/agent/profile" element={
              <PrivateRoute requiredRole="agent">
                <AgentProfile />
              </PrivateRoute>
            } />
            
            {/* Customer Dashboard Routes - protected routes */}
            <Route path="/customer" element={
              <PrivateRoute requiredRole="customer">
                <CustomerLayout />
              </PrivateRoute>
            }>
              <Route index element={<CustomerHome />} />
              <Route path="dashboard" element={<Navigate to="/customer" replace />} />
              <Route path="tickets" element={<CustomerDashboard />} />
              <Route path="ticket/:ticketId" element={<TicketDetails />} />
              <Route path="help-center" element={<HelpCenter />} />
              <Route path="profile" element={<CustomerProfile />} />
            </Route>
            
            {/* Public Help Center Route */}
            <Route path="/help-center" element={<StandaloneHelpCenter />} />
            
            {/* Redirects for old routes */}
            <Route path="/knowledge-base" element={<Navigate to="/help-center#knowledge" replace />} />
            <Route path="/faq" element={<Navigate to="/help-center#faq" replace />} />
            
            {/* Verify Email Route */}
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;