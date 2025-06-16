// Authentication Token Management Utility
// Standardized token handling for AgenticLearn ecosystem

class AuthTokenManager {
    static TOKEN_NAMES = ['access_token', 'student_login', 'login'];
    static COOKIE_OPTIONS = 'path=/; max-age=86400; SameSite=Lax';
    
    /**
     * Set authentication token with multiple names for compatibility
     * @param {string} token - JWT token
     */
    static setToken(token) {
        if (!token) {
            console.error('❌ Cannot set empty token');
            return;
        }
        
        // Set token with multiple names for compatibility
        this.TOKEN_NAMES.forEach(name => {
            document.cookie = `${name}=${token}; ${this.COOKIE_OPTIONS}`;
        });
        
        console.log('✅ Token set with names:', this.TOKEN_NAMES);
        
        // Dispatch custom event for token change
        window.dispatchEvent(new CustomEvent('tokenSet', { detail: { token } }));
    }
    
    /**
     * Get authentication token from any of the standard names
     * @returns {string|null} - JWT token or null if not found
     */
    static getToken() {
        for (const name of this.TOKEN_NAMES) {
            const token = this.getCookie(name);
            if (token && token !== 'null' && token !== 'undefined') {
                console.log(`✅ Token found with name: ${name}`);
                return token;
            }
        }
        console.log('❌ No valid token found');
        return null;
    }
    
    /**
     * Clear all authentication tokens
     */
    static clearTokens() {
        this.TOKEN_NAMES.forEach(name => {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        });
        
        console.log('✅ All tokens cleared');
        
        // Dispatch custom event for token clear
        window.dispatchEvent(new CustomEvent('tokenCleared'));
    }
    
    /**
     * Get cookie value by name
     * @param {string} name - Cookie name
     * @returns {string|null} - Cookie value or null
     */
    static getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            const cookieValue = parts.pop().split(';').shift();
            return cookieValue && cookieValue !== 'null' && cookieValue !== 'undefined' ? cookieValue : null;
        }
        return null;
    }
    
    /**
     * Check if user is authenticated
     * @returns {boolean} - True if authenticated
     */
    static isAuthenticated() {
        const token = this.getToken();
        const isAuth = !!token;
        console.log(`🔐 Authentication status: ${isAuth ? 'Authenticated' : 'Not authenticated'}`);
        return isAuth;
    }
    
    /**
     * Get authentication header for API requests
     * @returns {Object} - Authorization header object
     */
    static getAuthHeader() {
        const token = this.getToken();
        if (token) {
            return { 'Authorization': `Bearer ${token}` };
        }
        return {};
    }
    
    /**
     * Redirect to authentication page with return URL
     * @param {string} userType - Type of user (student, educator, admin)
     * @param {string} returnUrl - URL to return to after authentication
     */
    static redirectToAuth(userType = 'student', returnUrl = null) {
        const currentUrl = returnUrl || window.location.href;
        const encodedReturnUrl = encodeURIComponent(currentUrl);
        const authUrl = `https://mubaroqadb.github.io/agenticlearn-auth/?type=${userType}&redirect=${encodedReturnUrl}`;
        
        console.log(`🔄 Redirecting to auth: ${authUrl}`);
        window.location.href = authUrl;
    }
    
    /**
     * Handle successful login (typically called by auth frontend)
     * @param {string} token - JWT token
     * @param {Object} userData - User data object
     */
    static handleSuccessfulLogin(token, userData = {}) {
        // Set token
        this.setToken(token);
        
        // Store user data if provided
        if (userData.name) {
            localStorage.setItem('user_name', userData.name);
        }
        if (userData.email) {
            localStorage.setItem('user_email', userData.email);
        }
        if (userData.role) {
            localStorage.setItem('user_role', userData.role);
        }
        
        console.log('✅ Login successful, user data stored');
        
        // Check for redirect URL
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect');
        
        if (redirectUrl) {
            console.log(`🔄 Redirecting to: ${redirectUrl}`);
            window.location.href = decodeURIComponent(redirectUrl);
        } else {
            // Default redirect based on user type
            const userType = userData.role || urlParams.get('type') || 'student';
            this.redirectToDefaultPage(userType);
        }
    }
    
    /**
     * Redirect to default page based on user type
     * @param {string} userType - Type of user
     */
    static redirectToDefaultPage(userType) {
        const redirectUrls = {
            'student': 'https://mubaroqadb.github.io/agenticlearn-student/',
            'educator': 'https://mubaroqadb.github.io/agenticlearn-educator/',
            'admin': 'https://mubaroqadb.github.io/agenticlearn-admin/'
        };
        
        const defaultUrl = redirectUrls[userType] || redirectUrls['student'];
        console.log(`🔄 Redirecting to default page: ${defaultUrl}`);
        window.location.href = defaultUrl;
    }
    
    /**
     * Handle logout
     */
    static logout() {
        // Clear tokens
        this.clearTokens();
        
        // Clear user data
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_role');
        
        console.log('✅ Logout successful');
        
        // Redirect to auth page
        this.redirectToAuth();
    }
    
    /**
     * Get stored user data
     * @returns {Object} - User data object
     */
    static getUserData() {
        return {
            name: localStorage.getItem('user_name'),
            email: localStorage.getItem('user_email'),
            role: localStorage.getItem('user_role'),
            isAuthenticated: this.isAuthenticated()
        };
    }
    
    /**
     * Initialize auth manager (call on page load)
     */
    static init() {
        console.log('🔐 AuthTokenManager initialized');
        
        // Listen for storage events (cross-tab token sync)
        window.addEventListener('storage', (e) => {
            if (this.TOKEN_NAMES.includes(e.key)) {
                console.log(`🔄 Token changed in another tab: ${e.key}`);
                window.dispatchEvent(new CustomEvent('tokenChanged', { detail: { key: e.key, newValue: e.newValue } }));
            }
        });
        
        // Check authentication status
        const isAuth = this.isAuthenticated();
        console.log(`🔐 Initial auth status: ${isAuth ? 'Authenticated' : 'Not authenticated'}`);
        
        return isAuth;
    }
}

// Make globally available
window.AuthTokenManager = AuthTokenManager;

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
    AuthTokenManager.init();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthTokenManager;
}

console.log('🔐 Auth Utils loaded successfully');
