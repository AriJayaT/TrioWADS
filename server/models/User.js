import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [function() { return this.authMethod === 'local'; }, 'Please provide a phone number'],
    trim: true
  },
  password: {
    type: String,
    required: [function() { return this.authMethod === 'local'; }, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['customer', 'agent', 'admin'],
    default: 'customer'
  },
  agentType: {
    type: String,
    enum: ['Junior', 'Senior'],
    default: 'Junior',
    // This field is only applicable for users with role 'agent'
  },
  profileImage: {
    type: String,
    default: 'default-profile.jpg'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  authMethod: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Virtual property for tickets associated with this user
 * This creates a virtual connection to tickets without storing them in the user document
 */
userSchema.virtual('tickets', {
  ref: 'Ticket', // The model to use
  localField: '_id', // Find tickets where `localField`
  foreignField: 'user', // is equal to `foreignField`
  justOne: false // Multiple tickets per user
});

/**
 * Encrypt password using bcrypt before saving
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it's a local auth method and the password is modified or new
  if (this.authMethod === 'local' && this.isModified('password')) {
    // Hash password with strength of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

/**
 * Check if password matches the hashed password in database
 * @param {string} enteredPassword - The password to check
 * @returns {boolean} - True if password matches
 */
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate and return a JWT token
 * @returns {string} - JWT token
 */
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      role: this.role,
      email: this.email,
      name: this.name
    },
    process.env.JWT_SECRET || 'jellycatsecret',
    { expiresIn: process.env.JWT_EXPIRATION || '7d' }
  );
};

/**
 * Generate email verification token
 * @returns {string} - Raw token
 */
userSchema.methods.generateEmailVerificationToken = function() {
  // Generate a raw token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Hash the token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expire (e.g., 15 minutes)
  this.emailVerificationExpire = Date.now() + 15 * 60 * 1000; 

  return verificationToken; // Return the raw token to be sent in email
};

/**
 * Generate password reset token
 * @returns {string} - Raw token
 */
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (e.g., 1 hour)
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

  return resetToken;
};

/**
 * SwaggerUI annotations
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *         profileImage:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date
 */

const User = mongoose.model('User', userSchema);
export default User; 