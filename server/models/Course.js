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
        // Support both camelCase and snake_case for backwards compatibility
        this.instructorId = data.instructorId || data.teacher_id || null;
        this.teacher_id = data.teacher_id || data.instructorId || null; // Keep for backwards compat
        this.price = data.price || 0;
        this.duration = data.duration || '';
        this.level = data.level || 'beginner'; // beginner, intermediate, advanced
        this.category = data.category || '';
        // Support both thumbnail and imageUrl for backwards compatibility
        this.thumbnail = data.thumbnail || data.imageUrl || '';
        this.imageUrl = data.imageUrl || data.thumbnail || ''; // Keep for backwards compat
        this.rating = data.rating || 0;
        this.enrolledStudents = data.enrolledStudents || 0;
        this.isPublished = data.isPublished !== undefined ? data.isPublished : false;
        this.status = data.status || 'draft'; // draft, pending, approved, rejected
        this.rejectionReason = data.rejectionReason || null;
        this.approvedBy = data.approvedBy || null;
        this.approvedAt = data.approvedAt || null;
        this.locked = data.locked !== undefined ? data.locked : false; // PRO/FREE access
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

// Lấy instance của Firestore
    static getDB() {
        return getFirestore();
    }

    // Tìm khóa học theo ID
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

 // Lấy tất cả khóa học ---- Function1
    static async findAll(filters = {}) {
        try {
            const db = this.getDB();
            let query = db.collection('courses');

            // Áp dụng các bộ lọc     // Lọc theo category, level, hoặc người dạy

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
                // Use snake_case field name for Firestore
                query = query.where('teacher_id', '==', filters.instructorId);
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

// Tìm kiếm khóa học theo tiêu đề 
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

    // Tạo khóa học mới (Create in CRUD)
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
                status: newCourse.status,
                rejectionReason: newCourse.rejectionReason,
                approvedBy: newCourse.approvedBy,
                approvedAt: newCourse.approvedAt,
                locked: newCourse.locked,
                createdAt: newCourse.createdAt,
                updatedAt: newCourse.updatedAt
            });

            newCourse.id = docRef.id;
            return newCourse;
        } catch (error) {
            throw new Error(`Error creating course: ${error.message}`);
        }
    }

    // Cập nhật khóa học
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

    // Xóa khóa học (Delete in CRUD, checkpoint)
    static async delete(id) {
        try {
            const db = this.getDB();
            await db.collection('courses').doc(id).delete();
            return true;
        } catch (error) {
            throw new Error(`Error deleting course: ${error.message}`);
        }
    }

    // Tăng số lượng học sinh đăng ký (Mỗi khi có người mới học → cộng thêm 1 vào số học sinh.)
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

    // Publish/Unpublish khóa học
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

    // Lấy các khóa học phổ biến nhất
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

// Get all courses with teacher details and enrollment counts (fixes N+1 query)
    static async getAllWithDetails(filters = {}) {
        try {
            const User = require('./User');
            const Enrollment = require('./Enrollment');

            // Query 1: Get all courses with filters
            const courses = await this.findAll(filters);

            if (courses.length === 0) {
                return [];
            }

            // Query 2: Batch fetch teachers using User.findByIds()
            const teacherIds = [...new Set(courses.map(c => c.instructorId).filter(Boolean))];
            const teachers = teacherIds.length > 0 ? await User.findByIds(teacherIds) : [];
            const teacherMap = Object.fromEntries(teachers.map(t => [t.id, t]));

            // Query 3: Get enrollment counts using Enrollment.countByCourses()
            const courseIds = courses.map(c => c.id);
            const enrollmentCounts = await Enrollment.countByCourses(courseIds);

            // Combine data in memory
            return courses.map(course => ({
                id: course.id,
                title: course.title,
                description: course.description,
                instructor: course.instructor,
                instructorId: course.instructorId,
                teacher_id: course.teacher_id, // Backwards compatibility
                price: course.price,
                duration: course.duration,
                level: course.level,
                category: course.category,
                thumbnail: course.thumbnail,
                imageUrl: course.imageUrl, // Backwards compatibility
                rating: course.rating,
                enrolledStudents: course.enrolledStudents,
                isPublished: course.isPublished,
                status: course.status,
                rejectionReason: course.rejectionReason,
                approvedBy: course.approvedBy,
                approvedAt: course.approvedAt,
                locked: course.locked,
                createdAt: course.createdAt,
                updatedAt: course.updatedAt,
                // Enriched data
                teacher: teacherMap[course.instructorId] || null,
                enrollmentCount: enrollmentCounts[course.id] || 0
            }));
        } catch (error) {
            throw new Error(`Error getting all courses with details: ${error.message}`);
        }
    }

    // Chuyển đổi thành object đơn giản
    toJSON() {
        return { ...this };
    }
}

module.exports = Course;
