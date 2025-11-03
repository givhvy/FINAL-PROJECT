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