const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Import các hàm từ controller
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');

// --- ĐỊNH NGHĨA CÁC ROUTE ---

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// NEW: POST /api/auth/forgot-password (Frontend gọi hàm này)
router.post('/forgot-password', forgotPassword);

// NEW: POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

// --- GOOGLE OAUTH ROUTES ---

// TEST route
router.get('/google/test', (req, res) => {
  res.json({ message: 'Google OAuth route is working!', passportStrategies: Object.keys(passport._strategies || {}) });
});

// GET /api/auth/google - Initiate Google OAuth
router.get('/google', (req, res, next) => {
  console.log('🔵 /api/auth/google route hit!');
  console.log('Available strategies:', Object.keys(passport._strategies || {}));
  
  if (!passport._strategies || !passport._strategies.google) {
    return res.status(500).json({ error: 'Google OAuth strategy not configured' });
  }
  
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});

// GET /api/auth/google/callback - Google OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false 
  }),
  (req, res) => {
    try {
      // Generate JWT token // 
      const token = jwt.sign(
        { 
          userId: req.user.id,
          email: req.user.email,
          role: req.user.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token stored in URL params
      // The frontend will extract and save to localStorage
      res.redirect(`/auth-success?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        avatarUrl: req.user.avatarUrl,
        subscriptionTier: req.user.subscriptionTier || 'free'
      }))}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect('/login?error=auth_failed');
    }
  }
);


// Xuất router để server.js có thể sử dụng
module.exports = router; 