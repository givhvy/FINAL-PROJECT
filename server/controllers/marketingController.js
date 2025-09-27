const { getFirestore } = require('firebase-admin/firestore');
const { sendMailListConfirmation } = require('../services/emailService');

// Sửa lỗi: Không gọi getFirestore() ở ngoài hàm
// const db = getFirestore(); // Dòng này đã được xóa


// Subscribe to newsletter
exports.subscribeToNewsletter = async (req, res) => {
  try {
    const db = getFirestore();
    const { email } = req.body;

    // Check if email already exists
    const subscribersRef = db.collection('newsletter_subscribers');
    const q = subscribersRef.where('email', '==', email);
    const snapshot = await q.get();

    if (!snapshot.empty) {
      return res.status(200).json({ message: 'Email đã được đăng ký trước đó!' });
    }

    // Add new subscriber
    await subscribersRef.add({
      email: email,
      subscribedAt: new Date().toISOString(),
      active: true
    });

    res.status(201).json({ message: 'Đăng ký thành công!' });
  } catch (err) {
    console.error("Newsletter Subscribe Error:", err);
    res.status(500).json({ error: 'Có lỗi xảy ra khi đăng ký' });
  }
};

// Check subscription status
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const db = getFirestore();
    const userEmail = req.user.email; // From auth middleware

    const subscribersRef = db.collection('newsletter_subscribers');
    const q = subscribersRef.where('email', '==', userEmail);
    const snapshot = await q.get();

    const subscribed = !snapshot.empty && snapshot.docs[0].data().active;
    
    res.json({ subscribed });
  } catch (err) {
    console.error("Check Subscription Error:", err);
    res.status(500).json({ error: 'Không thể kiểm tra trạng thái đăng ký' });
  }
};