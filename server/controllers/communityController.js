const { getFirestore } = require('firebase-admin/firestore');

// Hàm giả định để lấy dữ liệu tiến trình (Study Data, Points)
exports.getUserProgress = async (req, res) => {
    try {
        // Trong ứng dụng thực tế, bạn sẽ dùng req.params.id hoặc req.user.userId để truy vấn
        // Firestore cho các bộ sưu tập 'study_logs', 'user_goals', và 'points'.

        // Dữ liệu giả lập cho Demo
        const demoData = {
            studyTime: { current: 3.5, goal: 5, unit: 'h' },
            coursesCompleted: { current: 2, goal: 3 },
            weeklyGoal: { current: 18, goal: 25, unit: 'h' },
            studyPoints: 1247
        };

        res.status(200).json(demoData);
    } catch (err) {
        console.error('Community Progress Error:', err);
        res.status(500).json({ error: 'Failed to fetch user progress.' });
    }
};

// Hàm giả định để lấy dữ liệu Leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboardData = [
            { id: 1, name: "Sarah Martinez", hours: 32, points: 2840, change: 340, initials: "SM", rank: 1, color: "yellow-400" },
            { id: 2, name: "David Kim", hours: 28, points: 2520, change: 280, initials: "DK", rank: 2, color: "gray-400" },
            { id: 3, name: "Alex Chen", hours: 25, points: 2247, change: 247, initials: "AC", rank: 3, color: "orange-400" },
            { id: 4, name: "Emma Johnson", hours: 22, points: 1980, change: 180, initials: "EJ", rank: 4, color: "purple-400" },
            { id: 5, name: "Mike Rodriguez", hours: 20, points: 1750, change: 150, initials: "MR", rank: 5, color: "green-400" }
        ];

        res.status(200).json(leaderboardData);
    } catch (err) {
        console.error('Leaderboard Error:', err);
        res.status(500).json({ error: 'Failed to fetch leaderboard data.' });
    }
};

// Hàm giả định để lấy dữ liệu Friends Status
exports.getFriendsStatus = async (req, res) => {
    try {
        const friendsData = [
            { name: "Sarah Martinez", status: "Studying React", initials: "SM", online: true, color: "blue-500", emoji: "💬" },
            { name: "David Kim", status: "In study session", initials: "DK", online: true, color: "green-500", emoji: "🎯" },
            { name: "Emma Johnson", status: "Available", initials: "EJ", online: true, color: "purple-500", emoji: "👋" },
            { name: "Mike Rodriguez", status: "Away", initials: "MR", online: false, color: "orange-500", emoji: "💤" }
        ];
        
        const totalOnline = friendsData.filter(f => f.online).length;

        res.status(200).json({ totalOnline, friends: friendsData });
    } catch (err) {
        console.error('Friends Status Error:', err);
        res.status(500).json({ error: 'Failed to fetch friends status.' });
    }
};

