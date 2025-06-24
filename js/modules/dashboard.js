/**
 * AgenticLearn Student Portal - Dashboard Module
 * Student learning dashboard with progress tracking and overview
 * Green computing: Efficient data loading, minimal DOM updates
 */

import { UIComponents } from '../components/ui-components.js';

export class DashboardModule {
    constructor() {
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
            // Get API client from global scope
            const apiClient = window.studentPortal?.api;
            if (!apiClient) {
                throw new Error('API client not available');
            }

            const response = await apiClient.getDashboardData();
            this.dashboardData = response.data || response;

        } catch (error) {
            console.error('❌ Failed to load dashboard data:', error);
            // Use default data structure for now
            this.dashboardData = this.getDefaultDashboardData();
        }
    }

    /**
     * Get default dashboard data structure
     */
    getDefaultDashboardData() {
        return {
            overview: {
                totalCourses: 0,
                activeCourses: 0,
                completedAssignments: 0,
                pendingAssignments: 0,
                overallProgress: 0,
                currentGPA: 0
            },
            recentActivity: [],
            upcomingDeadlines: [],
            achievements: [],
            recommendations: []
        };
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
