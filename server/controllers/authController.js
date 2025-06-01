import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Debug logging
console.log('Environment Variables (authController initial load):', {
  NODE_ENV: process.env.NODE_ENV,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'Set' : 'Not Set',
  EMAIL_PASSWORD_LENGTH: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0
});

// Password validation utility
function validatePassword(password) {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain a number";
  if (!/[\W_]/.test(password)) return "Password must contain a special character";
  return null;
}

/**
 * @route POST /api/auth/google
 * @desc Authenticate user with Google
 * @access Public
 */
export const googleLogin = async (req, res) => {
  const { idToken } = req.body;
  const { role } = req.body;

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

    console.log(`Attempting to find user with email: ${email}`);
    let user = await User.findOne({ email });

    if (user) {
      // User exists, log them in
      console.log(`User ${email} found via Google login.`);
    } else {
      // User does not exist, create a new one
      console.log(`User ${email} not found, creating new user via Google login.`);
      console.log(`Creating user with data: `, {
        name: name,
        email: email,
        profileImage: picture,
        isVerified: true, // Google verified emails
        role: role || 'customer',
        googleId: sub,
        authMethod: 'google' // Set auth method to google
      });
      user = await User.create({
        name: name,
        email: email,
        profileImage: picture,
        isVerified: true, // Google verified emails
        role: role || 'customer',
        googleId: sub,
        authMethod: 'google' // Set auth method to google
      });
      console.log(`New user created with ID: ${user._id}`);
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
   res.status(501).json({ error: 'Email verification code sending is currently disabled.' });
};

/**
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    console.log(`Registration attempt for email: ${email} with role: ${role}`);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`User with email ${email} already exists`);
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Create the user (initially unverified)
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'customer',
      agentType: role === 'agent' ? 'Junior' : undefined,
      isVerified: false, // Mark as unverified
    });

    // Generate verification token and save user
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Create verification URL
    const verifyURL = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Verify Your Email',
      text: `Please verify your email by clicking on the link: ${verifyURL}`,
    };

    // Create transporter here, after environment variables are loaded by index.js
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false // Accept self-signed certificates
      },
      debug: true, // Enable debug output
      logger: true // Enable logger
    });

    // Verify transporter configuration before sending (optional in production, good for debugging)
    transporter.verify(function(error, success) {
      if (error) {
        console.error('SMTP Server Error during sendMail:', error);
        console.error('Error details:', {
          code: error.code,
          command: error.command,
          response: error.response,
          responseCode: error.responseCode,
          stack: error.stack
        });
      } else {
        console.log('SMTP Server is ready to send message (verified during sendMail).');
      }
    });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending verification email:', error);
        // In a real app, you might want to handle this more robustly
      } else {
        console.log('Verification email sent:', info.response);
      }
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification.',
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

/**
 * @route GET /api/auth/verify-email/:token
 * @access Public
 */
export const verifyEmail = async (req, res) => {
  console.log('Attempting to verify email...');
  console.log('Received token:', req.params.token);
  try {
    // Get hashed token
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    console.log('Hashed token:', emailVerificationToken);

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      console.log('User not found or token invalid/expired.');
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    console.log('User found. Verifying...', user.email);

    // Set user to verified and clear token fields
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    console.log('User verified successfully!', user.email);

    // Generate JWT token for immediate login after verification
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
        profileImage: user.profileImage,
        isVerified: user.isVerified,
      },
      message: 'Email verified successfully. You can now log in.'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Server error during email verification' });
  }
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

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({ error: 'Please verify your email address before logging in.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log(`User ${email} logging in with role: ${user.role}`);

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
        profileImage: user.profileImage,
        isVerified: user.isVerified,
      },
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
    // Select the isVerified field
    const user = await User.findById(req.user.id).select('+isVerified');

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
        createdAt: user.createdAt,
        isVerified: user.isVerified, // Include isVerified in the response
      },
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

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      // If email is changed, mark as unverified
      user.email = email;
      user.isVerified = false;
      user.emailVerificationToken = undefined; // Clear old token
      user.emailVerificationExpire = undefined;

      // In a real app, you would send a new verification email here
      // For now, just mark as unverified
       console.log(`Email changed for user ${user._id}, marked as unverified.`);
    } else {
       user.email = email || user.email;
    }

    user.name = name || user.name;
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
        createdAt: user.createdAt,
        isVerified: user.isVerified, // Include isVerified in the response
      },
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

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset email
 * @access Public
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Forgot password attempt for non-existent user: ${email}`);
      return res.status(404).json({ error: 'User not found with that email' });
    }

    // Generate reset token and save user
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetURL = `${req.protocol}://${req.get('host').replace(':5000', ':5173')}/reset-password/${resetToken}`;

    // Setup email data
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      text: `You are receiving this because you (or someone else) has requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetURL}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`,
    };

     // Create transporter here, after environment variables are loaded by index.js
     const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false // Accept self-signed certificates
      },
      debug: true, // Enable debug output
      logger: true // Enable logger
    });

    // Verify transporter configuration before sending (optional in production, good for debugging)
    transporter.verify(function(error, success) {
      if (error) {
        console.error('SMTP Server Error during sendMail (Forgot Password):', error);
        console.error('Error details:', {
          code: error.code,
          command: error.command,
          response: error.response,
          responseCode: error.responseCode,
          stack: error.stack
        });
      } else {
        console.log('SMTP Server is ready to send message (verified during sendMail - Forgot Password).');
      }
    });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending password reset email:', error);
        // In a real app, you might want to handle this more robustly
        // Depending on your requirements, you might still send a 200 response to not leak user existence
        return res.status(500).json({ error: 'Error sending password reset email' });
      } else {
        console.log('Password reset email sent:', info.response);
        res.status(200).json({ success: true, message: 'Password reset email sent' });
      }
    });


  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error during forgot password request' });
  }
};

/**
 * @route PUT /api/auth/reset-password/:resettoken
 * @access Public
 */
export const resetPassword = async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ error: 'Invalid Token' });
  }

  // Validate new password
  const passwordError = validatePassword(req.body.password);
  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token
  });
};

export const logout = (req, res) => {
  res.status(200).json({ success: true, data: {} });
}; 