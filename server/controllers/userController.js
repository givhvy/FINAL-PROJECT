// server/controllers/userController.js

const { getFirestore } = require('firebase-admin/firestore');

// Create a new user (Hàm này đã đúng, không cần sửa)
exports.createUser = async (req, res) => {
    try {
        const db = getFirestore();
        // SỬA LẠI: Dùng db.collection(...).add(...)
        const newUserRef = await db.collection('users').add(req.body);
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
        // SỬA LẠI: Dùng db.collection(...)
        const usersRef = db.collection('users');
        const snapshot = await usersRef.get(); // SỬA LẠI: Dùng .get()

        const users = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            delete data.password; // Không trả về mật khẩu
            users.push({ id: doc.id, ...data });
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
        // SỬA LẠI: Dùng db.collection(...).doc(...)
        const docRef = db.collection('users').doc(req.params.id);
        const docSnap = await docRef.get(); // SỬA LẠI: Dùng .get()

        if (docSnap.exists) {
            const data = docSnap.data();
            delete data.password;
            res.status(200).json({ id: docSnap.id, ...data });
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
        const docRef = db.collection('users').doc(req.params.id);
        
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // SỬA LẠI: Dùng .update()
        await docRef.update(req.body);
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
        const docRef = db.collection('users').doc(req.params.id);
        
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        // SỬA LẠI: Dùng .delete()
        await docRef.delete();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error("Delete User Error:", err);
        res.status(500).json({ error: err.message });
    }
};