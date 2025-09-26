const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

// SỬA LẠI: Bỏ '/api/certificates' khỏi các đường dẫn
router.get('/', certificateController.getCertificates);
router.post('/', certificateController.createCertificate);
router.get('/:id', certificateController.getCertificateById);
router.put('/:id', certificateController.updateCertificate);
router.delete('/:id', certificateController.deleteCertificate);

module.exports = router;