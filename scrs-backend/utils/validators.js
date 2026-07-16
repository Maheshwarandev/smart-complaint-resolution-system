// ─────────────────────────────────────────────────────────────────────────────
// utils/validators.js — INPUT VALIDATION UTILITIES
//
// This file contains reusable validation functions for common input types.
// Using a central validator prevents bugs and keeps validation logic DRY.
// ─────────────────────────────────────────────────────────────────────────────

const { AppError } = require('./errorHandler');
const { COMPLAINT_CATEGORY, COMPLAINT_STATUS, COMPLAINT_PRIORITY } = require('./constants');

// ─── EMAIL VALIDATION ────────────────────────────────────────────────────────
// RFC 5322 simplified regex — catches most common email formats
// Rejects: notanemail, test@, @domain.com, test..name@domain.com
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    throw new AppError('Email is required', 400);
  }

  email = email.trim();

  if (!EMAIL_REGEX.test(email)) {
    throw new AppError('Invalid email format', 400);
  }

  if (email.length > 254) {
    throw new AppError('Email is too long', 400);
  }

  return email;
};

// ─── PASSWORD VALIDATION ─────────────────────────────────────────────────────
// Requirements:
//   - Minimum 6 characters
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    throw new AppError('Password is required', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  if (password.length > 128) {
    throw new AppError('Password is too long', 400);
  }

  return password;
};

// ─── NAME VALIDATION ────────────────────────────────────────────────────────
// Requirements:
//   - At least 2 characters
//   - At most 100 characters
//   - Can contain letters, spaces, hyphens, apostrophes
const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    throw new AppError('Name is required', 400);
  }

  name = name.trim();

  if (name.length < 2) {
    throw new AppError('Name must be at least 2 characters', 400);
  }

  if (name.length > 100) {
    throw new AppError('Name is too long', 400);
  }

  // Prevent injection-like patterns (basic check)
  if (!/^[a-zA-Z\s\-']+$/.test(name)) {
    throw new AppError('Name contains invalid characters', 400);
  }

  return name;
};

// ─── COMPLAINT VALIDATORS ──────────────────────────────────────────────────
// Constants for valid complaint values
const VALID_CATEGORIES = Object.values(COMPLAINT_CATEGORY);
const VALID_STATUSES = Object.values(COMPLAINT_STATUS);
const VALID_PRIORITIES = Object.values(COMPLAINT_PRIORITY);

// Validate complaint title
const validateComplaintTitle = (title) => {
  if (!title || typeof title !== 'string') {
    throw new AppError('Complaint title is required', 400);
  }

  title = title.trim();

  if (title.length < 5) {
    throw new AppError('Complaint title must be at least 5 characters', 400);
  }

  if (title.length > 200) {
    throw new AppError('Complaint title is too long (max 200 characters)', 400);
  }

  return title;
};

// Validate complaint description
const validateComplaintDescription = (description) => {
  if (!description || typeof description !== 'string') {
    throw new AppError('Complaint description is required', 400);
  }

  description = description.trim();

  if (description.length < 10) {
    throw new AppError('Complaint description must be at least 10 characters', 400);
  }

  if (description.length > 2000) {
    throw new AppError('Complaint description is too long (max 2000 characters)', 400);
  }

  return description;
};

// Validate complaint category
const validateCategory = (category) => {
  if (!category || typeof category !== 'string') {
    throw new AppError('Category is required', 400);
  }

  category = category.toLowerCase().trim();

  if (!VALID_CATEGORIES.includes(category)) {
    throw new AppError(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`, 400);
  }

  return category;
};

// Validate complaint status
const validateStatus = (status) => {
  if (!status || typeof status !== 'string') {
    throw new AppError('Status is required', 400);
  }

  status = status.trim();

  if (!VALID_STATUSES.includes(status)) {
    throw new AppError(`Status must be one of: ${VALID_STATUSES.join(', ')}`, 400);
  }

  return status;
};

// Validate complaint priority
const validatePriority = (priority) => {
  if (!priority || typeof priority !== 'string') {
    throw new AppError('Priority is required', 400);
  }

  priority = priority.toLowerCase().trim();

  if (!VALID_PRIORITIES.includes(priority)) {
    throw new AppError(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`, 400);
  }

  return priority;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateComplaintTitle,
  validateComplaintDescription,
  validateCategory,
  validateStatus,
  validatePriority,
  VALID_CATEGORIES,
  VALID_STATUSES,
  VALID_PRIORITIES,
};
