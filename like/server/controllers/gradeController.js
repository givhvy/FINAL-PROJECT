// ============================================================================
// 📚 FILE NÀY LÀM GÌ? - gradeController.js
// ============================================================================
// File này là GRADE CONTROLLER - điều khiển tất cả thao tác liên quan đến ĐIỂM SỐ (grades) của quiz
//
// Giống như sổ điểm của giáo viên, file này:
// ✅ Tạo điểm mới khi học sinh làm quiz (createGrade)
// ✅ Xem danh sách điểm - lọc theo học sinh/quiz (getGrades)
// ✅ Xem điểm cụ thể (getGradeById)
// ✅ Tính điểm trung bình của học sinh (getStudentAverage)
// ✅ Xem thống kê điểm của quiz (getQuizStats) - điểm TB, cao nhất, thấp nhất
// ✅ Sửa điểm (updateGrade)
// ✅ Xóa điểm (deleteGrade)
//
// 🎯 VÍ DỤ THỰC TẾ - SỔ ĐIỂM LỚP HỌC:
// ┌─────────────────────────────────────────────────────────────┐
// │ SỔ ĐIỂM KIỂM TRA - LỚP 12A - MÔN TOÁN                      │
// ├──────────────┬────────────┬────────────┬──────────┬────────┤
// │ Tên học sinh │ Kiểm tra 1 │ Kiểm tra 2 │ Điểm TB  │ Xếp loại│
// ├──────────────┼────────────┼────────────┼──────────┼────────┤
// │ Nguyễn Văn An│     8.5    │     9.0    │   8.75   │  Giỏi  │
// │ Trần Thị Bình│     7.0    │     8.5    │   7.75   │  Khá   │
// │ Lê Văn Cường │     9.5    │     10.0   │   9.75   │ Xuất sắc│
// └──────────────┴────────────┴────────────┴──────────┴────────┘
//
// THỐNG KÊ KIỂM TRA 1:
// - Điểm trung bình lớp: 8.33
// - Điểm cao nhất: 9.5 (Lê Văn Cường)
// - Điểm thấp nhất: 7.0 (Trần Thị Bình)
// - Số học sinh đạt: 3/3 (100%)
//
// ============================================================================
// FLOW: FRONTEND → ROUTES → CONTROLLER → MODEL → DATABASE
// ============================================================================
//
// VÍ DỤ 1: HỌC SINH LÀM QUIZ XON...
G → TẠO ĐIỂM
// ┌─────────────────────────────────────────────────────────────┐
// │ BƯỚC 1: FRONTEND (views/pages/quiz.ejs)                    │
// │ Học sinh An làm xong quiz "Kiểm tra JavaScript Cơ Bản"     │
// │ - Làm 10 câu, đúng 8 câu → Điểm: 80/100                   │
// │                                                              │
// │ JavaScript code:                                             │
// │   fetch('/api/grades', {                                    │
// │     method: 'POST',                                         │
// │     body: JSON.stringify({                                  │
// │       userId: 'user123',                                    │
// │       quizId: 'quiz456',                                    │
// │       score: 80,                                            │
// │       totalQuestions: 10,                                   │
// │       correctAnswers: 8                                     │
// │     })                                                      │
// │   })                                                        │
// └─────────────────────────────────────────────────────────────┘
//                                  ↓
// ┌─────────────────────────────────────────────────────────────┐
// │ BƯỚC 2: ROUTES (routes/gradeRoutes.js)                     │
// │   router.post('/grades', createGrade);                      │
// └─────────────────────────────────────────────────────────────┘
//                                  ↓
// ┌─────────────────────────────────────────────────────────────┐
// │ BƯỚC 3: CONTROLLER (file NÀY)                              │
// │   createGrade() → Grade.create(gradeData)                  │
// └─────────────────────────────────────────────────────────────┘
//                                  ↓
// ┌─────────────────────────────────────────────────────────────┐
// │ BƯỚC 4: MODEL (models/Grade.js)                            │
// │   Lưu grade vào Firestore collection "grades"              │
// └─────────────────────────────────────────────────────────────┘
//                                  ↓
// ┌─────────────────────────────────────────────────────────────┐
// │ BƯỚC 5: DATABASE (Firestore)                               │
// │ Document mới:                                               │
// │ {                                                           │
// │   id: "grade789",                                          │
// │   userId: "user123",                                       │
// │   quizId: "quiz456",                                       │
// │   score: 80,                                               │
// │   createdAt: Timestamp(2024-01-15)                         │
// │ }                                                           │
// └─────────────────────────────────────────────────────────────┘
//
// VÍ DỤ 2: GIÁO VIÊN XEM ĐIỂM CỦA HỌC SINH
// Frontend: GET /api/grades?userId=user123
//    ↓
// Controller: getGrades() → Grade.findByStudent(user123)
//    ↓
// Model: Query Firestore WHERE userId = 'user123'
//    ↓
// Response: [
//   { quizId: 'quiz456', score: 80, createdAt: '...' },
//   { quizId: 'quiz789', score: 95, createdAt: '...' }
// ]
//
// VÍ DỤ 3: XEM THỐNG KÊ ĐIỂM QUIZ
// Frontend: GET /api/grades/quiz/quiz456/stats
//    ↓
// Controller: getQuizStats(quiz456) → Grade.getQuizStats(quiz456)
//    ↓
// Model: Tính toán average, min, max từ tất cả grades của quiz
//    ↓
// Response: {
//   quizId: 'quiz456',
//   average: 8.33,
//   min: 7.0,
//   max: 9.5,
//   totalSubmissions: 25
// }
//
// ============================================================================
// 📦 IMPORT MODULE
// ============================================================================

const Grade = require('../models/Grade');
// 📌 Import Grade Model để thao tác với grades trong database

// ============================================================================
// FUNCTION 1: TẠO ĐIỂM MỚI (CREATE GRADE)
// ============================================================================
// Create a new grade (checkpoint, Create in Controller)
exports.createGrade = async (req, res) => {
// 📌 Function này được gọi khi học sinh hoàn thành quiz
// - Tạo 1 grade record mới trong database
// - Lưu điểm, user, quiz, thời gian
//
// 🎯 VÍ DỤ THỰC TẾ:
// An làm quiz "JavaScript Cơ Bản":
// - Tổng 10 câu
// - Làm đúng 8 câu
// - Điểm: 80/100
// System tự động tạo grade record

  try {
    const grade = await Grade.create(req.body);
    // 📌 GỌI MODEL ĐỂ TẠO GRADE! ⭐
    // - req.body chứa: { userId, quizId, score, correctAnswers, totalQuestions }
    // - Grade.create() lưu vào Firestore
    // - Trả về grade object với id

    res.status(201).json({ success: true, grade });
    // 📌 Status 201 = Created (tạo thành công)
    // - Trả về grade vừa tạo cho frontend

  } catch (err) {
    console.error("Create Grade Error:", err);
    res.status(400).json({ error: err.message });
    // 📌 Status 400 = Bad Request (dữ liệu không hợp lệ)
  }
};

// ============================================================================
// FUNCTION 2: LẤY DANH SÁCH ĐIỂM (GET GRADES)
// ============================================================================
// Get all grades (for admin/teacher)
exports.getGrades = async (req, res) => {
// 📌 Function này có 3 chế độ:
// 1. Lọc theo userId → lấy tất cả điểm của 1 học sinh
// 2. Lọc theo quizId → lấy tất cả điểm của 1 quiz (xem ai đã làm)
// 3. Không filter → lấy TẤT CẢ grades (admin dashboard)
//
// 🎯 VÍ DỤ THỰC TẾ:
// - Giáo viên muốn xem: "An đã làm những quiz nào?"
//   → GET /api/grades?userId=user123
//
// - Giáo viên muốn xem: "Ai đã làm quiz Toán?"
//   → GET /api/grades?quizId=quiz456
//
// - Admin muốn xem tất cả điểm trong hệ thống
//   → GET /api/grades

  try {
    const { userId, quizId } = req.query;
    // 📌 Lấy filters từ query params
    // - req.query = { userId: 'user123' } hoặc { quizId: 'quiz456' }

    let grades;
    // 📌 Biến để lưu kết quả

    if (userId) {
    // 📌 CASE 1: Lọc theo học sinh

      grades = await Grade.findByStudent(userId);
      // 📌 GỌI MODEL ĐỂ TÌM GRADES CỦA 1 STUDENT! ⭐
      // - Trả về: [grade1, grade2, grade3, ...]
      // - Mỗi grade chứa: quizId, score, createdAt

    } else if (quizId) {
    // 📌 CASE 2: Lọc theo quiz

      grades = await Grade.findByQuiz(quizId);
      // 📌 GỌI MODEL ĐỂ TÌM GRADES CỦA 1 QUIZ! ⭐
      // - Trả về: danh sách tất cả học sinh đã làm quiz này
      // - Dùng để xem: Ai đạt điểm cao? Ai cần hỗ trợ thêm?

    } else {
    // 📌 CASE 3: Lấy tất cả grades (admin)

      // Fetch all grades for admin/teacher dashboard
      const db = Grade.getDB();
      // 📌 Lấy Firestore database instance

      const snapshot = await db.collection('grades').get();
      // 📌 Query Firestore: Lấy TẤT CẢ documents trong collection "grades"
      // - .get() = fetch tất cả
      // - snapshot = kết quả chứa tất cả documents

      grades = snapshot.docs.map(doc => ({
      // 📌 .map() = transform từng document thành plain object
        id: doc.id,
        // 📌 Lấy ID của document
        ...doc.data()
        // 📌 Spread operator - lấy tất cả data của document
      }));
      // 📌 Kết quả: [
      //   { id: 'grade1', userId: 'user1', quizId: 'quiz1', score: 80 },
      //   { id: 'grade2', userId: 'user2', quizId: 'quiz1', score: 95 }
      // ]

      // Sort by createdAt descending
      grades.sort((a, b) => {
      // 📌 `.sort()` = SẮP XẾP array
      // - (a, b) => {...} = hàm so sánh 2 phần tử
      // - Nếu return > 0 → b lên trước a
      // - Nếu return < 0 → a lên trước b

        const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
        // 📌 Giải thích:
        // - `a.createdAt?.toDate?.()` = OPTIONAL CHAINING
        //   + Nếu createdAt là Firestore Timestamp → gọi .toDate() → Date object
        //   + Nếu createdAt null/undefined → trả về undefined
        //   + `?.` = không throw lỗi nếu property không tồn tại
        // - `|| a.createdAt` = nếu .toDate() không có → dùng createdAt gốc
        // - `|| new Date(0)` = nếu cả 2 đều null → dùng ngày 1/1/1970 (fallback)
        //
        // 🎯 TẠI SAO CẦN PHỨC TẠP VẬY?
        // - Firestore Timestamp có method .toDate()
        // - Nhưng nếu data cũ lưu dạng ISO string → không có .toDate()
        // - Phải handle cả 2 trường hợp

        const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);

        return dateB - dateA;
        // 📌 So sánh 2 dates
        // - Date trong JS có thể trừ nhau → ra milliseconds
        // - dateB - dateA > 0 → B mới hơn A → B lên trước
        // - Kết quả: Sắp xếp từ MỚI NHẤT đến CŨ NHẤT (descending)
        //
        // 🎯 VÍ DỤ:
        // grades = [
        //   { createdAt: '2024-01-10' }, // grade A
        //   { createdAt: '2024-01-15' }, // grade B
        //   { createdAt: '2024-01-12' }  // grade C
        // ]
        // Sau sort: [B (15), C (12), A (10)] ← Mới nhất trước
      });
    }

    res.status(200).json(grades);
    // 📌 Trả về danh sách grades đã lọc/sort

  } catch (err) {
    console.error("Get Grades Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ============================================================================
// FUNCTION 3: LẤY 1 ĐIỂM CỤ THỂ (GET GRADE BY ID)
// ============================================================================
// Get grade by ID
exports.getGradeById = async (req, res) => {
// 📌 Lấy chi tiết 1 grade cụ thể
// - Dùng khi cần xem đầy đủ thông tin 1 lần làm quiz

  try {
    const grade = await Grade.findById(req.params.id);
    // 📌 GỌI MODEL ĐỂ TÌM GRADE! ⭐
    // - req.params.id = ID của grade từ URL
    // - Ví dụ: GET /api/grades/grade123 → id = 'grade123'

    res.status(200).json(grade);

  } catch (err) {
    console.error("Get Grade By ID Error:", err);

    if (err.message.includes('not found')) {
    // 📌 Nếu không tìm thấy grade
      return res.status(404).json({ error: err.message });
      // 📌 Status 404 = Not Found
    }

    res.status(500).json({ error: err.message });
  }
};

// ============================================================================
// FUNCTION 4: TÍNH ĐIỂM TRUNG BÌNH CỦA HỌC SINH (GET STUDENT AVERAGE)
// ============================================================================
// Get student's average
exports.getStudentAverage = async (req, res) => {
// 📌 Tính điểm trung bình của 1 học sinh qua TẤT CẢ các quiz đã làm
//
// 🎯 VÍ DỤ THỰC TẾ:
// An đã làm 5 quiz:
// - Quiz 1: 80 điểm
// - Quiz 2: 90 điểm
// - Quiz 3: 85 điểm
// - Quiz 4: 95 điểm
// - Quiz 5: 75 điểm
// → Điểm TB = (80 + 90 + 85 + 95 + 75) / 5 = 85 điểm

  try {
    const { userId } = req.params;
    // 📌 Lấy userId từ URL: GET /api/grades/student/user123/average

    const average = await Grade.getStudentAverage(userId);
    // 📌 GỌI MODEL ĐỂ TÍNH ĐIỂM TRUNG BÌNH! ⭐
    // - Model sẽ:
    //   1. Tìm tất cả grades của user này
    //   2. Cộng tất cả scores lại
    //   3. Chia cho số lượng grades
    // - Trả về: số thập phân (ví dụ: 85.5)

    res.status(200).json({ userId, average });
    // 📌 Response: { userId: 'user123', average: 85.5 }

  } catch (err) {
    console.error("Get Student Average Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ============================================================================
// FUNCTION 5: LẤY THỐNG KÊ ĐIỂM QUIZ (GET QUIZ STATS)
// ============================================================================
// Get quiz statistics
exports.getQuizStats = async (req, res) => {
// 📌 Lấy thống kê điểm của 1 quiz: điểm TB, cao nhất, thấp nhất
//
// 🎯 VÍ DỤ THỰC TẾ:
// Quiz "Toán Cao Cấp" có 30 học sinh làm:
// ┌──────────────────────────────────┐
// │ THỐNG KÊ QUIZ: TOÁN CAO CẤP     │
// ├──────────────────────────────────┤
// │ Số học sinh làm: 30              │
// │ Điểm trung bình: 7.8             │
// │ Điểm cao nhất: 10.0              │
// │ Điểm thấp nhất: 5.5              │
// │ Tỷ lệ đạt (>=5): 95%             │
// │ Tỷ lệ giỏi (>=8): 45%            │
// └──────────────────────────────────┘

  try {
    const { quizId } = req.params;
    // 📌 Lấy quizId từ URL: GET /api/grades/quiz/quiz456/stats

    const stats = await Grade.getQuizStats(quizId);
    // 📌 GỌI MODEL ĐỂ TÍNH THỐNG KÊ! ⭐
    // - Model sẽ:
    //   1. Tìm tất cả grades của quiz này
    //   2. Tính average (điểm trung bình)
    //   3. Tìm min (điểm thấp nhất)
    //   4. Tìm max (điểm cao nhất)
    //   5. Đếm totalSubmissions (số lượt làm)
    //
    // - Trả về object: {
    //     average: 7.8,
    //     min: 5.5,
    //     max: 10.0,
    //     totalSubmissions: 30
    //   }

    res.status(200).json({ quizId, ...stats });
    // 📌 Spread operator - thêm quizId vào stats object
    // - Response: {
    //     quizId: 'quiz456',
    //     average: 7.8,
    //     min: 5.5,
    //     max: 10.0,
    //     totalSubmissions: 30
    //   }

  } catch (err) {
    console.error("Get Quiz Stats Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ============================================================================
// FUNCTION 6: CẬP NHẬT ĐIỂM (UPDATE GRADE)
// ============================================================================
// Update grade (checkpoint, Update in Controller)
exports.updateGrade = async (req, res) => {
// 📌 Sửa điểm - ít khi dùng
// - Thường chỉ admin/teacher được phép sửa
// - Ví dụ: Sửa lại điểm nếu chấm sai, hoặc cho điểm cộng

  try {
    const updatedGrade = await Grade.update(req.params.id, req.body);
    // 📌 GỌI MODEL ĐỂ UPDATE! ⭐
    // - req.params.id = ID của grade cần sửa
    // - req.body = data mới (ví dụ: { score: 95 })

    res.status(200).json({ success: true, grade: updatedGrade });

  } catch (err) {
    console.error("Update Grade Error:", err);

    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }

    res.status(400).json({ error: err.message });
  }
};

// ============================================================================
// FUNCTION 7: XÓA ĐIỂM (DELETE GRADE)
// ============================================================================
// Delete grade (checkpoint, Delete in Controller)
exports.deleteGrade = async (req, res) => {
// 📌 Xóa điểm - ít khi dùng
// - Thường chỉ admin được phép xóa
// - Ví dụ: Xóa kết quả test nếu học sinh làm nhầm

  try {
    await Grade.delete(req.params.id);
    // 📌 GỌI MODEL ĐỂ XÓA! ⭐

    res.status(200).json({ message: 'Grade deleted successfully' });

  } catch (err) {
    console.error("Delete Grade Error:", err);

    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }

    res.status(500).json({ error: err.message });
  }
};

// ============================================================================
// 📚 TÓM TẮT FILE NÀY
// ============================================================================
// File gradeController.js chứa 7 functions xử lý GRADES (ĐIỂM SỐ):
//
// 1. createGrade (POST /api/grades)
//    - Tạo grade mới khi học sinh làm quiz
//    - Gọi Grade.create()
//
// 2. getGrades (GET /api/grades)
//    - Lấy danh sách grades
//    - Có 3 modes: filter by userId, filter by quizId, get all
//    - Sort by createdAt (mới nhất trước)
//    - Gọi Grade.findByStudent(), Grade.findByQuiz(), hoặc query trực tiếp
//
// 3. getGradeById (GET /api/grades/:id)
//    - Lấy 1 grade cụ thể
//    - Gọi Grade.findById()
//
// 4. getStudentAverage (GET /api/grades/student/:userId/average)
//    - Tính điểm trung bình của 1 học sinh
//    - Gọi Grade.getStudentAverage()
//
// 5. getQuizStats (GET /api/grades/quiz/:quizId/stats)
//    - Lấy thống kê: avg, min, max, total submissions
//    - Gọi Grade.getQuizStats()
//
// 6. updateGrade (PUT /api/grades/:id)
//    - Sửa điểm
//    - Gọi Grade.update()
//
// 7. deleteGrade (DELETE /api/grades/:id)
//    - Xóa điểm
//    - Gọi Grade.delete()
//
// ============================================================================
// 🔑 KEY CONCEPTS & KEYWORDS
// ============================================================================
// - `.sort()` = sắp xếp array theo điều kiện
// - `?.` (optional chaining) = truy cập property an toàn, không lỗi nếu null
// - `.toDate()` = convert Firestore Timestamp → Date object
// - `||` (OR operator) = fallback value
// - `...` (spread operator) = giải nén object
// - `.map()` = transform array
// - Date arithmetic = trừ 2 dates ra milliseconds
// - Ascending sort = tăng dần (a - b)
// - Descending sort = giảm dần (b - a)
//
// ============================================================================
// 📊 REAL-WORLD ANALOGIES
// ============================================================================
//
// 📝 Grade Controller giống như PHẦN MỀM QUẢN LÝ SỔ ĐIỂM:
//
// 1. createGrade = Giáo viên ghi điểm vào sổ sau khi chấm bài
// 2. getGrades (userId) = Xem tất cả điểm của 1 học sinh (báo cáo cá nhân)
// 3. getGrades (quizId) = Xem điểm của cả lớp trong 1 bài kiểm tra
// 4. getStudentAverage = Tính điểm trung bình học kỳ của học sinh
// 5. getQuizStats = Thống kê chất lượng bài kiểm tra (khó/dễ?)
// 6. updateGrade = Sửa điểm nếu chấm sai
// 7. deleteGrade = Xóa điểm nếu làm nhầm
//
// ============================================================================
