// server/controllers/certificateController.js

const { getFirestore } = require('firebase-admin/firestore');

exports.createCertificate = async (req, res) => {
    try {
        const db = getFirestore();
        const certificateData = { ...req.body, issuedAt: new Date().toISOString() };
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
                if (courseSnap.exists()) {
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