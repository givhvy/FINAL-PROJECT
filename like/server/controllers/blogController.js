// ============================================================================
// FILE NÀY LÀM GÌ? (What does this file do?)
// ============================================================================
// File này là BLOG CONTROLLER - điều khiển tất cả các thao tác liên quan đến BLOG POST (bài viết blog)
//
// Giống như một nhân viên quản lý blog, file này:
// ✅ Tạo bài viết blog mới (createBlogPost)
// ✅ Lấy danh sách tất cả bài viết (getBlogPosts) - có phân trang, lọc theo tag, tìm kiếm
// ✅ Lấy 1 bài viết cụ thể theo slug/ID (getBlogPostBySlug) - và tăng view count
// ✅ Cập nhật bài viết (updateBlogPost) - chỉ admin/teacher/author
// ✅ Xóa bài viết (deleteBlogPost) - chỉ admin/teacher/author
// ✅ Lấy danh sách các tags (getBlogTags)

// ============================================================================
// FLOW: FRONTEND → ROUTES → CONTROLLER → MODEL → DATABASE
// ============================================================================
//
// VÍ DỤ 1: TẠO BÀI VIẾT MỚI
// ┌─────────────────────────────────────────────────────────────────────┐
// │ BƯỚC 1: FRONTEND (file: views/pages/admin-dashboard.ejs hoặc JS)   │
// │ User click nút "Tạo Blog" trong admin dashboard                     │
// │                                                                      │
// │ JavaScript code:                                                     │
// │   fetch('/api/blogs', {                                             │
// │     method: 'POST',                                                 │
// │     headers: {                                                      │
// │       'Content-Type': 'application/json',                           │
// │       'Authorization': 'Bearer ' + token                            │
// │     },                                                              │
// │     body: JSON.stringify({                                          │
// │       title: 'Học JavaScript từ A-Z',                               │
// │       content: 'Nội dung bài viết...',                              │
// │       tags: ['javascript', 'tutorial']                              │
// │     })                                                              │
// │   })                                                                │
// └─────────────────────────────────────────────────────────────────────┘
//                                  ↓
// ┌─────────────────────────────────────────────────────────────────────┐
// │ BƯỚC 2: ROUTES (file: routes/blogRoutes.js)                        │
// │ Route nhận request và gọi controller                                │
// │                                                                      │
// │ Code:                                                               │
// │   router.post('/blogs',                                             │
// │     authMiddleware,              ← Kiểm tra JWT token trước         │
// │     createBlogPost               ← Gọi function trong file NÀY     │
// │   );                                                                │
// └─────────────────────────────────────────────────────────────────────┘
//                                  ↓
// ┌─────────────────────────────────────────────────────────────────────┐
// │ BƯỚC 3: CONTROLLER (file NÀY - blogController.js)                  │
// │ Function createBlogPost() xử lý logic:                              │
// │   - Kiểm tra quyền (chỉ admin/teacher)                             │
// │   - Validate dữ liệu (title, content có đủ không?)                 │
// │   - Gọi Model để lưu vào database                                  │
// │                                                                      │
// │ Code (dòng 43):                                                     │
// │   const newBlog = await Blog.create(blogData);  ← GỌI MODEL        │
// └─────────────────────────────────────────────────────────────────────┘
//                                  ↓
// ┌─────────────────────────────────────────────────────────────────────┐
// │ BƯỚC 4: MODEL (file: models/Blog.js)                               │
// │ Model thực hiện thao tác database                                   │
// │                                                                      │
// │ Code trong Blog.js:                                                 │
// │   static async create(data) {                                       │
// │     const docRef = await blogsRef.add({                            │
// │       ...data,                                                      │
// │       created_at: admin.firestore.FieldValue.serverTimestamp()     │
// │     });                                                             │
// │     return new Blog({ id: docRef.id, ...data });                   │
// │   }                                                                 │
// └─────────────────────────────────────────────────────────────────────┘
//                                  ↓
// ┌─────────────────────────────────────────────────────────────────────┐
// │ BƯỚC 5: DATABASE (Firebase Firestore)                              │
// │ Lưu dữ liệu vào collection "blogs"                                 │
// │                                                                      │
// │ Document mới được tạo:                                              │
// │ {                                                                   │
// │   id: "abc123",                                                    │
// │   title: "Học JavaScript từ A-Z",                                  │
// │   content: "Nội dung bài viết...",                                 │
// │   author_id: "user456",                                            │
// │   created_at: Timestamp(2024-01-15)                                │
// │ }                                                                   │
// └─────────────────────────────────────────────────────────────────────┘
//                                  ↓
//               RESPONSE QUAY NGƯỢC LẠI (Database → Model → Controller → Routes → Frontend)
//
// VÍ DỤ 2: LẤY DANH SÁCH BÀI VIẾT (GET)
// Frontend: fetch('/api/blogs?page=1&limit=10&tag=javascript')
//    ↓
// Routes: router.get('/blogs', getBlogPosts)  ← Không cần auth, ai cũng xem được
//    ↓
// Controller (file này): getBlogPosts() gọi Blog.findAll(filters)
//    ↓
// Model: Blog.findAll() query Firestore với filters
//    ↓
// Database: Trả về list documents từ collection "blogs"
//
// VÍ DỤ 3: XEM CHI TIẾT 1 BÀI VIẾT (GET)
// Frontend: Khi user click vào 1 blog card
//   → fetch('/api/blogs/hoc-javascript-tu-a-z')  ← slug của blog
//    ↓
// Routes: router.get('/blogs/:slug', getBlogPostBySlug)
//    ↓
// Controller (file này - dòng 108):
//   - Gọi Blog.findBySlug(slug) để tìm blog
//   - Gọi Blog.incrementViewCount(id) để tăng lượt xem
//    ↓
// Model: Blog.findBySlug() query Firestore WHERE slug = 'hoc-javascript-tu-a-z'
//
// ============================================================================
// KHÁI NIỆM: CONTROLLER LÀ GÌ?
// ============================================================================
// CONTROLLER = "Người điều khiển" - tầng xử lý logic nghiệp vụ
//
// Trong mô hình MVC (Model-View-Controller):
// - MODEL (models/Blog.js): Làm việc với database
// - VIEW (views/pages/blog.ejs): Hiển thị giao diện cho user
// - CONTROLLER (file NÀY): Xử lý logic, kết nối Model và View
//
// Controller KHÔNG:
// ❌ Làm việc trực tiếp với database (việc của Model)
// ❌ Render HTML (việc của View/Route)
// ❌ Định nghĩa routes (việc của Routes file)
//
// Controller CHỈ:
// ✅ Nhận request từ Routes
// ✅ Validate dữ liệu (kiểm tra có hợp lệ không?)
// ✅ Kiểm tra quyền (user có được phép làm việc này không?)
// ✅ Gọi Model để thao tác database
// ✅ Trả response về cho client
//
// Giống như: Nhân viên nhà hàng (Controller) nhận order từ khách (Request),
// kiểm tra menu có món đó không (Validate), gọi bếp nấu (Model),
// rồi mang đồ ăn ra cho khách (Response)

// ============================================================================
// GIẢI THÍCH CODE TỪNG DÒNG
// ============================================================================

// DÒNG 1: Import Blog Model
const Blog = require('../models/Blog');
// - `const` = khai báo biến không thay đổi được
// - `Blog` = tên biến chứa Blog Model
// - `require()` = function để import module (file khác) trong Node.js
// - `'../models/Blog'` = đường dẫn tới file Blog.js
//   + `..` = lùi về thư mục cha (từ controllers/ lên like/server/)
//   + `/models/Blog` = vào thư mục models, lấy file Blog.js
// - Sau dòng này, ta có thể gọi: Blog.create(), Blog.findAll(), Blog.delete(), v.v.

// ============================================================================
// FUNCTION 1: TẠO BÀI VIẾT MỚI (CREATE BLOG POST)
// ============================================================================
// Tạo blog post mới (chỉ admin/teacher) (Create in Controller)
const createBlogPost = async (req, res) => {
// - `const createBlogPost` = khai báo biến hàm tên createBlogPost
// - `async` = từ khóa đánh dấu đây là ASYNC FUNCTION (hàm bất đồng bộ)
//   + Cho phép dùng `await` bên trong
//   + Tự động return Promise
// - `(req, res)` = 2 tham số:
//   + `req` (request) = object chứa thông tin từ client gửi lên (body, headers, params, query)
//   + `res` (response) = object để gửi phản hồi về client
// - `=>` = arrow function (cách viết ngắn gọn của function)

    try {
    // - `try` = bắt đầu khối code có thể gây lỗi
    // - Nếu có lỗi xảy ra, nhảy xuống khối `catch` để xử lý

        const { title, content, excerpt, featured_image, featuredImage, tags, status = 'draft' } = req.body;
        // - `const { ... }` = DESTRUCTURING - giải nén object để lấy các thuộc tính
        // - `req.body` = dữ liệu JSON mà client gửi lên trong body của request
        //   + Ví dụ: { title: 'Học JS', content: '...', tags: ['js', 'tutorial'] }
        // - `title, content, excerpt` = các thuộc tính được extract ra thành biến riêng
        // - `featured_image, featuredImage` = lấy cả 2 (support cả snake_case và camelCase)
        // - `tags` = array các tag
        // - `status = 'draft'` = default value, nếu không có thì mặc định là 'draft'
        //   + Ví dụ: nếu req.body không có status → status = 'draft'
        //   + Nếu req.body có status = 'published' → status = 'published'

        const { user } = req; // Từ middleware xác thực
        // - `const { user }` = lấy thuộc tính `user` từ object `req`
        // - `req.user` được thêm vào bởi authMiddleware (file middleware/authMiddleware.js)
        // - Chứa thông tin user đang đăng nhập: { id, email, name, role }
        // - Nếu không có token hoặc token không hợp lệ, authMiddleware đã chặn request rồi

        console.log('Create blog post request:', { title, hasContent: !!content, user: user?.email });
        // - `console.log()` = in thông tin ra console (terminal) để debug
        // - `'Create blog post request:'` = message text
        // - `{ title, hasContent: !!content, user: user?.email }` = object chứa thông tin debug:
        //   + `title` = giá trị của biến title (shorthand property)
        //   + `hasContent: !!content` = convert content thành boolean
        //     * `!content` = phủ định (nếu content rỗng → true, nếu có → false)
        //     * `!!content` = phủ định 2 lần → kiểm tra có giá trị không (true/false)
        //     * Ví dụ: !!'' = false, !!'text' = true
        //   + `user?.email` = OPTIONAL CHAINING - lấy email nếu user tồn tại
        //     * Nếu user = null/undefined → trả về undefined (không lỗi)
        //     * Nếu user tồn tại → trả về user.email

        // Kiểm tra quyền (chỉ admin hoặc teacher)
        if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
        // - `if` = câu lệnh điều kiện
        // - `!user` = phủ định user (kiểm tra user có null/undefined không?)
        // - `||` = toán tử OR (hoặc) - nếu 1 trong 2 điều kiện đúng → true
        // - `(user.role !== 'admin' && user.role !== 'teacher')` = kiểm tra role
        //   + `!==` = không bằng (so sánh chặt chẽ)
        //   + `&&` = toán tử AND (và) - cả 2 phải đúng
        //   + Nghĩa là: user.role không phải admin VÀ không phải teacher
        // - Tổng kết: Nếu không có user HOẶC (role không phải admin VÀ không phải teacher)
        //   → user không có quyền

            console.error('Access denied:', { user: user?.email, role: user?.role });
            // - `console.error()` = in lỗi ra console (màu đỏ trong terminal)
            // - Log thông tin user bị từ chối để debug

            return res.status(403).json({
            // - `return` = dừng function ngay lập tức, không chạy code phía dưới
            // - `res.status(403)` = set HTTP status code = 403 (Forbidden - Bị cấm)
            //   + 200 = OK, 201 = Created, 400 = Bad Request
            //   + 401 = Unauthorized, 403 = Forbidden, 404 = Not Found, 500 = Server Error
            // - `.json()` = gửi response dạng JSON về client
            // - `{...}` = object chứa data response

                success: false,
                // - `success: false` = đánh dấu request thất bại
                error: 'Access denied. Only admins and teachers can create blog posts.'
                // - `error` = message lỗi gửi về client
            });
        }

        // Validate required fields
        if (!title || !content) {
        // - Kiểm tra xem title và content có giá trị không?
        // - `!title` = title rỗng/null/undefined
        // - `||` = OR - nếu 1 trong 2 rỗng → true
        // - Tức là: nếu thiếu title HOẶC thiếu content → báo lỗi

            console.error('Missing required fields:', { hasTitle: !!title, hasContent: !!content });
            return res.status(400).json({
            // - `400` = Bad Request (Request không hợp lệ - thiếu dữ liệu)
                success: false,
                error: 'Title and content are required.'
            });
        }

        const blogData = {
        // - Tạo object chứa dữ liệu blog sẽ lưu vào database
        // - Lưu cả snake_case VÀ camelCase để tương thích với code cũ
            title,
            // - `title` = shorthand property, tương đương `title: title`
            content,
            excerpt,
            featured_image: featured_image || featuredImage,
            // - `featured_image || featuredImage` = toán tử OR
            // - Nếu featured_image có giá trị → dùng featured_image
            // - Nếu featured_image rỗng/null/undefined → dùng featuredImage
            // - Đảm bảo luôn có giá trị nếu 1 trong 2 được cung cấp
            featuredImage: featuredImage || featured_image,
            // - Làm ngược lại - lưu cả 2 format
            tags: tags || [],
            // - Nếu tags có giá trị → dùng tags
            // - Nếu tags null/undefined → dùng array rỗng []
            status,
            author_id: user.id,
            // - Lưu ID của user đang tạo blog (từ req.user)
            authorId: user.id,
            author_name: user.name,
            authorName: user.name
        };

        const newBlog = await Blog.create(blogData);
        // - `await` = đợi Promise hoàn thành rồi mới chạy tiếp
        // - `Blog.create()` = gọi static method create() trong Blog Model (file models/Blog.js)
        //   + ĐÂY LÀ NƠI CONTROLLER GỌI MODEL! ⭐
        // - Blog Model sẽ lưu dữ liệu vào Firestore collection "blogs"
        // - `newBlog` = object Blog được trả về, chứa data vừa tạo + id từ database

        res.status(201).json({
        // - `201` = Created (Resource được tạo thành công)
        // - Gửi response JSON về client
            success: true,
            message: 'Blog post created successfully',
            data: newBlog.toJSON()
            // - `newBlog.toJSON()` = gọi instance method toJSON() để convert Blog object → plain object
            // - Plain object dễ serialize thành JSON để gửi về client
        });

    } catch (error) {
    // - `catch (error)` = bắt lỗi nếu có lỗi xảy ra trong khối `try`
    // - `error` = object chứa thông tin lỗi

        console.error('Error creating blog post:', error);
        // - Log lỗi ra console để debug
        res.status(500).json({ success: false, error: 'Failed to create blog post' });
        // - `500` = Internal Server Error (Lỗi server)
        // - Gửi thông báo lỗi về client
    }
};

// ============================================================================
// FUNCTION 2: LẤY DANH SÁCH BÀI VIẾT (GET ALL BLOG POSTS)
// ============================================================================
// Lấy tất cả blog posts (public với pagination)
const getBlogPosts = async (req, res) => {
// - Function này PUBLIC - không cần đăng nhập, ai cũng xem được
// - Có PAGINATION (phân trang) - không load hết 1 lúc, chia thành nhiều trang
// - Có FILTER (lọc) - lọc theo status, tag, author, search keyword

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
        // - `req.query` = object chứa query parameters từ URL
        //   + Ví dụ URL: /api/blogs?page=2&limit=10&tag=javascript&search=react
        //   + req.query = { page: '2', limit: '10', tag: 'javascript', search: 'react' }
        // - `page = 1` = default value, nếu không có page trong URL → page = 1
        // - `limit = 10` = mặc định hiển thị 10 bài/trang
        // - Các params khác: status (draft/published), tag, author_id, search (keyword)

        const filters = {
            page: parseInt(page),
            // - `parseInt()` = convert string → number
            // - Vì req.query luôn trả về string, phải convert thành số
            // - Ví dụ: parseInt('2') = 2
            limit: parseInt(limit),
            status,
            tag,
            author_id: author_id || authorId,
            // - Hỗ trợ cả 2 format: author_id và authorId
            search
        };

        const blogs = await Blog.findAll(filters);
        // - `Blog.findAll(filters)` = gọi static method findAll() trong Blog Model
        //   + ĐÂY LÀ NƠI CONTROLLER GỌI MODEL! ⭐
        // - Model sẽ query Firestore với các điều kiện filter
        // - Trả về array các Blog objects

        const totalPosts = await Blog.count({ status, tag, author_id: author_id || authorId, search });
        // - `Blog.count()` = gọi Model để đếm tổng số bài viết (không phụ thuộc page/limit)
        // - Cần tổng số để tính totalPages
        const totalPages = Math.ceil(totalPosts / parseInt(limit));
        // - `Math.ceil()` = làm tròn LÊN (ceiling)
        // - Ví dụ: Math.ceil(23 / 10) = Math.ceil(2.3) = 3 (cần 3 trang cho 23 bài viết)
        // - Math.ceil(20 / 10) = 2 (đúng 2 trang)

        res.json({
        // - `res.json()` = gửi response dạng JSON (không cần .status() → mặc định 200 OK)
            success: true,
            data: {
                posts: blogs.map(b => b.toJSON()),
                // - `blogs.map()` = METHOD CỦA ARRAY - duyệt qua từng phần tử, transform
                // - `b => b.toJSON()` = arrow function nhận blog object `b`, gọi b.toJSON()
                // - Kết quả: array các plain objects thay vì array các Blog class instances
                pagination: {
                    current_page: parseInt(page),
                    total_pages: totalPages,
                    total_posts: totalPosts,
                    has_next: parseInt(page) < totalPages,
                    // - `parseInt(page) < totalPages` = boolean, có trang tiếp không?
                    // - Ví dụ: page=2, totalPages=5 → has_next = true (còn trang 3,4,5)
                    has_prev: parseInt(page) > 1
                    // - Có trang trước không? (page > 1 nghĩa là không phải trang đầu)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch blog posts' });
    }
};

// ============================================================================
// FUNCTION 3: LẤY 1 BÀI VIẾT CỤ THỂ (GET ONE BLOG POST BY SLUG/ID)
// ============================================================================
// Lấy một blog post theo ID hoặc slug
const getBlogPostBySlug = async (req, res) => {
// - Function này được gọi khi user click vào 1 bài viết để đọc chi tiết
// - Tìm theo SLUG (URL-friendly string, vd: "hoc-javascript-tu-a-z")
// - Nếu không tìm được bằng slug, thử tìm bằng ID
// - TỰ ĐỘNG TĂNG VIEW COUNT (lượt xem) mỗi khi có người xem

    try {
        const { slug } = req.params;
        // - `req.params` = object chứa URL parameters (dynamic parts trong route)
        // - Ví dụ route: /api/blogs/:slug
        //   + URL thực tế: /api/blogs/hoc-javascript-tu-a-z
        //   + req.params = { slug: 'hoc-javascript-tu-a-z' }
        let blog;
        // - `let` = khai báo biến CÓ THỂ THAY ĐỔI (khác với const)
        // - Dùng let vì blog sẽ được gán giá trị nhiều lần

        // Try finding by slug first
        blog = await Blog.findBySlug(slug);
        // - `Blog.findBySlug()` = gọi Model method để tìm theo slug
        //   + GỌI MODEL! ⭐

        // If not found by slug, try by ID
        if (!blog) {
        // - Nếu không tìm được (blog = null/undefined)
            blog = await Blog.findById(slug);
            // - Thử tìm bằng ID (vì có thể người dùng truyền ID thay vì slug)
            // - GỌI MODEL LẦN 2! ⭐
        }

        if (!blog) {
        // - Nếu vẫn không tìm được → bài viết không tồn tại
            return res.status(404).json({ success: false, error: 'Blog post not found' });
            // - `404` = Not Found (Không tìm thấy resource)
        }

        // Increment view count
        await Blog.incrementViewCount(blog.id);
        // - `Blog.incrementViewCount()` = tăng view_count lên 1
        //   + GỌI MODEL LẦN 3! ⭐
        // - Mỗi lần ai đó xem bài viết → +1 view

        // Re-fetch to get updated view count
        const updatedBlog = await Blog.findById(blog.id);
        // - Fetch lại blog sau khi tăng view count để có dữ liệu mới nhất
        // - GỌI MODEL LẦN 4! ⭐

        // Return unwrapped data for consistency with course API
        res.json(updatedBlog.toJSON());
        // - Không wrap trong { success, data } như các API khác
        // - Trả trực tiếp blog object để nhất quán với course API
    } catch (error) {
        console.error('Error fetching blog post:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch blog post' });
    }
};

// ============================================================================
// FUNCTION 4: CẬP NHẬT BÀI VIẾT (UPDATE BLOG POST)
// ============================================================================
// Cập nhật blog post (chỉ admin/teacher và author)
const updateBlogPost = async (req, res) => {
// - Chỉ admin, teacher, hoặc CHÍNH TÁC GIẢ mới được sửa
// - Teacher chỉ được sửa bài của chính mình (trừ khi là admin)

    try {
        const { id } = req.params;
        // - `id` = ID của blog post cần update (từ URL: /api/blogs/:id)
        const { user } = req;
        // - Lấy thông tin user từ authMiddleware
        const updateData = req.body;
        // - `updateData` = object chứa các fields cần update (title, content, tags, ...)

        // Kiểm tra quyền
        if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
        // - Chỉ admin và teacher được phép update
            return res.status(403).json({
                success: false,
                error: 'Access denied. Only admins and teachers can update blog posts.'
            });
        }

        // Lấy blog post hiện tại
        const currentPost = await Blog.findById(id);
        // - GỌI MODEL để lấy blog hiện tại! ⭐
        // - Cần lấy để kiểm tra author_id
        if (!currentPost) {
            return res.status(404).json({ success: false, error: 'Blog post not found' });
        }

        // Kiểm tra nếu user không phải admin thì chỉ được sửa post của mình
        if (user.role !== 'admin' && currentPost.author_id !== user.id) {
        // - Admin được sửa bất kỳ bài nào
        // - Teacher chỉ được sửa bài của chính mình
        // - `currentPost.author_id !== user.id` = kiểm tra xem có phải tác giả không
            return res.status(403).json({
                success: false,
                error: 'You can only edit your own posts.'
            });
        }

        const updatedBlog = await Blog.update(id, updateData);
        // - `Blog.update()` = gọi Model để update blog trong database
        //   + GỌI MODEL! ⭐
        // - Trả về Blog object đã được update

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

// ============================================================================
// FUNCTION 5: XÓA BÀI VIẾT (DELETE BLOG POST)
// ============================================================================
// Xóa blog post (chỉ admin/teacher và author) (Delete trong Controller)
const deleteBlogPost = async (req, res) => {
// - Logic tương tự updateBlogPost: chỉ admin và tác giả được xóa

    try {
        const { id } = req.params;
        // - ID của blog post cần xóa
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
        // - GỌI MODEL! ⭐ - Cần lấy để kiểm tra author_id
        if (!currentPost) {
            return res.status(404).json({ success: false, error: 'Blog post not found' });
        }

        // Kiểm tra nếu user không phải admin thì chỉ được xóa post của mình
        if (user.role !== 'admin' && currentPost.author_id !== user.id) {
        // - Admin xóa được mọi bài
        // - Teacher chỉ xóa được bài của mình
            return res.status(403).json({
                success: false,
                error: 'You can only delete your own posts.'
            });
        }

        await Blog.delete(id);
        // - `Blog.delete(id)` = gọi Model để XÓA blog trong database
        //   + GỌI MODEL! ⭐
        // - Xóa vĩnh viễn khỏi Firestore

        res.json({
            success: true,
            message: 'Blog post deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting blog post:', error);
        res.status(500).json({ success: false, error: 'Failed to delete blog post' });
    }
};

// ============================================================================
// FUNCTION 6: LẤY DANH SÁCH TAGS (GET ALL BLOG TAGS)
// ============================================================================
// Lấy các tags phổ biến (checkpoint)
const getBlogTags = async (req, res) => {
// - Trả về list tất cả các tags đang được sử dụng trong blogs
// - Dùng để hiển thị filter tags, autocomplete, v.v.

    try {
        const tags = await Blog.getAllTags();
        // - `Blog.getAllTags()` = gọi Model để lấy tất cả tags
        //   + GỌI MODEL! ⭐
        // - Trả về array các tags: ['javascript', 'react', 'nodejs', ...]

        res.json({
            success: true,
            data: tags
        });
    } catch (error) {
        console.error('Error fetching blog tags:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch blog tags' });
    }
};

// ============================================================================
// EXPORT CÁC FUNCTIONS
// ============================================================================
module.exports = {
// - `module.exports` = object chứa những gì file này export ra ngoài
// - Các file khác có thể import: const { createBlogPost } = require('./blogController')
    createBlogPost,
    // - Shorthand property: tương đương `createBlogPost: createBlogPost`
    getBlogPosts,
    getBlogPostBySlug,
    updateBlogPost,
    deleteBlogPost,
    getBlogTags
};

// ============================================================================
// TÓM TẮT FILE NÀY
// ============================================================================
// File blogController.js chứa 6 functions xử lý BLOG POSTS:
//
// 1. createBlogPost (POST /api/blogs)
//    - Tạo blog mới
//    - Chỉ admin/teacher
//    - Validate title, content
//    - Gọi Blog.create()
//
// 2. getBlogPosts (GET /api/blogs)
//    - Lấy danh sách blogs
//    - Có pagination (page, limit)
//    - Có filters (status, tag, author, search)
//    - Public (không cần auth)
//    - Gọi Blog.findAll() và Blog.count()
//
// 3. getBlogPostBySlug (GET /api/blogs/:slug)
//    - Lấy 1 blog cụ thể
//    - Tìm theo slug hoặc ID
//    - Tự động tăng view count
//    - Gọi Blog.findBySlug(), Blog.findById(), Blog.incrementViewCount()
//
// 4. updateBlogPost (PUT /api/blogs/:id)
//    - Cập nhật blog
//    - Chỉ admin/teacher và tác giả
//    - Teacher chỉ sửa được bài của mình
//    - Gọi Blog.findById() và Blog.update()
//
// 5. deleteBlogPost (DELETE /api/blogs/:id)
//    - Xóa blog
//    - Chỉ admin/teacher và tác giả
//    - Teacher chỉ xóa được bài của mình
//    - Gọi Blog.findById() và Blog.delete()
//
// 6. getBlogTags (GET /api/blogs/tags)
//    - Lấy tất cả tags
//    - Public
//    - Gọi Blog.getAllTags()

// ============================================================================
// TỪ KHÓA JAVASCRIPT TRONG FILE NÀY
// ============================================================================
// - `const` = khai báo biến không đổi
// - `let` = khai báo biến có thể đổi
// - `require()` = import module
// - `module.exports` = export ra ngoài
// - `async` = hàm bất đồng bộ
// - `await` = đợi Promise hoàn thành
// - `=>` = arrow function
// - `try...catch` = bắt lỗi
// - `if` = câu lệnh điều kiện
// - `return` = trả về và dừng function
// - `{ }` = destructuring object hoặc tạo object
// - `||` = toán tử OR (hoặc)
// - `&&` = toán tử AND (và)
// - `!` = toán tử NOT (phủ định)
// - `!==` = không bằng (so sánh chặt chẽ)
// - `<` và `>` = so sánh nhỏ hơn, lớn hơn
// - `?.` = optional chaining
// - `!!` = convert sang boolean
// - `.map()` = method của array, duyệt và transform
// - `.json()` = gửi response dạng JSON
// - `.status()` = set HTTP status code
// - `parseInt()` = convert string → number
// - `Math.ceil()` = làm tròn lên
// - `console.log()` = in ra console
// - `console.error()` = in lỗi ra console