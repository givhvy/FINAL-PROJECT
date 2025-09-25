const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

router.get('/api/certificates', certificateController.getCertificates);
router.post('/api/certificates', certificateController.createCertificate);
router.get('/api/certificates/:id', certificateController.getCertificateById);
router.put('/api/certificates/:id', certificateController.updateCertificate);
router.delete('/api/certificates/:id', certificateController.deleteCertificate);

module.exports = router; 