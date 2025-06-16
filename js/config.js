// AgenticLearn Student Portal Configuration
// Critical authentication and API configuration

window.AgenticLearnConfig = {
    // API Configuration
    API_BASE: 'https://asia-southeast2-agenticai-462517.cloudfunctions.net/domyid/api/agenticlearn',
    AUTH_REDIRECT: 'https://mubaroqadb.github.io/agenticlearn-auth/?type=student',
    
    // Token Configuration - CRITICAL: Use PASETO tokens
    TOKEN_NAMES: ['paseto_token', 'login', 'access_token', 'student_token'],
    PRIMARY_TOKEN_NAME: 'paseto_token',
    
    // Authentication Configuration
    PHONE_PATTERN: /^08[0-9]{8,11}$/,
    PHONE_FORMAT_EXAMPLE: '082119000486',
    
    // Application Configuration
    REFRESH_INTERVAL: 30000, // 30 seconds
    DEBUG: true,
    VERSION: '2.0.0',
    
    // Demo Credentials
    DEMO_CREDENTIALS: {
        phonenumber: '082119000486',
        password: 'demo123'
    },
    
    // Cookie Configuration
    COOKIE_OPTIONS: 'path=/; max-age=86400; SameSite=Lax',
    
    // API Headers - CRITICAL: Use 'login' header not 'Authorization'
    AUTH_HEADER_NAME: 'login',
    
    // Validation Rules
    VALIDATION: {
        PHONE_MIN_LENGTH: 10,
        PHONE_MAX_LENGTH: 13,
        PASSWORD_MIN_LENGTH: 6
    },
    
    // Error Messages
    MESSAGES: {
        INVALID_PHONE: 'Nomor telepon harus format Indonesia (08xxxxxxxxxx)',
        LOGIN_FAILED: 'Login gagal. Periksa nomor telepon dan password.',
        TOKEN_EXPIRED: 'Sesi telah berakhir. Silakan login kembali.',
        NETWORK_ERROR: 'Koneksi bermasalah. Coba lagi nanti.',
        LOADING: 'Memuat data...',
        SUCCESS: 'Berhasil!'
    }
};

// Validation Functions
window.AgenticLearnConfig.validatePhone = function(phone) {
    if (!phone) return false;
    return this.PHONE_PATTERN.test(phone);
};

window.AgenticLearnConfig.formatPhone = function(phone) {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Ensure it starts with 08
    if (!cleaned.startsWith('08')) {
        return null;
    }
    
    return cleaned;
};

window.AgenticLearnConfig.validatePassword = function(password) {
    return password && password.length >= this.VALIDATION.PASSWORD_MIN_LENGTH;
};

// Debug logging
if (window.AgenticLearnConfig.DEBUG) {
    console.log('🔧 AgenticLearn Student Config loaded:', window.AgenticLearnConfig);
    console.log('📱 Phone pattern:', window.AgenticLearnConfig.PHONE_PATTERN);
    console.log('🔑 Token names:', window.AgenticLearnConfig.TOKEN_NAMES);
    console.log('🌐 API base:', window.AgenticLearnConfig.API_BASE);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.AgenticLearnConfig;
}
