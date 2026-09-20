const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'docuvault_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, avatar, role, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const assignedRole = role || 'Staff';
    // Admin accounts are automatically approved; others are pending
    const initialStatus = assignedRole.toLowerCase() === 'admin' ? 'active' : 'pending';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      avatar: avatar || undefined,
      role: assignedRole,
      department: department || 'General',
      status: initialStatus,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        status: user.status,
        documentsCount: user.documentsCount,
      },
      token,
      message: initialStatus === 'pending'
        ? 'Account registered successfully. Awaiting administrator approval.'
        : 'Account created successfully.',
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with this email' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check approval status
    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending administrator approval. Please contact an admin.',
        user: {
          name: user.name,
          email: user.email,
          status: user.status,
        },
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your account registration was rejected. Please contact an administrator.',
        user: {
          name: user.name,
          email: user.email,
          status: user.status,
        },
      });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        status: user.status,
        documentsCount: user.documentsCount,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

// @desc    Get all users (for admin directory & approvals)
// @route   GET /api/auth/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return res.json({ success: true, users });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// @desc    Approve user account
// @route   PUT /api/auth/users/:email/approve
exports.approveUser = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { status: 'active' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, message: `Account for ${user.name} has been approved`, user });
  } catch (error) {
    console.error('Approve user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to approve account' });
  }
};

// @desc    Reject user account
// @route   PUT /api/auth/users/:email/reject
exports.rejectUser = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { status: 'rejected' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, message: `Account for ${user.name} has been rejected`, user });
  } catch (error) {
    console.error('Reject user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reject account' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/users/:email
exports.deleteUser = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOneAndDelete({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, message: `Account ${email} deleted successfully` });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { email, name, avatar, department, role, newPassword } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (department) user.department = department;
    if (role) user.role = role;
    if (newPassword) user.password = newPassword;

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        status: user.status,
        documentsCount: user.documentsCount,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};
