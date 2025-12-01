const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// SỬA LẠI: Bỏ '/api/orders' khỏi các đường dẫn
router.get('/', orderController.getOrders);
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrderById);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

module.exports = router; // cho server.js xài