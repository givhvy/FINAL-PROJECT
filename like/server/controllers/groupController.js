// ============================================================================
// 📚 FILE NÀY LÀM GÌ? - groupController.js
// ============================================================================
// File này là GROUP CONTROLLER - điều khiển NHÓM HỌC TẬP (study groups)
//
// Giống như quản lý LỚP HỌC NHÓM, file này:
// ✅ Tạo nhóm học tập (createStudyGroup) - teacher only
// ✅ Xem danh sách nhóm (getStudyGroups)
// ✅ Xem chi tiết 1 nhóm (getStudyGroupById)
// ✅ Tham gia nhóm (joinStudyGroup)
// ✅ Xem nhóm của user (getUserStudyGroups)
// ✅ Sửa nhóm (updateStudyGroup) - teacher only
// ✅ Xóa nhóm (deleteStudyGroup) - teacher only
//
// 🎯 VÍ DỤ THỰC TẾ - NHÓM HỌC TẬP:
// ┌─────────────────────────────────────────────────────────┐
// │ NHÓM HỌC TẬP: Toán Cao Cấp - Lớp 12A                  │
// ├─────────────────────────────────────────────────────────┤
// │ 👨‍🏫 Giáo viên: Thầy Nguyễn Văn Phong                    │
// │ 📚 Môn học: Toán Cao Cấp                               │
// │ 📝 Mô tả: Nhóm thảo luận bài tập và ôn thi            │
// ├─────────────────────────────────────────────────────────┤
// │ 👥 Thành viên (25):                                     │
// │   - Nguyễn Văn An                                      │
// │   - Trần Thị Bình                                      │
// │   - Lê Văn Cường                                       │
// │   - ...                                                 │
// ├─────────────────────────────────────────────────────────┤
// │ [Tham gia nhóm] [Chat] [Tài liệu]                     │
// └─────────────────────────────────────────────────────────┘
//
// ============================================================================
// FLOW: FRONTEND → ROUTES → CONTROLLER → MODEL → DATABASE
// ============================================================================
//
// VÍ DỤ 1: GIÁO VIÊN TẠO NHÓM HỌC TẬP
// Teacher Phong tạo nhóm "Toán Cao Cấp - 12A":
//   → POST /api/groups
//   Body: {
//     name: 'Toán Cao Cấp - Lớp 12A',
//     description: 'Nhóm thảo luận bài tập và ôn thi',
//     subject: 'Toán',
//     teacher_id: 'teacher123'
//   }
//    ↓
// Routes: router.post('/groups', groupController.createStudyGroup)
//    ↓
// Controller (file này): createStudyGroup() → Group.create()
//    ↓
// Model: Lưu vào Firestore collection "groups"
//
// VÍ DỤ 2: HỌC SINH THAM GIA NHÓM
// Student An muốn tham gia nhóm "Toán Cao Cấp - 12A":
//   → POST /api/groups/group123/join
//   Body: { user_id: 'user123' }
//    ↓
// Controller: joinStudyGroup() → Group.addMember()
//    ↓
// Model: Thêm user vào danh sách members
//
// ============================================================================
// 📦 IMPORT MODULE
// ============================================================================

const Group = require('../models/Group');
// 📌 Import Group Model để thao tác với nhóm học tập
// - Group class nằm trong thư mục models/Group.js

// ============================================================================
// FUNCTION 1: TẠO NHÓM HỌC TẬP (CREATE STUDY GROUP)
// ============================================================================
// Create a new study group (Teachers only)
exports.createStudyGroup = async (req, res) => {
// 📌 Tạo nhóm học tập mới - CHỈ TEACHER
// - Dùng khi teacher muốn tạo nhóm thảo luận cho lớp học
//
// 🎯 VÍ DỤ THỰC TẾ:
// Thầy Phong muốn tạo nhóm cho lớp 12A:
// 1. Vào trang "Quản lý nhóm"
// 2. Nhấn "Tạo nhóm mới"
// 3. Điền form:
//    - Tên nhóm: "Toán Cao Cấp - Lớp 12A"
//    - Mô tả: "Nhóm thảo luận bài tập và ôn thi"
//    - Môn học: "Toán"
// 4. Nhấn "Tạo nhóm"
// 5. Frontend gửi POST request
// 6. Server tạo nhóm và thầy Phong trở thành admin

    try {
        // ====================================================================
        // VALIDATION: KIỂM TRA FIELDS BẮT BUỘC
        // ====================================================================
        if (!req.body.name || !req.body.description) {
        // 📌 Validate: Phải có tên và mô tả
            return res.status(400).json({ error: 'Name and description are required.' });
            // 📌 Status 400 = Bad Request
        }

        if (!req.body.teacher_id) {
        // 📌 Validate: Phải có teacher_id (ai tạo nhóm?)
            return res.status(400).json({ error: 'Teacher ID is required.' });
        }

        // ====================================================================
        // TẠO NHÓM
        // ====================================================================
        const group = await Group.create({
        // 📌 GỌI MODEL ĐỂ TẠO GROUP! ⭐
            name: req.body.name,
            // 📌 Tên nhóm
            // - Ví dụ: "Toán Cao Cấp - Lớp 12A"

            description: req.body.description,
            // 📌 Mô tả nhóm
            // - Ví dụ: "Nhóm thảo luận bài tập và ôn thi"

            subject: req.body.subject,
            // 📌 Môn học (optional)
            // - Ví dụ: "Toán", "Lý", "Hóa"

            teacher_id: req.body.teacher_id
            // 📌 ID giáo viên tạo nhóm
            // - Teacher sẽ là admin của nhóm
        });

        res.status(201).json(group);
        // 📌 Status 201 = Created
        // - Trả về group vừa tạo

    } catch (err) {
        console.error('Create Study Group Error:', err);

        if (err.message.includes('required') || err.message.includes('must be')) {
        // 📌 Nếu lỗi validation từ Model
        // - .includes() = kiểm tra string có chứa substring không
            return res.status(400).json({ error: err.message });
        }

        res.status(500).json({ error: 'Failed to create study group.', details: err.message });
    }
};

// ============================================================================
// FUNCTION 2: LẤY DANH SÁCH NHÓM (GET ALL STUDY GROUPS)
// ============================================================================
// Get all study groups
exports.getStudyGroups = async (req, res) => {
// 📌 Lấy tất cả nhóm học tập đang ACTIVE (hoạt động)
// - Dùng để hiển thị trang "Khám phá nhóm"
//
// 🎯 VÍ DỤ THỰC TẾ:
// Student An muốn tìm nhóm học tập:
// 1. Vào trang "Khám phá nhóm"
// 2. Xem danh sách:
//    - Toán Cao Cấp - Lớp 12A (25 thành viên)
//    - Vật Lý Nâng Cao - 12B (18 thành viên)
//    - Hóa Học Hữu Cơ - 12C (30 thành viên)
// 3. Click vào nhóm để xem chi tiết

    try {
        const groups = await Group.getAllActive();
        // 📌 GỌI MODEL ĐỂ LẤY GROUPS! ⭐
        // - getAllActive() = chỉ lấy nhóm đang active
        // - Không lấy nhóm đã bị xóa hoặc archived
        //
        // 🎯 TẠI SAO CHỈ LẤY ACTIVE?
        // - Nhóm có thể bị xóa (soft delete: active = false)
        // - Không muốn hiển thị nhóm cũ cho user
        // - Giống như Facebook groups: chỉ hiển thị groups active

        res.status(200).json(groups);
        // 📌 Trả về array groups

    } catch (err) {
        console.error('Get Study Groups Error:', err);
        res.status(500).json({ error: 'Failed to fetch study groups.' });
    }
};

// ============================================================================
// FUNCTION 3: LẤY CHI TIẾT NHÓM (GET STUDY GROUP BY ID)
// ============================================================================
// Get single study group by ID
exports.getStudyGroupById = async (req, res) => {
// 📌 Lấy thông tin chi tiết của 1 nhóm
// - Dùng khi user click vào nhóm để xem chi tiết
//
// 🎯 VÍ DỤ THỰC TẾ:
// Student An click vào nhóm "Toán Cao Cấp - 12A":
// GET /api/groups/group123
//    ↓
// Response: {
//   id: 'group123',
//   name: 'Toán Cao Cấp - Lớp 12A',
//   description: 'Nhóm thảo luận...',
//   subject: 'Toán',
//   teacher_id: 'teacher123',
//   teacher_name: 'Nguyễn Văn Phong',
//   members: 25,
//   created_at: '2024-01-01'
// }

    try {
        const { groupId } = req.params;
        // 📌 Lấy groupId từ URL
        // - URL: GET /api/groups/:groupId
        // - Ví dụ: GET /api/groups/group123 → groupId = 'group123'

        const group = await Group.findById(groupId);
        // 📌 GỌI MODEL ĐỂ TÌM GROUP! ⭐
        // - Trả về Group object với đầy đủ thông tin

        res.status(200).json(group);

    } catch (err) {
        console.error('Get Study Group By ID Error:', err);

        if (err.message.includes('not found')) {
        // 📌 Nếu không tìm thấy group
            return res.status(404).json({ error: err.message });
            // 📌 Status 404 = Not Found
        }

        res.status(500).json({ error: 'Failed to fetch study group.' });
    }
};

// ============================================================================
// FUNCTION 4: THAM GIA NHÓM (JOIN STUDY GROUP)
// ============================================================================
// Join a study group
exports.joinStudyGroup = async (req, res) => {
// 📌 Tham gia nhóm học tập
// - Dùng khi student muốn join nhóm
//
// 🎯 VÍ DỤ THỰC TẾ:
// Student An muốn join nhóm "Toán Cao Cấp - 12A":
// 1. Xem chi tiết nhóm
// 2. Nhấn nút "Tham gia nhóm"
// 3. Frontend gửi POST /api/groups/group123/join
// 4. Server thêm An vào danh sách members
// 5. An có thể chat và xem tài liệu của nhóm

    try {
        const { groupId } = req.params;
        // 📌 Lấy groupId từ URL
        // - URL: POST /api/groups/:groupId/join

        const { user_id } = req.body;
        // 📌 Lấy user_id từ request body
        // - user_id = ID của user muốn join

        if (!user_id) {
        // 📌 Validate: Phải có user_id
            return res.status(400).json({ error: 'User ID is required.' });
        }

        const member = await Group.addMember(groupId, user_id);
        // 📌 GỌI MODEL ĐỂ THÊM MEMBER! ⭐
        // - addMember() = thêm user vào danh sách members
        // - Kiểm tra: user đã là member chưa?
        // - Nếu rồi → throw error "already a member"
        //
        // 🎯 VÍ DỤ:
        // Before: group.members = ['user1', 'user2']
        // After: group.members = ['user1', 'user2', 'user123']

        res.status(201).json(member);
        // 📌 Status 201 = Created
        // - Trả về member object vừa tạo

    } catch (err) {
        console.error('Join Study Group Error:', err);

        if (err.message.includes('already a member')) {
        // 📌 Nếu user đã là member rồi
            return res.status(400).json({ error: err.message });
            // 📌 Trả về lỗi "Bạn đã là thành viên của nhóm này"
        }

        res.status(500).json({ error: 'Failed to join study group.' });
    }
};

// ============================================================================
// FUNCTION 5: LẤY NHÓM CỦA USER (GET USER'S STUDY GROUPS)
// ============================================================================
// Get user's study groups
exports.getUserStudyGroups = async (req, res) => {
// 📌 Lấy tất cả nhóm mà user đã tham gia
// - Dùng để hiển thị trang "Nhóm của tôi"
//
// 🎯 VÍ DỤ THỰC TẾ:
// Student An vào trang "Nhóm của tôi":
// GET /api/groups/user/user123
//    ↓
// Response: [
//   {
//     id: 'group123',
//     name: 'Toán Cao Cấp - 12A',
//     unreadMessages: 5
//   },
//   {
//     id: 'group456',
//     name: 'Vật Lý Nâng Cao - 12B',
//     unreadMessages: 0
//   }
// ]

    try {
        const { userId } = req.params;
        // 📌 Lấy userId từ URL
        // - URL: GET /api/groups/user/:userId

        const groups = await Group.findByUser(userId);
        // 📌 GỌI MODEL ĐỂ TÌM GROUPS! ⭐
        // - findByUser() = tìm tất cả nhóm có userId trong members
        // - Query: WHERE members CONTAINS userId
        //
        // 🎯 VÍ DỤ QUERY:
        // Tìm groups WHERE 'user123' IN members array
        // → Trả về tất cả groups mà user123 đã join

        res.status(200).json(groups);

    } catch (err) {
        console.error('Get User Study Groups Error:', err);
        res.status(500).json({ error: 'Failed to fetch user study groups.' });
    }
};

// ============================================================================
// FUNCTION 6: CẬP NHẬT NHÓM (UPDATE STUDY GROUP)
// ============================================================================
// Update study group (Teachers only)
exports.updateStudyGroup = async (req, res) => {
// 📌 Sửa thông tin nhóm - CHỈ TEACHER/ADMIN
// - Dùng khi teacher muốn chỉnh sửa tên, mô tả, subject
//
// 🎯 VÍ DỤ THỰC TẾ:
// Thầy Phong muốn đổi tên nhóm:
// 1. Vào trang quản lý nhóm
// 2. Click "Chỉnh sửa"
// 3. Đổi tên: "Toán Cao Cấp - 12A" → "Toán Cao Cấp - 12A (2024)"
// 4. Nhấn "Lưu"
// 5. Frontend gửi PUT /api/groups/group123
// 6. Server update nhóm

    try {
        const { groupId } = req.params;
        // 📌 Lấy groupId từ URL
        // - URL: PUT /api/groups/:groupId

        const updatedGroup = await Group.update(groupId, req.body);
        // 📌 GỌI MODEL ĐỂ UPDATE! ⭐
        // - req.body chứa fields cần update (name, description, subject)

        res.status(200).json(updatedGroup);

    } catch (err) {
        console.error('Update Study Group Error:', err);

        if (err.message.includes('not found')) {
        // 📌 Nếu không tìm thấy group
            return res.status(404).json({ error: err.message });
        }

        res.status(500).json({ error: 'Failed to update study group.' });
    }
};

// ============================================================================
// FUNCTION 7: XÓA NHÓM (DELETE STUDY GROUP)
// ============================================================================
// Delete a study group (Teachers only)
exports.deleteStudyGroup = async (req, res) => {
// 📌 Xóa nhóm - CHỈ TEACHER/ADMIN
// - Thường KHÔNG xóa hẳn mà chỉ set active = false (soft delete)
//
// 🎯 VÍ DỤ THỰC TẾ:
// Thầy Phong muốn đóng nhóm sau khi học kỳ kết thúc:
// 1. Vào trang quản lý nhóm
// 2. Click "Xóa nhóm"
// 3. Confirm "Bạn có chắc muốn xóa?"
// 4. Frontend gửi DELETE /api/groups/group123
// 5. Server xóa nhóm
// 6. Nhóm biến mất khỏi danh sách

    try {
        const { groupId } = req.params;
        // 📌 Lấy groupId từ URL
        // - URL: DELETE /api/groups/:groupId

        await Group.delete(groupId);
        // 📌 GỌI MODEL ĐỂ XÓA! ⭐
        // - Có thể là hard delete (xóa hẳn) hoặc soft delete (set active = false)
        // - Soft delete tốt hơn: giữ lại dữ liệu lịch sử

        res.status(200).json({ message: 'Study group deleted successfully.' });

    } catch (err) {
        console.error('Delete Study Group Error:', err);

        if (err.message.includes('not found')) {
        // 📌 Nếu không tìm thấy group
            return res.status(404).json({ error: err.message });
        }

        res.status(500).json({ error: 'Failed to delete study group.' });
    }
};

module.exports = exports;
// 📌 Export tất cả functions để routes có thể import

// ============================================================================
// 📚 TÓM TẮT FILE NÀY
// ============================================================================
// File groupController.js chứa 7 functions xử lý STUDY GROUPS:
//
// 1. createStudyGroup (POST /api/groups)
//    - Tạo nhóm học tập mới
//    - CHỈ teacher
//    - Validate: name, description, teacher_id bắt buộc
//    - Gọi Group.create()
//
// 2. getStudyGroups (GET /api/groups)
//    - Lấy tất cả nhóm đang active
//    - Gọi Group.getAllActive()
//    - Không lấy nhóm đã xóa (soft delete)
//
// 3. getStudyGroupById (GET /api/groups/:groupId)
//    - Lấy chi tiết 1 nhóm
//    - Gọi Group.findById()
//    - 404 nếu không tìm thấy
//
// 4. joinStudyGroup (POST /api/groups/:groupId/join)
//    - Tham gia nhóm
//    - Validate: user_id bắt buộc
//    - Gọi Group.addMember()
//    - Error nếu đã là member
//
// 5. getUserStudyGroups (GET /api/groups/user/:userId)
//    - Lấy tất cả nhóm của user
//    - Gọi Group.findByUser()
//    - Hiển thị "Nhóm của tôi"
//
// 6. updateStudyGroup (PUT /api/groups/:groupId)
//    - Sửa nhóm
//    - CHỈ teacher/admin
//    - Gọi Group.update()
//
// 7. deleteStudyGroup (DELETE /api/groups/:groupId)
//    - Xóa nhóm
//    - CHỈ teacher/admin
//    - Gọi Group.delete()
//    - Soft delete (active = false) tốt hơn hard delete
//
// ============================================================================
// 🔑 KEY CONCEPTS
// ============================================================================
// - Teacher-only Operations:
//   + createStudyGroup, updateStudyGroup, deleteStudyGroup
//   + Chỉ giáo viên mới được tạo/sửa/xóa nhóm
//
// - getAllActive() vs findAll():
//   + getAllActive() = chỉ lấy nhóm đang hoạt động
//   + Không lấy nhóm đã xóa (soft delete)
//
// - addMember() Pattern:
//   + Kiểm tra duplicate: user đã là member chưa?
//   + Nếu rồi → throw error "already a member"
//   + Tránh join nhiều lần
//
// - findByUser() Query:
//   + WHERE members CONTAINS userId
//   + Firestore: array-contains query
//
// - Soft Delete vs Hard Delete:
//   + Hard delete: Xóa hẳn khỏi database
//   + Soft delete: Set active = false, giữ lại data
//   + Soft delete tốt hơn: có thể restore, giữ lịch sử
//
// - Error Handling Pattern:
//   + err.message.includes('not found') → 404
//   + err.message.includes('already a member') → 400
//   + err.message.includes('required') → 400
//   + Còn lại → 500
//
// ============================================================================
// 📊 REAL-WORLD ANALOGY
// ============================================================================
//
// 👥 Group Controller giống như QUẢN LÝ LỚP HỌC NHÓM:
//
// 1. createStudyGroup = Giáo viên mở lớp học nhóm
//    - "Tôi muốn tạo nhóm thảo luận cho lớp 12A"
//    - Giáo viên = admin của nhóm
//
// 2. getStudyGroups = Xem danh sách lớp học đang mở
//    - Bảng thông báo: "Các nhóm học đang tuyển thành viên"
//    - Chỉ hiển thị nhóm còn hoạt động
//
// 3. getStudyGroupById = Xem chi tiết 1 nhóm
//    - "Nhóm này học gì? Ai là giáo viên? Có bao nhiêu người?"
//
// 4. joinStudyGroup = Học sinh đăng ký vào nhóm
//    - "Em muốn tham gia nhóm này!"
//    - Kiểm tra: đã đăng ký chưa?
//
// 5. getUserStudyGroups = Xem nhóm mình đã tham gia
//    - Dashboard "Lớp học của tôi"
//    - Hiển thị tin nhắn chưa đọc
//
// 6. updateStudyGroup = Giáo viên chỉnh sửa thông tin nhóm
//    - "Đổi tên nhóm, update mô tả"
//
// 7. deleteStudyGroup = Đóng nhóm
//    - "Học kỳ kết thúc, đóng nhóm"
//    - Soft delete: giữ lại lịch sử
//
// COMMUNITY LEARNING:
// - Study groups = tính năng học tập cộng đồng
// - Members chat, chia sẻ tài liệu, thảo luận
// - Teacher = admin, quản lý nhóm
//
// ============================================================================
