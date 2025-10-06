const admin = require('firebase-admin');

// Tạo blog post mới (chỉ admin/teacher)
const createBlogPost = async (req, res) => {
    try {
        const { title, content, excerpt, featured_image, tags, status = 'draft' } = req.body;
        const { user } = req; // Từ middleware xác thực

        console.log('Create blog post request:', { title, hasContent: !!content, user: user?.email });

        // Kiểm tra quyền (chỉ admin hoặc teacher)
        if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
            console.error('Access denied:', { user: user?.email, role: user?.role });
            return res.status(403).json({
                error: 'Access denied. Only admins and teachers can create blog posts.'
            });
        }

        // Validate required fields
        if (!title || !content) {
            console.error('Missing required fields:', { hasTitle: !!title, hasContent: !!content });
            return res.status(400).json({
                error: 'Title and content are required.'
            });
        }

        // Tạo slug từ title
        const slug = title.toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');

        const blogPost = {
            title,
            content,
            excerpt: excerpt || content.substring(0, 200) + '...',
            slug,
            featured_image: featured_image || null,
            tags: tags || [],
            status, // 'published', 'draft'
            author_id: user.id,
            author_name: user.name,
            view_count: 0,
            like_count: 0,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await req.db.collection('blog_posts').add(blogPost);

        res.status(201).json({
            message: 'Blog post created successfully',
            id: docRef.id,
            ...blogPost
        });
    } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({ error: 'Failed to create blog post' });
    }
};

// Lấy tất cả blog posts (public với pagination)
const getBlogPosts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            tag,
            author_id
        } = req.query;

        let query = req.db.collection('blog_posts');

        // Filter by status
        if (status) {
            query = query.where('status', '==', status);
        }

        // Filter by tag
        if (tag) {
            query = query.where('tags', 'array-contains', tag);
        }

        // Filter by author
        if (author_id) {
            query = query.where('author_id', '==', author_id);
        }

        // Order by created_at descending (only if no filters applied to avoid index issues)
        if (!status && !tag && !author_id) {
            query = query.orderBy('created_at', 'desc');
        }

        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        if (offset > 0) {
            query = query.offset(offset);
        }
        query = query.limit(parseInt(limit));

        const snapshot = await query.get();
        const blogPosts = [];

        snapshot.forEach(doc => {
            blogPosts.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Get total count for pagination
        let totalQuery = req.db.collection('blog_posts');
        if (status) {
            totalQuery = totalQuery.where('status', '==', status);
        }
        const totalSnapshot = await totalQuery.get();

        const totalPosts = totalSnapshot.size;
        const totalPages = Math.ceil(totalPosts / parseInt(limit));

        res.json({
            posts: blogPosts,
            pagination: {
                current_page: parseInt(page),
                total_pages: totalPages,
                total_posts: totalPosts,
                has_next: parseInt(page) < totalPages,
                has_prev: parseInt(page) > 1
            }
        });
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
};

// Lấy một blog post theo ID hoặc slug
const getBlogPostBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        let doc;

        // Thử tìm theo slug trước
        const slugQuery = await req.db.collection('blog_posts')
            .where('slug', '==', slug)
            .limit(1)
            .get();

        if (!slugQuery.empty) {
            doc = slugQuery.docs[0];
        } else {
            // Nếu không tìm thấy theo slug, thử tìm theo ID
            doc = await req.db.collection('blog_posts').doc(slug).get();
        }

        if (!doc.exists) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        const blogPost = {
            id: doc.id,
            ...doc.data()
        };

        // Tăng view count
        await req.db.collection('blog_posts').doc(doc.id).update({
            view_count: admin.firestore.FieldValue.increment(1)
        });

        res.json(blogPost);
    } catch (error) {
        console.error('Error fetching blog post:', error);
        res.status(500).json({ error: 'Failed to fetch blog post' });
    }
};

// Cập nhật blog post (chỉ admin/teacher và author)
const updateBlogPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { user } = req;
        const updateData = req.body;

        // Kiểm tra quyền
        if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
            return res.status(403).json({
                error: 'Access denied. Only admins and teachers can update blog posts.'
            });
        }

        // Lấy blog post hiện tại
        const doc = await req.db.collection('blog_posts').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        const currentPost = doc.data();

        // Kiểm tra nếu user không phải admin thì chỉ được sửa post của mình
        if (user.role !== 'admin' && currentPost.author_id !== user.id) {
            return res.status(403).json({
                error: 'You can only edit your own posts.'
            });
        }

        // Cập nhật slug nếu title thay đổi
        if (updateData.title && updateData.title !== currentPost.title) {
            updateData.slug = updateData.title.toLowerCase()
                .replace(/[^a-z0-9 -]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim('-');
        }

        // Thêm timestamp update
        updateData.updated_at = admin.firestore.FieldValue.serverTimestamp();

        await req.db.collection('blog_posts').doc(id).update(updateData);

        res.json({
            message: 'Blog post updated successfully',
            id: id
        });
    } catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({ error: 'Failed to update blog post' });
    }
};

// Xóa blog post (chỉ admin/teacher và author)
const deleteBlogPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { user } = req;

        // Kiểm tra quyền
        if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
            return res.status(403).json({
                error: 'Access denied. Only admins and teachers can delete blog posts.'
            });
        }

        // Lấy blog post hiện tại
        const doc = await req.db.collection('blog_posts').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        const currentPost = doc.data();

        // Kiểm tra nếu user không phải admin thì chỉ được xóa post của mình
        if (user.role !== 'admin' && currentPost.author_id !== user.id) {
            return res.status(403).json({
                error: 'You can only delete your own posts.'
            });
        }

        await req.db.collection('blog_posts').doc(id).delete();

        res.json({ message: 'Blog post deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog post:', error);
        res.status(500).json({ error: 'Failed to delete blog post' });
    }
};

// Lấy các tags phổ biến
const getBlogTags = async (req, res) => {
    try {
        const snapshot = await req.db.collection('blog_posts')
            .where('status', '==', 'published')
            .get();

        const tagCounts = {};

        snapshot.forEach(doc => {
            const tags = doc.data().tags || [];
            tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        // Sắp xếp tags theo số lượng sử dụng
        const sortedTags = Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a)
            .map(([tag, count]) => ({ tag, count }));

        res.json(sortedTags);
    } catch (error) {
        console.error('Error fetching blog tags:', error);
        res.status(500).json({ error: 'Failed to fetch blog tags' });
    }
};

module.exports = {
    createBlogPost,
    getBlogPosts,
    getBlogPostBySlug,
    updateBlogPost,
    deleteBlogPost,
    getBlogTags
};