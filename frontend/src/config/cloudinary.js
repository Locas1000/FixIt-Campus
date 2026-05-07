// src/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 1. Tell Multer to keep files in memory (RAM) instead of saving to disk
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 2. Helper function to stream the memory buffer directly to Cloudinary
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'fixit-campus-evidence',
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result); // Returns the full Cloudinary response (including secure_url)
            }
        );
        stream.end(buffer);
    });
};

module.exports = { upload, uploadToCloudinary };