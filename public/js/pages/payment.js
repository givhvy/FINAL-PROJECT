/**
 * Payment Page JavaScript
 * Handles subscription plans display, student verification, and Stripe checkout
 */

// ==================== GLOBAL VARIABLES ====================
let user = null;
let token = null;
let selectedBilling = 'monthly'; // 'monthly' or 'yearly'
let plans = [];
let proPlan = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    user = checkAuth();
    if (!user) return;
    
    token = localStorage.getItem('token');
    
    // Setup event listeners
    setupEventListeners();
    
    // Fetch and render plans
    await fetchSubscriptionPlan();
    renderPlans();
});

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Student verification form
    const studentForm = document.getElementById('student-verification-form');
    if (studentForm) {
        studentForm.addEventListener('submit', handleStudentVerification);
    }
}

// ==================== STUDENT VERIFICATION ====================
function isEducationalEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.(edu|ac\.[a-z]{2}|edu\.[a-z]{2})$/i;
    return emailPattern.test(email);
}

async function handleStudentVerification(e) {
    e.preventDefault();
    const studentEmailInput = document.getElementById('student-email');
    const verificationResult = document.getElementById('verification-result');
    const verifyBtn = document.getElementById('verify-student-btn');
    const email = studentEmailInput.value.trim();
    
    // Validate email format
    if (!isEducationalEmail(email)) {
        showVerificationError(verificationResult, 'Please enter a valid educational email address (.edu or .ac domain)');
        return;
    }
    
    // Show loading state
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Verifying...';
    verificationResult.classList.add('hidden');
    
    try {
        const response = await fetchWithAuth('/api/users/verify-student', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: user.id,
                student_email: email
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showVerificationSuccess(verificationResult, email);
            updateUserToProTier(email);
            hideStudentForm();
        } else {
            showVerificationError(verificationResult, data.error || 'Verification failed. Please try again.');
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Verify Student Status';
        }
    } catch (error) {
        console.error('Verification error:', error);
        showVerificationError(verificationResult, 'An error occurred. Please try again later.');
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Verify Student Status';
    }
}

function showVerificationSuccess(container, email) {
    container.className = 'mt-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg';
    container.innerHTML = `
        <div class="flex items-start text-green-700 dark:text-green-300">
            <i class="fas fa-check-circle mr-3 mt-1"></i>
            <div>
                <p class="font-semibold">Congratulations! 🎉</p>
                <p class="text-sm mt-1">Your student status has been verified with ${escapeHtml(email)}</p>
                <p class="text-sm mt-1">You now have full Pro access for free! Enjoy all premium features.</p>
            </div>
        </div>
    `;
    container.classList.remove('hidden');
}

function showVerificationError(container, message) {
    container.className = 'mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg';
    container.innerHTML = `
        <div class="flex items-center text-red-700 dark:text-red-300">
            <i class="fas fa-times-circle mr-2"></i>
            <span>${escapeHtml(message)}</span>
        </div>
    `;
    container.classList.remove('hidden');
}

function updateUserToProTier(email) {
    // Update user in localStorage with Pro tier
    user.isStudent = true;
    user.studentEmail = email;
    user.subscriptionTier = 'pro';
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update subscription badge in header
    const tierBadge = document.getElementById('user-tier-badge');
    if (tierBadge) {
        tierBadge.innerHTML = `
            <span class="px-3 py-1 text-xs font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white rounded-full flex items-center gap-1 shadow-lg">
                <i class="fas fa-crown"></i> PRO
            </span>
        `;
    }
}

function hideStudentForm() {
    // Hide plans section after verification
    setTimeout(() => {
        const plansContainer = document.getElementById('plans-container');
        if (plansContainer) {
            plansContainer.style.display = 'none';
        }
    }, 2000);
}

// ==================== FETCH SUBSCRIPTION PLANS ====================
async function fetchSubscriptionPlan() {
    try {
        const response = await fetchWithAuth('/api/subscriptions?active=true');
        if (!response.ok) throw new Error('Failed to fetch plans');
        
        plans = await response.json();
        
        // Get the first paid plan for savings calculation
        proPlan = plans.find(p => (p.monthlyPrice || p.monthly_price || 0) > 0) || plans[0];
        
        return plans;
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        plans = [];
        return [];
    }
}

// ==================== CALCULATIONS ====================
function calculateSavings(monthlyPrice, annualPrice) {
    const yearlyIfMonthly = monthlyPrice * 12;
    const savings = yearlyIfMonthly - annualPrice;
    const savingsPercent = Math.round((savings / yearlyIfMonthly) * 100);
    return { savings, savingsPercent };
}

// ==================== RENDER PLANS ====================
function renderPlans() {
    const plansContainer = document.getElementById('plans-container');
    
    if (!plansContainer) return;
    
    if (!plans || plans.length === 0) {
        plansContainer.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-circle text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-500 dark:text-gray-400">No subscription plans available.</p>
                <p class="text-sm text-gray-400 mt-2">Please contact admin to set up subscription plans.</p>
            </div>
        `;
        return;
    }
    
    const monthlyPrice = proPlan.monthlyPrice || proPlan.monthly_price || 0;
    const annualPrice = proPlan.annualPrice || proPlan.annual_price || 0;
    const features = proPlan.features || [];
    const { savings, savingsPercent } = calculateSavings(monthlyPrice, annualPrice);
    const monthlyFromAnnual = (annualPrice / 12).toFixed(2);
    
    const currentPrice = selectedBilling === 'monthly' ? monthlyPrice : annualPrice;
    const billingPeriod = selectedBilling === 'monthly' ? '/month' : '/year';
    const annualSavingsBadge = selectedBilling === 'yearly' 
        ? `<span class="badge bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">Save ${savingsPercent}%</span>` 
        : '';
    
    // Billing Toggle
    const billingToggle = `
        <div class="flex justify-center items-center gap-4 mb-12">
            <button id="toggle-monthly" class="px-6 py-3 rounded-lg font-medium transition-all ${selectedBilling === 'monthly' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}">
                Monthly
            </button>
            <button id="toggle-yearly" class="px-6 py-3 rounded-lg font-medium transition-all ${selectedBilling === 'yearly' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} relative">
                Yearly
                ${selectedBilling === 'monthly' ? `<span class="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">Save ${savingsPercent}%</span>` : ''}
            </button>
        </div>
    `;
    
    // Generate plan cards HTML
    const allPlansHTML = plans.map(plan => createPlanCard(plan)).join('');
    const gridCols = plans.length === 1 ? 'max-w-md' : plans.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl';
    
    plansContainer.innerHTML = `
        ${billingToggle}
        <div class="grid ${gridCols} gap-8 mx-auto">
            ${allPlansHTML}
        </div>
    `;
    
    // Attach toggle event listeners
    document.getElementById('toggle-monthly')?.addEventListener('click', () => {
        selectedBilling = 'monthly';
        renderPlans();
    });
    
    document.getElementById('toggle-yearly')?.addEventListener('click', () => {
        selectedBilling = 'yearly';
        renderPlans();
    });
    
    // Attach select plan button listeners
    document.querySelectorAll('.select-plan-btn').forEach(btn => {
        btn.addEventListener('click', handlePlanSelection);
    });
}

function createPlanCard(plan) {
    const monthlyPrice = plan.monthlyPrice || plan.monthly_price || 0;
    const annualPrice = plan.annualPrice || plan.annual_price || 0;
    const features = plan.features || [];
    const planName = plan.name || 'Pro Plan';
    const isPaid = monthlyPrice > 0;
    
    const displayPrice = selectedBilling === 'monthly' ? monthlyPrice : annualPrice;
    const billingText = selectedBilling === 'monthly' ? 'per month' : 'per year';
    const monthlyEquivalent = selectedBilling === 'yearly' ? `$${(annualPrice / 12).toFixed(2)}/month` : '';
    
    const { savings, savingsPercent } = calculateSavings(monthlyPrice, annualPrice);
    const savingsBadge = selectedBilling === 'yearly' && isPaid
        ? `<span class="badge bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">Save ${savingsPercent}%</span>`
        : '';
    
    return `
        <div class="plan-card relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 ${isPaid ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'}">
            ${savingsBadge}
            <div class="text-center mb-6">
                <div class="inline-flex items-center justify-center w-16 h-16 ${isPaid ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gray-200 dark:bg-gray-700'} rounded-full mb-4">
                    <i class="fas ${isPaid ? 'fa-crown' : 'fa-user'} text-white text-2xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">${escapeHtml(planName)}</h3>
                <div class="flex items-baseline justify-center gap-1">
                    <span class="text-5xl font-bold ${isPaid ? 'text-blue-600' : 'text-gray-600'}">${formatCurrency(displayPrice)}</span>
                    <span class="text-gray-600 dark:text-gray-400">${billingText}</span>
                </div>
                ${monthlyEquivalent ? `<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">${monthlyEquivalent} billed annually</p>` : ''}
            </div>
            
            <ul class="space-y-3 mb-8">
                ${features.map(feature => `
                    <li class="flex items-start">
                        <i class="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                        <span class="text-gray-700 dark:text-gray-300">${escapeHtml(feature)}</span>
                    </li>
                `).join('')}
            </ul>
            
            <button class="select-plan-btn w-full ${isPaid ? 'bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700' : 'bg-gray-300 dark:bg-gray-700'} text-white font-medium py-3 px-6 rounded-lg transition-all shadow-md"
                data-plan-id="${plan.id}"
                data-plan-name="${escapeHtml(planName)}"
                data-plan-price="${displayPrice}"
                data-billing="${selectedBilling}">
                ${isPaid ? `Get ${escapeHtml(planName)}` : 'Current Plan'}
            </button>
        </div>
    `;
}

// ==================== PLAN SELECTION & CHECKOUT ====================
async function handlePlanSelection(e) {
    const button = e.target.closest('.select-plan-btn');
    if (!button) return;
    
    const planId = button.dataset.planId;
    const planName = button.dataset.planName;
    const planPrice = parseFloat(button.dataset.planPrice);
    const billing = button.dataset.billing;
    
    // Save plan to localStorage for cart recovery
    const plan = {
        id: planId,
        name: planName,
        price: planPrice.toFixed(2),
        billing: billing,
        icon: 'crown',
        category: 'Subscription'
    };
    localStorage.setItem('selectedPlan', JSON.stringify(plan));
    
    // Show loading state
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
    
    try {
        // Save to cart first for recovery
        addPlanToCart(plan);
        
        // Create Stripe checkout session
        await createCheckoutSession(planId, planName, planPrice);
        
    } catch (error) {
        console.error('Payment Error:', error);
        showToast(`Payment Initialization Failed: ${error.message}`, 'error');
        button.disabled = false;
        button.innerHTML = `Get ${planName}`;
    }
}

function addPlanToCart(plan) {
    let cart = loadCart();
    
    // Check if plan already in cart
    const existsInCart = cart.some(item => item.id === plan.id);
    if (!existsInCart) {
        cart.push(plan);
        saveCart(cart);
    }
}

async function createCheckoutSession(planId, planName, planPrice) {
    const successUrl = `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${window.location.origin}/cart`;
    
    const response = await fetchWithAuth('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            courseId: planId,
            courseName: planName,
            price: planPrice,
            userId: user.id,
            successUrl: successUrl,
            cancelUrl: cancelUrl
        })
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.url) {
        throw new Error(data.message || 'Failed to initialize payment gateway.');
    }
    
    // Redirect to Stripe Checkout
    window.location.href = data.url;
}
