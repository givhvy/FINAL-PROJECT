// ============================================================================
// FILE NÀY LÀM GÌ? (What does this file do?)
// ============================================================================
// File này là CERTIFICATE CONTROLLER - điều khiển tất cả thao tác liên quan đến CHỨNG CHỈ (certificates)
//
// Giống như văn phòng cấp bằng/chứng chỉ, file này:
// ✅ Tự động tạo chứng chỉ khi học viên hoàn thành khóa học (generateCertificate)
// ✅ Tạo chứng chỉ thủ công (createCertificate)
// ✅ Lấy danh sách chứng chỉ - filter theo user/course (getCertificates)
// ✅ Lấy 1 chứng chỉ cụ thể (getCertificateById)
// ✅ Cập nhật chứng chỉ - KHÔNG CHO PHÉP! (updateCertificate)
// ✅ Xóa chứng chỉ (deleteCertificate)
// ✅ Lấy chứng chỉ của 1 user (getUserCertificates)
// ✅ Xác minh chứng chỉ có hợp lệ không (verifyCertificate)
// ✅ Thu hồi chứng chỉ (revokeCertificate)
// ✅ Download chứng chỉ dưới dạng PDF (downloadCertificatePDF)

// ============================================================================
// FLOW: FRONTEND → ROUTES → CONTROLLER → MODEL → DATABASE
// ============================================================================
//
// VÍ DỤ 1: HỌC VIÊN HOÀN THÀNH KHÓA HỌC → TỰ ĐỘNG TẠO CHỨNG CHỈ
// ┌─────────────────────────────────────────────────────────────────────┐
// │ BƯỚC 1: USER HOÀN THÀNH KHÓA HỌC                                    │
// │ - User học xong tất cả lessons                                      │
// │ - User làm xong quiz và đạt điểm yêu cầu                           │
// │ - Progress đạt 100%                                                 │
// └─────────────────────────────────────────────────────────────────────┘
//                                  ↓
// ┌─────────────────────────────────────────────────────────────────────┐
// │ BƯỚC 2: FRONTEND (file: views/pages/mylearning.ejs)                │
// │ Khi user hoàn thành, frontend tự động gọi API tạo certificate       │
// │                                                                      │
// │ JavaScript code:                                                     │
// │   fetch('/api/certificates/generate', {                             │
// │     method: 'POST',                                                 │
// │     headers: {                                                      │
// │       'Content-Type': 'application/json',                           │
// │       'Authorization': 'Bearer ' + token                            │
// │     },                                                              │
// │     body: JSON.stringify({                                          │
// │       user_id: 'user123',                                           │
// │       course_id: 'course456'                                        │
// │     })                                                              │
// │   })                                                                │
// └─────────────────────────────────────────────────────────────────────┘
//                                  ↓
// ┌─────────────────────────────────────────────────────────────────────┐
// │ BƯỚC 3: ROUTES (file: routes/certificateRoutes.js)                 │
// │   router.post('/certificates/generate',                             │
// │     authMiddleware,                                                 │
// │     generateCertificate  ← Gọi function trong file NÀY             │
// │   );                                                                │
// └─────────────────────────────────────────────────────────────────────┘
//                                  ↓
// ┌─────────────────────────────────────────────────────────────────────┐
// │ BƯỚC 4: CONTROLLER (file NÀY - certificateController.js)           │
// │ Function generateCertificate() xử lý:                               │
// │   - Validate user_id, course_id                                     │
// │   - Gọi Model để tạo certificate                                   │
// │                                                                      │
// │ Code (dòng 16):                                                     │
// │   const certificate = await Certificate.generate(user_id, course_id); │
// │                                        ↑ GỌI MODEL!                 │
// └─────────────────────────────────────────────────────────────────────┘
//                                  ↓
// ┌─────────────────────────────────────────────────────────────────────┐
// │ BƯỚC 5: MODEL (file: models/Certificate.js)                        │
// │ Certificate.generate() làm gì?                                      │
// │   1. Kiểm tra user đã hoàn thành course chưa (progress, quiz)      │
// │   2. Tạo unique certificate ID                                      │
// │   3. Lưu vào Firestore collection "certificates"                   │
// │   4. Return certificate object                                      │
// └─────────────────────────────────────────────────────────────────────┘
//                                  ↓
// ┌─────────────────────────────────────────────────────────────────────┐
// │ BƯỚC 6: DATABASE (Firebase Firestore)                              │
// │ Document mới trong collection "certificates":                       │
// │ {                                                                   │
// │   id: "cert-abc123",                                               │
// │   user_id: "user123",                                              │
// │   course_id: "course456",                                          │
// │   userName: "Nguyễn Văn A",                                        │
// │   courseName: "JavaScript Từ Cơ Bản Đến Nâng Cao",                │
// │   certificateId: "CERT-2024-ABC123",                               │
// │   issuedAt: Timestamp(2024-01-15),                                 │
// │   grade: 95                                                        │
// │ }                                                                   │
// └─────────────────────────────────────────────────────────────────────┘
//
// VÍ DỤ 2: DOWNLOAD CERTIFICATE DƯỚI DẠNG PDF
// Frontend: User click nút "Download Certificate"
//   → fetch('/api/certificates/:certificateId/download')
//    ↓
// Routes: router.get('/certificates/:certificateId/download', downloadCertificatePDF)
//    ↓
// Controller (file này):
//   1. Verify certificate tồn tại
//   2. Sử dụng PUPPETEER (headless browser) để:
//      - Tạo HTML template cho certificate (với CSS đẹp)
//      - Render HTML trong browser ảo
//      - Chụp thành PDF
//   3. Gửi PDF file về client để download
//    ↓
// Model: Certificate.verify() kiểm tra certificate hợp lệ
//
// ============================================================================
// KHÁI NIỆM: PUPPETEER LÀ GÌ?
// ============================================================================
// PUPPETEER = Thư viện Node.js điều khiển Chrome/Chromium (headless browser - browser không giao diện)
//
// Dùng để làm gì?
// ✅ Tạo PDF từ HTML/CSS (như in trang web thành PDF)
// ✅ Chụp screenshot trang web
// ✅ Test automation (tự động test website)
// ✅ Scrape data từ websites
//
// Trong file này: Dùng để tạo PDF certificate từ HTML template
// - Tạo HTML với CSS đẹp (giống design certificate thật)
// - Puppeteer mở browser ảo, load HTML, render thành PDF
// - Gửi PDF về client
//
// Giống như: In 1 trang web thành PDF trong trình duyệt, nhưng tự động bằng code

// ============================================================================
// GIẢI THÍCH CODE TỪNG DÒNG
// ============================================================================

// server/controllers/certificateController.js

// DÒNG 1-2: Import các modules cần thiết
const Certificate = require('../models/Certificate');
// - Import Certificate Model để gọi các methods: generate(), findById(), verify(), v.v.

const puppeteer = require('puppeteer'); // xài cho tạo PDF ngay trên browser rồi download dưới dạng html qua PDF cho browser về
// - `puppeteer` = thư viện điều khiển headless browser
// - `require('puppeteer')` = import package puppeteer (đã cài qua npm install)
// - Dùng để: Convert HTML → PDF cho certificate download

// ============================================================================
// FUNCTION 1: TỰ ĐỘNG TẠO CHỨNG CHỈ KHI HOÀN THÀNH KHÓA HỌC
// ============================================================================
// Auto-generate certificate on course completion
exports.generateCertificate = async (req, res) => {
// - `exports.generateCertificate` = cách KHÁC để export function
//   + Tương đương: module.exports = { generateCertificate: async (req, res) => {} }
//   + Viết gọn hơn khi export nhiều functions
// - `async` = hàm bất đồng bộ
    try {
        const { user_id, course_id } = req.body;
        // - Lấy user_id và course_id từ request body
        // - Client gửi lên: { user_id: '...', course_id: '...' }

        if (!user_id || !course_id) {
        // - Validate: Cả 2 fields đều bắt buộc
            return res.status(400).json({ error: 'user_id and course_id are required' });
            // - `400` = Bad Request - thiếu dữ liệu
        }

        // Use Certificate model to generate
        const certificate = await Certificate.generate(user_id, course_id);
        // - `Certificate.generate()` = gọi Model để tạo certificate
        //   + GỌI MODEL! ⭐
        // - Model sẽ:
        //   + Kiểm tra user đã hoàn thành course chưa
        //   + Tạo certificate ID unique
        //   + Lưu vào Firestore
        //   + Return certificate object

        res.status(201).json({
        // - `201` = Created - resource mới được tạo thành công
            success: true,
            message: 'Certificate generated successfully',
            certificate
            // - `certificate` = shorthand cho `certificate: certificate`
        });
    } catch (error) {
    // - Bắt lỗi nếu có vấn đề (user chưa hoàn thành, course không tồn tại, v.v.)
        console.error('Error generating certificate:', error);

        if (error.message.includes('not completed') || error.message.includes('not found')) {
        // - `error.message.includes('...')` = kiểm tra xem error message có chứa text không
        // - `.includes()` = method của string, kiểm tra substring
        // - Nếu lỗi là "not completed" hoặc "not found" → 400 (Bad Request)
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to generate certificate' });
        // - Các lỗi khác → 500 (Server Error)
    }
};

// ============================================================================
// FUNCTION 2: TẠO CHỨNG CHỈ THỦ CÔNG (MANUAL CREATE)
// ============================================================================
// Create certificate (manual)
exports.createCertificate = async (req, res) => {
// - Tương tự generateCertificate nhưng dùng userId/courseId (camelCase)
// - Dùng cho admin tạo certificate thủ công

    try {
        const certificate = await Certificate.generate(req.body.userId, req.body.courseId);
        // - GỌI MODEL! ⭐
        // - `req.body.userId` = lấy trực tiếp từ req.body (không destructure)
        res.status(201).json({ success: true, certificate });
    } catch (error) {
        console.error('Error creating certificate:', error);
        res.status(400).json({ error: error.message });
        // - Tất cả lỗi đều trả 400
    }
};

// ============================================================================
// FUNCTION 3: LẤY DANH SÁCH CHỨNG CHỈ (GET ALL CERTIFICATES)
// ============================================================================
// Get all certificates (admin/teacher)
exports.getCertificates = async (req, res) => {
// - Function này có 3 modes:
//   + Nếu có userId trong query → lấy certificates của 1 user
//   + Nếu có courseId trong query → lấy certificates của 1 course
//   + Nếu không có gì → lấy TẤT CẢ certificates (admin dashboard)

    try {
        const { userId, courseId } = req.query;
        // - `req.query` = URL query params
        // - Ví dụ: /api/certificates?userId=abc123 → req.query = { userId: 'abc123' }

        let certificates;
        // - `let` = biến có thể thay đổi giá trị
        // - Sẽ được gán giá trị khác nhau tùy theo điều kiện

        if (userId) {
        // - Nếu có userId → lấy certificates của user đó
            certificates = await Certificate.findByUser(userId);
            // - GỌI MODEL! ⭐
        } else if (courseId) {
        // - `else if` = nếu không phải điều kiện trên, kiểm tra điều kiện này
        // - Nếu có courseId → lấy certificates của course đó
            certificates = await Certificate.findByCourse(courseId);
            // - GỌI MODEL! ⭐
        } else {
        // - `else` = nếu không có userId và courseId → lấy TẤT CẢ
            // Fetch all certificates for admin/teacher dashboard
            const db = Certificate.getDB();
            // - `Certificate.getDB()` = lấy Firestore database instance từ Model
            // - GỌI MODEL! ⭐
            const snapshot = await db.collection('certificates').get();
            // - `db.collection('certificates')` = truy cập collection "certificates"
            // - `.get()` = lấy tất cả documents trong collection
            // - `snapshot` = object chứa kết quả query

            certificates = snapshot.docs.map(doc => ({
            // - `snapshot.docs` = array các documents
            // - `.map()` = duyệt qua từng doc, transform thành format mới
            // - `doc =>` = arrow function nhận mỗi document
                id: doc.id,
                // - `doc.id` = ID của document trong Firestore
                ...doc.data()
                // - `...` = SPREAD OPERATOR - giải nén tất cả properties của doc.data()
                // - `doc.data()` = lấy data của document (không bao gồm id)
                // - Kết quả: { id: '...', userName: '...', courseName: '...', ... }
            }));

            // Sort by issued date descending
            certificates.sort((a, b) => {
            // - `.sort()` = method của array, sắp xếp array
            // - `(a, b) =>` = compare function nhận 2 phần tử
            // - Nếu return < 0 → a trước b
            // - Nếu return > 0 → b trước a
            // - Nếu return = 0 → giữ nguyên thứ tự
                const dateA = a.issuedAt?.toDate?.() || a.issuedAt || a.issued_at?.toDate?.() || a.issued_at || new Date(0);
                // - Lấy ngày issue của certificate A
                // - `a.issuedAt?.toDate?.()` = optional chaining kép:
                //   + Nếu issuedAt tồn tại VÀ có method toDate() → gọi toDate()
                //   + Nếu không → undefined
                // - `||` = OR chain - thử lần lượt các options:
                //   1. a.issuedAt?.toDate?.() - Firestore Timestamp (camelCase)
                //   2. a.issuedAt - JavaScript Date object (camelCase)
                //   3. a.issued_at?.toDate?.() - Firestore Timestamp (snake_case)
                //   4. a.issued_at - JavaScript Date object (snake_case)
                //   5. new Date(0) - default (1970-01-01) nếu không có gì
                const dateB = b.issuedAt?.toDate?.() || b.issuedAt || b.issued_at?.toDate?.() || b.issued_at || new Date(0);
                // - Tương tự cho certificate B
                return dateB - dateA;
                // - `dateB - dateA` = trừ 2 dates (convert thành milliseconds)
                // - dateB - dateA > 0 → dateB mới hơn → B lên trước (descending - mới nhất lên đầu)
                // - Ví dụ: 2024-12-01 - 2024-11-01 = positive number → 2024-12-01 lên trước
            });
        }

        res.status(200).json(certificates);
        // - `200` = OK - thành công
        // - Trả về array certificates
    } catch (error) {
        console.error('Error fetching certificates:', error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================================================
// FUNCTION 4: LẤY 1 CHỨNG CHỈ THEO ID
// ============================================================================
// Get certificate by ID
exports.getCertificateById = async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id);
        // - `req.params.id` = lấy ID từ URL parameter
        // - Ví dụ: /api/certificates/abc123 → req.params.id = 'abc123'
        // - GỌI MODEL! ⭐
        res.status(200).json(certificate);
    } catch (error) {
        console.error('Error fetching certificate:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
            // - `404` = Not Found
        }
        res.status(500).json({ error: error.message });
    }
};

// ============================================================================
// FUNCTION 5: CẬP NHẬT CHỨNG CHỈ - KHÔNG CHO PHÉP!
// ============================================================================
// Update certificate (Update in Controller)
exports.updateCertificate = async (req, res) => {
// - Function này LUÔN TRẢ VỀ LỖI - KHÔNG CHO PHÉP update certificate
// - Vì chứng chỉ là tài liệu PHÁP LÝ, không được sửa sau khi cấp
// - Nếu muốn hủy → dùng revokeCertificate

    try {
        // Certificates shouldn't be updated after issuance
        // But allow revoking
        res.status(403).json({ error: 'Certificates cannot be modified after issuance. Use revoke instead.' });
        // - `403` = Forbidden - Cấm, không được phép
        // - Luôn trả lỗi này, bất kể request là gì
    } catch (error) {
        console.error('Error updating certificate:', error);
        res.status(400).json({ error: error.message });
    }
};

// ============================================================================
// FUNCTION 6: XÓA CHỨNG CHỈ
// ============================================================================
// Delete certificate
exports.deleteCertificate = async (req, res) => {
// - Xóa vĩnh viễn certificate khỏi database
// - Chỉ admin mới được phép (routes sẽ kiểm tra quyền)

    try {
        await Certificate.delete(req.params.id);
        // - GỌI MODEL! ⭐ - Xóa certificate khỏi Firestore
        res.status(200).json({ message: 'Certificate deleted successfully' });
    } catch (error) {
        console.error('Error deleting certificate:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

// ============================================================================
// FUNCTION 7: LẤY TẤT CẢ CHỨNG CHỈ CỦA 1 USER
// ============================================================================
// Get user's certificates
exports.getUserCertificates = async (req, res) => {
// - Lấy danh sách tất cả certificates mà 1 user sở hữu
// - Hiển thị trong profile/dashboard của user

    try {
        const { userId } = req.params;
        // - Lấy userId từ URL: /api/users/:userId/certificates
        const certificates = await Certificate.findByUser(userId);
        // - GỌI MODEL! ⭐
        res.status(200).json(certificates);
    } catch (error) {
        console.error('Error fetching user certificates:', error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================================================
// FUNCTION 8: XÁC MINH CHỨNG CHỈ CÓ HỢP LỆ KHÔNG
// ============================================================================
// Verify certificate
exports.verifyCertificate = async (req, res) => {
// - Public function - ai cũng có thể verify certificate
// - Dùng certificate ID để kiểm tra chứng chỉ có thật không
// - Dùng khi: Người khác (nhà tuyển dụng, trường học) muốn xác minh chứng chỉ

    try {
        const { certificateId } = req.params;
        const certificate = await Certificate.verify(certificateId);
        // - `Certificate.verify()` = GỌI MODEL! ⭐
        // - Kiểm tra certificate có tồn tại, chưa bị revoke, v.v.

        res.status(200).json({
            valid: true,
            // - `valid: true` = chứng chỉ hợp lệ
            certificate
            // - Trả về thông tin certificate để hiển thị
        });
    } catch (error) {
        console.error('Error verifying certificate:', error);
        res.status(404).json({
        // - `404` = Not Found - chứng chỉ không tồn tại hoặc không hợp lệ
            valid: false,
            // - `valid: false` = chứng chỉ KHÔNG hợp lệ
            error: error.message
        });
    }
};

// ============================================================================
// FUNCTION 9: THU HỒI CHỨNG CHỈ
// ============================================================================
// Revoke certificate
exports.revokeCertificate = async (req, res) => {
// - Thu hồi (revoke) chứng chỉ - đánh dấu là không hợp lệ nữa
// - KHÔNG XÓA khỏi database, chỉ đánh dấu "revoked: true"
// - Dùng khi: Phát hiện gian lận, user vi phạm, v.v.

    try {
        const certificate = await Certificate.revoke(req.params.id);
        // - `Certificate.revoke()` = GỌI MODEL! ⭐
        // - Update certificate với flag "revoked: true" và lý do
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

// ============================================================================
// FUNCTION 10: DOWNLOAD CHỨNG CHỈ DƯỚI DẠNG PDF
// ============================================================================
// Download certificate as PDF
exports.downloadCertificatePDF = async (req, res) => {
// - Function PHỨC TẠP NHẤT trong file này!
// - Dùng PUPPETEER để convert HTML → PDF
// - Quy trình:
//   1. Verify certificate tồn tại
//   2. Tạo HTML template đẹp cho certificate
//   3. Mở headless browser (Chrome ảo)
//   4. Load HTML vào browser
//   5. Render thành PDF
//   6. Gửi PDF file về client để download

    try {
        const { certificateId } = req.params;
        // - Lấy ID từ URL: /api/certificates/:certificateId/download
        const certificate = await Certificate.verify(certificateId);
        // - GỌI MODEL! ⭐ - Kiểm tra certificate có hợp lệ không

        // Generate PDF using puppeteer
        const browser = await puppeteer.launch({
        // - `puppeteer.launch()` = mở 1 instance của Chrome/Chromium browser
        // - `await` = đợi browser khởi động xong
            headless: true,
            // - `headless: true` = chạy browser không giao diện (không hiển thị cửa sổ)
            // - Chạy ngầm trong server
            args: ['--no-sandbox', '--disable-setuid-sandbox']
            // - `args` = array các arguments truyền cho Chrome
            // - '--no-sandbox' = tắt sandbox (cần thiết khi chạy trên server)
            // - '--disable-setuid-sandbox' = tắt setuid sandbox (để tránh lỗi permission)
        });

        const page = await browser.newPage();
        // - `browser.newPage()` = tạo tab mới trong browser
        // - Giống như click "New Tab" trong Chrome
        // - `page` = object đại diện cho tab này

        // Set page size to A4 landscape
        await page.setViewport({ width: 1122, height: 794 });
        // - `setViewport()` = set kích thước màn hình ảo
        // - `width: 1122, height: 794` = kích thước A4 landscape (ngang) theo pixels
        // - A4 landscape = giấy A4 xoay ngang (thường dùng cho certificate)

        // Generate HTML content for certificate
        const htmlContent = generateCertificateHTML(certificate);
        // - Gọi helper function `generateCertificateHTML()` (xem phía dưới)
        // - Tạo HTML string với CSS đẹp cho certificate
        // - Truyền vào certificate data để fill vào template

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        // - `page.setContent()` = load HTML vào trang
        // - Giống như viết HTML vào browser console: document.body.innerHTML = htmlContent
        // - `waitUntil: 'networkidle0'` = đợi cho đến khi:
        //   + Tất cả resources (CSS, images, fonts) load xong
        //   + Không còn network request nào đang chạy
        //   + Đảm bảo page render hoàn toàn trước khi chụp PDF

        // Generate PDF
        const pdfBuffer = await page.pdf({
        // - `page.pdf()` = chụp trang thành PDF
        // - `pdfBuffer` = binary data của file PDF (dạng Buffer)
            format: 'A4',
            // - `format: 'A4'` = khổ giấy A4
            landscape: true,
            // - `landscape: true` = ngang (false = dọc)
            printBackground: true,
            // - `printBackground: true` = in cả background (colors, gradients)
            // - Nếu false → background sẽ trắng (như khi in trang web thông thường)
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
            // - `margin` = lề của PDF
            // - Set = 0 để không có lề (full page)
        });

        await browser.close();
        // - `browser.close()` = đóng browser sau khi xong
        // - QUAN TRỌNG! Nếu không đóng → memory leak, server sẽ chậm dần

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        // - `setHeader()` = set HTTP response header
        // - `Content-Type: application/pdf` = cho browser biết đây là file PDF

        res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificateId}.pdf`);
        // - `Content-Disposition` = cách browser xử lý file
        // - `attachment` = download file (không mở trong browser)
        // - `filename=...` = tên file khi download
        // - Template literal: `certificate-${certificateId}.pdf`
        //   + Ví dụ: certificate-abc123.pdf

        res.setHeader('Content-Length', pdfBuffer.length);
        // - `Content-Length` = kích thước file (bytes)
        // - `pdfBuffer.length` = số bytes của PDF

        res.send(pdfBuffer);
        // - `res.send()` = gửi binary data về client
        // - Browser sẽ nhận PDF và download
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};

// ============================================================================
// HELPER FUNCTION: TẠO HTML TEMPLATE CHO CERTIFICATE
// ============================================================================
// Helper function to generate certificate HTML
function generateCertificateHTML(certificate) {
// - `function` = cách cũ để khai báo function (không dùng const/arrow function)
// - Function này KHÔNG export ra ngoài - chỉ dùng trong file này
// - Nhận certificate object, return HTML string

    const issueDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
    // - `new Date()` = tạo Date object từ timestamp
    // - `certificate.issuedAt` = timestamp khi certificate được cấp
    // - `.toLocaleDateString()` = convert Date → string theo định dạng local
    // - `'en-US'` = format theo kiểu Mỹ (English - United States)
    // - Options object:
        year: 'numeric',
        // - `'numeric'` = hiển thị năm dạng số (2024)
        month: 'long',
        // - `'long'` = tên tháng đầy đủ (January, February, ...)
        day: 'numeric'
        // - `'numeric'` = ngày dạng số (1, 2, 3, ...)
    // - Kết quả ví dụ: "January 15, 2024"
    });

    return `
    // - `return` = trả về giá trị
    // - `` = TEMPLATE LITERAL (backticks) - cách viết string đặc biệt trong ES6
    //
    // TEMPLATE LITERAL cho phép:
    // 1. Viết string nhiều dòng (không cần \n)
    // 2. Nhúng biến/expression bằng ${...}
    // 3. Giữ nguyên format (spaces, tabs, line breaks)
    //
    // VÍ DỤ TEMPLATE LITERAL:
    //   const name = 'John';
    //   const greeting = `Hello, ${name}!`; // → "Hello, John!"
    //   const html = `
    //     <div>
    //       <h1>${name}</h1>
    //     </div>
    //   `; // → string HTML nhiều dòng với biến
    //
    // Trong file này: Dùng template literal để tạo HTML dài với CSS inline
    // - Nhúng certificate.userName, certificate.courseName, v.v. vào HTML
    // - Giữ format đẹp, dễ đọc hơn string concatenation (+)
    //
    // HTML BÊN DƯỚI là template cho CERTIFICATE DESIGN:
    // - Có CSS inline để style đẹp
    // - Có layout với border, gradient, signatures, seal
    // - Dùng ${...} để inject dynamic data (userName, courseName, grade, ...)
    //
    // CHÚ Ý: HTML/CSS bên dưới rất dài (200+ lines)
    // Tôi sẽ KHÔNG annotation chi tiết từng dòng CSS (vì giống nhau và lặp lại)
    // Chỉ annotation các phần quan trọng để hiểu syntax
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
                <!-- ↑ INJECT DYNAMIC DATA BẰNG ${...}
                - `${certificate.userName}` = nhúng tên user vào HTML
                - Template literal sẽ thay thế ${...} bằng giá trị thực
                - Ví dụ: certificate.userName = "Nguyễn Văn A"
                  → HTML thực tế: <div class="recipient-name">Nguyễn Văn A</div>
                -->

                <div class="course-info">
                    has successfully completed the course
                </div>

                <div class="course-name">${certificate.courseName}</div>
                <!-- ↑ Tên khóa học, ví dụ: "JavaScript From A to Z" -->

                ${certificate.grade ? `<div class="course-info">with a final grade of ${certificate.grade}%</div>` : ''}
                <!-- ↑ CONDITIONAL RENDERING (render có điều kiện)
                - `${certificate.grade ? ... : ''}` = TERNARY OPERATOR trong template literal
                - Nếu certificate.grade tồn tại (có điểm) → hiển thị div với điểm
                - Nếu không có grade → hiển thị string rỗng '' (không hiển thị gì)
                - Nested template literal: `<div>...${certificate.grade}%</div>`
                  + Backticks bên trong ${...} để tạo HTML string
                  + Inject grade vào HTML
                - Ví dụ:
                  + certificate.grade = 95 → HTML: <div>with a final grade of 95%</div>
                  + certificate.grade = null → HTML: (không có gì)
                -->
            </div>

            <div class="date">
                Issued on ${issueDate}
                <!-- ↑ Inject ngày cấp certificate (đã format ở trên: "January 15, 2024") -->
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
                <!-- ↑ Certificate ID unique để verify -->
            </div>

            <div class="seal">
                <div class="seal-text">
                    VERIFIED<br>
                    <!-- `<br>` = HTML tag xuống dòng (line break) -->
                    CERTIFICATE
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
    // ↑ KẾT THÚC TEMPLATE LITERAL
    // - Tất cả content từ dòng `return `` cho đến đây là 1 string duy nhất
    // - String này chứa toàn bộ HTML của certificate
    // - Được return về cho downloadCertificatePDF để load vào Puppeteer
}

// ============================================================================
// EXPORT MODULE
// ============================================================================
module.exports = exports;
// - `module.exports = exports` = export tất cả functions đã defined bằng `exports.functionName`
// - Tương đương:
//   module.exports = {
//     generateCertificate: exports.generateCertificate,
//     createCertificate: exports.createCertificate,
//     getCertificates: exports.getCertificates,
//     ...
//   }
// - Cách viết ngắn gọn hơn

// ============================================================================
// TÓM TẮT FILE NÀY
// ============================================================================
// File certificateController.js chứa 10 functions + 1 helper xử lý CERTIFICATES:
//
// 1. generateCertificate (POST /api/certificates/generate)
//    - Tự động tạo certificate khi user hoàn thành course
//    - Validate user_id, course_id
//    - Gọi Certificate.generate()
//
// 2. createCertificate (POST /api/certificates)
//    - Tạo certificate thủ công (admin)
//    - Tương tự generateCertificate
//
// 3. getCertificates (GET /api/certificates)
//    - Lấy danh sách certificates
//    - 3 modes: by userId, by courseId, hoặc tất cả
//    - Sort theo ngày cấp (mới nhất trước)
//
// 4. getCertificateById (GET /api/certificates/:id)
//    - Lấy 1 certificate theo ID
//
// 5. updateCertificate (PUT /api/certificates/:id)
//    - LUÔN TRẢ LỖI 403 - Không cho phép update certificate
//    - Certificate là tài liệu pháp lý, không được sửa
//
// 6. deleteCertificate (DELETE /api/certificates/:id)
//    - Xóa certificate (admin only)
//
// 7. getUserCertificates (GET /api/users/:userId/certificates)
//    - Lấy tất cả certificates của 1 user
//
// 8. verifyCertificate (GET /api/certificates/:certificateId/verify)
//    - Xác minh certificate có hợp lệ không
//    - Public - ai cũng có thể verify
//
// 9. revokeCertificate (POST /api/certificates/:id/revoke)
//    - Thu hồi certificate (đánh dấu revoked: true)
//    - Không xóa, chỉ đánh dấu không hợp lệ
//
// 10. downloadCertificatePDF (GET /api/certificates/:certificateId/download)
//     - Download certificate dưới dạng PDF
//     - Sử dụng PUPPETEER:
//       + Mở headless browser
//       + Load HTML template (từ generateCertificateHTML)
//       + Render thành PDF
//       + Gửi PDF về client
//
// HELPER FUNCTION:
// - generateCertificateHTML(certificate)
//   + Tạo HTML string từ certificate data
//   + Dùng template literal `` để embed dynamic data
//   + Chứa CSS inline để style certificate đẹp
//   + Return HTML string cho Puppeteer

// ============================================================================
// TỪ KHÓA JAVASCRIPT/HTML/PUPPETEER TRONG FILE NÀY
// ============================================================================
// JAVASCRIPT:
// - `const` = khai báo biến không đổi
// - `let` = khai báo biến có thể đổi
// - `async` = hàm bất đồng bộ
// - `await` = đợi Promise hoàn thành
// - `require()` = import module
// - `exports.functionName` = export function
// - `module.exports` = export toàn bộ
// - `try...catch` = bắt lỗi
// - `if...else if...else` = điều kiện
// - `return` = trả về giá trị
// - `{ }` = destructuring hoặc object
// - `||` = toán tử OR
// - `? :` = ternary operator (điều kiện ngắn gọn)
// - `.map()` = duyệt array và transform
// - `.sort()` = sắp xếp array
// - `.includes()` = kiểm tra string chứa substring
// - `?.` = optional chaining
// - `...` = spread operator
// - `` = template literal (backticks)
// - `${...}` = interpolation trong template literal
// - `new Date()` = tạo Date object
// - `.toLocaleDateString()` = format date thành string
//
// PUPPETEER:
// - `puppeteer.launch()` = mở browser
// - `headless: true` = browser không giao diện
// - `browser.newPage()` = tạo tab mới
// - `page.setViewport()` = set kích thước màn hình
// - `page.setContent()` = load HTML vào page
// - `page.pdf()` = chụp page thành PDF
// - `browser.close()` = đóng browser
//
// HTTP:
// - `.setHeader()` = set response header
// - `.send()` = gửi binary data
// - `Content-Type` = loại nội dung
// - `Content-Disposition` = cách xử lý file
// - `Content-Length` = kích thước file
//
// HTML/CSS:
// - `<div>` = container element
// - `class="..."` = CSS class
// - `<style>` = CSS inline
// - `<!DOCTYPE html>` = khai báo HTML5
// - `<meta charset="UTF-8">` = encoding
// - `<br>` = line break
// - `<!-- -->` = HTML comment
