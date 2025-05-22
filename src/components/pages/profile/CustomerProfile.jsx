import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaSave, FaSpinner, FaLock, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { getUserProfile, updateUserProfile, changePassword } from '../../../services/userService';
import { Link } from 'react-router-dom';

const CustomerProfile = () => {
  const { user, updateUserData } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userData = await getUserProfile();
        if (userData) {
          setProfileData({
            name: userData.name || user?.name || '',
            email: userData.email || user?.email || '',
            phone: userData.phone || user?.phone || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfileData({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || ''
        });
        setMessage({ type: 'error', text: 'Failed to load profile from server, using local data' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const updatedData = await updateUserProfile(profileData);
      
      if (updatedData && updateUserData) {
        updateUserData(profileData);
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update profile' 
      });
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    try {
      setChangingPassword(true);
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        setPasswordMessage({ type: '', text: '' });
        setShowPasswordModal(false);
      }, 3000);
    } catch (error) {
      setPasswordMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to change password' 
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-pink-500 text-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-gray-50 rounded-lg mt-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <Link to="/customer" className="text-pink-500 hover:text-pink-700">
          Back to Dashboard
        </Link>
      </div>

      {message.text && (
        <div className={`mb-6 p-3 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleProfileSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleInputChange}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-3 px-4 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <FaUser className="text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-3 px-4 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <FaEnvelope className="text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <input
              type="tel"
              name="phone"
              value={profileData.phone}
              onChange={handleInputChange}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-3 px-4 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <FaPhone className="text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="text-pink-500 hover:text-pink-700 flex items-center"
          >
            <FaLock className="mr-2" />
            Change Password
          </button>
          
          <button
            type="submit"
            disabled={updating}
            className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {updating ? (
              <>
                <FaSpinner className="animate-spin mr-2 inline" />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-2 inline" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            {passwordMessage.text && (
              <div className={`mb-4 p-3 rounded ${
                passwordMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {passwordMessage.text}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {changingPassword ? (
                    <>
                      <FaSpinner className="animate-spin mr-2 inline" />
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile; 