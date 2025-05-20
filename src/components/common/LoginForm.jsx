import React, { useState } from "react";
import { FaEnvelope, FaKey } from "react-icons/fa";
import logo from "/src/assets/logo.jpg";
import InputField from "./InputField";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { authService } from "/src/services/api";

const LoginForm = ({ userType = "customer" }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // Call the login API using our authService
      const result = await authService.login({ email, password });
      
      // Check user role if needed
      const user = result.user;
      
      // Redirect based on user type
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "agent") {
        navigate("/agent");
      } else {
        // For customer login, redirect to the customer dashboard
        navigate("/customer");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(typeof error === 'string' ? error : "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTypeTitle = () => {
    switch (userType) {
      case "admin":
        return "Admin";
      case "agent":
        return "Agent";
      default:
        return "Customer";
    }
  };

  const getSignupLink = () => {
    switch (userType) {
      case "admin":
        return "/admin/signup";
      case "agent":
        return "/agent/signup";
      default:
        return "/signup";
    }
  };

  const getRoleChangeLink = () => {
    return "/select-version";
  };

  return (
    <div className="relative bg-white p-8 rounded-2xl shadow-xl w-96 text-center">
      <div className="w-25 h-25 mx-auto -mt-14 mb-4 rounded-full p-0.5 bg-gradient-to-r from-yellow-500 via-red-500 to-purple-500 shadow-md">
        <div className="w-full h-full rounded-full overflow-hidden bg-white">
          <img src={logo} alt="Avatar" className="object-cover w-full h-full rounded-full" />
        </div>
      </div>

      <div className="inline-block px-4 py-1 mb-2 text-sm font-medium text-pink-700 bg-pink-100 rounded-full">
        {getUserTypeTitle()} Login
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
      <p className="text-gray-600 mb-6">Time to cuddle with your Jellycats 🌸</p>

      <form onSubmit={handleSubmit}>
        <InputField
          label="Your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<FaEnvelope />}
          className="mb-3"
          disabled={isLoading}
        />

        <InputField
          label="Your password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<FaKey />}
          className="mb-2"
          disabled={isLoading}
        />

        {error && <p className="text-red-500 mt-[-1px] text-sm">{error}</p>}

        <Button variant="bigSubmit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-5 text-sm">New to Jellycats?</p>
      <a href={getSignupLink()} className="text-pink-500 font-semibold">
        Create an account 🎀
      </a>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <a href={getRoleChangeLink()} className="text-gray-500 text-sm">
          Not a {getUserTypeTitle().toLowerCase()}? Change role
        </a>
      </div>
    </div>
  );
};

export default LoginForm;