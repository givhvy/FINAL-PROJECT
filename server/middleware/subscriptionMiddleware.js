const User = require('../models/User');
const Enrollment = require('../models/Enrollment');

/**
 * Subscription Middleware
 * Handles subscription tier checks and course access control
 */

/**
 * Check if user has Pro tier
 */
const requireProTier = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.subscriptionTier !== 'pro') {
            return res.status(403).json({
                error: 'Pro subscription required',
                message: 'This feature requires a Pro subscription. Please upgrade your account.'
            });
        }

        next();
    } catch (error) {
        console.error('Subscription check error:', error);
        res.status(500).json({ error: 'Error checking subscription status' });
    }
};

/**
 * Check course access based on subscription tier
 * - Free tier: Access to 3 courses only
 * - Pro tier: Access to all courses
 */
const checkCourseAccess = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.courseId || req.body.courseId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Pro tier has unlimited access
        if (user.subscriptionTier === 'pro') {
            req.hasCourseAccess = true;
            return next();
        }

        // Free tier: Check if user has already enrolled in 3 courses
        const enrollments = await Enrollment.findByUserId(userId);
        const enrolledCourseIds = enrollments.map(e => e.courseId);

        // If user is already enrolled in this course, allow access
        if (enrolledCourseIds.includes(courseId)) {
            req.hasCourseAccess = true;
            return next();
        }

        // If user has less than 3 enrollments, allow access
        if (enrollments.length < 3) {
            req.hasCourseAccess = true;
            return next();
        }

        // Free tier limit reached
        return res.status(403).json({
            error: 'Course limit reached',
            message: 'Free tier users can only access 3 courses. Upgrade to Pro for unlimited access.',
            enrollmentCount: enrollments.length,
            maxFreeEnrollments: 3
        });
    } catch (error) {
        console.error('Course access check error:', error);
        res.status(500).json({ error: 'Error checking course access' });
    }
};

/**
 * Get user tier information
 * Attaches subscription tier info to request
 */
const attachTierInfo = async (req, res, next) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            req.subscriptionTier = 'free';
            req.isPro = false;
            return next();
        }

        const user = await User.findById(userId);

        if (!user) {
            req.subscriptionTier = 'free';
            req.isPro = false;
            return next();
        }

        req.subscriptionTier = user.subscriptionTier || 'free';
        req.isPro = user.subscriptionTier === 'pro';

        next();
    } catch (error) {
        console.error('Error attaching tier info:', error);
        req.subscriptionTier = 'free';
        req.isPro = false;
        next();
    }
};

/**
 * Check lesson access based on subscription tier
 * - Free tier: Can only access lesson 1 of locked courses
 * - Pro tier: Can access all lessons
 */
const checkLessonAccess = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.courseId;
        const lessonIndex = parseInt(req.params.lessonIndex || req.query.lessonIndex || 0);

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Pro tier has full access
        if (user.subscriptionTier === 'pro') {
            req.hasLessonAccess = true;
            return next();
        }

        // Free tier: Check if enrolled in this course
        const enrollments = await Enrollment.findByUserId(userId);
        const isEnrolled = enrollments.some(e => e.courseId === courseId);

        if (isEnrolled) {
            // Enrolled courses have full access
            req.hasLessonAccess = true;
            return next();
        }

        // Not enrolled: Only allow access to lesson 1 (index 0)
        if (lessonIndex === 0) {
            req.hasLessonAccess = true;
            req.isPreviewOnly = true;
            return next();
        }

        // Free tier trying to access locked lesson
        return res.status(403).json({
            error: 'Lesson locked',
            message: 'Free tier users can only preview lesson 1. Enroll in this course or upgrade to Pro for full access.',
            previewOnly: true
        });
    } catch (error) {
        console.error('Lesson access check error:', error);
        res.status(500).json({ error: 'Error checking lesson access' });
    }
};

module.exports = {
    requireProTier,
    checkCourseAccess,
    attachTierInfo,
    checkLessonAccess
};
