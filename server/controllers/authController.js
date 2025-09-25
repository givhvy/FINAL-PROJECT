const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Import hàm getFirestore để lấy đối tượng database
const { getFirestore } = require('firebase-admin/firestore');

// Hàm đăng ký người dùng mới
exports.register = async (req, res) => {
  try {
    const db = getFirestore();
    const { name, email, password, role } = req.body;

    // Sửa lại cách truy vấn
    const usersRef = db.collection('users');
    const q = usersRef.where('email', '==', email);
    const snapshot = await q.get();

    if (!snapshot.empty) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    // Sửa lại cách thêm dữ liệu
    const newUserRef = await db.collection('users').add({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json({ message: 'User registered successfully', userId: newUserRef.id });

  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Something went wrong during registration' });
  }
};

// Hàm đăng nhập
exports.login = async (req, res) => {
  try {
    const db = getFirestore();
    const { email, password } = req.body;

    // Sửa lại cách truy vấn
    const usersRef = db.collection('users');
    const q = usersRef.where('email', '==', email);
    const snapshot = await q.get();

    if (snapshot.empty) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: userDoc.id, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: userDoc.id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      }
    });

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Something went wrong during login' });
  }
};