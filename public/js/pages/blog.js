/**
 * Blog Page JavaScript
 * Handles blog article listing, filtering, search, and single article view
 */

// ==================== GLOBAL VARIABLES ====================
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

let articles = [];
let staticArticles = [];
let currentArticles = [];
let currentCategory = 'all';
let articlesPerPage = 6;
let currentPage = 1;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', initBlog);

// ==================== BLOG INITIALIZATION ====================
async function initBlog() {
    await loadBlogPosts();
    setupEventListeners();
    renderArticles();
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Category filtering
    const categoryButtons = document.querySelectorAll('.category-button');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => filterByCategory(btn.dataset.category));
    });

    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }

    // Logout buttons
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/login';
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

// ==================== LOAD BLOG POSTS ====================
async function loadBlogPosts() {
    try {
        const apiUrl = (window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin) + '/api/blog?status=published&limit=20';
        const response = await fetch(apiUrl);
        
        console.log('Blog API response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Blog API data:', data);

            const posts = data.data?.posts || data.posts || data || [];

            if (Array.isArray(posts) && posts.length > 0) {
                articles = posts.map(post => ({
                    id: post.id,
                    title: post.title,
                    author: post.author_name || post.authorName || 'UniLearn Team',
                    date: formatDate(post.published_at || post.publishedAt || post.created_at || post.createdAt),
                    category: post.category || 'Technology',
                    excerpt: post.excerpt || post.summary || truncateText(post.content, 150),
                    content: post.content || '',
                    imageUrl: post.featured_image || post.featuredImage || post.image_url || post.imageUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
                    readTime: calculateReadTime(post.content)
                }));

                currentArticles = [...articles];
                console.log(`Loaded ${articles.length} blog posts successfully`);
            } else {
                console.warn('No blog posts found in API response');
                articles = [];
                currentArticles = [];
            }
        } else {
            console.error('Failed to fetch blog posts:', response.status);
            articles = [];
            currentArticles = [];
        }
    } catch (error) {
        console.error('Error loading blog posts:', error);
        articles = [];
        currentArticles = [];
    }
}

// ==================== RENDER ARTICLES ====================
function renderArticles() {
    const container = document.getElementById('articlesGrid');
    if (!container) {
        console.error('articlesGrid container not found');
        return;
    }

    if (currentArticles.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-20">
                <i class="fas fa-file-alt text-6xl text-gray-300 mb-4"></i>
                <p class="text-xl text-gray-500">No articles found</p>
                <p class="text-gray-400 mt-2">Check back later for new content!</p>
            </div>
        `;
        return;
    }

    const startIdx = (currentPage - 1) * articlesPerPage;
    const endIdx = startIdx + articlesPerPage;
    const articlesToShow = currentArticles.slice(startIdx, endIdx);

    container.innerHTML = '';
    articlesToShow.forEach(article => {
        const articleCard = document.createElement('div');
        articleCard.className = 'card-hover bg-white rounded-xl overflow-hidden shadow-lg fade-in-up';
        articleCard.onclick = () => showArticle(article.id);
        articleCard.innerHTML = `
            <div class="relative h-48 overflow-hidden">
                <img src="${article.imageUrl}" alt="${escapeHtml(article.title)}" class="w-full h-full object-cover">
                <div class="absolute top-4 left-4">
                    <span class="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        ${escapeHtml(article.category)}
                    </span>
                </div>
            </div>
            <div class="p-6">
                <h3 class="text-xl font-bold mb-3 text-gray-800 line-clamp-2">${escapeHtml(article.title)}</h3>
                <p class="text-gray-600 mb-4 line-clamp-3">${escapeHtml(article.excerpt)}</p>
                <div class="flex items-center justify-between text-sm text-gray-500">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-user-circle"></i>
                        <span>${escapeHtml(article.author)}</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <span><i class="far fa-clock mr-1"></i>${article.readTime} min read</span>
                        <span>${article.date}</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(articleCard);
    });

    renderPagination();
}

// ==================== PAGINATION ====================
function renderPagination() {
    const container = document.getElementById('pagination-container');
    if (!container) return;

    const totalPages = Math.ceil(currentArticles.length / articlesPerPage);

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `px-4 py-2 rounded-lg transition ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`;
        btn.textContent = i;
        btn.onclick = () => {
            currentPage = i;
            renderArticles();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        container.appendChild(btn);
    }
}

// ==================== CATEGORY FILTERING ====================
function filterByCategory(category) {
    currentCategory = category;
    currentPage = 1;

    if (category === 'all') {
        currentArticles = [...articles];
    } else {
        currentArticles = articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }

    document.querySelectorAll('.category-button').forEach(btn => {
        if (btn.dataset.category === category) {
            btn.classList.add('category-active');
        } else {
            btn.classList.remove('category-active');
        }
    });

    renderArticles();
}

// ==================== SEARCH ====================
function handleSearch(query) {
    currentPage = 1;
    const searchTerm = query.toLowerCase().trim();

    if (searchTerm === '') {
        currentArticles = [...articles];
    } else {
        currentArticles = articles.filter(a => 
            a.title.toLowerCase().includes(searchTerm) ||
            a.excerpt.toLowerCase().includes(searchTerm) ||
            a.author.toLowerCase().includes(searchTerm) ||
            a.category.toLowerCase().includes(searchTerm)
        );
    }

    renderArticles();
}

// ==================== SINGLE ARTICLE VIEW ====================
window.showArticle = function(articleId) {
    const article = articles.find(a => a.id === articleId);
    if (!article) {
        console.error('Article not found:', articleId);
        return;
    }

    const listView = document.getElementById('blogList');
    const articleView = document.getElementById('singleArticle');
    const articleContent = document.getElementById('articleContent');
    
    if (listView) listView.classList.add('hidden');
    if (articleView) articleView.classList.remove('hidden');

    if (articleContent) {
        articleContent.innerHTML = `
            <div class="mb-8">
                <span class="inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold mb-4">
                    ${escapeHtml(article.categoryName || article.category)}
                </span>
                <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">${escapeHtml(article.title)}</h1>
                <div class="flex items-center text-gray-600 dark:text-gray-400 space-x-4">
                    <div class="flex items-center">
                        <i class="fas fa-user-circle mr-2"></i>
                        <span>${escapeHtml(article.author)}</span>
                    </div>
                    <span>•</span>
                    <div class="flex items-center">
                        <i class="far fa-clock mr-2"></i>
                        <span>${article.readTime}</span>
                    </div>
                    <span>•</span>
                    <span>${article.date}</span>
                </div>
            </div>
            ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${escapeHtml(article.title)}" class="w-full h-96 object-cover rounded-xl mb-8">` : ''}
            <div class="prose prose-lg dark:prose-invert max-w-none">
                ${formatArticleContent(article.content)}
            </div>
        `;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.showBlogList = function() {
    const listView = document.getElementById('blogList');
    const articleView = document.getElementById('singleArticle');
    
    if (listView) listView.classList.remove('hidden');
    if (articleView) articleView.classList.add('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ==================== HELPER FUNCTIONS ====================
function formatDate(dateString) {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function calculateReadTime(content) {
    if (!content) return 5;
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return readTime || 5;
}

function truncateText(text, maxLength) {
    if (!text) return 'Read more to discover interesting insights...';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

function formatArticleContent(content) {
    if (!content) return '<p>Content not available.</p>';
    
    let formatted = content
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');

    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return formatted;
}
