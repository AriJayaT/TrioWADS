import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Remove the map to store pending verifications as we are disabling email verification for now
// const pendingVerifications = new Map();
const pendingVerifications = new Map(); // Keep the map for verifyEmail if needed later, but registration won't use it.

// Remove emailConfigs as we will use a single Mailgun transporter
// const emailConfigs = {
//   gmail: {
//     host: 'smtp.gmail.com',
//     port: 587,
//     secure: false
//   },
//   outlook: {
//     host: 'smtp-mail.outlook.com',
//     port: 587,
//     secure: false
//   },
//   yahoo: {
//     host: 'smtp.mail.yahoo.com',
//     port: 587,
//     secure: false
//   },
//   hotmail: {
//     host: 'smtp-mail.outlook.com',
//     port: 587,
//     secure: false
//   }
// };

// Remove getEmailProvider as we use a single Mailgun sender
// const getEmailProvider = (email) => {
//   const domain = email.split('@')[1].toLowerCase();
//   if (domain.includes('gmail')) return 'gmail';
//   if (domain.includes('outlook') || domain.includes('hotmail')) return 'outlook';
//   if (domain.includes('yahoo')) return 'yahoo';
//   return 'gmail'; // Default to Gmail if unknown
// };

// Configure nodemailer to use Mailgun
const createTransporter = () => {
  console.log('Attempting to create Mailgun transporter with:');
  console.log(`SMTP Server: ${process.env.MAILGUN_SMTP_SERVER}`);
  console.log(`SMTP Port: ${process.env.MAILGUN_SMTP_PORT}`);
  console.log(`SMTP Login: ${process.env.MAILGUN_SMTP_LOGIN}`);
  console.log(`SMTP Password: ${process.env.MAILGUN_SMTP_PASSWORD ? '********' : 'NOT SET'}`); // Log presence, not password itself

  return nodemailer.createTransport({
    host: process.env.MAILGUN_SMTP_SERVER,
    port: process.env.MAILGUN_SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAILGUN_SMTP_LOGIN,
      pass: process.env.MAILGUN_SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false // Use this in development; set to true in production with valid certs
    }
  });
};

/**
 * @route POST /api/auth/google
 * @desc Authenticate user with Google
 * @access Public
 */
export const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: 'Google ID token is required.' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (user) {
      // User exists, log them in
      console.log(`User ${email} found via Google login.`);
    } else {
      // User does not exist, create a new one
      console.log(`User ${email} not found, creating new user via Google login.`);
      // Note: For Google sign-in, we don't have a password. You might want to handle this
      // differently depending on your application's requirements (e.g., disable password login
      // for Google users, or set a random password and force a reset).
      // For simplicity, we'll create the user without a password here.
      user = await User.create({
        name: name,
        email: email,
        profileImage: picture,
        isVerified: true, // Google verified emails
        // Default role for new users via Google login. Adjust if needed.
        role: 'customer',
        googleId: sub, // Store Google user ID
      });
    }

    // Generate JWT token for the user
    const jwtToken = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        agentType: user.agentType,
        profileImage: user.profileImage,
        // Include other relevant user data here
      },
    });

  } catch (error) {
    console.error('Google login backend error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google.' });
  }
};

/**
 * @route POST /api/auth/send-verification
 * @access Public
 */
export const sendVerificationCode = async (req, res) => {
  // This function is currently not used in the signup flow after removing email verification.
  // It can be kept or removed depending on future needs.
  res.status(501).json({ error: 'Email verification code sending is currently disabled.' });
};

/**
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    console.log(`Registration attempt for email: ${email}`);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`User with email ${email} already exists`);
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create the user directly, skipping email verification
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'customer',
      // Set default agentType to Junior if role is agent
      agentType: role === 'agent' ? 'Junior' : undefined,
      isVerified: true // Mark as verified since we are skipping email verification
    });

    // Generate JWT token
    const jwtToken = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        agentType: user.agentType,
        profileImage: user.profileImage,
        // Include phone in the response if needed by the frontend
        phone: user.phone
      },
      message: 'Registration successful!' // Optional success message
    });

  } catch (error) {
    console.error('Registration error:', error);
    // Provide a generic server error message
    res.status(500).json({ error: 'Server error during registration' });
  }
};

/**
 * @route GET /api/auth/verify-email/:token
 * @access Public
 */
export const verifyEmail = async (req, res) => {
  // This function can be kept for potential future use but is not part of the current signup flow.
   res.status(501).json({ error: 'Email verification is currently disabled.' });

//  try {
//    const { token } = req.params;
//
//    // Get pending verification
//    const pendingVerification = pendingVerifications.get(token);
//    if (!pendingVerification || Date.now() > pendingVerification.expires) {
//      return res.status(400).json({ error: 'Invalid or expired verification link' });
//    }
//
//    // Create the user
//    const user = await User.create({
//      name: pendingVerification.name,
//      email: pendingVerification.email,
//      password: pendingVerification.password,
//      phone: pendingVerification.phone,
//      role: pendingVerification.role,
//      isVerified: true
//    });
//
//    // Remove the pending verification
//    pendingVerifications.delete(token);
//
//    // Generate JWT token
//    const jwtToken = user.getSignedJwtToken();
//
//    res.status(201).json({
//      success: true,
//      token: jwtToken,
//      user: {
//        id: user._id,
//        name: user.name,
//        email: user.email,
//        role: user.role,
//        profileImage: user.profileImage
//      }
//    });
//  } catch (error) {
//    console.error('Email verification error:', error);
//    res.status(500).json({ error: 'Server error during email verification' });
//  }
};

/**
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log(`User with email ${email} not found`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        agentType: user.agentType,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

/**
 * @route GET /api/auth/me
 * @access Private
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        agentType: user.agentType,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * @route PUT /api/auth/profile
 * @access Private
 */
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, email, phone, profileImage } = req.body;

    // Check if email is being updated and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.profileImage = profileImage || user.profileImage;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        agentType: user.agentType,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * @route PUT /api/auth/password
 * @access Private
 */
export const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Please provide current and new passwords' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 