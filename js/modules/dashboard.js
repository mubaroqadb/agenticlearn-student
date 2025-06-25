/**
 * AgenticLearn Student Portal - Dashboard Module
 * Student learning dashboard with progress tracking and overview
 * Green computing: Efficient data loading, minimal DOM updates
 */

import { UIComponents } from '../components/ui-components.js';

export class DashboardModule {
    constructor(apiClient) {
        this.api = apiClient;
        this.dashboardData = null;
        this.refreshInterval = null;
    }

    /**
     * Initialize dashboard module
     */
    async initialize() {
        console.log('📊 Initializing Dashboard Module...');
        // Module initialization complete
    }

    /**
     * Render dashboard content
     */
    async render() {
        try {
            console.log('🎨 Rendering Student Dashboard...');

            const container = document.getElementById('dashboard-content');
            if (!container) {
                console.error('❌ Dashboard container not found');
                return;
            }

            // Show loading state
            UIComponents.showLoading(container, '🎓 Loading Student Dashboard...');

            // Load dashboard data from backend
            await this.loadDashboardData();

            // Render dashboard interface
            this.renderDashboardInterface(container);

            console.log('✅ Student Dashboard rendered successfully');

        } catch (error) {
            console.error('❌ Failed to render dashboard:', error);
            UIComponents.showNotification('Failed to load dashboard: ' + error.message, 'error');
        }
    }

    /**
     * Load dashboard data from backend
     */
    async loadDashboardData() {
        try {
            if (!this.api) {
                throw new Error('API client not available');
            }

            const response = await this.api.getDashboardData();
            console.log('📊 Dashboard response:', response);

            // Handle the response structure from backend
            const data = response.data || response;

            // Transform backend data to dashboard format
            this.dashboardData = {
                overview: {
                    totalCourses: data.enrolled_courses || 0,
                    activeCourses: data.in_progress || 0,
                    completedAssignments: data.completed_lessons || 0,
                    pendingAssignments: (data.total_lessons || 0) - (data.completed_lessons || 0),
                    overallProgress: data.overall_progress || 0,
                    currentGPA: 3.75 // Default since not in backend yet
                },
                recentActivity: this.transformRecentActivity(data.recent_achievements || []),
                upcomingDeadlines: this.generateUpcomingDeadlines(data.upcoming_deadlines || 0),
                achievements: data.recent_achievements || [],
                recommendations: this.generateRecommendations(data)
            };

        } catch (error) {
            console.error('❌ Failed to load dashboard data:', error);
            // Show error to user instead of using fallback data
            throw new Error('Unable to load dashboard data. Please check your connection and try again.');
        }
    }



    /**
     * Render assessment status cards
     */
    renderAssessmentStatus() {
        // Get assessment data from localStorage or API
        const assessmentData = this.getAssessmentData();

        return `
            <div class="assessment-grid">
                <div class="assessment-card ${assessmentData.digitalSkills.completed ? 'completed' : 'pending'}">
                    <div class="assessment-icon">💻</div>
                    <div class="assessment-info">
                        <div class="assessment-title">Digital Skills Assessment</div>
                        <div class="assessment-status">
                            ${assessmentData.digitalSkills.completed ?
                                `✅ Completed (${assessmentData.digitalSkills.score}%)` :
                                '⏳ Pending'
                            }
                        </div>
                        ${assessmentData.digitalSkills.completed ?
                            `<div class="assessment-result">${assessmentData.digitalSkills.level}</div>
                             <div class="assessment-actions" style="margin-top: 0.5rem;">
                                 <button class="btn-secondary btn-sm" onclick="window.assessmentModule.viewResults('digital-skills')" style="margin-right: 0.5rem;">📊 View Results</button>
                                 <button class="btn-primary btn-sm" onclick="window.assessmentModule.retakeAssessment('digital-skills')">🔄 Retake</button>
                             </div>` :
                            '<button class="btn-primary btn-sm" onclick="window.studentPortal.startAssessment(\'digital-skills\')">Start Assessment</button>'
                        }
                    </div>
                </div>

                <div class="assessment-card ${assessmentData.learningStyle.completed ? 'completed' : 'pending'}">
                    <div class="assessment-icon">🧠</div>
                    <div class="assessment-info">
                        <div class="assessment-title">Learning Style Assessment</div>
                        <div class="assessment-status">
                            ${assessmentData.learningStyle.completed ?
                                `✅ Completed` :
                                '⏳ Pending'
                            }
                        </div>
                        ${assessmentData.learningStyle.completed ?
                            `<div class="assessment-result">${assessmentData.learningStyle.style}</div>
                             <div class="assessment-actions" style="margin-top: 0.5rem;">
                                 <button class="btn-secondary btn-sm" onclick="window.assessmentModule.viewResults('learning-style')" style="margin-right: 0.5rem;">📊 View Results</button>
                                 <button class="btn-primary btn-sm" onclick="window.assessmentModule.retakeAssessment('learning-style')">🔄 Retake</button>
                             </div>` :
                            '<button class="btn-primary btn-sm" onclick="window.studentPortal.startAssessment(\'learning-style\')">Start Assessment</button>'
                        }
                    </div>
                </div>

                ${assessmentData.digitalSkills.completed && assessmentData.learningStyle.completed ?
                    `<div class="assessment-card completed profile-ready">
                        <div class="assessment-icon">👤</div>
                        <div class="assessment-info">
                            <div class="assessment-title">Learning Profile</div>
                            <div class="assessment-status">✅ Profile Created</div>
                            <div class="assessment-result">Personalized recommendations active</div>
                        </div>
                    </div>` :
                    `<div class="assessment-card pending">
                        <div class="assessment-icon">👤</div>
                        <div class="assessment-info">
                            <div class="assessment-title">Learning Profile</div>
                            <div class="assessment-status">⏳ Complete assessments to create profile</div>
                        </div>
                    </div>`
                }
            </div>
        `;
    }

    /**
     * Get assessment data from localStorage or API
     */
    getAssessmentData() {
        // Try to get from localStorage first
        const stored = localStorage.getItem('agenticlearn_assessments');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.warn('Failed to parse stored assessment data');
            }
        }

        // Default assessment data structure
        return {
            digitalSkills: {
                completed: false,
                score: 0,
                level: '',
                completedAt: null
            },
            learningStyle: {
                completed: false,
                style: '',
                preferences: [],
                completedAt: null
            }
        };
    }

    /**
     * Transform recent achievements to activity format
     */
    transformRecentActivity(achievements) {
        return achievements.map(achievement => ({
            icon: '🏆',
            title: achievement.title,
            time: this.formatTimeAgo(achievement.achieved_at)
        }));
    }

    /**
     * Generate upcoming deadlines
     */
    generateUpcomingDeadlines(count) {
        const deadlines = [];
        for (let i = 0; i < Math.min(count, 3); i++) {
            deadlines.push({
                date: this.formatDate(new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000)),
                title: `Assignment ${i + 1}`,
                course: 'Course Name',
                priority: i === 0 ? 'High' : 'Medium'
            });
        }
        return deadlines;
    }

    /**
     * Generate AI recommendations based on data
     */
    generateRecommendations(data) {
        const recommendations = [];

        if (data.overall_progress < 50) {
            recommendations.push({
                title: 'Boost Your Progress',
                description: 'Complete more lessons to improve your overall progress',
                action: 'window.studentPortal.loadPage("courses")',
                actionText: 'View Courses'
            });
        }

        if (data.study_streak < 7) {
            recommendations.push({
                title: 'Build Study Habit',
                description: 'Maintain a daily study streak for better learning outcomes',
                action: 'window.studentPortal.loadPage("study-planner")',
                actionText: 'Plan Study'
            });
        }

        return recommendations;
    }

    /**
     * Format time ago
     */
    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    }

    /**
     * Format date
     */
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Render dashboard interface
     */
    renderDashboardInterface(container) {
        const { overview, recentActivity, upcomingDeadlines, achievements, recommendations } = this.dashboardData;

        const dashboardHTML = `
            <!-- Dashboard Header -->
            <div class="dashboard-header">
                <div class="welcome-section">
                    <h1>🎓 Student Dashboard</h1>
                    <p>Track your learning progress and stay on top of your studies</p>
                </div>
            </div>

            <!-- Overview Stats -->
            <div class="stats-grid">
                ${UIComponents.createStatsCard(
                    { title: 'Total Courses', icon: '📚', color: '#667b68' },
                    { value: overview.totalCourses, change: '+2 this semester', trend: 'up' }
                )}
                ${UIComponents.createStatsCard(
                    { title: 'Active Courses', icon: '📖', color: '#3b82f6' },
                    { value: overview.activeCourses, change: 'In progress', trend: 'neutral' }
                )}
                ${UIComponents.createStatsCard(
                    { title: 'Completed Assignments', icon: '✅', color: '#10b981' },
                    { value: overview.completedAssignments, change: '+3 this week', trend: 'up' }
                )}
                ${UIComponents.createStatsCard(
                    { title: 'Pending Assignments', icon: '⏰', color: '#f59e0b' },
                    { value: overview.pendingAssignments, change: 'Due soon', trend: 'neutral' }
                )}
            </div>

            <!-- Progress Overview -->
            <div class="progress-section">
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon">📈</div>
                        <div>
                            <div class="card-title">Learning Progress</div>
                            <div class="card-subtitle">Your overall academic progress</div>
                        </div>
                    </div>
                    <div class="progress-content">
                        ${UIComponents.createProgressBar(overview.overallProgress, 'Overall Progress', '#667b68')}
                        <div class="gpa-display">
                            <span class="gpa-label">Current GPA:</span>
                            <span class="gpa-value">${overview.currentGPA.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Assessment Status Section -->
            <div class="assessment-status-section">
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon">🎯</div>
                        <div>
                            <div class="card-title">Assessment Status</div>
                            <div class="card-subtitle">Complete assessments to personalize your learning</div>
                        </div>
                        <button class="btn-secondary" onclick="window.studentPortal.loadPage('assessment')">
                            Take Assessment
                        </button>
                    </div>
                    <div class="assessment-cards">
                        ${this.renderAssessmentStatus()}
                    </div>
                </div>
            </div>

            <!-- Dashboard Grid -->
            <div class="dashboard-grid">
                <!-- Recent Activity -->
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon">🕒</div>
                        <div>
                            <div class="card-title">Recent Activity</div>
                            <div class="card-subtitle">Your latest learning activities</div>
                        </div>
                    </div>
                    <div class="activity-list">
                        ${this.renderRecentActivity(recentActivity)}
                    </div>
                </div>

                <!-- Upcoming Deadlines -->
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon">📅</div>
                        <div>
                            <div class="card-title">Upcoming Deadlines</div>
                            <div class="card-subtitle">Don't miss these important dates</div>
                        </div>
                    </div>
                    <div class="deadlines-list">
                        ${this.renderUpcomingDeadlines(upcomingDeadlines)}
                    </div>
                </div>

                <!-- Achievements -->
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon">🏆</div>
                        <div>
                            <div class="card-title">Achievements</div>
                            <div class="card-subtitle">Your learning milestones</div>
                        </div>
                    </div>
                    <div class="achievements-list">
                        ${this.renderAchievements(achievements)}
                    </div>
                </div>

                <!-- AI Recommendations -->
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon">🤖</div>
                        <div>
                            <div class="card-title">AI Recommendations</div>
                            <div class="card-subtitle">Personalized learning suggestions</div>
                        </div>
                    </div>
                    <div class="recommendations-list">
                        ${this.renderRecommendations(recommendations)}
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions">
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon">⚡</div>
                        <div>
                            <div class="card-title">Quick Actions</div>
                            <div class="card-subtitle">Common tasks and shortcuts</div>
                        </div>
                    </div>
                    <div class="actions-grid">
                        <button class="action-btn" onclick="window.studentPortal.loadPage('courses')">
                            📚 View Courses
                        </button>
                        <button class="action-btn" onclick="window.studentPortal.loadPage('assignments')">
                            📝 Check Assignments
                        </button>
                        <button class="action-btn" onclick="window.studentPortal.loadPage('grades')">
                            📊 View Grades
                        </button>
                        <button class="action-btn" onclick="window.studentPortal.loadPage('ai-tutor')">
                            🤖 Ask AI Tutor
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = dashboardHTML;
        this.addDashboardStyles();
    }

    /**
     * Render recent activity list
     */
    renderRecentActivity(activities) {
        if (!activities || activities.length === 0) {
            return '<div class="empty-state">No recent activity</div>';
        }

        return activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon || '📝'}</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render upcoming deadlines
     */
    renderUpcomingDeadlines(deadlines) {
        if (!deadlines || deadlines.length === 0) {
            return '<div class="empty-state">No upcoming deadlines</div>';
        }

        return deadlines.map(deadline => `
            <div class="deadline-item">
                <div class="deadline-date">${deadline.date}</div>
                <div class="deadline-content">
                    <div class="deadline-title">${deadline.title}</div>
                    <div class="deadline-course">${deadline.course}</div>
                </div>
                ${UIComponents.createBadge(deadline.priority || 'Medium', deadline.priority?.toLowerCase() || 'warning')}
            </div>
        `).join('');
    }

    /**
     * Render achievements
     */
    renderAchievements(achievements) {
        if (!achievements || achievements.length === 0) {
            return '<div class="empty-state">No achievements yet</div>';
        }

        return achievements.map(achievement => `
            <div class="achievement-item">
                <div class="achievement-icon">${achievement.icon || '🏆'}</div>
                <div class="achievement-content">
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render AI recommendations
     */
    renderRecommendations(recommendations) {
        if (!recommendations || recommendations.length === 0) {
            return '<div class="empty-state">No recommendations available</div>';
        }

        return recommendations.map(rec => `
            <div class="recommendation-item">
                <div class="recommendation-content">
                    <div class="recommendation-title">${rec.title}</div>
                    <div class="recommendation-description">${rec.description}</div>
                </div>
                <button class="recommendation-action" onclick="${rec.action || ''}">
                    ${rec.actionText || 'Learn More'}
                </button>
            </div>
        `).join('');
    }

    /**
     * Add dashboard-specific styles
     */
    addDashboardStyles() {
        if (document.querySelector('#dashboard-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'dashboard-styles';
        styles.textContent = `
            .dashboard-header {
                margin-bottom: 2rem;
            }
            
            .welcome-section h1 {
                font-size: 2rem;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 0.5rem;
            }
            
            .welcome-section p {
                color: #6b7280;
                font-size: 1.125rem;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }
            
            .stats-card {
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .stats-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .stats-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1rem;
            }
            
            .stats-icon {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                color: white;
            }
            
            .stats-title {
                font-size: 0.875rem;
                color: #6b7280;
                font-weight: 500;
            }
            
            .stats-value {
                font-size: 1.875rem;
                font-weight: 700;
                color: #1f2937;
            }
            
            .stats-change {
                font-size: 0.875rem;
                font-weight: 500;
            }
            
            .stats-change.positive { color: #10b981; }
            .stats-change.negative { color: #ef4444; }
            .stats-change.neutral { color: #6b7280; }
            
            .progress-section {
                margin-bottom: 2rem;
            }
            
            .progress-content {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .gpa-display {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                background: #f9fafb;
                border-radius: 8px;
            }
            
            .gpa-label {
                font-weight: 500;
                color: #6b7280;
            }
            
            .gpa-value {
                font-size: 1.5rem;
                font-weight: 700;
                color: #667b68;
            }
            
            .dashboard-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }
            
            .activity-item, .deadline-item, .achievement-item, .recommendation-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .activity-item:last-child, .deadline-item:last-child, 
            .achievement-item:last-child, .recommendation-item:last-child {
                border-bottom: none;
            }
            
            .activity-icon, .achievement-icon {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                background: #f3f4f6;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
            }
            
            .activity-title, .deadline-title, .achievement-title, .recommendation-title {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 0.25rem;
            }
            
            .activity-time, .deadline-course, .achievement-description, .recommendation-description {
                font-size: 0.875rem;
                color: #6b7280;
            }
            
            .deadline-date {
                font-size: 0.875rem;
                font-weight: 600;
                color: #667b68;
                min-width: 60px;
            }
            
            .actions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 1rem;
            }
            
            .action-btn {
                padding: 1rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                background: white;
                color: #374151;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .action-btn:hover {
                border-color: #667b68;
                background: #667b68;
                color: white;
            }
            
            .recommendation-action {
                padding: 0.5rem 1rem;
                background: #667b68;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 0.875rem;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .recommendation-action:hover {
                background: #4a5a4c;
            }
            
            .empty-state {
                text-align: center;
                color: #6b7280;
                padding: 2rem;
                font-style: italic;
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * Refresh dashboard data
     */
    async refresh() {
        console.log('🔄 Refreshing dashboard data...');
        await this.render();
    }
}
