const { getFirestore } = require('firebase-admin/firestore');

/**
 * Blog Model
 * Handles all blog post operations in Firestore
 */
class Blog {
    constructor(data) {
        this.id = data.id || null;
        this.title = data.title;
        this.content = data.content;
        this.excerpt = data.excerpt || '';
        this.slug = data.slug || '';

        // Support both camelCase and snake_case
        this.featuredImage = data.featuredImage || data.featured_image || '';
        this.featured_image = data.featured_image || data.featuredImage || '';

        this.tags = data.tags || [];
        this.status = data.status || 'draft'; // draft, published

        this.authorId = data.authorId || data.author_id;
        this.author_id = data.author_id || data.authorId;

        this.authorName = data.authorName || data.author_name || '';
        this.author_name = data.author_name || data.authorName || '';

        this.viewCount = data.viewCount || data.view_count || 0;
        this.view_count = data.view_count || data.viewCount || 0;

        this.likeCount = data.likeCount || data.like_count || 0;
        this.like_count = data.like_count || data.likeCount || 0;

        this.createdAt = data.createdAt || data.created_at || new Date().toISOString();
        this.created_at = data.created_at || data.createdAt || new Date().toISOString();

        this.updatedAt = data.updatedAt || data.updated_at || new Date().toISOString();
        this.updated_at = data.updated_at || data.updatedAt || new Date().toISOString();
    }

    /**
     * Get Firestore instance
     */
    static getDB() {
        return getFirestore();
    }

    /**
     * Generate slug from title
     * @param {string} title - Blog post title
     * @returns {string} - URL-friendly slug
     */
    static generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }

    /**
     * Find blog post by ID
     * @param {string} id - Blog post ID
     * @returns {Promise<Blog|null>} - Blog object or null
     */
    static async findById(id) {
        try {
            const db = this.getDB();
            const doc = await db.collection('blog_posts').doc(id).get();

            if (!doc.exists) {
                return null;
            }

            return new Blog({ id: doc.id, ...doc.data() });
        } catch (error) {
            throw new Error(`Error finding blog post by ID: ${error.message}`);
        }
    }

    /**
     * Find blog post by slug
     * @param {string} slug - Blog post slug
     * @returns {Promise<Blog|null>} - Blog object or null
     */
    static async findBySlug(slug) {
        try {
            const db = this.getDB();
            const snapshot = await db.collection('blog_posts')
                .where('slug', '==', slug)
                .limit(1)
                .get();

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            return new Blog({ id: doc.id, ...doc.data() });
        } catch (error) {
            throw new Error(`Error finding blog post by slug: ${error.message}`);
        }
    }

    /**
     * Get all blog posts with filters
     * @param {Object} filters - Filter options (status, tag, authorId, page, limit, search)
     * @returns {Promise<Array<Blog>>} - Array of Blog objects
     */
    static async findAll(filters = {}) {
        try {
            const db = this.getDB();
            let query = db.collection('blog_posts');

            // Filter by status
            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }

            // Filter by tag
            if (filters.tag) {
                query = query.where('tags', 'array-contains', filters.tag);
            }

            // Filter by author
            if (filters.authorId || filters.author_id) {
                const authorId = filters.authorId || filters.author_id;
                query = query.where('author_id', '==', authorId);
            }

            // Get all documents first (we'll filter by search and paginate in memory)
            const snapshot = await query.get();
            let blogs = snapshot.docs.map(doc => new Blog({ id: doc.id, ...doc.data() }));

            // Search filter (client-side)
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                blogs = blogs.filter(blog =>
                    blog.title.toLowerCase().includes(searchLower) ||
                    blog.content.toLowerCase().includes(searchLower) ||
                    blog.excerpt.toLowerCase().includes(searchLower)
                );
            }

            // Sort by created date (newest first)
            blogs.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.created_at);
                const dateB = new Date(b.createdAt || b.created_at);
                return dateB - dateA;
            });

            // Pagination
            const page = parseInt(filters.page) || 1;
            const limit = parseInt(filters.limit) || 10;
            const offset = (page - 1) * limit;

            if (filters.page || filters.limit) {
                blogs = blogs.slice(offset, offset + limit);
            }

            return blogs;
        } catch (error) {
            throw new Error(`Error finding all blog posts: ${error.message}`);
        }
    }

    /**
     * Get total count of blog posts
     * @param {Object} filters - Filter options (status, tag, authorId, search)
     * @returns {Promise<number>} - Total count
     */
    static async count(filters = {}) {
        try {
            const db = this.getDB();
            let query = db.collection('blog_posts');

            // Apply same filters as findAll (except pagination)
            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }

            if (filters.tag) {
                query = query.where('tags', 'array-contains', filters.tag);
            }

            if (filters.authorId || filters.author_id) {
                const authorId = filters.authorId || filters.author_id;
                query = query.where('author_id', '==', authorId);
            }

            const snapshot = await query.get();
            let count = snapshot.size;

            // Apply search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const blogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                count = blogs.filter(blog =>
                    blog.title.toLowerCase().includes(searchLower) ||
                    blog.content.toLowerCase().includes(searchLower) ||
                    (blog.excerpt && blog.excerpt.toLowerCase().includes(searchLower))
                ).length;
            }

            return count;
        } catch (error) {
            throw new Error(`Error counting blog posts: ${error.message}`);
        }
    }

    /**
     * Get blog posts by author
     * @param {string} authorId - Author ID
     * @returns {Promise<Array<Blog>>} - Array of Blog objects
     */
    static async findByAuthor(authorId) {
        try {
            return await this.findAll({ authorId });
        } catch (error) {
            throw new Error(`Error finding blog posts by author: ${error.message}`);
        }
    }

    /**
     * Create a new blog post (Create in CRUD)
     * @param {Object} blogData - Blog post data
     * @returns {Promise<Blog>} - Created Blog object
     */
    static async create(blogData) {
        try {
            const db = this.getDB();

            // Generate slug if not provided
            if (!blogData.slug && blogData.title) {
                blogData.slug = this.generateSlug(blogData.title);
            }

            // Generate excerpt if not provided
            if (!blogData.excerpt && blogData.content) {
                blogData.excerpt = blogData.content.substring(0, 200) + '...';
            }

            const newBlog = new Blog({
                ...blogData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                viewCount: 0,
                likeCount: 0
            });

            const docRef = await db.collection('blog_posts').add({
                title: newBlog.title,
                content: newBlog.content,
                excerpt: newBlog.excerpt,
                slug: newBlog.slug,
                featured_image: newBlog.featured_image,
                tags: newBlog.tags,
                status: newBlog.status,
                author_id: newBlog.author_id,
                author_name: newBlog.author_name,
                view_count: newBlog.view_count,
                like_count: newBlog.like_count,
                created_at: newBlog.created_at,
                updated_at: newBlog.updated_at
            });

            newBlog.id = docRef.id;
            return newBlog;
        } catch (error) {
            throw new Error(`Error creating blog post: ${error.message}`);
        }
    }

    /**
     * Update blog post (Update in CRUD)
     * @param {string} id - Blog post ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Blog>} - Updated Blog object
     */
    static async update(id, updateData) {
        try {
            const db = this.getDB();
            const blogRef = db.collection('blog_posts').doc(id);
            const doc = await blogRef.get();

            if (!doc.exists) {
                throw new Error('Blog post not found');
            }

            // Update slug if title changed
            if (updateData.title && updateData.title !== doc.data().title) {
                updateData.slug = this.generateSlug(updateData.title);
            }

            updateData.updated_at = new Date().toISOString();
            updateData.updatedAt = new Date().toISOString();

            await blogRef.update(updateData);

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating blog post: ${error.message}`);
        }
    }

    /**
     * Delete blog post (Delete in CRUD)
     * @param {string} id - Blog post ID
     * @returns {Promise<boolean>} - true if successful
     */
    static async delete(id) {
        try {
            const db = this.getDB();
            await db.collection('blog_posts').doc(id).delete();
            return true;
        } catch (error) {
            throw new Error(`Error deleting blog post: ${error.message}`);
        }
    }

    /**
     * Increment view count
     * @param {string} id - Blog post ID
     * @returns {Promise<Blog>} - Updated Blog object
     */
    static async incrementViewCount(id) {
        try {
            const db = this.getDB();
            const blogRef = db.collection('blog_posts').doc(id);
            const doc = await blogRef.get();

            if (!doc.exists) {
                throw new Error('Blog post not found');
            }

            const currentCount = doc.data().view_count || 0;
            await blogRef.update({
                view_count: currentCount + 1,
                updated_at: new Date().toISOString()
            });

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error incrementing view count: ${error.message}`);
        }
    }

    /**
     * Get all unique tags
     * @returns {Promise<Array<{tag: string, count: number}>>} - Array of tag objects with counts
     */
    static async getAllTags() {
        try {
            const db = this.getDB();
            const snapshot = await db.collection('blog_posts')
                .where('status', '==', 'published')
                .get();

            const tagCounts = {};

            snapshot.forEach(doc => {
                const tags = doc.data().tags || [];
                tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            });

            // Sort tags by count (descending)
            const sortedTags = Object.entries(tagCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([tag, count]) => ({ tag, count }));

            return sortedTags;
        } catch (error) {
            throw new Error(`Error getting all tags: ${error.message}`);
        }
    }

    /**
     * Convert to JSON
     * @returns {Object} - Blog post object
     */
    toJSON() {
        return { ...this };
    }
}

module.exports = Blog;
