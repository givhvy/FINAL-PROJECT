// ============================================================================
// 📚 FILE NÀY LÀM GÌ? - groupMessageController.js
// ============================================================================
// File này là GROUP MESSAGE CONTROLLER - điều khiển TIN NHẮN TRONG NHÓM HỌC TẬP
//
// Giống như tính năng CHAT/FORUM trong nhóm học, file này:
// ✅ Lấy danh sách tin nhắn của nhóm (getGroupMessages)
// ✅ Gửi tin nhắn mới vào nhóm (postGroupMessage)
// ✅ Xóa tin nhắn (deleteGroupMessage) - admin/teacher only
//
// 🎯 VÍ DỤ THỰC TẾ - NHÓM HỌC TẬP:
// ┌─────────────────────────────────────────────────────────┐
// │ 📚 NHÓM: Toán Cao Cấp - Lớp 12A                        │
// ├─────────────────────────────────────────────────────────┤
// │ 👤 An (09:30): Các bạn ơi, bài tập về nhà khó quá!     │
// │ 👤 Bình (09:32): Mình cũng bí câu 5 nè                 │
// │ 👨‍🏫 Thầy Phong (09:35): Để thầy giải thích nhé...       │
// │ 👤 Cường (09:40): Cảm ơn thầy! Giờ hiểu rồi ạ         │
// │                                                          │
// │ [Nhập tin nhắn...]                  [Gửi]              │
// └─────────────────────────────────────────────────────────┘
//
// ============================================================================
// FLOW: FRONTEND → ROUTES → CONTROLLER → MODEL → DATABASE
// ============================================================================
//
// VÍ DỤ: HỌC SINH GỬI TIN NHẮN VÀO NHÓM
// Frontend: User nhập "Các bạn ơi, bài tập về nhà khó quá!" → nhấn Gửi
//   → POST /api/groups/group123/messages
//    ↓
// Routes: router.post('/groups/:groupId/messages', postGroupMessage)
//    ↓
// Controller (file này): postGroupMessage()
//   - Validate: có user_id và message không?
//   - Gọi GroupMessage.createWithUser()
//    ↓
// Model: GroupMessage.createWithUser()
//   - Lưu message vào Firestore
//   - Fetch thông tin user (tên, avatar)
//   - Kết hợp message + user info
//    ↓
// Database: Document mới trong collection "group_messages"
//
// ============================================================================
// 📦 IMPORT MODULE
// ============================================================================

const GroupMessage = require('../models/GroupMessage');
// 📌 Import GroupMessage Model để thao tác với tin nhắn nhóm

// ============================================================================
// FUNCTION 1: LẤY TIN NHẮN CỦA NHÓM (GET GROUP MESSAGES)
// ============================================================================
// Get forum messages for a study group (lấy tổng tin nhắn trong group)
exports.getGroupMessages = async (req, res) => {
// 📌 Lấy tất cả tin nhắn trong 1 nhóm học tập
// - Dùng khi user mở nhóm để xem lịch sử chat/forum
//
// 🎯 VÍ DỤ THỰC TẾ:
// An mở nhóm "Toán Cao Cấp" → hiển thị 50 tin nhắn gần nhất
// Các tin nhắn được sắp xếp theo thời gian (cũ → mới)

    try {
        console.log('Getting messages for group:', req.params.groupId);
        // 📌 Log để debug - xem đang lấy tin nhắn của nhóm nào

        const { groupId } = req.params;
        // 📌 Lấy groupId từ URL
        // - URL: GET /api/groups/group123/messages
        // - groupId = 'group123'

        const messages = await GroupMessage.findByGroup(groupId);
        // 📌 GỌI MODEL ĐỂ TÌM TIN NHẮN! ⭐
        // - Model query Firestore: WHERE group_id = groupId
        // - Trả về array messages, mỗi message có:
        //   + id, user_id, userName, userAvatar, message, created_at

        console.log('Returning messages:', messages.length);
        // 📌 Log số lượng tin nhắn tìm được

        res.status(200).json(messages);
        // 📌 Trả về danh sách tin nhắn
        // Response: [
        //   {
        //     id: 'msg1',
        //     user_id: 'user1',
        //     userName: 'Nguyễn Văn An',
        //     message: 'Các bạn ơi...',
        //     created_at: '...'
        //   },
        //   ...
        // ]

    } catch (err) {
        console.error('Get Group Messages Error:', err);
        console.error('Error stack:', err.stack);
        // 📌 Log lỗi chi tiết với stack trace để debug
        // - err.stack = chuỗi stack trace, chỉ ra dòng code bị lỗi

        res.status(500).json({ error: 'Failed to fetch group messages.' });
    }
};

// ============================================================================
// FUNCTION 2: GỬI TIN NHẮN VÀO NHÓM (POST GROUP MESSAGE)
// ============================================================================
// Post a message to study group forum
exports.postGroupMessage = async (req, res) => {
// 📌 Tạo tin nhắn mới trong nhóm
// - User nhập message → gửi lên server → lưu vào database
//
// 🎯 VÍ DỤ THỰC TẾ:
// An đang ở nhóm "Toán Cao Cấp":
// 1. Nhập: "Các bạn ơi, bài tập về nhà khó quá!"
// 2. Nhấn nút "Gửi"
// 3. Frontend gửi POST request với body:
//    {
//      user_id: 'user123',
//      message: 'Các bạn ơi, bài tập về nhà khó quá!',
//      message_type: 'text'
//    }
// 4. Server lưu tin nhắn + thông tin user
// 5. Tin nhắn xuất hiện ngay trong nhóm

    try {
        const { groupId } = req.params;
        // 📌 Lấy groupId từ URL: POST /api/groups/group123/messages

        if (!req.body.user_id) {
        // 📌 Validate: Phải có user_id (ai đang gửi?)
            return res.status(400).json({ error: 'User ID is required.' });
        }

        if (!req.body.message) {
        // 📌 Validate: Phải có nội dung message
            return res.status(400).json({ error: 'Message is required.' });
        }

        const messageWithUser = await GroupMessage.createWithUser({
        // 📌 GỌI MODEL ĐỂ TẠO MESSAGE! ⭐
        // - Method đặc biệt: createWithUser()
        //   + Không chỉ tạo message
        //   + MÀ CÒN fetch thông tin user (tên, avatar) và gắn vào message
        //   + Trả về message ĐẦY ĐỦ thông tin user luôn
        //
        // 🎯 TẠI SAO DÙNG createWithUser() THAY VÌ create()?
        // - Nếu dùng create(): Chỉ lưu { user_id, message }
        //   → Frontend phải gọi thêm API lấy user info → CHẬM (2 requests)
        // - Dùng createWithUser(): Lưu + fetch user info ngay
        //   → Frontend nhận luôn { user_id, userName, userAvatar, message } → NHANH (1 request)

            group_id: groupId,
            user_id: req.body.user_id,
            message: req.body.message,
            message_type: req.body.message_type
            // 📌 message_type: 'text', 'image', 'file', v.v.
            // - Phân biệt loại tin nhắn (text thường, hình ảnh, file đính kèm)
        });

        res.status(201).json(messageWithUser);
        // 📌 Status 201 = Created
        // - Trả về message vừa tạo KÈM thông tin user
        // Response: {
        //   id: 'msg123',
        //   group_id: 'group123',
        //   user_id: 'user123',
        //   userName: 'Nguyễn Văn An',
        //   userAvatar: 'https://...',
        //   message: 'Các bạn ơi...',
        //   message_type: 'text',
        //   created_at: '2024-01-15T10:30:00Z'
        // }

    } catch (err) {
        console.error('Post Group Message Error:', err);

        if (err.message.includes('required') || err.message.includes('cannot be empty')) {
        // 📌 Nếu lỗi validation từ Model
        // - .includes() = kiểm tra string có chứa substring không
            return res.status(400).json({ error: err.message });
            // 📌 Status 400 = Bad Request
        }

        res.status(500).json({ error: 'Failed to post message.' });
    }
};

// ============================================================================
// FUNCTION 3: XÓA TIN NHẮN (DELETE GROUP MESSAGE)
// ============================================================================
// Delete a message (Admin/Teacher only)
exports.deleteGroupMessage = async (req, res) => {
// 📌 Xóa tin nhắn trong nhóm
// - CHỈ admin/teacher được phép xóa
// - Dùng khi: tin nhắn spam, nội dung không phù hợp, v.v.
//
// 🎯 VÍ DỤ THỰC TẾ:
// Có người gửi tin nhắn spam trong nhóm:
// 1. Teacher/Admin thấy tin nhắn không phù hợp
// 2. Nhấn nút "Xóa" ở tin nhắn đó
// 3. Frontend gửi: DELETE /api/groups/messages/msg123
// 4. Server xóa tin nhắn khỏi database
// 5. Tin nhắn biến mất khỏi nhóm

    try {
        const { messageId } = req.params;
        // 📌 Lấy messageId từ URL
        // - URL: DELETE /api/groups/messages/msg123
        // - messageId = 'msg123'

        await GroupMessage.delete(messageId);
        // 📌 GỌI MODEL ĐỂ XÓA MESSAGE! ⭐
        // - Xóa document khỏi Firestore collection "group_messages"

        res.status(200).json({ message: 'Message deleted successfully.' });
        // 📌 Trả về thông báo xóa thành công

    } catch (err) {
        console.error('Delete Group Message Error:', err);
        res.status(500).json({ error: 'Failed to delete message.' });
    }
};

module.exports = exports;
// 📌 Export tất cả functions để routes có thể import

// ============================================================================
// 📚 TÓM TẮT FILE NÀY
// ============================================================================
// File groupMessageController.js chứa 3 functions xử lý TIN NHẮN NHÓM:
//
// 1. getGroupMessages (GET /api/groups/:groupId/messages)
//    - Lấy tất cả tin nhắn của 1 nhóm
//    - Gọi GroupMessage.findByGroup()
//    - Log số lượng messages để debug
//
// 2. postGroupMessage (POST /api/groups/:groupId/messages)
//    - Tạo tin nhắn mới trong nhóm
//    - Validate: user_id và message bắt buộc
//    - Gọi GroupMessage.createWithUser() - TỰ ĐỘNG FETCH USER INFO!
//    - Trả về message + user info (tối ưu hiệu suất)
//
// 3. deleteGroupMessage (DELETE /api/groups/messages/:messageId)
//    - Xóa tin nhắn
//    - Chỉ admin/teacher
//    - Gọi GroupMessage.delete()
//
// ============================================================================
// 🔑 KEY CONCEPTS
// ============================================================================
// - `.includes()` = kiểm tra string có chứa substring
// - `err.stack` = stack trace để debug lỗi
// - `console.log()` = log để debug (xem flow, data)
// - createWithUser() = method tối ưu (tạo + fetch user info cùng lúc)
//
// ============================================================================
// 📊 REAL-WORLD ANALOGY
// ============================================================================
//
// 💬 Group Message Controller giống như QUẢN LÝ CHAT NHÓM ZALO:
//
// 1. getGroupMessages = Mở nhóm chat → xem lịch sử tin nhắn
// 2. postGroupMessage = Gửi tin nhắn vào nhóm
//    - Tin nhắn tự động hiển thị tên + avatar người gửi
// 3. deleteGroupMessage = Admin xóa tin nhắn spam/không phù hợp
//
// OPTIMIZATION:
// - createWithUser() thay vì create() + fetchUser()
// - Giảm từ 2 API calls → 1 API call
// - Frontend load nhanh hơn, UX mượt mà hơn
//
// ============================================================================
