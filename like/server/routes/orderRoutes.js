// ============================================================================
// orderRoutes.js - ROUTES cho /api/orders 🛒
// ============================================================================
// 🎯 MỤC ĐÍCH: Quản lý đơn hàng (khi mua khóa học)
//
// 🔍 GIẢI THÍCH ĐƠN GIẢN (cho trẻ 5 tuổi):
// - Khi bạn mua đồ chơi ở cửa hàng → cô bán hàng ghi ĐƠN HÀNG
// - Đơn hàng ghi: mua gì, giá bao nhiêu, ai mua
// → File này giống như SỔ GHI ĐƠN HÀNG!
//
// 5 endpoints: CRUD orders

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// SỬA LẠI: Bỏ '/api/orders' khỏi các đường dẫn
router.get('/', orderController.getOrders);
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrderById);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;

// ============================================================================
// TÓM TẮT: Các đường đi (routes) cho quản lý đơn hàng mua khóa học
// ============================================================================