/**
 * Email Validation Utilities
 * Provides functions to validate educational email addresses
 */

/**
 * List of common educational email domain patterns
 * Supports various international educational institutions
 */
const EDUCATIONAL_DOMAINS = [
    '.edu',        // US educational institutions
    '.edu.vn',     // Vietnamese educational institutions
    '.ac.uk',      // UK academic institutions
    '.ac.jp',      // Japanese academic institutions
    '.ac.in',      // Indian academic institutions
    '.edu.au',     // Australian educational institutions
    '.edu.sg',     // Singapore educational institutions
    '.edu.my',     // Malaysian educational institutions
    '.edu.ph',     // Philippine educational institutions
    '.edu.tw',     // Taiwanese educational institutions
    '.edu.hk',     // Hong Kong educational institutions
    '.edu.cn',     // Chinese educational institutions
    '.edu.kr',     // Korean educational institutions
    '.ac.nz',      // New Zealand academic institutions
    '.ac.th',      // Thai academic institutions
    '.ac.id',      // Indonesian academic institutions
];

/**
 * Additional specific educational institutions
 * Add custom domains for specific schools
 */
const SPECIFIC_EDUCATIONAL_DOMAINS = [
    'fpt.edu.vn',   // FPT University
    'hcmut.edu.vn', // HCMC University of Technology
    'mit.edu',      // MIT
    'stanford.edu', // Stanford
];

/**
 * Validates if an email address belongs to an educational institution, kiểm tra email
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if the email is from an educational institution
 */
const isEducationalEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return false;
    }

    const emailLower = email.toLowerCase().trim();

    // Check against specific educational domains first
    for (const domain of SPECIFIC_EDUCATIONAL_DOMAINS) {
        if (emailLower.endsWith(`@${domain}`) || emailLower.includes(`@${domain}`)) {
            return true;
        }
    }

    // Check against general educational domain patterns
    for (const pattern of EDUCATIONAL_DOMAINS) {
        if (emailLower.includes(pattern)) {
            return true;
        }
    }

    return false;
};

/**
 * Validates email format using regex
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if email format is valid
 */
const isValidEmailFormat = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Gets the domain from an email address
 * @param {string} email - The email address
 * @returns {string|null} - The domain or null if invalid
 */
const getEmailDomain = (email) => {
    if (!email || typeof email !== 'string') {
        return null;
    }
    const parts = email.trim().split('@');
    return parts.length === 2 ? parts[1].toLowerCase() : null;
};

module.exports = {
    isEducationalEmail,
    isValidEmailFormat,
    getEmailDomain,
    EDUCATIONAL_DOMAINS,
    SPECIFIC_EDUCATIONAL_DOMAINS
};
