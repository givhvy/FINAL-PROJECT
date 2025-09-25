const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/api/orders', orderController.getOrders);
router.post('/api/orders', orderController.createOrder);
router.get('/api/orders/:id', orderController.getOrderById);
router.put('/api/orders/:id', orderController.updateOrder);
router.delete('/api/orders/:id', orderController.deleteOrder);

module.exports = router; 