/**
 * AgenticLearn Student Portal - Goals Module
 * Goal setting and tracking system integrated with dashboard
 * Green computing: Efficient data loading, minimal DOM updates
 */

import { UIComponents } from '../components/ui-components.js';

export class GoalsModule {
    constructor(apiClient) {
        this.api = apiClient;
        this.goalsData = null;
        this.currentGoal = null;
        this.wizardStep = 1;
    }

    /**
     * Initialize goals module
     */
    async initialize() {
        console.log('🎯 Initializing Goals Module...');
        // Module initialization complete
    }

    /**
     * Render goals content
     */
    async render() {
        try {
            console.log('🎨 Rendering Goals Module...');

            const container = document.getElementById('goals-content');
            if (!container) {
                console.error('❌ Goals container not found');
                return;
            }

            // Show loading state
            UIComponents.showLoading(container, '🎯 Loading Goals Center...');

            // Load goals data from backend
            await this.loadGoalsData();

            // Render goals interface
            this.renderGoalsInterface(container);

            console.log('✅ Goals Module rendered successfully');

        } catch (error) {
            console.error('❌ Failed to render goals:', error);
            UIComponents.showNotification('Failed to load goals: ' + error.message, 'error');
        }
    }

    /**
     * Load goals data from backend
     */
    async loadGoalsData() {
        try {
            if (!this.api) {
                throw new Error('API client not available');
            }

            // Try to load goals from backend
            const response = await this.api.getGoals();
            this.goalsData = response.data || response;

        } catch (error) {
            console.error('❌ Failed to load goals data:', error);
            // Use default data structure
            this.goalsData = this.getDefaultGoalsData();
        }
    }

    /**
     * Get default goals data structure
     */
    getDefaultGoalsData() {
        return {
            activeGoals: [],
            completedGoals: [],
            totalGoals: 0,
            completionRate: 0,
            categories: {
                career: 0,
                skill: 0,
                project: 0,
                academic: 0
            },
            upcomingMilestones: []
        };
    }

    /**
     * Render goals interface
     */
    renderGoalsInterface(container) {
        const { activeGoals, completedGoals, totalGoals, completionRate, categories, upcomingMilestones } = this.goalsData;

        const goalsHTML = `
            <!-- Goals Header -->
            <div class="goals-header">
                <div class="welcome-section">
                    <h1>🎯 Goals Center</h1>
                    <p>Set and track your learning goals to achieve success</p>
                </div>
            </div>

            <!-- Goals Overview -->
            <div class="goals-overview">
                <div class="stats-grid">
                    ${UIComponents.createStatsCard(
                        { title: 'Total Goals', icon: '🎯', color: '#667b68' },
                        { value: totalGoals, change: 'All time', trend: 'neutral' }
                    )}
                    ${UIComponents.createStatsCard(
                        { title: 'Active Goals', icon: '🚀', color: '#3b82f6' },
                        { value: activeGoals.length, change: 'In progress', trend: 'neutral' }
                    )}
                    ${UIComponents.createStatsCard(
                        { title: 'Completed Goals', icon: '✅', color: '#10b981' },
                        { value: completedGoals.length, change: 'Achieved', trend: 'up' }
                    )}
                    ${UIComponents.createStatsCard(
                        { title: 'Completion Rate', icon: '📈', color: '#f59e0b' },
                        { value: `${completionRate}%`, change: 'Success rate', trend: 'up' }
                    )}
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions">
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon">⚡</div>
                        <div>
                            <div class="card-title">Quick Actions</div>
                            <div class="card-subtitle">Get started with your goals</div>
                        </div>
                    </div>
                    <div class="actions-grid">
                        <button class="btn btn-primary" onclick="window.goalsModule.createNewGoal()">
                            🎯 Create New Goal
                        </button>
                        <button class="btn btn-secondary" onclick="window.goalsModule.viewAllGoals()">
                            📋 View All Goals
                        </button>
                        <button class="btn btn-secondary" onclick="window.goalsModule.viewProgress()">
                            📊 View Progress
                        </button>
                    </div>
                </div>
            </div>

            <!-- Active Goals -->
            ${activeGoals.length > 0 ? `
                <div class="active-goals-section">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-icon">🚀</div>
                            <div>
                                <div class="card-title">Active Goals</div>
                                <div class="card-subtitle">Your current learning objectives</div>
                            </div>
                        </div>
                        <div class="goals-list">
                            ${this.renderActiveGoals(activeGoals)}
                        </div>
                    </div>
                </div>
            ` : ''}

            <!-- Upcoming Milestones -->
            ${upcomingMilestones.length > 0 ? `
                <div class="milestones-section">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-icon">📅</div>
                            <div>
                                <div class="card-title">Upcoming Milestones</div>
                                <div class="card-subtitle">Important deadlines and checkpoints</div>
                            </div>
                        </div>
                        <div class="milestones-list">
                            ${this.renderUpcomingMilestones(upcomingMilestones)}
                        </div>
                    </div>
                </div>
            ` : ''}

            <!-- Goal Categories -->
            <div class="categories-section">
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon">📊</div>
                        <div>
                            <div class="card-title">Goals by Category</div>
                            <div class="card-subtitle">Distribution of your learning goals</div>
                        </div>
                    </div>
                    <div class="categories-grid">
                        ${this.renderGoalCategories(categories)}
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            ${totalGoals === 0 ? `
                <div class="empty-state">
                    <div class="card">
                        <div style="text-align: center; padding: 3rem;">
                            <div style="font-size: 4rem; margin-bottom: 1rem;">🎯</div>
                            <h3 style="margin-bottom: 1rem; color: #374151;">No Goals Set Yet</h3>
                            <p style="color: #6b7280; margin-bottom: 2rem;">
                                Start your learning journey by setting your first goal!
                            </p>
                            <button class="btn btn-primary" onclick="window.goalsModule.createNewGoal()">
                                🚀 Create Your First Goal
                            </button>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;

        container.innerHTML = goalsHTML;
        this.addGoalsStyles();
    }

    /**
     * Render active goals
     */
    renderActiveGoals(goals) {
        return goals.map(goal => `
            <div class="goal-item">
                <div class="goal-header">
                    <div class="goal-title">${goal.title}</div>
                    <div class="goal-category ${goal.category}">${this.getCategoryIcon(goal.category)} ${goal.category}</div>
                </div>
                <div class="goal-description">${goal.description}</div>
                <div class="goal-progress">
                    ${UIComponents.createProgressBar(goal.progress || 0, `${goal.progress || 0}% Complete`, '#667b68')}
                </div>
                <div class="goal-actions">
                    <button class="btn btn-sm btn-primary" onclick="window.goalsModule.viewGoal('${goal.id}')">
                        👁️ View
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="window.goalsModule.editGoal('${goal.id}')">
                        ✏️ Edit
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render upcoming milestones
     */
    renderUpcomingMilestones(milestones) {
        return milestones.map(milestone => `
            <div class="milestone-item">
                <div class="milestone-date">${milestone.date}</div>
                <div class="milestone-content">
                    <div class="milestone-title">${milestone.title}</div>
                    <div class="milestone-goal">${milestone.goalTitle}</div>
                </div>
                ${UIComponents.createBadge(milestone.priority || 'Medium', milestone.priority?.toLowerCase() || 'warning')}
            </div>
        `).join('');
    }

    /**
     * Render goal categories
     */
    renderGoalCategories(categories) {
        const categoryData = [
            { key: 'career', icon: '💼', label: 'Career', count: categories.career },
            { key: 'skill', icon: '🚀', label: 'Skills', count: categories.skill },
            { key: 'project', icon: '📋', label: 'Projects', count: categories.project },
            { key: 'academic', icon: '🎓', label: 'Academic', count: categories.academic }
        ];

        return categoryData.map(cat => `
            <div class="category-card">
                <div class="category-icon">${cat.icon}</div>
                <div class="category-label">${cat.label}</div>
                <div class="category-count">${cat.count} goals</div>
            </div>
        `).join('');
    }

    /**
     * Get category icon
     */
    getCategoryIcon(category) {
        const icons = {
            career: '💼',
            skill: '🚀',
            project: '📋',
            academic: '🎓'
        };
        return icons[category] || '🎯';
    }

    /**
     * Create new goal
     */
    createNewGoal() {
        console.log('🎯 Creating new goal...');
        UIComponents.showNotification('🚧 Goal creation wizard is under development. Coming soon!', 'info');
    }

    /**
     * View all goals
     */
    viewAllGoals() {
        console.log('📋 Viewing all goals...');
        UIComponents.showNotification('📋 Goals overview coming soon!', 'info');
    }

    /**
     * View progress
     */
    viewProgress() {
        console.log('📊 Viewing progress...');
        UIComponents.showNotification('📊 Progress analytics coming soon!', 'info');
    }

    /**
     * View specific goal
     */
    viewGoal(goalId) {
        console.log(`👁️ Viewing goal: ${goalId}`);
        UIComponents.showNotification(`👁️ Viewing goal details...`, 'info');
    }

    /**
     * Edit goal
     */
    editGoal(goalId) {
        console.log(`✏️ Editing goal: ${goalId}`);
        UIComponents.showNotification(`✏️ Editing goal...`, 'info');
    }

    /**
     * Add goals-specific styles
     */
    addGoalsStyles() {
        if (document.querySelector('#goals-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'goals-styles';
        styles.textContent = `
            .goals-header {
                margin-bottom: 2rem;
            }
            
            .goals-header h1 {
                font-size: 2rem;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 0.5rem;
            }
            
            .goals-header p {
                color: #6b7280;
                font-size: 1.125rem;
            }
            
            .goals-overview {
                margin-bottom: 2rem;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
            }
            
            .quick-actions {
                margin-bottom: 2rem;
            }
            
            .actions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 1rem;
            }
            
            .goal-item {
                padding: 1.5rem;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                margin-bottom: 1rem;
                background: #f9fafb;
                transition: all 0.2s;
            }
            
            .goal-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .goal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.75rem;
            }
            
            .goal-title {
                font-size: 1.125rem;
                font-weight: 600;
                color: #1f2937;
            }
            
            .goal-category {
                padding: 0.25rem 0.75rem;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 500;
                color: white;
            }
            
            .goal-category.career { background: #3b82f6; }
            .goal-category.skill { background: #10b981; }
            .goal-category.project { background: #f59e0b; }
            .goal-category.academic { background: #8b5cf6; }
            
            .goal-description {
                color: #6b7280;
                margin-bottom: 1rem;
                line-height: 1.5;
            }
            
            .goal-progress {
                margin-bottom: 1rem;
            }
            
            .goal-actions {
                display: flex;
                gap: 0.5rem;
            }
            
            .btn-sm {
                padding: 0.375rem 0.75rem;
                font-size: 0.875rem;
            }
            
            .milestone-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .milestone-item:last-child {
                border-bottom: none;
            }
            
            .milestone-date {
                font-size: 0.875rem;
                font-weight: 600;
                color: #667b68;
                min-width: 80px;
            }
            
            .milestone-title {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 0.25rem;
            }
            
            .milestone-goal {
                font-size: 0.875rem;
                color: #6b7280;
            }
            
            .categories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 1rem;
            }
            
            .category-card {
                text-align: center;
                padding: 1.5rem;
                background: #f9fafb;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
                transition: all 0.2s;
            }
            
            .category-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .category-icon {
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }
            
            .category-label {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 0.25rem;
            }
            
            .category-count {
                font-size: 0.875rem;
                color: #6b7280;
            }
            
            .btn {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 6px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                justify-content: center;
            }
            
            .btn-primary {
                background: #667b68;
                color: white;
            }
            
            .btn-primary:hover {
                background: #4a5a4c;
                transform: translateY(-1px);
            }
            
            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
            }
            
            .btn-secondary:hover {
                background: #e5e7eb;
            }
        `;
        
        document.head.appendChild(styles);
        
        // Expose module globally for button actions
        window.goalsModule = this;
    }

    /**
     * Refresh goals data
     */
    async refresh() {
        await this.loadGoalsData();
        const container = document.getElementById('goals-content');
        if (container) {
            this.renderGoalsInterface(container);
        }
    }
}
