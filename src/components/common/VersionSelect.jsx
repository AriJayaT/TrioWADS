// src/components/common/VersionSelect.jsx (Galih added this file)
import React from 'react';
import { useNavigate } from 'react-router-dom';

const VersionSelect = () => {
  const navigate = useNavigate();

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
          Please select how you'd like to sign in <span style={{ color: '#f472b6' }}>🌸</span>
        </div>

        {/* Selection Cards */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '32px',
          flexWrap: 'wrap',
        }}>
          {/* Customer */}
          <div
            onClick={() => navigate('/login')}
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
              backgroundColor: '#ddd',
              margin: '0 auto 16px auto',
            }}></div>
            <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
              Customer
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              Sign in for accessing tickets/customer support
            </div>
            <div style={{ fontSize: '14px', color: '#f472b6', fontWeight: '500' }}>
              Click to continue →
            </div>
          </div>

          {/* Agent/Admin */}
          <div
            onClick={() => navigate('/admin/login')}
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
              backgroundColor: '#ddd',
              margin: '0 auto 16px auto',
            }}></div>
            <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
              Agent/Admin
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              Access administrative tools and customer support
            </div>
            <div style={{ fontSize: '14px', color: '#f472b6', fontWeight: '500' }}>
              Click to continue →
            </div>
          </div>
        </div>

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