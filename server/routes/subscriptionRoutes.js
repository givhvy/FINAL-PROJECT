const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

// GET /api/subscriptions - Lấy tất cả các gói
router.get('/', subscriptionController.getSubscriptionPlans);

// POST /api/subscriptions - Tạo gói mới
router.post('/', subscriptionController.createSubscriptionPlan);

// PUT /api/subscriptions/:id - Cập nhật gói
router.put('/:id', subscriptionController.updateSubscriptionPlan);

// DELETE /api/subscriptions/:id - Xóa gói
router.delete('/:id', subscriptionController.deleteSubscriptionPlan);

module.exports = router;

