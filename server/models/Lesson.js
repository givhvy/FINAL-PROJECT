const { getFirestore } = require('firebase-admin/firestore');

/**
 * Lesson Model
 * Xử lý tất cả các thao tác liên quan đến bài học trong Firestore
 */
class Lesson {
    constructor(data) {
        this.id = data.id || null;
        // Support both camelCase and snake_case for backwards compatibility
        this.courseId = data.courseId || data.course_id;
        this.course_id = data.course_id || data.courseId; // Keep for backwards compat
        this.title = data.title;
        this.description = data.description || '';

        // Backwards compatibility: support both old schema (content_data, content_type, content_data_html)
        // and new schema (content, videoUrl)
        this.content = data.content || data.content_data_html || '';
        this.videoUrl = data.videoUrl || data.video_url || (data.content_type === 'video' ? data.content_data : '') || '';

        // Keep old fields for backwards compatibility
        this.content_type = data.content_type || (data.videoUrl || data.video_url ? 'video' : 'text');
        this.content_data = data.content_data || data.videoUrl || data.video_url || '';
        this.content_data_html = data.content_data_html || data.content || '';

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

            // Áp dụng bộ lọc theo courseId (support both camelCase and snake_case)
            if (filters.courseId) {
                // Try courseId first, if no results, will fall back to course_id
                query = query.where('course_id', '==', filters.courseId);
            }

            // Áp dụng bộ lọc theo isPublished
            if (filters.isPublished !== undefined) {
                query = query.where('isPublished', '==', filters.isPublished);
            }

            // KHÔNG dùng orderBy để tránh cần composite index khi combine với where
            // Sẽ sort trong memory sau khi fetch

            const snapshot = await query.get();
            let lessons = snapshot.docs.map(doc => new Lesson({ id: doc.id, ...doc.data() }));

            // Sort by order in memory to avoid composite index requirement
            lessons.sort((a, b) => {
                const orderA = a.order || 0;
                const orderB = b.order || 0;
                return orderA - orderB; // Ascending order
            });

            // Apply limit after sorting
            if (filters.limit) {
                lessons = lessons.slice(0, filters.limit);
            }

            return lessons;
        } catch (error) {
            throw new Error(`Error finding all lessons: ${error.message}`);
        }
    }

    /**
     * tìm theo courseId
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
     * Batch get lessons by multiple course IDs (fixes N+1 query problem)
     * @param {Array<string>} courseIds - Array of course IDs
     * @returns {Promise<Array<Lesson>>} - Array of Lesson objects
     */
    static async findByCourseIds(courseIds) {
        try {
            if (!courseIds || courseIds.length === 0) return [];

            const db = this.getDB();
            const uniqueIds = [...new Set(courseIds)]; // Remove duplicates

            // Firestore 'in' query limit is 10
            const chunkSize = 10;
            const chunks = [];
            for (let i = 0; i < uniqueIds.length; i += chunkSize) {
                chunks.push(uniqueIds.slice(i, i + chunkSize));
            }

            // Fetch all chunks in parallel (without orderBy to avoid index requirement)
            const promises = chunks.map(chunk =>
                db.collection('lessons')
                    .where('courseId', 'in', chunk)
                    .get()
            );

            const snapshots = await Promise.all(promises);

            // Flatten results and sort in memory
            const lessons = snapshots.flatMap(snapshot =>
                snapshot.docs.map(doc => new Lesson({ id: doc.id, ...doc.data() }))
            );

            // Sort by order in memory
            lessons.sort((a, b) => (a.order || 0) - (b.order || 0));

            return lessons;
        } catch (error) {
            throw new Error(`Error finding lessons by course IDs: ${error.message}`);
        }
    }

    /**
     * Tạo bài học mới (create in CRUD)
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
     * Cập nhật bài học (update in CRUD)
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
     * Xóa bài học (Delete in CRUD)
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
