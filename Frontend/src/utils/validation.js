export const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email) ? "" : "Enter a valid email address";
};

export const validatePhone = (phone) => {
  return /^\d+$/.test(phone) ? "" : "Phone number must contain only digits";
};

export const validatePassword = (password) => {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain a number";
  if (!/[\W_]/.test(password)) return "Password must contain a special character";
  return "";
};
