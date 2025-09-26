const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// SỬA LẠI: Bỏ '/api/payments' khỏi các đường dẫn
router.get('/', paymentController.getPayments);
router.post('/', paymentController.createPayment);
router.get('/:id', paymentController.getPaymentById);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

module.exports = router;