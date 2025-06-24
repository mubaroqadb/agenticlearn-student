/**
 * AgenticLearn Student Portal - Configuration
 * Green computing: Minimal configuration, efficient defaults
 */

export const API_CONFIG = {
    // Backend API Configuration
    BASE_URL: 'https://asia-southeast2-agenticai-462517.cloudfunctions.net/domyid',
    
    // Student-specific endpoints
    ENDPOINTS: {
        // Core student endpoints
        STUDENT_PROFILE: '/api/agenticlearn/student/profile',
        STUDENT_DASHBOARD: '/api/agenticlearn/student/dashboard',
        STUDENT_COURSES: '/api/agenticlearn/student/courses',
        STUDENT_ASSIGNMENTS: '/api/agenticlearn/student/assignments',
        STUDENT_GRADES: '/api/agenticlearn/student/grades',
        STUDENT_PROGRESS: '/api/agenticlearn/student/progress',
        
        // Communication endpoints
        STUDENT_MESSAGES: '/api/agenticlearn/student/messages',
        STUDENT_ANNOUNCEMENTS: '/api/agenticlearn/student/announcements',
        
        // AI & Learning tools
        STUDENT_AI_TUTOR: '/api/agenticlearn/student/ai-tutor',
        STUDENT_STUDY_PLAN: '/api/agenticlearn/student/study-plan',
        STUDENT_RESOURCES: '/api/agenticlearn/student/resources',
        STUDENT_ANALYTICS: '/api/agenticlearn/student/analytics',
        STUDENT_ACTIVITY: '/api/agenticlearn/student/activity'
    },
    
    // Request configuration
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 second
};

export const UI_CONFIG = {
    // Theme configuration
    THEME: 'green',
    SIDEBAR_COLLAPSED: false,
    
    // Notification settings
    NOTIFICATIONS_ENABLED: true,
    NOTIFICATION_DURATION: 5000, // 5 seconds
    
    // Auto-refresh settings
    AUTO_REFRESH_ENABLED: false, // Disabled per user preference
    AUTO_REFRESH_INTERVAL: 300000, // 5 minutes
    
    // Performance settings
    LAZY_LOADING: true,
    CACHE_DURATION: 300000, // 5 minutes
    
    // Accessibility
    HIGH_CONTRAST: false,
    REDUCED_MOTION: false
};

export const FEATURES_CONFIG = {
    // Core learning features
    AI_TUTOR: true,
    STUDY_PLANNER: true,
    PROGRESS_TRACKING: true,
    
    // Communication features
    MESSAGING: true,
    ANNOUNCEMENTS: true,
    
    // Advanced features
    OFFLINE_MODE: false, // Keep simple for green computing
    REAL_TIME_NOTIFICATIONS: false, // Disabled per user preference
    PEER_COLLABORATION: true,
    
    // Analytics
    LEARNING_ANALYTICS: true,
    ACTIVITY_TRACKING: true
};

// Default student data structure
export const DEFAULT_STUDENT = {
    id: null,
    name: 'Student',
    email: '',
    role: 'student',
    avatar: '👤',
    preferences: {
        theme: 'green',
        notifications: true,
        language: 'en'
    }
};
