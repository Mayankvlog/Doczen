const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY
  });
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    path: '/api/auth'
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/api/auth'
  });
};

const userResponse = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  storageUsed: user.storageUsed,
  storageLimit: user.storageLimit,
  dailyFileCount: user.dailyFileCount,
  dailyLimit: user.dailyLimit,
  token
});

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const refreshToken = generateRefreshToken();
    const user = await User.create({
      name, email, password: hashedPassword, refreshToken
    });
    const token = generateAccessToken(user._id);
    setRefreshCookie(res, refreshToken);
    res.status(201).json(userResponse(user, token));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Reset dailyFileCount to 0 and update lastFileDate
    user.dailyFileCount = 0;
    user.lastFileDate = new Date();
    // Update dailyLimit to 1000 if it has the old value
    if (user.dailyLimit !== 1000) {
      user.dailyLimit = 1000;
    }
    const refreshToken = generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    const token = generateAccessToken(user._id);
    setRefreshCookie(res, refreshToken);
    res.json(userResponse(user, token));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const tokenFromCookie = req.cookies?.refreshToken;
    if (!tokenFromCookie) {
      return res.status(401).json({ message: 'No refresh token' });
    }
    const user = await User.findOne({ refreshToken: tokenFromCookie });
    if (!user) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    const newRefreshToken = generateRefreshToken();
    user.refreshToken = newRefreshToken;
    await user.save();
    const accessToken = generateAccessToken(user._id);
    setRefreshCookie(res, newRefreshToken);
    res.json({ ...userResponse(user, accessToken), message: 'Token refreshed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const tokenFromCookie = req.cookies?.refreshToken;
    if (tokenFromCookie) {
      await User.findOneAndUpdate({ refreshToken: tokenFromCookie }, { refreshToken: null });
    }
    clearRefreshCookie(res);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Reset dailyFileCount to 0 and update lastFileDate
    user.dailyFileCount = 0;
    user.lastFileDate = new Date();
    // Update dailyLimit to 1000 if it has the old value
    if (user.dailyLimit !== 1000) {
      user.dailyLimit = 1000;
    }
    await user.save();
    res.json({
      _id: user._id, name: user.name, email: user.email,
      storageUsed: user.storageUsed, storageLimit: user.storageLimit,
      dailyFileCount: user.dailyFileCount, dailyLimit: user.dailyLimit,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (name) user.name = name;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.checkDailyLimit = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return { allowed: false, reason: 'User not found' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Reset dailyFileCount to 0 and update lastFileDate
  user.dailyFileCount = 0;
  user.lastFileDate = new Date();
  // Update dailyLimit to 1000 if it has the old value
  if (user.dailyLimit !== 1000) {
    user.dailyLimit = 1000;
  }
  await user.save();
  if (user.dailyFileCount >= user.dailyLimit) {
    return { allowed: false, reason: 'Daily limit reached' };
  }
  return { allowed: true, user };
};

exports.incrementFileCount = async (userId) => {
  await User.findByIdAndUpdate(userId, { $inc: { dailyFileCount: 1 } });
};
