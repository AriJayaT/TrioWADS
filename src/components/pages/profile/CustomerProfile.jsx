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
  const [activeTab, setActiveTab] = useState('profile');

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
    <div className="min-h-screen bg-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Customer Profile</h1>
          <div className="px-4 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
            User
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-pink-500 text-2xl" />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="flex border-b">
                <button
                  className={`px-6 py-3 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'text-pink-500 border-b-2 border-pink-500'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => setActiveTab('profile')}
                >
                  Profile Information
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm ${
                    activeTab === 'security'
                      ? 'text-pink-500 border-b-2 border-pink-500'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => setActiveTab('security')}
                >
                  Security
                </button>
                <div className="ml-auto flex items-center">
                  <Link to="/customer" className="text-pink-500 hover:text-pink-700 text-sm font-medium px-6 py-3">
                    Back to Dashboard
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-lg font-medium mb-4">Profile Information</h2>
                    {message.text && (
                      <div className={`mb-4 p-3 rounded ${
                        message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {message.text}
                      </div>
                    )}
                    <form onSubmit={handleProfileSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          </div>
                        </div>
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
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="phone"
                              value={profileData.phone}
                              onChange={handleInputChange}
                              className="block w-full rounded-md border border-gray-300 shadow-sm py-3 px-4 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="mt-6 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded shadow"
                        disabled={updating}
                      >
                        {updating ? <FaSpinner className="animate-spin inline mr-2" /> : <FaSave className="inline mr-2" />}
                        Save Changes
                      </button>
                    </form>
                  </div>
                )}
                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-lg font-medium mb-4">Change Password</h2>
                    {passwordMessage.text && (
                      <div className={`mb-4 p-3 rounded ${
                        passwordMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {passwordMessage.text}
                      </div>
                    )}
                    <form onSubmit={handlePasswordSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              name="currentPassword"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              className="block w-full rounded-md border border-gray-300 shadow-sm py-3 px-4 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              className="block w-full rounded-md border border-gray-300 shadow-sm py-3 px-4 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              className="block w-full rounded-md border border-gray-300 shadow-sm py-3 px-4 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="mt-6 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded shadow"
                        disabled={changingPassword}
                      >
                        {changingPassword ? <FaSpinner className="animate-spin inline mr-2" /> : <FaLock className="inline mr-2" />}
                        Change Password
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile; 