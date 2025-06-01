// src/utils/auth.js
import { validateEmail } from "./validation";

// Mock user database with different user types
const users = [
  { email: "customer@example.com", password: "password123", type: "customer" },
  { email: "agent@example.com", password: "password123", type: "agent" },
  { email: "admin@example.com", password: "password123", type: "admin" },
  { email: "test@example.com", password: "password123", type: "customer" }
];

export const validateLogin = (email, password) => {
  // For demo purposes, accept any combination
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // Regular validation
  return users.some((user) => user.email === email && user.password === password);
};

export const getUserType = (email) => {
  const user = users.find((user) => user.email === email);
  return user ? user.type : "customer"; // Default to customer if not found
};

export const validateSignup = (email) => {
  return validateEmail(email) === "" && !users.some((user) => user.email === email);
};

// Demo function to get current user data (in a real app, this would be from a session/token)
export const getCurrentUser = () => {
  // Mock current user
  return {
    name: "Sarah Anderson",
    email: "agent@example.com",
    type: "agent",
    role: "Senior Support Agent",
    avatarInitials: "SA"
  };
};