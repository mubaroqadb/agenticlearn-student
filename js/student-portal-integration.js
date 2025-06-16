// Student Portal Real Data Integration
// This file integrates the student portal with real AgenticAI backend data
// Applied from frontend educator analysis

class StudentAPIClient {
    constructor() {
        this.baseURL = 'https://asia-southeast2-agenticai-462517.cloudfunctions.net/domyid/api/agenticlearn';
        // Use AuthTokenManager if available, fallback to manual cookie check
        this.token = window.AuthTokenManager ? window.AuthTokenManager.getToken() : this.getCookie('student_token');
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        // Get fresh token for each request
        const token = window.AuthTokenManager ? window.AuthTokenManager.getToken() : this.token;

        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(window.AuthTokenManager ? window.AuthTokenManager.getAuthHeader() : (token && { 'Authorization': `Bearer ${token}` }))
            },
            ...options
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        const response = await fetch(url, config);
        return await response.json();
    }

    // Student Profile & Dashboard
    async getProfile() {
        return await this.request('/student/profile');
    }

    async getDashboardStats() {
        return await this.request('/student/dashboard/stats');
    }

    // Course Management
    async getEnrolledCourses() {
        return await this.request('/student/courses/enrolled');
    }

    async getAvailableCourses() {
        return await this.request('/student/courses/available');
    }

    async getCourseProgress(courseId) {
        return await this.request(`/student/courses/${courseId}/progress`);
    }

    async enrollInCourse(courseId) {
        return await this.request(`/student/courses/${courseId}/enroll`, {
            method: 'POST'
        });
    }

    // Progress & Analytics
    async getOverallProgress() {
        return await this.request('/student/progress/overall');
    }

    async getDetailedProgress() {
        return await this.request('/student/progress/detailed');
    }

    // Assessment System
    async getAvailableAssessments() {
        return await this.request('/student/assessments/available');
    }

    async getAssessmentHistory() {
        return await this.request('/student/assessments/history');
    }

    async submitAssessment(assessmentId, answers) {
        return await this.request(`/student/assessments/${assessmentId}/submit`, {
            method: 'POST',
            body: { answers, timestamp: new Date().toISOString() }
        });
    }

    // AI Features
    async getAIRecommendations() {
        return await this.request('/student/ai/recommendations');
    }

    async chatWithAI(message) {
        return await this.request('/student/ai/chat', {
            method: 'POST',
            body: { message, timestamp: new Date().toISOString() }
        });
    }

    async getLearningStyle() {
        return await this.request('/student/ai/learning-style');
    }

    // Goals & Planning
    async getActiveGoals() {
        return await this.request('/student/goals/active');
    }

    async createGoal(goalData) {
        return await this.request('/student/goals/create', {
            method: 'POST',
            body: goalData
        });
    }

    async getDailyPlan() {
        return await this.request('/student/goals/daily-plan');
    }

    // Activity & Timeline
    async getRecentActivity() {
        return await this.request('/student/activity/recent');
    }

    async getActivityTimeline() {
        return await this.request('/student/activity/timeline');
    }
}

// Menu State Management
class MenuStateManager {
    constructor() {
        this.currentPage = localStorage.getItem('student_current_page') || 'dashboard';
        this.menuState = JSON.parse(localStorage.getItem('student_menu_state') || '{}');
    }

    saveCurrentPage(page) {
        this.currentPage = page;
        localStorage.setItem('student_current_page', page);
        console.log(`📱 Menu state saved: ${page}`);
    }

    saveMenuState(state) {
        this.menuState = { ...this.menuState, ...state };
        localStorage.setItem('student_menu_state', JSON.stringify(this.menuState));
    }

    restoreMenuState() {
        // Restore active menu item
        const menuItems = document.querySelectorAll('[data-page]');
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-page') === this.currentPage) {
                item.classList.add('active');
            }
        });

        // Show current page content
        this.showPage(this.currentPage);
        console.log(`📱 Menu state restored: ${this.currentPage}`);
    }

    showPage(page) {
        // Hide all page contents
        const pages = document.querySelectorAll('.page-content');
        pages.forEach(p => p.style.display = 'none');

        // Show selected page
        const targetPage = document.getElementById(`${page}-content`);
        if (targetPage) {
            targetPage.style.display = 'block';
        }

        this.saveCurrentPage(page);
    }
}

// Student Portal Manager
class StudentPortalManager {
    constructor() {
        this.api = new StudentAPIClient();
        this.menuManager = new MenuStateManager();
        this.studentData = null;
        this.dashboardData = null;
        this.coursesData = null;
        this.isLoading = false;
    }

    async initialize() {
        try {
            console.log("🎓 Initializing Student Portal with real data...");
            
            // Check authentication
            if (!this.checkAuthentication()) {
                return;
            }

            // Load all data
            await this.loadAllData();

            // Setup UI
            this.setupEventListeners();
            this.menuManager.restoreMenuState();

            // Start real-time updates
            this.startRealTimeUpdates();

            console.log("✅ Student Portal initialized successfully!");
            this.showNotification("🎓 Welcome to AgenticLearn Student Portal!", "success");

        } catch (error) {
            console.error("❌ Failed to initialize student portal:", error);
            this.showNotification("❌ Failed to load student portal", "error");
        }
    }

    checkAuthentication() {
        // Use AuthTokenManager if available, fallback to manual check
        if (window.AuthTokenManager) {
            const isAuth = window.AuthTokenManager.isAuthenticated();
            if (!isAuth) {
                console.log("🔐 No authentication token found, redirecting to auth...");
                this.redirectToAuth();
                return false;
            }
            return true;
        } else {
            // Fallback to manual token check
            const token = this.api.getCookie('student_login') || this.api.getCookie('access_token') || this.api.getCookie('login');
            if (!token) {
                console.log("🔐 No authentication token found, showing login modal...");
                this.showLoginModal();
                return false;
            }
            return true;
        }
    }

    redirectToAuth() {
        if (window.AuthTokenManager) {
            window.AuthTokenManager.redirectToAuth('student');
        } else {
            // Fallback redirect
            const currentUrl = encodeURIComponent(window.location.href);
            const authUrl = `https://mubaroqadb.github.io/agenticlearn-auth/?type=student&redirect=${currentUrl}`;
            window.location.href = authUrl;
        }
    }

    showLoginModal() {
        // Create login modal for student portal
        const modalHTML = `
            <div id="student-login-modal" class="modal-overlay" onclick="this.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2>🎓 Student Login</h2>
                        <button class="modal-close" onclick="document.getElementById('student-login-modal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Please login to access your student portal.</p>
                        <div style="background: #f0f9ff; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                            <h4 style="color: #2563eb; margin-bottom: 0.5rem;">Demo Credentials:</h4>
                            <p style="margin: 0; font-family: monospace;">
                                Email: demo@student.com<br>
                                Password: demo123
                            </p>
                        </div>
                        <form id="student-login-form" onsubmit="window.studentPortal.handleLogin(event)">
                            <div class="form-group">
                                <label for="email">Email:</label>
                                <input type="email" id="email" name="email" value="demo@student.com" required>
                            </div>
                            <div class="form-group">
                                <label for="password">Password:</label>
                                <input type="password" id="password" name="password" value="demo123" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="document.getElementById('student-login-form').submit()">Login</button>
                        <button class="btn btn-secondary" onclick="document.getElementById('student-login-modal').remove()">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    async handleLogin(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            this.showNotification("Logging in...", "info");
            const response = await fetch("https://asia-southeast2-agenticai-462517.cloudfunctions.net/domyid/api/agenticlearn/auth/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();
            if (data.success && data.token) {
                // Use AuthTokenManager if available
                if (window.AuthTokenManager) {
                    window.AuthTokenManager.setToken(data.token);
                } else {
                    // Fallback to manual cookie setting
                    document.cookie = `access_token=${data.token}; path=/; max-age=86400`;
                    document.cookie = `student_login=${data.token}; path=/; max-age=86400`;
                    document.cookie = `login=${data.token}; path=/; max-age=86400`;
                }

                this.showNotification("Login successful! 🎉", "success");
                document.getElementById('student-login-modal').remove();

                // Reinitialize portal with authentication
                await this.initialize();
            } else {
                this.showNotification(data.message || "Login failed", "error");
            }
        } catch (error) {
            console.error("Login error:", error);
            this.showNotification("Login failed", "error");
        }
    }

    async loadAllData() {
        this.isLoading = true;
        
        try {
            // Load core data in parallel
            const [profileResponse, dashboardResponse, coursesResponse] = await Promise.all([
                this.api.getProfile(),
                this.api.getDashboardStats(),
                this.api.getEnrolledCourses()
            ]);

            if (profileResponse.success) {
                this.studentData = profileResponse.data;
                this.updateStudentProfile(this.studentData);
            }

            if (dashboardResponse.success) {
                this.dashboardData = dashboardResponse.data;
                this.updateDashboardStats(this.dashboardData);
            }

            if (coursesResponse.success) {
                this.coursesData = coursesResponse.data;
                this.updateEnrolledCourses(this.coursesData);
            }

            // Load additional data
            await this.loadAdditionalData();

        } catch (error) {
            console.error("❌ Failed to load student data:", error);
            this.showNotification("❌ Failed to load some data", "error");
        } finally {
            this.isLoading = false;
        }
    }

    async loadAdditionalData() {
        try {
            // Load AI recommendations
            const recommendationsResponse = await this.api.getAIRecommendations();
            if (recommendationsResponse.success) {
                this.updateAIRecommendations(recommendationsResponse.data);
            }

            // Load available assessments
            const assessmentsResponse = await this.api.getAvailableAssessments();
            if (assessmentsResponse.success) {
                this.updateAvailableAssessments(assessmentsResponse.data);
            }

            // Load active goals
            const goalsResponse = await this.api.getActiveGoals();
            if (goalsResponse.success) {
                this.updateActiveGoals(goalsResponse.data);
            }

            // Load recent activity
            const activityResponse = await this.api.getRecentActivity();
            if (activityResponse.success) {
                this.updateRecentActivity(activityResponse.data);
            }

        } catch (error) {
            console.error("❌ Failed to load additional data:", error);
        }
    }

    updateAIRecommendations(recommendations) {
        const container = document.getElementById('ai-recommendations-list');
        if (!container) return;

        const recommendationsHTML = recommendations.map(rec => `
            <div class="recommendation-card" data-rec-id="${rec.id}">
                <div class="rec-header">
                    <h4>${rec.title}</h4>
                    <span class="rec-priority ${rec.priority}">${rec.priority}</span>
                </div>
                <p class="rec-description">${rec.description}</p>
                <div class="rec-actions">
                    <button onclick="followRecommendation('${rec.id}')" class="btn btn-primary">
                        ${rec.type === 'next_lesson' ? 'Start Lesson' :
                          rec.type === 'assessment' ? 'Take Assessment' : 'View Details'}
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = recommendationsHTML;
        console.log(`✅ AI recommendations updated: ${recommendations.length} recommendations`);
    }

    updateAvailableAssessments(assessments) {
        const container = document.getElementById('available-assessments-list');
        if (!container) return;

        const assessmentsHTML = assessments.map(assessment => `
            <div class="assessment-card" data-assessment-id="${assessment.id}">
                <div class="assessment-header">
                    <h4>${assessment.title}</h4>
                    <span class="assessment-type">${assessment.type}</span>
                </div>
                <p class="assessment-description">${assessment.description}</p>
                <div class="assessment-meta">
                    <span>⏱️ ${assessment.duration} minutes</span>
                    <span>❓ ${assessment.questions} questions</span>
                    <span>🔄 ${assessment.attempts} attempts left</span>
                </div>
                <div class="assessment-deadline">
                    <span>📅 Due: ${new Date(assessment.deadline).toLocaleDateString()}</span>
                </div>
                <div class="assessment-actions">
                    <button onclick="startAssessment('${assessment.id}')" class="btn btn-primary">
                        Start Assessment
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = assessmentsHTML;
        console.log(`✅ Available assessments updated: ${assessments.length} assessments`);
    }

    updateActiveGoals(goals) {
        const container = document.getElementById('active-goals-list');
        if (!container) return;

        const goalsHTML = goals.map(goal => `
            <div class="goal-card" data-goal-id="${goal.id}">
                <div class="goal-header">
                    <h4>${goal.title}</h4>
                    <span class="goal-progress">${goal.progress}%</span>
                </div>
                <p class="goal-description">${goal.description}</p>
                <div class="goal-progress-bar">
                    <div class="progress-fill" style="width: ${goal.progress}%"></div>
                </div>
                <div class="goal-milestones">
                    ${goal.milestones.map(milestone => `
                        <div class="milestone ${milestone.completed ? 'completed' : 'pending'}">
                            <span class="milestone-icon">${milestone.completed ? '✅' : '⏳'}</span>
                            <span class="milestone-title">${milestone.title}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="goal-deadline">
                    <span>🎯 Target: ${new Date(goal.target_date).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = goalsHTML;
        console.log(`✅ Active goals updated: ${goals.length} goals`);
    }

    updateRecentActivity(activities) {
        const container = document.getElementById('recent-activity-list');
        if (!container) return;

        const activitiesHTML = activities.map(activity => `
            <div class="activity-item" data-activity-id="${activity.id}">
                <div class="activity-icon">
                    ${activity.type === 'lesson_completed' ? '📚' :
                      activity.type === 'assessment_submitted' ? '📝' :
                      activity.type === 'badge_earned' ? '🏆' :
                      activity.type === 'course_enrolled' ? '🎓' : '📊'}
                </div>
                <div class="activity-content">
                    <h5>${activity.title}</h5>
                    ${activity.course ? `<span class="activity-course">${activity.course}</span>` : ''}
                    ${activity.points ? `<span class="activity-points">+${activity.points} points</span>` : ''}
                    ${activity.score ? `<span class="activity-score">Score: ${activity.score}%</span>` : ''}
                </div>
                <div class="activity-time">
                    ${this.formatTimeAgo(activity.timestamp)}
                </div>
            </div>
        `).join('');

        container.innerHTML = activitiesHTML;
        console.log(`✅ Recent activity updated: ${activities.length} activities`);
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = Math.floor((now - time) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }

    updateStudentProfile(data) {
        // Update student name and info
        const nameElement = document.getElementById('student-name');
        if (nameElement) {
            nameElement.textContent = data.name;
        }

        const levelElement = document.getElementById('student-level');
        if (levelElement) {
            levelElement.textContent = data.current_level;
        }

        const pointsElement = document.getElementById('student-points');
        if (pointsElement) {
            pointsElement.textContent = `${data.points} points`;
        }

        console.log(`✅ Student profile updated: ${data.name} (${data.current_level})`);
    }

    updateDashboardStats(data) {
        // Update dashboard statistics
        const elements = {
            'enrolled-courses': data.enrolled_courses,
            'completed-lessons': data.completed_lessons,
            'overall-progress': `${Math.round(data.overall_progress)}%`,
            'study-streak': `${data.study_streak} days`,
            'total-study-time': `${Math.round(data.total_study_time / 60)} hours`,
            'points-earned': data.points_earned
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        console.log(`✅ Dashboard stats updated: ${data.enrolled_courses} courses, ${data.overall_progress}% progress`);
    }

    updateEnrolledCourses(courses) {
        const container = document.getElementById('enrolled-courses-list');
        if (!container) return;

        const coursesHTML = courses.map(course => `
            <div class="course-card" data-course-id="${course.id}">
                <div class="course-header">
                    <h3>${course.title}</h3>
                    <span class="course-status ${course.status}">${course.status}</span>
                </div>
                <p class="course-description">${course.description}</p>
                <div class="course-meta">
                    <span>👨‍🏫 ${course.instructor}</span>
                    <span>📊 ${course.progress}% complete</span>
                    <span>⭐ ${course.rating}</span>
                </div>
                <div class="course-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${course.progress}%"></div>
                    </div>
                    <span>${course.completed_lessons}/${course.total_lessons} lessons</span>
                </div>
                <div class="course-actions">
                    <button onclick="continueCourse('${course.id}')" class="btn btn-primary">
                        ${course.status === 'completed' ? 'Review Course' : 'Continue Learning'}
                    </button>
                    <button onclick="viewCourseProgress('${course.id}')" class="btn btn-secondary">
                        View Progress
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = coursesHTML;
        console.log(`✅ Enrolled courses updated: ${courses.length} courses`);
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    setupEventListeners() {
        // Menu navigation
        const menuItems = document.querySelectorAll('[data-page]');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                this.menuManager.showPage(page);

                // Update active menu item
                menuItems.forEach(mi => mi.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Refresh button
        const refreshBtn = document.getElementById('refresh-data');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshAllData());
        }
    }

    async refreshAllData() {
        this.showNotification("🔄 Refreshing data...", "info");
        await this.loadAllData();
        this.showNotification("✅ Data refreshed successfully!", "success");
    }

    startRealTimeUpdates() {
        // Update data every 30 seconds
        setInterval(async () => {
            if (!this.isLoading) {
                try {
                    const dashboardResponse = await this.api.getDashboardStats();
                    if (dashboardResponse.success) {
                        this.updateDashboardStats(dashboardResponse.data);
                    }
                } catch (error) {
                    console.error("Real-time update failed:", error);
                }
            }
        }, 30000);
    }
}

// Global functions for course interactions
window.continueCourse = function(courseId) {
    console.log(`📚 Continuing course: ${courseId}`);
    // Implementation for continuing course
    window.studentPortal.showNotification(`📚 Opening course ${courseId}...`, "info");
};

window.viewCourseProgress = function(courseId) {
    console.log(`📊 Viewing progress for course: ${courseId}`);
    // Implementation for viewing course progress
    window.studentPortal.showNotification(`📊 Loading progress for course ${courseId}...`, "info");
};

window.followRecommendation = function(recId) {
    console.log(`🤖 Following recommendation: ${recId}`);
    window.studentPortal.showNotification("🤖 Following AI recommendation...", "info");
};

window.startAssessment = function(assessmentId) {
    console.log(`📝 Starting assessment: ${assessmentId}`);
    window.studentPortal.showNotification(`📝 Starting assessment ${assessmentId}...`, "info");
};

window.refreshStudentData = function() {
    if (window.studentPortal) {
        window.studentPortal.refreshAllData();
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.studentPortal = new StudentPortalManager();
    window.studentPortal.initialize();
});

console.log("🎓 Student Portal Real Data Integration loaded");
