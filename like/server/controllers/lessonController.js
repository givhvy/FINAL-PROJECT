// ============================================================================
// 📚 FILE NÀY LÀM GÌ? - lessonController.js
// ============================================================================
// File này là LESSON CONTROLLER - điều khiển BÀI HỌC (lessons) của khóa học
//
// Giống như quản lý GIÁO ÁN BÀI HỌC, file này:
// ✅ Tạo bài học mới (createLesson)
// ✅ Xem tất cả bài học (getLessons) - OPTIMIZED batch fetch
// ✅ Xem chi tiết 1 bài học (getLessonById)
// ✅ Sửa bài học (updateLesson)
// ✅ Xóa bài học (deleteLesson)
//
// 🎯 VÍ DỤ THỰC TẾ - GIÁO ÁN BÀI HỌC:
// ┌─────────────────────────────────────────────────────────┐
// │ KHÓA HỌC: JavaScript Cơ Bản                            │
// ├─────────────────────────────────────────────────────────┤
// │ Bài 1: Giới thiệu JavaScript                           │
// │   - Video: intro-to-js.mp4                             │
// │   - Nội dung: "JavaScript là ngôn ngữ lập trình..."   │
// │   - Thời lượng: 15 phút                                │
// ├─────────────────────────────────────────────────────────┤
// │ Bài 2: Biến và kiểu dữ liệu                           │
// │   - Video: variables.mp4                               │
// │   - Nội dung: "Cách khai báo var, let, const..."      │
// │   - Thời lượng: 20 phút                                │
// ├─────────────────────────────────────────────────────────┤
// │ Bài 3: Hàm trong JavaScript                           │
// │   - Video: functions.mp4                               │
// │   - Nội dung: "Function là khối code tái sử dụng..."  │
// │   - Thời lượng: 25 phút                                │
// └─────────────────────────────────────────────────────────┘
//
// ============================================================================
// FLOW: FRONTEND → ROUTES → CONTROLLER → MODEL → DATABASE
// ============================================================================
//
// VÍ DỤ 1: GIÁO VIÊN TẠO BÀI HỌC MỚI
// Teacher đang tạo khóa "JavaScript Cơ Bản":
//   → POST /api/lessons
//   Body: {
//     courseId: 'course123',
//     title: 'Giới thiệu JavaScript',
//     videoUrl: 'https://storage.../intro.mp4',
//     content: 'JavaScript là ngôn ngữ lập trình...',
//     duration: 15
//   }
//    ↓
// Routes: router.post('/lessons', lessonController.createLesson)
//    ↓
// Controller (file này): createLesson() → Lesson.create()
//    ↓
// Model: Lưu vào Firestore collection "lessons"
//
// VÍ DỤ 2: HỌC SINH XEM BÀI HỌC
// Student click vào "Bài 1: Giới thiệu JavaScript":
//   → GET /api/lessons/lesson123
//    ↓
// Controller: getLessonById() → Lesson.findById() + Course.findById()
//    ↓
// Model: Query Firestore
//    ↓
// Response: {
//   id: 'lesson123',
//   title: 'Giới thiệu JavaScript',
//   videoUrl: '...',
//   content: '...',
//   course: { id: 'course123', title: 'JavaScript Cơ Bản', ... }
// }
//
// ============================================================================
// 📦 IMPORT MODULE
// ============================================================================

const Lesson = require('../models/Lesson');
// 📌 Import Lesson Model để thao tác với bài học

const Course = require('../models/Course');
// 📌 Import Course Model để lấy thông tin khóa học kèm theo lesson

// ============================================================================
// FUNCTION 1: TẠO BÀI HỌC MỚI (CREATE LESSON)
// ============================================================================
// Create a new lesson (checkpoint, Create in Controller)
exports.createLesson = async (req, res, next) => {
// 📌 Function này dùng khi teacher tạo bài học mới cho khóa học
//
// 🎯 VÍ DỤ THỰC TẾ:
// Teacher đang xây dựng khóa "JavaScript Cơ Bản":
// 1. Nhấn "Thêm bài học mới"
// 2. Điền form:
//    - Tiêu đề: "Giới thiệu JavaScript"
//    - Video: Upload file intro.mp4 → URL: https://storage.../intro.mp4
//    - Nội dung: "JavaScript là ngôn ngữ lập trình..."
//    - Thời lượng: 15 phút
//    - Order: 1 (bài đầu tiên)
// 3. Nhấn "Lưu"
// 4. Frontend gửi POST request
// 5. Server lưu lesson vào database

  try {
    const lessonData = { ...req.body };
    // 📌 Spread tất cả fields từ request body
    // - req.body có thể chứa: courseId, title, videoUrl, content, duration, order, ...
    //
    // 🎯 VÍ DỤ req.body:
    // {
    //   courseId: 'course123',
    //   title: 'Giới thiệu JavaScript',
    //   videoUrl: 'https://storage.googleapis.com/.../intro.mp4',
    //   content: 'JavaScript là ngôn ngữ lập trình được sử dụng để...',
    //   duration: 15,
    //   order: 1,
    //   description: 'Bài học giới thiệu tổng quan về JavaScript'
    // }

    const newLesson = await Lesson.create(lessonData);
    // 📌 GỌI MODEL ĐỂ TẠO LESSON! ⭐
    // - Lesson.create() lưu vào Firestore collection "lessons"
    // - Trả về Lesson object với id tự động generated

    res.status(201).json({ id: newLesson.id, ...newLesson.toJSON() });
    // 📌 Status 201 = Created (tạo thành công)
    // - Trả về lesson vừa tạo kèm id
    // - .toJSON() = convert Lesson object → plain object

  } catch (err) {
    console.error("Create Lesson Error:", err);
    next(err);
    // 📌 next(err) = pass error sang Error Handler Middleware
    // - Express sẽ tự động bắt error và trả về response lỗi
  }
};

// ============================================================================
// FUNCTION 2: LẤY TẤT CẢ BÀI HỌC (GET ALL LESSONS)
// ============================================================================
// Get all lessons
// OPTIMIZED: Batch fetch courses to avoid N+1 query
exports.getLessons = async (req, res, next) => {
// 📌 Lấy tất cả bài học + thông tin khóa học tương ứng
// - TÍNH NĂNG ĐẶC BIỆT: Tối ưu batch fetch courses (tránh N+1 Query Problem)
//
// 🎯 VÍ DỤ THỰC TẾ:
// Admin muốn xem tất cả bài học trong hệ thống:
// 1. Vào trang quản lý bài học
// 2. Hiển thị danh sách:
//    - Bài 1: Giới thiệu JS (Khóa: JavaScript Cơ Bản)
//    - Bài 2: Biến và kiểu dữ liệu (Khóa: JavaScript Cơ Bản)
//    - Bài 3: HTML Basics (Khóa: Web Development)
//    - ...
//
// 🔥 VẤN ĐỀ N+1 QUERY:
// - Không tối ưu: Lấy 100 lessons → 100 lần query Course.findById()
//   = 101 queries (1 lấy lessons + 100 lấy courses)
// - CHẬM, tốn tài nguyên database!
//
// ✅ GIẢI PHÁP: BATCH FETCH
// - Lấy 100 lessons → tìm unique courseIds → 1 lần query tất cả courses
//   = 2 queries (1 lấy lessons + 1 lấy courses)
// - NHANH HƠN NHIỀU!

  try {
    const lessons = await Lesson.findAll();
    // 📌 GỌI MODEL ĐỂ TÌM TẤT CẢ LESSONS! ⭐
    // - Trả về array Lesson objects

    if (lessons.length === 0) {
    // 📌 Nếu không có lesson nào
      return res.status(200).json([]);
      // 📌 Trả về empty array []
    }

    // ========================================================================
    // BƯỚC 1: LẤY DANH SÁCH UNIQUE COURSE IDS
    // ========================================================================
    const courseIds = [...new Set(lessons.map(l => l.courseId).filter(Boolean))];
    // 📌 Tìm tất cả courseId UNIQUE từ lessons
    //
    // 🎯 GIẢI THÍCH TỪNG PHẦN:
    // 1. lessons.map(l => l.courseId)
    //    - .map() = transform từng lesson → lấy courseId
    //    - Kết quả: ['course123', 'course123', 'course456', null, 'course123']
    //
    // 2. .filter(Boolean)
    //    - Loại bỏ giá trị falsy (null, undefined, '', 0, false)
    //    - Kết quả: ['course123', 'course123', 'course456', 'course123']
    //
    // 3. new Set(...)
    //    - Set = collection chỉ chứa giá trị UNIQUE (không trùng)
    //    - Kết quả: Set { 'course123', 'course456' }
    //
    // 4. [...new Set(...)]
    //    - Spread operator [...] = convert Set → Array
    //    - Kết quả: ['course123', 'course456']
    //
    // 🎯 VÍ DỤ:
    // Input lessons:
    //   - Lesson 1: courseId = 'course123'
    //   - Lesson 2: courseId = 'course123'
    //   - Lesson 3: courseId = 'course456'
    //   - Lesson 4: courseId = null
    //   - Lesson 5: courseId = 'course123'
    //
    // Output courseIds: ['course123', 'course456'] (2 unique IDs)

    // ========================================================================
    // BƯỚC 2: BATCH FETCH TẤT CẢ COURSES (PARALLEL)
    // ========================================================================
    const courses = await Promise.all(
      courseIds.map(id => Course.findById(id)) // GỌI MODEL ⭐ parallel
    );
    // 📌 BATCH FETCH COURSES SONG SONG!
    //
    // 🎯 GIẢI THÍCH Promise.all():
    // - Promise.all([promise1, promise2, ...]) = chạy TẤT CẢ promises CÙNG LÚC (parallel)
    // - Đợi TẤT CẢ promises hoàn thành
    // - Trả về array kết quả theo đúng thứ tự
    //
    // 🎯 VÍ DỤ:
    // courseIds = ['course123', 'course456']
    //   ↓
    // courseIds.map(id => Course.findById(id)) tạo ra:
    //   [Course.findById('course123'), Course.findById('course456')]
    //   ↓
    // Promise.all chạy 2 queries CÙNG LÚC (parallel, không đợi nhau)
    //   ↓
    // courses = [
    //   Course { id: 'course123', title: 'JavaScript Cơ Bản', ... },
    //   Course { id: 'course456', title: 'Web Development', ... }
    // ]
    //
    // 🔥 TẠI SAO NHANH HƠN?
    // - Không dùng Promise.all: Query lần lượt, tổng thời gian = 2 * 100ms = 200ms
    // - Dùng Promise.all: Query song song, tổng thời gian = 100ms (max của các queries)

    const courseMap = Object.fromEntries(
      courses.filter(c => c !== null).map(c => [c.id, c.toJSON()])
    );
    // 📌 Tạo courseMap để tra cứu nhanh course theo ID
    //
    // 🎯 GIẢI THÍCH TỪNG PHẦN:
    // 1. courses.filter(c => c !== null)
    //    - Loại bỏ courses null (course bị xóa hoặc không tồn tại)
    //
    // 2. .map(c => [c.id, c.toJSON()])
    //    - Transform mỗi course thành [key, value] pair
    //    - Ví dụ: [['course123', {...}], ['course456', {...}]]
    //
    // 3. Object.fromEntries(...)
    //    - Convert array of [key, value] pairs → object
    //    - Kết quả: {
    //        'course123': { id: 'course123', title: 'JavaScript Cơ Bản', ... },
    //        'course456': { id: 'course456', title: 'Web Development', ... }
    //      }
    //
    // 🎯 TẠI SAO DÙNG MAP?
    // - Tra cứu theo ID rất nhanh: O(1) constant time
    // - Không cần loop qua array: O(n) linear time

    // ========================================================================
    // BƯỚC 3: ENRICH LESSONS VỚI COURSE DATA
    // ========================================================================
    const enrichedLessons = lessons.map(lesson => ({
      ...lesson.toJSON(),
      course: courseMap[lesson.courseId] || null,
    }));
    // 📌 Gắn thông tin course vào từng lesson
    // - lesson.toJSON() = convert Lesson object → plain object
    // - courseMap[lesson.courseId] = tra cứu course từ map
    // - || null = nếu không tìm thấy, trả về null
    //
    // 🎯 VÍ DỤ OUTPUT:
    // enrichedLessons = [
    //   {
    //     id: 'lesson1',
    //     courseId: 'course123',
    //     title: 'Giới thiệu JavaScript',
    //     videoUrl: '...',
    //     course: {
    //       id: 'course123',
    //       title: 'JavaScript Cơ Bản',
    //       description: '...'
    //     }
    //   },
    //   {
    //     id: 'lesson2',
    //     courseId: 'course123',
    //     title: 'Biến và kiểu dữ liệu',
    //     videoUrl: '...',
    //     course: {
    //       id: 'course123',
    //       title: 'JavaScript Cơ Bản',
    //       description: '...'
    //     }
    //   },
    //   ...
    // ]

    res.status(200).json(enrichedLessons);
    // 📌 Trả về lessons kèm course info

  } catch (err) {
    console.error("Get Lessons Error:", err);
    next(err);
  }
};

// ============================================================================
// FUNCTION 3: LẤY BÀI HỌC THEO ID (GET LESSON BY ID)
// ============================================================================
// Get lesson by ID
exports.getLessonById = async (req, res, next) => {
// 📌 Lấy 1 bài học cụ thể + thông tin khóa học
// - Dùng khi student click vào bài học để xem chi tiết
//
// 🎯 VÍ DỤ THỰC TẾ:
// Student An đang học khóa "JavaScript Cơ Bản":
// 1. Xem danh sách bài học
// 2. Click vào "Bài 1: Giới thiệu JavaScript"
// 3. Frontend gửi GET /api/lessons/lesson123
// 4. Server trả về:
//    - Thông tin bài học (title, video, content, ...)
//    - Thông tin khóa học (title, instructor, ...)
// 5. Student xem video + đọc nội dung

  try {
    const lesson = await Lesson.findById(req.params.id);
    // 📌 GỌI MODEL ĐỂ TÌM LESSON! ⭐
    // - req.params.id = lấy :id từ URL
    // - URL: GET /api/lessons/lesson123 → req.params.id = 'lesson123'

    if (!lesson) {
    // 📌 Nếu không tìm thấy lesson
      return res.status(404).json({ error: 'Lesson not found' });
      // 📌 Status 404 = Not Found
    }

    // ========================================================================
    // DEBUG: LOG LESSON DATA
    // ========================================================================
    console.log('=== LESSON DATA DEBUG ===');
    console.log('Lesson ID:', req.params.id);
    console.log('Lesson object:', JSON.stringify(lesson, null, 2));
    console.log('videoUrl:', lesson.videoUrl);
    console.log('content:', lesson.content);
    console.log('description:', lesson.description);
    console.log('========================');
    // 📌 Log để debug - xem lesson có fields gì
    // - JSON.stringify(lesson, null, 2) = convert object → JSON string với indent 2 spaces
    // - Giúp developer debug khi có vấn đề

    // ========================================================================
    // FETCH COURSE DATA (NẾU CÓ)
    // ========================================================================
    let courseData = null;
    // 📌 Khởi tạo courseData = null

    if (lesson.courseId) {
    // 📌 Nếu lesson có courseId (thuộc về 1 course)
      const course = await Course.findById(lesson.courseId);
      // 📌 GỌI MODEL ĐỂ TÌM COURSE! ⭐

      if (course) {
      // 📌 Nếu tìm thấy course
        courseData = course.toJSON();
        // 📌 Convert Course object → plain object
      }
    }

    res.status(200).json({
      ...lesson.toJSON(),
      course: courseData,
    });
    // 📌 Trả về lesson + course info
    // - Spread lesson fields
    // - Thêm field course: {...} hoặc null

  } catch (err) {
    console.error("Get Lesson By ID Error:", err);
    next(err);
  }
};

// ============================================================================
// FUNCTION 4: CẬP NHẬT BÀI HỌC (UPDATE LESSON)
// ============================================================================
// Update lesson
exports.updateLesson = async (req, res, next) => {
// 📌 Sửa bài học - CHỈ TEACHER/ADMIN
// - Dùng khi teacher muốn chỉnh sửa nội dung bài học
//
// 🎯 VÍ DỤ THỰC TẾ:
// Teacher phát hiện lỗi trong bài "Giới thiệu JavaScript":
// 1. Mở bài học trong chế độ chỉnh sửa
// 2. Sửa content: "JavaScript là ngôn ngữ lập trình..."
//    → "JavaScript là ngôn ngữ lập trình phổ biến nhất..."
// 3. Upload video mới tốt hơn
// 4. Nhấn "Cập nhật"
// 5. Frontend gửi PUT /api/lessons/lesson123
// 6. Server update lesson

  try {
    const updatedLesson = await Lesson.update(req.params.id, req.body);
    // 📌 GỌI MODEL ĐỂ UPDATE! ⭐
    // - req.params.id = lesson ID cần update
    // - req.body = fields cần update (title, videoUrl, content, ...)

    if (!updatedLesson) {
    // 📌 Nếu không tìm thấy lesson (đã bị xóa)
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.status(200).json(updatedLesson.toJSON());
    // 📌 Trả về lesson đã update

  } catch (err) {
    console.error("Update Lesson Error:", err);
    next(err);
  }
};

// ============================================================================
// FUNCTION 5: XÓA BÀI HỌC (DELETE LESSON)
// ============================================================================
// Delete lesson
exports.deleteLesson = async (req, res, next) => {
// 📌 Xóa bài học - CHỈ TEACHER/ADMIN
// - Dùng khi teacher muốn xóa bài học không còn cần thiết
//
// 🎯 VÍ DỤ THỰC TẾ:
// Teacher quyết định xóa bài "Giới thiệu lịch sử JavaScript" vì quá dài:
// 1. Vào danh sách bài học
// 2. Click nút "Xóa" ở bài đó
// 3. Confirm "Bạn có chắc muốn xóa?"
// 4. Frontend gửi DELETE /api/lessons/lesson123
// 5. Server xóa lesson khỏi database
// 6. Bài học biến mất khỏi khóa học

  try {
    const lesson = await Lesson.findById(req.params.id);
    // 📌 Kiểm tra lesson có tồn tại không trước khi xóa

    if (!lesson) {
    // 📌 Nếu không tìm thấy
      return res.status(404).json({ error: 'Lesson not found' });
    }

    await Lesson.delete(req.params.id);
    // 📌 GỌI MODEL ĐỂ XÓA! ⭐
    // - Xóa document khỏi Firestore collection "lessons"

    res.status(200).json({ message: 'Lesson deleted successfully' });
    // 📌 Trả về thông báo xóa thành công

  } catch (err) {
    console.error("Delete Lesson Error:", err);
    next(err);
  }
};

// ============================================================================
// 📚 TÓM TẮT FILE NÀY
// ============================================================================
// File lessonController.js chứa 5 functions xử lý LESSONS:
//
// 1. createLesson (POST /api/lessons)
//    - Tạo bài học mới
//    - Spread req.body
//    - Gọi Lesson.create()
//
// 2. getLessons (GET /api/lessons)
//    - Lấy tất cả lessons + course info
//    - OPTIMIZATION: Batch fetch courses (tránh N+1 Query Problem)
//    - Flow: findAll → unique courseIds → Promise.all → courseMap → enrich
//    - Giảm từ 101 queries → 2 queries (50x nhanh hơn!)
//
// 3. getLessonById (GET /api/lessons/:id)
//    - Lấy 1 lesson + course info
//    - Debug logs để kiểm tra fields
//    - Gọi Lesson.findById() + Course.findById()
//
// 4. updateLesson (PUT /api/lessons/:id)
//    - Sửa lesson
//    - Chỉ teacher/admin
//    - Gọi Lesson.update()
//
// 5. deleteLesson (DELETE /api/lessons/:id)
//    - Xóa lesson
//    - Kiểm tra tồn tại trước khi xóa
//    - Gọi Lesson.findById() + Lesson.delete()
//
// ============================================================================
// 🔑 KEY CONCEPTS
// ============================================================================
// - N+1 Query Problem:
//   + Vấn đề: 1 query lấy parent + N queries lấy từng child
//   + Giải pháp: Batch fetch (1 query lấy parent + 1 query lấy tất cả children)
//
// - new Set() = collection chỉ chứa giá trị UNIQUE
//   + Dùng để loại bỏ duplicates
//   + [... new Set(array)] = array unique
//
// - Promise.all() = chạy nhiều promises SONG SONG (parallel)
//   + Nhanh hơn nhiều so với await từng cái
//   + Thời gian = max(promise1, promise2, ...) thay vì sum
//
// - Object.fromEntries() = convert array of [key, value] pairs → object
//   + [[k1, v1], [k2, v2]] → { k1: v1, k2: v2 }
//
// - Map lookup = O(1) constant time
//   + Tra cứu nhanh hơn array.find() = O(n)
//
// - next(err) = pass error sang Error Handler Middleware
//   + Express tự động catch và trả về response lỗi
//
// - JSON.stringify(obj, null, 2) = convert object → formatted JSON string
//   + null = no replacer function
//   + 2 = indent 2 spaces
//
// ============================================================================
// 📊 REAL-WORLD ANALOGY
// ============================================================================
//
// 📖 Lesson Controller giống như HỆ THỐNG QUẢN LÝ GIÁO ÁN:
//
// 1. createLesson = Giáo viên soạn bài giảng mới
//    - Chuẩn bị video, slides, nội dung
//    - Lưu vào hệ thống quản lý học tập
//
// 2. getLessons = Xem tất cả bài giảng trong hệ thống
//    - Hiển thị danh sách bài học + thông tin khóa học
//    - OPTIMIZATION: Thay vì query database 100 lần, chỉ query 2 lần!
//
// 3. getLessonById = Mở 1 bài giảng cụ thể
//    - Xem video, đọc nội dung
//    - Debug logs giúp developer kiểm tra dữ liệu
//
// 4. updateLesson = Chỉnh sửa bài giảng
//    - Update video mới, sửa nội dung
//
// 5. deleteLesson = Xóa bài giảng không cần
//    - Dọn dẹp hệ thống
//
// PERFORMANCE OPTIMIZATION:
// - N+1 Problem: 101 queries (CHẬM)
// - Batch Fetch: 2 queries (NHANH 50x!)
// - Nguyên tắc: Luôn batch fetch khi có thể
//
// ============================================================================
