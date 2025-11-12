// server/controllers/certificateController.js

const Certificate = require('../models/Certificate');
const puppeteer = require('puppeteer'); // xài cho tạo PDF ngay trên browser rồi download dưới dạng html qua PDF cho browser về 

// Auto-generate certificate on course completion
exports.generateCertificate = async (req, res) => {
    try {
        const { user_id, course_id } = req.body;

        if (!user_id || !course_id) {
            return res.status(400).json({ error: 'user_id and course_id are required' });
        }

        // Use Certificate model to generate
        const certificate = await Certificate.generate(user_id, course_id);

        res.status(201).json({
            success: true,
            message: 'Certificate generated successfully',
            certificate
        });
    } catch (error) {
        console.error('Error generating certificate:', error);

        if (error.message.includes('not completed') || error.message.includes('not found')) {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to generate certificate' });
    }
};

// Create certificate (manual)
exports.createCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.generate(req.body.userId, req.body.courseId);
        res.status(201).json({ success: true, certificate });
    } catch (error) {
        console.error('Error creating certificate:', error);
        res.status(400).json({ error: error.message });
    }
};

// Get all certificates (admin/teacher)
exports.getCertificates = async (req, res) => {
    try {
        const { userId, courseId } = req.query;

        let certificates;
        if (userId) {
            certificates = await Certificate.findByUser(userId);
        } else if (courseId) {
            certificates = await Certificate.findByCourse(courseId);
        } else {
            // Fetch all certificates for admin/teacher dashboard
            const db = Certificate.getDB();
            const snapshot = await db.collection('certificates').get();

            certificates = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort by issued date descending
            certificates.sort((a, b) => {
                const dateA = a.issuedAt?.toDate?.() || a.issuedAt || a.issued_at?.toDate?.() || a.issued_at || new Date(0);
                const dateB = b.issuedAt?.toDate?.() || b.issuedAt || b.issued_at?.toDate?.() || b.issued_at || new Date(0);
                return dateB - dateA;
            });
        }

        res.status(200).json(certificates);
    } catch (error) {
        console.error('Error fetching certificates:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get certificate by ID
exports.getCertificateById = async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id);
        res.status(200).json(certificate);
    } catch (error) {
        console.error('Error fetching certificate:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

// Update certificate (Update in Controller)
exports.updateCertificate = async (req, res) => {
    try {
        // Certificates shouldn't be updated after issuance
        // But allow revoking
        res.status(403).json({ error: 'Certificates cannot be modified after issuance. Use revoke instead.' });
    } catch (error) {
        console.error('Error updating certificate:', error);
        res.status(400).json({ error: error.message });
    }
};

// Delete certificate
exports.deleteCertificate = async (req, res) => {
    try {
        await Certificate.delete(req.params.id);
        res.status(200).json({ message: 'Certificate deleted successfully' });
    } catch (error) {
        console.error('Error deleting certificate:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

// Get user's certificates
exports.getUserCertificates = async (req, res) => {
    try {
        const { userId } = req.params;
        const certificates = await Certificate.findByUser(userId);
        res.status(200).json(certificates);
    } catch (error) {
        console.error('Error fetching user certificates:', error);
        res.status(500).json({ error: error.message });
    }
};

// Verify certificate
exports.verifyCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;
        const certificate = await Certificate.verify(certificateId);

        res.status(200).json({
            valid: true,
            certificate
        });
    } catch (error) {
        console.error('Error verifying certificate:', error);
        res.status(404).json({
            valid: false,
            error: error.message
        });
    }
};

// Revoke certificate
exports.revokeCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.revoke(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Certificate revoked successfully',
            certificate
        });
    } catch (error) {
        console.error('Error revoking certificate:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

// Download certificate as PDF
exports.downloadCertificatePDF = async (req, res) => {
    try {
        const { certificateId } = req.params;
        const certificate = await Certificate.verify(certificateId);

        // Generate PDF using puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Set page size to A4 landscape
        await page.setViewport({ width: 1122, height: 794 });

        // Generate HTML content for certificate
        const htmlContent = generateCertificateHTML(certificate);

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        await browser.close();

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificateId}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};

// Helper function to generate certificate HTML
function generateCertificateHTML(certificate) {
    const issueDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
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
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Georgia', serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                padding: 20px;
            }
            .certificate {
                background: white;
                width: 1000px;
                padding: 60px;
                border: 20px solid #667eea;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                position: relative;
            }
            .certificate::before {
                content: '';
                position: absolute;
                top: 10px;
                left: 10px;
                right: 10px;
                bottom: 10px;
                border: 2px solid #764ba2;
            }
            .header {
                text-align: center;
                margin-bottom: 40px;
            }
            .title {
                font-size: 48px;
                color: #667eea;
                font-weight: bold;
                letter-spacing: 3px;
                margin-bottom: 10px;
            }
            .subtitle {
                font-size: 20px;
                color: #666;
                font-style: italic;
            }
            .content {
                text-align: center;
                margin: 40px 0;
            }
            .awarded-to {
                font-size: 18px;
                color: #666;
                margin-bottom: 15px;
            }
            .recipient-name {
                font-size: 42px;
                color: #333;
                font-weight: bold;
                margin: 20px 0;
                border-bottom: 3px solid #667eea;
                display: inline-block;
                padding: 10px 40px;
            }
            .course-info {
                font-size: 20px;
                color: #666;
                margin: 30px 0;
                line-height: 1.6;
            }
            .course-name {
                font-size: 28px;
                color: #667eea;
                font-weight: bold;
                margin: 10px 0;
            }
            .footer {
                display: flex;
                justify-content: space-between;
                margin-top: 60px;
                padding-top: 30px;
                border-top: 2px solid #eee;
            }
            .signature-block {
                text-align: center;
                flex: 1;
            }
            .signature-line {
                width: 250px;
                border-top: 2px solid #333;
                margin: 40px auto 10px;
            }
            .signature-label {
                font-size: 14px;
                color: #666;
            }
            .date {
                text-align: center;
                margin-top: 20px;
                font-size: 16px;
                color: #666;
            }
            .certificate-id {
                text-align: center;
                margin-top: 30px;
                font-size: 12px;
                color: #999;
                font-family: 'Courier New', monospace;
            }
            .seal {
                position: absolute;
                bottom: 60px;
                right: 80px;
                width: 120px;
                height: 120px;
                border: 3px solid #667eea;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: white;
            }
            .seal-text {
                text-align: center;
                font-size: 14px;
                font-weight: bold;
                color: #667eea;
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="header">
                <div class="title">CERTIFICATE OF COMPLETION</div>
                <div class="subtitle">This certifies that</div>
            </div>

            <div class="content">
                <div class="recipient-name">${certificate.userName}</div>

                <div class="course-info">
                    has successfully completed the course
                </div>

                <div class="course-name">${certificate.courseName}</div>

                ${certificate.grade ? `<div class="course-info">with a final grade of ${certificate.grade}%</div>` : ''}
            </div>

            <div class="date">
                Issued on ${issueDate}
            </div>

            <div class="footer">
                <div class="signature-block">
                    <div class="signature-line"></div>
                    <div class="signature-label">Instructor Signature</div>
                </div>
                <div class="signature-block">
                    <div class="signature-line"></div>
                    <div class="signature-label">Administrator Signature</div>
                </div>
            </div>

            <div class="certificate-id">
                Certificate ID: ${certificate.certificateId}
            </div>

            <div class="seal">
                <div class="seal-text">
                    VERIFIED<br>
                    CERTIFICATE
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

module.exports = exports;
