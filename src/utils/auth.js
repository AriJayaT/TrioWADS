// src/utils/auth.js
import { validateEmail } from "./validation";

const users = [{ email: "test@example.com", password: "password123" }];

export const validateLogin = (email, password) => {
  return users.some((user) => user.email === email && user.password === password);
};

export const validateSignup = (email) => {
  return validateEmail(email) === "" && !users.some((user) => user.email === email);
};
