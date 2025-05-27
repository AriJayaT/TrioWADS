import React, { useState } from "react";
import { FaUser, FaEnvelope, FaPhone, FaKey, FaHome } from "react-icons/fa";
import InputField from "/src/components/common/InputField";
import Button from "/src/components/common/Button";
import { validateEmail, validatePhone, validatePassword } from "/src/utils/validation";
import logo from "/src/assets/logo.jpg";
import { useNavigate, Link } from "react-router-dom";
import authService from "/src/services/api/authService";
import { GoogleLogin } from '@react-oauth/google';

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
        // Clear any existing auth data
        authService.logout();
        
        // Call the registration API
        const result = await authService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: userType
        });

        // Instead of navigating to login, show a success message
        // and inform the user to check their email.
        setErrors({ // Clear any previous errors
          email: "",
          phone: "",
          password: "",
          submit: result.message || "Registration successful. Please check your email for verification."
        });

        // Optionally clear the form
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
        });

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

  const handleGoogleAuthSuccess = async (credentialResponse) => {
    setIsSubmitting(true);
    setErrors({ ...errors, submit: "" });

    try {
      const result = await authService.loginWithGoogle(credentialResponse, userType);
      const user = result.user;

       // Since signup with Google automatically verifies, redirect to dashboard if successful
      // Validate user role matches the selected login type
      if (user.role !== userType) {
         // Log out the user if role doesn't match
         authService.logout();
         throw new Error(`Please use the ${user.role} signup page instead`);
      }

      // Log the user in via AuthContext
      // Assuming the backend response for google login includes token and user
      // The authService.loginWithGoogle already handles storing the token and user in localStorage
      // We just need to update the context state. The login function in AuthContext might need adjustment
      // to accept user object and token directly if it currently expects email/password.
      // Based on previous verification fix, our login context should handle this.
      // No explicit login context call needed here as authService.loginWithGoogle already updates localStorage
      // and the AuthContext useEffect should pick it up.

      // Redirect based on user type after successful Google signup/login
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "agent") {
        navigate("/agent");
      } else {
        navigate("/customer");
      }

    } catch (error) {
      console.error("Google signup failed:", error);
      setErrors({ ...errors, submit: typeof error === 'string' ? error : "Google signup failed" });
    } finally {
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

  // Helper function to get the correct article "a" or "an"
  const getArticle = (role) => {
    const lowerRole = role.toLowerCase();
    if (lowerRole === 'admin' || lowerRole === 'agent') {
      return 'an';
    } else {
      return 'a';
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

        <div className="inline-block px-4 py-1 mb-2 text-sm font-medium text-pink-700 bg-pink-100 rounded-full">
          {getUserTypeTitle()} Signup
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">Join the Jellycat Family!</h2>
        <p className="text-gray-600 mb-6">Create your {getUserTypeTitle().toLowerCase()} account to get started 🎀</p>

        {errors.submit && (
          <div className={`mb-4 p-3 rounded-lg ${errors.submit.includes('Registration successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>
        </div>

        {/* Google Sign-In Button */}
        <div className="mt-4 flex justify-center w-full">
          <GoogleLogin
            onSuccess={credentialResponse => {
              console.log(credentialResponse);
              // Handle successful Google signup response here
              // You'll need to send credentialResponse.credential (the ID token) to your backend
              handleGoogleAuthSuccess(credentialResponse);
            }}
            onError={() => {
              console.log('Signup Failed');
              // Handle Google signup error here
            }}
          />
        </div>

        {/* New or separator */}
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>
        </div>

        <div className="mt-5 text-sm">
          Already have an account?
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
            Login
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <a href={getRoleChangeLink()} className="text-gray-500 text-sm">
            Not {getArticle(getUserTypeTitle())} {getUserTypeTitle().toLowerCase()}? Change role
          </a>
          <Link to="/" className="text-gray-500 text-sm mt-2 flex items-center justify-center">
            <FaHome className="mr-1" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;