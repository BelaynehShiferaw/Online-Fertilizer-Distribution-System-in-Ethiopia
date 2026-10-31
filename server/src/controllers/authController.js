const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const { signToken, getCookieOptions } = require('../config/jwt');
const { sendEmail } = require('../config/email');
const AuditService = require('../services/auditService');

// @desc Register farmer account (public self-registration)
// @route POST /api/v1/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, preferredLanguage, region, zone, woreda, kebele, village } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Strict security rule: Public self-registration ALWAYS creates a 'farmer' account
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role: 'farmer',
      preferredLanguage: preferredLanguage || 'en',
      status: 'active',
    });

    // Generate unique Farmer ID, e.g. ETH-FARM-9382
    const farmerId = `ETH-FARM-${Math.floor(1000 + Math.random() * 9000)}`;
    const farmerProfile = await FarmerProfile.create({
      user: user._id,
      farmerId,
      region: region || 'Oromia',
      zone: zone || 'East Shewa',
      woreda: woreda || 'Ada\'a',
      kebele: kebele || 'Denkaka',
      village: village || '',
    });

    const token = signToken({ id: user._id, role: user.role });
    res.cookie('token', token, getCookieOptions());

    AuditService.log({
      actor: user._id,
      actorName: user.name,
      role: user.role,
      action: 'FARMER_REGISTERED',
      entityType: 'User',
      entityId: user._id,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Farmer account registered successfully.',
      token,
      user,
      farmerProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Login user
// @route POST /api/v1/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Your account is suspended. Please contact the cooperative manager.' });
    }

    const token = signToken({ id: user._id, role: user.role });
    res.cookie('token', token, getCookieOptions());

    let farmerProfile = null;
    if (user.role === 'farmer') {
      farmerProfile = await FarmerProfile.findOne({ user: user._id });
    }

    AuditService.log({
      actor: user._id,
      actorName: user.name,
      role: user.role,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user._id,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user,
      farmerProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Logout user
// @route POST /api/v1/auth/logout
const logout = async (req, res) => {
  res.cookie('token', 'none', {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully.',
  });
};

// @desc Get current authenticated user
// @route GET /api/v1/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let farmerProfile = null;
    if (user.role === 'farmer') {
      farmerProfile = await FarmerProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      farmerProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Forgot password
// @route POST /api/v1/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Security requirement: Never reveal whether an email address exists
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, password reset instructions have been dispatched.',
      });
    }

    // Generate single-use reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const message = `You requested a password reset for your OFDMS account. Click the link below to set a new password:\n\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, please ignore this email.`;

    await sendEmail({
      to: user.email,
      subject: 'OFDMS Password Recovery / የይለፍ ቃል መቀየሪያ',
      text: message,
    });

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, password reset instructions have been dispatched.',
      // For developer verification if email not configured:
      devToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Reset password with token
// @route POST /api/v1/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide token and new password.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Change current authenticated user's password
// @route POST /api/v1/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide your current password and a new password.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'Your new password must be different from the current password.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      role: req.user.role,
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: user._id,
      ipAddress: req.ip,
      details: { changed: true },
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
};
