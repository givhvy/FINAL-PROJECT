// ============================================================================
// gradeRoutes.js - ROUTES cho /api/grades 📝
// ============================================================================
// 🎯 MỤC ĐÍCH: Quản lý điểm số quiz (giống bảng điểm kiểm tra ở trường)
//
// 🔍 GIẢI THÍCH ĐƠN GIẢN (cho trẻ 5 tuổi):
// - Khi bạn làm bài kiểm tra xong → cô giáo chấm điểm
// - Điểm số được ghi vào SỔ ĐIỂM
// → File này giống như sổ điểm bài kiểm tra!
//
// 5 endpoints: CRUD grades

const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');

router.get('/', gradeController.getGrades);
router.post('/', gradeController.createGrade);
router.get('/:id', gradeController.getGradeById);
router.put('/:id', gradeController.updateGrade);
router.delete('/:id', gradeController.deleteGrade);

module.exports = router;

// ============================================================================
// TÓM TẮT: Các đường đi (routes) cho quản lý điểm quiz
// ============================================================================