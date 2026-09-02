const cloudinary = require('../config/cloudinary');

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

module.exports = { uploadToCloudinary };
