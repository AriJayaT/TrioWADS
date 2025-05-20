import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '/src/assets/logo.jpg';

const VersionSelect = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole === 'customer') {
      navigate('/login');
    } else if (selectedRole === 'agent') {
      navigate('/agent/login');
    } else if (selectedRole === 'admin') {
      navigate('/admin/login');
    }
  };

  const handleReset = () => {
    setSelectedRole(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#ffeef8',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      flexDirection: 'column',
      padding: '20px',
    }}>
      {/* Floating Decorations */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '40px',
        width: '120px',
        height: '120px',
        backgroundColor: '#f8b4d8',
        borderRadius: '50%',
        opacity: 0.5,
      }}></div>
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '80px',
        width: '60px',
        height: '60px',
        backgroundColor: '#f8b4d8',
        borderRadius: '50%',
        opacity: 0.4,
      }}></div>
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        fontSize: '24px',
        color: '#f472b6',
      }}>★</div>

      {/* Main Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        maxWidth: '800px',
        width: '100%',
        textAlign: 'center',
        zIndex: 10,
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 20px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid #f8b4d8'
        }}>
          <img src={logo} alt="YipHelp Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        
        <div style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#333',
          marginBottom: '8px',
        }}>
          Welcome to YipHelp
        </div>

        <div style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '32px',
        }}>
          {selectedRole ? 'You selected:' : 'Please select how you\'d like to sign in'} <span style={{ color: '#f472b6' }}>🌸</span>
        </div>

        {selectedRole ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{
              backgroundColor: '#fff0f5',
              borderRadius: '16px',
              padding: '24px',
              width: '260px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
              borderColor: '#f472b6',
              borderWidth: '2px',
              borderStyle: 'solid'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                {selectedRole === 'customer' ? 'Customer' : 
                 selectedRole === 'agent' ? 'Agent' : 'Administrator'}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                {selectedRole === 'customer' ? 'Sign in for accessing tickets/customer support' : 
                 selectedRole === 'agent' ? 'Sign in to manage tickets and support customers' : 
                 'Sign in for administrative tools and customer support'}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={handleReset}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  backgroundColor: '#f1f1f1',
                  border: 'none',
                  color: '#666',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Change Selection
              </button>
              
              <button
                onClick={handleContinue}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  backgroundColor: '#f472b6',
                  border: 'none',
                  color: 'white',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            flexWrap: 'wrap',
          }}>
            {/* Customer */}
            <div
              onClick={() => handleRoleSelect('customer')}
              style={{
                backgroundColor: '#fff0f5',
                borderRadius: '16px',
                padding: '24px',
                width: '260px',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                transition: '0.3s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)'}
            >
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#ffd6e8',
                margin: '0 auto 16px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>👤</div>
              <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                Customer
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                Sign in for accessing tickets/customer support
              </div>
              <div style={{ fontSize: '14px', color: '#f472b6', fontWeight: '500' }}>
                Click to select →
              </div>
            </div>

            {/* Agent */}
            <div
              onClick={() => handleRoleSelect('agent')}
              style={{
                backgroundColor: '#fff0f5',
                borderRadius: '16px',
                padding: '24px',
                width: '260px',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                transition: '0.3s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)'}
            >
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#ffd6e8',
                margin: '0 auto 16px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>🛠️</div>
              <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                Agent
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                Sign in to manage tickets and support customers
              </div>
              <div style={{ fontSize: '14px', color: '#f472b6', fontWeight: '500' }}>
                Click to select →
              </div>
            </div>

            {/* Admin */}
            <div
              onClick={() => handleRoleSelect('admin')}
              style={{
                backgroundColor: '#fff0f5',
                borderRadius: '16px',
                padding: '24px',
                width: '260px',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                transition: '0.3s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)'}
            >
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#ffd6e8',
                margin: '0 auto 16px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>👑</div>
              <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                Administrator
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                Access administrative tools and customer support
              </div>
              <div style={{ fontSize: '14px', color: '#f472b6', fontWeight: '500' }}>
                Click to select →
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          fontSize: '12px',
          color: '#aaa',
          marginTop: '40px',
        }}>
          © 2024 Yiphelp. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default VersionSelect;