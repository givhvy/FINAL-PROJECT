const express = require('express');
const router = express.Router();

// Import các hàm từ blog controller
const {
    createBlogPost,
    getBlogPosts,
    getBlogPostBySlug,
    updateBlogPost,
    deleteBlogPost,
    getBlogTags
} = require('../controllers/blogController');

// Import middleware xác thực
const authMiddleware = require('../middleware/authMiddleware');

// --- ĐỊNH NGHĨA CÁC ROUTE CHO /api/blog ---

// GET /api/blog -> Lấy tất cả blog posts (public)
router.get('/', getBlogPosts);

// GET /api/blog/tags -> Lấy các tags phổ biến (public)
router.get('/tags', getBlogTags);

// GET /api/blog/:slug -> Lấy 1 blog post theo slug/ID (public)
router.get('/:slug', getBlogPostBySlug);

// POST /api/blog -> Tạo blog post mới (cần auth, chỉ admin/teacher)
router.post('/', authMiddleware, createBlogPost);

// PUT /api/blog/:id -> Cập nhật blog post (cần auth, chỉ admin/teacher và author)
router.put('/:id', authMiddleware, updateBlogPost);

// DELETE /api/blog/:id -> Xóa blog post (cần auth, chỉ admin/teacher và author)
router.delete('/:id', authMiddleware, deleteBlogPost);

module.exports = router;