const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Đã có các route CRUD cơ bản...
router.get('/', paymentController.getPayments);
router.post('/', paymentController.createPayment);
router.get('/:id', paymentController.getPaymentById);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

// NEW: POST /api/payments/create-checkout-session (Để tích hợp Stripe)
router.post('/create-checkout-session', paymentController.createCheckoutSession);

// NEW: POST /api/payments/verify-and-create-order (Verify Stripe payment and create order)
router.post('/verify-and-create-order', paymentController.verifyPaymentAndCreateOrder);

module.exports = router; // cho server.js xài
