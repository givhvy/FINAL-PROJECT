// Show/hide hint and solution
document.getElementById('show-hint').addEventListener('click', function() {
    document.getElementById('hint').classList.toggle('hidden');
    document.getElementById('solution').classList.add('hidden');
});

document.getElementById('show-solution').addEventListener('click', function() {
    document.getElementById('solution').classList.toggle('hidden');
    document.getElementById('hint').classList.add('hidden');
});

// Add animation classes on scroll
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.feature-card, .course-card, .testimonial-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    animateElements.forEach(element => {
        observer.observe(element);
    });
});

// Mobile menu functionality would go here
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
        // Mobile menu toggle functionality would be implemented here
        alert('Mobile menu functionality would be implemented here');
    });
}

document.addEventListener('DOMContentLoaded', function() {
  const signInBtn = document.querySelector('.nav-actions .btn.btn-white');
  if (signInBtn) {
    signInBtn.addEventListener('click', function() {
      window.location.href = '../Login Page/index.html';
    });
  }
});   