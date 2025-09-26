const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');

// GET /api/community/progress -> Lấy tiến trình học tập của người dùng hiện tại
router.get('/progress', communityController.getUserProgress);

// GET /api/community/leaderboard -> Lấy dữ liệu bảng xếp hạng
router.get('/leaderboard', communityController.getLeaderboard);

// GET /api/community/friends -> Lấy trạng thái bạn bè
router.get('/friends', communityController.getFriendsStatus);

module.exports = router;
