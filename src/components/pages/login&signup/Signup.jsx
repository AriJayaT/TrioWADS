import React, { useState } from "react";
import { FaUser, FaEnvelope, FaPhone, FaKey } from "react-icons/fa";
import InputField from "/src/components/common/InputField";
import Button from "/src/components/common/Button";
import { validateEmail, validatePhone, validatePassword } from "/src/utils/validation";
import logo from "/src/assets/logo.jpg";
import { useNavigate } from "react-router-dom";
import authService from "/src/services/api/authService";

const Signup = ({ userType = "customer" }) => {
  const navigate = useNavigate();
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
    submit: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    setErrors({ ...errors, submit: "" });

    // Validate all fields on submit
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    const passwordError = validatePassword(formData.password);

    setErrors({ email: emailError, phone: phoneError, password: passwordError });

    // If no errors, proceed with submission
    if (!emailError && !phoneError && !passwordError) {
      try {
        // Call the registration API
        await authService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: userType
        });

        // Redirect to the appropriate login page after successful registration
        if (userType === "admin") {
          navigate("/admin/login");
        } else if (userType === "agent") {
          navigate("/agent/login");
        } else {
          navigate("/login");
        }

      } catch (error) {
        setErrors({
          ...errors,
          submit: error.message || "Registration failed. Please try again."
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
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

  const getLoginLink = () => {
    switch (userType) {
      case "admin":
        return "/admin/login";
      case "agent":
        return "/agent/login";
      default:
        return "/login";
    }
  };

  const getRoleChangeLink = () => {
    return "/select-version";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-white to-pink-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center relative z-10 hover:shadow-pink-300 transition-shadow duration-300">
        <div className="w-25 h-25 mx-auto -mt-14 mb-4 rounded-full p-0.5 bg-gradient-to-r from-yellow-500 via-red-500 to-purple-500 shadow-md">
          <div className="w-full h-full rounded-full overflow-hidden bg-white">
            <img src={logo} alt="Avatar" className="object-cover w-full h-full rounded-full" />
          </div>
        </div>

        <div className="inline-block px-4 py-1 mb-2 text-sm font-medium text-pink-700 bg-pink-100 rounded-full">
          {getUserTypeTitle()} Signup
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">Join the Jellycat Family!</h2>
        <p className="text-gray-600 mb-6">Create your {getUserTypeTitle().toLowerCase()} account to get started 🎀</p>

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {errors.submit}
          </div>
        )}

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

          <Button variant='bigSubmit' disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-5 text-sm">
          Already have an account?
        </p>
        <a href={getLoginLink()} className="text-pink-500 font-semibold">
          Sign in instead 🌸
        </a>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <a href={getRoleChangeLink()} className="text-gray-500 text-sm">
            Not a {getUserTypeTitle().toLowerCase()}? Change role
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup;