const { getFirestore } = require('firebase-admin/firestore');
const bcrypt = require('bcryptjs');

/**
 * User Model
 * Xử lý tất cả các thao tác liên quan đến người dùng trong Firestore
 */
class User {
    constructor(data) {
        this.id = data.id || null;
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
        this.role = data.role || 'student';
        this.avatarUrl = data.avatarUrl || data.profilePicture || null;
        this.phone = data.phone || null;
        this.subscriptionTier = data.subscriptionTier || 'free'; // 'free' or 'pro'
        this.subscriptionPlan = data.subscriptionPlan || null; // 'monthly', 'quarterly', 'yearly'
        this.subscriptionStartDate = data.subscriptionStartDate || null;
        this.subscriptionEndDate = data.subscriptionEndDate || null;
        this.studentEmail = data.studentEmail || null; // Educational email for student verification
        this.studentVerifiedAt = data.studentVerifiedAt || null; // When student was verified
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.resetPasswordCode = data.resetPasswordCode || null;
        this.resetPasswordExpires = data.resetPasswordExpires || null;
    }

    /**
     * Lấy database của Firestore bằng cách sử dụng static để nhanh hơn
     */
    static getDB() {
        return getFirestore();
    }

    /**
     * Tìm người dùng theo email // sử dụng cho sign in và kiểm tra trùng email khi đăng ký 
     * @param {string} email - Email người dùng
     * @returns {Promise<User|null>} - User object hoặc null
     */
    static async findByEmail(email) {
        try {
            const db = this.getDB();
            const usersRef = db.collection('users');
            const snapshot = await usersRef.where('email', '==', email).get(); //firebase sdk for snapshot

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            return new User({ id: doc.id, ...doc.data() });
        } catch (error) {
            throw new Error(`Error finding user by email: ${error.message}`);
        }
    }

    /**
     * Tìm người dùng theo ID
     * @param {string} id - User ID
     * @returns {Promise<User|null>} - User object hoặc null
     */
    static async findById(id) {
        try {
            const db = this.getDB();
            const doc = await db.collection('users').doc(id).get();

            if (!doc.exists) {
                return null;
            }

            return new User({ id: doc.id, ...doc.data() });
        } catch (error) {
            throw new Error(`Error finding user by ID: ${error.message}`);
        }
    }


    /**
     * Lấy tất cả người dùng
     * @param {Object} filters - Bộ lọc (role, limit, etc.)
     * @returns {Promise<Array<User>>} - Mảng User objects
     */
    static async findAll(filters = {}) {
        try {
            const db = this.getDB();
            let query = db.collection('users');

            // Áp dụng filter theo role nếu có
            if (filters.role) {
                query = query.where('role', '==', filters.role);
            }

            // Áp dụng limit nếu có
            if (filters.limit) {
                query = query.limit(filters.limit);
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => new User({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error(`Error finding all users: ${error.message}`);
        }
    }

    /**
     * Tạo người dùng mới (Create in CRUD) // xài cho signup.js
     * @param {Object} userData - Dữ liệu người dùng
     * @returns {Promise<User>} - User object đã tạo
     */
    static async create(userData) {
        try {
            const db = this.getDB(); // Lấy Firestore DB

            // Kiểm tra email đã tồn tại chưa
            const existingUser = await this.findByEmail(userData.email); // Kiểm tra email đã tồn tại chưa
            if (existingUser) {
                throw new Error('Email already in use');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Check if email is .edu to grant Pro tier automatically
            const subscriptionTier = this.isEduEmail(userData.email) ? 'pro' : 'free';

            const newUser = new User({
                ...userData,
                password: hashedPassword,
                subscriptionTier: subscriptionTier,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            const docRef = await db.collection('users').add({
                name: newUser.name,
                email: newUser.email,
                password: newUser.password,
                role: newUser.role,
                avatarUrl: newUser.avatarUrl,
                phone: newUser.phone,
                subscriptionTier: newUser.subscriptionTier,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt
            });

            newUser.id = docRef.id;
            return newUser; // try nếu được thì return create user còn nếu ko được thì catch (error) 
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    /**
     * Cập nhật thông tin người dùng (Update in CRUD)
     * @param {string} id - User ID
     * @param {Object} updateData - Dữ liệu cần cập nhật
     * @returns {Promise<User>} - User object đã cập nhật
     */
    static async update(id, updateData) {
        try {
            const db = this.getDB();
            const userRef = db.collection('users').doc(id);
            const doc = await userRef.get();

            if (!doc.exists) {
                throw new Error('User not found');
            }

            // Nếu cập nhật password, hash nó
            if (updateData.password) {
                updateData.password = await bcrypt.hash(updateData.password, 10);
            }

            updateData.updatedAt = new Date().toISOString();

            console.log('🔵 User.update() - updateData:', updateData);
            await userRef.update(updateData);

            const updatedUser = await this.findById(id);
            console.log('✅ User.update() - Updated user:', updatedUser.toJSON());
            return updatedUser;
        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    /**
     * Xóa người dùng (Delete in CRUD)
     * @param {string} id - User ID
     * @returns {Promise<boolean>} - true nếu xóa thành công
     */
    static async delete(id) {
        try {
            const db = this.getDB();
            await db.collection('users').doc(id).delete();
            return true;
        } catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }

    /**
     * So sánh password
     * @param {string} password - Password cần so sánh
     * @returns {Promise<boolean>} - true nếu password đúng
     */
    async comparePassword(password) {
        return await bcrypt.compare(password, this.password);
    }

    /**
     * Lưu mã reset password
     * @param {string} code - Mã reset
     * @param {Date} expiresAt - Thời gian hết hạn
     */
    async saveResetCode(code, expiresAt) {
        try {
            const db = User.getDB();
            await db.collection('users').doc(this.id).update({
                resetPasswordCode: code,
                resetPasswordExpires: expiresAt.toISOString()
            });
            this.resetPasswordCode = code;
            this.resetPasswordExpires = expiresAt.toISOString();
        } catch (error) {
            throw new Error(`Error saving reset code: ${error.message}`);
        }
    }

    /**
     * Xóa mã reset password (clear reset code)
     */
    async clearResetCode() {
        try {
            const db = User.getDB();
            await db.collection('users').doc(this.id).update({
                resetPasswordCode: null,
                resetPasswordExpires: null
            });
            this.resetPasswordCode = null;
            this.resetPasswordExpires = null;
        } catch (error) {
            throw new Error(`Error clearing reset code: ${error.message}`);
        }
    }

    /**
     * Check if email is .edu domain
     * @param {string} email - Email to check
     * @returns {boolean} - true if email ends with .edu
     */
    static isEduEmail(email) {
        return email.toLowerCase().endsWith('.edu');
    }

    /**
     * Check if email is educational (.edu or .ac domain) (Check if sinh viên greenwich)
     * @param {string} email - Email to check
     * @returns {boolean} - true if email is educational domain
     */
    static isEducationalEmail(email) {
        const lowerEmail = email.toLowerCase();
        return lowerEmail.endsWith('.edu') || lowerEmail.endsWith('.ac.uk') ||
               lowerEmail.endsWith('.edu.vn') || lowerEmail.includes('.ac.');
    }

    /**
     * Verify user as student by checking email and updating to Pro tier
     * @param {string} userId - User ID
     * @param {string} email - Student email to verify (can be different from account email)
     * @returns {Promise<User>} - Updated user with Pro tier
     */
    static async verifyAsStudent(userId, email) {
        try {
            // Find user by ID
            const user = await this.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Check if email is educational
            if (!this.isEducationalEmail(email)) {
                throw new Error('Email must be from an educational institution (.edu, .ac, etc.)');
            }

            // Update user to Pro tier and save student email
            return await this.update(userId, {
                subscriptionTier: 'pro',
                studentEmail: email,
                studentVerifiedAt: new Date().toISOString()
            });
        } catch (error) {
            throw new Error(`Error verifying student: ${error.message}`);
        }
    }

    /**
     * Check if user has Pro tier
     * @returns {boolean} - true if user is Pro
     */
    isPro() {
        return this.subscriptionTier === 'pro';
    }

    /**
     * Upgrade user to Pro tier
     * @param {string} id - User ID
     * @returns {Promise<User>} - Updated user
     */
    static async upgradeToProTier(id) {
        try {
            return await this.update(id, { subscriptionTier: 'pro' });
        } catch (error) {
            throw new Error(`Error upgrading to Pro tier: ${error.message}`);
        }
    }

    /**
     * Downgrade user to Free tier
     * @param {string} id - User ID
     * @returns {Promise<User>} - Updated user
     */
    static async downgradeToFreeTier(id) {
        try {
            return await this.update(id, { subscriptionTier: 'free' });
        } catch (error) {
            throw new Error(`Error downgrading to Free tier: ${error.message}`);
        }
    }

    /**
     * Cancel subscription - revert to free tier and clear subscription data
     * @param {string} id - User ID
     * @returns {Promise<User>} - Updated user
     */
    static async cancelSubscription(id) {
        try {
            const user = await this.findById(id);
            if (!user) {
                throw new Error('User not found');
            }

            // Clear all subscription-related fields
            return await this.update(id, {
                subscriptionTier: 'free',
                studentEmail: null,
                isStudent: false,
                studentVerifiedAt: null,
                subscriptionPlan: null,
                subscriptionStartDate: null,
                subscriptionEndDate: null
            });
        } catch (error) {
            throw new Error(`Error canceling subscription: ${error.message}`);
        }
    }

    /**
     * Chuyển đổi thành object đơn giản (loại bỏ password)
     * @returns {Object} - User object không có password
     */
    toJSON() {
        const obj = { ...this };
        delete obj.password;
        delete obj.resetPasswordCode;
        delete obj.resetPasswordExpires;
        return obj;
    }

    /**
     * Batch get users by IDs (fixes N+1 query problem)
     * @param {Array<string>} userIds - Array of user IDs
     * @returns {Promise<Array<Object>>} - Array of sanitized user objects
     */
    static async findByIds(userIds) {
        try {
            if (!userIds || userIds.length === 0) return [];

            const db = this.getDB();
            const uniqueIds = [...new Set(userIds)]; // Remove duplicates

            // Firestore 'in' query limit is 10
            const chunkSize = 10;
            const chunks = [];
            for (let i = 0; i < uniqueIds.length; i += chunkSize) {
                chunks.push(uniqueIds.slice(i, i + chunkSize));
            }

            // Fetch all chunks in parallel
            const promises = chunks.map(chunk =>
                db.collection('users')
                    .where(require('firebase-admin').firestore.FieldPath.documentId(), 'in', chunk)
                    .get()
            );

            const snapshots = await Promise.all(promises);

            // Flatten results and sanitize
            const users = snapshots.flatMap(snapshot =>
                snapshot.docs.map(doc => {
                    const user = new User({ id: doc.id, ...doc.data() });
                    return user.toJSON(); // Automatically removes sensitive fields
                })
            );

            return users;
        } catch (error) {
            throw new Error(`Error finding users by IDs: ${error.message}`);
        }
    }

    /**
     * Sanitize user data (remove password and sensitive fields)
     * Static method for sanitizing plain objects
     * @param {Object} userData - User data object
     * @returns {Object} - Sanitized user data
     */
    static sanitize(userData) {
        if (!userData) return null;

        const { password, resetPasswordCode, resetPasswordExpires, ...sanitized } = userData;
        return sanitized;
    }

    /**
     * Get public profile (sanitized user data)
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - Sanitized user object
     */
    static async getPublicProfile(userId) {
        try {
            const user = await this.findById(userId);
            if (!user) return null;
            return user.toJSON();
        } catch (error) {
            throw new Error(`Error getting public profile: ${error.message}`);
        }
    }

    /**
     * Check if user is admin
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} - true if user is admin
     */
    static async isAdmin(userId) {
        try {
            const user = await this.findById(userId);
            return user && user.role === 'admin';
        } catch (error) {
            throw new Error(`Error checking admin status: ${error.message}`);
        }
    }

    /**
     * Check if user is teacher
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} - true if user is teacher or admin
     */
    static async isTeacher(userId) {
        try {
            const user = await this.findById(userId);
            return user && (user.role === 'teacher' || user.role === 'admin');
        } catch (error) {
            throw new Error(`Error checking teacher status: ${error.message}`);
        }
    }
}

module.exports = User;
