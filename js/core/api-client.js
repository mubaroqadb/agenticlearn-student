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
        console.log("🔄 Testing AgenticAI backend connection... [FIXED VERSION]");

        try {
            // Test with health endpoint first (FIXED - no longer using profile endpoint)
            console.log("🔗 Testing health endpoint:", `${this.baseURL}/api/agenticlearn/health`);
            const healthResponse = await this.request('/api/agenticlearn/health');
            console.log("📥 Health response:", healthResponse);

            if (healthResponse && healthResponse.success) {
                console.log("✅ AgenticAI backend connection successful!");

                // Create default student profile since profile endpoint doesn't exist yet
                const defaultProfile = {
                    id: 'student_001',
                    name: 'AgenticLearn Student',
                    email: 'student@agenticlearn.com',
                    role: 'student',
                    avatar: '👤',
                    preferences: {
                        theme: 'green',
                        notifications: true,
                        language: 'en'
                    }
                };

                return {
                    success: true,
                    profile: defaultProfile
                };
            } else {
                throw new Error("Health check failed");
            }
        } catch (error) {
            console.error("❌ AgenticAI backend connection failed:", error);
            throw new Error(`Backend connection failed: ${error.message}`);
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
        try {
            const response = await this.request(this.endpoints.STUDENT_DASHBOARD);
            console.log("📊 Dashboard data received:", response);
            return response;
        } catch (error) {
            console.error("❌ Failed to get dashboard data:", error);
            // Return default dashboard data structure
            return {
                success: true,
                data: {
                    enrolled_courses: 0,
                    completed_courses: 0,
                    in_progress: 0,
                    total_lessons: 0,
                    completed_lessons: 0,
                    overall_progress: 0,
                    study_streak: 0,
                    total_study_time: 0,
                    this_week_time: 0,
                    points_earned: 0,
                    badges_earned: 0,
                    upcoming_deadlines: 0,
                    recent_achievements: []
                }
            };
        }
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
        return this.request(this.endpoints.STUDENT_COURSE_DETAILS(courseId));
    }

    /**
     * Get available courses for enrollment
     */
    async getAvailableCourses() {
        return this.request(this.endpoints.STUDENT_AVAILABLE_COURSES);
    }

    /**
     * Get student profile
     */
    async getProfile() {
        return this.request(this.endpoints.STUDENT_PROFILE);
    }

    /**
     * Get AI chat history
     */
    async getAIChatHistory() {
        return this.request(this.endpoints.AI_CHAT_HISTORY);
    }

    /**
     * Get AI insights
     */
    async getAIInsights() {
        return this.request(this.endpoints.AI_INSIGHTS);
    }

    /**
     * Get AI recommendations
     */
    async getAIRecommendations() {
        return this.request(this.endpoints.AI_RECOMMENDATIONS);
    }

    /**
     * Get study plans
     */
    async getStudyPlans() {
        return this.request(this.endpoints.STUDY_PLANS);
    }

    /**
     * Get study sessions
     */
    async getStudySessions() {
        return this.request(this.endpoints.STUDY_SESSIONS);
    }

    /**
     * Get study analytics
     */
    async getStudyAnalytics() {
        return this.request(this.endpoints.STUDY_ANALYTICS);
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

    /**
     * Get assessment status and results
     */
    async getAssessmentStatus() {
        return this.request(this.endpoints.STUDENT_ASSESSMENTS);
    }

    /**
     * Start assessment
     */
    async startAssessment(assessmentType) {
        return this.request(`${this.endpoints.STUDENT_ASSESSMENTS}/${assessmentType}/start`, {
            method: 'POST'
        });
    }

    /**
     * Submit assessment answer
     */
    async submitAssessmentAnswer(assessmentType, questionId, answer) {
        return this.request(`${this.endpoints.STUDENT_ASSESSMENTS}/${assessmentType}/answer`, {
            method: 'POST',
            body: JSON.stringify({ questionId, answer })
        });
    }

    /**
     * Complete assessment and get results
     */
    async completeAssessment(assessmentType, answers) {
        return this.request(`${this.endpoints.STUDENT_ASSESSMENTS}/${assessmentType}/complete`, {
            method: 'POST',
            body: JSON.stringify({ answers })
        });
    }

    /**
     * Get assessment results
     */
    async getAssessmentResults(assessmentType) {
        return this.request(`${this.endpoints.STUDENT_ASSESSMENTS}/${assessmentType}/results`);
    }

    /**
     * Get student goals
     */
    async getGoals() {
        return this.request(this.endpoints.STUDENT_GOALS);
    }

    /**
     * Create new goal
     */
    async createGoal(goalData) {
        return this.request(this.endpoints.STUDENT_GOALS, {
            method: 'POST',
            body: JSON.stringify(goalData)
        });
    }

    /**
     * Update goal
     */
    async updateGoal(goalId, goalData) {
        return this.request(`${this.endpoints.STUDENT_GOALS}/${goalId}`, {
            method: 'PUT',
            body: JSON.stringify(goalData)
        });
    }

    /**
     * Delete goal
     */
    async deleteGoal(goalId) {
        return this.request(`${this.endpoints.STUDENT_GOALS}/${goalId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Update goal progress
     */
    async updateGoalProgress(goalId, progress) {
        return this.request(`${this.endpoints.STUDENT_GOALS}/${goalId}/progress`, {
            method: 'PUT',
            body: JSON.stringify({ progress })
        });
    }

    /**
     * Get AI chat history
     */
    async getAIChatHistory() {
        return this.request(this.endpoints.STUDENT_AI_CHAT);
    }

    /**
     * Send message to AI tutor
     */
    async sendAIMessage(message) {
        return this.request(this.endpoints.STUDENT_AI_CHAT, {
            method: 'POST',
            body: JSON.stringify({ message })
        });
    }

    /**
     * Get AI insights
     */
    async getAIInsights() {
        return this.request(this.endpoints.STUDENT_AI_INSIGHTS);
    }

    /**
     * Get AI recommendations
     */
    async getAIRecommendations() {
        return this.request(this.endpoints.STUDENT_AI_RECOMMENDATIONS);
    }

    /**
     * Get grade analytics
     */
    async getGradeAnalytics() {
        return this.request(this.endpoints.STUDENT_GRADE_ANALYTICS);
    }

    /**
     * Get study plans
     */
    async getStudyPlans() {
        return this.request(this.endpoints.STUDENT_STUDY_PLANS);
    }

    /**
     * Get study sessions
     */
    async getStudySessions() {
        return this.request(this.endpoints.STUDENT_STUDY_SESSIONS);
    }

    /**
     * Get study analytics
     */
    async getStudyAnalytics() {
        return this.request(this.endpoints.STUDENT_STUDY_ANALYTICS);
    }

    /**
     * Create study plan
     */
    async createStudyPlan(planData) {
        return this.request(this.endpoints.STUDENT_STUDY_PLANS, {
            method: 'POST',
            body: JSON.stringify(planData)
        });
    }

    /**
     * Create study session
     */
    async createStudySession(sessionData) {
        return this.request(this.endpoints.STUDENT_STUDY_SESSIONS, {
            method: 'POST',
            body: JSON.stringify(sessionData)
        });
    }
}
