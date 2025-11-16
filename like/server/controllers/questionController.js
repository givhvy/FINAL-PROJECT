// ============================================================================
// 📚 FILE NÀY LÀM GÌ? - questionController.js
// ============================================================================
// File này là QUESTION CONTROLLER - điều khiển CÂU HỎI (questions) trong QUIZ
//
// Giống như người soạn đề thi, file này:
// ✅ Tạo câu hỏi mới cho quiz (createQuestion)
// ✅ Lấy tất cả câu hỏi của 1 quiz (getQuestionsByQuiz)
//
// 🎯 VÍ DỤ THỰC TẾ - ĐỀ THI:
// ┌─────────────────────────────────────────────────────────┐
// │ ĐỀ KIỂM TRA: JavaScript Cơ Bản (10 câu)               │
// ├─────────────────────────────────────────────────────────┤
// │ Câu 1: JavaScript là gì?                                │
// │   A) Ngôn ngữ lập trình                                │
// │   B) Framework                                          │
// │   C) Database                                           │
// │   D) Trình duyệt                                        │
// │   Đáp án: A                                             │
// ├─────────────────────────────────────────────────────────┤
// │ Câu 2: Cách khai báo biến trong JS?                    │
// │   A) var x = 5                                          │
// │   B) int x = 5                                          │
// │   C) string x = 5                                       │
// │   D) x := 5                                             │
// │   Đáp án: A                                             │
// └─────────────────────────────────────────────────────────┘
//
// ============================================================================
// FLOW: FRONTEND → ROUTES → CONTROLLER → MODEL → DATABASE
// ============================================================================
//
// VÍ DỤ 1: GIÁO VIÊN TẠO CÂU HỎI MỚI
// Teacher soạn câu hỏi trong quiz:
//   → POST /api/questions
//   Body: {
//     quizId: 'quiz123',
//     questionText: 'JavaScript là gì?',
//     questionType: 'multiple_choice',
//     options: ['Ngôn ngữ lập trình', 'Framework', 'Database', 'Trình duyệt'],
//     correctAnswer: 0
//   }
//    ↓
// Routes: router.post('/questions', createQuestion)
//    ↓
// Controller (file này): createQuestion() → Question.create()
//    ↓
// Model: Lưu vào Firestore collection "questions"
//
// VÍ DỤ 2: HỌC SINH LÀM QUIZ
// Student mở quiz để làm bài:
//   → GET /api/questions?quizId=quiz123
//    ↓
// Controller: getQuestionsByQuiz() → Question.findByQuizId()
//    ↓
// Model: Query Firestore WHERE quiz_id = 'quiz123'
//    ↓
// Response: Trả về 10 câu hỏi của quiz đó
//
// ============================================================================
// 📦 IMPORT MODULE
// ============================================================================

const Question = require('../models/Question');
// 📌 Import Question Model để thao tác với câu hỏi quiz

// ============================================================================
// FUNCTION 1: TẠO CÂU HỎI MỚI (CREATE QUESTION)
// ============================================================================
// Tạo câu hỏi mới
exports.createQuestion = async (req, res) => {
// 📌 Function này dùng khi teacher tạo quiz và thêm câu hỏi
//
// 🎯 VÍ DỤ THỰC TẾ:
// Teacher đang tạo quiz "JavaScript Cơ Bản":
// 1. Điền thông tin câu hỏi:
//    - Câu hỏi: "JavaScript là gì?"
//    - Loại: Multiple Choice (trắc nghiệm)
//    - Đáp án A: "Ngôn ngữ lập trình" ← Đúng
//    - Đáp án B: "Framework"
//    - Đáp án C: "Database"
//    - Đáp án D: "Trình duyệt"
// 2. Nhấn "Thêm câu hỏi"
// 3. Frontend gửi POST request
// 4. Server lưu câu hỏi vào database

  try {
    const questionData = {
    // 📌 Chuẩn bị data để lưu vào database

      ...req.body,
      // 📌 Spread tất cả fields từ request body

      // Support both camelCase and snake_case
      quizId: req.body.quizId || req.body.quiz_id,
      quiz_id: req.body.quiz_id || req.body.quizId,
      // 📌 Hỗ trợ CẢ 2 naming conventions
      // - Frontend mới: dùng camelCase (quizId)
      // - Code cũ: dùng snake_case (quiz_id)
      // - Lưu CẢ 2 để đảm bảo tương thích

      questionText: req.body.questionText || req.body.question_text,
      question_text: req.body.question_text || req.body.questionText,
      // 📌 Nội dung câu hỏi
      // - Ví dụ: "JavaScript là gì?"

      questionType: req.body.questionType || req.body.question_type,
      question_type: req.body.question_type || req.body.questionType,
      // 📌 Loại câu hỏi:
      // - 'multiple_choice' = Trắc nghiệm nhiều đáp án (A, B, C, D)
      // - 'true_false' = Đúng/Sai
      // - 'short_answer' = Tự luận ngắn
      //
      // 🎯 VÍ DỤ:
      // Multiple Choice: "JavaScript là gì? A) Ngôn ngữ B) Framework..."
      // True/False: "JavaScript là ngôn ngữ lập trình. Đúng/Sai?"
      // Short Answer: "Giải thích khái niệm Closure trong JS"

      correctAnswer: req.body.correctAnswer || req.body.correct_answer,
      correct_answer: req.body.correct_answer || req.body.correctAnswer
      // 📌 Đáp án đúng
      // - Nếu multiple_choice: số index (0, 1, 2, 3 = A, B, C, D)
      // - Nếu true_false: boolean (true/false)
      // - Nếu short_answer: string mẫu
    };

    const newQuestion = await Question.create(questionData);
    // 📌 GỌI MODEL ĐỂ TẠO QUESTION! ⭐
    // - Question.create() lưu vào Firestore collection "questions"
    // - Trả về Question object với id

    res.status(201).json({
    // 📌 Status 201 = Created (tạo thành công)

      success: true,
      data: newQuestion.toJSON()
      // 📌 Convert Question object → plain object để gửi về client
    });

  } catch (err) {
    console.error("Create Question Error:", err);
    res.status(400).json({ success: false, error: err.message });
    // 📌 Status 400 = Bad Request (dữ liệu không hợp lệ)
  }
};

// ============================================================================
// FUNCTION 2: LẤY CÂU HỎI THEO QUIZ ID (GET QUESTIONS BY QUIZ)
// ============================================================================
// Lấy câu hỏi theo quizId
exports.getQuestionsByQuiz = async (req, res) => {
// 📌 Lấy TẤT CẢ câu hỏi của 1 quiz cụ thể
// - Dùng khi học sinh mở quiz để làm bài
//
// 🎯 VÍ DỤ THỰC TẾ:
// Student An click vào quiz "JavaScript Cơ Bản":
// 1. Frontend gửi GET /api/questions?quizId=quiz123
// 2. Server tìm tất cả câu hỏi có quiz_id = quiz123
// 3. Trả về 10 câu hỏi
// 4. Frontend hiển thị từng câu cho student làm

  try {
    // Support both camelCase and snake_case
    const quizId = req.query.quizId || req.query.quiz_id;
    // 📌 Lấy quizId từ query params
    // - URL: /api/questions?quizId=quiz123
    // - req.query = { quizId: 'quiz123' }
    // - Hỗ trợ cả 2 tên: quizId và quiz_id

    if (!quizId) {
    // 📌 Validate: phải có quizId
      return res.status(400).json({ success: false, error: 'Quiz ID is required' });
      // 📌 Status 400 = Bad Request
    }

    const questions = await Question.findByQuizId(quizId);
    // 📌 GỌI MODEL ĐỂ TÌM QUESTIONS! ⭐
    // - Model query Firestore: WHERE quiz_id = quizId
    // - Trả về array các Question objects
    //
    // 🎯 VÍ DỤ KẾT QUẢ:
    // questions = [
    //   {
    //     id: 'q1',
    //     quiz_id: 'quiz123',
    //     question_text: 'JavaScript là gì?',
    //     question_type: 'multiple_choice',
    //     options: ['Ngôn ngữ lập trình', 'Framework', 'Database', 'Trình duyệt'],
    //     correct_answer: 0
    //   },
    //   {
    //     id: 'q2',
    //     quiz_id: 'quiz123',
    //     question_text: 'Cách khai báo biến?',
    //     question_type: 'multiple_choice',
    //     options: ['var x = 5', 'int x = 5', 'string x = 5', 'x := 5'],
    //     correct_answer: 0
    //   },
    //   ... (8 câu nữa)
    // ]

    res.status(200).json({
      success: true,
      data: questions.map(q => q.toJSON())
      // 📌 `.map()` = transform từng Question object → plain object
      // - q => q.toJSON() = với mỗi question q, gọi q.toJSON()
      // - Kết quả: array các plain objects thay vì Question class instances
    });

  } catch (err) {
    console.error("Get Questions By Quiz Error:", err);
    res.status(500).json({ success: false, error: err.message });
    // 📌 Status 500 = Internal Server Error
  }
};

// ============================================================================
// 📚 TÓM TẮT FILE NÀY
// ============================================================================
// File questionController.js chứa 2 functions xử lý QUESTIONS:
//
// 1. createQuestion (POST /api/questions)
//    - Tạo câu hỏi mới cho quiz
//    - Support dual naming (camelCase + snake_case)
//    - 3 loại câu hỏi: multiple_choice, true_false, short_answer
//    - Gọi Question.create()
//
// 2. getQuestionsByQuiz (GET /api/questions?quizId=...)
//    - Lấy tất cả câu hỏi của 1 quiz
//    - Validate quizId bắt buộc
//    - Gọi Question.findByQuizId()
//    - Transform Question objects → plain objects bằng .map()
//
// ============================================================================
// 🔑 KEY CONCEPTS
// ============================================================================
// - Dual naming support = hỗ trợ cả camelCase và snake_case
//   + Tương thích với code cũ và code mới
//   + Dùng OR operator: quizId || quiz_id
//
// - Question types:
//   + multiple_choice: Trắc nghiệm (A, B, C, D)
//   + true_false: Đúng/Sai
//   + short_answer: Tự luận ngắn
//
// - `.map()` = transform array
// - `.toJSON()` = convert object → plain object
//
// ============================================================================
// 📊 REAL-WORLD ANALOGY
// ============================================================================
//
// 📝 Question Controller giống như HỆ THỐNG SOẠN ĐỀ THI:
//
// 1. createQuestion = Giáo viên soạn câu hỏi mới cho đề thi
//    - Nhập câu hỏi
//    - Chọn loại câu hỏi (trắc nghiệm/tự luận)
//    - Nhập đáp án
//    - Lưu vào ngân hàng đề
//
// 2. getQuestionsByQuiz = Học sinh nhận đề thi
//    - Mở đề "Kiểm tra Toán Chương 1"
//    - Nhận 10 câu hỏi
//    - Bắt đầu làm bài
//
// FLOW ĐỀ THI:
// Teacher tạo quiz → Thêm 10 câu hỏi (createQuestion x10)
//                          ↓
//                    Lưu vào database
//                          ↓
// Student làm quiz → Lấy 10 câu hỏi (getQuestionsByQuiz)
//                          ↓
//                    Hiển thị từng câu
//                          ↓
//                    Student trả lời
//                          ↓
//                    Chấm điểm (Grade Controller)
//
// ============================================================================
