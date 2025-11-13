const Blog = require('../models/Blog');

// Tạo blog post mới (chỉ admin/teacher) (Create in Controller)
const createBlogPost = async (req, res) => {
    try {
        const { title, content, excerpt, featured_image, featuredImage, tags, status = 'draft' } = req.body;
        const { user } = req; // Từ middleware xác thực

        console.log('Create blog post request:', { title, hasContent: !!content, user: user?.email });

        // Kiểm tra quyền (chỉ admin hoặc teacher)
        if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
            console.error('Access denied:', { user: user?.email, role: user?.role });
            return res.status(403).json({
                success: false,
                error: 'Access denied. Only admins and teachers can create blog posts.'
            });
        }

        // Validate required fields
        if (!title || !content) {
            console.error('Missing required fields:', { hasTitle: !!title, hasContent: !!content });
            return res.status(400).json({
                success: false,
                error: 'Title and content are required.'
            });
        }

        const blogData = {
            title,
            content,
            excerpt,
            featured_image: featured_image || featuredImage,
            featuredImage: featuredImage || featured_image,
            tags: tags || [],
            status,
            author_id: user.id,
            authorId: user.id,
            author_name: user.name,
            authorName: user.name
        };

        const newBlog = await Blog.create(blogData);

        res.status(201).json({
            success: true,
            message: 'Blog post created successfully',
            data: newBlog.toJSON()
        });
    } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({ success: false, error: 'Failed to create blog post' });
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
            author_id,
            authorId,
            search
        } = req.query;

        const filters = {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            tag,
            author_id: author_id || authorId,
            search
        };

        const blogs = await Blog.findAll(filters);
        const totalPosts = await Blog.count({ status, tag, author_id: author_id || authorId, search });
        const totalPages = Math.ceil(totalPosts / parseInt(limit));

        res.json({
            success: true,
            data: {
                posts: blogs.map(b => b.toJSON()),
                pagination: {
                    current_page: parseInt(page),
                    total_pages: totalPages,
                    total_posts: totalPosts,
                    has_next: parseInt(page) < totalPages,
                    has_prev: parseInt(page) > 1
                }
            }
        });
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch blog posts' });
    }
};

// Lấy một blog post theo ID hoặc slug
const getBlogPostBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        let blog;

        // Try finding by slug first
        blog = await Blog.findBySlug(slug);

        // If not found by slug, try by ID
        if (!blog) {
            blog = await Blog.findById(slug);
        }

        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog post not found' });
        }

        // Increment view count
        await Blog.incrementViewCount(blog.id);

        // Re-fetch to get updated view count
        const updatedBlog = await Blog.findById(blog.id);

        // Return unwrapped data for consistency with course API
        res.json(updatedBlog.toJSON());
    } catch (error) {
        console.error('Error fetching blog post:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch blog post' });
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
                success: false,
                error: 'Access denied. Only admins and teachers can update blog posts.'
            });
        }

        // Lấy blog post hiện tại
        const currentPost = await Blog.findById(id);
        if (!currentPost) {
            return res.status(404).json({ success: false, error: 'Blog post not found' });
        }

        // Kiểm tra nếu user không phải admin thì chỉ được sửa post của mình
        if (user.role !== 'admin' && currentPost.author_id !== user.id) {
            return res.status(403).json({
                success: false,
                error: 'You can only edit your own posts.'
            });
        }

        const updatedBlog = await Blog.update(id, updateData);

        res.json({
            success: true,
            message: 'Blog post updated successfully',
            data: updatedBlog.toJSON()
        });
    } catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({ success: false, error: 'Failed to update blog post' });
    }
};

// Xóa blog post (chỉ admin/teacher và author) (Delete trong Controller)
const deleteBlogPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { user } = req;

        // Kiểm tra quyền
        if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Only admins and teachers can delete blog posts.'
            });
        }

        // Lấy blog post hiện tại
        const currentPost = await Blog.findById(id);
        if (!currentPost) {
            return res.status(404).json({ success: false, error: 'Blog post not found' });
        }

        // Kiểm tra nếu user không phải admin thì chỉ được xóa post của mình
        if (user.role !== 'admin' && currentPost.author_id !== user.id) {
            return res.status(403).json({
                success: false,
                error: 'You can only delete your own posts.'
            });
        }

        await Blog.delete(id);

        res.json({
            success: true,
            message: 'Blog post deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting blog post:', error);
        res.status(500).json({ success: false, error: 'Failed to delete blog post' });
    }
};

// Lấy các tags phổ biến (checkpoint)
const getBlogTags = async (req, res) => {
    try {
        const tags = await Blog.getAllTags();

        res.json({
            success: true,
            data: tags
        });
    } catch (error) {
        console.error('Error fetching blog tags:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch blog tags' });
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