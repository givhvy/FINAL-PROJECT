// ============================================================================
// userRoutes.js - ROUTES cho /api/users 👥
// ============================================================================
// 🎯 MỤC ĐÍCH: File này như một "BẢN ĐỒ" chỉ đường cho users
//
// 🔍 GIẢI THÍCH ĐƠN GIẢN (cho trẻ 5 tuổi):
// - Tưởng tượng bạn vào một cửa hàng lớn
// - Bạn muốn tìm đồ chơi → phải đi hành lang A
// - Bạn muốn tìm sách → phải đi hành lang B
// → File này giống như BẢN ĐỒ của cửa hàng, chỉ đường!
//
// 8 endpoints: CRUD users + updateUserRole + getUserProgressDetails + verifyStudent

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// SỬA LẠI: Các đường dẫn bây giờ là tương đối so với '/api/users'
router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.put('/:id/role', userController.updateUserRole);
router.delete('/:id', userController.deleteUser);
// NEW: GET /api/users/:id/progress -> Lấy tiến trình học tập chi tiết
router.get('/:id/progress', userController.getUserProgressDetails);
// NEW: POST /api/users/verify-student -> Xác thực student email
router.post('/verify-student', userController.verifyStudent);

module.exports = router;

// ============================================================================
// TÓM TẮT: Các đường đi (routes) cho quản lý người dùng, Checkpoint All Routes are finished
// ============================================================================