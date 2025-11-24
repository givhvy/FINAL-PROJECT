/**
 * Auth Success Page JavaScript
 * Handles OAuth authentication success
 */

// Extract token and user data from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const userStr = urlParams.get('user');

if (token && userStr) {
    try {
        const user = JSON.parse(decodeURIComponent(userStr));
        
        // Save to localStorage
        storeAuthData(token, user);
        
        console.log('OAuth login successful, user:', user);
        
        // Redirect to courses page after a brief delay
        setTimeout(() => {
            window.location.href = '/courses';
        }, 1000);
    } catch (error) {
        console.error('Error parsing user data:', error);
        window.location.href = '/login?error=invalid_data';
    }
} else {
    console.error('No token or user data found');
    window.location.href = '/login?error=missing_data';
}
