const express = require('express');
const { subscribeToNewsletter } = require('../controllers/marketingController');
const router = express.Router();

// POST /api/marketing/subscribe
router.post('/subscribe', subscribeToNewsletter);

module.exports = router;