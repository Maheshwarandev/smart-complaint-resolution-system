// ─────────────────────────────────────────────────────────────────────────────
// middleware/uploadMiddleware.js — FILE UPLOAD HANDLING
//
// This file exports one middleware function (the multer instance):
//
//   upload → processes multipart/form-data for uploading files
//
// Middleware is code that runs between the request arriving and the
// controller function handling it. Here, it intercepts file uploads,
// saves them to the 'uploads/' folder, and validates file types.
// ─────────────────────────────────────────────────────────────────────────────

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('../utils/errorHandler');

// Setup memory storage instead of disk storage for cloud uploads
const storage = multer.memoryStorage();

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new AppError('Only .png, .jpg, .jpeg and .pdf format allowed!', 400), false);
  }
};

// Create multer instance with 5MB limit
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  },
  fileFilter: fileFilter
});

module.exports = upload;
