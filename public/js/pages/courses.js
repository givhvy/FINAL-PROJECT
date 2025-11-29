/**
 * Courses Page JavaScript
 * Handles course catalog, filtering, lesson page, quiz interface, and progress tracking
 */

// ==================== GLOBAL VARIABLES ====================
let allCoursesData = [];
let currentFilter = 'All';
let completedLessonIds = new Set();
let userProgressData = {};
let isLoadingCourses = false;
let carouselInterval;
let currentImageIndex = 0;

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

// ==================== BANNER CAROUSEL DATA ====================
const bannerData = [
    {
        image: 'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200',
        tag: 'FULL STACK',
        title: 'Master Web Development 2025',
        subtitle: 'Become a professional Full Stack Developer with React, Node.js, and modern databases.',
        buttonText: 'Get Started →',
        color: 'from-blue-600 to-blue-700'
    },
    {
        image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200',
        tag: 'DATA SCIENCE',
        title: 'Data Science Fundamentals',
        subtitle: 'Discover the power of data with Python, Pandas, and Machine Learning algorithms.',
        buttonText: 'Explore Now →',
        color: 'from-green-600 to-teal-600'
    },
    {
        image: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200',
        tag: 'DESIGN',
        title: 'UI/UX Design Principles',
        subtitle: 'Learn to create beautiful and effective user interfaces with Figma.',
        buttonText: 'Learn More →',
        color: 'from-blue-600 to-pink-600'
    },
    {
        image: 'https://res.cloudinary.com/dxqrmxll4/image/upload/v1758951586/Pastel_Purple_Pastel_Green_3D_Choice_Board_Education_Website_1_nqncb7.png',
        tag: 'AI & MACHINE LEARNING',
        title: 'Artificial Intelligence Mastery',
        subtitle: 'Master AI and Machine Learning with TensorFlow, PyTorch and advanced algorithms.',
        buttonText: 'Explore AI →',
        color: 'from-blue-600 to-blue-600'
    }
];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Auth check
    if (!token || !user) {
        window.location.href = '/login';
        return;
    }

    // Setup UI
    setupUserAvatar();
    setupUserTierBadge();
    setupEventListeners();
    setupCarousel();

    // Check URL and load content
    const shouldShowLesson = window.location.hash.startsWith('#lesson/');
    const courseId = shouldShowLesson ? window.location.hash.split('/')[1] : null;

    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quizId');
    const quizCourseId = urlParams.get('courseId');

    await fetchAllCourses();

    if (quizId && quizCourseId) {
        try {
            await showQuizDirectly(quizId, quizCourseId);
        } catch (error) {
            console.error('Error showing quiz:', error);
            history.replaceState({ page: 'courses' }, '', '#courses');
        }
    } else if (shouldShowLesson && courseId) {
        try {
            await showLessonPage(courseId);
        } catch (error) {
            console.error('Error showing lesson page:', error);
            history.replaceState({ page: 'courses' }, '', '#courses');
        }
    } else {
        history.replaceState({ page: 'courses' }, '', '#courses');
    }
});

// ==================== USER INTERFACE SETUP ====================
function setupUserAvatar() {
    const headerAvatar = document.getElementById('user-avatar');
    if (headerAvatar) {
        if (user.avatarUrl) {
            headerAvatar.innerHTML = `<img src="${user.avatarUrl}" alt="Avatar" class="h-8 w-8 rounded-full object-cover">`;
        } else {
            headerAvatar.textContent = getUserInitials(user.name);
            headerAvatar.className = 'h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold';
        }
    }
}

function setupUserTierBadge() {
    const tierBadgeElement = document.getElementById('user-tier-badge');
    if (!tierBadgeElement) return;

    const userRole = (user.role || '').toLowerCase();

    if (userRole === 'admin') {
        tierBadgeElement.innerHTML = `
            <span class="px-3 py-1 text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full flex items-center gap-1">
                <i class="fas fa-shield-alt"></i> ADMIN
            </span>
        `;
    } else if (userRole === 'teacher') {
        tierBadgeElement.innerHTML = `
            <span class="px-3 py-1 text-xs font-bold bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full flex items-center gap-1">
                <i class="fas fa-chalkboard-teacher"></i> TEACHER
            </span>
        `;
    } else {
        const userTier = user.subscriptionTier || 'free';
        if (userTier === 'pro') {
            tierBadgeElement.innerHTML = `
                <span class="px-3 py-1 text-xs font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white rounded-full flex items-center gap-1 shadow-lg">
                    <i class="fas fa-crown"></i> PRO
                </span>
            `;
        } else {
            tierBadgeElement.innerHTML = `
                <span class="px-3 py-1 text-xs font-bold bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-full">
                    FREE
                </span>
            `;
        }
    }
}

function setupEventListeners() {
    // User menu
    const userMenuBtn = document.getElementById('user-menu-button');
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', () => {
            if (user.role === 'teacher') {
                window.location.href = '/teacher';
            } else if (user.role === 'admin') {
                window.location.href = '/admin';
            } else {
                window.location.href = '/profile';
            }
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/login';
        });
    }

    // Mobile menu
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            const icon = mobileMenuButton.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });

        const mobileProfileBtn = document.getElementById('mobile-profile-button');
        if (mobileProfileBtn) {
            mobileProfileBtn.addEventListener('click', () => {
                if (user.role === 'teacher') {
                    window.location.href = '/teacher';
                } else if (user.role === 'admin') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/profile';
                }
            });
        }

        const mobileLogoutBtn = document.getElementById('mobile-logout-button');
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', () => {
                localStorage.clear();
                window.location.href = '/login';
            });
        }
    }

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentFilter = e.currentTarget.dataset.filter;
            renderCourses();
        });
    });

    // Category gallery items
    document.querySelectorAll('.category-gallery-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const category = e.currentTarget.dataset.category;
            const targetButton = document.querySelector(`.filter-btn[data-filter='${category}']`);
            if (targetButton) targetButton.click();
        });
    });

    // Search and filters
    const debouncedRenderCourses = debounce(renderCourses, 300);
    
    const courseSearch = document.getElementById('course-search');
    if (courseSearch) {
        courseSearch.addEventListener('input', debouncedRenderCourses);
    }

    const instructorFilter = document.getElementById('instructor-filter');
    if (instructorFilter) {
        instructorFilter.addEventListener('input', debouncedRenderCourses);
    }

    // Clear filters
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            currentFilter = 'All';
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector('.filter-btn[data-filter="All"]').classList.add('active');
            
            if (instructorFilter) instructorFilter.value = '';
            if (courseSearch) courseSearch.value = '';
            
            renderCourses();
        });
    }

    // Certificate popup
    const closeCertPopup = document.getElementById('close-cert-popup');
    if (closeCertPopup) {
        closeCertPopup.addEventListener('click', () => {
            document.getElementById('certificate-completion-popup').classList.add('hidden');
        });
    }

    const viewCertBtn = document.getElementById('view-my-certificate-btn');
    if (viewCertBtn) {
        viewCertBtn.addEventListener('click', () => {
            document.getElementById('certificate-completion-popup').classList.add('hidden');
            window.location.href = '/mylearning#certificates';
        });
    }

    // History management
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.page === 'courses') {
            showPage('courses');
        } else if (event.state && event.state.page === 'lesson' && event.state.courseId) {
            showLessonPage(event.state.courseId, false);
        } else {
            showPage('courses');
        }
    });
}

// ==================== CAROUSEL ====================
function setupCarousel() {
    updateBannerAndDots();
    startCarousel();
}

function updateBannerAndDots() {
    const featuredBanner = document.getElementById('featured-banner');
    const bannerContent = document.getElementById('banner-content');
    const carouselPaginationDots = document.getElementById('carousel-pagination-dots');

    if (!featuredBanner || !bannerContent || !carouselPaginationDots) return;

    const currentBanner = bannerData[currentImageIndex];
    featuredBanner.style.backgroundImage = `url('${currentBanner.image}')`;

    bannerContent.innerHTML = `
        <span class="text-xs sm:text-sm font-bold uppercase tracking-widest text-white/90 px-2 sm:px-3 py-1 bg-gradient-to-r ${currentBanner.color} rounded-full mb-2 sm:mb-3 inline-block">${currentBanner.tag}</span>
        <h2 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-3 leading-tight">${currentBanner.title}</h2>
        <p class="text-xs sm:text-sm md:text-base text-white/80 mb-3 sm:mb-6 max-w-lg line-clamp-2 sm:line-clamp-none">${currentBanner.subtitle}</p>
        <a href="#" class="bg-white/90 hover:bg-white text-blue-700 dark:bg-gray-800/20 dark:backdrop-blur-sm dark:text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-lg dark:hover:bg-gray-800/30 transition-all duration-300 inline-flex items-center border border-white/30 shadow-lg text-xs sm:text-sm md:text-base">
            ${currentBanner.buttonText}
        </a>`;

    carouselPaginationDots.innerHTML = '';
    bannerData.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('pagination-dot');
        if (index === currentImageIndex) dot.classList.add('active');
        dot.addEventListener('click', () => {
            currentImageIndex = index;
            clearInterval(carouselInterval);
            updateBannerAndDots();
            startCarousel();
        });
        carouselPaginationDots.appendChild(dot);
    });
}

function startCarousel() {
    clearInterval(carouselInterval);
    carouselInterval = setInterval(() => {
        currentImageIndex = (currentImageIndex + 1) % bannerData.length;
        updateBannerAndDots();
    }, 5000);
}

// ==================== COURSE DATA MANAGEMENT ====================
async function fetchAllCourses() {
    if (isLoadingCourses) return;
    isLoadingCourses = true;

    const loadingSpinner = document.getElementById('loading-spinner');
    const coursesGrid = document.getElementById('courses-grid');

    if (loadingSpinner) loadingSpinner.style.display = 'flex';
    if (coursesGrid) coursesGrid.innerHTML = '';

    try {
        const response = await fetchWithAuth('/api/courses');
        if (!response.ok) throw new Error('Failed to fetch courses.');
        allCoursesData = await response.json();

        try {
            // Use enrollments endpoint instead of progress (supports auto-enrollment)
            const enrollmentsResponse = await fetchWithAuth(`/api/users/${user.id}/enrollments`);
            if (enrollmentsResponse.ok) {
                const enrollments = await enrollmentsResponse.json();
                userProgressData = {};
                enrollments.forEach(enrollment => {
                    userProgressData[enrollment.courseId] = {
                        courseId: enrollment.courseId,
                        percentage: enrollment.percentage || 0,
                        completedLessons: enrollment.completedLessons || 0,
                        totalLessons: enrollment.totalLessons || 0
                    };
                });
            }
        } catch (progressError) {
            console.warn('Could not fetch user progress:', progressError);
        }

        renderCourses();
        renderPopularCourses();
        renderTrendingCourses();
        history.replaceState({ page: 'courses' }, '', '#courses');
    } catch (error) {
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (coursesGrid) coursesGrid.innerHTML = `<p class="col-span-3 text-center text-red-500">${error.message}</p>`;
    } finally {
        isLoadingCourses = false;
    }
}

// ==================== COURSE RENDERING ====================
function renderCourses() {
    const loadingSpinner = document.getElementById('loading-spinner');
    const coursesGrid = document.getElementById('courses-grid');
    const courseSearch = document.getElementById('course-search');
    const instructorFilter = document.getElementById('instructor-filter');

    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (!coursesGrid) return;
    
    coursesGrid.innerHTML = '';

    const searchTerm = courseSearch ? courseSearch.value.toLowerCase() : '';
    const instructorFilterValue = instructorFilter ? instructorFilter.value.toLowerCase() : '';

    const filteredCourses = allCoursesData.filter(course => {
        const filterValue = currentFilter.toLowerCase();
        const courseCategory = course.category ? course.category.toLowerCase() : '';
        const courseLevel = course.level ? course.level.toLowerCase() : '';

        const categoryMatch = filterValue === 'all' ||
            courseCategory.includes(filterValue) ||
            courseLevel.includes(filterValue);

        const searchMatch = course.title.toLowerCase().includes(searchTerm) ||
            (course.description && course.description.toLowerCase().includes(searchTerm));

        let instructorMatch = true;
        if (instructorFilterValue) {
            const instructorName = course.teacher?.name?.toLowerCase() || course.instructor?.toLowerCase() || '';
            instructorMatch = instructorName.includes(instructorFilterValue);
        }

        return categoryMatch && searchMatch && instructorMatch;
    });

    if (filteredCourses.length === 0) {
        coursesGrid.innerHTML = `<p class="col-span-3 text-center text-gray-500">No courses found for the selected filter or search term.</p>`;
        return;
    }

    filteredCourses.forEach(course => {
        const courseCard = createCourseCard(course);
        coursesGrid.appendChild(courseCard);
    });

    coursesGrid.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('click', () => showLessonPage(card.dataset.courseId));
    });
}

function createCourseCard(course) {
    const totalLessons = course.lessons ? course.lessons.length : 0;
    const totalQuizzes = course.quizzes ? course.quizzes.length : 0;
    const courseProgress = userProgressData[course.id];
    const actualProgress = courseProgress ? courseProgress.percentage : 0;
    
    const userTier = user.subscriptionTier || 'free';
    const isEnrolled = actualProgress > 0;
    const courseIsLocked = course.locked !== false;
    const enrollmentCount = Object.keys(userProgressData).length;
    const canEnrollFree = enrollmentCount < 3;

    let tierBadge = '';
    if (userTier === 'pro') {
        tierBadge = '<span class="text-xs font-bold px-3 py-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white rounded-full shadow-lg">PRO ACCESS</span>';
    } else if (isEnrolled) {
        tierBadge = '<span class="text-xs font-bold px-3 py-1 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full">ENROLLED</span>';
    } else if (courseIsLocked) {
        tierBadge = '<span class="text-xs font-bold px-3 py-1 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full flex items-center gap-1"><i class="fas fa-crown text-xs"></i> PRO ONLY</span>';
    } else if (!courseIsLocked) {
        if (canEnrollFree) {
            tierBadge = '<span class="text-xs font-bold px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full">FREE TIER</span>';
        } else {
            tierBadge = '<span class="text-xs font-bold px-3 py-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-full flex items-center gap-1"><i class="fas fa-lock text-xs"></i> LIMIT REACHED</span>';
        }
    }

    const progressColor = actualProgress === 100 ? 'green' : actualProgress >= 50 ? 'blue' : actualProgress > 0 ? 'yellow' : 'gray';
    const bgColor = progressColor === 'green' ? 'bg-green-600' : progressColor === 'blue' ? 'bg-blue-600' : progressColor === 'yellow' ? 'bg-yellow-600' : 'bg-gray-600';

    const iconMap = {
        'Development': 'fa-code',
        'Design': 'fa-paint-brush',
        'Data Science': 'fa-chart-bar',
        'Marketing': 'fa-bullhorn',
        'Business': 'fa-chart-line',
        'AI & ML': 'fa-brain',
        'Beginner': 'fa-code',
        'Intermediate': 'fa-database',
        'Advanced': 'fa-microchip'
    };
    const iconClass = iconMap[course.category || course.level] || 'fa-graduation-cap';
    const descriptionText = course.description || 'No description provided.';

    // Build content count text
    let contentCountText = '';
    if (totalLessons > 0 && totalQuizzes > 0) {
        contentCountText = `${totalLessons} lesson${totalLessons !== 1 ? 's' : ''} and ${totalQuizzes} quiz${totalQuizzes !== 1 ? 'zes' : ''}`;
    } else if (totalLessons > 0) {
        contentCountText = `${totalLessons} lesson${totalLessons !== 1 ? 's' : ''}`;
    } else if (totalQuizzes > 0) {
        contentCountText = `${totalQuizzes} quiz${totalQuizzes !== 1 ? 'zes' : ''}`;
    } else {
        contentCountText = 'No content yet';
    }

    const courseCard = document.createElement('div');
    courseCard.className = 'course-card bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 cursor-pointer flex flex-col';
    courseCard.dataset.courseId = course.id;

    courseCard.innerHTML = `
        <div class="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-700">
            ${(course.imageUrl || course.thumbnail) && (course.imageUrl || course.thumbnail).trim() !== '' ?
                `<img src="${escapeHtml(course.imageUrl || course.thumbnail)}" alt="${escapeHtml(course.title)}" class="w-full h-full object-cover" loading="lazy" decoding="async">
                 <div class="absolute inset-0 bg-black bg-opacity-10 hover:bg-opacity-20 transition-all duration-300"></div>` :
                `<div class="${bgColor} w-full h-full flex items-center justify-center">
                    <i class="fas ${iconClass} text-white text-6xl opacity-80"></i>
                </div>`
            }
        </div>
        <div class="p-5 flex-grow flex flex-col">
            <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">${escapeHtml(course.title)}</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-3 two-line-ellipsis">${escapeHtml(descriptionText)}</p>

            ${course.teacher ? `
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-2">
                        ${course.teacher.avatarUrl ?
                            `<img src="${escapeHtml(course.teacher.avatarUrl)}" alt="${escapeHtml(course.teacher.name)}" class="h-7 w-7 rounded-full object-cover">` :
                            `<div class="h-7 w-7 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                                ${course.teacher.name ? escapeHtml(course.teacher.name.charAt(0).toUpperCase()) : 'T'}
                            </div>`
                        }
                        <span class="text-sm text-gray-600 dark:text-gray-400">${escapeHtml(course.teacher.name || 'Instructor')}</span>
                    </div>
                    ${tierBadge}
                </div>
            ` : course.instructor ? `
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-2">
                        <div class="h-7 w-7 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-semibold">
                            ${escapeHtml(course.instructor.charAt(0).toUpperCase())}
                        </div>
                        <span class="text-sm text-gray-600 dark:text-gray-400">${escapeHtml(course.instructor)}</span>
                    </div>
                    ${tierBadge}
                </div>
            ` : `<div class="flex justify-end mb-3">${tierBadge}</div>`}

            <div class="mt-auto border-t pt-3">
                <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-600 dark:text-gray-400">Progress</span>
                    <span class="text-${progressColor}-600 font-medium">${actualProgress}%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="h-full progress-fill-${progressColor}" style="width: ${actualProgress}%"></div>
                </div>
            </div>
        </div>
    `;

    return courseCard;
}

function renderPopularCourses() {
    const popularGrid = document.getElementById('popular-courses-grid');
    if (!popularGrid || allCoursesData.length === 0) return;

    const popular = [...allCoursesData]
        .sort((a, b) => (b.enrollments || 0) - (a.enrollments || 0))
        .slice(0, 4);

    popularGrid.innerHTML = popular.map(course => createCompactCourseCard(course)).join('');
}

function renderTrendingCourses() {
    const trendingGrid = document.getElementById('trending-courses-grid');
    if (!trendingGrid || allCoursesData.length === 0) return;

    const trending = [...allCoursesData]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 4);

    trendingGrid.innerHTML = trending.map(course => createCompactCourseCard(course)).join('');
}

function createCompactCourseCard(course) {
    const totalLessons = course.lessons ? course.lessons.length : 0;
    const courseProgress = userProgressData[course.id];
    const actualProgress = courseProgress ? courseProgress.percentage : 0;
    const instructorName = course.teacher?.name || course.instructor || 'Expert Instructor';
    const courseImage = course.imageUrl || course.thumbnail || '';

    const iconMap = {
        'Development': 'fa-code',
        'Design': 'fa-paint-brush',
        'Data Science': 'fa-chart-bar',
        'Marketing': 'fa-bullhorn',
        'Business': 'fa-chart-line',
        'AI & ML': 'fa-brain'
    };
    const iconClass = iconMap[course.category] || 'fa-graduation-cap';

    return `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
             onclick="loadCourseDetails('${course.id}')">
            <div class="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                ${courseImage && courseImage.trim() !== '' ?
                    `<img src="${escapeHtml(courseImage)}" alt="${escapeHtml(course.title)}" class="w-full h-full object-cover">` :
                    `<div class="bg-gradient-to-br from-blue-500 to-blue-600 w-full h-full flex items-center justify-center">
                        <i class="fas ${iconClass} text-white text-5xl opacity-80"></i>
                    </div>`
                }
                ${actualProgress > 0 ?
                    `<div class="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                        ${actualProgress}%
                    </div>` : ''
                }
            </div>
            <div class="p-4">
                <h3 class="font-bold text-base mb-2 text-gray-800 dark:text-gray-200 line-clamp-2">${escapeHtml(course.title)}</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <i class="fas fa-user-tie mr-1"></i>${escapeHtml(instructorName)}
                </p>
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span><i class="fas fa-book mr-1"></i>${totalLessons} lessons</span>
                    <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                        ${escapeHtml(course.category || 'General')}
                    </span>
                </div>
                <div class="flex items-center text-sm text-gray-500 mt-2">
                    <i class="fas fa-star text-yellow-400 mr-1"></i>
                    <span>4.7</span>
                </div>
            </div>
        </div>
    `;
}

// ==================== NAVIGATION ====================
function showPage(pageName) {
    const coursesPage = document.getElementById('courses-page');
    const lessonPage = document.getElementById('lesson-page');

    coursesPage.classList.toggle('hidden', pageName !== 'courses');
    lessonPage.classList.toggle('hidden', pageName !== 'lesson');
}

window.loadCourseDetails = function (courseId) {
    showLessonPage(courseId);
};

// ==================== AUTO-ENROLLMENT ====================
async function autoEnrollUser(courseId) {
    try {
        // Check if already enrolled
        const checkResponse = await fetchWithAuth(`/api/users/${user.id}/progress`);
        if (checkResponse.ok) {
            const progressData = await checkResponse.json();
            const isEnrolled = progressData.some(progress => progress.courseId === courseId);
            if (isEnrolled) return;
        }

        // Create enrollment using the new endpoint
        const enrollResponse = await fetchWithAuth(`/api/courses/${courseId}/enroll`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id
            })
        });

        if (!enrollResponse.ok) {
            console.warn('Auto-enrollment failed, but continuing with course access');
        } else {
            console.log('User auto-enrolled in course:', courseId);
            // Refresh progress data
            await fetchAllCourses();
        }
    } catch (error) {
        console.warn('Auto-enrollment error:', error);
    }
}

// ==================== LESSON PAGE ====================
async function showLessonPage(courseId, pushState = true) {
    showPage('lesson');
    const lessonPage = document.getElementById('lesson-page');
    lessonPage.innerHTML = `<div class="flex justify-center items-center h-64"><div class="loader"></div></div>`;

    if (pushState) {
        history.pushState({ page: 'lesson', courseId }, '', `#lesson/${courseId}`);
    }

    try {
        await autoEnrollUser(courseId);

        const response = await fetchWithAuth(`/api/courses/${courseId}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Course with ID ${courseId} not found`);
            }
            throw new Error('Failed to fetch course details.');
        }
        const responseData = await response.json();
        const courseDetails = responseData.data || responseData;
        await renderLessonPage(courseDetails);
    } catch (error) {
        console.error('showLessonPage error:', error);
        lessonPage.innerHTML = `<p class="text-center text-red-500">${error.message}</p>`;
        throw error;
    }
}

async function showQuizDirectly(quizId, courseId) {
    console.log('showQuizDirectly called with:', { quizId, courseId });

    try {
        await showLessonPage(courseId, false);

        setTimeout(() => {
            const quizCard = document.querySelector(`[data-id="${quizId}"][data-type="quiz"]`);
            if (quizCard) {
                quizCard.click();
                console.log('Auto-clicked quiz:', quizId);
            } else {
                console.error('Quiz card not found:', quizId);
                throw new Error(`Quiz ${quizId} not found in course ${courseId}`);
            }
        }, 1000);
    } catch (error) {
        console.error('Error in showQuizDirectly:', error);
        throw error;
    }
}

// This file continues in the next part due to size...
