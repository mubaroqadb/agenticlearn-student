/**
 * AgenticLearn Student Portal - Courses Module
 * Student course management and learning materials
 */

import { UIComponents } from '../components/ui-components.js';

export class CoursesModule {
    constructor() {
        this.courses = [];
    }

    async initialize() {
        console.log('📚 Initializing Courses Module...');
    }

    async render() {
        try {
            const container = document.getElementById('courses-content');
            if (!container) return;

            UIComponents.showLoading(container, '📚 Loading Your Courses...');

            // Load courses data
            await this.loadCourses();

            // Render courses interface
            this.renderCoursesInterface(container);

        } catch (error) {
            console.error('❌ Failed to render courses:', error);
            UIComponents.showNotification('Failed to load courses: ' + error.message, 'error');
        }
    }

    async loadCourses() {
        try {
            const apiClient = window.studentPortal?.api;
            if (apiClient) {
                const response = await apiClient.getCourses();
                this.courses = response.data || response.courses || [];
            }
        } catch (error) {
            console.error('❌ Failed to load courses:', error);
            // Default courses for demo
            this.courses = [
                {
                    id: 'cs101',
                    name: 'Introduction to Computer Science',
                    code: 'CS101',
                    instructor: 'Dr. Sarah Johnson',
                    progress: 75,
                    status: 'active',
                    nextClass: '2024-01-15 10:00',
                    description: 'Fundamentals of programming and computational thinking'
                },
                {
                    id: 'math201',
                    name: 'Calculus II',
                    code: 'MATH201',
                    instructor: 'Prof. Michael Chen',
                    progress: 60,
                    status: 'active',
                    nextClass: '2024-01-16 14:00',
                    description: 'Advanced calculus concepts and applications'
                }
            ];
        }
    }

    renderCoursesInterface(container) {
        const coursesHTML = `
            <div class="courses-container">
                <div class="courses-header">
                    <h1>📚 My Courses</h1>
                    <p>Manage your enrolled courses and access learning materials</p>
                </div>

                <div class="courses-stats">
                    ${UIComponents.createStatsCard(
                        { title: 'Enrolled Courses', icon: '📖', color: '#667b68' },
                        { value: this.courses.length, change: 'This semester', trend: 'neutral' }
                    )}
                    ${UIComponents.createStatsCard(
                        { title: 'Active Courses', icon: '🎯', color: '#3b82f6' },
                        { value: this.courses.filter(c => c.status === 'active').length, change: 'In progress', trend: 'up' }
                    )}
                    ${UIComponents.createStatsCard(
                        { title: 'Average Progress', icon: '📊', color: '#10b981' },
                        { value: Math.round(this.courses.reduce((acc, c) => acc + c.progress, 0) / this.courses.length) + '%', change: 'Overall', trend: 'up' }
                    )}
                </div>

                <div class="courses-grid">
                    ${this.courses.map(course => this.renderCourseCard(course)).join('')}
                </div>
            </div>
        `;

        container.innerHTML = coursesHTML;
        this.addCoursesStyles();
    }

    renderCourseCard(course) {
        return `
            <div class="course-card" data-course-id="${course.id}">
                <div class="course-header">
                    <div class="course-code">${course.code}</div>
                    ${UIComponents.createBadge(course.status, course.status === 'active' ? 'success' : 'default')}
                </div>
                <div class="course-content">
                    <h3 class="course-title">${course.name}</h3>
                    <p class="course-instructor">👨‍🏫 ${course.instructor}</p>
                    <p class="course-description">${course.description}</p>
                    
                    <div class="course-progress">
                        ${UIComponents.createProgressBar(course.progress, 'Course Progress', '#667b68')}
                    </div>
                    
                    <div class="course-info">
                        <div class="next-class">
                            <span class="info-label">Next Class:</span>
                            <span class="info-value">${new Date(course.nextClass).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div class="course-actions">
                    <button class="btn btn-primary" onclick="window.studentPortal.modules.courses.viewCourse('${course.id}')">
                        📖 View Course
                    </button>
                    <button class="btn btn-secondary" onclick="window.studentPortal.modules.courses.viewMaterials('${course.id}')">
                        📁 Materials
                    </button>
                </div>
            </div>
        `;
    }

    viewCourse(courseId) {
        UIComponents.showNotification(`Opening course: ${courseId}`, 'info');
        // Implementation for viewing course details
    }

    viewMaterials(courseId) {
        UIComponents.showNotification(`Opening materials for: ${courseId}`, 'info');
        // Implementation for viewing course materials
    }

    addCoursesStyles() {
        if (document.querySelector('#courses-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'courses-styles';
        styles.textContent = `
            .courses-container {
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .courses-header {
                margin-bottom: 2rem;
            }
            
            .courses-header h1 {
                font-size: 2rem;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 0.5rem;
            }
            
            .courses-header p {
                color: #6b7280;
                font-size: 1.125rem;
            }
            
            .courses-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }
            
            .courses-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 1.5rem;
            }
            
            .course-card {
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                transition: transform 0.2s, box-shadow 0.2s;
                border-left: 4px solid #667b68;
            }
            
            .course-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .course-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }
            
            .course-code {
                font-weight: 700;
                color: #667b68;
                font-size: 0.875rem;
                background: #f3f4f6;
                padding: 0.25rem 0.75rem;
                border-radius: 6px;
            }
            
            .course-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 0.5rem;
            }
            
            .course-instructor {
                color: #6b7280;
                font-size: 0.875rem;
                margin-bottom: 0.75rem;
            }
            
            .course-description {
                color: #6b7280;
                font-size: 0.875rem;
                line-height: 1.5;
                margin-bottom: 1rem;
            }
            
            .course-progress {
                margin-bottom: 1rem;
            }
            
            .course-info {
                margin-bottom: 1.5rem;
            }
            
            .next-class {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem;
                background: #f9fafb;
                border-radius: 6px;
            }
            
            .info-label {
                font-weight: 500;
                color: #374151;
                font-size: 0.875rem;
            }
            
            .info-value {
                font-weight: 600;
                color: #667b68;
                font-size: 0.875rem;
            }
            
            .course-actions {
                display: flex;
                gap: 0.75rem;
            }
            
            .course-actions .btn {
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
            
            .btn-primary {
                background: #667b68;
                color: white;
            }
            
            .btn-primary:hover {
                background: #4a5a4c;
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
    }

    async refresh() {
        console.log('🔄 Refreshing courses data...');
        await this.render();
    }
}
