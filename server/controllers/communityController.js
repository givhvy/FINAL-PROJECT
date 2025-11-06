const { getFirestore } = require('firebase-admin/firestore');

// Get real user progress data (Study Data, Points)
exports.getUserProgress = async (req, res) => {
    try {
        const db = getFirestore();
        const userId = req.headers['user-id'] || req.user?.id || req.body?.user_id;

        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        // Get today's date for daily progress
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

        // Get this week's start date
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);

        // 1. Get completed lessons today
        const lessonsCompletedToday = await db.collection('lesson_completions')
            .where('user_id', '==', userId)
            .where('completed_at', '>=', todayStart.toISOString())
            .where('completed_at', '<', todayEnd.toISOString())
            .get();

        // 2. Get total completed courses
        const userOrdersQuery = db.collection('orders')
            .where('user_id', '==', userId)
            .where('status', '==', 'completed');
        const userOrders = await userOrdersQuery.get();

        let completedCourses = 0;
        let totalLessonsCompleted = 0;
        let totalLessonsInUserCourses = 0;

        // For each enrolled course, calculate completion
        for (const orderDoc of userOrders.docs) {
            const orderData = orderDoc.data();
            const courseId = orderData.course_id;

            if (!courseId) continue;

            // Check if course exists
            const courseRef = db.collection('courses').doc(courseId);
            const courseSnap = await courseRef.get();

            if (!courseSnap.exists) {
                console.warn(`Course ${courseId} not found for user ${userId}`);
                continue;
            }

            // Get total lessons in this course
            const lessonsQuery = db.collection('lessons').where('course_id', '==', courseId);
            const lessonsSnapshot = await lessonsQuery.get();
            const totalLessons = lessonsSnapshot.size;
            totalLessonsInUserCourses += totalLessons;

            // Get completed lessons for this course
            const completedLessonsQuery = db.collection('lesson_completions')
                .where('user_id', '==', userId)
                .where('course_id', '==', courseId);
            const completedLessonsSnapshot = await completedLessonsQuery.get();
            const completedLessonsCount = completedLessonsSnapshot.size;
            totalLessonsCompleted += completedLessonsCount;

            // If 100% complete, count as completed course
            if (totalLessons > 0 && completedLessonsCount >= totalLessons) {
                completedCourses++;
            }
        }

        // 3. Get weekly lesson completions for study time estimate
        const weeklyCompletions = await db.collection('lesson_completions')
            .where('user_id', '==', userId)
            .where('completed_at', '>=', weekStart.toISOString())
            .get();

        // Estimate study time (assuming 30 minutes per lesson)
        const dailyStudyTime = lessonsCompletedToday.size * 0.5; // 0.5 hours per lesson
        const weeklyStudyTime = weeklyCompletions.size * 0.5;

        // 4. Calculate study points based on activity
        const studyPoints = (totalLessonsCompleted * 10) + (completedCourses * 100);

        // 5. Set goals (these could be stored in user preferences in the future)
        const dailyGoal = 2; // 2 hours per day
        const coursesGoal = Math.max(3, userOrders.size); // At least 3 or number of enrolled courses
        const weeklyGoal = 14; // 14 hours per week

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

        res.status(200).json(progressData);
    } catch (err) {
        console.error('Community Progress Error:', err);
        res.status(500).json({ error: 'Failed to fetch user progress.' });
    }
};

// Hàm lấy dữ liệu Leaderboard THẬT từ Firebase
exports.getLeaderboard = async (req, res) => {
    try {
        const db = getFirestore();
        
        // Lấy tất cả users
        const usersSnapshot = await db.collection('users').get();
        
        const leaderboardData = [];
        
        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();
            
            // Chỉ lấy students (có thể thêm điều kiện khác)
            if (userData.role !== 'student') continue;
            
            // Lấy courses completed từ enrollments
            const enrollmentsSnapshot = await db.collection('enrollments')
                .where('userId', '==', userDoc.id)
                .get();
            
            // Đếm số courses đã hoàn thành (progress = 100)
            const completedCourses = enrollmentsSnapshot.docs.filter(doc => 
                doc.data().progress === 100
            ).length;
            
            // Lấy study points từ user data (nếu có) hoặc tính toán
            const studyPoints = userData.studyPoints || userData.points || (completedCourses * 100);
            
            // Tạo initials từ name
            const nameParts = (userData.name || 'User').split(' ');
            const initials = nameParts.length > 1 
                ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
                : nameParts[0][0] + (nameParts[0][1] || '');
            
            leaderboardData.push({
                id: userDoc.id,
                name: userData.name || 'Unknown User',
                hours: completedCourses, // Số courses hoàn thành thay vì hours
                points: studyPoints,
                change: Math.floor(Math.random() * 300) + 50, // Random change for this week
                initials: initials.toUpperCase(),
                color: ['yellow-400', 'gray-400', 'orange-400', 'purple-400', 'green-400', 'blue-400', 'pink-400'][Math.floor(Math.random() * 7)]
            });
        }
        
        // Sắp xếp theo points giảm dần
        leaderboardData.sort((a, b) => b.points - a.points);
        
        // Gán rank
        leaderboardData.forEach((entry, index) => {
            entry.rank = index + 1;
        });
        
        // Chỉ lấy top 10
        const top10 = leaderboardData.slice(0, 10);

        res.status(200).json(top10);
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

// === STUDY GROUPS MANAGEMENT ===

// Create a new study group (Teachers only)
exports.createStudyGroup = async (req, res) => {
    try {
        const db = getFirestore();

        // Validate required fields
        if (!req.body.name || !req.body.description) {
            return res.status(400).json({ error: 'Name and description are required.' });
        }

        if (!req.body.teacher_id) {
            return res.status(400).json({ error: 'Teacher ID is required.' });
        }

        const groupData = {
            name: req.body.name,
            description: req.body.description,
            subject: req.body.subject || 'General',
            teacher_id: req.body.teacher_id,
            created_at: new Date().toISOString(),
            member_count: 0,
            status: 'active'
        };

        const newGroupRef = await db.collection('study_groups').add(groupData);

        res.status(201).json({ id: newGroupRef.id, ...groupData });
    } catch (err) {
        console.error('Create Study Group Error:', err);
        res.status(500).json({ error: 'Failed to create study group.', details: err.message });
    }
};

// Get all study groups
exports.getStudyGroups = async (req, res) => {
    try {
        const db = getFirestore();
        const groupsSnapshot = await db.collection('study_groups').where('status', '==', 'active').get();

        const groups = await Promise.all(groupsSnapshot.docs.map(async (groupDoc) => {
            const groupData = groupDoc.data();

            // Get teacher information
            let teacherData = null;
            if (groupData.teacher_id) {
                const teacherRef = db.collection('users').doc(groupData.teacher_id);
                const teacherSnap = await teacherRef.get();
                if (teacherSnap.exists) {
                    teacherData = { id: teacherSnap.id, ...teacherSnap.data() };
                    delete teacherData.password;
                }
            }

            // Get member count
            const membersQuery = db.collection('group_members').where('group_id', '==', groupDoc.id);
            const membersSnapshot = await membersQuery.get();
            const memberCount = membersSnapshot.size;

            return {
                id: groupDoc.id,
                ...groupData,
                teacher: teacherData,
                member_count: memberCount
            };
        }));

        res.status(200).json(groups);
    } catch (err) {
        console.error('Get Study Groups Error:', err);
        res.status(500).json({ error: 'Failed to fetch study groups.' });
    }
};

// Join a study group
exports.joinStudyGroup = async (req, res) => {
    try {
        const db = getFirestore();
        const { groupId } = req.params;
        const { user_id } = req.body;

        // Check if user is already a member
        const existingMember = await db.collection('group_members')
            .where('group_id', '==', groupId)
            .where('user_id', '==', user_id)
            .get();

        if (!existingMember.empty) {
            return res.status(400).json({ error: 'User is already a member of this group.' });
        }

        // Add user to group
        const memberData = {
            group_id: groupId,
            user_id: user_id,
            joined_at: new Date().toISOString(),
            role: 'member'
        };

        const newMemberRef = await db.collection('group_members').add(memberData);
        res.status(201).json({ id: newMemberRef.id, ...memberData });
    } catch (err) {
        console.error('Join Study Group Error:', err);
        res.status(500).json({ error: 'Failed to join study group.' });
    }
};

// Get user's study groups
exports.getUserStudyGroups = async (req, res) => {
    try {
        const db = getFirestore();
        const { userId } = req.params;

        // Get groups where user is a member
        const membersQuery = db.collection('group_members').where('user_id', '==', userId);
        const membersSnapshot = await membersQuery.get();

        const groupIds = membersSnapshot.docs.map(doc => doc.data().group_id);

        if (groupIds.length === 0) {
            return res.status(200).json([]);
        }

        // Get group details
        const groups = [];
        for (const groupId of groupIds) {
            const groupRef = db.collection('study_groups').doc(groupId);
            const groupSnap = await groupRef.get();
            if (groupSnap.exists) {
                const groupData = groupSnap.data();

                // Get teacher info
                let teacherData = null;
                if (groupData.teacher_id) {
                    const teacherRef = db.collection('users').doc(groupData.teacher_id);
                    const teacherSnap = await teacherRef.get();
                    if (teacherSnap.exists) {
                        teacherData = { id: teacherSnap.id, ...teacherSnap.data() };
                        delete teacherData.password;
                    }
                }

                groups.push({
                    id: groupSnap.id,
                    ...groupData,
                    teacher: teacherData
                });
            }
        }

        res.status(200).json(groups);
    } catch (err) {
        console.error('Get User Study Groups Error:', err);
        res.status(500).json({ error: 'Failed to fetch user study groups.' });
    }
};

// Delete a study group (Teachers only)
exports.deleteStudyGroup = async (req, res) => {
    try {
        const db = getFirestore();
        const { groupId } = req.params;

        // Check if group exists
        const groupRef = db.collection('study_groups').doc(groupId);
        const groupSnap = await groupRef.get();

        if (!groupSnap.exists) {
            return res.status(404).json({ error: 'Study group not found.' });
        }

        // Delete group members first
        const membersQuery = db.collection('group_members').where('group_id', '==', groupId);
        const membersSnapshot = await membersQuery.get();

        const batch = db.batch();
        membersSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Delete group messages
        const messagesQuery = db.collection('group_messages').where('group_id', '==', groupId);
        const messagesSnapshot = await messagesQuery.get();
        messagesSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Delete the group itself
        batch.delete(groupRef);

        await batch.commit();
        res.status(200).json({ message: 'Study group deleted successfully.' });
    } catch (err) {
        console.error('Delete Study Group Error:', err);
        res.status(500).json({ error: 'Failed to delete study group.' });
    }
};

// === ACTIVE CHALLENGES MANAGEMENT ===

// Create a new challenge (Admin only)
exports.createChallenge = async (req, res) => {
    try {
        const db = getFirestore();
        const challengeData = {
            ...req.body,
            created_by: req.body.created_by || req.user?.id,
            created_at: new Date().toISOString(),
            status: 'active',
            participants_count: 0
        };

        const newChallengeRef = await db.collection('challenges').add(challengeData);
        res.status(201).json({ id: newChallengeRef.id, ...challengeData });
    } catch (err) {
        console.error('Create Challenge Error:', err);
        res.status(500).json({ error: 'Failed to create challenge.' });
    }
};

// Get all active challenges
exports.getActiveChallenges = async (req, res) => {
    try {
        const db = getFirestore();
        const challengesSnapshot = await db.collection('challenges')
            .where('status', '==', 'active')
            .get();

        const challenges = await Promise.all(challengesSnapshot.docs.map(async (doc) => {
            const challengeData = doc.data();

            // Get participants count
            const participantsQuery = db.collection('challenge_participants')
                .where('challenge_id', '==', doc.id);
            const participantsSnapshot = await participantsQuery.get();

            return {
                id: doc.id,
                ...challengeData,
                participants_count: participantsSnapshot.size
            };
        }));

        res.status(200).json(challenges);
    } catch (err) {
        console.error('Get Active Challenges Error:', err);
        res.status(500).json({ error: 'Failed to fetch active challenges.' });
    }
};

// Get single challenge by ID
exports.getChallengeById = async (req, res) => {
    try {
        const db = getFirestore();
        const { challengeId } = req.params;

        const challengeRef = db.collection('challenges').doc(challengeId);
        const challengeSnap = await challengeRef.get();

        if (!challengeSnap.exists) {
            return res.status(404).json({ error: 'Challenge not found.' });
        }

        const challengeData = challengeSnap.data();

        // Get participants count
        const participantsQuery = db.collection('challenge_participants')
            .where('challenge_id', '==', challengeId);
        const participantsSnapshot = await participantsQuery.get();

        res.status(200).json({
            id: challengeSnap.id,
            ...challengeData,
            participants_count: participantsSnapshot.size
        });
    } catch (err) {
        console.error('Get Challenge By ID Error:', err);
        res.status(500).json({ error: 'Failed to fetch challenge.' });
    }
};

// Update a challenge (Admin only)
exports.updateChallenge = async (req, res) => {
    try {
        const db = getFirestore();
        const { challengeId } = req.params;

        const challengeRef = db.collection('challenges').doc(challengeId);
        const challengeSnap = await challengeRef.get();

        if (!challengeSnap.exists) {
            return res.status(404).json({ error: 'Challenge not found.' });
        }

        const updateData = {
            ...req.body,
            updated_at: new Date().toISOString()
        };

        // Remove fields that shouldn't be updated via this endpoint
        delete updateData.created_at;
        delete updateData.created_by;
        delete updateData.participants_count;

        await challengeRef.update(updateData);

        const updatedSnap = await challengeRef.get();
        res.status(200).json({ id: updatedSnap.id, ...updatedSnap.data() });
    } catch (err) {
        console.error('Update Challenge Error:', err);
        res.status(500).json({ error: 'Failed to update challenge.' });
    }
};

// Delete a challenge (Admin only)
exports.deleteChallenge = async (req, res) => {
    try {
        const db = getFirestore();
        const { challengeId } = req.params;

        const challengeRef = db.collection('challenges').doc(challengeId);
        const challengeSnap = await challengeRef.get();

        if (!challengeSnap.exists) {
            return res.status(404).json({ error: 'Challenge not found.' });
        }

        await challengeRef.delete();
        res.status(200).json({ message: 'Challenge deleted successfully.' });
    } catch (err) {
        console.error('Delete Challenge Error:', err);
        res.status(500).json({ error: 'Failed to delete challenge.' });
    }
};

// === FORUM FUNCTIONALITY ===

// Get forum messages for a study group
exports.getGroupMessages = async (req, res) => {
    try {
        console.log('Getting messages for group:', req.params.groupId);
        const db = getFirestore();
        const { groupId } = req.params;

        // Get all messages and filter in JavaScript to avoid index requirement
        const messagesSnapshot = await db.collection('group_messages').get();

        console.log('Found total messages:', messagesSnapshot.size);

        // Filter messages for this group
        const groupMessages = messagesSnapshot.docs.filter(doc => doc.data().group_id === groupId);
        console.log('Messages for this group:', groupMessages.length);

        const messages = await Promise.all(groupMessages.map(async (messageDoc) => {
            const messageData = messageDoc.data();
            console.log('Processing message:', messageDoc.id, messageData);

            // Get user information
            let userData = null;
            if (messageData.user_id) {
                const userRef = db.collection('users').doc(messageData.user_id);
                const userSnap = await userRef.get();
                if (userSnap.exists) {
                    userData = { id: userSnap.id, ...userSnap.data() };
                    delete userData.password;
                }
            }

            return {
                id: messageDoc.id,
                ...messageData,
                user: userData
            };
        }));

        // Sort messages by created_at in JavaScript instead of Firestore
        messages.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateA - dateB;
        });

        console.log('Returning messages:', messages.length);
        res.status(200).json(messages);
    } catch (err) {
        console.error('Get Group Messages Error:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({ error: 'Failed to fetch group messages.' });
    }
};

// Post a message to study group forum
exports.postGroupMessage = async (req, res) => {
    try {
        const db = getFirestore();
        const { groupId } = req.params;
        const messageData = {
            group_id: groupId,
            user_id: req.body.user_id,
            message: req.body.message,
            created_at: new Date().toISOString(),
            message_type: req.body.message_type || 'text'
        };

        const newMessageRef = await db.collection('group_messages').add(messageData);

        // Get user info for response
        const userRef = db.collection('users').doc(messageData.user_id);
        const userSnap = await userRef.get();
        let userData = null;
        if (userSnap.exists) {
            userData = { id: userSnap.id, ...userSnap.data() };
            delete userData.password;
        }

        res.status(201).json({
            id: newMessageRef.id,
            ...messageData,
            user: userData
        });
    } catch (err) {
        console.error('Post Group Message Error:', err);
        res.status(500).json({ error: 'Failed to post message.' });
    }
};

