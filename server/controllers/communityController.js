const { getFirestore } = require('firebase-admin/firestore');
const User = require('../models/User');
const Progress = require('../models/Progress');

/**
 * Get user progress with study data and points
 */
exports.getUserProgress = async (req, res) => {
    try {
        const userId = req.headers['user-id'] || req.user?.id || req.body?.user_id;

        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        console.log(`\n🔍 [PROGRESS] Fetching progress for user: ${userId}`);

        const dailyLessons = await Progress.getDailyProgress(userId);
        const weeklyLessons = await Progress.getWeeklyProgress(userId);
        const overallProgress = await Progress.getUserOverallProgress(userId);

        const completedCourses = overallProgress.filter(p => p.completionPercentage === 100).length;
        const totalEnrolledCourses = overallProgress.length;
        const totalLessonsCompleted = overallProgress.reduce((sum, p) => sum + p.completedLessons, 0);

        console.log(`📊 [PROGRESS] ${completedCourses}/${totalEnrolledCourses} courses, ${totalLessonsCompleted} lessons completed`);

        const dailyStudyTime = dailyLessons * 0.5;
        const weeklyStudyTime = weeklyLessons * 0.5;
        const studyPoints = Progress.calculateStudyPoints(totalLessonsCompleted, completedCourses);

        const dailyGoal = 2;
        const coursesGoal = Math.max(3, totalEnrolledCourses);
        const weeklyGoal = 14;

        const progressData = {
            studyTime: {
                current: Math.round(dailyStudyTime * 10) / 10,
                goal: dailyGoal,
                unit: 'h'
            },
            coursesCompleted: {
                current: completedCourses,
                goal: coursesGoal
            },
            weeklyGoal: {
                current: Math.round(weeklyStudyTime * 10) / 10,
                goal: weeklyGoal,
                unit: 'h'
            },
            studyPoints: studyPoints
        };

        console.log(`✅ [PROGRESS] Returned ${studyPoints} points`);
        res.status(200).json(progressData);
    } catch (err) {
        console.error('❌ [PROGRESS] Error:', err);
        res.status(500).json({ error: 'Failed to fetch user progress.' });
    }
};

/**
 * Get leaderboard using Progress model to track course completions
 * Points System: 100 points per completed course
 */
exports.getLeaderboard = async (req, res) => {
    try {
        const db = getFirestore();
        const Enrollment = require('../models/Enrollment');
        const Progress = require('../models/Progress');

        console.log('\n🔍 [LEADERBOARD] Starting enrollment-based leaderboard fetch...');

        // STEP 1: Get all student users
        const usersSnapshot = await db.collection('users')
            .where('role', '==', 'student')
            .get();

        console.log(`📊 [LEADERBOARD] Found ${usersSnapshot.docs.length} students`);

        if (usersSnapshot.empty) {
            return res.status(200).json([]);
        }

        const users = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`🔄 [LEADERBOARD] Calculating progress for each user...`);

        const leaderboardData = [];

        for (const user of users) {
            const userId = user.id;

            try {
                // Get all enrollments for this user
                const enrollments = await Enrollment.findByUserId(userId);
                
                let completedCourses = 0;
                const totalEnrolledCourses = enrollments.length;

                // For each enrollment, check if course is 100% completed
                for (const enrollment of enrollments) {
                    const courseId = enrollment.courseId || enrollment.course_id;
                    if (!courseId) continue;

                    // Calculate completion percentage for this course
                    const percentage = await Progress.calculateCompletion(userId, courseId);
                    
                    // Count as completed if 100%
                    if (percentage === 100) {
                        completedCourses++;
                    }
                }

                // Calculate study points: 100 pts per completed course
                const studyPoints = completedCourses * 100;

                // Debug log for first few users
                if (leaderboardData.length < 3) {
                    console.log(`🔍 [LEADERBOARD] User ${user.name}:`);
                    console.log(`   - Enrolled in ${totalEnrolledCourses} courses`);
                    console.log(`   - Completed courses: ${completedCourses}`);
                    console.log(`   - Study points: ${studyPoints} pts (100 pts per completed course)`);
                }

                // Create initials from name
                const nameParts = (user.name || 'User').split(' ');
                const initials = nameParts.length > 1
                    ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
                    : nameParts[0][0] + (nameParts[0][1] || '');

                leaderboardData.push({
                    id: userId,
                    name: user.name || 'Unknown User',
                    hours: completedCourses, // Number of courses completed
                    points: studyPoints, // Study points based on courses completed
                    initials: initials.toUpperCase(),
                    userId: userId,
                    email: user.email,
                    color: ['yellow-400', 'gray-400', 'orange-400', 'purple-400', 'green-400', 'blue-400', 'pink-400'][Math.floor(Math.random() * 7)]
                });
            } catch (error) {
                console.error(`⚠️ [LEADERBOARD] Error fetching progress for user ${user.name}:`, error.message);
                // Still add user to leaderboard with 0 points if there's an error
                const nameParts = (user.name || 'User').split(' ');
                const initials = nameParts.length > 1
                    ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
                    : nameParts[0][0] + (nameParts[0][1] || '');

                leaderboardData.push({
                    id: userId,
                    name: user.name || 'Unknown User',
                    hours: 0,
                    points: 0,
                    initials: initials.toUpperCase(),
                    color: ['yellow-400', 'gray-400', 'orange-400', 'purple-400', 'green-400', 'blue-400', 'pink-400'][Math.floor(Math.random() * 7)]
                });
            }
        }

        console.log(`📊 [LEADERBOARD] Processed ${leaderboardData.length} students`);

        // Sort by points descending
        leaderboardData.sort((a, b) => b.points - a.points);

        // Assign ranks
        leaderboardData.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        // Get top 10
        const top10 = leaderboardData.slice(0, 10);

        console.log('🏆 [LEADERBOARD] Top 10:');
        top10.forEach(entry => {
            console.log(`   ${entry.rank}. ${entry.name}: ${entry.hours} courses, ${entry.points} pts`);
        });

        console.log('✅ [LEADERBOARD] Query optimization complete!\n');

        res.status(200).json(top10);
    } catch (err) {
        console.error('❌ [LEADERBOARD] Error:', err);
        res.status(500).json({ error: 'Failed to fetch leaderboard data.' });
    }
};

/**
 * Get friends status (mock data for now)
 */
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
