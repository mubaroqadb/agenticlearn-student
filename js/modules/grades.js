/**
 * AgenticLearn Student Portal - Grades Module
 * Student grades and progress tracking
 */

import { UIComponents } from '../components/ui-components.js';

export class GradesModule {
    constructor(apiClient) {
        this.api = apiClient;
        this.grades = [];
        this.gpaData = null;
        this.isLoading = false;
        this.currentTab = 'overview'; // overview, courses, analytics
        this.filters = {
            course: 'all',
            semester: 'current',
            gradeRange: 'all'
        };
        this.analytics = null;
    }

    async initialize() {
        console.log('📊 Initializing Grades Module...');
    }

    async render() {
        try {
            const container = document.getElementById('grades-content');
            if (!container) return;

            UIComponents.showLoading(container, '📊 Loading Your Grades...');

            await this.loadGrades();
            this.renderGradesInterface(container);

        } catch (error) {
            console.error('❌ Failed to render grades:', error);
            UIComponents.showNotification('Failed to load grades: ' + error.message, 'error');
        }
    }

    async loadGrades() {
        try {
            if (this.api) {
                const response = await this.api.getGrades();
                this.grades = response.data || response.grades || [];
                this.gpaData = response.gpa || null;
            }
        } catch (error) {
            // Default grades for demo
            this.grades = [
                {
                    course: 'CS101',
                    courseName: 'Introduction to Computer Science',
                    assignments: [
                        { name: 'Assignment 1', score: 85, maxScore: 100, weight: 20 },
                        { name: 'Midterm Exam', score: 78, maxScore: 100, weight: 30 },
                        { name: 'Final Project', score: 92, maxScore: 100, weight: 50 }
                    ],
                    currentGrade: 'B+',
                    gpa: 3.3
                },
                {
                    course: 'MATH201',
                    courseName: 'Calculus II',
                    assignments: [
                        { name: 'Problem Set 1', score: 90, maxScore: 100, weight: 25 },
                        { name: 'Problem Set 2', score: 88, maxScore: 100, weight: 25 },
                        { name: 'Midterm', score: 82, maxScore: 100, weight: 50 }
                    ],
                    currentGrade: 'A-',
                    gpa: 3.7
                }
            ];
            
            this.gpaData = {
                current: 3.5,
                cumulative: 3.4,
                credits: 45,
                trend: 'up'
            };
        }
    }

    renderGradesInterface(container) {
        const gradesHTML = `
            <div class="grades-container">
                <div class="grades-header">
                    <h1>📊 Grades & Progress</h1>
                    <p>Track your academic performance and progress</p>
                </div>

                <!-- GPA Overview -->
                <div class="gpa-overview">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-icon">🎯</div>
                            <div>
                                <div class="card-title">GPA Overview</div>
                                <div class="card-subtitle">Your academic standing</div>
                            </div>
                        </div>
                        <div class="gpa-content">
                            <div class="gpa-stats">
                                <div class="gpa-item">
                                    <div class="gpa-label">Current Semester</div>
                                    <div class="gpa-value">${this.gpaData?.current || 'N/A'}</div>
                                </div>
                                <div class="gpa-item">
                                    <div class="gpa-label">Cumulative GPA</div>
                                    <div class="gpa-value">${this.gpaData?.cumulative || 'N/A'}</div>
                                </div>
                                <div class="gpa-item">
                                    <div class="gpa-label">Credits Completed</div>
                                    <div class="gpa-value">${this.gpaData?.credits || 0}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Course Grades -->
                <div class="course-grades">
                    <h2>📚 Course Grades</h2>
                    <div class="grades-grid">
                        ${this.grades.map(course => this.renderCourseGrade(course)).join('')}
                    </div>
                </div>

                <!-- Grade Distribution -->
                <div class="grade-distribution">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-icon">📈</div>
                            <div>
                                <div class="card-title">Grade Distribution</div>
                                <div class="card-subtitle">Your performance breakdown</div>
                            </div>
                        </div>
                        <div class="distribution-content">
                            ${this.renderGradeDistribution()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = gradesHTML;
        this.addGradesStyles();
    }

    renderCourseGrade(course) {
        const totalWeightedScore = course.assignments.reduce((total, assignment) => {
            return total + (assignment.score / assignment.maxScore * assignment.weight);
        }, 0);

        return `
            <div class="course-grade-card">
                <div class="course-grade-header">
                    <div class="course-info">
                        <h3 class="course-name">${course.courseName}</h3>
                        <div class="course-code">${course.course}</div>
                    </div>
                    <div class="current-grade">
                        <div class="grade-letter">${course.currentGrade}</div>
                        <div class="grade-gpa">${course.gpa} GPA</div>
                    </div>
                </div>
                
                <div class="assignments-breakdown">
                    <h4>Assignment Breakdown</h4>
                    ${course.assignments.map(assignment => `
                        <div class="assignment-grade">
                            <div class="assignment-info">
                                <span class="assignment-name">${assignment.name}</span>
                                <span class="assignment-weight">${assignment.weight}%</span>
                            </div>
                            <div class="assignment-score">
                                <span class="score">${assignment.score}/${assignment.maxScore}</span>
                                <span class="percentage">(${Math.round(assignment.score / assignment.maxScore * 100)}%)</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="course-progress">
                    ${UIComponents.createProgressBar(totalWeightedScore, 'Overall Progress', this.getGradeColor(course.currentGrade))}
                </div>
            </div>
        `;
    }

    renderGradeDistribution() {
        const gradeCount = {
            'A': 0, 'A-': 0, 'B+': 0, 'B': 0, 'B-': 0,
            'C+': 0, 'C': 0, 'C-': 0, 'D': 0, 'F': 0
        };

        this.grades.forEach(course => {
            if (gradeCount.hasOwnProperty(course.currentGrade)) {
                gradeCount[course.currentGrade]++;
            }
        });

        return `
            <div class="distribution-chart">
                ${Object.entries(gradeCount).map(([grade, count]) => `
                    <div class="grade-bar">
                        <div class="grade-label">${grade}</div>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: ${count > 0 ? (count / this.grades.length * 100) : 0}%; background: ${this.getGradeColor(grade)};"></div>
                        </div>
                        <div class="grade-count">${count}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getGradeColor(grade) {
        const colors = {
            'A': '#10b981', 'A-': '#10b981',
            'B+': '#3b82f6', 'B': '#3b82f6', 'B-': '#3b82f6',
            'C+': '#f59e0b', 'C': '#f59e0b', 'C-': '#f59e0b',
            'D': '#ef4444', 'F': '#dc2626'
        };
        return colors[grade] || '#6b7280';
    }

    addGradesStyles() {
        if (document.querySelector('#grades-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'grades-styles';
        styles.textContent = `
            .grades-container {
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .grades-header h1 {
                font-size: 2rem;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 0.5rem;
            }
            
            .gpa-overview {
                margin-bottom: 2rem;
            }
            
            .gpa-content {
                padding: 1.5rem;
            }
            
            .gpa-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 2rem;
            }
            
            .gpa-item {
                text-align: center;
            }
            
            .gpa-label {
                font-size: 0.875rem;
                color: #6b7280;
                margin-bottom: 0.5rem;
            }
            
            .gpa-value {
                font-size: 2rem;
                font-weight: 700;
                color: #667b68;
            }
            
            .course-grades {
                margin-bottom: 2rem;
            }
            
            .course-grades h2 {
                font-size: 1.5rem;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 1rem;
            }
            
            .grades-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 1.5rem;
            }
            
            .course-grade-card {
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                border-left: 4px solid #667b68;
            }
            
            .course-grade-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
            }
            
            .course-name {
                font-size: 1.125rem;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 0.25rem;
            }
            
            .course-code {
                font-size: 0.875rem;
                color: #6b7280;
                background: #f3f4f6;
                padding: 0.25rem 0.75rem;
                border-radius: 6px;
                display: inline-block;
            }
            
            .current-grade {
                text-align: center;
            }
            
            .grade-letter {
                font-size: 2rem;
                font-weight: 700;
                color: #667b68;
            }
            
            .grade-gpa {
                font-size: 0.875rem;
                color: #6b7280;
            }
            
            .assignments-breakdown h4 {
                font-size: 1rem;
                font-weight: 600;
                color: #374151;
                margin-bottom: 1rem;
            }
            
            .assignment-grade {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem 0;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .assignment-grade:last-child {
                border-bottom: none;
            }
            
            .assignment-info {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }
            
            .assignment-name {
                font-weight: 500;
                color: #374151;
            }
            
            .assignment-weight {
                font-size: 0.875rem;
                color: #6b7280;
            }
            
            .assignment-score {
                text-align: right;
            }
            
            .score {
                font-weight: 600;
                color: #1f2937;
            }
            
            .percentage {
                font-size: 0.875rem;
                color: #6b7280;
                margin-left: 0.5rem;
            }
            
            .course-progress {
                margin-top: 1.5rem;
                padding-top: 1.5rem;
                border-top: 1px solid #f3f4f6;
            }
            
            .grade-distribution {
                margin-bottom: 2rem;
            }
            
            .distribution-content {
                padding: 1.5rem;
            }
            
            .distribution-chart {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .grade-bar {
                display: grid;
                grid-template-columns: 40px 1fr 40px;
                align-items: center;
                gap: 1rem;
            }
            
            .grade-label {
                font-weight: 600;
                color: #374151;
                text-align: center;
            }
            
            .bar-container {
                height: 24px;
                background: #f3f4f6;
                border-radius: 12px;
                overflow: hidden;
            }
            
            .bar-fill {
                height: 100%;
                border-radius: 12px;
                transition: width 0.3s ease;
            }
            
            .grade-count {
                font-weight: 600;
                color: #6b7280;
                text-align: center;
            }
        `;
        
        document.head.appendChild(styles);
    }

    async refresh() {
        console.log('🔄 Refreshing grades data...');
        await this.render();
    }
}
