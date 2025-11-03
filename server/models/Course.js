const { getFirestore } = require('firebase-admin/firestore');

/**
 * Course Model
 * Xử lý tất cả các thao tác liên quan đến khóa học trong Firestore
 */
class Course {
    constructor(data) {
        this.id = data.id || null;
        this.title = data.title;
        this.description = data.description || '';
        this.instructor = data.instructor || '';
        this.instructorId = data.instructorId || null;
        this.price = data.price || 0;
        this.duration = data.duration || '';
        this.level = data.level || 'beginner'; // beginner, intermediate, advanced
        this.category = data.category || '';
        this.thumbnail = data.thumbnail || '';
        this.rating = data.rating || 0;
        this.enrolledStudents = data.enrolledStudents || 0;
        this.isPublished = data.isPublished !== undefined ? data.isPublished : false;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    /**
     * Lấy instance của Firestore
     */
    static getDB() {
        return getFirestore();
    }

    /**
     * Tìm khóa học theo ID
     * @param {string} id - Course ID
     * @returns {Promise<Course|null>} - Course object hoặc null
     */
    static async findById(id) {
        try {
            const db = this.getDB();
            const doc = await db.collection('courses').doc(id).get();

            if (!doc.exists) {
                return null;
            }

            return new Course({ id: doc.id, ...doc.data() });
        } catch (error) {
            throw new Error(`Error finding course by ID: ${error.message}`);
        }
    }

    /**
     * Lấy tất cả khóa học
     * @param {Object} filters - Bộ lọc (category, level, isPublished, etc.)
     * @returns {Promise<Array<Course>>} - Mảng Course objects
     */
    static async findAll(filters = {}) {
        try {
            const db = this.getDB();
            let query = db.collection('courses');

            // Áp dụng các bộ lọc
            if (filters.category) {
                query = query.where('category', '==', filters.category);
            }

            if (filters.level) {
                query = query.where('level', '==', filters.level);
            }

            if (filters.isPublished !== undefined) {
                query = query.where('isPublished', '==', filters.isPublished);
            }

            if (filters.instructorId) {
                query = query.where('instructorId', '==', filters.instructorId);
            }

            // Sắp xếp
            if (filters.orderBy) {
                query = query.orderBy(filters.orderBy, filters.orderDirection || 'asc');
            }

            // Limit
            if (filters.limit) {
                query = query.limit(filters.limit);
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => new Course({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error(`Error finding all courses: ${error.message}`);
        }
    }

    /**
     * Tìm kiếm khóa học theo tiêu đề
     * @param {string} searchTerm - Từ khóa tìm kiếm
     * @returns {Promise<Array<Course>>} - Mảng Course objects
     */
    static async search(searchTerm) {
        try {
            const db = this.getDB();
            const snapshot = await db.collection('courses').get();

            // Firestore không hỗ trợ full-text search, nên phải filter ở client
            const courses = snapshot.docs
                .map(doc => new Course({ id: doc.id, ...doc.data() }))
                .filter(course =>
                    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    course.description.toLowerCase().includes(searchTerm.toLowerCase())
                );

            return courses;
        } catch (error) {
            throw new Error(`Error searching courses: ${error.message}`);
        }
    }

    /**
     * Tạo khóa học mới
     * @param {Object} courseData - Dữ liệu khóa học
     * @returns {Promise<Course>} - Course object đã tạo
     */
    static async create(courseData) {
        try {
            const db = this.getDB();

            const newCourse = new Course({
                ...courseData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            const docRef = await db.collection('courses').add({
                title: newCourse.title,
                description: newCourse.description,
                instructor: newCourse.instructor,
                instructorId: newCourse.instructorId,
                price: newCourse.price,
                duration: newCourse.duration,
                level: newCourse.level,
                category: newCourse.category,
                thumbnail: newCourse.thumbnail,
                rating: newCourse.rating,
                enrolledStudents: newCourse.enrolledStudents,
                isPublished: newCourse.isPublished,
                createdAt: newCourse.createdAt,
                updatedAt: newCourse.updatedAt
            });

            newCourse.id = docRef.id;
            return newCourse;
        } catch (error) {
            throw new Error(`Error creating course: ${error.message}`);
        }
    }

    /**
     * Cập nhật khóa học
     * @param {string} id - Course ID
     * @param {Object} updateData - Dữ liệu cần cập nhật
     * @returns {Promise<Course>} - Course object đã cập nhật
     */
    static async update(id, updateData) {
        try {
            const db = this.getDB();
            const courseRef = db.collection('courses').doc(id);
            const doc = await courseRef.get();

            if (!doc.exists) {
                throw new Error('Course not found');
            }

            updateData.updatedAt = new Date().toISOString();
            await courseRef.update(updateData);

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating course: ${error.message}`);
        }
    }

    /**
     * Xóa khóa học
     * @param {string} id - Course ID
     * @returns {Promise<boolean>} - true nếu xóa thành công
     */
    static async delete(id) {
        try {
            const db = this.getDB();
            await db.collection('courses').doc(id).delete();
            return true;
        } catch (error) {
            throw new Error(`Error deleting course: ${error.message}`);
        }
    }

    /**
     * Tăng số lượng học sinh đăng ký
     * @param {string} id - Course ID
     * @returns {Promise<Course>} - Course object đã cập nhật
     */
    static async incrementEnrollment(id) {
        try {
            const db = this.getDB();
            const courseRef = db.collection('courses').doc(id);
            const doc = await courseRef.get();

            if (!doc.exists) {
                throw new Error('Course not found');
            }

            const currentEnrolled = doc.data().enrolledStudents || 0;
            await courseRef.update({
                enrolledStudents: currentEnrolled + 1,
                updatedAt: new Date().toISOString()
            });

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error incrementing enrollment: ${error.message}`);
        }
    }

    /**
     * Cập nhật rating của khóa học
     * @param {string} id - Course ID
     * @param {number} newRating - Rating mới
     * @returns {Promise<Course>} - Course object đã cập nhật
     */
    static async updateRating(id, newRating) {
        try {
            const db = this.getDB();
            const courseRef = db.collection('courses').doc(id);
            const doc = await courseRef.get();

            if (!doc.exists) {
                throw new Error('Course not found');
            }

            await courseRef.update({
                rating: newRating,
                updatedAt: new Date().toISOString()
            });

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating rating: ${error.message}`);
        }
    }

    /**
     * Publish/Unpublish khóa học
     * @param {string} id - Course ID
     * @param {boolean} isPublished - Trạng thái publish
     * @returns {Promise<Course>} - Course object đã cập nhật
     */
    static async togglePublish(id, isPublished) {
        try {
            const db = this.getDB();
            const courseRef = db.collection('courses').doc(id);
            const doc = await courseRef.get();

            if (!doc.exists) {
                throw new Error('Course not found');
            }

            await courseRef.update({
                isPublished: isPublished,
                updatedAt: new Date().toISOString()
            });

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error toggling publish status: ${error.message}`);
        }
    }

    /**
     * Lấy các khóa học phổ biến nhất
     * @param {number} limit - Số lượng khóa học
     * @returns {Promise<Array<Course>>} - Mảng Course objects
     */
    static async getPopular(limit = 10) {
        try {
            const db = this.getDB();
            const snapshot = await db.collection('courses')
                .where('isPublished', '==', true)
                .orderBy('enrolledStudents', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => new Course({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error(`Error getting popular courses: ${error.message}`);
        }
    }

    /**
     * Chuyển đổi thành object đơn giản
     * @returns {Object} - Course object
     */
    toJSON() {
        return { ...this };
    }
}

module.exports = Course;
