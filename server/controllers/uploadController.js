const cloudinary = require('../config/cloudinary');

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