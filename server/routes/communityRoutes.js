const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');

// GET /api/community/progress -> Lấy tiến trình học tập của người dùng hiện tại
router.get('/progress', communityController.getUserProgress);

// GET /api/community/leaderboard -> Lấy dữ liệu bảng xếp hạng
router.get('/leaderboard', communityController.getLeaderboard);

// GET /api/community/friends -> Lấy trạng thái bạn bè
router.get('/friends', communityController.getFriendsStatus);

// === STUDY GROUPS ROUTES ===
// POST /api/community/groups -> Create new study group (Teachers only)
router.post('/groups', communityController.createStudyGroup);

// GET /api/community/groups -> Get all study groups
router.get('/groups', communityController.getStudyGroups);

// POST /api/community/groups/:groupId/join -> Join a study group
router.post('/groups/:groupId/join', communityController.joinStudyGroup);

// GET /api/community/users/:userId/groups -> Get user's study groups
router.get('/users/:userId/groups', communityController.getUserStudyGroups);

// DELETE /api/community/groups/:groupId -> Delete study group (Teachers only)
router.delete('/groups/:groupId', communityController.deleteStudyGroup);

// === CHALLENGES ROUTES ===
// POST /api/community/challenges -> Create new challenge (Admin only)
router.post('/challenges', communityController.createChallenge);

// GET /api/community/challenges -> Get all active challenges
router.get('/challenges', communityController.getActiveChallenges);

// DELETE /api/community/challenges/:challengeId -> Delete challenge (Admin only)
router.delete('/challenges/:challengeId', communityController.deleteChallenge);

// === FORUM ROUTES ===
// GET /api/community/groups/:groupId/messages -> Get group forum messages
router.get('/groups/:groupId/messages', communityController.getGroupMessages);

// POST /api/community/groups/:groupId/messages -> Post message to group forum
router.post('/groups/:groupId/messages', communityController.postGroupMessage);

module.exports = router;

