// ====== 1. IMPORT CÁC MODULE CẦN THIẾT ======
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const admin = require('firebase-admin');

// Import khóa dịch vụ của Firebase
const serviceAccount = require('./serviceAccountKey.json');

// ====== 2. IMPORT CÁC ROUTE ======
const authRoutes = require('./server/routes/authRoutes');
const userRoutes = require('./server/routes/userRoutes');
const courseRoutes = require('./server/routes/courseRoutes');
const lessonRoutes = require('./server/routes/lessonRoutes');
const quizRoutes = require('./server/routes/quizRoutes');
const questionRoutes = require('./server/routes/questionRoutes');
const gradeRoutes = require('./server/routes/gradeRoutes');
const orderRoutes = require('./server/routes/orderRoutes');
const paymentRoutes = require('./server/routes/paymentRoutes');
const certificateRoutes = require('./server/routes/certificateRoutes');
const subscriptionRoutes = require('./server/routes/subscriptionRoutes');
const marketingRoutes = require('./server/routes/marketingRoutes');
const progressRoutes = require('./server/routes/progressRoutes');


// BỔ SUNG ROUTE MỚI
const communityRoutes = require('./server/routes/communityRoutes'); 

// ====== 3. KHỞI TẠO ỨNG DỤNG VÀ FIREBASE ======
const app = express();
const PORT = process.env.PORT || 5000;

// Khởi tạo Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
}

// Tạo một đối tượng 'db' để dễ dàng truy cập Firestore
const db = admin.firestore();
console.log('Firebase Admin SDK initialized successfully!');

// ====== 4. MIDDLEWARE (PHẦN MỀM TRUNG GIAN) ======
app.use(cors());
app.use(express.json());
app.use(express.static('client')); // Phục vụ file từ thư mục client

// Thêm đối tượng 'db' vào mọi request để các controller có thể sử dụng
app.use((req, res, next) => {
  req.db = db;
  next();
});

// ====== 5. ĐỊNH NGHĨA API ROUTES ======
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/marketing', marketingRoutes); 
app.use('/api/progress', progressRoutes);
// ĐĂNG KÝ COMMUNITY ROUTES
app.use('/api/community', communityRoutes); 

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the CodeMaster E-Learning API with Firebase!' });
});

// ====== 6. XỬ LÝ LỖI (ERROR HANDLING) ======
app.use((req, res, next) => {
  res.status(404).json({ message: 'Error: API endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error: Something went wrong on the server' });
});

// ====== 7. KHỞI ĐỘNG SERVER ======
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
