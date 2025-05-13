// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RoleSelectionPage from "./components/pages/login&signup/RoleSelectionPage";
import LoginPage from "./components/pages/login&signup/LoginPage";
import Signup from "./components/pages/login&signup/Signup";
import AdminDashboard from "./components/pages/admin/adminDashboard";
import ClientDashboard from "./components/pages/client/ClientDashboard"; // You'll need to create this component

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelectionPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<ClientDashboard />} /> {/* Client dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;