// ====== 1. IMPORT CÁC MODULE CẦN THIẾT ======
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const admin = require('firebase-admin');

// Import khóa dịch vụ của Firebase
// Hỗ trợ đọc từ biến môi trường cho Vercel deployment
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  // Nếu có biến môi trường JSON string (dùng cho Vercel)
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } catch (error) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error);
    process.exit(1);
  }
} else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  // Hoặc đọc từ các biến môi trường riêng lẻ
  serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };
} else {
  // Fallback cho local development
  try {
    serviceAccount = require('./serviceAccountKey.json');
  } catch (error) {
    console.error('Error: Firebase credentials not found. Please set environment variables or add serviceAccountKey.json');
    process.exit(1);
  }
}

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

// ====== 4. CẤU HÌNH VIEW ENGINE (EJS) ======
app.set('view engine', 'ejs');
app.set('views', './views');

// ====== 5. MIDDLEWARE (PHẦN MỀM TRUNG GIAN) ======
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Phục vụ static files từ thư mục public

// Session middleware for Passport
const session = require('express-session');
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
const passport = require('./server/config/passport')(app);
app.use(passport.initialize());
app.use(passport.session());

// Make passport available to routes
app.use((req, res, next) => {
  req.passport = passport;
  next();
});

// Thêm đối tượng 'db' vào mọi request để các controller có thể sử dụng
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Middleware to extract user from Authorization header and pass to views
app.use((req, res, next) => {
  res.locals.user = null;
  
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    
    try {
      // Try to verify as JWT
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      res.locals.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role || 'student'
      };
    } catch (jwtError) {
      // Try Firebase token
      try {
        // For Firebase tokens, we'd need async verification which is complex for middleware
        // So we'll just pass null and let client-side handle it
      } catch (firebaseError) {
        // Both failed, user remains null
      }
    }
  }
  
  next();
});

// ====== 2. IMPORT CÁC ROUTE (SAU KHI PASSPORT ĐÃ ĐƯỢC KHỞI TẠO) ======
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
const communityRoutes = require('./server/routes/communityRoutes');
const blogRoutes = require('./server/routes/blogRoutes');
const uploadRoutes = require('./server/routes/uploadRoutes');

// ====== 6. ĐỊNH NGHĨA API ROUTES ======
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
// ĐĂNG KÝ BLOG ROUTES
app.use('/api/blog', blogRoutes);
// ĐĂNG KÝ UPLOAD ROUTES
app.use('/api/upload', uploadRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the CodeMaster E-Learning API with Firebase!' });
});

// ====== 7. ROUTING CHO CÁC TRANG (EJS Views) ======

// Homepage
app.get('/', (req, res) => {
  res.render('pages/index', { title: 'Home' });
});

// Auth pages
app.get('/login', (req, res) => {
  res.render('pages/login', { title: 'Login' });
});

app.get('/signup', (req, res) => {
  res.render('pages/signup', { title: 'Sign Up' });
});

// Dashboard pages
app.get('/admin', (req, res) => {
  res.render('pages/admin-dashboard', { title: 'Admin Dashboard' });
});

app.get('/teacher', (req, res) => {
  res.render('pages/teacher-dashboard', { title: 'Teacher Dashboard' });
});

app.get('/student', (req, res) => {
  res.render('pages/student-dashboard', { title: 'Student Dashboard' });
});

// Public pages
app.get('/courses', (req, res) => {
  res.render('pages/courses', { title: 'Courses' });
});

app.get('/community', (req, res) => {
  res.render('pages/community', { title: 'Community' });
});

app.get('/blog', (req, res) => {
  res.render('pages/blog', { title: 'Blog' });
});

// User pages
app.get('/profile', (req, res) => {
  res.render('pages/profile', { title: 'Profile' });
});

app.get('/account', (req, res) => {
  res.render('pages/account', { title: 'Account' });
});

// E-commerce pages
app.get('/cart', (req, res) => {
  res.render('pages/cart', { title: 'Shopping Cart' });
});

app.get('/order', (req, res) => {
  res.render('pages/order', { title: 'Order' });
});

app.get('/payment', (req, res) => {
  res.render('pages/payment', { title: 'Payment' });
});

app.get('/success', (req, res) => {
  res.render('pages/success', { title: 'Success' });
});

app.get('/cancel', (req, res) => {
  res.render('pages/cancel', { title: 'Cancel' });
});

// Quiz & Learning pages
app.get('/quiz', (req, res) => {
  res.render('pages/quiz', { title: 'Quiz & Grades' });
});

app.get('/grades', (req, res) => {
  res.render('pages/quiz', { title: 'Grades' });
});

// Management pages
app.get('/lesson-management', (req, res) => {
  res.render('pages/lesson-management', { title: 'Lesson Management' });
});

app.get('/quiz-management', (req, res) => {
  res.render('pages/quiz-management', { title: 'Quiz Management' });
});

// Certificate
app.get('/certificate', (req, res) => {
  res.render('pages/certificate', { title: 'Certificate' });
});


// ====== 7. XỬ LÝ LỚI (ERROR HANDLING) ======
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error: Something went wrong on the server' });
});

// ====== 8. KHỞI ĐỘNG SERVER ======
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
