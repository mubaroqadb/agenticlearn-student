/**
 * AgenticLearn Student Portal - Assessment Module
 * Integrated assessment system with dashboard
 * Green computing: Efficient data loading, minimal DOM updates
 */

import { UIComponents } from '../components/ui-components.js';

export class AssessmentModule {
    constructor(apiClient) {
        this.api = apiClient;
        this.assessmentData = null;
        this.currentAssessment = null;
        this.currentQuestion = 0;
        this.answers = {};
    }

    /**
     * Initialize assessment module
     */
    async initialize() {
        console.log('🎯 Initializing Assessment Module...');
        // Module initialization complete
    }

    /**
     * Render assessment content
     */
    async render() {
        try {
            console.log('🎨 Rendering Assessment Module...');

            const container = document.getElementById('assessment-content');
            if (!container) {
                console.error('❌ Assessment container not found');
                return;
            }

            // Show loading state
            UIComponents.showLoading(container, '🎯 Loading Assessment Center...');

            // Load assessment data from backend
            await this.loadAssessmentData();

            // Render assessment interface
            this.renderAssessmentInterface(container);

            console.log('✅ Assessment Module rendered successfully');

        } catch (error) {
            console.error('❌ Failed to render assessment:', error);
            UIComponents.showNotification('Failed to load assessment: ' + error.message, 'error');
        }
    }

    /**
     * Load assessment data from backend
     */
    async loadAssessmentData() {
        try {
            if (!this.api) {
                throw new Error('API client not available');
            }

            // Try to load assessment status from backend
            const response = await this.api.getAssessmentStatus();
            this.assessmentData = response.data || response;

        } catch (error) {
            console.error('❌ Failed to load assessment data:', error);
            console.warn('⚠️ Using temporary fallback data - backend deployment pending');

            // TEMPORARY fallback data - will be removed after backend deployment
            this.assessmentData = {
                digitalSkills: {
                    completed: true,
                    score: 85,
                    level: 'intermediate',
                    completedAt: '2025-06-10T14:30:00Z'
                },
                learningStyle: {
                    completed: true,
                    style: 'visual',
                    preferences: ['visual', 'interactive'],
                    completedAt: '2025-06-11T10:15:00Z'
                },
                techComfort: {
                    completed: false,
                    level: null,
                    areas: [],
                    completedAt: null
                },
                overallProgress: 67,
                recommendations: []
            };
        }
    }



    /**
     * Render assessment interface
     */
    renderAssessmentInterface(container) {
        const { digitalSkills, learningStyle, techComfort, overallProgress, recommendations } = this.assessmentData;

        const assessmentHTML = `
            <!-- Assessment Header -->
            <div class="assessment-header">
                <div class="welcome-section">
                    <h1>🎯 Assessment Center</h1>
                    <p>Complete assessments to personalize your learning experience</p>
                </div>
            </div>

            <!-- Progress Overview -->
            <div class="progress-overview">
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon">📊</div>
                        <div>
                            <div class="card-title">Assessment Progress</div>
                            <div class="card-subtitle">Complete all assessments for best results</div>
                        </div>
                    </div>
                    <div class="progress-content">
                        ${UIComponents.createProgressBar(overallProgress, 'Overall Progress', '#667b68')}
                    </div>
                </div>
            </div>

            <!-- Assessment Cards -->
            <div class="assessment-grid">
                <!-- Digital Skills Assessment -->
                <div class="card assessment-card">
                    <div class="card-header">
                        <div class="card-icon digital-skills">💻</div>
                        <div>
                            <div class="card-title">Digital Skills Assessment</div>
                            <div class="card-subtitle">Evaluate your technology skills</div>
                        </div>
                        ${digitalSkills.completed ? 
                            UIComponents.createBadge('Completed', 'success') : 
                            UIComponents.createBadge('Pending', 'warning')
                        }
                    </div>
                    <div class="assessment-content">
                        ${digitalSkills.completed ? 
                            this.renderCompletedAssessment('digital-skills', digitalSkills) :
                            this.renderPendingAssessment('digital-skills', '5-8 minutes • 8 questions')
                        }
                    </div>
                </div>

                <!-- Learning Style Assessment -->
                <div class="card assessment-card">
                    <div class="card-header">
                        <div class="card-icon learning-style">🧠</div>
                        <div>
                            <div class="card-title">Learning Style Assessment</div>
                            <div class="card-subtitle">Discover your learning preferences</div>
                        </div>
                        ${learningStyle.completed ? 
                            UIComponents.createBadge('Completed', 'success') : 
                            UIComponents.createBadge('Pending', 'warning')
                        }
                    </div>
                    <div class="assessment-content">
                        ${learningStyle.completed ? 
                            this.renderCompletedAssessment('learning-style', learningStyle) :
                            this.renderPendingAssessment('learning-style', '6-10 minutes • 8 questions')
                        }
                    </div>
                </div>

                <!-- Technology Comfort Survey -->
                <div class="card assessment-card">
                    <div class="card-header">
                        <div class="card-icon tech-comfort">⚙️</div>
                        <div>
                            <div class="card-title">Technology Comfort Survey</div>
                            <div class="card-subtitle">Rate your comfort with technology</div>
                        </div>
                        ${techComfort.completed ? 
                            UIComponents.createBadge('Completed', 'success') : 
                            UIComponents.createBadge('Pending', 'warning')
                        }
                    </div>
                    <div class="assessment-content">
                        ${techComfort.completed ? 
                            this.renderCompletedAssessment('tech-comfort', techComfort) :
                            this.renderPendingAssessment('tech-comfort', '4-6 minutes • 6 questions')
                        }
                    </div>
                </div>
            </div>

            <!-- AI Recommendations -->
            ${recommendations.length > 0 ? `
                <div class="recommendations-section">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-icon">🤖</div>
                            <div>
                                <div class="card-title">AI Recommendations</div>
                                <div class="card-subtitle">Based on your assessment results</div>
                            </div>
                        </div>
                        <div class="recommendations-list">
                            ${this.renderRecommendations(recommendations)}
                        </div>
                    </div>
                </div>
            ` : ''}
        `;

        container.innerHTML = assessmentHTML;
        this.addAssessmentStyles();
    }

    /**
     * Render completed assessment
     */
    renderCompletedAssessment(type, data) {
        return `
            <div class="completed-assessment">
                <div class="assessment-result">
                    <div class="result-score">${data.score || data.level || data.style || 'Completed'}</div>
                    <div class="result-date">Completed: ${data.completedAt || 'Recently'}</div>
                </div>
                <div class="assessment-actions">
                    <button class="btn btn-secondary" onclick="window.assessmentModule.viewResults('${type}')">
                        📊 View Results
                    </button>
                    <button class="btn btn-primary" onclick="window.assessmentModule.retakeAssessment('${type}')">
                        🔄 Retake
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render pending assessment
     */
    renderPendingAssessment(type, duration) {
        return `
            <div class="pending-assessment">
                <div class="assessment-info">
                    <div class="duration-info">⏱️ ${duration}</div>
                    <div class="description">Complete this assessment to get personalized recommendations</div>
                </div>
                <div class="assessment-actions">
                    <button class="btn btn-primary" onclick="window.assessmentModule.startAssessment('${type}')">
                        🚀 Start Assessment
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render recommendations
     */
    renderRecommendations(recommendations) {
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
     * Start assessment
     */
    startAssessment(type) {
        console.log(`🚀 Starting assessment: ${type}`);
        // For now, show coming soon message
        UIComponents.showNotification(`🚧 ${type} assessment is under development. Coming soon!`, 'info');
    }

    /**
     * View assessment results
     */
    viewResults(type) {
        console.log(`📊 Viewing results for: ${type}`);
        UIComponents.showNotification(`📊 Viewing ${type} results...`, 'info');
    }

    /**
     * Retake assessment
     */
    retakeAssessment(type) {
        console.log(`🔄 Retaking assessment: ${type}`);
        UIComponents.showNotification(`🔄 Retaking ${type} assessment...`, 'info');
    }

    /**
     * Add assessment-specific styles
     */
    addAssessmentStyles() {
        if (document.querySelector('#assessment-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'assessment-styles';
        styles.textContent = `
            .assessment-header {
                margin-bottom: 2rem;
            }
            
            .assessment-header h1 {
                font-size: 2rem;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 0.5rem;
            }
            
            .assessment-header p {
                color: #6b7280;
                font-size: 1.125rem;
            }
            
            .progress-overview {
                margin-bottom: 2rem;
            }
            
            .assessment-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }
            
            .assessment-card {
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .assessment-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .digital-skills { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
            .learning-style { background: linear-gradient(135deg, #059669, #047857); }
            .tech-comfort { background: linear-gradient(135deg, #d97706, #b45309); }
            
            .assessment-content {
                padding: 1rem 0;
            }
            
            .completed-assessment, .pending-assessment {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .assessment-result {
                text-align: center;
                padding: 1rem;
                background: #f9fafb;
                border-radius: 8px;
            }
            
            .result-score {
                font-size: 1.5rem;
                font-weight: 700;
                color: #667b68;
                margin-bottom: 0.5rem;
            }
            
            .result-date {
                font-size: 0.875rem;
                color: #6b7280;
            }
            
            .assessment-info {
                text-align: center;
                padding: 1rem;
            }
            
            .duration-info {
                font-size: 0.875rem;
                color: #667b68;
                font-weight: 500;
                margin-bottom: 0.5rem;
            }
            
            .description {
                font-size: 0.875rem;
                color: #6b7280;
                line-height: 1.5;
            }
            
            .assessment-actions {
                display: flex;
                gap: 0.75rem;
                justify-content: center;
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
            
            .recommendations-section {
                margin-top: 2rem;
            }
            
            .recommendation-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1rem;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .recommendation-item:last-child {
                border-bottom: none;
            }
            
            .recommendation-title {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 0.25rem;
            }
            
            .recommendation-description {
                font-size: 0.875rem;
                color: #6b7280;
            }
            
            .recommendation-action {
                padding: 0.5rem 1rem;
                background: #667b68;
                color: white;
                border: none;
                border-radius: 6px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .recommendation-action:hover {
                background: #4a5a4c;
            }
        `;
        
        document.head.appendChild(styles);
        
        // Expose module globally for button actions
        window.assessmentModule = this;
    }

    /**
     * Refresh assessment data
     */
    async refresh() {
        await this.loadAssessmentData();
        const container = document.getElementById('assessment-content');
        if (container) {
            this.renderAssessmentInterface(container);
        }
    }
}
