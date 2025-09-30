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
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Upload routes (protected by authentication)
router.post('/image', authMiddleware, upload.single('file'), uploadController.uploadImage);
router.post('/video', authMiddleware, upload.single('file'), uploadController.uploadVideo);

module.exports = router;