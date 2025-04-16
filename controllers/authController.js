import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendEmail } from '../services/emailService.js';
import { EncryptionService } from '../services/encryption.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    const token = generateToken(user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
};

const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('No user found with that email', 404));
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send reset email
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      text: `Click this link to reset your password: ${resetURL}`
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to email'
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    // Update password
    user.password = EncryptionService.hashPassword(req.body.password);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Create new token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.status(200).json({
      status: 'success',
      token,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Invalid or expired verification token', 400));
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return next(new AppError('Please provide a token', 400));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.status(200).json({
      status: 'success',
      token: newToken
    });
  } catch (error) {
    next(error);
  }
};

const authController = {
  forgotPassword,
  resetPassword,
  verifyEmail
};

export default authController;