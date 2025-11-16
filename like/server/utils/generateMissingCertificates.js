// Utility script to generate certificates for previously completed courses
const { getFirestore } = require('firebase-admin/firestore');

async function generateMissingCertificates() {
  try {
    const db = getFirestore();
    console.log('🔍 Checking for completed courses without certificates...\n');

    // Get all users
    const usersSnapshot = await db.collection('users').get();

    console.log(`Found ${usersSnapshot.size} users to check\n`);

    let generatedCount = 0;
    let skippedCount = 0;
    let totalChecked = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();

      // Get all courses
      const coursesSnapshot = await db.collection('courses').get();

      for (const courseDoc of coursesSnapshot.docs) {
        const courseId = courseDoc.id;
        const courseData = courseDoc.data();

        totalChecked++;
        console.log(`Checking: User ${userData.name} - Course ${courseData.title}`);

      // Check if certificate already exists
      const certSnapshot = await db.collection('certificates')
        .where('user_id', '==', userId)
        .where('course_id', '==', courseId)
        .limit(1)
        .get();

      if (!certSnapshot.empty) {
        console.log(`  ✓ Certificate already exists\n`);
        skippedCount++;
        continue;
      }

      // Check if course is actually completed (100% progress)
      // Get all lessons for the course
      const lessonsSnapshot = await db.collection('lessons')
        .where('course_id', '==', courseId)
        .get();

      const totalLessons = lessonsSnapshot.size;

      if (totalLessons === 0) {
        console.log(`  ⊘ Course has no lessons\n`);
        skippedCount++;
        continue;
      }

      // Get user's completed lessons for this course
      const progressQuery = db.collection('user_progress')
        .where('user_id', '==', userId)
        .where('course_id', '==', courseId)
        .where('progress_type', '==', 'lesson_completed');

      const progressSnapshot = await progressQuery.get();
      const completedLessons = progressSnapshot.size;

      const percentage = Math.round((completedLessons / totalLessons) * 100);
      const isCompleted = completedLessons >= totalLessons;

      if (!isCompleted) {
        console.log(`  ⊘ Course not yet completed (${completedLessons}/${totalLessons} lessons = ${percentage}%)\n`);
        skippedCount++;
        continue;
      }

      console.log(`  ✓ Course COMPLETED (${completedLessons}/${totalLessons} lessons = 100%)`);

      // Generate certificate
      const certificateNumber = `CERT-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const issuedDate = new Date().toISOString();

      const certificateData = {
        user_id: userId,
        course_id: courseId,
        certificate_number: certificateNumber,
        student_name: userData.name,
        course_title: courseData.title,
        instructor_name: courseData.instructor || courseData.instructorName || 'CodeMaster Academy',
        instructor_id: courseData.instructorId || courseData.instructor_id || 'admin',
        completion_date: issuedDate,
        issued_at: issuedDate,
        created_at: new Date().toISOString(),
        status: 'issued'
      };

      await db.collection('certificates').add(certificateData);

      // Update enrollment status to completed
      const enrollmentSnapshot = await db.collection('enrollments')
        .where('userId', '==', userId)
        .where('courseId', '==', courseId)
        .limit(1)
        .get();

      if (!enrollmentSnapshot.empty) {
        const enrollmentDoc = enrollmentSnapshot.docs[0];
        await enrollmentDoc.ref.update({
          status: 'completed',
          completedAt: issuedDate
        });
      }

      console.log(`  ✓ Generated certificate ${certificateNumber} for "${courseData.title}"\n`);
      generatedCount++;

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    console.log('\n═══════════════════════════════════════');
    console.log('📊 Summary:');
    console.log(`   ℹ Total Checked: ${totalChecked} course-user combinations`);
    console.log(`   ✓ Generated: ${generatedCount} certificates`);
    console.log(`   ⊘ Skipped: ${skippedCount} (already exist or not completed)`);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error generating certificates:', error);
  }
}

module.exports = { generateMissingCertificates };
