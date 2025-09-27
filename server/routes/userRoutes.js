const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// SỬA LẠI: Các đường dẫn bây giờ là tương đối so với '/api/users'
router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser)
// NEW: GET /api/users/:id/progress -> Lấy tiến trình học tập chi tiết
router.get('/:id/progress', userController.getUserProgressDetails); ;

module.exports = router;