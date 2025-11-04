const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { generateMissingCertificates } = require('../utils/generateMissingCertificates');

// Certificate routes
router.get('/', certificateController.getCertificates);
router.post('/', certificateController.createCertificate);
router.post('/generate', certificateController.generateCertificate);
router.post('/generate-missing', async (req, res) => {
    try {
        await generateMissingCertificates();
        res.json({ success: true, message: 'Missing certificates generated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/debug-enrollments', async (req, res) => {
    try {
        const { getFirestore } = require('firebase-admin/firestore');
        const db = getFirestore();

        const enrollmentsSnapshot = await db.collection('enrollments').get();
        const enrollments = [];
        enrollmentsSnapshot.forEach(doc => {
            enrollments.push({ id: doc.id, ...doc.data() });
        });

        res.json({
            count: enrollments.length,
            enrollments: enrollments.slice(0, 5) // Return first 5 as sample
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/user/:userId', certificateController.getUserCertificates);
router.get('/verify/:certificateNumber', certificateController.verifyCertificate);
router.get('/:id/download', certificateController.downloadCertificatePDF);
router.get('/:id', certificateController.getCertificateById);
router.put('/:id', certificateController.updateCertificate);
router.delete('/:id', certificateController.deleteCertificate);

module.exports = router;