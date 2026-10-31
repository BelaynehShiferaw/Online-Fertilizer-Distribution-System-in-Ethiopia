const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AuditService = require('../services/auditService');

// @desc Get all users (Manager only)
// @route GET /api/v1/users
const getUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc Create privileged staff user (Manager only)
// @route POST /api/v1/users
const createUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, preferredLanguage } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields including role.' });
    }

    const allowedRoles = ['manager', 'office_manager', 'agricultural_expert', 'laborer', 'farmer'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role,
      preferredLanguage: preferredLanguage || 'en',
      status: 'active',
    });

    AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      role: req.user.role,
      action: 'PRIVILEGED_USER_CREATED',
      entityType: 'User',
      entityId: newUser._id,
      ipAddress: req.ip,
      details: { createdRole: role, email: newUser.email },
    });

    res.status(201).json({
      success: true,
      message: `User with role '${role}' created successfully.`,
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update user status (Manager only)
// @route PATCH /api/v1/users/:id/status
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.status = status;
    await user.save();

    AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      role: req.user.role,
      action: 'USER_STATUS_UPDATED',
      entityType: 'User',
      entityId: user._id,
      ipAddress: req.ip,
      details: { newStatus: status },
    });

    res.status(200).json({ success: true, message: 'User status updated.', user });
  } catch (error) {
    next(error);
  }
};

// @desc Update current authenticated user profile
// @route PATCH /api/v1/users/me
const updateMe = async (req, res, next) => {
  try {
    const { name, phone, preferredLanguage } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (preferredLanguage && ['en', 'am'].includes(preferredLanguage)) {
      user.preferredLanguage = preferredLanguage;
    }

    await user.save();
    res.status(200).json({ success: true, message: 'Profile updated successfully.', user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUserStatus,
  updateMe,
};
