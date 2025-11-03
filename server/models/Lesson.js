const { getFirestore } = require('firebase-admin/firestore');

/**
 * Lesson Model
 * Xử lý tất cả các thao tác liên quan đến bài học trong Firestore
 */
class Lesson {
    constructor(data) {
        this.id = data.id || null;
        this.courseId = data.courseId;
        this.title = data.title;
        this.description = data.description || '';
        this.content = data.content || '';
        this.videoUrl = data.videoUrl || '';
        this.duration = data.duration || '';
        this.order = data.order || 0;
        this.isPublished = data.isPublished !== undefined ? data.isPublished : false;
        this.resources = data.resources || []; // Array of resource links
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
     * Tìm bài học theo ID
     * @param {string} id - Lesson ID
     * @returns {Promise<Lesson|null>} - Lesson object hoặc null
     */
    static async findById(id) {
        try {
            const db = this.getDB();
            const doc = await db.collection('lessons').doc(id).get();

            if (!doc.exists) {
                return null;
            }

            return new Lesson({ id: doc.id, ...doc.data() });
        } catch (error) {
            throw new Error(`Error finding lesson by ID: ${error.message}`);
        }
    }

    /**
     * Lấy tất cả bài học
     * @param {Object} filters - Bộ lọc (courseId, isPublished, etc.)
     * @returns {Promise<Array<Lesson>>} - Mảng Lesson objects
     */
    static async findAll(filters = {}) {
        try {
            const db = this.getDB();
            let query = db.collection('lessons');

            // Áp dụng bộ lọc theo courseId
            if (filters.courseId) {
                query = query.where('courseId', '==', filters.courseId);
            }

            // Áp dụng bộ lọc theo isPublished
            if (filters.isPublished !== undefined) {
                query = query.where('isPublished', '==', filters.isPublished);
            }

            // Sắp xếp theo order
            query = query.orderBy('order', 'asc');

            // Limit
            if (filters.limit) {
                query = query.limit(filters.limit);
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => new Lesson({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error(`Error finding all lessons: ${error.message}`);
        }
    }

    /**
     * Lấy tất cả bài học của một khóa học
     * @param {string} courseId - Course ID
     * @returns {Promise<Array<Lesson>>} - Mảng Lesson objects
     */
    static async findByCourseId(courseId) {
        try {
            return await this.findAll({ courseId });
        } catch (error) {
            throw new Error(`Error finding lessons by course ID: ${error.message}`);
        }
    }

    /**
     * Tạo bài học mới
     * @param {Object} lessonData - Dữ liệu bài học
     * @returns {Promise<Lesson>} - Lesson object đã tạo
     */
    static async create(lessonData) {
        try {
            const db = this.getDB();

            const newLesson = new Lesson({
                ...lessonData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            const docRef = await db.collection('lessons').add({
                courseId: newLesson.courseId,
                title: newLesson.title,
                description: newLesson.description,
                content: newLesson.content,
                videoUrl: newLesson.videoUrl,
                duration: newLesson.duration,
                order: newLesson.order,
                isPublished: newLesson.isPublished,
                resources: newLesson.resources,
                createdAt: newLesson.createdAt,
                updatedAt: newLesson.updatedAt
            });

            newLesson.id = docRef.id;
            return newLesson;
        } catch (error) {
            throw new Error(`Error creating lesson: ${error.message}`);
        }
    }

    /**
     * Cập nhật bài học
     * @param {string} id - Lesson ID
     * @param {Object} updateData - Dữ liệu cần cập nhật
     * @returns {Promise<Lesson>} - Lesson object đã cập nhật
     */
    static async update(id, updateData) {
        try {
            const db = this.getDB();
            const lessonRef = db.collection('lessons').doc(id);
            const doc = await lessonRef.get();

            if (!doc.exists) {
                throw new Error('Lesson not found');
            }

            updateData.updatedAt = new Date().toISOString();
            await lessonRef.update(updateData);

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating lesson: ${error.message}`);
        }
    }

    /**
     * Xóa bài học
     * @param {string} id - Lesson ID
     * @returns {Promise<boolean>} - true nếu xóa thành công
     */
    static async delete(id) {
        try {
            const db = this.getDB();
            await db.collection('lessons').doc(id).delete();
            return true;
        } catch (error) {
            throw new Error(`Error deleting lesson: ${error.message}`);
        }
    }

    /**
     * Thay đổi thứ tự bài học
     * @param {string} id - Lesson ID
     * @param {number} newOrder - Thứ tự mới
     * @returns {Promise<Lesson>} - Lesson object đã cập nhật
     */
    static async reorder(id, newOrder) {
        try {
            const db = this.getDB();
            const lessonRef = db.collection('lessons').doc(id);
            const doc = await lessonRef.get();

            if (!doc.exists) {
                throw new Error('Lesson not found');
            }

            await lessonRef.update({
                order: newOrder,
                updatedAt: new Date().toISOString()
            });

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error reordering lesson: ${error.message}`);
        }
    }

    /**
     * Publish/Unpublish bài học
     * @param {string} id - Lesson ID
     * @param {boolean} isPublished - Trạng thái publish
     * @returns {Promise<Lesson>} - Lesson object đã cập nhật
     */
    static async togglePublish(id, isPublished) {
        try {
            const db = this.getDB();
            const lessonRef = db.collection('lessons').doc(id);
            const doc = await lessonRef.get();

            if (!doc.exists) {
                throw new Error('Lesson not found');
            }

            await lessonRef.update({
                isPublished: isPublished,
                updatedAt: new Date().toISOString()
            });

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error toggling publish status: ${error.message}`);
        }
    }

    /**
     * Thêm tài nguyên vào bài học
     * @param {string} id - Lesson ID
     * @param {Object} resource - Tài nguyên mới
     * @returns {Promise<Lesson>} - Lesson object đã cập nhật
     */
    static async addResource(id, resource) {
        try {
            const db = this.getDB();
            const lessonRef = db.collection('lessons').doc(id);
            const doc = await lessonRef.get();

            if (!doc.exists) {
                throw new Error('Lesson not found');
            }

            const currentResources = doc.data().resources || [];
            currentResources.push(resource);

            await lessonRef.update({
                resources: currentResources,
                updatedAt: new Date().toISOString()
            });

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error adding resource: ${error.message}`);
        }
    }

    /**
     * Xóa tài nguyên khỏi bài học
     * @param {string} id - Lesson ID
     * @param {number} resourceIndex - Index của tài nguyên cần xóa
     * @returns {Promise<Lesson>} - Lesson object đã cập nhật
     */
    static async removeResource(id, resourceIndex) {
        try {
            const db = this.getDB();
            const lessonRef = db.collection('lessons').doc(id);
            const doc = await lessonRef.get();

            if (!doc.exists) {
                throw new Error('Lesson not found');
            }

            const currentResources = doc.data().resources || [];
            currentResources.splice(resourceIndex, 1);

            await lessonRef.update({
                resources: currentResources,
                updatedAt: new Date().toISOString()
            });

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error removing resource: ${error.message}`);
        }
    }

    /**
     * Chuyển đổi thành object đơn giản
     * @returns {Object} - Lesson object
     */
    toJSON() {
        return { ...this };
    }
}

module.exports = Lesson;
