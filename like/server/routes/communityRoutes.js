// ============================================
// FILE NÀY LÀM GÌ? 🤔
// ============================================
// File này giống như "BẢN ĐỒ CHỈ ĐƯỜNG" cho tính năng CỘNG ĐỒNG!
// Trong website học online, không chỉ có học một mình, mà còn có:
// - Kết bạn với học viên khác 👫
// - Tham gia nhóm học tập 👥
// - Xem bảng xếp hạng 🏆
// - Trao đổi trong diễn đàn 💬
//
// File này định nghĩa các đường dẫn (routes) để:
// - Xem tiến độ học tập của bạn 📊
// - Xem bảng xếp hạng học tập 🥇
// - Xem trạng thái bạn bè 🤝
// - Tạo/tham gia nhóm học tập 📚
// - Gửi tin nhắn trong nhóm 💬
//
// File này KHÔNG XỬ LÝ logic, chỉ CHỈ ĐƯỜNG đến controller xử lý!

// ============================================
// GIẢI THÍCH KHÁI NIỆM COMMUNITY (CỘNG ĐỒNG) 👥
// ============================================
// Community là gì?
// - Community = Cộng đồng
// - Giống như: Lớp học của bạn → Có nhiều bạn cùng học
// - Trong website học online:
//   + Bạn học cùng nhiều học viên khác
//   + Có thể kết bạn, trao đổi
//   + Thi đua học tập (xem ai học nhiều nhất)
//
// Tại sao cần tính năng cộng đồng?
// - Học một mình thì buồn, học cùng bạn thì vui!
// - Thi đua học tập → Động lực học tập cao hơn
// - Hỏi đáp, giúp đỡ lẫn nhau
// - Tạo môi trường học tập tích cực

// ============================================
// GIẢI THÍCH KHÁI NIỆM STUDY GROUP (NHÓM HỌC TẬP) 📚
// ============================================
// Study Group là gì?
// - Study Group = Nhóm học tập
// - Giống như: Nhóm học nhỏ trong lớp (nhóm 1, nhóm 2, nhóm 3)
// - Mỗi nhóm có:
//   + Tên nhóm (ví dụ: "Nhóm JavaScript cơ bản")
//   + Mô tả (giới thiệu về nhóm)
//   + Giáo viên tạo nhóm (group creator)
//   + Danh sách thành viên
//   + Diễn đàn riêng để trao đổi
//
// Tại sao cần nhóm học tập?
// - Học theo nhóm hiệu quả hơn
// - Có diễn đàn riêng để hỏi đáp
// - Giáo viên dễ quản lý học viên
// - Học viên có động lực học tập

// ============================================
// BƯỚC 1: LẤY CÔNG CỤ CẦN THIẾT 🛠️
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// const express = require('express'):
// - Mượn thư viện Express (framework xây dựng website)
// - Express giống như "bộ lego" có sẵn để xây nhà
const express = require('express');

// GIẢI THÍCH CÚ PHÁP:
// const router = express.Router():
// - Tạo một "bộ định tuyến" (router)
// - Router giống như tấm bảng chỉ đường nhỏ
// - Dùng để định nghĩa nhiều route (đường đi)
const router = express.Router();

// GIẢI THÍCH CÚ PHÁP:
// const communityController = require(...):
// - Mượn communityController
// - Controller chứa các hàm xử lý logic cho cộng đồng
// - Ví dụ: Hàm lấy bảng xếp hạng, hàm lấy trạng thái bạn bè
const communityController = require('../controllers/communityController');

// GIẢI THÍCH CÚ PHÁP:
// const groupController = require(...):
// - Mượn groupController
// - Controller chứa các hàm xử lý logic cho nhóm học tập
// - Ví dụ: Hàm tạo nhóm, hàm tham gia nhóm, hàm xóa nhóm
const groupController = require('../controllers/groupController');

// GIẢI THÍCH CÚ PHÁP:
// const groupMessageController = require(...):
// - Mượn groupMessageController
// - Controller chứa các hàm xử lý logic cho TIN NHẮN TRONG NHÓM
// - Ví dụ: Hàm gửi tin nhắn, hàm lấy danh sách tin nhắn
const groupMessageController = require('../controllers/groupMessageController');

// ============================================
// PHẦN 1: ROUTES CHO CỘNG ĐỒNG (COMMUNITY) 🌍
// ============================================

// ============================================
// ROUTE 1: LẤY TIẾN TRÌNH HỌC TẬP CÁ NHÂN 📊
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.get('/progress', ...):
// - Định nghĩa route với phương thức GET
// - GET: Phương thức LẤY dữ liệu
// - '/progress': Đường dẫn
// - communityController.getUserProgress: Hàm xử lý
//
// URL đầy đủ: GET /api/community/progress
// (Giả sử trong server.js có: app.use('/api/community', communityRoutes))
//
// Cách hoạt động:
// 1. User muốn xem tiến trình học tập của mình
// 2. Frontend gửi GET đến /api/community/progress
// 3. Hàm getUserProgress() sẽ:
//    - Lấy userId từ token (user đã đăng nhập)
//    - Truy vấn database lấy tiến trình học tập
//    - Tính toán: Số khóa học đã hoàn thành, số lesson đã học, v.v.
//    - Trả về thông tin cho user
//
// Thông tin trả về:
// {
//   coursesCompleted: 5,        // Đã hoàn thành 5 khóa học
//   lessonsCompleted: 50,       // Đã học 50 bài
//   totalPoints: 1000,          // Tổng điểm: 1000
//   rank: "Gold"                // Hạng: Vàng
// }
router.get('/progress', communityController.getUserProgress);

// ============================================
// ROUTE 2: LẤY BẢNG XẾP HẠNG 🏆
// ============================================
// GIẢI THÍCH:
// Route này dùng để LẤY BẢNG XẾP HẠNG học tập
//
// URL đầy đủ: GET /api/community/leaderboard
//
// Cách hoạt động:
// 1. User muốn xem bảng xếp hạng (ai học giỏi nhất, ai có điểm cao nhất)
// 2. Frontend gửi GET đến /api/community/leaderboard
// 3. Hàm getLeaderboard() sẽ:
//    - Lấy TẤT CẢ users trong database
//    - Tính điểm của từng user (dựa vào số khóa học hoàn thành, số quiz pass, v.v.)
//    - Sắp xếp theo điểm giảm dần (cao nhất → thấp nhất)
//    - Trả về top 10 users có điểm cao nhất
//
// Thông tin trả về:
// [
//   {
//     rank: 1,                    // Hạng 1
//     userId: "abc123",
//     userName: "Nguyễn Văn A",
//     avatarUrl: "...",
//     points: 5000,               // 5000 điểm
//     coursesCompleted: 10        // Hoàn thành 10 khóa học
//   },
//   {
//     rank: 2,
//     userId: "xyz789",
//     userName: "Trần Thị B",
//     points: 4500,
//     coursesCompleted: 9
//   },
//   ...
// ]
router.get('/leaderboard', communityController.getLeaderboard);

// ============================================
// ROUTE 3: LẤY TRẠNG THÁI BẠN BÈ 🤝
// ============================================
// GIẢI THÍCH:
// Route này dùng để LẤY THÔNG TIN BẠN BÈ
//
// URL đầy đủ: GET /api/community/friends
//
// Cách hoạt động:
// 1. User muốn xem danh sách bạn bè và trạng thái của họ
//    (Đang học gì? Đã hoàn thành khóa học nào? v.v.)
// 2. Frontend gửi GET đến /api/community/friends
// 3. Hàm getFriendsStatus() sẽ:
//    - Lấy userId từ token
//    - Tìm danh sách bạn bè của user
//    - Lấy trạng thái của từng bạn bè:
//      + Đang học khóa học gì
//      + Tiến độ học tập
//      + Đã hoàn thành bao nhiêu khóa học
//    - Trả về danh sách bạn bè kèm trạng thái
//
// Thông tin trả về:
// [
//   {
//     friendId: "abc123",
//     friendName: "Nguyễn Văn A",
//     avatarUrl: "...",
//     status: "Đang học JavaScript cơ bản",
//     progress: 75,               // 75% khóa học
//     coursesCompleted: 5
//   },
//   {
//     friendId: "xyz789",
//     friendName: "Trần Thị B",
//     status: "Vừa hoàn thành Python cho người mới bắt đầu",
//     progress: 100,
//     coursesCompleted: 8
//   },
//   ...
// ]
router.get('/friends', communityController.getFriendsStatus);

// ============================================
// PHẦN 2: ROUTES CHO NHÓM HỌC TẬP (STUDY GROUPS) 📚
// ============================================

// ============================================
// ROUTE 4: TẠO NHÓM HỌC TẬP MỚI ✨
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.post('/groups', ...):
// - Định nghĩa route với phương thức POST
// - POST: Phương thức GỬI dữ liệu (để tạo mới)
// - '/groups': Đường dẫn
// - groupController.createStudyGroup: Hàm xử lý
//
// URL đầy đủ: POST /api/community/groups
//
// QUAN TRỌNG:
// Route này chỉ dành cho GIÁO VIÊN (Teachers only)
// Học viên (student) KHÔNG ĐƯỢC PHÉP tạo nhóm
//
// Cách hoạt động:
// 1. Giáo viên muốn tạo nhóm học tập mới
// 2. Giáo viên điền form: Tên nhóm, mô tả, khóa học liên quan
// 3. Frontend gửi POST đến /api/community/groups kèm dữ liệu:
//    Body: {
//      name: "Nhóm học JavaScript cơ bản",
//      description: "Nhóm dành cho học viên đang học JS",
//      courseId: "xyz789"
//    }
// 4. Hàm createStudyGroup() sẽ:
//    - Kiểm tra user có phải giáo viên không (role === 'teacher')
//    - Nếu không → Trả về lỗi "Chỉ giáo viên mới được tạo nhóm"
//    - Nếu có → Tạo nhóm mới
//    - Lưu vào database
//    - Trả về thông tin nhóm
router.post('/groups', groupController.createStudyGroup);

// ============================================
// ROUTE 5: LẤY TẤT CẢ NHÓM HỌC TẬP 📋
// ============================================
// GIẢI THÍCH:
// Route này dùng để LẤY DANH SÁCH TẤT CẢ NHÓM HỌC TẬP
//
// URL đầy đủ: GET /api/community/groups
//
// Cách hoạt động:
// 1. User muốn xem danh sách tất cả nhóm học tập để tham gia
// 2. Frontend gửi GET đến /api/community/groups
// 3. Hàm getStudyGroups() sẽ:
//    - Truy vấn database lấy tất cả nhóm
//    - Trả về danh sách nhóm kèm thông tin:
//      + Tên nhóm
//      + Mô tả
//      + Số lượng thành viên
//      + Giáo viên tạo nhóm
//      + Khóa học liên quan
//
// Thông tin trả về:
// [
//   {
//     groupId: "group123",
//     name: "Nhóm học JavaScript cơ bản",
//     description: "Nhóm dành cho học viên đang học JS",
//     memberCount: 25,             // 25 thành viên
//     teacherName: "Nguyễn Văn A",
//     courseId: "xyz789",
//     courseName: "JavaScript cơ bản"
//   },
//   {
//     groupId: "group456",
//     name: "Nhóm học Python nâng cao",
//     description: "Nhóm dành cho học viên đã biết Python cơ bản",
//     memberCount: 15,
//     teacherName: "Trần Thị B",
//     courseId: "abc123",
//     courseName: "Python nâng cao"
//   },
//   ...
// ]
router.get('/groups', groupController.getStudyGroups);

// ============================================
// ROUTE 6: THAM GIA NHÓM HỌC TẬP 🙋
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.post('/groups/:groupId/join', ...):
// - Định nghĩa route với phương thức POST
// - '/groups/:groupId/join': Đường dẫn có THAM SỐ ĐỘNG
// - :groupId: Placeholder cho group ID
// - Ví dụ: /api/community/groups/group123/join
//   → groupId = "group123"
//
// URL đầy đủ: POST /api/community/groups/:groupId/join
//
// Cách hoạt động:
// 1. User thấy nhóm học tập hay, muốn tham gia
// 2. User bấm nút "Tham gia nhóm"
// 3. Frontend gửi POST đến /api/community/groups/group123/join
// 4. Hàm joinStudyGroup() sẽ:
//    - Lấy userId từ token (user đã đăng nhập)
//    - Lấy groupId từ req.params (group123)
//    - Kiểm tra:
//      + User đã tham gia nhóm này chưa?
//      + Nhóm có tồn tại không?
//      + Nhóm có đầy không? (nếu giới hạn số lượng)
//    - Nếu OK → Thêm user vào nhóm
//    - Lưu vào database
//    - Trả về thông báo "Tham gia thành công"
router.post('/groups/:groupId/join', groupController.joinStudyGroup);

// ============================================
// ROUTE 7: LẤY NHÓM CỦA MỘT USER 👤
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.get('/users/:userId/groups', ...):
// - Định nghĩa route với phương thức GET
// - '/users/:userId/groups': Đường dẫn có THAM SỐ ĐỘNG
// - :userId: Placeholder cho user ID
// - Ví dụ: /api/community/users/abc123/groups
//   → userId = "abc123"
//
// URL đầy đủ: GET /api/community/users/:userId/groups
//
// Cách hoạt động:
// 1. User muốn xem danh sách nhóm mình đã tham gia
// 2. Frontend gửi GET đến /api/community/users/abc123/groups
// 3. Hàm getUserStudyGroups() sẽ:
//    - Lấy userId từ req.params (abc123)
//    - Truy vấn database tìm tất cả nhóm mà user này là thành viên
//    - Trả về danh sách nhóm
//
// Thông tin trả về:
// [
//   {
//     groupId: "group123",
//     name: "Nhóm học JavaScript cơ bản",
//     memberCount: 25,
//     role: "member"              // Vai trò: Thành viên
//   },
//   {
//     groupId: "group456",
//     name: "Nhóm học Python nâng cao",
//     memberCount: 15,
//     role: "creator"             // Vai trò: Người tạo nhóm (nếu là giáo viên)
//   },
//   ...
// ]
router.get('/users/:userId/groups', groupController.getUserStudyGroups);

// ============================================
// ROUTE 8: CẬP NHẬT NHÓM HỌC TẬP ✏️
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.put('/groups/:groupId', ...):
// - Định nghĩa route với phương thức PUT
// - PUT: Phương thức CẬP NHẬT dữ liệu
// - '/groups/:groupId': Đường dẫn có THAM SỐ ĐỘNG
//
// URL đầy đủ: PUT /api/community/groups/:groupId
//
// QUAN TRỌNG:
// Route này chỉ dành cho GIÁO VIÊN TẠO NHÓM (Teachers only)
// Học viên hoặc giáo viên khác KHÔNG ĐƯỢC PHÉP sửa
//
// Cách hoạt động:
// 1. Giáo viên muốn sửa thông tin nhóm (tên, mô tả)
// 2. Giáo viên gửi PUT đến /api/community/groups/group123 kèm dữ liệu:
//    Body: {
//      name: "Nhóm học JavaScript nâng cao",  // Sửa tên
//      description: "..."                       // Sửa mô tả
//    }
// 3. Hàm updateStudyGroup() sẽ:
//    - Kiểm tra user có phải người tạo nhóm không
//    - Nếu không → Trả về lỗi "Bạn không có quyền sửa nhóm này"
//    - Nếu có → Cập nhật thông tin nhóm
//    - Lưu vào database
//    - Trả về nhóm đã cập nhật
router.put('/groups/:groupId', groupController.updateStudyGroup);

// ============================================
// ROUTE 9: XÓA NHÓM HỌC TẬP ❌
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.delete('/groups/:groupId', ...):
// - Định nghĩa route với phương thức DELETE
// - DELETE: Phương thức XÓA dữ liệu
// - '/groups/:groupId': Đường dẫn có THAM SỐ ĐỘNG
//
// URL đầy đủ: DELETE /api/community/groups/:groupId
//
// QUAN TRỌNG:
// Route này chỉ dành cho GIÁO VIÊN TẠO NHÓM (Teachers only)
//
// Cách hoạt động:
// 1. Giáo viên muốn xóa nhóm (ví dụ: khóa học đã kết thúc)
// 2. Giáo viên gửi DELETE đến /api/community/groups/group123
// 3. Hàm deleteStudyGroup() sẽ:
//    - Kiểm tra user có phải người tạo nhóm không
//    - Nếu không → Trả về lỗi "Bạn không có quyền xóa nhóm này"
//    - Nếu có → Xóa nhóm khỏi database
//    - Xóa tất cả tin nhắn trong nhóm (nếu có)
//    - Trả về thông báo "Xóa thành công"
router.delete('/groups/:groupId', groupController.deleteStudyGroup);

// ============================================
// PHẦN 3: ROUTES CHO DIỄN ĐÀN NHÓM (FORUM) 💬
// ============================================

// ============================================
// ROUTE 10: LẤY TIN NHẮN TRONG NHÓM 📥
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.get('/groups/:groupId/messages', ...):
// - Định nghĩa route với phương thức GET
// - '/groups/:groupId/messages': Đường dẫn có THAM SỐ ĐỘNG
// - :groupId: Placeholder cho group ID
//
// URL đầy đủ: GET /api/community/groups/:groupId/messages
//
// Cách hoạt động:
// 1. User vào trang diễn đàn của nhóm
// 2. Frontend gửi GET đến /api/community/groups/group123/messages
// 3. Hàm getGroupMessages() sẽ:
//    - Kiểm tra user có phải thành viên nhóm không
//    - Nếu không → Trả về lỗi "Bạn phải tham gia nhóm mới xem được"
//    - Nếu có → Lấy tất cả tin nhắn trong nhóm
//    - Sắp xếp theo thời gian (mới nhất → cũ nhất)
//    - Trả về danh sách tin nhắn
//
// Thông tin trả về:
// [
//   {
//     messageId: "msg123",
//     userId: "abc123",
//     userName: "Nguyễn Văn A",
//     avatarUrl: "...",
//     content: "Chào mọi người! Mình có câu hỏi về JavaScript...",
//     timestamp: "2024-01-15T10:30:00Z",
//     likes: 5
//   },
//   {
//     messageId: "msg456",
//     userId: "xyz789",
//     userName: "Trần Thị B",
//     content: "Mình có thể giúp bạn...",
//     timestamp: "2024-01-15T10:35:00Z",
//     likes: 2
//   },
//   ...
// ]
router.get('/groups/:groupId/messages', groupMessageController.getGroupMessages);

// ============================================
// ROUTE 11: GỬI TIN NHẮN VÀO NHÓM 📤
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.post('/groups/:groupId/messages', ...):
// - Định nghĩa route với phương thức POST
// - POST: Phương thức GỬI dữ liệu
// - '/groups/:groupId/messages': Đường dẫn có THAM SỐ ĐỘNG
//
// URL đầy đủ: POST /api/community/groups/:groupId/messages
//
// Cách hoạt động:
// 1. User viết tin nhắn trong diễn đàn nhóm
// 2. User bấm "Gửi"
// 3. Frontend gửi POST đến /api/community/groups/group123/messages kèm dữ liệu:
//    Body: {
//      content: "Chào mọi người! Mình có câu hỏi..."
//    }
// 4. Hàm postGroupMessage() sẽ:
//    - Kiểm tra user có phải thành viên nhóm không
//    - Nếu không → Trả về lỗi "Bạn phải tham gia nhóm mới gửi được tin nhắn"
//    - Nếu có → Tạo tin nhắn mới
//    - Lưu vào database
//    - Trả về tin nhắn vừa gửi
//    - (Optional) Gửi thông báo cho các thành viên khác
router.post('/groups/:groupId/messages', groupMessageController.postGroupMessage);

// ============================================
// BƯỚC 2: XUẤT ROUTER RA NGOÀI 📤
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// module.exports = router:
// - Xuất router để file khác có thể dùng
// - Trong server.js có thể:
//   const communityRoutes = require('./routes/communityRoutes');
//   app.use('/api/community', communityRoutes);
module.exports = router;

// ============================================
// TÓM TẮT: FILE NÀY LÀM GÌ? 📚
// ============================================
// File này là ROUTE FILE cho tính năng cộng đồng với 11 routes:
//
// PHẦN 1: CỘNG ĐỒNG (3 routes)
// 1. GET /progress → Lấy tiến trình học tập cá nhân
// 2. GET /leaderboard → Lấy bảng xếp hạng
// 3. GET /friends → Lấy trạng thái bạn bè
//
// PHẦN 2: NHÓM HỌC TẬP (6 routes)
// 4. POST /groups → Tạo nhóm mới (chỉ giáo viên)
// 5. GET /groups → Lấy tất cả nhóm
// 6. POST /groups/:groupId/join → Tham gia nhóm
// 7. GET /users/:userId/groups → Lấy nhóm của 1 user
// 8. PUT /groups/:groupId → Cập nhật nhóm (chỉ người tạo)
// 9. DELETE /groups/:groupId → Xóa nhóm (chỉ người tạo)
//
// PHẦN 3: DIỄN ĐÀN NHÓM (2 routes)
// 10. GET /groups/:groupId/messages → Lấy tin nhắn trong nhóm
// 11. POST /groups/:groupId/messages → Gửi tin nhắn vào nhóm
//
// CÁCH SỬ DỤNG:
// Trong server.js:
// app.use('/api/community', communityRoutes);
//
// Kết quả:
// - Tất cả route có prefix "/api/community"
// - Ví dụ: router.get('/progress') → GET /api/community/progress
//
// VÍ DỤ THỰC TẾ:
// 1. User vào trang Cộng đồng
// 2. Frontend gọi:
//    - GET /api/community/progress → Lấy tiến trình cá nhân
//    - GET /api/community/leaderboard → Lấy bảng xếp hạng
// 3. User bấm "Tham gia nhóm học tập"
// 4. Frontend gọi:
//    - GET /api/community/groups → Lấy danh sách nhóm
// 5. User chọn nhóm và bấm "Tham gia"
// 6. Frontend gọi:
//    - POST /api/community/groups/group123/join → Tham gia nhóm
// 7. User vào diễn đàn nhóm
// 8. Frontend gọi:
//    - GET /api/community/groups/group123/messages → Lấy tin nhắn
// 9. User viết tin nhắn và bấm "Gửi"
// 10. Frontend gọi:
//     - POST /api/community/groups/group123/messages → Gửi tin nhắn
//
// KEYWORD MỚI:
// - Community: Cộng đồng
// - Study Group: Nhóm học tập
// - Leaderboard: Bảng xếp hạng
// - Forum: Diễn đàn
// - Message: Tin nhắn
// - Member: Thành viên
// - Join: Tham gia
// - Role: Vai trò
