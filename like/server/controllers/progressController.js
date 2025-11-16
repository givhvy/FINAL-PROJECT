// ============================================================================
// 📚 FILE NÀY LÀM GÌ? - progressController.js
// ============================================================================
// File này là PROGRESS CONTROLLER - điều khiển TIẾN ĐỘ HỌC TẬP của học sinh
//
// Giống như ghi nhận SỔ ĐIỂM TIẾN ĐỘ, file này:
// ✅ Cập nhật tiến độ bài học (updateLessonProgress) + AUTO GENERATE CERTIFICATE
// ✅ Xem tiến độ 1 bài học (getLessonProgress)
// ✅ Xem tổng quan tiến độ khóa học (getCourseProgress)
// ✅ Xem tất cả tiến độ user (getUserProgress)
// ✅ Reset tiến độ khóa học (resetCourseProgress)
// ✅ Cập nhật nhiều bài học cùng lúc (bulkUpdateProgress)
//
// 🎯 VÍ DỤ THỰC TẾ - SỔ TIẾN ĐỘ HỌC TẬP:
// ┌─────────────────────────────────────────────────────────┐
// │ TIẾN ĐỘ: JavaScript Cơ Bản - Nguyễn Văn An            │
// ├─────────────────────────────────────────────────────────┤
// │ ✅ Bài 1: Giới thiệu JavaScript (100%)                 │
// │ ✅ Bài 2: Biến và kiểu dữ liệu (100%)                  │
// │ 🔄 Bài 3: Hàm trong JavaScript (50%)                   │
// │ ⬜ Bài 4: Object và Array (0%)                         │
// │ ⬜ Bài 5: DOM Manipulation (0%)                        │
// ├─────────────────────────────────────────────────────────┤
// │ 📊 Tổng tiến độ: 50% (2.5/5 bài)                       │
// │                                                          │
// │ 🏆 Hoàn thành 100% → TỰ ĐỘNG TẠO CHỨNG CHỈ!            │
// └─────────────────────────────────────────────────────────┘
//
// ============================================================================
// FLOW: FRONTEND → ROUTES → CONTROLLER → MODEL → DATABASE
// ============================================================================
//
// VÍ DỤ: HỌC SINH HOÀN THÀNH BÀI HỌC
// Student An xem xong video "Bài 2: Biến và kiểu dữ liệu":
//   → POST /api/progress/lesson
//   Body: {
//     userId: 'user123',
//     courseId: 'course123',
//     lessonId: 'lesson2',
//     completed: true
//   }
//    ↓
// Routes: router.post('/progress/lesson', progressController.updateLessonProgress)
//    ↓
// Controller (file này): updateLessonProgress()
//   1. Cập nhật progress: Progress.updateLessonProgress()
//   2. Tính completion: Progress.calculateCompletion()
//   3. Nếu completion >= 100% → AUTO GENERATE CERTIFICATE! ⭐
//    ↓
// Model: Lưu progress + tự động tạo chứng chỉ
//
// ============================================================================
// 📦 IMPORT MODULE
// ============================================================================

const Progress = require('../models/Progress');
// 📌 Import Progress Model để track tiến độ học tập

const Certificate = require('../models/Certificate');
// 📌 Import Certificate Model để tự động tạo chứng chỉ khi hoàn thành khóa học

// ============================================================================
// FUNCTION 1: CẬP NHẬT TIẾN ĐỘ BÀI HỌC (UPDATE LESSON PROGRESS)
// ============================================================================
// Update lesson progress
exports.updateLessonProgress = async (req, res) => {
// 📌 Cập nhật tiến độ khi student hoàn thành bài học
// - TÍNH NĂNG ĐẶC BIỆT: Tự động tạo certificate khi đạt 100%! ⭐
//
// 🎯 VÍ DỤ THỰC TẾ:
// Student An đang học khóa "JavaScript Cơ Bản":
// 1. Xem video "Bài 2: Biến và kiểu dữ liệu" (15 phút)
// 2. Xem đến hết video
// 3. Nhấn "Đánh dấu hoàn thành" hoặc tự động khi video kết thúc
// 4. Frontend gửi POST request
// 5. Server:
//    - Lưu lesson2 = completed ✅
//    - Tính lại completion: 2/5 = 40%
//    - Nếu 100% → TỰ ĐỘNG TẠO CERTIFICATE! 🏆
// 6. Hiển thị "Bài học đã hoàn thành!"

  try {
    const { userId, courseId, lessonId, completed } = req.body;
    // 📌 Destructure 4 fields từ request body
    // - userId: ID học sinh
    // - courseId: ID khóa học
    // - lessonId: ID bài học vừa hoàn thành
    // - completed: true/false (đã hoàn thành chưa)

    // ========================================================================
    // VALIDATION: KIỂM TRA FIELDS BẮT BUỘC
    // ========================================================================
    if (!userId || !courseId || !lessonId) {
    // 📌 Phải có đủ 3 fields: userId, courseId, lessonId
      return res.status(400).json({ error: 'userId, courseId, and lessonId are required' });
      // 📌 Status 400 = Bad Request
    }

    // ========================================================================
    // BƯỚC 1: CẬP NHẬT PROGRESS
    // ========================================================================
    const progress = await Progress.updateLessonProgress(userId, courseId, lessonId, completed);
    // 📌 GỌI MODEL ĐỂ UPDATE PROGRESS! ⭐
    // - Lưu lesson progress vào database
    // - Ví dụ: { user_id: 'user123', course_id: 'course123', lesson2: true }

    // ========================================================================
    // BƯỚC 2: TÍNH COMPLETION (PHẦN TRĂM HOÀN THÀNH)
    // ========================================================================
    const completion = await Progress.calculateCompletion(userId, courseId);
    // 📌 GỌI MODEL ĐỂ TÍNH COMPLETION! ⭐
    // - Tính % hoàn thành = (số bài đã học / tổng số bài) * 100
    //
    // 🎯 VÍ DỤ:
    // Khóa học có 5 bài:
    // - Bài 1: ✅ completed
    // - Bài 2: ✅ completed
    // - Bài 3: ⬜ not completed
    // - Bài 4: ⬜ not completed
    // - Bài 5: ⬜ not completed
    //
    // completion = (2 / 5) * 100 = 40%

    let certificateGenerated = false;
    // 📌 Flag để track xem có tạo certificate không

    // ========================================================================
    // BƯỚC 3: AUTO GENERATE CERTIFICATE NẾU ĐẠT 100% ⭐
    // ========================================================================
    if (completion >= 100) {
    // 📌 Nếu completion >= 100% (hoàn thành TẤT CẢ bài học)
      try {
        await Certificate.generate(userId, courseId);
        // 📌 GỌI MODEL ĐỂ TẠO CERTIFICATE TỰ ĐỘNG! ⭐⭐⭐
        // - Tạo certificate cho user
        // - Lưu vào database
        // - User có thể download certificate
        //
        // 🎯 VÍ DỤ CERTIFICATE:
        // ┌─────────────────────────────────────────┐
        // │         CHỨNG CHỈ HOÀN THÀNH            │
        // ├─────────────────────────────────────────┤
        // │ Chứng nhận: Nguyễn Văn An               │
        // │ Đã hoàn thành khóa học:                 │
        // │ "JavaScript Cơ Bản"                     │
        // │                                          │
        // │ Ngày hoàn thành: 15/01/2024             │
        // │ Certificate ID: CERT-12345              │
        // └─────────────────────────────────────────┘

        certificateGenerated = true;
        // 📌 Đánh dấu đã tạo certificate thành công

      } catch (err) {
        // Certificate might already exist, that's okay
        console.log('Certificate generation skipped:', err.message);
        // 📌 Nếu certificate đã tồn tại → skip (không phải lỗi)
        // - User có thể hoàn thành lại khóa học (reset progress)
        // - Không tạo duplicate certificate
      }
    }

    res.status(200).json({
      success: true,
      progress,
      completion,
      certificateGenerated
    });
    // 📌 Trả về response với 4 fields:
    // - success: true
    // - progress: progress object vừa update
    // - completion: % hoàn thành (0-100)
    // - certificateGenerated: true/false (có tạo certificate không)

  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// FUNCTION 2: LẤY TIẾN ĐỘ BÀI HỌC (GET LESSON PROGRESS)
// ============================================================================
// Get lesson progress
exports.getLessonProgress = async (req, res) => {
// 📌 Kiểm tra xem 1 bài học cụ thể đã hoàn thành chưa
// - Dùng để hiển thị checkmark ✅ ở bài học đã xem
//
// 🎯 VÍ DỤ THỰC TẾ:
// Student An mở khóa "JavaScript Cơ Bản":
// Frontend gửi GET request cho TỪNG bài học:
// - GET /api/progress/user123/course123/lesson1 → { completed: true } ✅
// - GET /api/progress/user123/course123/lesson2 → { completed: true } ✅
// - GET /api/progress/user123/course123/lesson3 → { completed: false } ⬜
//
// Dựa vào response để hiển thị icon checkmark

  try {
    const { userId, courseId, lessonId } = req.params;
    // 📌 Lấy 3 IDs từ URL params
    // - URL: GET /api/progress/:userId/:courseId/:lessonId
    // - Ví dụ: GET /api/progress/user123/course123/lesson1

    const progress = await Progress.getLessonProgress(userId, courseId, lessonId);
    // 📌 GỌI MODEL ĐỂ LẤY PROGRESS! ⭐
    // - Trả về progress object hoặc null

    res.status(200).json(progress || { completed: false });
    // 📌 Nếu không có progress → trả về { completed: false }
    // - Mặc định bài học chưa hoàn thành

  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// FUNCTION 3: LẤY TỔNG QUAN TIẾN ĐỘ KHÓA HỌC (GET COURSE PROGRESS SUMMARY)
// ============================================================================
// Get course progress summary
exports.getCourseProgress = async (req, res) => {
// 📌 Lấy tổng quan tiến độ của 1 khóa học
// - Hiển thị % hoàn thành, số bài đã học, số bài còn lại
//
// 🎯 VÍ DỤ THỰC TẾ:
// Student An xem tổng quan khóa "JavaScript Cơ Bản":
// GET /api/progress/user123/course123
//    ↓
// Response: {
//   completion: 40,
//   completedLessons: 2,
//   totalLessons: 5,
//   lessons: [
//     { lessonId: 'lesson1', completed: true },
//     { lessonId: 'lesson2', completed: true },
//     { lessonId: 'lesson3', completed: false },
//     { lessonId: 'lesson4', completed: false },
//     { lessonId: 'lesson5', completed: false }
//   ]
// }

  try {
    const { userId, courseId } = req.params;
    // 📌 Lấy userId và courseId từ URL
    // - URL: GET /api/progress/:userId/:courseId

    const summary = await Progress.getCourseSummary(userId, courseId);
    // 📌 GỌI MODEL ĐỂ LẤY SUMMARY! ⭐
    // - Tính tổng quan progress của khóa học
    // - Trả về completion %, danh sách lessons với status

    res.status(200).json(summary);

  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// FUNCTION 4: LẤY TẤT CẢ TIẾN ĐỘ USER (GET ALL USER PROGRESS)
// ============================================================================
// Get all user progress
exports.getUserProgress = async (req, res) => {
// 📌 Lấy tất cả tiến độ của user (tất cả khóa học đang học)
// - Dùng để hiển thị dashboard "Khóa học của tôi"
//
// 🎯 VÍ DỤ THỰC TẾ:
// Student An vào trang "Khóa học của tôi":
// GET /api/progress/user123
//    ↓
// Response: [
//   {
//     courseId: 'course123',
//     courseName: 'JavaScript Cơ Bản',
//     completion: 40%,
//     lastAccessed: '2024-01-15'
//   },
//   {
//     courseId: 'course456',
//     courseName: 'React Advanced',
//     completion: 10%,
//     lastAccessed: '2024-01-10'
//   }
// ]

  try {
    const { userId } = req.params;
    // 📌 Lấy userId từ URL
    // - URL: GET /api/progress/:userId

    const { courseId } = req.query;
    // 📌 Lấy optional courseId từ query params
    // - URL: GET /api/progress/user123?courseId=course123
    // - Nếu có courseId → filter chỉ lấy 1 khóa học đó

    const progress = await Progress.getByEnrollment(userId, courseId);
    // 📌 GỌI MODEL ĐỂ LẤY PROGRESS! ⭐
    // - Nếu có courseId → lấy progress của khóa đó
    // - Nếu không → lấy TẤT CẢ progress của user

    res.status(200).json(progress);

  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// FUNCTION 5: RESET TIẾN ĐỘ KHÓA HỌC (RESET COURSE PROGRESS)
// ============================================================================
// Reset course progress
exports.resetCourseProgress = async (req, res) => {
// 📌 Xóa toàn bộ tiến độ của 1 khóa học → học lại từ đầu
// - Dùng khi student muốn học lại khóa học
//
// 🎯 VÍ DỤ THỰC TẾ:
// Student An muốn học lại khóa "JavaScript Cơ Bản" từ đầu:
// 1. Vào trang khóa học
// 2. Nhấn nút "Học lại từ đầu"
// 3. Confirm "Bạn có chắc muốn reset tiến độ?"
// 4. Frontend gửi DELETE /api/progress/user123/course123
// 5. Server xóa tất cả progress
// 6. Tất cả bài học về trạng thái ⬜ chưa hoàn thành

  try {
    const { userId, courseId } = req.params;
    // 📌 Lấy userId và courseId từ URL
    // - URL: DELETE /api/progress/:userId/:courseId

    await Progress.resetCourseProgress(userId, courseId);
    // 📌 GỌI MODEL ĐỂ RESET PROGRESS! ⭐
    // - Xóa tất cả lesson progress của khóa học này
    // - User có thể bắt đầu học lại từ đầu

    res.status(200).json({
    // 📌 Trả về response thành công
      success: true,
      message: 'Course progress reset successfully'
    });

  } catch (error) {
  // 📌 Catch errors
    console.error('Error resetting progress:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// FUNCTION 6: CẬP NHẬT NHIỀU BÀI HỌC CÙNG LÚC (BULK UPDATE PROGRESS)
// ============================================================================
// Bulk update lessons progress
exports.bulkUpdateProgress = async (req, res) => {
// 📌 Cập nhật nhiều bài học cùng lúc (batch operation)
// - Dùng khi admin import progress hoặc đồng bộ dữ liệu
//
// 🎯 VÍ DỤ THỰC TẾ:
// Admin migrate dữ liệu từ hệ thống cũ sang mới:
// POST /api/progress/bulk
// Body: {
//   userId: 'user123',
//   courseId: 'course123',
//   lessonIds: ['lesson1', 'lesson2', 'lesson3'],
//   completed: true
// }
//    ↓
// Đánh dấu 3 bài học hoàn thành cùng lúc (thay vì 3 requests riêng lẻ)

  try {
    const { userId, courseId, lessonIds, completed } = req.body;
    // 📌 Destructure fields từ request body
    // - lessonIds: ARRAY các lesson IDs cần update

    // ========================================================================
    // VALIDATION
    // ========================================================================
    if (!userId || !courseId || !Array.isArray(lessonIds)) {
    // 📌 Validate 3 điều kiện:
    // 1. Phải có userId
    // 2. Phải có courseId
    // 3. lessonIds phải là ARRAY
    //
    // 🎯 Array.isArray() = kiểm tra có phải array không
    // - Array.isArray([1, 2, 3]) → true ✅
    // - Array.isArray('hello') → false ❌
    // - Array.isArray({}) → false ❌
    // - Array.isArray(null) → false ❌

      return res.status(400).json({ error: 'userId, courseId, and lessonIds array are required' });
    }

    // ========================================================================
    // BULK UPDATE
    // ========================================================================
    await Progress.bulkUpdateLessons(userId, courseId, lessonIds, completed);
    // 📌 GỌI MODEL ĐỂ BULK UPDATE! ⭐
    // - Update NHIỀU lessons cùng lúc
    // - Nhanh hơn update từng cái một
    //
    // 🎯 VÍ DỤ:
    // lessonIds = ['lesson1', 'lesson2', 'lesson3']
    //   ↓
    // Batch update 3 lessons → { lesson1: true, lesson2: true, lesson3: true }
    //
    // 🔥 TẠI SAO NHANH HƠN?
    // - Không dùng bulk: 3 requests = 3 * 100ms = 300ms
    // - Dùng bulk: 1 request = 100ms
    // - NHANH GẤP 3 LẦN!

    // ========================================================================
    // TÍNH LẠI COMPLETION SAU KHI BULK UPDATE
    // ========================================================================
    const completion = await Progress.calculateCompletion(userId, courseId);
    // 📌 GỌI MODEL ĐỂ TÍNH LẠI COMPLETION! ⭐
    // - Sau khi update nhiều bài → tính lại % hoàn thành

    res.status(200).json({
      success: true,
      updated: lessonIds.length,
      // 📌 Số lượng lessons đã update
      completion
      // 📌 % hoàn thành mới
    });

  } catch (error) {
    console.error('Error bulk updating progress:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// 📚 TÓM TẮT FILE NÀY
// ============================================================================
// File progressController.js chứa 6 functions xử lý PROGRESS TRACKING:
//
// 1. updateLessonProgress (POST /api/progress/lesson)
//    - Cập nhật tiến độ bài học
//    - AUTO GENERATE CERTIFICATE khi đạt 100%! ⭐⭐⭐
//    - Flow: update → calculate completion → if 100% → generate certificate
//    - Gọi Progress.updateLessonProgress() + Certificate.generate()
//
// 2. getLessonProgress (GET /api/progress/:userId/:courseId/:lessonId)
//    - Kiểm tra 1 bài học đã hoàn thành chưa
//    - Trả về { completed: true/false }
//    - Dùng để hiển thị checkmark ✅
//
// 3. getCourseProgress (GET /api/progress/:userId/:courseId)
//    - Lấy tổng quan tiến độ khóa học
//    - Trả về: completion %, số bài đã học, danh sách lessons
//    - Gọi Progress.getCourseSummary()
//
// 4. getUserProgress (GET /api/progress/:userId?courseId=...)
//    - Lấy tất cả tiến độ của user
//    - Optional filter theo courseId
//    - Hiển thị dashboard "Khóa học của tôi"
//
// 5. resetCourseProgress (DELETE /api/progress/:userId/:courseId)
//    - Xóa toàn bộ tiến độ → học lại từ đầu
//    - Gọi Progress.resetCourseProgress()
//
// 6. bulkUpdateProgress (POST /api/progress/bulk)
//    - Cập nhật nhiều bài học cùng lúc
//    - OPTIMIZATION: Batch operation (nhanh gấp N lần)
//    - Validate: Array.isArray(lessonIds)
//    - Gọi Progress.bulkUpdateLessons()
//
// ============================================================================
// 🔑 KEY CONCEPTS
// ============================================================================
// - Auto Generate Certificate:
//   + Khi completion >= 100% → tự động tạo certificate
//   + Try-catch để handle certificate already exists
//   + certificateGenerated flag để thông báo frontend
//
// - Completion Calculation:
//   + completion = (completedLessons / totalLessons) * 100
//   + Ví dụ: 2/5 = 40%
//
// - Array.isArray() = kiểm tra có phải array không
//   + Array.isArray([1,2,3]) → true
//   + Array.isArray('hello') → false
//
// - Bulk Operations = batch update nhiều items cùng lúc
//   + Nhanh hơn update từng cái
//   + Giảm số lượng requests
//
// - Optional Query Params:
//   + req.query.courseId = có thể có hoặc không
//   + Dùng để filter kết quả
//
// - Progress Tracking Pattern:
//   + Update progress → Calculate completion → Auto actions
//   + Ví dụ: Update lesson → Calculate % → Generate certificate
//
// ============================================================================
// 📊 REAL-WORLD ANALOGY
// ============================================================================
//
// 📖 Progress Controller giống như SỔ ĐIỂM TIẾN ĐỘ HỌC TẬP:
//
// 1. updateLessonProgress = Giáo viên đánh dấu bài học đã hoàn thành
//    - Học sinh xem xong video → tick ✅
//    - Đạt 100% → TỰ ĐỘNG NHẬN CHỨNG CHỈ! 🏆
//
// 2. getLessonProgress = Kiểm tra 1 bài đã học chưa
//    - "Bài 1 đã hoàn thành chưa?" → "Rồi ✅"
//
// 3. getCourseProgress = Xem tổng quan tiến độ khóa học
//    - "Khóa JavaScript: 40% (2/5 bài)"
//    - Hiển thị progress bar
//
// 4. getUserProgress = Xem tất cả khóa đang học
//    - Dashboard "Khóa học của tôi"
//    - Hiển thị progress từng khóa
//
// 5. resetCourseProgress = Học lại từ đầu
//    - "Muốn học lại khóa này? → Reset progress"
//
// 6. bulkUpdateProgress = Import điểm hàng loạt
//    - Thầy nhập điểm cho 100 học sinh cùng lúc
//    - Nhanh hơn nhập từng người một
//
// AUTO CERTIFICATE:
// - Gamification: Khuyến khích học sinh hoàn thành khóa học
// - Reward: Nhận chứng chỉ khi hoàn thành 100%
// - Automation: Tự động, không cần admin tạo manual
//
// ============================================================================
