/**
 * Success Page JavaScript
 * Handles payment success verification and order creation
 */

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    const sessionIdElement = document.getElementById('session-id');
    
    if (!sessionId) {
        if (sessionIdElement) {
            sessionIdElement.textContent = 'Session ID not found.';
        }
        return;
    }
    
    if (sessionIdElement) {
        sessionIdElement.textContent = sessionId;
    }
    
    await verifyPaymentAndCreateOrder(sessionId);
});

/**
 * Verify payment and create order
 * @param {string} sessionId - Stripe session ID
 */
async function verifyPaymentAndCreateOrder(sessionId) {
    try {
        const response = await fetch('/api/payments/verify-and-create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId: sessionId })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Order created successfully:', data);
            
            // Clear the cart after successful payment
            clearCart();
            
            // Update user data if tier was upgraded
            await updateUserData();
        } else {
            console.error('Error creating order:', data.error);
            // Don't show error to user, order might already exist
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        // Don't show error to user, they still completed payment
    }
}

/**
 * Update user data after successful payment
 */
async function updateUserData() {
    const user = getStoredUser();
    const token = getAuthToken();
    
    if (!user || !token) return;
    
    try {
        console.log('🔄 Fetching updated user data after payment...');
        const userResponse = await fetch(`/api/users/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (userResponse.ok) {
            const updatedUser = await userResponse.json();
            console.log('✅ Updated user data received:', updatedUser);
            console.log('📅 Subscription details:');
            console.log('  - Tier:', updatedUser.subscriptionTier);
            console.log('  - Plan:', updatedUser.subscriptionPlan);
            console.log('  - Start:', updatedUser.subscriptionStartDate);
            console.log('  - End:', updatedUser.subscriptionEndDate);
            
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('💾 User data saved to localStorage');
            
            // Refresh header UI to show Pro badge immediately
            if (typeof window.refreshUserSubscription === 'function') {
                await window.refreshUserSubscription();
                console.log('✅ Pro badge refreshed successfully');
            }
        }
    } catch (error) {
        console.error('❌ Error updating user data:', error);
    }
}
