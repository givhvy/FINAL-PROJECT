const express = require('express');
const router = express.Router();

// Import các hàm từ controller mà chúng ta đã sửa
const { register, login } = require('../controllers/authController');

// --- ĐỊNH NGHĨA CÁC ROUTE ---

// Khi có yêu cầu POST đến /api/auth/register
// Nó sẽ được chuyển đến hàm 'register' trong authController
router.post('/register', register);

// Khi có yêu cầu POST đến /api/auth/login
// Nó sẽ được chuyển đến hàm 'login' trong authController
router.post('/login', login);


// Xuất router để server.js có thể sử dụng
module.exports = router;