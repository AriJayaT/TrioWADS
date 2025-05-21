import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../../../services/api/authService';
import { useAuth } from '../../../context/AuthContext';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await authService.verifyEmail(token);
        setStatus('success');
        // Log the user in automatically
        login(response.token, response.user);
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setError(error.response?.data?.error || 'Failed to verify email. Please try again.');
      }
    };

    verify();
  }, [token, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Verifying Your Email
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Email Verified!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Your email has been successfully verified. You will be redirected to the home page shortly.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Verification Failed
              </h2>
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
              <div className="mt-4">
                <button
                  onClick={() => navigate('/signup')}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  Return to Sign Up
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 