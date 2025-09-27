const { getFirestore } = require('firebase-admin/firestore');
const { sendMailListConfirmation } = require('../services/emailService');

// Sửa lỗi: Không gọi getFirestore() ở ngoài hàm
// const db = getFirestore(); // Dòng này đã được xóa

exports.subscribeToNewsletter = async (req, res) => {
    // Gọi getFirestore() bên trong hàm, sau khi app đã khởi tạo
    const db = getFirestore(); 
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        // 1. Kiểm tra xem email đã tồn tại trong danh sách (MailList) chưa
        const subscriberRef = db.collection('MailList').doc(email);
        const doc = await subscriberRef.get();

        if (doc.exists) {
            return res.status(200).json({ message: 'Bạn đã đăng ký nhận tin rồi!' });
        }

        // 2. Nếu chưa tồn tại, thêm email mới vào MailList
        await subscriberRef.set({
            email: email,
            subscribedAt: new Date(),
        });

        // 3. Gửi email xác nhận (Không cần await để tăng tốc độ phản hồi API)
        sendMailListConfirmation(email); 

        // 4. Trả về phản hồi thành công
        res.status(201).json({ message: 'Đăng ký thành công! Chào mừng bạn đến với Mail List của Codemaster.' });

    } catch (error) {
        console.error("Error subscribing email:", error);
        res.status(500).json({ message: 'Đăng ký thất bại. Vui lòng thử lại.' });
    }
};
