const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const groupController = require('../controllers/groupController');
const groupMessageController = require('../controllers/groupMessageController');

// GET /api/community/progress -> Lấy tiến trình học tập của người dùng hiện tại
router.get('/progress', communityController.getUserProgress);

// GET /api/community/leaderboard -> Lấy dữ liệu bảng xếp hạng
router.get('/leaderboard', communityController.getLeaderboard);

// GET /api/community/friends -> Lấy trạng thái bạn bè
router.get('/friends', communityController.getFriendsStatus);

// === STUDY GROUPS ROUTES ===
// POST /api/community/groups -> Create new study group (Teachers only)
router.post('/groups', groupController.createStudyGroup);

// GET /api/community/groups -> Get all study groups
router.get('/groups', groupController.getStudyGroups);

// POST /api/community/groups/:groupId/join -> Join a study group
router.post('/groups/:groupId/join', groupController.joinStudyGroup);

// GET /api/community/users/:userId/groups -> Get user's study groups
router.get('/users/:userId/groups', groupController.getUserStudyGroups);

// PUT /api/community/groups/:groupId -> Update study group (Teachers only)
router.put('/groups/:groupId', groupController.updateStudyGroup);

// DELETE /api/community/groups/:groupId -> Delete study group (Teachers only)
router.delete('/groups/:groupId', groupController.deleteStudyGroup);

// === FORUM ROUTES ===
// GET /api/community/groups/:groupId/messages -> Get group forum messages
router.get('/groups/:groupId/messages', groupMessageController.getGroupMessages);

// POST /api/community/groups/:groupId/messages -> Post message to group forum
router.post('/groups/:groupId/messages', groupMessageController.postGroupMessage);

module.exports = router; // cho server.js xài

