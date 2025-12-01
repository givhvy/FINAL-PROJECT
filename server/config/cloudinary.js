const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // lấy từ .env
    api_key: process.env.CLOUDINARY_API_KEY, // lấy từ .env
    api_secret: process.env.CLOUDINARY_API_SECRET // lấy từ .env
});

module.exports = cloudinary;