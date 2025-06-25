/**
 * AgenticLearn Student Portal - Study Planner Module
 * Smart study scheduling and time management following educator pattern
 * Green computing: Efficient calendar rendering, minimal DOM updates
 */

import { UIComponents } from '../components/ui-components.js';

export class StudyPlannerModule {
    constructor(apiClient) {
        this.api = apiClient;
        this.isLoading = false;
        this.currentTab = 'calendar'; // calendar, schedule, analytics
        this.currentView = 'week'; // week, month, day
        this.currentDate = new Date();
        this.studyPlans = [];
        this.studySessions = [];
        this.analytics = null;
        this.filters = {
            course: 'all',
            priority: 'all',
            status: 'all'
        };
    }

    /**
     * Initialize Study Planner module following educator pattern
     */
    async initialize() {
        console.log('📅 Initializing Study Planner Module...');
        await this.loadStudyData();
    }

    /**
     * Render Study Planner interface
     */
    async render() {
        try {
            console.log('🎨 Rendering Study Planner Module...');

            const container = document.getElementById('study-planner-content');
            if (!container) {
                console.error('❌ Study Planner container not found');
                return;
            }

            // Show loading state
            UIComponents.showLoading(container, '📅 Loading Study Planner...');

            // Load study data
            await this.loadStudyData();

            // Render study planner interface
            this.renderStudyPlannerInterface(container);

            console.log('✅ Study Planner Module rendered successfully');

        } catch (error) {
            console.error('❌ Failed to render study planner:', error);
            UIComponents.showNotification('Failed to load study planner: ' + error.message, 'error');
        }
    }

    /**
     * Load study data from backend
     */
    async loadStudyData() {
        try {
            this.isLoading = true;

            if (this.api) {
                // Load study plans
                const plansResponse = await this.api.getStudyPlans();
                this.studyPlans = plansResponse.data || plansResponse.plans || [];

                // Load study sessions
                const sessionsResponse = await this.api.getStudySessions();
                this.studySessions = sessionsResponse.data || sessionsResponse.sessions || [];

                // Load study analytics
                const analyticsResponse = await this.api.getStudyAnalytics();
                this.analytics = analyticsResponse.data || analyticsResponse;
            }
        } catch (error) {
            console.error('❌ Failed to load study data:', error);
            console.warn('⚠️ Using temporary fallback data - backend deployment pending');

            // TEMPORARY fallback data - will be removed after backend deployment
            this.studyPlans = [
                {
                    id: 'temp_plan1',
                    title: 'Backend Deployment Pending',
                    course: 'SYSTEM',
                    courseName: 'System Status',
                    startDate: '2025-06-25',
                    endDate: '2025-06-26',
                    priority: 'high',
                    status: 'pending',
                    progress: 0,
                    totalHours: 1,
                    completedHours: 0,
                    sessions: []
                }
            ];

            this.studySessions = [];

            this.analytics = {
                totalStudyTime: 0,
                averageSessionLength: 0,
                productivityScore: 0,
                streakDays: 0,
                preferredStudyTime: 'TBD',
                mostProductiveSubject: 'TBD',
                weeklyGoal: 0,
                weeklyProgress: 0,
                recommendations: [
                    {
                        type: 'system',
                        title: 'Backend Deployment Required',
                        description: 'Study analytics will be available after backend deployment',
                        priority: 'high'
                    }
                ]
            };
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Render study planner interface following educator pattern
     */
    renderStudyPlannerInterface(container) {
        const studyPlannerHTML = `
            <div class="study-planner-container">
                <!-- Study Planner Header -->
                <div class="study-planner-header">
                    <div class="planner-title-section">
                        <h1>📅 Study Planner</h1>
                        <p>Smart scheduling and time management for optimal learning</p>
                    </div>
                    
                    <!-- Study Planner Tabs -->
                    <div class="planner-tabs">
                        <button class="tab-btn ${this.currentTab === 'calendar' ? 'active' : ''}" 
                                onclick="window.studyPlannerModule.switchTab('calendar')">
                            📅 Calendar
                        </button>
                        <button class="tab-btn ${this.currentTab === 'schedule' ? 'active' : ''}" 
                                onclick="window.studyPlannerModule.switchTab('schedule')">
                            📋 Schedule
                        </button>
                        <button class="tab-btn ${this.currentTab === 'analytics' ? 'active' : ''}" 
                                onclick="window.studyPlannerModule.switchTab('analytics')">
                            📊 Analytics
                        </button>
                    </div>
                </div>

                <!-- Study Planner Content -->
                <div class="planner-content">
                    <!-- Calendar Tab -->
                    <div id="calendar-tab" class="tab-content ${this.currentTab === 'calendar' ? 'active' : ''}">
                        ${this.renderCalendarInterface()}
                    </div>

                    <!-- Schedule Tab -->
                    <div id="schedule-tab" class="tab-content ${this.currentTab === 'schedule' ? 'active' : ''}">
                        ${this.renderScheduleInterface()}
                    </div>

                    <!-- Analytics Tab -->
                    <div id="analytics-tab" class="tab-content ${this.currentTab === 'analytics' ? 'active' : ''}">
                        ${this.renderAnalyticsInterface()}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = studyPlannerHTML;
        this.addStudyPlannerStyles();
        
        // Expose module globally for button actions
        window.studyPlannerModule = this;
    }

    /**
     * Render calendar interface
     */
    renderCalendarInterface() {
        const today = new Date();
        const weekDays = this.getWeekDays(today);
        
        return `
            <div class="calendar-container">
                <!-- Calendar Header -->
                <div class="calendar-header">
                    <div class="calendar-navigation">
                        <button class="btn btn-secondary" onclick="window.studyPlannerModule.previousWeek()">
                            ← Previous Week
                        </button>
                        <h3>${this.formatWeekRange(weekDays)}</h3>
                        <button class="btn btn-secondary" onclick="window.studyPlannerModule.nextWeek()">
                            Next Week →
                        </button>
                    </div>
                    <button class="btn btn-primary" onclick="window.studyPlannerModule.createStudySession()">
                        ➕ Add Study Session
                    </button>
                </div>

                <!-- Weekly Calendar Grid -->
                <div class="calendar-grid">
                    ${weekDays.map(day => this.renderDayColumn(day)).join('')}
                </div>

                <!-- Quick Stats -->
                <div class="calendar-stats">
                    ${UIComponents.createStatsCard(
                        { title: 'This Week', icon: '📊', color: '#667b68' },
                        { value: `${Math.floor(this.analytics.totalStudyTime / 60)}h ${this.analytics.totalStudyTime % 60}m`, change: 'Study Time', trend: 'up' }
                    )}
                    ${UIComponents.createStatsCard(
                        { title: 'Productivity', icon: '🎯', color: '#10b981' },
                        { value: `${this.analytics.productivityScore}%`, change: 'Average Score', trend: 'up' }
                    )}
                    ${UIComponents.createStatsCard(
                        { title: 'Study Streak', icon: '🔥', color: '#f59e0b' },
                        { value: `${this.analytics.streakDays} days`, change: 'Current Streak', trend: 'up' }
                    )}
                </div>
            </div>
        `;
    }

    /**
     * Render schedule interface
     */
    renderScheduleInterface() {
        if (!this.studyPlans || this.studyPlans.length === 0) {
            return UIComponents.createEmptyState(
                'No Study Plans',
                'Create your first study plan to get started with organized learning.',
                { label: 'Create Study Plan', onclick: 'window.studyPlannerModule.createStudyPlan()' }
            );
        }

        return `
            <div class="schedule-container">
                <!-- Schedule Header -->
                <div class="schedule-header">
                    <h2>📋 Active Study Plans</h2>
                    <button class="btn btn-primary" onclick="window.studyPlannerModule.createStudyPlan()">
                        ➕ Create Study Plan
                    </button>
                </div>

                <!-- Study Plans Grid -->
                <div class="study-plans-grid">
                    ${this.studyPlans.map(plan => this.renderStudyPlanCard(plan)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render analytics interface
     */
    renderAnalyticsInterface() {
        return `
            <div class="analytics-container">
                <!-- Analytics Overview -->
                <div class="analytics-overview">
                    <h2>📊 Study Analytics</h2>
                    <div class="analytics-stats">
                        ${UIComponents.createStatsCard(
                            { title: 'Weekly Goal', icon: '🎯', color: '#667b68' },
                            { value: `${this.analytics.weeklyProgress}%`, change: `${Math.floor(this.analytics.totalStudyTime / 60)}h / ${Math.floor(this.analytics.weeklyGoal / 60)}h`, trend: 'up' }
                        )}
                        ${UIComponents.createStatsCard(
                            { title: 'Avg Session', icon: '⏱️', color: '#3b82f6' },
                            { value: `${Math.floor(this.analytics.averageSessionLength / 60)}h ${this.analytics.averageSessionLength % 60}m`, change: 'Duration', trend: 'neutral' }
                        )}
                        ${UIComponents.createStatsCard(
                            { title: 'Best Subject', icon: '🏆', color: '#10b981' },
                            { value: this.analytics.mostProductiveSubject, change: 'Highest Productivity', trend: 'up' }
                        )}
                        ${UIComponents.createStatsCard(
                            { title: 'Peak Time', icon: '🌅', color: '#f59e0b' },
                            { value: this.analytics.preferredStudyTime, change: 'Most Productive', trend: 'neutral' }
                        )}
                    </div>
                </div>

                <!-- AI Recommendations -->
                <div class="recommendations-section">
                    <h3>🤖 AI Recommendations</h3>
                    <div class="recommendations-grid">
                        ${this.analytics.recommendations.map(rec => this.renderRecommendationCard(rec)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get week days for calendar
     */
    getWeekDays(date) {
        const week = [];
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            week.push(day);
        }
        return week;
    }

    /**
     * Format week range
     */
    formatWeekRange(weekDays) {
        const start = weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const end = weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${start} - ${end}`;
    }

    /**
     * Render day column for calendar
     */
    renderDayColumn(date) {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNumber = date.getDate();
        const isToday = date.toDateString() === new Date().toDateString();
        const dateString = date.toISOString().split('T')[0];

        // Get sessions for this day
        const daySessions = this.studySessions.filter(session => session.date === dateString);

        return `
            <div class="day-column ${isToday ? 'today' : ''}">
                <div class="day-header">
                    <div class="day-name">${dayName}</div>
                    <div class="day-number">${dayNumber}</div>
                </div>
                <div class="day-sessions">
                    ${daySessions.map(session => this.renderSessionCard(session)).join('')}
                    <button class="add-session-btn" onclick="window.studyPlannerModule.addSessionToDay('${dateString}')">
                        ➕ Add Session
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render session card
     */
    renderSessionCard(session) {
        const statusClass = session.status === 'completed' ? 'completed' : 'scheduled';
        const typeIcon = {
            'study': '📚',
            'practice': '💻',
            'reading': '📖',
            'review': '🔄'
        }[session.type] || '📝';

        return `
            <div class="session-card ${statusClass}" onclick="window.studyPlannerModule.viewSession('${session.id}')">
                <div class="session-time">${session.time}</div>
                <div class="session-content">
                    <div class="session-title">${typeIcon} ${session.topic}</div>
                    <div class="session-course">${session.course}</div>
                    <div class="session-duration">${session.duration}min</div>
                </div>
                ${session.status === 'completed' && session.productivity ? `
                    <div class="session-productivity">${session.productivity}%</div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render study plan card
     */
    renderStudyPlanCard(plan) {
        return UIComponents.createCard(
            `📋 ${plan.title}`,
            `
                <div class="plan-meta">
                    <span class="plan-course">${plan.courseName}</span>
                    ${UIComponents.createBadge(plan.priority, plan.priority === 'high' ? 'error' : 'warning')}
                    ${UIComponents.createBadge(plan.status, 'success')}
                </div>
                <div class="plan-progress">
                    ${UIComponents.createProgressBar(plan.progress, `${plan.completedHours}h / ${plan.totalHours}h`, '#667b68')}
                </div>
                <div class="plan-dates">
                    📅 ${new Date(plan.startDate).toLocaleDateString()} - ${new Date(plan.endDate).toLocaleDateString()}
                </div>
                <div class="plan-sessions">
                    📚 ${plan.sessions.filter(s => s.completed).length}/${plan.sessions.length} sessions completed
                </div>
            `,
            [
                { label: 'View Plan', onclick: `window.studyPlannerModule.viewStudyPlan('${plan.id}')`, type: 'primary' },
                { label: 'Edit', onclick: `window.studyPlannerModule.editStudyPlan('${plan.id}')`, type: 'secondary' }
            ]
        );
    }

    /**
     * Render recommendation card
     */
    renderRecommendationCard(recommendation) {
        return UIComponents.createCard(
            `💡 ${recommendation.title}`,
            `
                <p>${recommendation.description}</p>
                <div style="margin-top: 1rem;">
                    ${UIComponents.createBadge(recommendation.priority, recommendation.priority === 'high' ? 'error' : 'warning')}
                    ${UIComponents.createBadge(recommendation.type, 'info')}
                </div>
            `,
            [
                { label: 'Apply Suggestion', onclick: `window.studyPlannerModule.applyRecommendation('${recommendation.type}')`, type: 'primary' }
            ]
        );
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        console.log(`🔄 Switching to ${tabName} tab`);
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[onclick*="'${tabName}'"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    /**
     * Navigation methods
     */
    previousWeek() {
        this.currentDate.setDate(this.currentDate.getDate() - 7);
        this.render();
    }

    nextWeek() {
        this.currentDate.setDate(this.currentDate.getDate() + 7);
        this.render();
    }

    /**
     * Study session methods
     */
    createStudySession() {
        console.log('➕ Creating new study session...');
        UIComponents.showNotification('🚧 Study session creation coming soon!', 'info');
    }

    addSessionToDay(date) {
        console.log(`➕ Adding session to ${date}...`);
        UIComponents.showNotification(`📅 Adding session to ${date}...`, 'info');
    }

    viewSession(sessionId) {
        console.log(`👁️ Viewing session: ${sessionId}`);
        UIComponents.showNotification('📝 Session details coming soon!', 'info');
    }

    /**
     * Study plan methods
     */
    createStudyPlan() {
        console.log('📋 Creating new study plan...');
        UIComponents.showNotification('🚧 Study plan creation coming soon!', 'info');
    }

    viewStudyPlan(planId) {
        console.log(`👁️ Viewing study plan: ${planId}`);
        UIComponents.showNotification('📋 Study plan details coming soon!', 'info');
    }

    editStudyPlan(planId) {
        console.log(`✏️ Editing study plan: ${planId}`);
        UIComponents.showNotification('✏️ Study plan editing coming soon!', 'info');
    }

    applyRecommendation(type) {
        console.log(`💡 Applying recommendation: ${type}`);
        UIComponents.showNotification(`🤖 Applying ${type} recommendation...`, 'info');
    }

    /**
     * Add study planner specific styles
     */
    addStudyPlannerStyles() {
        if (document.querySelector('#study-planner-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'study-planner-styles';
        styles.textContent = `
            /* Study Planner Container */
            .study-planner-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 1rem;
            }

            /* Study Planner Header */
            .study-planner-header {
                margin-bottom: 2rem;
            }

            .planner-title-section h1 {
                font-size: 2rem;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 0.5rem;
            }

            .planner-title-section p {
                color: #6b7280;
                font-size: 1.125rem;
                margin-bottom: 2rem;
            }

            /* Study Planner Tabs */
            .planner-tabs {
                display: flex;
                gap: 0.5rem;
                border-bottom: 1px solid #e5e7eb;
                margin-bottom: 2rem;
            }

            .tab-btn {
                padding: 0.75rem 1.5rem;
                border: none;
                background: none;
                color: #6b7280;
                font-weight: 500;
                cursor: pointer;
                border-bottom: 2px solid transparent;
                transition: all 0.2s;
            }

            .tab-btn.active {
                color: #667b68;
                border-bottom-color: #667b68;
            }

            .tab-btn:hover {
                color: #374151;
            }

            /* Tab Content */
            .tab-content {
                display: none;
            }

            .tab-content.active {
                display: block;
            }

            /* Calendar Interface */
            .calendar-container {
                background: white;
                border-radius: 12px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }

            .calendar-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid #e5e7eb;
                background: #f9fafb;
            }

            .calendar-navigation {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .calendar-navigation h3 {
                margin: 0;
                color: #1f2937;
                font-weight: 600;
            }

            .calendar-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 1px;
                background: #e5e7eb;
                padding: 1px;
            }

            .day-column {
                background: white;
                min-height: 200px;
                display: flex;
                flex-direction: column;
            }

            .day-column.today {
                background: #f0f9ff;
            }

            .day-header {
                padding: 0.75rem;
                border-bottom: 1px solid #f3f4f6;
                text-align: center;
                background: #f9fafb;
            }

            .day-column.today .day-header {
                background: #dbeafe;
            }

            .day-name {
                font-size: 0.75rem;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
                margin-bottom: 0.25rem;
            }

            .day-number {
                font-size: 1.125rem;
                font-weight: 700;
                color: #1f2937;
            }

            .day-column.today .day-number {
                color: #1d4ed8;
            }

            .day-sessions {
                flex: 1;
                padding: 0.5rem;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .session-card {
                background: #f3f4f6;
                border-radius: 6px;
                padding: 0.5rem;
                cursor: pointer;
                transition: all 0.2s;
                border-left: 3px solid #6b7280;
            }

            .session-card:hover {
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .session-card.completed {
                background: #f0fdf4;
                border-left-color: #10b981;
            }

            .session-card.scheduled {
                background: #fef3c7;
                border-left-color: #f59e0b;
            }

            .session-time {
                font-size: 0.75rem;
                font-weight: 600;
                color: #667b68;
                margin-bottom: 0.25rem;
            }

            .session-title {
                font-size: 0.875rem;
                font-weight: 500;
                color: #1f2937;
                margin-bottom: 0.25rem;
            }

            .session-course {
                font-size: 0.75rem;
                color: #6b7280;
                margin-bottom: 0.25rem;
            }

            .session-duration {
                font-size: 0.75rem;
                color: #667b68;
                font-weight: 500;
            }

            .session-productivity {
                font-size: 0.75rem;
                color: #10b981;
                font-weight: 600;
                text-align: right;
            }

            .add-session-btn {
                background: none;
                border: 2px dashed #d1d5db;
                border-radius: 6px;
                padding: 0.5rem;
                color: #6b7280;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 0.875rem;
            }

            .add-session-btn:hover {
                border-color: #667b68;
                color: #667b68;
                background: #f9fafb;
            }

            .calendar-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
                padding: 1.5rem;
                background: #f9fafb;
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Refresh study planner data
     */
    async refresh() {
        await this.loadStudyData();
        const container = document.getElementById('study-planner-content');
        if (container) {
            this.renderStudyPlannerInterface(container);
        }
    }
}
