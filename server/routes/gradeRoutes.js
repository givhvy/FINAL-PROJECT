const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');

router.get('/api/grades', gradeController.getGrades);
router.post('/api/grades', gradeController.createGrade);
router.get('/api/grades/:id', gradeController.getGradeById);
router.put('/api/grades/:id', gradeController.updateGrade);
router.delete('/api/grades/:id', gradeController.deleteGrade);

module.exports = router; 