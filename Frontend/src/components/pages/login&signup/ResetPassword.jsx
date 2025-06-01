import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaLock, FaArrowLeft } from 'react-icons/fa'; // Using FaLock for password icon
import InputField from '../../common/InputField'; // Adjust path as needed
import Button from '../../common/Button'; // Adjust path as needed
import logo from '../../../assets/logo.jpg'; // Adjust path as needed
import authService from '../../../services/api/authService'; // Import authService

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams(); // Get the token from the URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    // Basic validation
    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      // Call backend API to reset password
      console.log(`Attempting to reset password with token: ${token}`);
      const response = await authService.resetPassword(token, password);
      setMessage(response.message || 'Password reset successfully. You can now log in.');

      // Optionally redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000); // Redirect after 3 seconds

    } catch (err) {
      console.error('Reset password error:', err);
      // Assuming the error object from authService contains the error message
      setError(err || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // You might want to add a check here if the token is missing initially,
  // although the backend will validate it too.
  if (!token) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-white to-pink-100 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center relative z-10">
                <h2 className="text-3xl font-bold text-red-600 mb-4">Invalid Link</h2>
                <p className="text-gray-600 mb-6">The password reset link is missing or invalid.</p>
                 <Link to="/forgot-password" className="text-gray-500 flex items-center justify-center hover:text-gray-700">
                    <FaArrowLeft className="mr-1" /> Request a new reset link
                </Link>
            </div>
        </div>
      );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-white to-pink-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center relative z-10 hover:shadow-pink-300 transition-shadow duration-300">
        <div className="w-25 h-25 mx-auto -mt-14 mb-4 rounded-full p-0.5 bg-gradient-to-r from-yellow-500 via-red-500 to-purple-500 shadow-md">
          <div className="w-full h-full rounded-full overflow-hidden bg-white">
            <img src={logo} alt="Avatar" className="object-cover w-full h-full rounded-full" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">Reset Your Password</h2>
        <p className="text-gray-600 mb-6">Enter your new password below.</p>

        {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{message}</div>}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<FaLock />}
            disabled={isLoading || !!message}
          />
           <InputField
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<FaLock />}
            disabled={isLoading || !!message}
          />

          <Button variant='bigSubmit' disabled={isLoading || !!message}>
            {isLoading ? "Resetting Password..." : "Reset Password"}
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

export default ResetPassword; 