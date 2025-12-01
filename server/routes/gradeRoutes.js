const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');

router.get('/', gradeController.getGrades);
router.post('/', gradeController.createGrade);
router.get('/:id', gradeController.getGradeById);
router.put('/:id', gradeController.updateGrade);
router.delete('/:id', gradeController.deleteGrade);

module.exports = router; // cho server.js xài