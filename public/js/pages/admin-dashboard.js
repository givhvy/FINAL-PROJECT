/**
 * Admin Dashboard JavaScript
 * Handles user management, course management, blog management, and system administration
 */

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || !user || (user.role !== 'teacher' && user.role !== 'admin')) {
        window.location.href = '/login';
        return;
    }

    // Global data stores
    let allCourses = [];
    let allUsers = [];

    // Set user info in header
    const adminNameElement = document.getElementById('admin-user-name');
    const adminEmailElement = document.getElementById('admin-user-email');
    const adminAvatarDiv = document.getElementById('admin-avatar');
    
    if (adminNameElement) adminNameElement.textContent = user.name;
    if (adminEmailElement) adminEmailElement.textContent = user.email;
    
    // Set avatar - use uploaded avatar or create initials avatar
    if (adminAvatarDiv) {
        if (user.avatarUrl) {
            adminAvatarDiv.innerHTML = `<img src="${user.avatarUrl}" alt="Avatar" class="w-full h-full rounded-full object-cover">`;
        } else {
            // Create default avatar with initials
            adminAvatarDiv.textContent = getUserInitials(user.name);
        }
    }

    function getUserInitials(name) {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    // === MERGED FROM FILE 1: VARIABLES FOR SUBSCRIPTION MODAL ===
    const subscriptionModal = document.getElementById('subscription-modal');
    const subscriptionForm = document.getElementById('subscription-form');
    const subscriptionModalTitle = document.getElementById('subscription-modal-title');
    let currentEditingPlanId = null;

    // --- MERGED & REFINED UTILITY FUNCTIONS ---
    function showPage(targetId) {
        document.querySelectorAll('.page-content').forEach(page => page.classList.add('hidden'));
        const targetElement = document.getElementById(targetId);
        if (targetElement) targetElement.classList.remove('hidden');

        document.getElementById('pageTitle').textContent = targetId.charAt(0).toUpperCase() + targetId.slice(1);

        document.querySelectorAll('.sidebar-item').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.target === targetId) link.classList.add('active');
        });
        // Call appropriate render function for the page
        if (targetId === 'courses') {
            renderCourseManagementPage();
        } else if (targetId === 'users') {
        renderUsersPage();
    } else if (targetId === 'subscriptions') {
    renderSubscriptionManagementPage();
    } else if (targetId === 'orders') {
    loadOrders();
    } else if (targetId === 'certificates') {
    populateCertificateForm();
    } else if (targetId === 'blog') {
    fetchAndRenderBlogPosts();
    }
    }

    async function fetchAllData() {
        try {
            const [usersRes, coursesRes] = await Promise.all([
            fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            if (!usersRes.ok || !coursesRes.ok) throw new Error("Failed to fetch core data.");
            allUsers = await usersRes.json();
            allCourses = await coursesRes.json();

            // Update dashboard statistics with real data
            updateDashboardStats();
        } catch (error) {
        console.error('Core Data Fetch Error:', error);
        notify.error('Error loading essential data: ' + error.message);
    }
    }

    // Update dashboard statistics with real Firebase data
    function updateDashboardStats() {
        // Calculate total students (users with role 'student')
        const totalStudents = allUsers.filter(user => user.role === 'student').length;
        document.getElementById('total-students').textContent = totalStudents.toLocaleString();

        // Calculate total courses (all courses on platform)
        const totalCourses = allCourses.length;
        document.getElementById('total-courses').textContent = totalCourses;

        // Calculate total enrollments across all courses
        const totalEnrollments = allCourses.reduce((sum, course) => sum + (course.enrolledStudents || 0), 0);
        document.getElementById('total-enrollments').textContent = totalEnrollments.toLocaleString();

        // Calculate average rating across all courses
        const coursesWithRating = allCourses.filter(course => course.rating > 0);
        const avgRating = coursesWithRating.length > 0
        ? (coursesWithRating.reduce((sum, course) => sum + course.rating, 0) / coursesWithRating.length).toFixed(1)
        : '0.0';
        document.getElementById('avg-rating').textContent = avgRating;
    }

    // === MERGED FROM FILE 1: COMPLETE SUBSCRIPTION MANAGEMENT LOGIC ===
    // Make globally accessible for onclick handler
    window.renderSubscriptionManagementPage = async function() {
        const container = document.getElementById('subscriptions-container');
        container.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <div class="text-center py-8">
        <i class="fas fa-spinner fa-spin text-3xl mb-3 text-blue-500"></i>
        <p class="text-gray-500">Loading subscription plans...</p>
        </div>
        </div>
        `;
        try {
            const response = await fetch('/api/subscriptions', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Failed to fetch plans');
            let plans = await response.json();

            // Ensure plans is an array
            if (!Array.isArray(plans)) {
                console.error('Plans is not an array:', plans);
                plans = [];
            }

            let plansHTML = plans.map((plan, index) => `
            <div class="flex items-center justify-between p-5 ${index !== plans.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div class="flex items-center gap-4">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white">
            <i class="fas fa-crown"></i>
            </div>
            <div>
            <p class="font-semibold text-gray-800 dark:text-gray-200">${plan.name}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">$${plan.monthlyPrice}/month | $${plan.annualPrice}/year</p>
            </div>
            </div>
            <div class="flex items-center gap-2">
            <button data-plan-id="${plan.id}" class="edit-plan-btn px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
            <i class="fas fa-edit mr-1"></i> Edit
            </button>
            <button data-plan-id="${plan.id}" class="delete-plan-btn px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
            <i class="fas fa-trash mr-1"></i> Delete
            </button>
            </div>
            </div>
            `).join('');

            container.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <!-- Header -->
            <div class="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">All Plans</h3>
            <button id="add-plan-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center text-sm font-medium transition-colors">
            <i class="fas fa-plus mr-2"></i> Add New Plan
            </button>
            </div>
            <!-- Plans List -->
            <div>
            ${plans.length > 0 ? plansHTML : `
                <div class="text-center py-12 text-gray-500 dark:text-gray-400">
                <i class="fas fa-credit-card text-4xl mb-3 text-gray-300"></i>
                <p>No subscription plans created yet.</p>
                <p class="text-sm mt-1">Click "Add New Plan" to create one.</p>
                </div>
                `}
            </div>
            </div>
            `;

            document.getElementById('add-plan-btn').addEventListener('click', () => openSubscriptionModal());
            container.querySelectorAll('.edit-plan-btn').forEach(btn => btn.addEventListener('click', (e) => openSubscriptionModal(e.target.dataset.planId)));
            container.querySelectorAll('.delete-plan-btn').forEach(btn => btn.addEventListener('click', handleDeletePlan));
        } catch (error) {
        container.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <div class="text-center py-8 text-red-500">
        <i class="fas fa-exclamation-triangle text-3xl mb-3"></i>
        <p>${error.message}</p>
        </div>
        </div>
        `;
    }
    }

    // --- ORDER MANAGEMENT FUNCTIONS ---
    let allOrders = [];
    let filteredOrders = [];

    async function loadOrders() {
        try {
            const response = await fetch('/api/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch orders');

            allOrders = await response.json();

            // Ensure allOrders is an array
            if (!Array.isArray(allOrders)) {
                console.error('Orders is not an array:', allOrders);
                allOrders = [];
            }

            filteredOrders = [...allOrders];

            // Sort by creation date (newest first)
            filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            updateOrderStatistics();
            displayOrders();
        } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('ordersTableBody').innerHTML = `
        <tr>
        <td colspan="7" class="px-6 py-12 text-center text-red-500">
        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
        <p>Error loading orders: ${error.message}</p>
        </td>
        </tr>
        `;
    }
    }

    function updateOrderStatistics() {
        const totalOrders = allOrders.length;
        const completedOrders = allOrders.filter(order => order.status === 'completed').length;
        const pendingOrders = allOrders.filter(order => order.status === 'pending').length;
        const totalRevenue = allOrders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + (parseFloat(order.price) || 0), 0);

        document.getElementById('totalOrdersCount').textContent = totalOrders;
        document.getElementById('completedOrdersCount').textContent = completedOrders;
        document.getElementById('pendingOrdersCount').textContent = pendingOrders;
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    }

    function displayOrders() {
        const tbody = document.getElementById('ordersTableBody');

        if (filteredOrders.length === 0) {
            tbody.innerHTML = `
            <tr>
            <td colspan="7" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            <i class="fas fa-inbox text-4xl mb-2"></i>
            <p>No orders found</p>
            </td>
            </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredOrders.map(order => {
            const statusColors = {
                'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
                'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                'refunded': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            };

            const statusColor = statusColors[order.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            const userName = order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || order.user.email || 'Unknown User' : 'Unknown User';
            const courseName = order.course ? order.course.title || order.courseName || 'Unknown Course' : order.courseName || 'Unknown Course';
            const orderDate = new Date(order.createdAt).toLocaleDateString();

            return `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
            ${order.id.substring(0, 8)}...
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
            <div class="flex flex-col">
            <span class="font-medium">${userName}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">${order.user?.email || ''}</span>
            </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
            ${courseName}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
            $${parseFloat(order.price || 0).toFixed(2)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}">
            ${order.status}
            </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
            ${orderDate}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
            <div class="flex gap-2 justify-end">
            <button onclick="updateOrderStatus('${order.id}')" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="Update Status">
            <i class="fas fa-edit"></i>
            </button>
            <button onclick="viewOrderDetails('${order.id}')" class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300" title="View Details">
            <i class="fas fa-eye"></i>
            </button>
            </div>
            </td>
            </tr>
            `;
        }).join('');
    }

    function filterOrders() {
        const statusFilter = document.getElementById('orderStatusFilter').value;
        const searchInput = document.getElementById('orderSearchInput').value.toLowerCase();

        filteredOrders = allOrders.filter(order => {
            const statusMatch = !statusFilter || order.status === statusFilter;

            const userName = order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''} ${order.user.email || ''}`.toLowerCase() : '';
            const courseName = (order.course?.title || order.courseName || '').toLowerCase();
            const orderId = order.id.toLowerCase();

            const searchMatch = !searchInput ||
            userName.includes(searchInput) ||
            courseName.includes(searchInput) ||
            orderId.includes(searchInput);

            return statusMatch && searchMatch;
        });

        displayOrders();
    }

    function refreshOrders() {
        loadOrders();
    }

    async function updateOrderStatus(orderId) {
        const order = allOrders.find(o => o.id === orderId);
        if (!order) return;

        const newStatus = prompt(`Update order status for ${orderId}\n\nCurrent status: ${order.status}\n\nEnter new status (pending, completed, cancelled, refunded):`, order.status);

        if (!newStatus || newStatus === order.status) return;

        const validStatuses = ['pending', 'completed', 'cancelled', 'refunded'];
        if (!validStatuses.includes(newStatus.toLowerCase())) {
            notify.warning('Invalid status. Please use: pending, completed, cancelled, or refunded');
            return;
        }

        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus.toLowerCase() })
            });

            if (!response.ok) throw new Error('Failed to update order status');

            notify.success('Order status updated successfully!');
            loadOrders();
        } catch (error) {
        console.error('Error updating order status:', error);
        notify.error('Error updating order status: ' + error.message);
    }
    }

    async function viewOrderDetails(orderId) {
        const order = allOrders.find(o => o.id === orderId);
        if (!order) return;

        const userName = order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || order.user.email : 'Unknown User';
        const userEmail = order.user?.email || 'N/A';
        const courseName = order.course?.title || order.courseName || 'Unknown Course';
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const updatedDate = new Date(order.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        const details = `
        Order Details:
        ????????????????????????????????

        Order ID: ${order.id}
        Status: ${order.status.toUpperCase()}

        User Information:
        Name: ${userName}
        Email: ${userEmail}

        Course Information:
        Course: ${courseName}

        Payment Information:
        Amount: $${parseFloat(order.price || 0).toFixed(2)}
        Payment Method: ${order.paymentMethod || 'N/A'}
        Payment ID: ${order.paymentId || 'N/A'}

        Dates:
        Created: ${orderDate}
        Updated: ${updatedDate}
        `;

        alert(details);
    }

    // --- COURSE MANAGEMENT FUNCTIONS ---
    let filteredCourses = [];
    let expandedCourses = new Set();

    function renderCourseManagementPage() {
        filteredCourses = [...allCourses];
        displayCoursesTable(filteredCourses);
        setupCourseFilters();
    }

    function setupCourseFilters() {
        const statusFilter = document.getElementById('course-status-filter');
        const courseSearch = document.getElementById('course-search');

        if (statusFilter) {
            statusFilter.removeEventListener('change', filterCourses);
            statusFilter.addEventListener('change', filterCourses);
        }

        if (courseSearch) {
            courseSearch.removeEventListener('input', filterCourses);
            courseSearch.addEventListener('input', filterCourses);
        }
    }

    function filterCourses() {
        const statusFilter = document.getElementById('course-status-filter')?.value || '';
        const searchTerm = document.getElementById('course-search')?.value.toLowerCase() || '';

        filteredCourses = allCourses.filter(course => {
            const matchesStatus = !statusFilter || (course.status || 'draft') === statusFilter;
            const matchesSearch = !searchTerm ||
            (course.title && course.title.toLowerCase().includes(searchTerm)) ||
            (course.description && course.description.toLowerCase().includes(searchTerm)) ||
            (course.instructor && course.instructor.toLowerCase().includes(searchTerm));
            return matchesStatus && matchesSearch;
        });

        displayCoursesTable(filteredCourses);
    }

    function displayCoursesTable(courses) {
        const tableBody = document.getElementById('courses-table-body');
        if (!tableBody) return;

        if (courses.length === 0) {
            tableBody.innerHTML = `
            <tr>
            <td colspan="6" class="text-center py-8 text-gray-500 dark:text-gray-400">
            <i class="fas fa-book text-4xl mb-4"></i>
            <p>No courses found.</p>
            </td>
            </tr>
            `;
            return;
        }

        tableBody.innerHTML = courses.map(course => {
            const isExpanded = expandedCourses.has(course.id);
            const createdDate = course.createdAt ? new Date(course.createdAt).toLocaleDateString('en-US') : 'N/A';

            return `
            <tr class="text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors course-row" data-course-id="${course.id}">
            <td class="px-5 py-4">
            <button onclick="toggleCourseDetails('${course.id}')" class="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <i class="fas fa-chevron-${isExpanded ? 'down' : 'right'} text-blue-500 text-xs"></i>
            </button>
            </td>
            <td class="px-5 py-4">
            <div class="font-medium text-gray-800 dark:text-gray-200">${course.title}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${(course.description || '').substring(0, 50)}${course.description?.length > 50 ? '...' : ''}</div>
            </td>
            <td class="px-5 py-4">
            <span class="text-gray-600 dark:text-gray-300">${course.instructor || course.teacher?.name || 'N/A'}</span>
            </td>
            <td class="px-5 py-4">
            <span class="inline-flex items-center px-2.5 py-1 text-xs rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
            <span class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
            Active
            </span>
            </td>
            <td class="px-5 py-4 text-gray-600 dark:text-gray-400">${createdDate}</td>
            <td class="px-5 py-4 text-right">
            <button onclick="deleteCourse('${course.id}')"
            class="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg transition-colors"
            title="Delete course">
            <i class="fas fa-trash"></i>
            </button>
            </td>
            </tr>
            ${isExpanded ? `
                <tr class="course-details bg-gray-50/50 dark:bg-gray-800/50" data-course-id="${course.id}">
                <td colspan="6" class="px-5 py-4">
                <div class="ml-8 space-y-4">
                <div id="course-lessons-${course.id}" class="course-content-section">
                <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <i class="fas fa-book-open mr-2 text-blue-500"></i>Lessons
                </h4>
                <div class="text-gray-500 dark:text-gray-400 text-sm">Loading lessons...</div>
                </div>
                <div id="course-quizzes-${course.id}" class="course-content-section">
                <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <i class="fas fa-question-circle mr-2 text-purple-500"></i>Quizzes
                </h4>
                <div class="text-gray-500 dark:text-gray-400 text-sm">Loading quizzes...</div>
                </div>
                </div>
                </td>
                </tr>
                ` : ''}
            `;
        }).join('');
    }

    // Toggle course details (lessons and quizzes) - Make global for onclick
    window.toggleCourseDetails = async function(courseId) {
        if (expandedCourses.has(courseId)) {
            expandedCourses.delete(courseId);
        } else {
        expandedCourses.add(courseId);
        // Fetch lessons and quizzes
        await loadCourseContent(courseId);
    }
    displayCoursesTable(filteredCourses);
    }

    // Load lessons and quizzes for a course
    async function loadCourseContent(courseId) {
        try {
            // Fetch lessons
            const lessonsRes = await fetch(`/api/courses/${courseId}/lessons`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const lessons = await lessonsRes.json();

            // Fetch quizzes
            const quizzesRes = await fetch(`/api/courses/${courseId}/quizzes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const quizzes = await quizzesRes.json();

            // Update the DOM after expanding
            setTimeout(() => {
                const lessonsContainer = document.getElementById(`course-lessons-${courseId}`);
                if (lessonsContainer) {
                    if (lessons.length > 0) {
                        lessonsContainer.innerHTML = `
                        <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <i class="fas fa-book-open mr-2"></i>Lessons (${lessons.length})
                        </h4>
                        <ul class="space-y-2">
                        ${lessons.map((lesson, idx) => `
                            <li class="flex items-center text-sm">
                            <span class="text-gray-500 dark:text-gray-400 mr-2">${idx + 1}.</span>
                            <span class="text-gray-700 dark:text-gray-300">${lesson.title}</span>
                            <span class="ml-auto text-xs text-gray-500 dark:text-gray-400">${lesson.duration || 'N/A'}</span>
                            </li>
                            `).join('')}
                        </ul>
                        `;
                    } else {
                    lessonsContainer.innerHTML = `
                    <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <i class="fas fa-book-open mr-2"></i>Lessons
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">No lessons added yet.</p>
                    `;
                }
            }

            const quizzesContainer = document.getElementById(`course-quizzes-${courseId}`);
            if (quizzesContainer) {
                if (quizzes.length > 0) {
                    quizzesContainer.innerHTML = `
                    <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <i class="fas fa-question-circle mr-2"></i>Quizzes (${quizzes.length})
                    </h4>
                    <ul class="space-y-2">
                    ${quizzes.map(quiz => `
                        <li class="flex items-center text-sm">
                        <i class="fas fa-check-circle text-green-500 mr-2"></i>
                        <span class="text-gray-700 dark:text-gray-300">${quiz.title}</span>
                        <span class="ml-auto text-xs text-gray-500 dark:text-gray-400">${quiz.questions?.length || 0} questions</span>
                        </li>
                        `).join('')}
                    </ul>
                    `;
                } else {
                quizzesContainer.innerHTML = `
                <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <i class="fas fa-question-circle mr-2"></i>Quizzes
                </h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">No quizzes added yet.</p>
                `;
            }
        }
    }, 100);
    } catch (error) {
    console.error('Error loading course content:', error);
    }
    }

    // Delete course
    // Make deleteCourse available globally for onclick handlers
    window.deleteCourse = async function(courseId) {
        if (!confirm('Are you sure you want to delete this course and all its content? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/courses/${courseId}`, {
                method: 'DELETE', // gửi method http làm DELETE
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete course');
            }

            notify.success('Course deleted successfully!');
            await fetchAllData();
            renderCourseManagementPage();
        } catch (error) {
        console.error('Error deleting course:', error);
        notify.error('Error: ' + error.message);
    }
    }
    async function openSubscriptionModal(planId = null) {
        currentEditingPlanId = planId;
        subscriptionForm.reset();
        if (planId) {
            subscriptionModalTitle.textContent = 'Edit Plan';
            try {
                const response = await fetch('/api/subscriptions', { headers: { 'Authorization': `Bearer ${token}` } });
                const plans = await response.json();
                const plan = plans.find(p => p.id === planId);
                if (plan) {
                    document.getElementById('plan-name').value = plan.name;
                    document.getElementById('plan-monthly-price').value = plan.monthlyPrice;
                    document.getElementById('plan-annual-price').value = plan.annualPrice;
                    document.getElementById('plan-features').value = plan.features.join('\n');
                }
            } catch (error) {
            notify.error('Could not load plan details.');
            return;
        }
    } else {
    subscriptionModalTitle.textContent = 'Add New Plan';
    }
    subscriptionModal.classList.remove('hidden');
    }

    function closeSubscriptionModal() {
        subscriptionModal.classList.add('hidden');
    }

    async function handleSubscriptionFormSubmit(e) {
        e.preventDefault();
        const planData = {
            name: document.getElementById('plan-name').value,
            monthlyPrice: parseFloat(document.getElementById('plan-monthly-price').value),
            annualPrice: parseFloat(document.getElementById('plan-annual-price').value),
            features: document.getElementById('plan-features').value.split('\n').filter(f => f.trim() !== '')
        };
        const method = currentEditingPlanId ? 'PUT' : 'POST';
        const url = currentEditingPlanId ? `/api/subscriptions/${currentEditingPlanId}` : '/api/subscriptions';
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(planData)
            });
            if (!response.ok) throw new Error('Failed to save plan.');
            closeSubscriptionModal();
            renderSubscriptionManagementPage();
    } catch (error) { notify.error(`Error: ${error.message}`); }
    }

    async function handleDeletePlan(e) {
        const planId = e.target.dataset.planId;
        if (confirm('Are you sure you want to delete this plan?')) {
            try {
                const response = await fetch(`/api/subscriptions/${planId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
                if (!response.ok) throw new Error('Failed to delete plan.');
                renderSubscriptionManagementPage();
    } catch (error) { notify.error(`Error: ${error.message}`); }
    }
    }


    // --- BLOG MANAGEMENT FUNCTIONS ---

    // Global blog data
    let allBlogPosts = [];
    let currentEditingBlogId = null;
    let blogEditor = null;

    // Blog modal elements
    const blogModal = document.getElementById('blog-modal');
    const blogForm = document.getElementById('blog-form');
    const blogModalTitle = document.getElementById('blog-modal-title');

    // Initialize Quill editor for blog content
    function initBlogEditor() {
        if (typeof Quill !== 'undefined') {
            const toolbarOptions = [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['blockquote', 'code-block'],
            ['link', 'image', 'video'],
            ['clean']
            ];

            blogEditor = new Quill('#blog-content-editor', {
                theme: 'snow',
                modules: {
                    toolbar: toolbarOptions
                },
                placeholder: 'Write your blog post content here... (You can paste from Google Docs and formatting will be preserved)'
            });
        }
    }

    // Fetch and render blog posts
    async function fetchAndRenderBlogPosts() {
        try {
            const response = await fetch('/api/blog?limit=1000', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch blog posts');

            const data = await response.json();
            console.log('Blog API response:', data);

            // Handle both wrapped and unwrapped response formats
            allBlogPosts = data.data?.posts || data.posts || data || [];

            // Ensure allBlogPosts is an array
            if (!Array.isArray(allBlogPosts)) {
                console.error('Blog posts is not an array:', allBlogPosts);
                allBlogPosts = [];
            }

            displayBlogPosts(allBlogPosts);
        } catch (error) {
        console.error('Error fetching blog posts:', error);
        const tableBody = document.getElementById('blog-posts-table-body');
        if (tableBody) {
            tableBody.innerHTML = `
            <tr>
            <td colspan="6" class="text-center py-8 text-red-500">
            <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
            <p>Failed to load blog posts: ${error.message}</p>
            </td>
            </tr>
            `;
        }
    }
    }

    // Display blog posts in table
    function displayBlogPosts(posts) {
        const tableBody = document.getElementById('blog-posts-table-body');
        if (!tableBody) return;

        if (posts.length === 0) {
            tableBody.innerHTML = `
            <tr>
            <td colspan="6" class="text-center py-8 text-gray-500">
            <i class="fas fa-blog text-4xl mb-4"></i>
            <p>No blog posts found.</p>
            <p>Click "Create New Post" to get started!</p>
            </td>
            </tr>
            `;
            return;
        }

        tableBody.innerHTML = posts.map(post => {
            // Handle both snake_case and camelCase field names
            const createdAt = post.created_at || post.createdAt;
            let createdDate = 'N/A';
            if (createdAt) {
                if (createdAt.toDate) {
                    createdDate = new Date(createdAt.toDate()).toLocaleDateString();
                } else {
                createdDate = new Date(createdAt).toLocaleDateString();
            }
        }

        const statusBadge = post.status === 'published'
        ? '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Published</span>'
        : '<span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Draft</span>';

        return `
        <tr class="text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-700">
        <td class="px-4 py-3">
        <div class="font-medium">${post.title}</div>
        <div class="text-xs text-gray-500">${(post.excerpt || '').substring(0, 60)}${post.excerpt && post.excerpt.length > 60 ? '...' : ''}</div>
        </td>
        <td class="px-4 py-3">${post.author_name || post.authorName || 'Unknown'}</td>
        <td class="px-4 py-3">${statusBadge}</td>
        <td class="px-4 py-3">${post.view_count || post.viewCount || 0}</td>
        <td class="px-4 py-3">${createdDate}</td>
        <td class="px-4 py-3">
        <div class="flex space-x-2">
        <button data-blog-id="${post.id}" data-action="edit" class="blog-action-btn text-blue-600 hover:bg-blue-50 p-1 rounded" title="Edit">
        <i class="fas fa-edit pointer-events-none"></i>
        </button>
        <button data-blog-id="${post.id}" data-action="delete" class="blog-action-btn text-red-600 hover:bg-red-50 p-1 rounded" title="Delete">
        <i class="fas fa-trash pointer-events-none"></i>
        </button>
        ${post.status === 'published' ? `
            <button data-blog-slug="${post.slug || post.id}" data-action="view" class="blog-action-btn text-green-600 hover:bg-green-50 p-1 rounded" title="View">
            <i class="fas fa-eye pointer-events-none"></i>
            </button>
            ` : ''}
        </div>
        </td>
        </tr>
        `;
    }).join('');
    }

    // Open blog modal for create/edit
    function openBlogModal(postId = null) {
        currentEditingBlogId = postId;
        blogForm.reset();

        if (postId) {
            blogModalTitle.textContent = 'Edit Blog Post';
            const post = allBlogPosts.find(p => p.id === postId);
            if (post) {
                document.getElementById('blog-title').value = post.title || '';
                document.getElementById('blog-excerpt').value = post.excerpt || '';

                // Set content to Quill editor
                if (blogEditor) {
                    // Use clipboard to properly parse HTML content
                    const delta = blogEditor.clipboard.convert(post.content || '');
                    blogEditor.setContents(delta, 'silent');
                }

                document.getElementById('blog-featured-image').value = post.featured_image || post.featuredImage || '';
                document.getElementById('blog-status').value = post.status || 'draft';
                document.getElementById('blog-tags').value = (post.tags || []).join(', ');

                // Show image preview if exists
                const imageUrl = post.featured_image || post.featuredImage;
                if (imageUrl) {
                    showBlogImagePreview(imageUrl);
                } else {
                resetBlogImageUpload();
            }
        }
    } else {
    blogModalTitle.textContent = 'Create New Blog Post';
    // Clear editor content for new post
    if (blogEditor) {
        blogEditor.setText('');
    }
    // Reset image upload
    resetBlogImageUpload();
    }

    blogModal.classList.remove('hidden');
    }

    // Close blog modal
    function closeBlogModal() {
        blogModal.classList.add('hidden');
        resetBlogImageUpload();
    }

    // --- BLOG IMAGE UPLOAD FUNCTIONS ---
    let blogUploadedImageUrl = null;

    // Blog image upload elements
    const blogImageDropzone = document.getElementById('blog-image-dropzone');
    const blogImageFileInput = document.getElementById('blog-image-file');
    const blogImagePlaceholder = document.getElementById('blog-image-placeholder');
    const blogImagePreviewContainer = document.getElementById('blog-image-preview-container');
    const blogImagePreview = document.getElementById('blog-image-preview');
    const blogRemoveImageBtn = document.getElementById('blog-remove-image');
    const blogUploadProgress = document.getElementById('blog-upload-progress');
    const blogProgressBar = document.getElementById('blog-progress-bar');

    // Show image preview
    function showBlogImagePreview(url) {
        blogImagePreview.src = url;
        blogImagePlaceholder.classList.add('hidden');
        blogImagePreviewContainer.classList.remove('hidden');
        document.getElementById('blog-featured-image').value = url;
        blogUploadedImageUrl = url;
    }

    // Reset image upload
    function resetBlogImageUpload() {
        blogImagePlaceholder.classList.remove('hidden');
        blogImagePreviewContainer.classList.add('hidden');
        blogUploadProgress.classList.add('hidden');
        blogProgressBar.style.width = '0%';
        blogImageFileInput.value = '';
        document.getElementById('blog-featured-image').value = '';
        blogUploadedImageUrl = null;
    }

    // Upload image to Cloudinary
    async function uploadBlogImage(file) {
        const formData = new FormData();
        formData.append('file', file);

        blogUploadProgress.classList.remove('hidden');
        blogProgressBar.style.width = '30%';

        try {
            const response = await fetch('/api/upload/image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            blogProgressBar.style.width = '70%';

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            blogProgressBar.style.width = '100%';

            setTimeout(() => {
                blogUploadProgress.classList.add('hidden');
                showBlogImagePreview(data.url);
            }, 500);

        } catch (error) {
        console.error('Blog image upload error:', error);
        notify.error('Failed to upload image: ' + error.message);
        blogUploadProgress.classList.add('hidden');
        blogProgressBar.style.width = '0%';
    }
    }

    // Dropzone click handler
    if (blogImageDropzone) {
        blogImageDropzone.addEventListener('click', (e) => {
            if (e.target.id !== 'blog-remove-image' && !e.target.closest('#blog-remove-image')) {
                blogImageFileInput.click();
            }
        });

        // Drag & Drop handlers
        blogImageDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            blogImageDropzone.classList.add('border-blue-500', 'bg-blue-50');
        });

        blogImageDropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            blogImageDropzone.classList.remove('border-blue-500', 'bg-blue-50');
        });

        blogImageDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            blogImageDropzone.classList.remove('border-blue-500', 'bg-blue-50');

            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                uploadBlogImage(files[0]);
            } else {
            notify.warning('Please drop an image file (PNG, JPG, GIF)');
        }
    });
    }

    // File input change handler
    if (blogImageFileInput) {
        blogImageFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                uploadBlogImage(file);
            }
        });
    }

    // Remove image button handler
    if (blogRemoveImageBtn) {
        blogRemoveImageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            resetBlogImageUpload();
        });
    }

    // Edit blog post
    function editBlogPost(postId) {
        openBlogModal(postId);
    }

    // Delete blog post
    async function deleteBlogPost(postId) {
        if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/blog/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete blog post');

            notify.success('Blog post deleted successfully!');
            await fetchAndRenderBlogPosts();
        } catch (error) {
        console.error('Error deleting blog post:', error);
        notify.error(`Error: ${error.message}`);
    }
    }

    // View blog post (placeholder)
    function viewBlogPost(slug) {
        // TODO: Implement view functionality or redirect to blog page
        notify.info(`View functionality will redirect to blog post: ${slug}`);
    }

    // Handle blog form submission
    async function handleBlogFormSubmit(e) {
        e.preventDefault();

        // Get HTML content from Quill editor
        let content = '';
        if (blogEditor) {
            content = blogEditor.root.innerHTML;
            // Set to hidden input for form validation
            document.getElementById('blog-content').value = content;
        }

        // Validate content is not empty
        if (!content || content === '<p><br></p>') {
            notify.warning('Please add content to your blog post.');
            return;
        }

        const blogData = {
            title: document.getElementById('blog-title').value,
            excerpt: document.getElementById('blog-excerpt').value,
            content: content,
            featured_image: document.getElementById('blog-featured-image').value,
            status: document.getElementById('blog-status').value,
            tags: document.getElementById('blog-tags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '')
        };

        const method = currentEditingBlogId ? 'PUT' : 'POST';
        const url = currentEditingBlogId ? `/api/blog/${currentEditingBlogId}` : '/api/blog';

        try {
            console.log('Sending blog post data:', blogData);
            console.log('Request URL:', url);
            console.log('Method:', method);

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(blogData)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.error('Error response:', errorData);
                throw new Error(errorData.error || `Failed to save blog post (${response.status})`);
            }

            const result = await response.json();
            console.log('Success response:', result);

            notify.success(`Blog post ${currentEditingBlogId ? 'updated' : 'created'} successfully!`);
            closeBlogModal();
            await fetchAndRenderBlogPosts();
        } catch (error) {
        console.error('Error saving blog post:', error);
        console.error('Error stack:', error.stack);
        notify.error(`Error: ${error.message}`);
    }
    }

    // Filter blog posts
    function filterBlogPosts() {
        const statusFilter = document.getElementById('blog-status-filter').value;
        const searchTerm = document.getElementById('blog-search').value.toLowerCase();

        const filteredPosts = allBlogPosts.filter(post => {
            const matchesStatus = !statusFilter || post.status === statusFilter;
            const matchesSearch = !searchTerm ||
            post.title.toLowerCase().includes(searchTerm) ||
            (post.excerpt || '').toLowerCase().includes(searchTerm) ||
            (post.author_name || '').toLowerCase().includes(searchTerm);

            return matchesStatus && matchesSearch;
        });

        displayBlogPosts(filteredPosts);
    }

    // --- USER ROLES MANAGEMENT FUNCTIONS ---

    // Global variables for user roles management
    let filteredUsersForRoles = [];

    // Render user roles management page
    // ========== USER MANAGEMENT (UNIFIED) ==========
    let filteredUsers = [];

    function renderUsersPage() {
        filteredUsers = [...allUsers];
        displayUsersTable(filteredUsers);
        setupUserFilters();
    }

    let currentRoleFilter = '';

    function setupUserFilters() {
        const roleFilterBtns = document.querySelectorAll('.role-filter-btn');
        const userSearch = document.getElementById('user-search');

        // Setup role filter buttons
        roleFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                roleFilterBtns.forEach(b => {
                    b.classList.remove('active', 'bg-blue-600', 'text-white', 'dark:bg-blue-600');
                    b.classList.add('border-gray-300', 'dark:border-gray-600');
                });
                // Add active class to clicked button
                btn.classList.add('active', 'bg-blue-600', 'text-white', 'dark:bg-blue-600');
                btn.classList.remove('border-gray-300', 'dark:border-gray-600');

                currentRoleFilter = btn.dataset.role;
                filterUsers();
            });
        });

        if (userSearch) {
            userSearch.addEventListener('input', filterUsers);
        }
    }

    function filterUsers() {
        const searchTerm = document.getElementById('user-search')?.value.toLowerCase() || '';

        filteredUsers = allUsers.filter(user => {
            const matchesRole = !currentRoleFilter || user.role === currentRoleFilter;
            const matchesSearch = !searchTerm ||
            (user.name && user.name.toLowerCase().includes(searchTerm)) ||
            (user.email && user.email.toLowerCase().includes(searchTerm));
            return matchesRole && matchesSearch;
        });

        displayUsersTable(filteredUsers);
    }

    function displayUsersTable(users) {
        const tableBody = document.getElementById('users-table-body');
        if (!tableBody) return;

        if (users.length === 0) {
            tableBody.innerHTML = `
            <tr>
            <td colspan="6" class="text-center py-8 text-gray-500 dark:text-gray-400">
            <i class="fas fa-users text-4xl mb-4"></i>
            <p>No users found.</p>
            </td>
            </tr>
            `;
            return;
        }

        tableBody.innerHTML = users.map(user => {
            const parts = user.name ? user.name.split(' ') : [];
            const initials = parts.length > 1 ?
            parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase() :
            (user.name ? user.name.charAt(0).toUpperCase() : '??');

            const roleColors = {
                'admin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                'teacher': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                'student': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            };

            const roleColor = roleColors[user.role] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
            const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US') : 'N/A';

            return `
            <tr class="text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group" data-user-id="${user.id}">
            <td class="px-5 py-4">
            <div class="flex items-center">
            <div class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold mr-3 text-sm">
            ${initials}
            </div>
            <div>
            <p class="font-medium text-gray-800 dark:text-gray-200">${user.name || 'Unknown'}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">${user.phone || ''}</p>
            </div>
            </div>
            </td>
            <td class="px-5 py-4">
            <span class="text-gray-600 dark:text-gray-300">${user.email || 'N/A'}</span>
            </td>
            <td class="px-5 py-4">
            <span class="px-3 py-1 text-xs rounded-full font-medium ${roleColor}">
            ${(user.role || 'student').charAt(0).toUpperCase() + (user.role || 'student').slice(1)}
            </span>
            </td>
            <td class="px-5 py-4 text-gray-600 dark:text-gray-400">${joinDate}</td>
            <td class="px-5 py-4">
            <span class="inline-flex items-center px-2.5 py-1 text-xs rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
            <span class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
            Active
            </span>
            </td>
            <td class="px-5 py-4 text-right">
            <div class="relative inline-block">
            <button class="user-menu-toggle p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100" data-user-id="${user.id}">
            <i class="fas fa-ellipsis-v text-gray-500"></i>
            </button>
            <div class="user-dropdown hidden absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-20" data-dropdown-id="${user.id}">
            <button data-action="edit" data-user-id="${user.id}" class="user-action-btn w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center">
            <i class="fas fa-edit w-5 text-blue-500"></i>
            <span>Edit User</span>
            </button>
            <button data-action="change-role" data-user-id="${user.id}" data-user-role="${user.role}" class="user-action-btn w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center">
            <i class="fas fa-user-cog w-5 text-purple-500"></i>
            <span>Change Role</span>
            </button>
            <hr class="my-1 border-gray-100 dark:border-gray-700">
            <button data-action="delete" data-user-id="${user.id}" class="user-action-btn w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center">
            <i class="fas fa-trash w-5"></i>
            <span>Delete User</span>
            </button>
            </div>
            </div>
            </td>
            </tr>
            `;
        }).join('');

        // Add dropdown toggle functionality
        document.querySelectorAll('.user-menu-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const userId = btn.dataset.userId;
                const dropdown = document.querySelector(`[data-dropdown-id="${userId}"]`);

                // Close all other dropdowns
                document.querySelectorAll('.user-dropdown').forEach(d => {
                    if (d !== dropdown) d.classList.add('hidden');
                });

                dropdown.classList.toggle('hidden');
            });
        });

        // Close dropdown when clicking outside
            document.addEventListener('click', () => {
    document.querySelectorAll('.user-dropdown').forEach(d => d.classList.add('hidden'));
    });
    }

    // Edit user - open modal with user data
    function editUser(userId) {
        const user = allUsers.find(u => u.id === userId);
        if (!user) return;

        document.getElementById('user-id').value = user.id;
        document.getElementById('user-name').value = user.name || '';
        document.getElementById('user-email').value = user.email || '';
        document.getElementById('user-role').value = user.role || 'student';
        document.getElementById('user-phone').value = user.phone || '';
        document.getElementById('user-bio').value = user.bio || '';
        document.getElementById('user-password').value = '';

        document.getElementById('user-modal-title').textContent = 'Edit User';
        document.getElementById('user-modal').classList.remove('hidden');
    }

    // Add new user - open empty modal
    function addNewUser() {
        document.getElementById('user-form').reset();
        document.getElementById('user-id').value = '';
        document.getElementById('user-modal-title').textContent = 'Add New User';
        document.getElementById('user-modal').classList.remove('hidden');
    }

    // Save user (create or update)
    async function saveUser(event) {
        event.preventDefault();

        const userId = document.getElementById('user-id').value;
        const userData = {
            name: document.getElementById('user-name').value,
            email: document.getElementById('user-email').value,
            role: document.getElementById('user-role').value,
            phone: document.getElementById('user-phone').value,
            bio: document.getElementById('user-bio').value
        };

        const password = document.getElementById('user-password').value;
        if (password) {
            userData.password = password;
        }

        try {
            const url = userId ? `/api/users/${userId}` : '/api/users';
            const method = userId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to ${userId ? 'update' : 'create'} user`);
            }

            const result = await response.json();

            // Update local data
            if (userId) {
                const userIndex = allUsers.findIndex(u => u.id === userId);
                if (userIndex !== -1) {
                    allUsers[userIndex] = { ...allUsers[userIndex], ...userData };
                }
            } else {
            await fetchAllData(); // Refresh all data for new user
        }

        // Close modal and refresh
        document.getElementById('user-modal').classList.add('hidden');
        renderUsersPage();

        notify.success(`User ${userId ? 'updated' : 'created'} successfully!`);

    } catch (error) {
    console.error('Error saving user:', error);
    notify.error(`Error: ${error.message}`);
    }
    }

    // Quick role change
    async function quickRoleChange(userId, currentRole) {
        const roles = ['student', 'teacher', 'admin'];
        const newRole = prompt(`Change role for user:\n\nCurrent role: ${currentRole}\n\nEnter new role (student/teacher/admin):`, currentRole);

        if (!newRole || newRole === currentRole || !roles.includes(newRole.toLowerCase())) {
            return;
        }

        try {
            const response = await fetch(`/api/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole.toLowerCase() })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update user role');
            }

            const userIndex = allUsers.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                allUsers[userIndex].role = newRole.toLowerCase();
            }

            renderUsersPage();
            notify.success(`Role updated successfully! User is now a ${newRole.toLowerCase()}.`);

        } catch (error) {
        console.error('Error updating user role:', error);
        notify.error(`Error: ${error.message}`);
    }
    }

    // Delete user
    async function deleteUser(userId) {
        const user = allUsers.find(u => u.id === userId);
        if (!user) return;

        if (!confirm(`Are you sure you want to delete ${user.name || user.email}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete user');
            }

            // Remove from local data
            allUsers = allUsers.filter(u => u.id !== userId);
            renderUsersPage();

            notify.success('User deleted successfully!');

        } catch (error) {
        console.error('Error deleting user:', error);
        notify.error(`Error: ${error.message}`);
    }
    }



    // --- CERTIFICATE & OTHER FUNCTIONS ---
    async function populateCertificateForm() {
        const tbody = document.getElementById('certificates-table-body');
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8"><i class="fas fa-spinner fa-spin text-2xl"></i><p class="mt-2">Loading certificates...</p></td></tr>`;

        try {
            const response = await fetch('/api/certificates', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch certificates');

            const certificates = await response.json();

            if (certificates.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-500"><i class="fas fa-certificate text-4xl mb-4"></i><p>No certificates issued yet</p></td></tr>`;
                return;
            }

            tbody.innerHTML = certificates.map(cert => {
                const studentName = cert.user ? cert.user.name : (cert.student_name || 'N/A');
                const studentEmail = cert.user ? cert.user.email : (cert.student_email || 'N/A');
                const courseName = cert.course ? cert.course.title : (cert.course_title || 'N/A');
                const issueDate = cert.issued_at || cert.issue_date || cert.created_at || new Date();

                return `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 font-medium">${studentName}</td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">${studentEmail}</td>
                <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">${courseName}</td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">${new Date(issueDate).toLocaleDateString()}</td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono text-xs">${cert.certificate_number || cert.certificateNumber || cert.id.substring(0, 12)}</td>
                <td class="px-4 py-3 text-sm">
                <a href="/api/certificates/${cert.id}/download" target="_blank" class="text-blue-600 hover:text-blue-800 mr-3">
                <i class="fas fa-download"></i> Download
                </a>
                <button onclick="viewCertificate('${cert.id}')" class="text-green-600 hover:text-green-800">
                <i class="fas fa-eye"></i> View
                </button>
                </td>
                </tr>
                `;
            }).join('');

            // Setup search functionality
            const searchInput = document.getElementById('certificate-search');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase();
                    const rows = tbody.querySelectorAll('tr');
                    rows.forEach(row => {
                        const text = row.textContent.toLowerCase();
                        row.style.display = text.includes(query) ? '' : 'none';
                    });
                });
            }

        } catch (error) {
        console.error('Error loading certificates:', error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-red-500"><i class="fas fa-exclamation-triangle text-4xl mb-4"></i><p>Error loading certificates: ${error.message}</p></td></tr>`;
    }
    }

    function viewCertificate(certificateId) {
        window.open(`/account#certificates`, '_blank');
    }

    function renderQuizManagementPage() { /* Placeholder */ }

    // --- CHARTS FUNCTIONS (from File 2) ---
    const setupCharts = () => {
        const enrollmentCtx = document.getElementById('enrollmentCanvas').getContext('2d');
        new Chart(enrollmentCtx, {
            type: 'line', data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], datasets: [{ label: 'New Enrollments', data: [65, 78, 90, 85, 110, 142], borderColor: 'rgb(79, 70, 229)', backgroundColor: 'rgba(79, 70, 229, 0.1)', tension: 0.3, fill: true }] },
            options: { maintainAspectRatio: false, responsive: true }
        });
        const categoriesCtx = document.getElementById('categoriesCanvas').getContext('2d');
        // Calculate real category distribution from courses
        const categoryCount = {};
        allCourses.forEach(course => {
            const category = course.category || 'Other';
            categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        const categoryLabels = Object.keys(categoryCount);
        const categoryData = Object.values(categoryCount);
        const categoryColors = ['#3B82F6', '#8B5CF6', '#10B981', '#EF4444', '#F59E0B', '#6B7280', '#EC4899', '#14B8A6'];

        new Chart(categoriesCtx, {
            type: 'doughnut',
            data: {
                labels: categoryLabels.length > 0 ? categoryLabels : ['No Data'],
                datasets: [{
                    data: categoryData.length > 0 ? categoryData : [1],
                    backgroundColor: categoryColors.slice(0, categoryLabels.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12,
                            padding: 10,
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    };

    // --- EVENT LISTENERS & INITIALIZATION ---
    const userName = user.name || 'Admin';
    const userEmail = user.email || 'admin@UniLearn.com';
    const userInitials = userName.split(' ').map(n=>n[0]).join('').toUpperCase() || userName.charAt(0).toUpperCase();

    document.getElementById('admin-user-name').textContent = userName;
    document.getElementById('admin-user-email').textContent = userEmail;
    document.getElementById('admin-avatar').textContent = userInitials;
    document.getElementById('header-user-name').textContent = userName;
    document.getElementById('header-avatar').textContent = userInitials;

    // Hide admin-only features for non-admin users
    if (user.role !== 'admin') {
        const userRolesNav = document.getElementById('user-roles-nav');
        if (userRolesNav) {
            userRolesNav.style.display = 'none';
        }
    }

    // Show Student View button for Admin
    if (user.role === 'admin') {
        const studentViewButton = document.getElementById('student-view-button');

        if (studentViewButton) {
            studentViewButton.classList.remove('hidden');
            studentViewButton.addEventListener('click', () => {
                window.location.href = '/courses';
            });
        }
    }

    // Setup sidebar navigation with null check
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const target = e.currentTarget.getAttribute('data-target');
            if (target) showPage(target);
        });
    });

    // Setup logout buttons with null checks
    const logoutButtons = [
        document.getElementById('logout-button-sidebar'),
        document.getElementById('logout-button-header')
    ].filter(btn => btn !== null);
    
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/login';
        });
    });

    // Setup sidebar toggles with null checks
    const openSidebarBtn = document.getElementById('openSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');
    
    if (openSidebarBtn && sidebar) {
        openSidebarBtn.addEventListener('click', () => sidebar.classList.remove('-translate-x-full'));
    }
    if (closeSidebarBtn && sidebar) {
        closeSidebarBtn.addEventListener('click', () => sidebar.classList.add('-translate-x-full'));
    }

    // Setup user menu with null check
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenu = document.getElementById('userMenu');
    if (userMenuBtn && userMenu) {
        userMenuBtn.addEventListener('click', () => userMenu.classList.toggle('hidden'));
    }

    // Event listeners for Subscription Modal (from File 1) with null checks
    const cancelSubBtn = document.getElementById('cancel-subscription-btn');
    if (cancelSubBtn) {
        cancelSubBtn.addEventListener('click', closeSubscriptionModal);
    }
    if (subscriptionForm) {
        subscriptionForm.addEventListener('submit', handleSubscriptionFormSubmit);
    }

    // Event listeners for Blog Management with null checks
    const createBlogBtn = document.getElementById('create-blog-btn');
    const cancelBlogBtn = document.getElementById('cancel-blog-btn');
    const blogStatusFilter = document.getElementById('blog-status-filter');
    const blogSearchInput = document.getElementById('blog-search');

    if (createBlogBtn) {
        createBlogBtn.addEventListener('click', () => openBlogModal());
    }
    if (cancelBlogBtn) {
        cancelBlogBtn.addEventListener('click', closeBlogModal);
    }
    if (blogForm) {
        blogForm.addEventListener('submit', handleBlogFormSubmit);
    }
    if (blogStatusFilter) {
        blogStatusFilter.addEventListener('change', filterBlogPosts);
    }
    if (blogSearchInput) {
        blogSearchInput.addEventListener('input', filterBlogPosts);
    }

    // Event delegation for blog action buttons
        document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('blog-action-btn')) {
        const action = e.target.dataset.action;

        if (action === 'edit') {
            const blogId = e.target.dataset.blogId;
            editBlogPost(blogId);
        } else if (action === 'delete') {
        const blogId = e.target.dataset.blogId;
        await deleteBlogPost(blogId);
    } else if (action === 'view') {
    const blogSlug = e.target.dataset.blogSlug;
    viewBlogPost(blogSlug);
    }
    }
    });

    // Event listeners for User Management
    document.getElementById('add-user-btn')?.addEventListener('click', addNewUser);
    document.getElementById('close-user-modal')?.addEventListener('click', () => {
        document.getElementById('user-modal').classList.add('hidden');
    });
    document.getElementById('cancel-user-btn')?.addEventListener('click', () => {
        document.getElementById('user-modal').classList.add('hidden');
    });
    document.getElementById('user-form')?.addEventListener('submit', saveUser);

    // Event delegation for user action buttons
        document.addEventListener('click', async (e) => {
    const button = e.target.closest('.user-action-btn');
    if (!button) return;

    const action = button.dataset.action;
    const userId = button.dataset.userId;

    if (action === 'edit') {
        editUser(userId);
    } else if (action === 'change-role') {
    const currentRole = button.dataset.userRole;
    await quickRoleChange(userId, currentRole);
    } else if (action === 'delete') {
    await deleteUser(userId);
    }
    });

    // Initialize TinyMCE editor on page load
    initBlogEditor();

    // Admin Profile Edit (đóng mở admin profile modal bằng cách classList.remove của javascript để xóa class hidden của tailwind css để hiện được modal) 
    let selectedAvatarColor = 'blue-500';
    document.getElementById('admin-profile-section')?.addEventListener('click', () => {
        document.getElementById('edit-admin-name').value = user.name || '';
        document.getElementById('admin-profile-modal').classList.remove('hidden');
    });

    document.querySelectorAll('.avatar-color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.avatar-color-btn').forEach(b => b.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-600'));
            btn.classList.add('ring-2', 'ring-offset-2', 'ring-blue-600');
            selectedAvatarColor = btn.dataset.color;
        });
    });

    document.getElementById('admin-profile-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = document.getElementById('edit-admin-name').value;

        try {
            const response = await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newName })
            });

            if (!response.ok) throw new Error('Failed to update profile');

            // Update local storage and UI
            user.name = newName;
            localStorage.setItem('user', JSON.stringify(user));

            const initials = newName.split(' ').map(n => n[0]).join('').toUpperCase();
            document.getElementById('admin-user-name').textContent = newName;
            document.getElementById('admin-avatar').textContent = initials;
            document.getElementById('header-user-name').textContent = newName;
            document.getElementById('header-avatar').textContent = initials;

            document.getElementById('admin-profile-modal').classList.add('hidden');
            notify.success('Profile updated successfully!');
        } catch (error) {
        notify.error('Error updating profile: ' + error.message);
    }
    });

    document.getElementById('close-profile-modal')?.addEventListener('click', () => {
        document.getElementById('admin-profile-modal').classList.add('hidden');
    });

    document.getElementById('cancel-profile-edit')?.addEventListener('click', () => {
        document.getElementById('admin-profile-modal').classList.add('hidden');
    });

    // Initial calls
    await fetchAllData();
    showPage('dashboard');
    setupCharts();
    });
