const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB limit (increased)
    }
});

// Configure multer for profile pictures (smaller file size limit)
const profileUpload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit for profile pictures
    },
    fileFilter: (req, file, cb) => {
        // Only accept image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for profile pictures'));
        }
    }
});

// Configure multer for local video upload (no file size limit for local storage)
const localVideoUpload = multer({
    storage: storage,
    limits: {
        fileSize: Infinity // No limit for local storage
    },
    fileFilter: (req, file, cb) => {
        // Only accept video files
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed'));
        }
    }
});

// Upload routes (protected by authentication)
router.post('/image', authMiddleware, upload.single('file'), uploadController.uploadImage);
router.post('/video', authMiddleware, upload.single('file'), uploadController.uploadVideo);
router.post('/video-local', authMiddleware, localVideoUpload.single('file'), uploadController.uploadVideoLocal); // Upload to server disk (no size limit)
router.post('/profile-picture', authMiddleware, profileUpload.single('file'), uploadController.uploadProfilePicture);

module.exports = router;