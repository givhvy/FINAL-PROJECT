const jwt = require('jsonwebtoken');
const { getFirestore } = require('firebase-admin/firestore');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user data from Firestore
    const db = getFirestore();
    const userRef = db.collection('users').doc(decoded.userId);
    const userSnap = await userRef.get();
    
    if (!userSnap.exists) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    
    req.user = { id: userSnap.id, ...userSnap.data() };
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

module.exports = authMiddleware;