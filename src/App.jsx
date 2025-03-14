import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Import pages
import LandingPage from './pages/LandingPage';
import SupportTickets from './pages/SupportTickets';
import HelpCenterPage from './pages/HelpCenter';
import SubmitTicket from './components/SupportTickets/SubmitTicket';

// Import components
import { ChatWidget } from './components/SupportTickets/ChatWidget';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Redirect /dashboard to /support-tickets */}
        <Route path="/dashboard" element={<Navigate to="/support-tickets" />} />
        <Route path="/support-tickets" element={<SupportTickets />} />
        <Route path="/help-center" element={<HelpCenterPage />} />
        <Route path="/submit-ticket" element={<SubmitTicket />} />
      </Routes>
      
      {/* ChatWidget is displayed on all pages */}
      <ChatWidget maxMessageLength={500} maxMessages={50} />
    </Router>
  );
};

export default App;