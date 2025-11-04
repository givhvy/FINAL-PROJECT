const { getFirestore } = require('firebase-admin/firestore');
const certificateController = require('./certificateController');

// Check if course is completed and generate certificate
async function checkAndGenerateCertificate(user_id, course_id) {
  try {
    const db = getFirestore();

    // Check if certificate already exists
    const existingCertSnapshot = await db.collection('certificates')
      .where('user_id', '==', user_id)
      .where('course_id', '==', course_id)
      .limit(1)
      .get();

    if (!existingCertSnapshot.empty) {
      return { certificateGenerated: false, alreadyExists: true };
    }

    // Get total lessons for this course
    const lessonsQuery = db.collection('lessons').where('course_id', '==', course_id);
    const lessonsSnapshot = await lessonsQuery.get();
    const totalLessons = lessonsSnapshot.size;

    // Get completed lessons for this user and course
    const progressQuery = db.collection('user_progress')
      .where('user_id', '==', user_id)
      .where('course_id', '==', course_id)
      .where('progress_type', '==', 'lesson_completed');
    const progressSnapshot = await progressQuery.get();
    const completedLessons = progressSnapshot.size;

    // Calculate completion
    let isCompleted = false;
    if (totalLessons > 0) {
      isCompleted = completedLessons >= totalLessons;
    } else {
      // Course has no lessons - consider it complete if user has any progress
      isCompleted = true;
    }

    if (isCompleted) {
      // Generate certificate
      const userDoc = await db.collection('users').doc(user_id).get();
      const courseDoc = await db.collection('courses').doc(course_id).get();

      if (userDoc.exists && courseDoc.exists) {
        const userData = userDoc.data();
        const courseData = courseDoc.data();

        const certificateNumber = `CERT-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        const issuedDate = new Date().toISOString();

        const certificateData = {
          user_id,
          course_id,
          certificate_number: certificateNumber,
          student_name: userData.name,
          course_title: courseData.title,
          instructor_name: courseData.instructor || courseData.instructorName || 'CodeMaster Academy',
          instructor_id: courseData.instructorId || courseData.instructor_id || 'admin',
          completion_date: issuedDate,
          issued_at: issuedDate,
          created_at: issuedDate,
          status: 'issued'
        };

        const newCertificateRef = await db.collection('certificates').add(certificateData);

        // Update enrollment status
        const enrollmentSnapshot = await db.collection('enrollments')
          .where('userId', '==', user_id)
          .where('courseId', '==', course_id)
          .limit(1)
          .get();

        if (!enrollmentSnapshot.empty) {
          const enrollmentDoc = enrollmentSnapshot.docs[0];
          await enrollmentDoc.ref.update({
            status: 'completed',
            completedAt: issuedDate
          });
        }

        console.log(`✅ Certificate auto-generated for user ${userData.name} - Course: ${courseData.title}`);

        return {
          certificateGenerated: true,
          certificateId: newCertificateRef.id,
          certificateData
        };
      }
    }

    return { certificateGenerated: false };
  } catch (error) {
    console.error('Error checking/generating certificate:', error);
    return { certificateGenerated: false, error: error.message };
  }
}

// Mark lesson as complete
exports.markLessonComplete = async (req, res) => {
  try {
    const db = getFirestore();
    const { lesson_id, course_id, user_id } = req.body;

    const progressData = {
      user_id,
      lesson_id,
      course_id,
      completed_at: new Date().toISOString(),
      progress_type: 'lesson_completed'
    };

    const newProgressRef = await db.collection('user_progress').add(progressData);

    // Check if course is completed and generate certificate
    const certificateResult = await checkAndGenerateCertificate(user_id, course_id);

    res.status(201).json({
      id: newProgressRef.id,
      ...progressData,
      ...certificateResult
    });
  } catch (err) {
    console.error("Progress Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Get user progress for a course
exports.getUserProgress = async (req, res) => {
  try {
    const db = getFirestore();
    const { userId, courseId } = req.params;

    const progressRef = db.collection('user_progress');
    const q = progressRef.where('user_id', '==', userId).where('course_id', '==', courseId);
    const snapshot = await q.get();

    const progress = [];
    snapshot.forEach(doc => {
      progress.push({ id: doc.id, ...doc.data() });
    });

    res.json(progress);
  } catch (err) {
    console.error("Get Progress Error:", err);
    res.status(500).json({ error: err.message });
  }
};