const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/api/payments', paymentController.getPayments);
router.post('/api/payments', paymentController.createPayment);
router.get('/api/payments/:id', paymentController.getPaymentById);
router.put('/api/payments/:id', paymentController.updatePayment);
router.delete('/api/payments/:id', paymentController.deletePayment);

module.exports = router; 