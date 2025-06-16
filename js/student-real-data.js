// Student Portal Real Data Integration
// Replace this file in agenticlearn-student/js/student-dashboard.js

console.log('🎓 Loading Student Portal with Real Data Integration...');

// Real API Client for AgenticAI Backend
class StudentAPIClient {
    constructor() {
        this.baseURL = window.AgenticLearnConfig ? window.AgenticLearnConfig.API_BASE : 'https://asia-southeast2-agenticai-462517.cloudfunctions.net/domyid/api/agenticlearn';
        // Use PASETO token instead of JWT
        this.pasetoToken = this.getPasetoToken();
    }

    getPasetoToken() {
        // Try multiple token names for compatibility - PASETO tokens
        const tokenNames = window.AgenticLearnConfig ? window.AgenticLearnConfig.TOKEN_NAMES : ['paseto_token', 'login', 'access_token', 'student_token'];
        for (const name of tokenNames) {
            const token = this.getCookie(name);
            if (token && token !== 'null' && token !== 'undefined') {
                console.log(`✅ PASETO token found with name: ${name}`);
                return token;
            }
        }
        console.log('❌ No PASETO token found');
        return null;
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const headers = {
            'Content-Type': 'application/json'
        };

        // ✅ CRITICAL: Use 'login' header with PASETO token (NOT Authorization Bearer)
        const pasetoToken = this.getPasetoToken();
        if (pasetoToken) {
            headers['login'] = pasetoToken;
        }

        const config = {
            method: 'GET',
            headers: { ...headers, ...options.headers },
            ...options
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            console.log(`✅ API ${endpoint}:`, data);
            return data;
        } catch (error) {
            console.error(`❌ API ${endpoint} failed:`, error);
            throw error;
        }
    }

    // Student endpoints
    async getProfile() {
        return await this.request('/student/profile');
    }

    async getDashboardStats() {
        return await this.request('/student/dashboard/stats');
    }

    async getEnrolledCourses() {
        return await this.request('/student/courses/enrolled');
    }

    async getAvailableCourses() {
        return await this.request('/student/courses/available');
    }

    async getProgress() {
        return await this.request('/student/progress/overall');
    }

    async getAssessments() {
        return await this.request('/student/assessments/available');
    }

    async getAIRecommendations() {
        return await this.request('/student/ai/recommendations');
    }

    async getGoals() {
        return await this.request('/student/goals/active');
    }

    async getActivity() {
        return await this.request('/student/activity/recent');
    }
}

// Menu State Manager
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

    restoreMenuState() {
        // Restore active menu item
        const menuItems = document.querySelectorAll('[data-section]');
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === this.currentPage) {
                item.classList.add('active');
            }
        });

        // Show current page content
        this.showPage(this.currentPage);
        console.log(`📱 Menu state restored: ${this.currentPage}`);
    }

    showPage(page) {
        // Hide all sections
        const sections = document.querySelectorAll('.dashboard-section');
        sections.forEach(section => section.style.display = 'none');

        // Show target section
        const targetSection = document.getElementById(`${page}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
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
        this.isLoading = false;
    }

    async initialize() {
        try {
            console.log("🎓 Initializing Student Portal with real AgenticAI data...");
            
            // Check authentication
            if (!this.checkAuthentication()) {
                return;
            }

            // Load all real data
            await this.loadAllRealData();

            // Setup UI
            this.setupEventListeners();
            this.menuManager.restoreMenuState();

            // Start real-time updates
            this.startRealTimeUpdates();

            console.log("✅ Student Portal initialized with 100% real data!");
            this.showNotification("🎓 Welcome to AgenticLearn Student Portal!", "success");

        } catch (error) {
            console.error("❌ Failed to initialize student portal:", error);
            this.showNotification("❌ Failed to load student portal", "error");
        }
    }

    checkAuthentication() {
        const token = this.api.getCookie('student_login') || this.api.getCookie('login');
        if (!token) {
            console.log("🔐 No authentication token found");
            // For demo purposes, continue without redirect
            // window.location.href = 'https://mubaroqadb.github.io/agenticlearn-auth/?type=student';
            return true; // Allow demo mode
        }
        return true;
    }

    async loadAllRealData() {
        this.isLoading = true;
        
        try {
            console.log("🔄 Loading all real data from AgenticAI backend...");

            // Load core data in parallel
            const [profileResponse, dashboardResponse, coursesResponse, progressResponse] = await Promise.all([
                this.api.getProfile(),
                this.api.getDashboardStats(),
                this.api.getEnrolledCourses(),
                this.api.getProgress()
            ]);

            // Update student profile
            if (profileResponse.success) {
                this.studentData = profileResponse.data;
                this.updateStudentProfile(this.studentData);
            }

            // Update dashboard stats
            if (dashboardResponse.success) {
                this.updateDashboardStats(dashboardResponse.data);
            }

            // Update enrolled courses
            if (coursesResponse.success) {
                this.updateEnrolledCourses(coursesResponse.data);
            }

            // Update progress
            if (progressResponse.success) {
                this.updateProgress(progressResponse.data);
            }

            // Load additional data
            await this.loadAdditionalRealData();

        } catch (error) {
            console.error("❌ Failed to load real data:", error);
            this.showNotification("⚠️ Some data may not be current", "warning");
        } finally {
            this.isLoading = false;
        }
    }

    async loadAdditionalRealData() {
        try {
            // Load AI recommendations
            const recommendationsResponse = await this.api.getAIRecommendations();
            if (recommendationsResponse.success) {
                this.updateAIRecommendations(recommendationsResponse.data);
            }

            // Load available assessments
            const assessmentsResponse = await this.api.getAssessments();
            if (assessmentsResponse.success) {
                this.updateAssessments(assessmentsResponse.data);
            }

            // Load active goals
            const goalsResponse = await this.api.getGoals();
            if (goalsResponse.success) {
                this.updateGoals(goalsResponse.data);
            }

            // Load recent activity
            const activityResponse = await this.api.getActivity();
            if (activityResponse.success) {
                this.updateActivity(activityResponse.data);
            }

            // Load available courses
            const availableCoursesResponse = await this.api.getAvailableCourses();
            if (availableCoursesResponse.success) {
                this.updateAvailableCourses(availableCoursesResponse.data);
            }

        } catch (error) {
            console.error("❌ Failed to load additional real data:", error);
        }
    }

    updateStudentProfile(data) {
        // Update student name and info
        this.setElementText('user-name', data.name || 'Student');
        this.setElementText('student-name', data.name || 'Student');
        this.setElementText('student-level', data.current_level || 'Beginner');
        this.setElementText('student-points', `${data.points || 0} points`);

        console.log(`✅ Student profile updated: ${data.name} (${data.current_level})`);
    }

    updateDashboardStats(data) {
        // Update dashboard statistics with real data
        this.setElementText('enrolled-courses', data.enrolled_courses || 0);
        this.setElementText('completed-lessons', data.completed_lessons || 0);
        this.setElementText('overall-progress', `${Math.round(data.overall_progress || 0)}%`);
        this.setElementText('study-streak', `${data.study_streak || 0} days`);
        this.setElementText('total-study-time', `${Math.round((data.total_study_time || 0) / 60)} hours`);
        this.setElementText('points-earned', data.points_earned || 0);

        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            progressFill.style.width = `${Math.round(data.overall_progress || 0)}%`;
        }

        console.log(`✅ Dashboard stats updated: ${data.enrolled_courses} courses, ${data.overall_progress}% progress`);
    }

    updateEnrolledCourses(courses) {
        const container = document.getElementById('enrolled-courses-list') || document.getElementById('enrolled-courses');
        if (!container) return;

        if (!courses || courses.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align: center; padding: 2rem;">
                    <h3>🎯 Start Your Learning Journey</h3>
                    <p>You haven't enrolled in any courses yet. Browse available courses below!</p>
                    <button onclick="scrollToAvailableCourses()" class="btn btn-primary">Browse Courses</button>
                </div>
            `;
            return;
        }

        const coursesHTML = courses.map(course => `
            <div class="course-card" style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                <div class="course-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h3>${course.title}</h3>
                    <span class="course-status" style="padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; background: #d4edda; color: #155724;">${course.status}</span>
                </div>
                <p>${course.description}</p>
                <div class="course-meta" style="margin: 0.5rem 0; color: #666;">
                    <span>👨‍🏫 ${course.instructor}</span>
                    <span style="margin-left: 1rem;">📊 ${course.progress}% complete</span>
                    <span style="margin-left: 1rem;">⭐ ${course.rating}</span>
                </div>
                <div class="course-progress" style="margin: 1rem 0;">
                    <div class="progress-bar" style="width: 100%; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
                        <div class="progress-fill" style="height: 100%; background: linear-gradient(90deg, #4CAF50, #45a049); width: ${course.progress}%;"></div>
                    </div>
                    <span style="font-size: 0.9rem; color: #666;">${course.completed_lessons}/${course.total_lessons} lessons</span>
                </div>
                <div class="course-actions" style="margin-top: 1rem;">
                    <button onclick="continueCourse('${course.id}')" class="btn btn-primary" style="margin-right: 0.5rem;">
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

    updateAIRecommendations(recommendations) {
        const container = document.getElementById('ai-recommendations-list') || document.getElementById('ai-recommendations');
        if (!container) return;

        if (!recommendations || recommendations.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align: center; padding: 2rem;">
                    <h3>🤖 AI Recommendations</h3>
                    <p>Complete more lessons to get personalized AI recommendations!</p>
                </div>
            `;
            return;
        }

        const recommendationsHTML = recommendations.map(rec => `
            <div class="recommendation-card" style="border-left: 4px solid #2196F3; padding: 1rem; margin-bottom: 1rem; background: #f8f9fa; border-radius: 0 8px 8px 0;">
                <div class="rec-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4>${rec.title}</h4>
                    <span class="rec-priority" style="padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; background: ${rec.priority === 'high' ? '#ff4444' : rec.priority === 'medium' ? '#ffaa00' : '#4CAF50'}; color: white;">${rec.priority}</span>
                </div>
                <p>${rec.description}</p>
                <div class="rec-actions" style="margin-top: 1rem;">
                    <button onclick="followRecommendation('${rec.id}')" class="btn btn-primary" style="margin-right: 0.5rem;">
                        ${rec.type === 'next_lesson' ? 'Start Lesson' : rec.type === 'assessment' ? 'Take Assessment' : 'View Details'}
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = recommendationsHTML;
        console.log(`✅ AI recommendations updated: ${recommendations.length} recommendations`);
    }

    updateAssessments(assessments) {
        const container = document.getElementById('available-assessments-list') || document.getElementById('assessment-history');
        if (!container) return;

        if (!assessments || assessments.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align: center; padding: 2rem;">
                    <h3>📝 No Assessments Available</h3>
                    <p>Complete more lessons to unlock assessments!</p>
                </div>
            `;
            return;
        }

        const assessmentsHTML = assessments.map(assessment => `
            <div class="assessment-card" style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                <div class="assessment-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4>${assessment.title}</h4>
                    <span class="assessment-type" style="padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; background: #e3f2fd; color: #1976d2;">${assessment.type}</span>
                </div>
                <p>${assessment.description}</p>
                <div class="assessment-meta" style="margin: 0.5rem 0; color: #666;">
                    <span>⏱️ ${assessment.duration} minutes</span>
                    <span style="margin-left: 1rem;">❓ ${assessment.questions} questions</span>
                    <span style="margin-left: 1rem;">🔄 ${assessment.attempts} attempts left</span>
                </div>
                <div class="assessment-deadline" style="margin: 0.5rem 0; color: #d32f2f;">
                    <span>📅 Due: ${new Date(assessment.deadline).toLocaleDateString()}</span>
                </div>
                <div class="assessment-actions" style="margin-top: 1rem;">
                    <button onclick="startAssessment('${assessment.id}')" class="btn btn-primary">
                        Start Assessment
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = assessmentsHTML;
        console.log(`✅ Available assessments updated: ${assessments.length} assessments`);
    }

    updateGoals(goals) {
        const container = document.getElementById('active-goals-list') || document.getElementById('goals-progress');
        if (!container) return;

        if (!goals || goals.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align: center; padding: 2rem;">
                    <h3>🎯 No Active Goals</h3>
                    <p>Set your first learning goal to track progress!</p>
                    <button onclick="createGoal()" class="btn btn-primary">Create Goal</button>
                </div>
            `;
            return;
        }

        const goalsHTML = goals.map(goal => `
            <div class="goal-card" style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                <div class="goal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4>${goal.title}</h4>
                    <span class="goal-progress" style="font-weight: bold; color: #4CAF50;">${goal.progress}%</span>
                </div>
                <p>${goal.description}</p>
                <div class="goal-progress-bar" style="width: 100%; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; margin: 1rem 0;">
                    <div class="progress-fill" style="height: 100%; background: linear-gradient(90deg, #4CAF50, #45a049); width: ${goal.progress}%;"></div>
                </div>
                <div class="goal-milestones" style="margin: 1rem 0;">
                    ${goal.milestones.map(milestone => `
                        <div class="milestone" style="display: flex; align-items: center; margin: 0.5rem 0; padding: 0.5rem; border-radius: 4px; background: ${milestone.completed ? '#e8f5e8' : '#f5f5f5'};">
                            <span class="milestone-icon" style="margin-right: 0.5rem;">${milestone.completed ? '✅' : '⏳'}</span>
                            <span class="milestone-title">${milestone.title}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="goal-deadline" style="color: #666; font-size: 0.9rem;">
                    <span>🎯 Target: ${new Date(goal.target_date).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = goalsHTML;
        console.log(`✅ Active goals updated: ${goals.length} goals`);
    }

    updateActivity(activities) {
        const container = document.getElementById('recent-activity-list') || document.getElementById('recent-activity');
        if (!container) return;

        if (!activities || activities.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align: center; padding: 2rem;">
                    <h3>📊 No Recent Activity</h3>
                    <p>Start learning to see your activity here!</p>
                </div>
            `;
            return;
        }

        const activitiesHTML = activities.map(activity => `
            <div class="activity-item" style="display: flex; align-items: center; padding: 0.75rem; border-bottom: 1px solid #e0e0e0;">
                <div class="activity-icon" style="font-size: 1.5rem; margin-right: 1rem;">
                    ${activity.type === 'lesson_completed' ? '📚' :
                      activity.type === 'assessment_submitted' ? '📝' :
                      activity.type === 'badge_earned' ? '🏆' :
                      activity.type === 'course_enrolled' ? '🎓' : '📊'}
                </div>
                <div class="activity-content" style="flex: 1;">
                    <h5 style="margin: 0 0 0.25rem 0;">${activity.title}</h5>
                    ${activity.course ? `<span class="activity-course" style="color: #666; font-size: 0.9rem;">${activity.course}</span>` : ''}
                    ${activity.points ? `<span class="activity-points" style="color: #4CAF50; font-weight: bold; margin-left: 1rem;">+${activity.points} points</span>` : ''}
                    ${activity.score ? `<span class="activity-score" style="color: #2196F3; margin-left: 1rem;">Score: ${activity.score}%</span>` : ''}
                </div>
                <div class="activity-time" style="color: #666; font-size: 0.8rem;">
                    ${this.formatTimeAgo(activity.timestamp)}
                </div>
            </div>
        `).join('');

        container.innerHTML = activitiesHTML;
        console.log(`✅ Recent activity updated: ${activities.length} activities`);
    }

    updateAvailableCourses(courses) {
        const container = document.getElementById('available-courses-list') || document.getElementById('available-courses');
        if (!container) return;

        if (!courses || courses.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align: center; padding: 2rem;">
                    <h3>📚 No Courses Available</h3>
                    <p>Check back later for new courses!</p>
                </div>
            `;
            return;
        }

        const coursesHTML = courses.map(course => `
            <div class="course-card" style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                <div class="course-header" style="margin-bottom: 0.5rem;">
                    <h3>${course.title}</h3>
                </div>
                <p>${course.description}</p>
                <div class="course-meta" style="margin: 0.5rem 0; color: #666;">
                    <span>📊 ${course.level}</span>
                    <span style="margin-left: 1rem;">⏱️ ${course.duration} weeks</span>
                    <span style="margin-left: 1rem;">📚 ${course.lessons} lessons</span>
                </div>
                <div class="course-actions" style="margin-top: 1rem;">
                    <button onclick="startCourse('${course.id}')" class="btn btn-primary" style="margin-right: 0.5rem;">
                        Start Course
                    </button>
                    <button onclick="viewCourseDetails('${course.id}')" class="btn btn-secondary">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = coursesHTML;
        console.log(`✅ Available courses updated: ${courses.length} courses`);
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

    setElementText(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    setupEventListeners() {
        // Menu navigation
        const menuItems = document.querySelectorAll('[data-section]');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.menuManager.showPage(section);
                
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
        await this.loadAllRealData();
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
    window.studentPortal.showNotification(`📚 Opening course ${courseId}...`, "info");
};

window.viewCourseProgress = function(courseId) {
    console.log(`📊 Viewing progress for course: ${courseId}`);
    window.studentPortal.showNotification(`📊 Loading progress for course ${courseId}...`, "info");
};

window.followRecommendation = function(recId) {
    console.log(`🤖 Following recommendation: ${recId}`);
    window.studentPortal.showNotification("🤖 Following AI recommendation...", "info");
};

window.startCourse = function(courseId) {
    console.log(`🚀 Starting course: ${courseId}`);
    window.studentPortal.showNotification(`🚀 Starting course ${courseId}...`, "info");
};

window.viewCourseDetails = function(courseId) {
    console.log(`📖 Viewing course details: ${courseId}`);
    window.studentPortal.showNotification(`📖 Loading course details...`, "info");
};

window.startAssessment = function(assessmentId) {
    console.log(`📝 Starting assessment: ${assessmentId}`);
    window.studentPortal.showNotification(`📝 Starting assessment...`, "info");
};

window.createGoal = function() {
    console.log(`🎯 Creating new goal`);
    window.studentPortal.showNotification(`🎯 Opening goal creation...`, "info");
};

window.refreshStudentData = function() {
    if (window.studentPortal) {
        window.studentPortal.refreshAllData();
    }
};

window.scrollToAvailableCourses = function() {
    const coursesSection = document.getElementById('available-courses');
    if (coursesSection) {
        coursesSection.scrollIntoView({ behavior: 'smooth' });
    }
};

// Additional utility functions
window.loadSectionData = function(section) {
    console.log(`📄 Loading section data: ${section}`);
    if (window.studentPortal) {
        // Trigger section-specific data loading if needed
        switch(section) {
            case 'courses':
                window.studentPortal.loadAdditionalRealData();
                break;
            case 'assessment':
                // Load assessment data
                break;
            case 'goals':
                // Load goals data
                break;
            default:
                break;
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.studentPortal = new StudentPortalManager();
    window.studentPortal.initialize();
});

console.log("🎓 Student Portal Real Data Integration loaded");
