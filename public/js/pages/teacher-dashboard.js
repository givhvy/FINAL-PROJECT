/**
 * Teacher Dashboard JavaScript
 * Handles course management, student tracking, and teacher profile
 */

document.addEventListener('DOMContentLoaded', async () => {
    // --- AUTH, USER INFO, & GLOBAL VARS --- 
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || !user || (user.role !== 'teacher' && user.role !== 'admin')) {
        window.location.href = '/login';
        return;
    }

    let allCourses = [];
    let allStudents = [];
    let currentEditingCourseId = null;
    let uploadedImageUrl = null;

    // --- ELEMENTS ---
    const courseModal = document.getElementById('course-modal');
    const courseForm = document.getElementById('course-form');
    const imageFileInput = document.getElementById('imageFile');
    const imageUrlInput = document.getElementById('imageUrl');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const uploadProgress = document.getElementById('upload-progress');
    const progressBar = document.getElementById('progress-bar');
    
    // Set user info
    document.getElementById('teacher-name').textContent = user.name;
    document.getElementById('teacher-email').textContent = user.email;

    // Set avatar - use uploaded avatar or default avatar with user initials
    const teacherAvatar = document.getElementById('teacher-avatar-img');
    if (user.avatarUrl) {
        teacherAvatar.src = user.avatarUrl;
    } else {
        // Create default avatar with initials
        teacherAvatar.style.display = 'none';
        const avatarContainer = teacherAvatar.parentElement;
        const initialsDiv = document.createElement('div');
        initialsDiv.id = 'teacher-avatar-initials';
        initialsDiv.className = 'w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm';
        initialsDiv.textContent = getUserInitials(user.name);
        avatarContainer.insertBefore(initialsDiv, teacherAvatar);
    }

    function getUserInitials(name) {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }


    // --- PAGE NAVIGATION --- 
    function showPage(targetId) {
        document.querySelectorAll('.page-content').forEach(page => page.classList.add('hidden'));
        document.getElementById(targetId).classList.remove('hidden');

        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
            if(link.dataset.target === targetId) {
                link.classList.add('active');
            }
        });

        // Load data for the selected page
        if (targetId === 'dashboard-page') fetchAndRenderMyCourses();
        else if (targetId === 'profile-page') loadProfileData();
        else if (targetId === 'students-page') fetchAndRenderAllStudents();
        else if (targetId === 'quizzes-page') renderQuizManagementPage();
        else if (targetId === 'groups-page') fetchStudyGroups();
    }

    // --- DATA FETCHING --- 
    async function fetchInitialData() {
        try {
            const [coursesRes, usersRes] = await Promise.all([
                fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            if (!coursesRes.ok || !usersRes.ok) throw new Error('Could not fetch initial data');
            
            allCourses = await coursesRes.json();
            const allUsers = await usersRes.json();
            allStudents = allUsers.filter(u => u.role === 'student'); // Ch? gi? l?i students
            
            showPage('dashboard-page'); // Show dashboard after data is loaded
        } catch (error) {
            console.error(error);
            notify.error('Failed to load initial data.');
        }
    }

    // === COURSE MANAGEMENT FUNCTIONS ===
    async function fetchAndRenderMyCourses() {
        const coursesListDiv = document.getElementById('courses-list');
        // Admins see all courses, teachers see only their courses
        const myCourses = (user.role === 'admin')
            ? allCourses
            : allCourses.filter(course => course.teacher_id === user.id); 

        if (myCourses.length === 0) {
            coursesListDiv.innerHTML = `<p class="col-span-full text-center text-gray-500">You haven't created any courses yet.</p>`;
            return;
        }

        coursesListDiv.innerHTML = '';
        myCourses.forEach(course => {
            const descriptionText = course.description || 'No description provided.';
            const thumbnail = course.imageUrl || course.thumbnail || '';
            const isLocked = course.locked !== false;
            const accessBadge = isLocked
                ? '<span class="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded flex items-center gap-1"><i class="fas fa-crown"></i> PRO ACCESS</span>'
                : '<span class="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded flex items-center gap-1"><i class="fas fa-unlock"></i> FREE ACCESS</span>';

            const iconMap = {
                'Development': 'fa-code',
                'Design': 'fa-paint-brush',
                'Data Science': 'fa-chart-bar',
                'Marketing': 'fa-bullhorn',
                'Business': 'fa-chart-line',
                'AI & ML': 'fa-brain'
            };
            const iconClass = iconMap[course.category] || 'fa-graduation-cap';

            coursesListDiv.innerHTML += `
            <div class="dashboard-card bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border-l-4 border-blue-500" data-course-id="${course.id}">
                <div class="relative h-40 overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600">
                    ${thumbnail && thumbnail.trim() !== '' ?
                        `<img src="${thumbnail}" alt="${course.title}" class="w-full h-full object-cover">` :
                        `<div class="w-full h-full flex items-center justify-center">
                            <i class="fas ${iconClass} text-white text-6xl opacity-80"></i>
                        </div>`
                    }
                </div>
                <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-semibold text-gray-800 dark:text-gray-200 flex-1">${course.title}</h3>
                        <div class="flex space-x-2 ml-2">
                            <button class="edit-course-btn text-gray-400 hover:text-blue-600"><i class="fas fa-pencil-alt pointer-events-none"></i></button>
                            <button class="delete-course-btn text-gray-400 hover:text-red-600"><i class="fas fa-trash pointer-events-none"></i></button>
                        </div>
                    </div>
                    <p class="text-sm text-gray-500 mt-2 two-line-ellipsis">${descriptionText}</p>
                    <div class="mt-4 flex justify-between items-center">
                        ${accessBadge}
                        <button class="toggle-access-btn px-3 py-1 text-xs font-semibold rounded transition-colors ${course.locked !== false ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}">
                            <i class="fas fa-exchange-alt mr-1"></i> ${course.locked !== false ? 'PRO' : 'FREE'}
                        </button>
                    </div>
                    <div class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center">
                        <a href="/lesson-management?courseId=${course.id}" class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">Manage Lessons <i class="fas fa-arrow-right text-xs"></i></a>
                    </div>
                </div>
            </div>`;
        });
    }

    function openCourseModal(course = null) {
        courseForm.reset();
        uploadedImageUrl = null;
        imagePreview.classList.add('hidden');
        uploadProgress.classList.add('hidden');

        if (course) { // Editing mode
            document.getElementById('modal-title').textContent = 'Edit Course';
            document.getElementById('title').value = course.title;
            document.getElementById('description').value = course.description;
            document.getElementById('category').value = course.category || '';
            document.getElementById('imageUrl').value = course.imageUrl || course.thumbnail || '';

            // Set locked/free radio buttons
            const isLocked = course.locked !== false;
            if (isLocked) {
                document.getElementById('access-locked').checked = true;
            } else {
                document.getElementById('access-free').checked = true;
            }

            currentEditingCourseId = course.id;

            // Show preview if editing and has image
            const courseImageUrl = course.imageUrl || course.thumbnail;
            if (courseImageUrl) {
                previewImg.src = courseImageUrl;
                imagePreview.classList.remove('hidden');
            }
        } else { // Adding mode
            document.getElementById('modal-title').textContent = 'Add New Course';
            currentEditingCourseId = null;
            document.getElementById('access-locked').checked = true; // Default to locked
        }
        courseModal.classList.remove('hidden');
    }

    // === UPLOAD FUNCTIONS ===
    async function uploadImageToCloudinary(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            uploadProgress.classList.remove('hidden');
            progressBar.style.width = '0%';

            const response = await fetch('/api/upload/image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }

            const data = await response.json();
            progressBar.style.width = '100%';

            setTimeout(() => {
                uploadProgress.classList.add('hidden');
            }, 500);

            return data.url;
        } catch (error) {
            uploadProgress.classList.add('hidden');
            throw error;
        }
    }

    // Handle file input change
    imageFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);

        // Upload to Cloudinary
        try {
            uploadedImageUrl = await uploadImageToCloudinary(file);
            imageUrlInput.value = uploadedImageUrl;
        } catch (error) {
            console.error('Upload error:', error);
            notify.error('Failed to upload image: ' + error.message);
            imagePreview.classList.add('hidden');
        }
    });

    // Handle URL input change
    imageUrlInput.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (url) {
            previewImg.src = url;
            imagePreview.classList.remove('hidden');
            uploadedImageUrl = url;
        } else {
            imagePreview.classList.add('hidden');
        }
    });

    // === STUDENT MANAGEMENT FUNCTIONS (NEW) === 
    function getInitials(name) {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
    }
    
    async function fetchAndRenderAllStudents() {
        const tableBody = document.getElementById('students-table-body');

        if (allStudents.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">No students registered yet.</td></tr>`;
            return;
        }

        tableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">Loading student data...</td></tr>';

        // Fetch enrollment and progress data for all students
        const studentsWithData = await Promise.all(allStudents.map(async (student) => {
            try {
                // Fetch enrollments - use correct API path
                const enrollRes = await fetch(`/api/users/${student.id}/enrollments`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const enrollments = enrollRes.ok ? await enrollRes.json() : [];

                // Fetch progress
                const progressRes = await fetch(`/api/users/${student.id}/progress`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const progressData = progressRes.ok ? await progressRes.json() : {};

                // Calculate overall progress
                const courseProgresses = Object.values(progressData);
                const overallProgress = courseProgresses.length > 0
                    ? Math.round(courseProgresses.reduce((sum, p) => sum + (p.percentage || 0), 0) / courseProgresses.length)
                    : 0;

                return {
                    ...student,
                    enrolledCourses: enrollments.length,
                    overallProgress: overallProgress
                };
            } catch (error) {
                console.error(`Error fetching data for student ${student.id}:`, error);
                return {
                    ...student,
                    enrolledCourses: 0,
                    overallProgress: 0
                };
            }
        }));

        tableBody.innerHTML = '';
        studentsWithData.forEach(student => {
            // Calculate student statistics
            const enrolledCourses = student.enrolledCourses || 0;
            const overallProgress = student.overallProgress || 0;

            const studentRow = document.createElement('tr');
            studentRow.className = 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors';
            studentRow.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold text-sm">
                                ${getInitials(student.name)}
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900 dark:text-gray-100">${student.name || 'Unknown'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${student.email}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    <span class="font-semibold">${enrolledCourses}</span> course${enrolledCourses !== 1 ? 's' : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2" style="width: 120px;">
                            <div class="bg-blue-600 h-2 rounded-full" style="width: ${overallProgress}%"></div>
                        </div>
                        <span class="text-xs font-medium text-gray-700 dark:text-gray-300">${overallProgress}%</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button data-student-id="${student.id}" class="view-progress-btn text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1">
                        <i class="fas fa-chart-line"></i> View Progress
                    </button>
                </td>
            `;
            tableBody.appendChild(studentRow);
        });

        // Add listener for view progress
        document.querySelectorAll('.view-progress-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const studentId = e.currentTarget.dataset.studentId;
                showStudentProgressModal(studentId);
            });
        });
    }

    // Show detailed student progress in a modal
    function showStudentProgressModal(studentId) {
        const student = allStudents.find(s => s.id === studentId);
        if (!student) {
            notify.warning('Student not found');
            return;
        }

        // Create modal dynamically
        const modalHTML = `
            <div id="progress-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 m-4 max-w-4xl w-full">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Student Progress: ${student.name}</h2>
                        <button onclick="closeProgressModal()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>

                    <div class="space-y-6">
                        <div class="grid grid-cols-3 gap-4">
                            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                <p class="text-sm text-gray-600 dark:text-gray-400">Enrolled Courses</p>
                                <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">${student.enrolled_courses?.length || 0}</p>
                            </div>
                            <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                <p class="text-sm text-gray-600 dark:text-gray-400">Overall Progress</p>
                                <p class="text-2xl font-bold text-green-600 dark:text-green-400">${student.overall_progress || 0}%</p>
                            </div>
                            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                <p class="text-sm text-gray-600 dark:text-gray-400">Completed Courses</p>
                                <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">${student.completed_courses?.length || 0}</p>
                            </div>
                        </div>

                        <div>
                            <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Course Progress Details</h3>
                            <div class="space-y-3">
                                ${(student.enrolled_courses && student.enrolled_courses.length > 0) ?
                                    student.enrolled_courses.map(courseId => {
                                        const course = allCourses.find(c => c.id === courseId);
                                        const progress = student.course_progress?.[courseId] || 0;
                                        return `
                                            <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                                <div class="flex justify-between items-center mb-2">
                                                    <span class="font-medium text-gray-800 dark:text-gray-200">${course?.title || 'Unknown Course'}</span>
                                                    <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">${progress}%</span>
                                                </div>
                                                <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${progress}%"></div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')
                                : '<p class="text-gray-500 dark:text-gray-400 text-center py-4">No enrolled courses yet.</p>'}
                            </div>
                        </div>
                    </div>

                    <div class="mt-6 flex justify-end">
                        <button onclick="closeProgressModal()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Close progress modal
    window.closeProgressModal = function() {
        const modal = document.getElementById('progress-modal');
        if (modal) modal.remove();
    }

    // === QUIZ MANAGEMENT - FR4.7: Student Quiz Grades ===
    let allQuizGrades = [];
    let teacherCourses = [];

    async function renderQuizManagementPage() {
        try {
            await fetchQuizGrades();
        } catch (error) {
            console.error('Error loading quiz grades:', error);
        }
    }

    async function fetchQuizGrades() {
        const loadingEl = document.getElementById('quiz-grades-loading');
        const containerEl = document.getElementById('quiz-grades-container');
        const emptyEl = document.getElementById('quiz-grades-empty');
        const filterSelect = document.getElementById('quiz-filter-course');

        loadingEl.classList.remove('hidden');
        containerEl.classList.add('hidden');
        emptyEl.classList.add('hidden');

        try {
            // 1. Fetch teacher's courses
            const coursesResponse = await fetch('/api/courses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let allCourses = await coursesResponse.json();

            // Ensure allCourses is an array
            if (!Array.isArray(allCourses)) {
                console.error('Courses is not an array:', allCourses);
                allCourses = [];
            }

            // Admins see all courses, teachers see only their courses
            teacherCourses = (user.role === 'admin')
                ? allCourses
                : allCourses.filter(course => course.teacher_id === user.id);

            // Populate filter dropdown
            filterSelect.innerHTML = '<option value="all">All Courses</option>';
            teacherCourses.forEach(course => {
                filterSelect.innerHTML += `<option value="${course.id}">${course.title}</option>`;
            });

            // 2. Fetch all grades
            const gradesResponse = await fetch('/api/grades', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let allGrades = await gradesResponse.json();

            // Ensure allGrades is an array
            if (!Array.isArray(allGrades)) {
                console.error('Grades is not an array:', allGrades);
                allGrades = [];
            }

            // 3. Fetch all quizzes to get course associations
            const quizzesResponse = await fetch('/api/quizzes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let allQuizzes = await quizzesResponse.json();

            // Ensure allQuizzes is an array
            if (!Array.isArray(allQuizzes)) {
                console.error('Quizzes is not an array:', allQuizzes);
                allQuizzes = [];
            }

            // Create quiz map for quick lookup
            const quizMap = {};
            allQuizzes.forEach(quiz => {
                quizMap[quiz.id] = quiz;
            });

            // 4. Fetch all users to get student information
            const usersResponse = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let allUsers = await usersResponse.json();

            // Ensure allUsers is an array
            if (!Array.isArray(allUsers)) {
                console.error('Users is not an array:', allUsers);
                allUsers = [];
            }

            // Create user map for quick lookup
            const userMap = {};
            allUsers.forEach(user => {
                userMap[user.id] = user;
            });

            // 5. Enrich grades with quiz, course, and user information
            const enrichedGrades = allGrades.map(grade => {
                const quizId = grade.quizId || grade.quiz_id;
                const quiz = quizMap[quizId];
                const userId = grade.userId || grade.user_id;
                const user = userMap[userId];
                return {
                    ...grade,
                    quiz: quiz || { title: 'Quiz Deleted', course_id: null, courseId: null },
                    user: user || { name: 'Unknown User', email: 'N/A' }
                };
            });

            // 6. Filter grades for teacher's courses only
            allQuizGrades = enrichedGrades.filter(grade => {
                const courseId = grade.courseId || grade.course_id || grade.quiz?.courseId || grade.quiz?.course_id;
                return teacherCourses.some(course => course.id === courseId);
            });

            renderQuizGradesTable(allQuizGrades);

        } catch (error) {
            console.error('Error fetching quiz grades:', error);
            loadingEl.classList.add('hidden');
            containerEl.innerHTML = `
                <div class="text-center text-red-600 py-8">
                    <i class="fas fa-exclamation-triangle text-4xl mb-3"></i>
                    <p>Error loading quiz grades</p>
                </div>
            `;
            containerEl.classList.remove('hidden');
        }
    }

    function renderQuizGradesTable(grades) {
        const loadingEl = document.getElementById('quiz-grades-loading');
        const containerEl = document.getElementById('quiz-grades-container');
        const emptyEl = document.getElementById('quiz-grades-empty');

        loadingEl.classList.add('hidden');

        if (grades.length === 0) {
            emptyEl.classList.remove('hidden');
            return;
        }

        // Group grades by course and quiz
        const groupedGrades = {};
        grades.forEach(grade => {
            const courseId = grade.quiz?.course_id || 'unknown';
            if (!groupedGrades[courseId]) {
                groupedGrades[courseId] = {};
            }
            const quizId = grade.quiz_id;
            if (!groupedGrades[courseId][quizId]) {
                groupedGrades[courseId][quizId] = [];
            }
            groupedGrades[courseId][quizId].push(grade);
        });

        let html = '';

        Object.keys(groupedGrades).forEach(courseId => {
            const course = teacherCourses.find(c => c.id === courseId);
            const courseName = course ? course.title : 'Unknown Course';

            html += `
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <div class="bg-gradient-to-r from-blue-600 to-blue-600 px-6 py-4">
                        <h3 class="text-xl font-bold text-white">${courseName}</h3>
                    </div>
                    <div class="p-6 space-y-6">
            `;

            Object.keys(groupedGrades[courseId]).forEach(quizId => {
                const quizGrades = groupedGrades[courseId][quizId];
                const quizTitle = quizGrades[0]?.quiz?.title || 'Unnamed Quiz';
                const avgScore = (quizGrades.reduce((sum, g) => sum + (g.score || 0), 0) / quizGrades.length).toFixed(1);
                const passCount = quizGrades.filter(g => (g.score || 0) >= 70).length;
                const passRate = ((passCount / quizGrades.length) * 100).toFixed(0);

                html += `
                    <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div class="bg-gray-50 dark:bg-gray-750 px-4 py-3 flex justify-between items-center">
                            <div>
                                <h4 class="font-semibold text-gray-800 dark:text-gray-200">${quizTitle}</h4>
                                <p class="text-sm text-gray-600 dark:text-gray-400">${quizGrades.length} student${quizGrades.length > 1 ? 's' : ''}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-gray-600 dark:text-gray-400">Avg Score: <span class="font-bold text-blue-600">${avgScore}%</span></p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">Pass Rate: <span class="font-bold ${passRate >= 70 ? 'text-green-600' : 'text-orange-600'}">${passRate}%</span></p>
                            </div>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Student</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                        <th class="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Score</th>
                                        <th class="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th class="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                `;

                quizGrades.forEach(grade => {
                    const score = grade.score || 0;
                    const passed = score >= 70;
                    const studentName = grade.user?.name || 'Unknown';
                    const studentEmail = grade.user?.email || 'N/A';
                    const date = grade.createdAt ? new Date(grade.createdAt).toLocaleDateString() : 'N/A';

                    html += `
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-200">${studentName}</td>
                            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">${studentEmail}</td>
                            <td class="px-4 py-3 text-center">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                    score >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    score >= 70 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                    score >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }">
                                    ${score}%
                                </span>
                            </td>
                            <td class="px-4 py-3 text-center">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                    passed ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }">
                                    <i class="fas fa-${passed ? 'check-circle' : 'times-circle'} mr-1"></i>
                                    ${passed ? 'Passed' : 'Failed'}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-center">${date}</td>
                        </tr>
                    `;
                });

                html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        containerEl.innerHTML = html;
        containerEl.classList.remove('hidden');
    }

    // Filter handler - Already inside DOMContentLoaded
    document.getElementById('quiz-filter-course')?.addEventListener('change', (e) => {
        const courseId = e.target.value;
        if (courseId === 'all') {
            renderQuizGradesTable(allQuizGrades);
        } else {
            const filtered = allQuizGrades.filter(g => g.quiz?.course_id === courseId);
            renderQuizGradesTable(filtered);
        }
    });

    document.getElementById('refresh-grades-btn')?.addEventListener('click', () => {
        fetchQuizGrades();
    });

    // === CERTIFICATE FUNCTIONS ===

    let allCertificates = [];
    let filteredCertificates = [];

    async function loadCertificatesDatabase() {
        try {
            // Fetch all certificates
            const response = await fetch('/api/certificates', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch certificates');

            allCertificates = await response.json();

            // Filter to show only certificates for teacher's courses (admins see all)
            const myCourseIds = (user.role === 'admin')
                ? allCourses.map(c => c.id)
                : allCourses.filter(c => c.teacher_id === user.id).map(c => c.id);
            filteredCertificates = allCertificates.filter(cert => myCourseIds.includes(cert.course_id));

            // Update statistics
            updateCertificateStats(filteredCertificates);

            // Populate course filter
            populateCourseFilter(myCourseIds);

            // Render certificates table
            renderCertificatesTable(filteredCertificates);

        } catch (error) {
            console.error('Error loading certificates:', error);
            document.getElementById('certificates-table-body').innerHTML = `
                <tr><td colspan="6" class="px-6 py-4 text-center text-red-600">Failed to load certificates</td></tr>
            `;
        }
    }

    function updateCertificateStats(certificates) {
        // Total certificates
        document.getElementById('total-certs').textContent = certificates.length;

        // Unique students
        const uniqueStudents = new Set(certificates.map(c => c.user_id));
        document.getElementById('unique-students').textContent = uniqueStudents.size;

        // This month certificates
        const now = new Date();
        const thisMonth = certificates.filter(c => {
            const certDate = new Date(c.issued_at);
            return certDate.getMonth() === now.getMonth() && certDate.getFullYear() === now.getFullYear();
        });
        document.getElementById('monthly-certs').textContent = thisMonth.length;
    }

    function populateCourseFilter(myCourseIds) {
        const filterSelect = document.getElementById('cert-filter');
        filterSelect.innerHTML = '<option value="all">All Courses</option>';

        const myCourses = allCourses.filter(c => myCourseIds.includes(c.id));
        myCourses.forEach(course => {
            filterSelect.innerHTML += `<option value="${course.id}">${course.title}</option>`;
        });
    }

    function renderCertificatesTable(certificates) {
        const tbody = document.getElementById('certificates-table-body');
        const emptyDiv = document.getElementById('certificates-empty');

        if (certificates.length === 0) {
            tbody.innerHTML = '';
            emptyDiv.classList.remove('hidden');
            return;
        }

        emptyDiv.classList.add('hidden');

        tbody.innerHTML = certificates.map(cert => {
            const issuedDate = new Date(cert.issued_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            return `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-mono text-gray-900 dark:text-gray-200">${cert.certificate_number}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-xs mr-3">
                                ${getInitials(cert.student_name)}
                            </div>
                            <div class="text-sm font-medium text-gray-900 dark:text-gray-200">${cert.student_name}</div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-sm text-gray-900 dark:text-gray-200">${cert.course_title}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-500 dark:text-gray-400">${issuedDate}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Issued
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="viewCertificate('${cert.id}')" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <a href="/api/certificates/${cert.id}/download" class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                            <i class="fas fa-download"></i> PDF
                        </a>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function getInitials(name) {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    // Search and filter functionality
    document.getElementById('cert-search')?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const courseFilter = document.getElementById('cert-filter').value;

        let filtered = filteredCertificates;

        // Apply course filter
        if (courseFilter !== 'all') {
            filtered = filtered.filter(c => c.course_id === courseFilter);
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.student_name.toLowerCase().includes(searchTerm) ||
                c.course_title.toLowerCase().includes(searchTerm) ||
                c.certificate_number.toLowerCase().includes(searchTerm)
            );
        }

        renderCertificatesTable(filtered);
    });

    document.getElementById('cert-filter')?.addEventListener('change', (e) => {
        const courseId = e.target.value;
        const searchTerm = document.getElementById('cert-search').value.toLowerCase();

        let filtered = filteredCertificates;

        // Apply course filter
        if (courseId !== 'all') {
            filtered = filtered.filter(c => c.course_id === courseId);
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.student_name.toLowerCase().includes(searchTerm) ||
                c.course_title.toLowerCase().includes(searchTerm) ||
                c.certificate_number.toLowerCase().includes(searchTerm)
            );
        }

        renderCertificatesTable(filtered);
    });

    // View certificate in modal
    window.viewCertificate = function(certId) {
        const cert = allCertificates.find(c => c.id === certId);
        if (!cert) return;

        alert(`Certificate Details:\n\nNumber: ${cert.certificate_number}\nStudent: ${cert.student_name}\nCourse: ${cert.course_title}\nIssued: ${new Date(cert.issued_at).toLocaleDateString()}`);
    };

    // H�M: T?I CERTIFICATE (Gi? nguy�n)
    function downloadCertificate() {
        const certificateNode = document.getElementById('certificate-template');
        const userSelect = document.getElementById('cert-user');
        const studentName = userSelect.options[userSelect.selectedIndex]?.dataset.name; 
        const fileName = `certificate-${studentName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;

        html2canvas(certificateNode, {
            scale: 2, 
            useCORS: true 
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = fileName;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error('Error during certificate capture:', err);
            notify.error('Failed to download certificate. Check console for details.');
        });
    }

    // H�M GENERATE CERTIFICATE PREVIEW (Gi? nguy�n)
    function generateCertificatePreview() {
        const userSelect = document.getElementById('cert-user');
        const courseSelect = document.getElementById('cert-course');
        const dateInput = document.getElementById('cert-date');
        const studentName = userSelect.options[userSelect.selectedIndex]?.getAttribute('data-name');
        const courseTitle = courseSelect.options[courseSelect.selectedIndex]?.getAttribute('data-title');
        const issueDate = dateInput.value ? new Date(dateInput.value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

        if (!studentName || !courseTitle || !issueDate) {
            notify.warning('Please select all fields to generate a certificate.');
            return;
        }

        const previewContainer = document.getElementById('certificate-preview-container');
        previewContainer.classList.remove('hidden');
        previewContainer.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">Certificate Preview</h2>
                <button id="download-btn" class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center shadow-md">
                    <i class="fas fa-download mr-2"></i> Download PNG
                </button>
            </div>
            <div id="certificate-template" class="certificate w-full aspect-[1.4/1] bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 flex flex-col items-center justify-center relative">
                <div class="text-center z-10 px-6"> 
                    <h2 class="text-xl uppercase tracking-widest text-gray-500 mb-2">Certificate of Completion</h2> 
                    <h1 class="certificate-title text-4xl font-bold mb-4">Achievement Award</h1> 
                    <p class="text-gray-600 dark:text-gray-400 mb-2">This certifies that</p> 
                    <h2 class="certificate-name text-center mx-auto my-6 px-4">${studentName.toUpperCase()}</h2> 
                    <p class="text-gray-600 dark:text-gray-400 mb-6">has successfully completed the course</p> 
                    <h3 class="text-2xl font-semibold text-blue-800 mb-6">${courseTitle}</h3> 
                    <p class="text-gray-600 dark:text-gray-400 mb-8">Issued on ${issueDate}</p> 
                    <div class="text-center"> 
                        <div class="text-xl text-blue-800 mb-2" style="font-family: 'Playfair Display', serif;">${user.name}</div> 
                        <div class="w-40 border-t border-gray-400 mx-auto"></div> 
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Course Instructor</p> 
                    </div> 
                </div> 
                <svg class="seal" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"> 
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" stroke-width="2"/> 
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#3b82f6" stroke-width="1.5"/> 
                    <path d="M50,15 L53,25 L63,25 L55,32 L58,42 L50,36 L42,42 L45,32 L37,25 L47,25 Z" fill="#3b82f6"/> 
                    <text x="50" y="65" text-anchor="middle" font-family="Montserrat" font-size="8" fill="#1e3a8a">VERIFIED</text> 
                    <text x="50" y="75" text-anchor="middle" font-family="Montserrat" font-size="6" fill="#1e3a8a">AUTHENTIC</text> 
                </svg> 
            </div>
        `;

        document.getElementById('download-btn').addEventListener('click', downloadCertificate);
    }
    
    // --- EVENT LISTENERS WITH NULL CHECKS --- 
    // Sidebar navigation
    document.querySelectorAll('.sidebar-link[data-target]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.currentTarget.dataset.target;
            if (target) showPage(target);
        });
    });

    // Logout with null check
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/login';
        });
    }

    // Add Course button with null check
    const addCourseBtn = document.getElementById('add-course-btn');
    if (addCourseBtn) {
        addCourseBtn.addEventListener('click', () => openCourseModal());
    }
    
    // Modal Cancel button with null check
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn && courseModal) {
        cancelBtn.addEventListener('click', () => courseModal.classList.add('hidden'));
    }

    // Course form submission (Add/Edit) with null check
    if (courseForm) {
        courseForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get submit button and add loading state
            const submitBtn = courseForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';

            const isLocked = document.getElementById('access-locked')?.checked || false;
            const courseData = {
                title: document.getElementById('title')?.value,
                description: document.getElementById('description')?.value,
                locked: isLocked,
                category: document.getElementById('category').value,
                teacher_id: user.id,
                imageUrl: uploadedImageUrl || document.getElementById('imageUrl').value
            };

            const isEditing = !!currentEditingCourseId;
            const apiUrl = isEditing ? `/api/courses/${currentEditingCourseId}` : '/api/courses';
            const method = isEditing ? 'PUT' : 'POST';

            try {
                const response = await fetch(apiUrl, {
                    method,
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(courseData)
                });

                if (!response.ok) {
                    let errorMessage = 'An unknown error occurred during saving.';
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorData.message || errorMessage;
                    } catch {
                        errorMessage = await response.text();
                    }
                    throw new Error(errorMessage);
                }
                
                notify.success(`Course ${isEditing ? 'updated' : 'added'} successfully!`);
                
                // Reset form and close modal
                courseForm.reset();
                uploadedImageUrl = null;
                currentEditingCourseId = null;
                courseModal.classList.add('hidden');
                
                await fetchInitialData(); 
                
            } catch (error) {
                console.error("Course Save Error:", error);
                notify.error(`Failed to ${isEditing ? 'update' : 'add'} course: ${error.message}`);
            } finally {
                // Restore button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    } // Close if (courseForm) check

    // Edit/Delete buttons on course cards
    document.getElementById('courses-list').addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;
        const card = button.closest('.dashboard-card');
        const courseId = card.dataset.courseId;
        const courseToActOn = allCourses.find(c => c.id === courseId);

        if (button.classList.contains('edit-course-btn')) {
            openCourseModal(courseToActOn);
        } else if (button.classList.contains('delete-course-btn')) {
            if (confirm(`Are you sure you want to delete "${courseToActOn.title}"?`)) {
                try {
                    const response = await fetch(`/api/courses/${courseId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) throw new Error('Failed to delete course.');
                    await fetchInitialData(); // Refetch
                } catch (error) {
                    notify.error('Error: ' + error.message);
                }
            }
        } else if (button.classList.contains('toggle-access-btn')) {
            try {
                const currentLocked = courseToActOn.locked !== false;
                const newLocked = !currentLocked;

                const response = await fetch(`/api/courses/${courseId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ locked: newLocked })
                });

                if (!response.ok) {
                    throw new Error('Failed to toggle course access.');
                }

                await fetchInitialData(); // Refetch to update UI
                notify.success(`Course access changed to ${newLocked ? 'PRO' : 'FREE'}`);
            } catch (error) {
                notify.error('Error: ' + error.message);
            }
        }
    });

    // Generate Certificate button (check if exists first)
    const generateCertBtn = document.getElementById('generate-certificate');
    if (generateCertBtn) {
        generateCertBtn.addEventListener('click', generateCertificatePreview);
    }

    // --- STUDY GROUPS FUNCTIONALITY ---

    // Fetch and display study groups
    async function fetchStudyGroups() {
        try {
            const response = await fetch((window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin) + '/api/community/groups', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch study groups');
            const groups = await response.json();

            // Admins see all groups, teachers see only their groups
            const myGroups = (user.role === 'admin')
                ? groups
                : groups.filter(group => group.teacher_id === user.id);
            displayStudyGroups(myGroups);
        } catch (error) {
            console.error('Error fetching study groups:', error);
        }
    }

    // Display study groups in the UI - Updated with modern card styling like community page
    function displayStudyGroups(groups) {
        const container = document.getElementById('groups-container');

        if (groups.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <i class="fas fa-users text-2xl text-gray-400"></i>
                    </div>
                    <p class="font-medium">No study groups created yet.</p>
                    <p class="text-sm mt-1">Click "+ Create Study Group" to get started!</p>
                </div>
            `;
            return;
        }

        // Color themes for cards - matching community page style
        const cardColors = [
            { bg: 'from-blue-50 to-indigo-50', darkBg: 'dark:from-gray-800 dark:to-gray-750', border: 'border-blue-200', darkBorder: 'dark:border-gray-700', accent: 'bg-blue-500' },
            { bg: 'from-purple-50 to-pink-50', darkBg: 'dark:from-gray-800 dark:to-gray-750', border: 'border-purple-200', darkBorder: 'dark:border-gray-700', accent: 'bg-purple-500' },
            { bg: 'from-emerald-50 to-teal-50', darkBg: 'dark:from-gray-800 dark:to-gray-750', border: 'border-emerald-200', darkBorder: 'dark:border-gray-700', accent: 'bg-emerald-500' },
            { bg: 'from-orange-50 to-amber-50', darkBg: 'dark:from-gray-800 dark:to-gray-750', border: 'border-orange-200', darkBorder: 'dark:border-gray-700', accent: 'bg-orange-500' },
            { bg: 'from-cyan-50 to-sky-50', darkBg: 'dark:from-gray-800 dark:to-gray-750', border: 'border-cyan-200', darkBorder: 'dark:border-gray-700', accent: 'bg-cyan-500' }
        ];

        container.innerHTML = groups.map((group, index) => {
            const colors = cardColors[index % cardColors.length];
            const memberCount = group.member_count || 0;
            const subject = group.subject || 'General';
            const createdDate = group.created_at ? new Date(group.created_at).toLocaleDateString() : 'Unknown';
            
            return `
            <div class="bg-gradient-to-br ${colors.bg} ${colors.darkBg} rounded-2xl p-5 border ${colors.border} ${colors.darkBorder} hover:shadow-lg transition-all duration-300">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="font-bold text-gray-800 dark:text-gray-100 text-base">${escapeHtml(group.name)}</h3>
                    <span class="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        ${memberCount} members
                    </span>
                </div>
                
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">${escapeHtml(group.description || 'No description')}</p>
                
                <div class="flex items-center gap-4 mb-4">
                    <div class="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <span class="text-lg">📚</span>
                        <span>${escapeHtml(subject)}</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <span class="text-lg">📅</span>
                        <span>Created ${createdDate}</span>
                    </div>
                </div>

                <div class="flex gap-2">
                    <button onclick="window.openGroupForum('${group.id}', '${escapeHtml(group.name).replace(/'/g, "\\'")}')"
                            class="${colors.accent} hover:opacity-90 text-white py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2">
                        <i class="fas fa-comment-dots"></i>
                        Access Forum
                    </button>
                    <button onclick="window.editStudyGroup('${group.id}')"
                            class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-2">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button onclick="window.deleteStudyGroup('${group.id}')"
                            class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-2">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        `}).join('');
    }

    // Helper function to escape HTML
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Show study group modal for create/edit
    let currentEditingGroupId = null;
    
    function showStudyGroupModal(editMode = false, groupData = null) {
        currentEditingGroupId = editMode ? groupData?.id : null;
        
        const modalHtml = `
            <div id="study-group-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100">
                            ${editMode ? 'Edit Study Group' : 'Create Study Group'}
                        </h3>
                        <button onclick="closeStudyGroupModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <form id="study-group-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Group Name *</label>
                            <input type="text" id="group-name" required
                                   value="${editMode && groupData ? escapeHtml(groupData.name) : ''}"
                                   class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                   placeholder="Enter group name">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
                            <textarea id="group-description" required rows="3"
                                      class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                      placeholder="Enter group description">${editMode && groupData ? escapeHtml(groupData.description) : ''}</textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject/Topic</label>
                            <input type="text" id="group-subject"
                                   value="${editMode && groupData ? escapeHtml(groupData.subject || '') : ''}"
                                   class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                   placeholder="e.g., JavaScript, Python, Math">
                        </div>
                        
                        <div class="flex gap-3 pt-4">
                            <button type="button" onclick="closeStudyGroupModal()"
                                    class="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                Cancel
                            </button>
                            <button type="submit"
                                    class="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                                ${editMode ? 'Save Changes' : 'Create Group'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Add form submit handler
        document.getElementById('study-group-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleStudyGroupSubmit(editMode);
        });
    }

    // Close study group modal
    window.closeStudyGroupModal = function() {
        const modal = document.getElementById('study-group-modal');
        if (modal) modal.remove();
        currentEditingGroupId = null;
    };

    // Handle study group form submit
    async function handleStudyGroupSubmit(editMode) {
        const name = document.getElementById('group-name').value.trim();
        const description = document.getElementById('group-description').value.trim();
        const subject = document.getElementById('group-subject').value.trim() || 'General';

        if (!name || !description) {
            notify.error('Please fill in all required fields');
            return;
        }

        try {
            const baseUrl = window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin;
            
            if (editMode && currentEditingGroupId) {
                // Update existing group
                const response = await fetch(`${baseUrl}/api/community/groups/${currentEditingGroupId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ name, description, subject })
                });

                if (!response.ok) throw new Error('Failed to update study group');
                notify.success('Study group updated successfully!');
            } else {
                // Create new group
                const response = await fetch(`${baseUrl}/api/community/groups`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name,
                        description,
                        subject,
                        teacher_id: user.id
                    })
                });

                if (!response.ok) throw new Error('Failed to create study group');
                notify.success('Study group created successfully!');
            }

            closeStudyGroupModal();
            await fetchStudyGroups();

        } catch (error) {
            console.error('Error saving study group:', error);
            notify.error(editMode ? 'Failed to update study group.' : 'Failed to create study group.');
        }
    }

    // Edit study group - fetch data and show modal
    window.editStudyGroup = async function(groupId) {
        try {
            const baseUrl = window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin;
            const response = await fetch(`${baseUrl}/api/community/groups`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error('Failed to fetch group data');
            
            const groups = await response.json();
            const group = groups.find(g => g.id === groupId);
            
            if (!group) {
                notify.error('Group not found');
                return;
            }

            showStudyGroupModal(true, group);
        } catch (error) {
            console.error('Error fetching group:', error);
            notify.error('Failed to load group data');
        }
    };

    // Delete study group
    window.deleteStudyGroup = async function(groupId) {
        if (!confirm('Are you sure you want to delete this study group? This action cannot be undone.')) return;

        try {
            const baseUrl = window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin;
            const response = await fetch(`${baseUrl}/api/community/groups/${groupId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete study group');

            notify.success('Study group deleted successfully!');
            await fetchStudyGroups();

        } catch (error) {
            console.error('Error deleting study group:', error);
            notify.error('Failed to delete study group. Please try again.');
        }
    };

    // Open group forum - exposed to global scope
    window.openGroupForum = function(groupId, groupName) {
        // Open forum in new tab or modal
        window.open(`/community?group=${groupId}`, '_blank');
    };

    // Add event listener for create group button - now opens modal
    document.getElementById('create-group-btn').addEventListener('click', () => showStudyGroupModal(false));

    // === EDIT PROFILE PANEL FUNCTIONS ===
    let uploadedAvatarUrl = null;
    const editProfilePanel = document.getElementById('edit-profile-panel');
    const avatarFileInput = document.getElementById('avatar-file-input');
    const avatarUploadProgress = document.getElementById('avatar-upload-progress');
    const avatarProgressBar = document.getElementById('avatar-progress-bar');

    // Open profile panel
    function openProfilePanel() {
        // Populate form with current user data
        const editAvatarPreview = document.getElementById('edit-avatar-preview');
        if (user.avatarUrl) {
            editAvatarPreview.src = user.avatarUrl;
        } else {
            // Use default gradient avatar
            editAvatarPreview.src = 'data:image/svg+xml,' + encodeURIComponent(`
                <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <circle cx="75" cy="75" r="75" fill="url(#grad)"/>
                    <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="60" font-weight="600" fill="white">${getUserInitials(user.name)}</text>
                </svg>
            `);
        }
        document.getElementById('edit-name').value = user.name || '';
        document.getElementById('edit-email').value = user.email || '';
        document.getElementById('edit-phone').value = user.phone || '';
        document.getElementById('edit-location').value = user.location || '';

        // Show panel with animation
        editProfilePanel.classList.remove('translate-x-full');
    }

    // Close profile panel
    function closeProfilePanel() {
        editProfilePanel.classList.add('translate-x-full');
        uploadedAvatarUrl = null;
        avatarUploadProgress.classList.add('hidden');
    }

    // Handle avatar upload
    avatarFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('edit-avatar-preview').src = e.target.result;
        };
        reader.readAsDataURL(file);

        // Upload to server
        try {
            avatarUploadProgress.classList.remove('hidden');
            avatarProgressBar.style.width = '0%';

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload/image', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            uploadedAvatarUrl = data.url;
            avatarProgressBar.style.width = '100%';

            setTimeout(() => {
                avatarUploadProgress.classList.add('hidden');
            }, 500);

        } catch (error) {
            console.error('Avatar upload error:', error);
            notify.error('Failed to upload avatar: ' + error.message);
            avatarUploadProgress.classList.add('hidden');
        }
    });

    // Handle profile form submission
    document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const updatedProfile = {
            name: document.getElementById('edit-name').value,
            phone: document.getElementById('edit-phone').value,
            location: document.getElementById('edit-location').value
        };

        if (uploadedAvatarUrl) {
            updatedProfile.avatarUrl = uploadedAvatarUrl;
        }

        try {
            const response = await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedProfile)
            });

            if (!response.ok) throw new Error('Failed to update profile');

            const updatedUser = await response.json();

            // Update local storage and user object
            Object.assign(user, updatedUser);
            localStorage.setItem('user', JSON.stringify(user));

            // Update UI
            document.getElementById('teacher-name').textContent = user.name;

            // Update avatar
            const teacherAvatar = document.getElementById('teacher-avatar-img');
            const initialsAvatar = document.getElementById('teacher-avatar-initials');

            if (user.avatarUrl) {
                teacherAvatar.src = user.avatarUrl;
                teacherAvatar.style.display = 'block';
                if (initialsAvatar) initialsAvatar.remove();
            } else {
                teacherAvatar.style.display = 'none';
                if (!initialsAvatar) {
                    const avatarContainer = teacherAvatar.parentElement;
                    const initialsDiv = document.createElement('div');
                    initialsDiv.id = 'teacher-avatar-initials';
                    initialsDiv.className = 'w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm';
                    initialsDiv.textContent = getUserInitials(user.name);
                    avatarContainer.insertBefore(initialsDiv, teacherAvatar);
                } else {
                    initialsAvatar.textContent = getUserInitials(user.name);
                }
            }

            notify.success('Profile updated successfully!');
            closeProfilePanel();

        } catch (error) {
            console.error('Profile update error:', error);
            notify.error('Failed to update profile: ' + error.message);
        }
    });

    // Event listeners for panel
    document.getElementById('profile-header').addEventListener('click', openProfilePanel);
    document.getElementById('close-profile-panel').addEventListener('click', closeProfilePanel);

    // --- FORUM MODAL FUNCTIONS ---
    let currentGroupId = null;

    // Open forum modal
    window.openGroupForum = async function(groupId, groupName) {
        currentGroupId = groupId;
        const modal = document.getElementById('group-forum-modal');
        const titleEl = document.getElementById('forum-group-title');
        
        if (titleEl) titleEl.textContent = groupName || 'Group Forum';
        modal.classList.remove('hidden');
        
        await loadForumMessages(groupId);
    };

    // Close forum modal
    const closeForumBtn = document.getElementById('close-forum-modal');
    if (closeForumBtn) {
        closeForumBtn.addEventListener('click', () => {
            document.getElementById('group-forum-modal').classList.add('hidden');
            currentGroupId = null;
        });
    }

    // Load forum messages
    async function loadForumMessages(groupId) {
        const container = document.getElementById('forum-messages-container');
        container.innerHTML = '<p class="text-gray-500 text-center">Loading messages...</p>';

        try {
            const API_BASE = (window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin) + '/api/community';
            const response = await fetch(`${API_BASE}/groups/${groupId}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to load messages');
            
            const messages = await response.json();

            if (!messages || messages.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-center">No messages yet. Start the conversation!</p>';
                return;
            }

            container.innerHTML = messages.map(msg => {
                const isMyMessage = msg.user_id === user.id || msg.userId === user.id;
                const userName = msg.user_name || msg.userName || 'Unknown';
                const timestamp = msg.created_at || msg.createdAt;

                return `
                    <div class="${isMyMessage ? 'flex justify-end' : 'flex justify-start'}">
                        <div class="${isMyMessage ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'} max-w-md px-4 py-3 rounded-lg">
                            <div class="flex items-center space-x-2 mb-1">
                                <span class="font-semibold text-sm">${userName}</span>
                                <span class="text-xs opacity-70">${new Date(timestamp).toLocaleString()}</span>
                            </div>
                            <p class="text-sm">${msg.message || msg.content}</p>
                        </div>
                    </div>
                `;
            }).join('');

            // Scroll to bottom
            container.scrollTop = container.scrollHeight;
        } catch (error) {
            console.error('Error loading messages:', error);
            container.innerHTML = '<p class="text-red-500 text-center">Error loading messages</p>';
        }
    }

    // Send message
    const sendMessageBtn = document.getElementById('send-message-btn');
    const messageInput = document.getElementById('new-message-input');

    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }

    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    async function sendMessage() {
        if (!currentGroupId) return;

        const message = messageInput.value.trim();
        if (!message) return;

        try {
            const API_BASE = (window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin) + '/api/community';
            const response = await fetch(`${API_BASE}/groups/${currentGroupId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id,
                    message: message
                })
            });

            if (!response.ok) throw new Error('Failed to send message');

            messageInput.value = '';
            await loadForumMessages(currentGroupId);
        } catch (error) {
            console.error('Error sending message:', error);
            notify.error('Failed to send message');
        }
    }

    // --- INITIALIZATION ---
    fetchInitialData();
});
