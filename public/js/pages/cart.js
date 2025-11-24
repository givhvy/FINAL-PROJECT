/**
 * Cart Page JavaScript
 * Handles shopping cart display, item management, and checkout
 */

// ==================== GLOBAL VARIABLES ====================
let cart = [];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    renderCart();
    setupEventListeners();
});

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
}

// ==================== CART MANAGEMENT ====================
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (error) {
            console.error('Error parsing cart:', error);
            cart = [];
        }
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const emptyCart = document.getElementById('empty-cart');
    const cartItems = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (!container) return;
    
    if (cart.length === 0) {
        if (emptyCart) emptyCart.classList.remove('hidden');
        if (cartItems) cartItems.classList.add('hidden');
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }
    
    if (emptyCart) emptyCart.classList.add('hidden');
    if (cartItems) cartItems.classList.remove('hidden');
    if (checkoutBtn) checkoutBtn.disabled = false;
    
    container.innerHTML = cart.map((item, index) => createCartItemHTML(item, index)).join('');
    
    // Update cart count display
    const cartCountDisplay = document.getElementById('cart-count-display');
    if (cartCountDisplay) {
        cartCountDisplay.textContent = cart.length;
    }
    
    // Update header cart count
    const headerCartCount = document.getElementById('cart-count');
    if (headerCartCount) {
        headerCartCount.textContent = cart.length;
        if (cart.length > 0) {
            headerCartCount.classList.remove('hidden');
        }
    }
    
    // Attach remove button listeners
    document.querySelectorAll('.remove-item-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => removeFromCart(index));
    });
    
    updateSummary();
}

function createCartItemHTML(item, index) {
    const icon = item.icon || 'book';
    const category = item.category || 'Course';
    
    return `
        <div class="cart-item flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition">
            <div class="flex-shrink-0 w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <i class="fas fa-${escapeHtml(icon)} text-blue-600 dark:text-blue-400 text-2xl"></i>
            </div>
            <div class="flex-1">
                <h3 class="font-semibold text-gray-800 dark:text-gray-200">${escapeHtml(item.name)}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">${escapeHtml(category)}</p>
            </div>
            <div class="text-right">
                <p class="font-bold text-blue-600 dark:text-blue-400 text-xl">${formatCurrency(parseFloat(item.price))}</p>
                <button class="remove-item-btn text-red-500 hover:text-red-700 text-sm mt-1 transition" data-index="${index}">
                    <i class="fas fa-trash mr-1"></i>Remove
                </button>
            </div>
        </div>
    `;
}

function updateSummary() {
    const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);
    const total = subtotal;
    
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
    if (totalEl) totalEl.textContent = formatCurrency(total);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
    showToast('Item removed from cart', 'success');
}

// ==================== CHECKOUT ====================
async function handleCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }
    
    const checkoutBtn = document.getElementById('checkout-btn');
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
        showToast('Please login to checkout', 'error');
        setTimeout(() => {
            window.location.href = '/login';
        }, 1500);
        return;
    }
    
    // Disable button
    if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
    }
    
    try {
        const cartItem = cart[0];
        
        const response = await fetchWithAuth('/api/payments/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                courseId: cartItem.id,
                courseName: cartItem.name,
                price: parseFloat(cartItem.price),
                userId: user.id,
                successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `${window.location.origin}/cart`
            })
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.url) {
            throw new Error(data.message || 'Failed to initialize payment');
        }
        
        // Redirect to Stripe Checkout
        window.location.href = data.url;
        
    } catch (error) {
        console.error('Checkout error:', error);
        showToast('Checkout failed: ' + error.message, 'error');
        
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = '<i class="fas fa-lock mr-2"></i>Proceed to Checkout';
        }
    }
}
