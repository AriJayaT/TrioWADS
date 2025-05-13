// src/components/pages/login&signup/Signup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhone, FaKey } from "react-icons/fa";
import InputField from "/src/components/common/InputField";
import Button from "/src/components/common/Button";
import { validateEmail, validatePhone, validatePassword } from "/src/utils/validation";
import logo from "/src/assets/logo.jpg";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    password: "",
    general: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Live validation
    if (name === "email") setErrors({ ...errors, email: validateEmail(value) });
    if (name === "phone") setErrors({ ...errors, phone: validatePhone(value) });
    if (name === "password") setErrors({ ...errors, password: validatePassword(value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate all fields on submit
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    const passwordError = validatePassword(formData.password);

    setErrors({ 
      email: emailError, 
      phone: phoneError, 
      password: passwordError,
      general: "" 
    });

    // If no errors, proceed with submission
    if (!emailError && !phoneError && !passwordError) {
      try {
        // For development purposes, simulate successful signup
        console.log("Signup form submitted:", formData);
        
        // Simulate API call
        setTimeout(() => {
          // Store user info in localStorage (for development)
          localStorage.setItem('user', JSON.stringify({
            name: formData.name,
            email: formData.email,
            role: 'user'
          }));
          localStorage.setItem('token', 'demo-token');
          
          // Navigate to dashboard
          navigate("/admin");
          
          setIsLoading(false);
        }, 1000);
        
        // In production, you would use your API:
        // const response = await registerUser(formData);
        // if (response.success) {
        //   localStorage.setItem('user', JSON.stringify(response.user));
        //   localStorage.setItem('token', response.token);
        //   navigate("/dashboard");
        // }
      } catch (error) {
        console.error("Registration error:", error);
        setErrors({ 
          ...errors, 
          general: "An error occurred during registration. Please try again." 
        });
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-white to-pink-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center relative z-10 hover:shadow-pink-300 transition-shadow duration-300">
        <div className="w-25 h-25 mx-auto -mt-14 mb-4 rounded-full p-0.5 bg-gradient-to-r from-yellow-500 via-red-500 to-purple-500 shadow-md">
          <div className="w-full h-full rounded-full overflow-hidden bg-white">
            <img src={logo} alt="Avatar" className="object-cover w-full h-full rounded-full" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Join the Jellycat Family!</h2>
        <p className="text-gray-600 mb-6">Create your account to start collecting 🎀</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <InputField
            label="Your full name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            icon={<FaUser />}
            disabled={isLoading}
            required
          />
          <InputField
            label="Your email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={<FaEnvelope />}
            disabled={isLoading}
            required
          />
          <InputField
            label="Your phone number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            icon={<FaPhone />}
            disabled={isLoading}
            required
          />
          <InputField
            label="Create a password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={<FaKey />}
            disabled={isLoading}
            required
          />

          {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}

          <Button type="submit" variant="bigSubmit" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-5 text-sm">
          Already have an account?
        </p>
        <a href="/" className="text-pink-500 font-semibold">
          Sign in instead 🌸
        </a>
      </div>
    </div>
  );
};

export default Signup;