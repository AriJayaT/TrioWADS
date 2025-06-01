import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import InputField from '../../common/InputField'; // Adjust path as needed
import Button from '../../common/Button'; // Adjust path as needed
import logo from '../../../assets/logo.jpg'; // Adjust path as needed
import authService from '../../../services/api/authService'; // Import authService

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    // Basic email validation
    if (!email) {
      setError('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    try {
      // Call backend API to send reset link
      console.log(`Sending password reset link to: ${email}`);
      const response = await authService.forgotPassword(email);
      setMessage(response.message || 'Password reset link sent. Please check your email.');

    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err || 'Failed to send password reset link. Please try again.');
    } finally {
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

        <h2 className="text-3xl font-bold text-gray-800 mb-2">Forgot Your Password?</h2>
        <p className="text-gray-600 mb-6">Enter your email to receive a reset link.</p>

        {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{message}</div>}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<FaEnvelope />}
            disabled={isLoading || !!message}
          />

          <Button variant='bigSubmit' disabled={isLoading || !!message}>
            {isLoading ? "Sending Link..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-100 text-sm">
          <Link to="/login" className="text-gray-500 flex items-center justify-center hover:text-gray-700">
            <FaArrowLeft className="mr-1" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 