import React, { useState } from "react";
import { FaUser, FaEnvelope, FaPhone, FaKey } from "react-icons/fa";
import InputField from "./InputField";
import Button from "./Button";
import { validateEmail, validatePhone, validatePassword } from "../utils/validation";
import logo from "../assets/logo.jpg"

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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Live validation
    if (name === "email") setErrors({ ...errors, email: validateEmail(value) });
    if (name === "phone") setErrors({ ...errors, phone: validatePhone(value) });
    if (name === "password") setErrors({ ...errors, password: validatePassword(value) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields on submit
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    const passwordError = validatePassword(formData.password);

    setErrors({ email: emailError, phone: phoneError, password: passwordError });

    // If no errors, proceed with submission
    if (!emailError && !phoneError && !passwordError) {
      alert("Signup successful!");
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
          />
          <InputField
            label="Your email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={<FaEnvelope />}
          />
          <InputField
            label="Your phone number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            icon={<FaPhone />}
          />
          <InputField
            label="Create a password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={<FaKey />}
          />

          <Button>Create Account</Button>
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