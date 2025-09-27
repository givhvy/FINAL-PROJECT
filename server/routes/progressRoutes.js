const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

router.post('/complete', progressController.markLessonComplete);
router.get('/:userId/:courseId', progressController.getUserProgress);

module.exports = router;