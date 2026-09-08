// ─────────────────────────────────────────────────────────────────────────────
// utils/cloudinary.js — Merged Cloudinary config + upload helper
//
// Merged from: config/cloudinary.js (11 lines) + utils/uploadHelper.js (23 lines)
// Both are Cloudinary-only — no reason to split config from the one function
// that uses it.
// ─────────────────────────────────────────────────────────────────────────────

const cloudinary = require('cloudinary').v2;

// Configure from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} fileBuffer - The file data buffer
 * @param {string} folder - Cloudinary folder name (e.g., 'scrs_avatars')
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadToCloudinary = (fileBuffer, folder = 'scrs_uploads') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

module.exports = { cloudinary, uploadToCloudinary };
