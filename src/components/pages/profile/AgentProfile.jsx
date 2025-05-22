import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaSave, FaSpinner, FaIdBadge, FaStar } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { getUserProfile, updateUserProfile, changePassword } from '../../../services/userService';

const AgentProfile = () => {
  const { user, updateUserData } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    category: user?.agentType || 'Junior'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
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
            phone: userData.phone || user?.phone || '',
            category: userData.agentType || user?.agentType || 'Junior'
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // If API call fails, use data from auth context
        setProfileData({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          category: user?.agentType || 'Junior'
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const updatedData = await updateUserProfile(profileData);
      
      // Update auth context with new user data
      if (updatedData && updateUserData) {
        updateUserData(profileData);
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear message after 3 seconds
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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
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
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setPasswordMessage({ type: '', text: '' });
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Profile header */}
        <div className="bg-pink-600 text-white px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Agent Profile</h1>
          <div className="flex items-center text-white text-sm">
            <FaStar className="text-yellow-300 mr-1" />
            <span>Support Agent</span>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-white border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 ${
                activeTab === 'profile' 
                  ? 'border-b-2 border-pink-500 text-pink-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-3 ${
                activeTab === 'security' 
                  ? 'border-b-2 border-pink-500 text-pink-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Security
            </button>
          </nav>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FaSpinner className="animate-spin text-pink-500 text-2xl" />
            </div>
          ) : (
            <>
              {activeTab === 'profile' && (
                <div>
                  {message.text && (
                    <div className={`mb-6 p-3 rounded ${
                      message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {message.text}
                    </div>
                  )}
                  
                  <form onSubmit={handleProfileSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaUser className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="name"
                            value={profileData.name}
                            onChange={handleInputChange}
                            className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaEnvelope className="text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleInputChange}
                            className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaPhone className="text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleInputChange}
                            className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Agent Category
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaIdBadge className="text-gray-400" />
                          </div>
                          <select
                            name="category"
                            value={profileData.category}
                            className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-gray-100 text-gray-700 focus:outline-none"
                            disabled
                          >
                            <option value="Junior">Junior Agent</option>
                            <option value="Senior">Senior Agent</option>
                          </select>
                          <p className="mt-1 text-xs text-gray-500">
                            Only administrators can change your agent category
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        disabled={updating}
                        className="inline-flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                      >
                        {updating ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <FaSave className="mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {activeTab === 'security' && (
                <div>
                  {passwordMessage.text && (
                    <div className={`mb-6 p-3 rounded ${
                      passwordMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {passwordMessage.text}
                    </div>
                  )}
                  
                  <form onSubmit={handlePasswordSubmit} className="max-w-md">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="text-gray-400" />
                          </div>
                          <input
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="text-gray-400" />
                          </div>
                          <input
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                            required
                            minLength={8}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Password must be at least 8 characters
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="text-gray-400" />
                          </div>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={changingPassword}
                          className="inline-flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                        >
                          {changingPassword ? (
                            <>
                              <FaSpinner className="animate-spin mr-2" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <FaLock className="mr-2" />
                              Change Password
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentProfile; 