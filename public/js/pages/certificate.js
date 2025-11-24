/**
 * Certificate Page JavaScript
 * Handles certificate generation, preview, and download functionality
 */

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    setupEventListeners();
});

// ==================== INITIALIZATION FUNCTIONS ====================
function initializePage() {
    // Set default date to today
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('date').value = formattedDate;
}

function setupEventListeners() {
    // Generate certificate button
    const generateBtn = document.getElementById('generate');
    if (generateBtn) {
        generateBtn.addEventListener('click', handleGenerateCertificate);
    }
    
    // Back button
    const backBtn = document.getElementById('back');
    if (backBtn) {
        backBtn.addEventListener('click', handleBackToForm);
    }
    
    // Download button
    const downloadBtn = document.getElementById('download');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', handleDownloadCertificate);
    }
}

// ==================== GENERATE CERTIFICATE ====================
function handleGenerateCertificate() {
    const name = document.getElementById('name').value.trim();
    const course = document.getElementById('course').value.trim();
    const date = document.getElementById('date').value;
    
    // Validation
    if (!name) {
        alert('Please enter a name');
        return;
    }
    
    if (!course) {
        alert('Please enter a course name');
        return;
    }
    
    if (!date) {
        alert('Please select a date');
        return;
    }
    
    // Format date for display
    const formattedDate = formatCertificateDate(date);
    
    // Update certificate content
    updateCertificate(name, course, formattedDate);
    
    // Show certificate container
    showCertificate();
}

function formatCertificateDate(dateString) {
    const dateObj = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return dateObj.toLocaleDateString('en-US', options);
}

function updateCertificate(name, course, formattedDate) {
    // Update certificate fields
    const nameEl = document.getElementById('certificate-name');
    const courseEl = document.getElementById('certificate-course');
    const dateEl = document.getElementById('certificate-date');
    
    if (nameEl) nameEl.textContent = name;
    if (courseEl) courseEl.textContent = course;
    if (dateEl) dateEl.textContent = formattedDate;
}

function showCertificate() {
    const container = document.getElementById('certificate-container');
    if (container) {
        container.classList.remove('hidden');
        container.scrollIntoView({ behavior: 'smooth' });
    }
}

// ==================== NAVIGATION ====================
function handleBackToForm() {
    const container = document.getElementById('certificate-container');
    if (container) {
        container.classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ==================== DOWNLOAD CERTIFICATE ====================
function handleDownloadCertificate() {
    const name = document.getElementById('name').value.trim();
    const fileName = `certificate-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
    
    // Check if html2canvas is available
    if (typeof html2canvas === 'function') {
        downloadCertificateAsImage(fileName);
    } else {
        showDownloadAlert(fileName);
    }
}

function downloadCertificateAsImage(fileName) {
    const certificateElement = document.getElementById('certificate');
    
    if (!certificateElement) {
        alert('Certificate element not found');
        return;
    }
    
    // Use html2canvas to convert certificate to image
    html2canvas(certificateElement, {
        scale: 2, // Higher quality
        backgroundColor: '#ffffff',
        logging: false
    }).then(canvas => {
        // Convert canvas to blob
        canvas.toBlob(blob => {
            // Create download link
            const link = document.createElement('a');
            link.download = fileName;
            link.href = URL.createObjectURL(blob);
            link.click();
            
            // Clean up
            URL.revokeObjectURL(link.href);
        }, 'image/png');
    }).catch(error => {
        console.error('Error generating certificate image:', error);
        alert('Failed to generate certificate image. Please try again or take a screenshot.');
    });
}

function showDownloadAlert(fileName) {
    alert(
        `Certificate generation ready!\n\n` +
        `To download:\n` +
        `1. Right-click on the certificate\n` +
        `2. Select "Save Image As..."\n` +
        `3. Save as: ${fileName}\n\n` +
        `Alternatively, take a screenshot of the certificate.`
    );
}

// ==================== UTILITY FUNCTIONS ====================
function validateCertificateInputs(name, course, date) {
    const errors = [];
    
    if (!name || name.trim() === '') {
        errors.push('Name is required');
    }
    
    if (!course || course.trim() === '') {
        errors.push('Course name is required');
    }
    
    if (!date) {
        errors.push('Date is required');
    } else {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            errors.push('Invalid date format');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatCertificateDate,
        validateCertificateInputs,
        updateCertificate
    };
}
