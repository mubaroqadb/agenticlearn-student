/**
 * AgenticLearn Student Portal - API Client
 * Handles all backend communication for student portal
 * Green computing: Minimal HTTP requests, efficient data handling
 */

import { API_CONFIG } from './config.js';

export class APIClient {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.endpoints = API_CONFIG.ENDPOINTS;
        this.developmentMode = false; // Use real backend now
    }

    /**
     * Make HTTP request to backend
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        // In development mode, don't add auth headers
        if (!this.developmentMode) {
            // Auth headers would be added here in production
            // defaultOptions.headers['Authorization'] = `Bearer ${token}`;
        }

        const requestOptions = { ...defaultOptions, ...options };

        try {
            console.log(`🌐 API Request: ${requestOptions.method} ${url}`);
            
            const response = await fetch(url, requestOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ API Response: ${requestOptions.method} ${url}`, data);
            
            return data;
        } catch (error) {
            console.error(`❌ API Error: ${requestOptions.method} ${url}`, error);
            throw error;
        }
    }

    /**
     * Test backend connection and get student profile
     */
    async testConnection() {
        console.log("🔄 Testing AgenticAI backend connection...");
        console.log("🔗 Testing profile endpoint:", `${this.baseURL}${this.endpoints.STUDENT_PROFILE}`);

        // Get real profile data from backend
        const profileResponse = await this.request(this.endpoints.STUDENT_PROFILE);
        console.log("📥 Profile response:", profileResponse);

        if (profileResponse && profileResponse.success && profileResponse.profile) {
            console.log("✅ AgenticAI backend connection successful!");
            return {
                success: true,
                profile: profileResponse.profile
            };
        } else {
            console.error("❌ AgenticAI backend response invalid:", profileResponse);
            throw new Error("Backend connection failed - no fallback allowed per Green Computing principles");
        }
    }

    /**
     * Get student profile
     */
    async getProfile() {
        return this.request(this.endpoints.STUDENT_PROFILE);
    }

    /**
     * Update student profile
     */
    async updateProfile(profileData) {
        return this.request(this.endpoints.STUDENT_PROFILE, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    /**
     * Get student dashboard data
     */
    async getDashboardData() {
        return this.request(this.endpoints.STUDENT_DASHBOARD);
    }

    /**
     * Get student courses
     */
    async getCourses() {
        return this.request(this.endpoints.STUDENT_COURSES);
    }

    /**
     * Get course details
     */
    async getCourseDetails(courseId) {
        return this.request(`${this.endpoints.STUDENT_COURSES}/${courseId}`);
    }

    /**
     * Get student assignments
     */
    async getAssignments() {
        return this.request(this.endpoints.STUDENT_ASSIGNMENTS);
    }

    /**
     * Submit assignment
     */
    async submitAssignment(assignmentId, submissionData) {
        return this.request(`${this.endpoints.STUDENT_ASSIGNMENTS}/${assignmentId}/submit`, {
            method: 'POST',
            body: JSON.stringify(submissionData)
        });
    }

    /**
     * Get student grades
     */
    async getGrades() {
        return this.request(this.endpoints.STUDENT_GRADES);
    }

    /**
     * Get learning progress
     */
    async getProgress() {
        return this.request(this.endpoints.STUDENT_PROGRESS);
    }

    /**
     * Get messages/communications
     */
    async getMessages() {
        return this.request(this.endpoints.STUDENT_MESSAGES);
    }

    /**
     * Send message to educator
     */
    async sendMessage(messageData) {
        return this.request(this.endpoints.STUDENT_MESSAGES, {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
    }

    /**
     * Get announcements
     */
    async getAnnouncements() {
        return this.request(this.endpoints.STUDENT_ANNOUNCEMENTS);
    }

    /**
     * Get AI tutor recommendations
     */
    async getAIRecommendations() {
        return this.request(this.endpoints.STUDENT_AI_TUTOR);
    }

    /**
     * Get study plan
     */
    async getStudyPlan() {
        return this.request(this.endpoints.STUDENT_STUDY_PLAN);
    }

    /**
     * Update study plan
     */
    async updateStudyPlan(planData) {
        return this.request(this.endpoints.STUDENT_STUDY_PLAN, {
            method: 'PUT',
            body: JSON.stringify(planData)
        });
    }

    /**
     * Get learning resources
     */
    async getResources() {
        return this.request(this.endpoints.STUDENT_RESOURCES);
    }

    /**
     * Track learning activity
     */
    async trackActivity(activityData) {
        return this.request(this.endpoints.STUDENT_ACTIVITY, {
            method: 'POST',
            body: JSON.stringify(activityData)
        });
    }

    /**
     * Get learning analytics
     */
    async getAnalytics() {
        return this.request(this.endpoints.STUDENT_ANALYTICS);
    }
}
