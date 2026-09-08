const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');
const { validateEmail, validatePassword, validateName } = require('../utils/validators');
const { ROLES } = require('../utils/constants');
const { uploadToCloudinary } = require('../utils/cloudinary');

/** Generate a JWT token for a given user ID */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

/** POST /api/auth/register */
const register = async (req, res) => {
  let { name, email, password } = req.body;

  name = validateName(name);
  email = validateEmail(email);
  password = validatePassword(password);

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User already exists', 400);
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

/** POST /api/auth/login */
const login = async (req, res) => {
  let { email, password, agentSecurityCode } = req.body;

  email = validateEmail(email);
  password = validatePassword(password);

  const user = await User.findOne({ email }).select('+password +agentSecurityCode');

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  if (user.role === ROLES.AGENT) {
    if (!agentSecurityCode) {
      throw new AppError('Security code required for agents', 401);
    }
    if (user.agentSecurityCode !== agentSecurityCode) {
      throw new AppError('Invalid security code', 401);
    }
  }

  res.status(200).json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  });
};

/** GET /api/auth/me */
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

/** PUT /api/auth/profile — update name, password, or avatar */
const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const { name, password } = req.body;

  if (name) {
    user.name = validateName(name);
  }

  if (password && password.trim() !== '') {
    user.password = validatePassword(password);
  }

  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.buffer, 'scrs_avatars');
      user.avatar = result.secure_url;
    } catch (err) {
      throw new AppError(`Avatar upload failed: ${err.message}`, 500);
    }
  }

  await user.save();

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt
    }
  });
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
