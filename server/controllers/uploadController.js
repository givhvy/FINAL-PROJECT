const cloudinary = require('../config/cloudinary'); // 
const User = require('../models/User');

// Upload image to Cloudinary
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload to Cloudinary with buffer
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'codemaster/courses',
                    resource_type: 'auto'
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        res.status(200).json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload image: ' + error.message });
    }
};

// Upload video to Cloudinary
exports.uploadVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload video to Cloudinary with buffer
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'codemaster/videos',
                    resource_type: 'video',
                    chunk_size: 6000000 // 6MB chunks for large videos
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        res.status(200).json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        console.error('Video Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload video: ' + error.message });
    }
};

// Upload profile picture to Cloudinary and update user avatarUrl cho student và teacher role
exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.user.id; // From auth middleware (line 23: req.user = { id: userSnap.id, ...})

        // Upload to Cloudinary in profile pictures folder
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'codemaster/profiles',
                    resource_type: 'image',
                    transformation: [
                        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
                        { quality: 'auto', fetch_format: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        // Update user's avatarUrl in database (checkpoint)
        await User.update(userId, { avatarUrl: result.secure_url });

        res.status(200).json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            message: 'Profile picture updated successfully'
        });
    } catch (error) {
        console.error('Profile Picture Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload profile picture: ' + error.message });
    }
};