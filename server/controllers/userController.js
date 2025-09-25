// Import các hàm cần thiết từ Firestore
const { getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc } = require('firebase-admin/firestore');

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const db = getFirestore();
    const newUserRef = await addDoc(collection(db, 'users'), req.body);
    res.status(201).json({ id: newUserRef.id, ...req.body });
  } catch (err) {
    console.error("Create User Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const db = getFirestore();
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    const users = [];
    snapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(users);
  } catch (err) {
    console.error("Get Users Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = doc(db, 'users', req.params.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      res.status(200).json({ id: docSnap.id, ...docSnap.data() });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error("Get User By ID Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = doc(db, 'users', req.params.id);

    // Kiểm tra xem user có tồn tại không trước khi cập nhật
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        return res.status(404).json({ error: 'User not found' });
    }

    await updateDoc(docRef, req.body);
    res.status(200).json({ id: req.params.id, ...req.body });
  } catch (err) {
    console.error("Update User Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = doc(db, 'users', req.params.id);
    
    // Kiểm tra xem user có tồn tại không trước khi xóa
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        return res.status(404).json({ error: 'User not found' });
    }

    await deleteDoc(docRef);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error("Delete User Error:", err);
    res.status(500).json({ error: err.message });
  }
};