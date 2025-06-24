/**
 * AgenticLearn Student Portal - Assignments Module
 * Student assignment management and submissions
 */

import { UIComponents } from '../components/ui-components.js';

export class AssignmentsModule {
    constructor() {
        this.assignments = [];
    }

    async initialize() {
        console.log('📝 Initializing Assignments Module...');
    }

    async render() {
        try {
            const container = document.getElementById('assignments-content');
            if (!container) return;

            UIComponents.showLoading(container, '📝 Loading Your Assignments...');

            await this.loadAssignments();
            this.renderAssignmentsInterface(container);

        } catch (error) {
            console.error('❌ Failed to render assignments:', error);
            UIComponents.showNotification('Failed to load assignments: ' + error.message, 'error');
        }
    }

    async loadAssignments() {
        try {
            const apiClient = window.studentPortal?.api;
            if (apiClient) {
                const response = await apiClient.getAssignments();
                this.assignments = response.data || response.assignments || [];
            }
        } catch (error) {
            // Default assignments for demo
            this.assignments = [
                {
                    id: 'assign1',
                    title: 'Programming Project 1',
                    course: 'CS101',
                    dueDate: '2024-01-20',
                    status: 'pending',
                    priority: 'high',
                    description: 'Create a simple calculator application',
                    points: 100
                },
                {
                    id: 'assign2',
                    title: 'Calculus Problem Set 3',
                    course: 'MATH201',
                    dueDate: '2024-01-18',
                    status: 'submitted',
                    priority: 'medium',
                    description: 'Solve integration problems',
                    points: 50
                }
            ];
        }
    }

    renderAssignmentsInterface(container) {
        const pending = this.assignments.filter(a => a.status === 'pending');
        const submitted = this.assignments.filter(a => a.status === 'submitted');
        const overdue = this.assignments.filter(a => a.status === 'overdue');

        const assignmentsHTML = `
            <div class="assignments-container">
                <div class="assignments-header">
                    <h1>📝 Assignments</h1>
                    <p>Manage your assignments and track submission deadlines</p>
                </div>

                <div class="assignments-stats">
                    ${UIComponents.createStatsCard(
                        { title: 'Pending', icon: '⏰', color: '#f59e0b' },
                        { value: pending.length, change: 'Due soon', trend: 'neutral' }
                    )}
                    ${UIComponents.createStatsCard(
                        { title: 'Submitted', icon: '✅', color: '#10b981' },
                        { value: submitted.length, change: 'Completed', trend: 'up' }
                    )}
                    ${UIComponents.createStatsCard(
                        { title: 'Overdue', icon: '🚨', color: '#dc2626' },
                        { value: overdue.length, change: 'Need attention', trend: 'down' }
                    )}
                </div>

                <div class="assignments-tabs">
                    <button class="tab-btn active" data-tab="all">All Assignments</button>
                    <button class="tab-btn" data-tab="pending">Pending</button>
                    <button class="tab-btn" data-tab="submitted">Submitted</button>
                </div>

                <div class="assignments-list">
                    ${this.assignments.map(assignment => this.renderAssignmentCard(assignment)).join('')}
                </div>
            </div>
        `;

        container.innerHTML = assignmentsHTML;
        this.addAssignmentsStyles();
        this.bindTabEvents();
    }

    renderAssignmentCard(assignment) {
        const dueDate = new Date(assignment.dueDate);
        const isOverdue = dueDate < new Date() && assignment.status === 'pending';
        const statusColor = {
            'pending': '#f59e0b',
            'submitted': '#10b981',
            'overdue': '#dc2626'
        };

        return `
            <div class="assignment-card ${assignment.status}" data-assignment-id="${assignment.id}">
                <div class="assignment-header">
                    <div class="assignment-meta">
                        <span class="course-tag">${assignment.course}</span>
                        ${UIComponents.createBadge(assignment.status, assignment.status === 'submitted' ? 'success' : assignment.status === 'overdue' ? 'error' : 'warning')}
                    </div>
                    <div class="assignment-points">${assignment.points} pts</div>
                </div>
                
                <div class="assignment-content">
                    <h3 class="assignment-title">${assignment.title}</h3>
                    <p class="assignment-description">${assignment.description}</p>
                    
                    <div class="assignment-details">
                        <div class="due-date ${isOverdue ? 'overdue' : ''}">
                            <span class="detail-label">Due Date:</span>
                            <span class="detail-value">${dueDate.toLocaleDateString()}</span>
                        </div>
                        <div class="priority">
                            <span class="detail-label">Priority:</span>
                            <span class="detail-value priority-${assignment.priority}">${assignment.priority}</span>
                        </div>
                    </div>
                </div>
                
                <div class="assignment-actions">
                    ${assignment.status === 'pending' ? `
                        <button class="btn btn-primary" onclick="window.studentPortal.modules.assignments.startAssignment('${assignment.id}')">
                            📝 Start Assignment
                        </button>
                        <button class="btn btn-secondary" onclick="window.studentPortal.modules.assignments.viewDetails('${assignment.id}')">
                            👁️ View Details
                        </button>
                    ` : `
                        <button class="btn btn-secondary" onclick="window.studentPortal.modules.assignments.viewSubmission('${assignment.id}')">
                            📄 View Submission
                        </button>
                        <button class="btn btn-secondary" onclick="window.studentPortal.modules.assignments.viewDetails('${assignment.id}')">
                            👁️ View Details
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    bindTabEvents() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active tab
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Filter assignments
                const tab = e.target.dataset.tab;
                this.filterAssignments(tab);
            });
        });
    }

    filterAssignments(filter) {
        const cards = document.querySelectorAll('.assignment-card');
        cards.forEach(card => {
            const status = card.classList.contains('pending') ? 'pending' : 
                          card.classList.contains('submitted') ? 'submitted' : 'overdue';
            
            if (filter === 'all' || status === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    startAssignment(assignmentId) {
        UIComponents.showNotification(`Starting assignment: ${assignmentId}`, 'info');
        // Implementation for starting assignment
    }

    viewDetails(assignmentId) {
        UIComponents.showNotification(`Viewing details for: ${assignmentId}`, 'info');
        // Implementation for viewing assignment details
    }

    viewSubmission(assignmentId) {
        UIComponents.showNotification(`Viewing submission for: ${assignmentId}`, 'info');
        // Implementation for viewing submission
    }

    addAssignmentsStyles() {
        if (document.querySelector('#assignments-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'assignments-styles';
        styles.textContent = `
            .assignments-container {
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .assignments-header h1 {
                font-size: 2rem;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 0.5rem;
            }
            
            .assignments-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }
            
            .assignments-tabs {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 2rem;
                border-bottom: 1px solid #e5e7eb;
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
            
            .assignments-list {
                display: grid;
                gap: 1.5rem;
            }
            
            .assignment-card {
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .assignment-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .assignment-card.pending {
                border-left: 4px solid #f59e0b;
            }
            
            .assignment-card.submitted {
                border-left: 4px solid #10b981;
            }
            
            .assignment-card.overdue {
                border-left: 4px solid #dc2626;
            }
            
            .assignment-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }
            
            .assignment-meta {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .course-tag {
                background: #f3f4f6;
                color: #374151;
                padding: 0.25rem 0.75rem;
                border-radius: 6px;
                font-size: 0.875rem;
                font-weight: 600;
            }
            
            .assignment-points {
                font-weight: 700;
                color: #667b68;
                font-size: 1.125rem;
            }
            
            .assignment-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 0.5rem;
            }
            
            .assignment-description {
                color: #6b7280;
                margin-bottom: 1rem;
                line-height: 1.5;
            }
            
            .assignment-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 1.5rem;
                padding: 1rem;
                background: #f9fafb;
                border-radius: 8px;
            }
            
            .detail-label {
                font-weight: 500;
                color: #374151;
                font-size: 0.875rem;
            }
            
            .detail-value {
                font-weight: 600;
                color: #1f2937;
                margin-left: 0.5rem;
            }
            
            .due-date.overdue .detail-value {
                color: #dc2626;
            }
            
            .priority-high {
                color: #dc2626;
            }
            
            .priority-medium {
                color: #f59e0b;
            }
            
            .priority-low {
                color: #10b981;
            }
            
            .assignment-actions {
                display: flex;
                gap: 0.75rem;
            }
            
            .assignment-actions .btn {
                flex: 1;
                padding: 0.75rem 1rem;
                border: none;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                text-align: center;
                font-size: 0.875rem;
            }
        `;
        
        document.head.appendChild(styles);
    }

    async refresh() {
        console.log('🔄 Refreshing assignments data...');
        await this.render();
    }
}
