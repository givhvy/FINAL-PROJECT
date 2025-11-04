// server/controllers/certificateController.js

const { getFirestore } = require('firebase-admin/firestore');
const puppeteer = require('puppeteer');

// Generate certificate number
const generateCertificateNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CERT-${timestamp}-${random}`;
};

// Check if course is completed
exports.checkCourseCompletion = async (userId, courseId) => {
    try {
        const db = getFirestore();

        // Get all lessons for the course
        const lessonsSnapshot = await db.collection('lessons')
            .where('course_id', '==', courseId)
            .get();

        if (lessonsSnapshot.empty) {
            return { completed: false, message: 'No lessons found for this course' };
        }

        const totalLessons = lessonsSnapshot.size;

        // Get user's completed lessons for this course
        const progressSnapshot = await db.collection('user_progress')
            .where('user_id', '==', userId)
            .where('course_id', '==', courseId)
            .where('progress_type', '==', 'lesson_completed')
            .get();

        const completedLessons = progressSnapshot.size;

        // Check if all lessons are completed
        const allLessonsCompleted = completedLessons >= totalLessons;

        // Check quiz completion (optional but recommended)
        const quizzesSnapshot = await db.collection('quizzes')
            .where('courseId', '==', courseId)
            .where('isPublished', '==', true)
            .get();

        let allQuizzesPassed = true;
        if (!quizzesSnapshot.empty) {
            const quizIds = quizzesSnapshot.docs.map(doc => doc.id);

            for (const quizId of quizIds) {
                const gradeSnapshot = await db.collection('grades')
                    .where('user_id', '==', userId)
                    .where('quiz_id', '==', quizId)
                    .get();

                if (gradeSnapshot.empty) {
                    allQuizzesPassed = false;
                    break;
                }

                // Check if passed (assuming passing score is stored in grade)
                const grade = gradeSnapshot.docs[0].data();
                if (grade.score < grade.passing_score) {
                    allQuizzesPassed = false;
                    break;
                }
            }
        }

        const completed = allLessonsCompleted && allQuizzesPassed;

        return {
            completed,
            totalLessons,
            completedLessons,
            allQuizzesPassed,
            message: completed ? 'Course completed' : 'Course not yet completed'
        };
    } catch (error) {
        console.error('Error checking course completion:', error);
        throw error;
    }
};

// Auto-generate certificate on course completion
exports.generateCertificate = async (req, res) => {
    try {
        const db = getFirestore();
        const { user_id, course_id } = req.body;

        if (!user_id || !course_id) {
            return res.status(400).json({ error: 'user_id and course_id are required' });
        }

        // Check if certificate already exists
        const existingCertSnapshot = await db.collection('certificates')
            .where('user_id', '==', user_id)
            .where('course_id', '==', course_id)
            .limit(1)
            .get();

        if (!existingCertSnapshot.empty) {
            return res.status(400).json({
                error: 'Certificate already exists for this user and course',
                certificate: { id: existingCertSnapshot.docs[0].id, ...existingCertSnapshot.docs[0].data() }
            });
        }

        // Check course completion
        const completion = await exports.checkCourseCompletion(user_id, course_id);

        if (!completion.completed) {
            return res.status(400).json({
                error: 'Course not completed yet',
                completion
            });
        }

        // Get user data
        const userDoc = await db.collection('users').doc(user_id).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userData = userDoc.data();

        // Get course data
        const courseDoc = await db.collection('courses').doc(course_id).get();
        if (!courseDoc.exists) {
            return res.status(404).json({ error: 'Course not found' });
        }
        const courseData = courseDoc.data();

        // Create certificate data
        const certificateNumber = generateCertificateNumber();
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

        // Save certificate to database
        const newCertificateRef = await db.collection('certificates').add(certificateData);

        // Update enrollment status to completed
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

        res.status(201).json({
            id: newCertificateRef.id,
            ...certificateData,
            message: 'Certificate generated successfully'
        });
    } catch (err) {
        console.error('Error generating certificate:', err);
        res.status(500).json({ error: err.message });
    }
};

// Manual certificate creation (admin only)
exports.createCertificate = async (req, res) => {
    try {
        const db = getFirestore();
        const certificateData = {
            ...req.body,
            issued_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            certificate_number: generateCertificateNumber(),
            status: 'issued'
        };
        const newCertificateRef = await db.collection('certificates').add(certificateData);
        res.status(201).json({ id: newCertificateRef.id, ...certificateData });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getCertificates = async (req, res) => {
    try {
        const db = getFirestore();
        const certificatesSnapshot = await db.collection('certificates').get();

        const certificates = await Promise.all(certificatesSnapshot.docs.map(async (certDoc) => {
            const certData = certDoc.data();
            let userData = null;
            let courseData = null;

            if (certData.user_id) {
                const userSnap = await db.collection('users').doc(certData.user_id).get();
                if (userSnap.exists) {
                    userData = { id: userSnap.id, ...userSnap.data() };
                    delete userData.password;
                }
            }

            if (certData.course_id) {
                const courseSnap = await db.collection('courses').doc(certData.course_id).get();
                if (courseSnap.exists) {
                    courseData = { id: courseSnap.id, ...courseSnap.data() };
                }
            }
          
            return {
                id: certDoc.id,
                ...certData,
                user: userData,
                course: courseData,
            };
        }));
        res.status(200).json(certificates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCertificateById = async (req, res) => {
    try {
        const db = getFirestore();
        const certRef = db.collection('certificates').doc(req.params.id);
        const certSnap = await certRef.get();

        if (!certSnap.exists) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        const certData = certSnap.data();
        let userData = null;
        let courseData = null;

        if (certData.user_id) {
            const userSnap = await db.collection('users').doc(certData.user_id).get();
            if (userSnap.exists) {
                userData = { id: userSnap.id, ...userSnap.data() };
                delete userData.password;
            }
        }

        if (certData.course_id) {
            const courseSnap = await db.collection('courses').doc(certData.course_id).get();
            if (courseSnap.exists) {
                courseData = { id: courseSnap.id, ...courseSnap.data() };
            }
        }

        res.status(200).json({
            id: certSnap.id,
            ...certData,
            user: userData,
            course: courseData,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCertificate = async (req, res) => {
    try {
        const db = getFirestore();
        const docRef = db.collection('certificates').doc(req.params.id);
        await docRef.update(req.body);
        res.status(200).json({ id: req.params.id, ...req.body });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteCertificate = async (req, res) => {
    try {
        const db = getFirestore();
        const docRef = db.collection('certificates').doc(req.params.id);
        await docRef.delete();
        res.status(200).json({ message: 'Certificate deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get certificates by user ID
exports.getUserCertificates = async (req, res) => {
    try {
        const db = getFirestore();
        const userId = req.params.userId;

        const certificatesSnapshot = await db.collection('certificates')
            .where('user_id', '==', userId)
            .get();

        const certificates = await Promise.all(certificatesSnapshot.docs.map(async (certDoc) => {
            const certData = certDoc.data();
            let courseData = null;

            if (certData.course_id) {
                const courseSnap = await db.collection('courses').doc(certData.course_id).get();
                if (courseSnap.exists) {
                    courseData = { id: courseSnap.id, ...courseSnap.data() };
                }
            }

            return {
                id: certDoc.id,
                ...certData,
                course: courseData
            };
        }));

        res.status(200).json(certificates);
    } catch (err) {
        console.error('Error fetching user certificates:', err);
        res.status(500).json({ error: err.message });
    }
};

// Verify certificate by certificate number
exports.verifyCertificate = async (req, res) => {
    try {
        const db = getFirestore();
        const { certificateNumber } = req.params;

        const certificatesSnapshot = await db.collection('certificates')
            .where('certificate_number', '==', certificateNumber)
            .limit(1)
            .get();

        if (certificatesSnapshot.empty) {
            return res.status(404).json({
                valid: false,
                message: 'Certificate not found'
            });
        }

        const certDoc = certificatesSnapshot.docs[0];
        const certData = certDoc.data();

        // Get associated user and course data
        let userData = null;
        let courseData = null;

        if (certData.user_id) {
            const userSnap = await db.collection('users').doc(certData.user_id).get();
            if (userSnap.exists) {
                userData = { id: userSnap.id, ...userSnap.data() };
                delete userData.password;
            }
        }

        if (certData.course_id) {
            const courseSnap = await db.collection('courses').doc(certData.course_id).get();
            if (courseSnap.exists) {
                courseData = { id: courseSnap.id, ...courseSnap.data() };
            }
        }

        res.status(200).json({
            valid: true,
            certificate: {
                id: certDoc.id,
                ...certData,
                user: userData,
                course: courseData
            }
        });
    } catch (err) {
        console.error('Error verifying certificate:', err);
        res.status(500).json({ error: err.message });
    }
};

// Generate certificate HTML template
const generateCertificateHTML = (certData) => {
    const completionDate = new Date(certData.completion_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Montserrat:wght@300;400;600&display=swap');

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Montserrat', sans-serif;
                width: 1200px;
                height: 850px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .certificate {
                width: 100%;
                height: 100%;
                background: white;
                background-image: radial-gradient(#e6f0ff 2px, transparent 2px);
                background-size: 30px 30px;
                border: 20px solid transparent;
                border-image: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899) 1;
                padding: 60px;
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }

            .top-decoration {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 80px;
                background: linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
            }

            .bottom-decoration {
                position: absolute;
                bottom: 0;
                right: 0;
                width: 100%;
                height: 80px;
                background: linear-gradient(to left, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
            }

            .content {
                text-align: center;
                z-index: 10;
            }

            .icon {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
            }

            .icon svg {
                width: 100%;
                height: 100%;
                fill: #3b82f6;
            }

            .subtitle {
                font-size: 20px;
                letter-spacing: 8px;
                text-transform: uppercase;
                color: #6b7280;
                margin-bottom: 15px;
            }

            .title {
                font-family: 'Playfair Display', serif;
                font-size: 56px;
                font-weight: 700;
                background: linear-gradient(45deg, #3b82f6, #8b5cf6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 30px;
            }

            .presented-to {
                font-size: 18px;
                color: #6b7280;
                margin-bottom: 15px;
            }

            .student-name {
                font-family: 'Playfair Display', serif;
                font-size: 52px;
                font-weight: 700;
                color: #1e3a8a;
                margin-bottom: 30px;
                padding: 0 40px;
            }

            .completed-text {
                font-size: 18px;
                color: #6b7280;
                margin-bottom: 20px;
            }

            .course-title {
                font-family: 'Playfair Display', serif;
                font-size: 36px;
                font-weight: 600;
                color: #1e40af;
                margin-bottom: 30px;
            }

            .date {
                font-size: 18px;
                color: #6b7280;
                margin-bottom: 50px;
            }

            .signatures {
                display: flex;
                justify-content: center;
                gap: 100px;
                margin-top: 40px;
            }

            .signature-block {
                text-align: center;
            }

            .signature-line {
                font-family: 'Pacifico', cursive;
                font-size: 28px;
                color: #1e40af;
                margin-bottom: 10px;
            }

            .signature-border {
                width: 200px;
                height: 2px;
                background: #9ca3af;
                margin: 0 auto 10px;
            }

            .signature-label {
                font-size: 14px;
                color: #6b7280;
            }

            .seal {
                position: absolute;
                bottom: 60px;
                right: 80px;
                width: 150px;
                height: 150px;
            }

            .certificate-number {
                position: absolute;
                bottom: 30px;
                left: 80px;
                font-size: 12px;
                color: #9ca3af;
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="top-decoration"></div>
            <div class="bottom-decoration"></div>

            <div class="content">
                <div class="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
                        <path d="M9.999 13.587L7.7 11.292l-1.412 1.416 3.713 3.705 6.706-6.706-1.414-1.414z"/>
                    </svg>
                </div>

                <div class="subtitle">Certificate of Completion</div>
                <div class="title">Achievement Award</div>
                <div class="presented-to">This certifies that</div>
                <div class="student-name">${certData.student_name}</div>
                <div class="completed-text">has successfully completed the course</div>
                <div class="course-title">${certData.course_title}</div>
                <div class="date">${completionDate}</div>

                <div class="signatures">
                    <div class="signature-block">
                        <div class="signature-line">${certData.instructor_name}</div>
                        <div class="signature-border"></div>
                        <div class="signature-label">Course Instructor</div>
                    </div>
                    <div class="signature-block">
                        <div class="signature-line">Program Director</div>
                        <div class="signature-border"></div>
                        <div class="signature-label">CodeMaster Academy</div>
                    </div>
                </div>
            </div>

            <svg class="seal" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" stroke-width="3"/>
                <circle cx="50" cy="50" r="38" fill="none" stroke="#8b5cf6" stroke-width="2"/>
                <path d="M50,15 L53,25 L63,25 L55,32 L58,42 L50,36 L42,42 L45,32 L37,25 L47,25 Z" fill="#3b82f6"/>
                <text x="50" y="62" text-anchor="middle" font-family="Montserrat" font-size="10" fill="#1e3a8a" font-weight="600">VERIFIED</text>
                <text x="50" y="74" text-anchor="middle" font-family="Montserrat" font-size="8" fill="#1e3a8a">AUTHENTIC</text>
            </svg>

            <div class="certificate-number">
                Certificate No: ${certData.certificate_number}
            </div>
        </div>
    </body>
    </html>
    `;
};

// Download certificate as PDF
exports.downloadCertificatePDF = async (req, res) => {
    try {
        const db = getFirestore();
        const certRef = db.collection('certificates').doc(req.params.id);
        const certSnap = await certRef.get();

        if (!certSnap.exists) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        const certData = certSnap.data();

        // Generate HTML
        const html = generateCertificateHTML(certData);

        // Launch puppeteer
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Generate PDF
        const pdf = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: {
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px'
            }
        });

        await browser.close();

        // Send PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=certificate-${certData.certificate_number}.pdf`);
        res.send(pdf);
    } catch (err) {
        console.error('Error generating PDF:', err);
        res.status(500).json({ error: err.message });
    }
};