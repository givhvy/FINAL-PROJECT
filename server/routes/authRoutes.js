const express = require('express');
const router = express.Router();

// Import các hàm từ controller
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');

// --- ĐỊNH NGHĨA CÁC ROUTE ---

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// NEW: POST /api/auth/forgot-password (Frontend gọi hàm này)
router.post('/forgot-password', forgotPassword);

// NEW: POST /api/auth/reset-password
router.post('/reset-password', resetPassword);


// Xuất router để server.js có thể sử dụng
module.exports = router;