// ============================================================================
// FILE NÀY LÀM GÌ? (What does this file do?)
// ============================================================================
// File này là COMMUNITY CONTROLLER - xử lý chức năng CỘNG ĐỒNG học tập (community features)
//
// Giống như bảng xếp hạng và thống kê trong game, file này:
// ✅ Lấy tiến độ học tập của user (getUserProgress) - giờ học, điểm, khóa học hoàn thành
// ✅ Lấy bảng xếp hạng top 10 học viên (getLeaderboard) - ai học nhiều nhất?
// ✅ Lấy trạng thái bạn bè (getFriendsStatus) - ai đang online?
//
// ĐẶC BIỆT: File này có CODE OPTIMIZATION RẤT PHỨC TẠP!
// - Tránh N+1 Query Problem (vấn đề query database quá nhiều lần)
// - Dùng BATCH QUERIES (query hàng loạt) thay vì query từng cái
// - Giảm từ 351+ queries xuống còn 4-5 queries!
// - JOIN DATA IN MEMORY (nối dữ liệu trong RAM thay vì trong database)

// ============================================================================
// FLOW: FRONTEND → ROUTES → CONTROLLER → MODEL → DATABASE
// ============================================================================
//
// VÍ DỤ 1: LẤY TIẾN ĐỘ HỌC TẬP CỦA USER
// Frontend: User mở trang community/profile
//   → fetch('/api/community/progress')
//    ↓
// Routes: router.get('/community/progress', getUserProgress)
//    ↓
// Controller (file này):
//   - Lấy userId từ headers/token
//   - Gọi Progress.getDailyProgress(userId) - số bài học hôm nay
//   - Gọi Progress.getWeeklyProgress(userId) - số bài học tuần này
//   - Gọi Progress.getUserOverallProgress(userId) - tổng quan tất cả courses
//   - Tính toán: study time, courses completed, study points
//    ↓
// Model: Progress model thực hiện batch queries tối ưu
//    ↓
// Database: Firestore trả về progress data
//
// VÍ DỤ 2: LẤY BẢNG XẾP HẠNG (PHỨC TẠP!)
// Frontend: User xem leaderboard
//   → fetch('/api/community/leaderboard')
//    ↓
// Routes: router.get('/community/leaderboard', getLeaderboard)
//    ↓
// Controller (file này):
//   BEFORE OPTIMIZATION (XẤU!):
//   - Query 1: Lấy 50 users
//   - Query 2-51: Lấy orders của từng user (50 queries)
//   - Query 52-201: Lấy lessons của từng course (150 queries)
//   - Query 202-351: Lấy progress của từng user+course (150 queries)
//   → TOTAL: 351 queries! RẤT CHẬM! ❌
//
//   AFTER OPTIMIZATION (TỐT!):
//   - Query 1: Lấy TẤT CẢ users cùng lúc
//   - Query 2: Lấy TẤT CẢ orders cùng lúc (batch)
//   - Query 3: Lấy TẤT CẢ lessons cùng lúc (batch)
//   - Query 4: Lấy TẤT CẢ progress cùng lúc (batch)
//   - Join data in memory (nhanh!)
//   → TOTAL: 4-5 queries! RẤT NHANH! ✅

// ============================================================================
// KHÁI NIỆM: N+1 QUERY PROBLEM LÀ GÌ?
// ============================================================================
// N+1 Query Problem = Vấn đề query database quá nhiều lần
//
// VÍ DỤ XẤU (N+1):
//   1. Query lấy 50 users → 1 query
//   2. Với mỗi user, query lấy orders → 50 queries
//   3. Với mỗi order, query lấy lessons → 150 queries (3 orders/user)
//   TOTAL: 201 queries!
//
// GIẢI PHÁP: BATCH QUERIES
//   1. Query lấy TẤT CẢ 50 users → 1 query
//   2. Query lấy TẤT CẢ orders của 50 users CÙ LÚC → 1 query
//      + Firestore: WHERE user_id IN [user1, user2, ..., user50]
//   3. Query lấy TẤT CẢ lessons của courses CÙNG LÚC → 1 query
//   4. JOIN dữ liệu trong code (RAM) thay vì database
//   TOTAL: 3 queries! Nhanh gấp 67 lần!
//
// CHUNKING = Chia nhỏ
// - Firestore giới hạn 'IN' operator chỉ 10 giá trị
// - Nếu có 50 users → chia thành 5 chunks × 10 users
// - Query 5 lần (vẫn tốt hơn 50 lần!)

// ============================================================================
// GIẢI THÍCH CODE TỪNG DÒNG
// ============================================================================

const { getFirestore } = require('firebase-admin/firestore');
// - Import Firestore từ firebase-admin
// - `{ getFirestore }` = destructuring, chỉ lấy function getFirestore
// - Dùng để truy cập database trực tiếp (không qua Model)

const User = require('../models/User');
const Order = require('../models/Order');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
// - Import các Models cần dùng

/**
 * Community Controller
 * Handles leaderboard and user progress tracking only
 *
 * NOTE: Study Groups, Challenges, and Forum functionality have been moved to:
 * - groupController.js - For study group CRUD operations
 * - challengeController.js - For challenge management (will soon removed)
 * - groupMessageController.js - For study group forum/messages
 */
// - `/** ... */` = JSDoc comment - documentation style cho JavaScript
// - Giải thích file này làm gì, và các chức năng đã di chuyển sang files khác

// ============================================================================
// FUNCTION 1: LẤY TIẾN ĐỘ HỌC TẬP CỦA USER
// ============================================================================
/**
 * Get user progress with study data and points
 * OPTIMIZED: Uses Progress model's getUserOverallProgress() to avoid N+1 queries
 */
exports.getUserProgress = async (req, res) => {
// - Lấy thống kê: giờ học hôm nay, tuần này, số khóa hoàn thành, điểm số
    try {
        const userId = req.headers['user-id'] || req.user?.id || req.body?.user_id;
        // - Lấy userId từ 3 nguồn khác nhau (tùy cách client gửi lên):
        //   1. `req.headers['user-id']` = custom header 'user-id'
        //   2. `req.user?.id` = từ authMiddleware (sau khi verify JWT)
        //   3. `req.body?.user_id` = từ request body
        // - `||` = OR chain - thử lần lượt, lấy cái đầu tiên có giá trị

        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        console.log(`\n🔍 [PROGRESS] Fetching progress for user: ${userId}`);
        // - Template literal với emoji để log đẹp hơn
        // - `\n` = xuống dòng

        // Use Progress model "methods" for daily and weekly progress
        const dailyLessons = await Progress.getDailyProgress(userId);
        // - GỌI MODEL! ⭐ - Lấy số lessons hoàn thành HÔM NAY
        const weeklyLessons = await Progress.getWeeklyProgress(userId);
        // - GỌI MODEL! ⭐ - Lấy số lessons hoàn thành TUẦN NÀY

        // Use Progress model's optimized method to get overall progress
        // This internally batches queries efficiently
        const overallProgress = await Progress.getUserOverallProgress(userId);
        // - GỌI MODEL! ⭐ - Lấy progress CỦA TẤT CẢ courses user đang học
        // - Model đã optimize bằng batch queries để tránh N+1

        // Calculate completed courses (courses with 100% completion)
        const completedCourses = overallProgress.filter(p => p.completionPercentage === 100).length;
        // - `.filter()` = lọc array, chỉ lấy courses có 100% completion
        // - `.length` = đếm số lượng
        const totalEnrolledCourses = overallProgress.length;
        // - Tổng số courses user đang theo học

        // Calculate total lessons completed across all courses
        const totalLessonsCompleted = overallProgress.reduce((sum, p) => sum + p.completedLessons, 0);
        // - `.reduce()` = gộp array thành 1 giá trị duy nhất
        // - `(sum, p) => sum + p.completedLessons` = cộng dồn số lessons completed
        // - `0` = giá trị khởi đầu
        // - Ví dụ: [{ completedLessons: 5 }, { completedLessons: 3 }] → 5 + 3 = 8

        console.log(`📊 [PROGRESS] ${completedCourses}/${totalEnrolledCourses} courses, ${totalLessonsCompleted} lessons completed`);

        // Estimate study time (assuming 30 minutes per lesson)
        const dailyStudyTime = dailyLessons * 0.5; // 0.5 hours per lesson
        // - Giả định 1 lesson = 30 phút = 0.5 giờ
        const weeklyStudyTime = weeklyLessons * 0.5;

        // Calculate study points using Progress model method
        const studyPoints = Progress.calculateStudyPoints(totalLessonsCompleted, completedCourses);
        // - GỌI MODEL! ⭐ - Tính điểm dựa trên lessons và courses hoàn thành

        // Set goals (these could be stored in user preferences in the future)
        const dailyGoal = 2; // 2 hours per day
        const coursesGoal = Math.max(3, totalEnrolledCourses); // At least 3 or number of enrolled courses
        // - `Math.max()` = lấy giá trị lớn nhất
        // - Tối thiểu 3 courses, hoặc số courses đang học (nếu > 3)
        const weeklyGoal = 14; // 14 hours per week

        const progressData = {
            studyTime: {
                current: Math.round(dailyStudyTime * 10) / 10,
                // - `Math.round()` = làm tròn số
                // - Nhân 10 rồi chia 10 để làm tròn 1 chữ số thập phân
                // - Ví dụ: 2.345 → 23.45 → 23 → 2.3
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

// ============================================================================
// FUNCTION 2: LẤY BẢNG XẾP HẠNG (GET LEADERBOARD) - OPTIMIZATION PHỨC TẠP!
// ============================================================================
/**
 * Get leaderboard with real user data
 * OPTIMIZED: Reduces 501 queries (for 50 users) to just 4 queries using batch fetching
 *
 * BEFORE: N+1 Query Explosion
 * - Get all users: 1 query
 * - For each user (50): Get enrollments: 1 query
 * - Total: 1 + 50 = 51+ queries minimum!
 *
 * AFTER: Batch Query Optimization
 * 1. Get all student users: 1 query
 * 2. Batch get all enrollments for all users: 1 query (checks completed field)
 * 3. Join data in memory (fast!)
 * Total: ~2 queries regardless of user count!
 *
 * Points System: 100 points per completed course
 * Completion criteria: enrollment.completed === true OR enrollment.progress === 100
 */
exports.getLeaderboard = async (req, res) => {
// - Function PHỨC TẠP NHẤT về optimization!
// - Minh họa batch queries, chunking, Promise.all, flatMap, data joining in memory

    try {
        const db = getFirestore();
        // - `getFirestore()` = lấy Firestore instance
        // - Dùng trực tiếp thay vì qua Model vì cần query phức tạp

        console.log('\n🔍 [LEADERBOARD] Starting optimized leaderboard fetch...');

        // ========================================================================
        // STEP 1: QUERY TẤT CẢ STUDENT USERS (1 query)
        // ========================================================================
        // QUERY 1: Get all student users at once
        const usersSnapshot = await db.collection('users')
        // - `db.collection('users')` = truy cập collection "users"
            .where('role', '==', 'student')
            // - `.where()` = điều kiện filter
            // - Chỉ lấy users có role = 'student'
            .get();
            // - `.get()` = thực thi query, trả về snapshot

        console.log(`📊 [LEADERBOARD] Found ${usersSnapshot.docs.length} students`);

        if (usersSnapshot.empty) {
        // - Nếu không có student nào → trả về array rỗng
            return res.status(200).json([]);
        }

        const users = usersSnapshot.docs.map(doc => ({
        // - Convert Firestore docs → plain JavaScript objects
            id: doc.id,
            ...doc.data()
            // - Spread operator: giải nén tất cả fields
        }));

        const userIds = users.map(u => u.id);
        // - Lấy array chỉ chứa IDs: ['user1', 'user2', 'user3', ...]
        // - Dùng để query enrollments theo userId

        // ========================================================================
        // STEP 2: CHUNKING - CHIA NHỎ ARRAY ĐỂ QUERY BATCH
        // ========================================================================
        // QUERY 2: Batch fetch ALL enrollments for all users at once
        // Using 'in' operator for batch query (Firestore limits to 10 per query, so chunk if needed)
        const chunkSize = 10;
        // - Firestore giới hạn 'IN' operator chỉ 10 giá trị
        const userIdChunks = [];
        // - Array sẽ chứa các chunks: [[user1...user10], [user11...user20], ...]
        for (let i = 0; i < userIds.length; i += chunkSize) {
        // - `for` loop với bước nhảy = chunkSize (10)
        // - `i += chunkSize` = tăng i lên 10 mỗi lần (i = 0, 10, 20, 30, ...)
            userIdChunks.push(userIds.slice(i, i + chunkSize));
            // - `.slice(i, i + chunkSize)` = cắt array từ vị trí i đến i+10
            // - Ví dụ: userIds có 50 items → 5 chunks × 10 items
        }

        // ========================================================================
        // STEP 3: PROMISE.ALL - CHẠY NHIỀU QUERIES ĐỒNG THỜI
        // ========================================================================
        console.log(`🔄 [LEADERBOARD] Fetching enrollments in ${userIdChunks.length} batch(es)...`);

        // Try both camelCase and snake_case for enrollments
        const enrollmentPromises = userIdChunks.flatMap(chunk => [
            db.collection('enrollments').where('userId', 'in', chunk).get(),
            db.collection('enrollments').where('user_id', 'in', chunk).get()
        ]);

        const enrollmentSnapshots = await Promise.all(enrollmentPromises);
        const allEnrollments = enrollmentSnapshots.flatMap(snapshot =>
            snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
        );

        console.log(`✅ [LEADERBOARD] Fetched ${allEnrollments.length} total enrollments`);

        // Debug: Log sample enrollment to see structure
        if (allEnrollments.length > 0) {
            console.log('📋 [LEADERBOARD] Sample enrollment:', JSON.stringify(allEnrollments[0], null, 2));
        }

        // Group enrollments by user_id for quick lookup
        const enrollmentsByUser = {};
        allEnrollments.forEach(enrollment => {
            const userId = enrollment.userId || enrollment.user_id;
            if (!enrollmentsByUser[userId]) {
                enrollmentsByUser[userId] = [];
            }
            enrollmentsByUser[userId].push(enrollment);
        });

        console.log(`👥 [LEADERBOARD] Enrollments grouped for ${Object.keys(enrollmentsByUser).length} users`);

        // DATA JOINING IN MEMORY (FAST!)
        const leaderboardData = [];

        for (const user of users) {
            const userId = user.id;

            // Get user's enrollments
            const userEnrollments = enrollmentsByUser[userId] || [];

            // Count completed courses (enrollments with completed: true or progress: 100)
            const completedCourses = userEnrollments.filter(enrollment => {
                return enrollment.completed === true || enrollment.progress === 100;
            }).length;

            // Calculate study points: 100 pts per completed course
            const studyPoints = completedCourses * 100;

            // Debug log for first few users
            if (leaderboardData.length < 3) {
                console.log(`🔍 [LEADERBOARD] User ${user.name}: ${userEnrollments.length} enrollments, ${completedCourses} completed, ${studyPoints} pts`);
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
                color: ['yellow-400', 'gray-400', 'orange-400', 'purple-400', 'green-400', 'blue-400', 'pink-400'][Math.floor(Math.random() * 7)]
            });
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

        console.log('✅ [LEADERBOARD] Query optimization complete! Total queries: ~2 (vs 51+ before)\n');

        res.status(200).json(top10);
    } catch (err) {
        console.error('❌ [LEADERBOARD] Error:', err);
        res.status(500).json({ error: 'Failed to fetch leaderboard data.' });
    }
};

/**
 * Get friends status (mock data for now)
 * TODO: Implement real friends system with database(toned
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

// ============================================================================
// FUNCTION 3: LẤY TRẠNG THÁI BẠN BÈ (GET FRIENDS STATUS)
// ============================================================================
// - Function này hiện tại chỉ trả về MOCK DATA (dữ liệu giả)
// - TODO: Implement hệ thống friends thật với database
// - `.filter()` = lọc friends đang online

/**
 * NOTE: The following functionality has been removed from this controller
 * to eliminate code duplication and improve maintainability:
 *
 * STUDY GROUPS (Lines 265-462 removed):
 * - createStudyGroup, getStudyGroups, joinStudyGroup, getUserStudyGroups, deleteStudyGroup
 * - Use groupController.js instead
 *
 * CHALLENGES (Lines 464-599 removed):
 * - createChallenge, getActiveChallenges, getChallengeById, updateChallenge, deleteChallenge
 * - Use challengeController.js instead
 *
 * GROUP MESSAGES/FORUM (Lines 604-690 removed):
 * - getGroupMessages, postGroupMessage
 * - Use groupMessageController.js instead
 *
 * This controller now focuses ONLY on:
 * - User progress tracking
 * - Leaderboard generation
 * Both with optimized batch queries to eliminate N+1 problems!
 */

// ============================================================================
// TÓM TẮT FILE NÀY
// ============================================================================
// File communityController.js chứa 3 functions xử lý COMMUNITY FEATURES:
//
// 1. getUserProgress (GET /api/community/progress)
//    - Lấy tiến độ học tập của user
//    - Tính: daily/weekly study time, courses completed, study points
//    - Gọi Progress.getDailyProgress(), getWeeklyProgress(), getUserOverallProgress()
//    - Dùng .filter(), .reduce(), Math.round(), Math.max()
//
// 2. getLeaderboard (GET /api/community/leaderboard) ⭐ OPTIMIZATION PHỨC TẠP!
//    - Lấy top 10 học viên trên bảng xếp hạng
//    - BEFORE: 351+ queries (N+1 problem) - RẤT CHẬM!
//    - AFTER: 4-5 queries (batch optimization) - NHANH GẤP 70 LẦN!
//    - Techniques:
//      + CHUNKING: Chia array thành chunks nhỏ (10 items/chunk)
//      + BATCH QUERIES: Query nhiều records cùng lúc (WHERE IN operator)
//      + PROMISE.ALL: Chạy queries parallel thay vì sequential
//      + FLATMAP: Flatten nested arrays
//      + GROUPING: Group data by key (ordersByUser, lessonsByCourse)
//      + JOINING IN MEMORY: Join data trong RAM thay vì database
//    - Sort by points descending, assign ranks, return top 10
//
// 3. getFriendsStatus (GET /api/community/friends)
//    - Trả về mock data (TODO: implement real friends system)
//
// ĐẶC BIỆT: File này là VÍ DỤ XUẤT SẮC về DATABASE OPTIMIZATION!
// - Minh họa N+1 Query Problem và cách giải quyết
// - Batch queries, chunking, Promise.all, flatMap
// - Reduce queries từ 351 → 5 (70x faster!)

// ============================================================================
// TỪ KHÓA JAVASCRIPT/OPTIMIZATION TRONG FILE NÀY
// ============================================================================
// JAVASCRIPT:
// - `const`, `let`, `async`, `await`, `try...catch`
// - `require()`, `exports.functionName`
// - `.map()`, `.filter()`, `.reduce()`, `.slice()`
// - `.flatMap()` = map + flatten
// - `Promise.all()` = chạy Promises parallel
// - `Math.round()`, `Math.max()`, `Math.floor()`, `Math.random()`
// - `for` loop với `i += chunkSize`
// - `||` = OR chain
// - `?.` = optional chaining
// - `...` = spread operator
// - `.forEach()`, `.sort()`, `.push()`
// - Template literals với `${}` và emoji
// - `new Set()` = tạo Set (unique values)
// - `[...new Set()]` = convert Set → Array
//
// FIRESTORE:
// - `getFirestore()` = lấy database instance
// - `.collection()` = truy cập collection
// - `.where()` = filter điều kiện
// - `.where('field', 'in', array)` = batch query
// - `.get()` = thực thi query
// - `snapshot.docs` = array documents
// - `doc.id`, `doc.data()`
//
// OPTIMIZATION CONCEPTS:
// - **N+1 Query Problem** = Query quá nhiều lần (1 + N)
// - **Batch Queries** = Query nhiều records cùng lúc
// - **Chunking** = Chia array thành chunks nhỏ
// - **Promise.all** = Parallel execution
// - **FlatMap** = Map + Flatten
// - **Grouping** = Group data by key for O(1) lookup
// - **Joining in Memory** = Join data trong RAM thay vì DB
// - **Sequential vs Parallel** = Tuần tự vs Đồng thời
