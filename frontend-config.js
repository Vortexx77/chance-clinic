/**
 * Frontend Configuration for CHANSE CLINIC
 * This file will be deployed on Hostinger and points to your clinic server backend
 * 
 * IMPORTANT: Change the BACKEND_URL to your actual clinic server before deployment!
 */

const CHANSE_CONFIG = {
    // Environment detection
    isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isProduction: window.location.protocol === 'https:' && window.location.hostname !== 'localhost',

    // Backend URLs - CHANGE THESE TO YOUR ACTUAL SERVER!
    BACKEND_URL: {
        local: 'http://localhost/chanse-clinic/backend/',
        production: 'https://your-clinic-server.com/backend/', // CHANGE THIS!
        clinic: 'https://your-clinic-server.com/backend/' // CHANGE THIS!
    },

    // Frontend URLs
    FRONTEND_URL: {
        local: 'http://localhost/chanse-clinic/',
        production: 'https://chanseclinic.com/', // CHANGE TO YOUR DOMAIN
        clinic: 'https://chanseclinic.com/' // CHANGE TO YOUR DOMAIN
    },

    // API Endpoints
    API_ENDPOINTS: {
        contact: 'routes/contact.php',
        appointment: 'routes/appointment.php',
        newsletter: 'routes/newsletter.php',
        settings: 'routes/settings.php',
        csrf: 'routes/csrf.php'
    },

    // Clinic Information
    CLINIC_INFO: {
        name: 'CHANSE PHYSICIAN & CHILDREN\'S CLINIC',
        phone: '+256 XXX XXX XXX', // CHANGE TO REAL PHONE
        email: 'info@chanseclinic.com', // CHANGE TO REAL EMAIL
        address: 'Namulanda, Entebbe, Uganda',
        website: 'https://chanseclinic.com' // CHANGE TO YOUR DOMAIN
    },

    // Form Settings
    FORM_SETTINGS: {
        maxRetries: 3,
        timeout: 30000, // 30 seconds
        showSuccessMessage: true,
        showErrorMessage: true
    },

    // Security Settings
    SECURITY: {
        enableCSRF: true,
        enableRateLimiting: true,
        maxRequestsPerMinute: 10
    }
};

/**
 * Get the appropriate backend URL based on current environment
 */
function getBackendUrl() {
    if (CHANSE_CONFIG.isLocalhost) {
        return CHANSE_CONFIG.BACKEND_URL.local;
    } else if (CHANSE_CONFIG.isProduction) {
        return CHANSE_CONFIG.BACKEND_URL.production;
    } else {
        return CHANSE_CONFIG.BACKEND_URL.clinic;
    }
}

/**
 * Get the appropriate frontend URL based on current environment
 */
function getFrontendUrl() {
    if (CHANSE_CONFIG.isLocalhost) {
        return CHANSE_CONFIG.FRONTEND_URL.local;
    } else if (CHANSE_CONFIG.isProduction) {
        return CHANSE_CONFIG.FRONTEND_URL.production;
    } else {
        return CHANSE_CONFIG.FRONTEND_URL.clinic;
    }
}

/**
 * Build full API URL for a specific endpoint
 */
function getApiUrl(endpoint) {
    const backendUrl = getBackendUrl();
    const apiEndpoint = CHANSE_CONFIG.API_ENDPOINTS[endpoint];

    if (!apiEndpoint) {
        console.error(`Unknown API endpoint: ${endpoint}`);
        return null;
    }

    return backendUrl + apiEndpoint;
}

/**
 * Enhanced fetch function with error handling and retries
 */
async function enhancedFetch(endpoint, options = {}, retries = 0) {
    const url = getApiUrl(endpoint);

    if (!url) {
        throw new Error(`Invalid endpoint: ${endpoint}`);
    }

    const defaultOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: CHANSE_CONFIG.FORM_SETTINGS.timeout
    };

    const fetchOptions = {...defaultOptions, ...options };

    try {
        // Add CSRF token if enabled
        if (CHANSE_CONFIG.SECURITY.enableCSRF && endpoint !== 'csrf') {
            const csrfToken = await getCSRFToken();
            if (csrfToken) {
                fetchOptions.headers['X-CSRF-Token'] = csrfToken;
            }
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), fetchOptions.timeout);

        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        if (retries < CHANSE_CONFIG.FORM_SETTINGS.maxRetries &&
            (error.name === 'AbortError' || error.message.includes('timeout'))) {

            console.warn(`Request failed, retrying... (${retries + 1}/${CHANSE_CONFIG.FORM_SETTINGS.maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1))); // Exponential backoff
            return enhancedFetch(endpoint, options, retries + 1);
        }

        throw error;
    }
}

/**
 * Get CSRF token for form submissions
 */
async function getCSRFToken() {
    try {
        const response = await fetch(getApiUrl('csrf') + '?form_id=contact_form&expiry=30');
        const data = await response.json();
        return data.token || null;
    } catch (error) {
        console.warn('Failed to get CSRF token:', error);
        return null;
    }
}

/**
 * Rate limiting implementation
 */
class RateLimiter {
    constructor() {
        this.requests = new Map();
        this.maxRequests = CHANSE_CONFIG.SECURITY.maxRequestsPerMinute;
    }

    canMakeRequest() {
        const now = Date.now();
        const minuteAgo = now - 60000; // 1 minute ago

        // Clean old requests
        for (const [timestamp] of this.requests) {
            if (timestamp < minuteAgo) {
                this.requests.delete(timestamp);
            }
        }

        // Check if we can make a new request
        if (this.requests.size < this.maxRequests) {
            this.requests.set(now, true);
            return true;
        }

        return false;
    }

    getRemainingRequests() {
        return Math.max(0, this.maxRequests - this.requests.size);
    }
}

// Initialize rate limiter
const rateLimiter = new RateLimiter();

/**
 * Utility function to show success/error messages
 */
function showMessage(message, type = 'success') {
    if (!CHANSE_CONFIG.FORM_SETTINGS.showSuccessMessage && type === 'success') return;
    if (!CHANSE_CONFIG.FORM_SETTINGS.showErrorMessage && type === 'error') return;

    // You can customize this to show messages in your preferred way
    console.log(`${type.toUpperCase()}: ${message}`);

    // Example: Show toast notification
    if (typeof showToast === 'function') {
        showToast(message, type);
    }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (basic validation)
 */
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

/**
 * Sanitize input data
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
}

// Export configuration for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CHANSE_CONFIG;
} else {
    // Make it available globally in browser
    window.CHANSE_CONFIG = CHANSE_CONFIG;
    window.getBackendUrl = getBackendUrl;
    window.getApiUrl = getApiUrl;
    window.enhancedFetch = enhancedFetch;
    window.rateLimiter = rateLimiter;
}