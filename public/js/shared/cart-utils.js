/**
 * Cart Utilities
 * Shared shopping cart functions
 */

/**
 * Load cart from localStorage
 * @returns {Array} Array of cart items
 */
function loadCart() {
    const cartData = localStorage.getItem('cart');
    if (!cartData) return [];
    
    try {
        return JSON.parse(cartData);
    } catch (error) {
        console.error('Error loading cart:', error);
        return [];
    }
}

/**
 * Save cart to localStorage
 * @param {Array} cart - Array of cart items
 */
function saveCart(cart) {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

/**
 * Add item to cart
 * @param {Object} item - Item to add to cart
 * @param {string} item.id - Item ID
 * @param {string} item.title - Item title
 * @param {number} item.price - Item price
 * @param {string} item.image - Item image URL (optional)
 * @returns {boolean} True if added successfully
 */
function addToCart(item) {
    const cart = loadCart();
    
    // Check if item already exists in cart
    const existingIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingIndex !== -1) {
        showToast('Item already in cart', 'info');
        return false;
    }
    
    cart.push({
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image || '',
        addedAt: new Date().toISOString(),
    });
    
    saveCart(cart);
    showToast('Added to cart', 'success');
    return true;
}

/**
 * Remove item from cart
 * @param {string} itemId - ID of item to remove
 */
function removeFromCart(itemId) {
    const cart = loadCart();
    const filteredCart = cart.filter(item => item.id !== itemId);
    saveCart(filteredCart);
    showToast('Removed from cart', 'success');
}

/**
 * Clear entire cart
 */
function clearCart() {
    localStorage.removeItem('cart');
    updateCartCount();
}

/**
 * Get cart item count
 * @returns {number} Number of items in cart
 */
function getCartCount() {
    const cart = loadCart();
    return cart.length;
}

/**
 * Update cart count badge in UI
 * @param {string} badgeId - ID of cart badge element (default: 'cart-count')
 */
function updateCartCount(badgeId = 'cart-count') {
    const badge = document.getElementById(badgeId);
    if (!badge) return;
    
    const count = getCartCount();
    badge.textContent = count;
    
    if (count > 0) {
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

/**
 * Calculate cart total
 * @returns {number} Total price of all items in cart
 */
function getCartTotal() {
    const cart = loadCart();
    return cart.reduce((total, item) => total + (item.price || 0), 0);
}

/**
 * Check if item is in cart
 * @param {string} itemId - ID of item to check
 * @returns {boolean} True if item is in cart
 */
function isInCart(itemId) {
    const cart = loadCart();
    return cart.some(item => item.id === itemId);
}

/**
 * Update cart button state
 * @param {string} buttonId - ID of add to cart button
 * @param {string} itemId - ID of item
 */
function updateCartButton(buttonId, itemId) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    if (isInCart(itemId)) {
        button.textContent = 'In Cart';
        button.classList.add('opacity-50', 'cursor-not-allowed');
        button.disabled = true;
    } else {
        button.textContent = 'Add to Cart';
        button.classList.remove('opacity-50', 'cursor-not-allowed');
        button.disabled = false;
    }
}

/**
 * Render cart items in a container
 * @param {string} containerId - ID of container element
 * @param {Object} options - Rendering options
 * @param {Function} options.onRemove - Callback when item is removed
 * @param {boolean} options.showTotal - Show total price (default: true)
 */
function renderCart(containerId, options = {}) {
    const { onRemove, showTotal = true } = options;
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const cart = loadCart();
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-shopping-cart text-gray-400 text-5xl mb-4"></i>
                <p class="text-gray-600 dark:text-gray-400">Your cart is empty</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="space-y-4">';
    
    cart.forEach(item => {
        html += `
            <div class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div class="flex items-center space-x-4">
                    ${item.image ? `
                        <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-cover rounded">
                    ` : ''}
                    <div>
                        <h4 class="font-semibold text-gray-900 dark:text-white">${item.title}</h4>
                        <p class="text-blue-600 dark:text-blue-400 font-medium">$${item.price.toFixed(2)}</p>
                    </div>
                </div>
                <button 
                    onclick="handleRemoveFromCart('${item.id}')" 
                    class="text-red-500 hover:text-red-700 transition-colors"
                >
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    
    if (showTotal) {
        const total = getCartTotal();
        html += `
            <div class="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div class="flex justify-between items-center">
                    <span class="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span class="text-2xl font-bold text-blue-600 dark:text-blue-400">$${total.toFixed(2)}</span>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // Setup remove handlers
    if (onRemove) {
        window.handleRemoveFromCart = (itemId) => {
            removeFromCart(itemId);
            renderCart(containerId, options);
            onRemove(itemId);
        };
    } else {
        window.handleRemoveFromCart = (itemId) => {
            removeFromCart(itemId);
            renderCart(containerId, options);
        };
    }
}

/**
 * Setup add to cart button
 * @param {string} buttonId - ID of button element
 * @param {Object} item - Item data
 */
function setupAddToCartButton(buttonId, item) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    // Update initial state
    updateCartButton(buttonId, item.id);
    
    // Add click handler
    button.addEventListener('click', (e) => {
        e.preventDefault();
        if (isInCart(item.id)) return;
        
        addToCart(item);
        updateCartButton(buttonId, item.id);
    });
}

/**
 * Initialize cart on page load
 */
function initCart() {
    updateCartCount();
}

// Auto-initialize cart when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
} else {
    initCart();
}
