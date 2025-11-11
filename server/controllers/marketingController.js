const Newsletter = require('../models/Newsletter');

// Subscribe to newsletter
exports.subscribeToNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const subscriber = await Newsletter.subscribe(email);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công!',
      data: subscriber.toJSON()
    });
  } catch (err) {
    console.error("Newsletter Subscribe Error:", err);
    res.status(500).json({ success: false, error: 'Có lỗi xảy ra khi đăng ký' });
  }
};

// Unsubscribe from newsletter
exports.unsubscribeFromNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const subscriber = await Newsletter.unsubscribe(email);

    if (!subscriber) {
      return res.status(404).json({ success: false, error: 'Email not found in subscribers list' });
    }

    res.status(200).json({
      success: true,
      message: 'Hủy đăng ký thành công!',
      data: subscriber.toJSON()
    });
  } catch (err) {
    console.error("Newsletter Unsubscribe Error:", err);
    res.status(500).json({ success: false, error: 'Có lỗi xảy ra khi hủy đăng ký' });
  }
};

// Check subscription status
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const userEmail = req.user.email; // From auth middleware

    const subscribed = await Newsletter.isSubscribed(userEmail);

    res.json({
      success: true,
      data: { subscribed }
    });
  } catch (err) {
    console.error("Check Subscription Error:", err);
    res.status(500).json({ success: false, error: 'Không thể kiểm tra trạng thái đăng ký' });
  }
};