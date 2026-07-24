// ─────────────────────────────────────────────────────────────────────────────
// controllers/authController.js — AUTHENTICATION LOGIC
//
// Controllers contain the actual business logic for each route.
// When a request reaches a route, the route calls the matching controller.
//
// This file handles:
//   register → create a new user account
//   login    → verify credentials and return a JWT token
//   getMe    → return the currently logged-in user's data
// ─────────────────────────────────────────────────────────────────────────────

// jsonwebtoken is used to create JWT tokens
// A JWT (JSON Web Token) is a compact string that proves the user is logged in.
// It is sent back to the client after register/login, and the client
// sends it back in the Authorization header on future requests.
const jwt = require('jsonwebtoken');

// Import the User model to interact with the users collection in MongoDB
const User = require('../models/User');

// AppError is our custom error class — throws errors with an HTTP status code
const { AppError } = require('../utils/errorHandler');

// Import validators for email, password, and name validation
const { validateEmail, validatePassword, validateName } = require('../utils/validators');

// Import system constants
const { ROLES } = require('../utils/constants');


// ─── HELPER: generateToken ────────────────────────────────────────────────────
// Creates and returns a JWT token for a given user ID.
//
// jwt.sign() takes 3 arguments:
//   1. payload  — data to put inside the token ({ id })
//   2. secret   — a private key used to sign the token (from .env)
//   3. options  — settings like when the token expires
//
// The token expires in 30 days by default (from JWT_EXPIRES_IN in .env).
// After expiry, the user will need to log in again.
const generateToken = (id) => {
  return jwt.sign(
    { id },                                          // payload: store user ID
    process.env.JWT_SECRET,                          // secret key from .env
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' } // expiry setting
  );
};


// ─── register CONTROLLER ──────────────────────────────────────────────────────
// Handles: POST /api/auth/register
//
// What it does step by step:
//   1. Validate name, email, and password
//   2. Check if a user with that email already exists
//   3. If yes → reject with 400 error
//   4. If no  → create the new user (password gets hashed by the pre-save hook)
//   5. Return 201 response with the token and user data
const register = async (req, res) => {
  // Destructure the fields we need from req.body
  // req.body is the JSON object the client sent in the request
  let { name, email, password } = req.body;

  // Validate inputs
  // These functions throw AppError if validation fails
  name = validateName(name);
  email = validateEmail(email);
  password = validatePassword(password);

  // Check if a user with this email already exists in the database
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // throw AppError creates an error that flows to the global error handler
    // 400 = Bad Request (the client sent invalid data)
    throw new AppError('User already exists', 400);
  }

  // User.create() saves a new user to MongoDB.
  // The pre-save hook in User.js automatically hashes the password before saving.
  const user = await User.create({ name, email, password });

  // Send a 201 (Created) response back to the client.
  // We return the token so the user is "logged in" immediately after registering.
  res.status(201).json({
    success: true,
    token: generateToken(user._id), // create a token using the new user's ID
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};


// ─── login CONTROLLER ─────────────────────────────────────────────────────────
// Handles: POST /api/auth/login
//
// What it does step by step:
//   1. Validate email and password format
//   2. Find the user by email (with password included — it's hidden by default)
//   3. If user not found → reject with 401
//   4. Compare the typed password with the stored hash
//   5. If passwords don't match → reject with 401
//   6. If user role is "agent" → validate the security code
//   7. Return 200 response with the token
const login = async (req, res) => {
  let { email, password, agentSecurityCode } = req.body;

  // Validate email and password format
  email = validateEmail(email);
  password = validatePassword(password);

  // Find the user by email.
  // .select('+password') is needed because password has select: false in the schema.
  // .select('+agentSecurityCode') includes the hidden security code field for agents
  const user = await User.findOne({ email }).select('+password +agentSecurityCode');

  // If no user was found with that email, reject.
  // We say "Invalid credentials" (not "email not found") for security —
  // we don't want to tell attackers which emails exist in our system.
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // user.comparePassword() is defined in User.js.
  // It uses bcrypt to compare the plain text password with the stored hash.
  // Returns true if they match, false if they don't.
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401); // wrong password
  }

  // ─── AGENT SECURITY CODE VALIDATION ───────────────────────────────────────
  // If the user is an agent, they must also provide a valid security code
  if (user.role === ROLES.AGENT) {
    if (!agentSecurityCode) {
      throw new AppError('Security code required for agents', 401);
    }
    if (user.agentSecurityCode !== agentSecurityCode) {
      throw new AppError('Invalid security code', 401);
    }
  }

  // Credentials are correct — send back the token
  // 200 = OK (successful request)
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


// ─── getMe CONTROLLER ─────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

const cloudinary = require('../config/cloudinary');

// ─── updateProfile CONTROLLER ────────────────────────────────────────────────
// Handles: PUT /api/auth/profile
// Allows logged-in users to update name, password, or upload a new avatar photo.
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

  // Handle avatar upload if a file was attached
  if (req.file) {
    try {
      const uploadToCloudinary = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'scrs_avatars' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          uploadStream.end(fileBuffer);
        });
      };

      const result = await uploadToCloudinary(req.file.buffer);
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


// Export the controller functions so authRoutes.js can import them
module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
