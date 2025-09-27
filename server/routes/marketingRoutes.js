const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketingController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/subscribe', marketingController.subscribeToNewsletter);
router.get('/subscription-status', authMiddleware, marketingController.getSubscriptionStatus);

module.exports = router;