/**
 * Signup Page JavaScript
 * Handles user registration with password strength validation
 */

// ==================== GLOBAL VARIABLES ====================
let passwordInput = null;
let passwordStrength = null;
let passwordFeedback = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    passwordInput = document.getElementById('password');
    passwordStrength = document.getElementById('passwordStrength');
    passwordFeedback = document.getElementById('passwordFeedback');
    
    // Setup event listeners
    setupEventListeners();
});

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Form submission
    const form = document.getElementById('signupForm');
    if (form) {
        form.addEventListener('submit', handleSignupSubmit);
    }
    
    // Password toggle visibility
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', togglePasswordVisibility);
    }
    
    // Password strength checker
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
    }
}

// ==================== PASSWORD VISIBILITY TOGGLE ====================
function togglePasswordVisibility() {
    if (!passwordInput) return;
    
    const currentType = passwordInput.getAttribute('type');
    const newType = currentType === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', newType);
}

// ==================== PASSWORD STRENGTH CHECKER ====================
function checkPasswordStrength() {
    if (!passwordInput || !passwordStrength || !passwordFeedback) return;
    
    const password = passwordInput.value;
    const strengthResult = calculatePasswordStrength(password);
    
    // Update visual indicators
    updatePasswordStrengthUI(strengthResult);
}

function calculatePasswordStrength(password) {
    let strength = 0;
    
    // Length check (8+ characters)
    if (password.length >= 8) strength += 25;
    
    // Lowercase letters
    if (/[a-z]/.test(password)) strength += 25;
    
    // Uppercase letters
    if (/[A-Z]/.test(password)) strength += 25;
    
    // Numbers or special characters
    if (/[0-9!@#$%^&*()]/.test(password)) strength += 25;
    
    // Determine color and feedback text // let để xài cho validate password dựa trên độ mạnh 
    let color = '#ef4444'; // red-500
    let feedback = 'Weak';
    
    if (strength > 75) {  // if strength > 75 is true
        color = '#059669'; // emerald-600
        feedback = 'Strong';
    } else if (strength > 50) {
        color = '#10b981'; // emerald-500
        feedback = 'Good';
    } else if (strength > 25) {
        color = '#f59e0b'; // amber-500
        feedback = 'Moderate';
    }
    
    return {
        strength: strength,
        color: color,
        feedback: feedback
    };
}

function updatePasswordStrengthUI(strengthResult) {
    if (!passwordStrength || !passwordFeedback) return;
    
    // Update progress bar
    passwordStrength.style.width = strengthResult.strength + '%';
    passwordStrength.style.backgroundColor = strengthResult.color;
    
    // Update feedback text
    passwordFeedback.textContent = `Password strength: ${strengthResult.feedback}`;
    passwordFeedback.style.color = strengthResult.color;
}

// ==================== FORM VALIDATION ====================
function validateSignupForm(firstName, lastName, email, password) {
    const errors = [];
    
    // Name validation
    if (!firstName || firstName.trim().length < 2) {
        errors.push('First name must be at least 2 characters');
    }
    
    if (!lastName || lastName.trim().length < 2) {
        errors.push('Last name must be at least 2 characters');
    }
    
    // Email validation
    if (!isValidEmail(email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Password validation
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// ==================== FORM SUBMISSION ====================
async function handleSignupSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    // Hide previous messages
    if (successMessage) successMessage.classList.add('hidden');
    if (errorMessage) errorMessage.classList.add('hidden');
    
    // Get form data
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Validate form data
    const validation = validateSignupForm(firstName, lastName, email, password);
    if (!validation.isValid) {
        showSignupError(validation.errors.join('. '));
        return;
    }
    
    // Combine first and last name
    const name = `${firstName} ${lastName}`; // merge lại cho dễ ở send registration và biến thành full name 
    
    // Disable submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';
    }
    
    try {
        // Send registration request
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                role: 'student'
            })
        });
        
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create account.');
            }
            
            // Show success and redirect
            showSignupSuccess();
            
            // Hide form
            form.classList.add('hidden');
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
            
        } catch (error) {
            console.error('Signup Error:', error);
            showSignupError(error.message);
            
            // Re-enable submit button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }
        }
    }

// ==================== UI FEEDBACK ====================
function showSignupSuccess() {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.classList.remove('hidden');
    }
}

function showSignupError(message) {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        const errorText = errorMessage.querySelector('p');
        if (errorText) {
            errorText.textContent = 'Signup failed: ' + message;
        }
        errorMessage.classList.remove('hidden');
    }
}

// ==================== UTILITY FUNCTIONS ====================
function getPasswordStrengthDescription(strength) {
    if (strength > 75) return 'Strong';
    if (strength > 50) return 'Good';
    if (strength > 25) return 'Moderate';
    return 'Weak';
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculatePasswordStrength,
        validateSignupForm,
        getPasswordStrengthDescription
    };
}
