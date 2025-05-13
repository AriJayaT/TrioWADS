// src/components/common/LoginForm.jsx
import React, { useState, useEffect } from "react";
import { FaEnvelope, FaKey } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "/src/assets/logo.jpg";
import InputField from "./InputField";
import Button from "./Button";
import { loginUser } from "/src/utils/api";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState("client");
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get role from URL query params
    const searchParams = new URLSearchParams(location.search);
    const role = searchParams.get("role");
    if (role) {
      setUserRole(role);
    } else {
      // If no role in URL, get from localStorage or default to client
      const storedRole = localStorage.getItem('selectedRole');
      if (storedRole) {
        setUserRole(storedRole);
      }
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // For development purposes, allow direct navigation
      // Comment this out when API is ready
      if (email === "admin@jellycat.com" && password === "password" && userRole === "admin") {
        localStorage.setItem('user', JSON.stringify({role: 'admin', name: 'Admin User'}));
        localStorage.setItem('token', 'demo-token');
        navigate("/admin");
        return;
      } else if (email === "client@jellycat.com" && password === "password" && userRole === "client") {
        localStorage.setItem('user', JSON.stringify({role: 'client', name: 'Client User'}));
        localStorage.setItem('token', 'demo-token');
        navigate("/dashboard");
        return;
      }
      
      const response = await loginUser(email, password, userRole);
      
      if (response.success) {
        // Store user info and token in localStorage or context
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        
        // Redirect based on user role
        if (response.user.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("The email or password you enter is incorrect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative bg-white p-8 rounded-2xl shadow-xl w-96 text-center z-50">
      <div className="w-24 h-24 mx-auto -mt-14 mb-4 rounded-full p-0.5 bg-gradient-to-r from-yellow-500 via-red-500 to-purple-500 shadow-md">
        <div className="w-full h-full rounded-full overflow-hidden bg-white">
          <img src={logo} alt="Avatar" className="object-cover w-full h-full rounded-full" />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
      <p className="text-gray-600 mb-2">Sign in as {userRole === 'admin' ? 'Admin' : 'Customer'} 🌸</p>
      <p className="text-gray-500 text-xs mb-6">
        Not a {userRole}? <a href="/" className="text-pink-500 underline">Change role</a>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<FaEnvelope />}
          disabled={isLoading}
        />

        <InputField
          label="Your password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<FaKey />}
          disabled={isLoading}
        />

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <Button variant="bigSubmit" disabled={isLoading} type="submit">
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-5 text-sm">New to Jellycats?</p>
      <a href={`/signup?role=${userRole}`} className="text-pink-500 font-semibold">
        Create an account 🎀
      </a>
    </div>
  );
};

export default LoginForm;