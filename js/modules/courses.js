/**
 * AgenticLearn Student Portal - Courses Module
 * Student course management and learning materials
 */

import { UIComponents } from '../components/ui-components.js';

export class CoursesModule {
    constructor(apiClient) {
        this.api = apiClient;
        this.courses = [];
        this.currentCourse = null;
        this.currentLesson = null;
        this.viewMode = 'overview'; // overview, course-detail, lesson-view
        this.learningProgress = {};
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
            console.log('📚 Loading enrolled courses from backend...');

            if (!this.api) {
                throw new Error('API client not available');
            }

            const response = await this.api.getCourses();

            if (!response.success) {
                throw new Error(`Backend error: ${response.error || 'Unknown error'}`);
            }

            this.courses = response.data || [];
            console.log('✅ Courses loaded from database:', this.courses);

        } catch (error) {
            console.error('❌ Failed to load courses:', error);
            throw new Error(`Failed to load courses: ${error.message}`);
        }
    }

    async loadCourseDetails(courseId) {
        try {
            console.log(`📖 Loading course details for: ${courseId}`);

            if (!this.api) {
                throw new Error('API client not available');
            }

            const response = await this.api.getCourseDetails(courseId);

            if (!response.success) {
                throw new Error(`Backend error: ${response.error || 'Unknown error'}`);
            }

            const courseDetails = response.data;
            console.log('✅ Course details loaded from database:', courseDetails);

            return courseDetails;

        } catch (error) {
            console.error('❌ Failed to load course details:', error);
            throw new Error(`Failed to load course details: ${error.message}`);
        }
    }

    renderCoursesInterface(container) {
        // Render based on current view mode
        switch (this.viewMode) {
            case 'course-detail':
                this.renderCourseDetail(container);
                break;
            case 'lesson-view':
                this.renderLessonView(container);
                break;
            default:
                this.renderCoursesOverview(container);
        }

        this.addCoursesStyles();
    }

    renderCoursesOverview(container) {
        // Safety check for courses data
        if (!this.courses || !Array.isArray(this.courses)) {
            console.warn('⚠️ Courses data not available, using empty array');
            this.courses = [];
        }

        const totalLessons = this.courses.reduce((acc, c) => acc + (c.totalLessons || 0), 0);
        const completedLessons = this.courses.reduce((acc, c) => acc + (c.completedLessons || 0), 0);
        const pendingAssignments = this.courses.reduce((acc, c) => {
            const assignments = c.assignments || [];
            return acc + assignments.filter(a => a.status === 'pending').length;
        }, 0);

        const coursesHTML = `
            <div class="courses-container">
                <div class="courses-header">
                    <h1>📚 My Courses</h1>
                    <p>Manage your enrolled courses and access learning materials</p>
                </div>

                <!-- Enhanced Stats -->
                <div class="courses-stats">
                    ${UIComponents.createStatsCard(
                        { title: 'Enrolled Courses', icon: '📖', color: '#667b68' },
                        { value: this.courses.length, change: 'This semester', trend: 'neutral' }
                    )}
                    ${UIComponents.createStatsCard(
                        { title: 'Lessons Progress', icon: '📝', color: '#3b82f6' },
                        { value: `${completedLessons}/${totalLessons}`, change: 'Completed', trend: 'up' }
                    )}
                    ${UIComponents.createStatsCard(
                        { title: 'Pending Assignments', icon: '⏰', color: '#f59e0b' },
                        { value: pendingAssignments, change: 'Due soon', trend: 'neutral' }
                    )}
                    ${UIComponents.createStatsCard(
                        { title: 'Average Progress', icon: '📊', color: '#10b981' },
                        { value: this.courses.length > 0 ? Math.round(this.courses.reduce((acc, c) => acc + (c.progress || 0), 0) / this.courses.length) + '%' : '0%', change: 'Overall', trend: 'up' }
                    )}
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-icon">⚡</div>
                            <div>
                                <div class="card-title">Continue Learning</div>
                                <div class="card-subtitle">Pick up where you left off</div>
                            </div>
                        </div>
                        <div class="continue-learning">
                            ${this.renderContinueLearning()}
                        </div>
                    </div>
                </div>

                <!-- Courses Grid -->
                <div class="courses-grid">
                    ${this.courses.map(course => this.renderEnhancedCourseCard(course)).join('')}
                </div>
            </div>
        `;

        container.innerHTML = coursesHTML;
    }

    renderContinueLearning() {
        // Safety check for courses data
        if (!this.courses || !Array.isArray(this.courses)) {
            return '<p style="text-align: center; color: #6b7280; padding: 2rem;">No courses available</p>';
        }

        const inProgressCourses = this.courses.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100);
        if (inProgressCourses.length === 0) {
            return '<p style="text-align: center; color: #6b7280; padding: 2rem;">All caught up! 🎉</p>';
        }

        return inProgressCourses.slice(0, 2).map(course => `
            <div class="continue-item">
                <div class="continue-info">
                    <div class="continue-course">${course.name}</div>
                    <div class="continue-lesson">📖 ${course.currentLesson}</div>
                    <div class="continue-progress">${course.progress}% complete</div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.studentPortal.modules.courses.continueCourse('${course.id}')">
                    ▶️ Continue
                </button>
            </div>
        `).join('');
    }

    renderEnhancedCourseCard(course) {
        // Safety checks for course data
        const lessons = course.lessons || [];
        const assignments = course.assignments || [];

        const nextLesson = lessons.find(l => !l.completed);
        const pendingAssignments = assignments.filter(a => a.status === 'pending').length;

        return `
            <div class="course-card enhanced" data-course-id="${course.id}">
                <div class="course-header">
                    <div class="course-meta">
                        <div class="course-code">${course.code}</div>
                        <div class="course-category">${course.category}</div>
                    </div>
                    ${UIComponents.createBadge(course.status, course.status === 'active' ? 'success' : 'default')}
                </div>

                <div class="course-content">
                    <h3 class="course-title">${course.name}</h3>
                    <p class="course-instructor">👨‍🏫 ${course.instructor}</p>
                    <p class="course-description">${course.description}</p>

                    <!-- Course Stats -->
                    <div class="course-stats">
                        <div class="stat-item">
                            <span class="stat-icon">📚</span>
                            <span class="stat-text">${course.completedLessons || 0}/${course.totalLessons || 0} lessons</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">⏱️</span>
                            <span class="stat-text">${course.estimatedTime || 'N/A'}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">📊</span>
                            <span class="stat-text">${course.difficulty || 'N/A'}</span>
                        </div>
                    </div>

                    <!-- Progress -->
                    <div class="course-progress">
                        ${UIComponents.createProgressBar(course.progress || 0, 'Course Progress', '#667b68')}
                    </div>

                    <!-- Next Lesson -->
                    ${nextLesson ? `
                        <div class="next-lesson">
                            <div class="next-lesson-header">
                                <span class="next-lesson-label">Next Lesson:</span>
                                <span class="lesson-type ${nextLesson.type}">${nextLesson.type}</span>
                            </div>
                            <div class="next-lesson-title">${nextLesson.title}</div>
                            <div class="next-lesson-duration">⏱️ ${nextLesson.duration}</div>
                        </div>
                    ` : ''}

                    <!-- Assignments Alert -->
                    ${pendingAssignments > 0 ? `
                        <div class="assignments-alert">
                            <span class="alert-icon">⚠️</span>
                            <span class="alert-text">${pendingAssignments} assignment${pendingAssignments > 1 ? 's' : ''} due soon</span>
                        </div>
                    ` : ''}
                </div>

                <div class="course-actions">
                    <button class="btn btn-primary" onclick="window.studentPortal.modules.courses.viewCourse('${course.id}')">
                        📖 Enter Course
                    </button>
                    <button class="btn btn-secondary" onclick="window.studentPortal.modules.courses.viewAssignments('${course.id}')">
                        📝 Assignments
                    </button>
                </div>
            </div>
        `;
    }

    renderCourseCard(course) {
        return this.renderEnhancedCourseCard(course);
    }

    async viewCourse(courseId) {
        try {
            console.log(`📖 Opening course: ${courseId}`);

            // Load detailed course data from backend
            this.currentCourse = await this.loadCourseDetails(courseId);

            if (this.currentCourse) {
                this.viewMode = 'course-detail';
                this.render();
            } else {
                throw new Error('Course not found');
            }
        } catch (error) {
            console.error('❌ Failed to view course:', error);
            UIComponents.showNotification(`Failed to load course: ${error.message}`, 'error');
        }
    }

    continueCourse(courseId) {
        console.log(`▶️ Continuing course: ${courseId}`);
        const course = this.courses.find(c => c.id === courseId);
        if (course) {
            const nextLesson = course.lessons.find(l => !l.completed);
            if (nextLesson) {
                this.startLesson(courseId, nextLesson.id);
            } else {
                this.viewCourse(courseId);
            }
        }
    }

    startLesson(courseId, lessonId) {
        console.log(`🎓 Starting lesson: ${lessonId} in course: ${courseId}`);
        this.currentCourse = this.courses.find(c => c.id === courseId);
        this.currentLesson = this.currentCourse?.lessons.find(l => l.id === lessonId);

        if (this.currentLesson) {
            this.viewMode = 'lesson-view';
            this.render();
        }
    }

    viewAssignments(courseId) {
        console.log(`📝 Viewing assignments for course: ${courseId}`);
        const course = this.courses.find(c => c.id === courseId);
        if (course) {
            UIComponents.showNotification(`📝 ${course.assignments.length} assignments found for ${course.name}`, 'info');
            // Could expand to show assignments modal or navigate to assignments page
        }
    }

    viewMaterials(courseId) {
        console.log(`📁 Opening materials for: ${courseId}`);
        UIComponents.showNotification(`📁 Opening course materials...`, 'info');
        // Implementation for viewing course materials
    }

    backToOverview() {
        this.viewMode = 'overview';
        this.currentCourse = null;
        this.currentLesson = null;
        this.render();
    }

    renderCourseDetail(container) {
        if (!this.currentCourse) {
            this.backToOverview();
            return;
        }

        const course = this.currentCourse;
        const completedLessons = course.completed_lessons || 0;
        const totalLessons = course.total_lessons || 0;
        const pendingAssignments = (course.assignments || []).filter(a => a.status === 'pending');
        const completedAssignments = (course.assignments || []).filter(a => a.status === 'completed');

        const courseDetailHTML = `
            <div class="course-detail-container">
                <!-- Navigation -->
                <div class="course-nav">
                    <button class="btn btn-secondary" onclick="window.studentPortal.modules.courses.backToOverview()">
                        ← Back to Courses
                    </button>
                    <div class="course-breadcrumb">
                        <span>Courses</span> / <span>${course.title}</span>
                    </div>
                </div>

                <!-- Course Header -->
                <div class="course-detail-header">
                    <div class="course-detail-info">
                        <div class="course-detail-meta">
                            <span class="course-category">${course.category}</span>
                            ${UIComponents.createBadge(course.level, 'info')}
                            ${UIComponents.createBadge(course.enrollment_status, course.enrollment_status === 'completed' ? 'success' : 'warning')}
                        </div>
                        <h1 class="course-detail-title">${course.title}</h1>
                        <p class="course-detail-instructor">👨‍🏫 ${course.instructor}</p>
                        <p class="course-detail-description">${course.description}</p>

                        <div class="course-detail-stats">
                            <div class="detail-stat">
                                <span class="stat-value">${completedLessons}/${totalLessons}</span>
                                <span class="stat-label">Lessons Completed</span>
                            </div>
                            <div class="detail-stat">
                                <span class="stat-value">${course.progress || 0}%</span>
                                <span class="stat-label">Progress</span>
                            </div>
                            <div class="detail-stat">
                                <span class="stat-value">${course.duration} weeks</span>
                                <span class="stat-label">Duration</span>
                            </div>
                            <div class="detail-stat">
                                <span class="stat-value">${course.estimated_hours}h</span>
                                <span class="stat-label">Est. Time</span>
                            </div>
                        </div>
                    </div>

                    <div class="course-detail-progress">
                        ${UIComponents.createProgressBar(course.progress || 0, 'Course Progress', '#667b68')}
                    </div>
                </div>

                <!-- Course Content Tabs -->
                <div class="course-tabs">
                    <button class="tab-btn active" onclick="window.studentPortal.modules.courses.switchTab('lessons')">
                        📚 Lessons
                    </button>
                    <button class="tab-btn" onclick="window.studentPortal.modules.courses.switchTab('assignments')">
                        📝 Assignments
                    </button>
                    <button class="tab-btn" onclick="window.studentPortal.modules.courses.switchTab('materials')">
                        📁 Materials
                    </button>
                </div>

                <!-- Lessons Tab -->
                <div id="lessons-tab" class="tab-content active">
                    <div class="modules-grid">
                        ${(course.modules || []).map((module, index) => this.renderModuleCard(module, index + 1)).join('')}
                    </div>
                </div>

                <!-- Assignments Tab -->
                <div id="assignments-tab" class="tab-content">
                    <div class="assignments-section">
                        ${pendingAssignments.length > 0 ? `
                            <div class="assignments-group">
                                <h3>📋 Pending Assignments</h3>
                                ${pendingAssignments.map(assignment => this.renderAssignmentCard(assignment)).join('')}
                            </div>
                        ` : ''}

                        ${completedAssignments.length > 0 ? `
                            <div class="assignments-group">
                                <h3>✅ Completed Assignments</h3>
                                ${completedAssignments.map(assignment => this.renderAssignmentCard(assignment)).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Materials Tab -->
                <div id="materials-tab" class="tab-content">
                    <div class="materials-section">
                        <p style="text-align: center; color: #6b7280; padding: 3rem;">
                            📁 Course materials will be available here
                        </p>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = courseDetailHTML;
    }

    renderLessonCard(lesson, number) {
        const isLocked = number > 1 && !this.currentCourse.lessons[number - 2].completed;
        const statusIcon = lesson.completed ? '✅' : (isLocked ? '🔒' : '▶️');
        const typeIcon = {
            'video': '🎥',
            'interactive': '🎮',
            'tutorial': '📖',
            'quiz': '❓'
        }[lesson.type] || '📄';

        return `
            <div class="lesson-card ${lesson.completed ? 'completed' : ''} ${isLocked ? 'locked' : ''}">
                <div class="lesson-number">${number}</div>
                <div class="lesson-content">
                    <div class="lesson-header">
                        <div class="lesson-title">
                            ${typeIcon} ${lesson.title}
                        </div>
                        <div class="lesson-status">${statusIcon}</div>
                    </div>
                    <div class="lesson-meta">
                        <span class="lesson-duration">⏱️ ${lesson.duration}</span>
                        <span class="lesson-type">${lesson.type}</span>
                    </div>
                </div>
                <div class="lesson-actions">
                    ${!isLocked ? `
                        <button class="btn btn-sm ${lesson.completed ? 'btn-secondary' : 'btn-primary'}"
                                onclick="window.studentPortal.modules.courses.startLesson('${this.currentCourse.id}', '${lesson.id}')">
                            ${lesson.completed ? '👁️ Review' : '▶️ Start'}
                        </button>
                    ` : `
                        <span class="locked-text">Complete previous lesson</span>
                    `}
                </div>
            </div>
        `;
    }

    renderAssignmentCard(assignment) {
        const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status === 'pending';
        const statusColor = assignment.status === 'completed' ? 'success' : (isOverdue ? 'error' : 'warning');

        return `
            <div class="assignment-card ${assignment.status}">
                <div class="assignment-header">
                    <div class="assignment-title">${assignment.title}</div>
                    ${UIComponents.createBadge(assignment.status, statusColor)}
                </div>
                <div class="assignment-meta">
                    <div class="assignment-due">
                        📅 Due: ${new Date(assignment.dueDate).toLocaleDateString()}
                        ${isOverdue ? ' (Overdue)' : ''}
                    </div>
                    ${assignment.score !== null ? `
                        <div class="assignment-score">
                            📊 Score: ${assignment.score}/100
                        </div>
                    ` : ''}
                </div>
                <div class="assignment-actions">
                    ${assignment.status === 'pending' ? `
                        <button class="btn btn-primary btn-sm">
                            📝 Start Assignment
                        </button>
                    ` : `
                        <button class="btn btn-secondary btn-sm">
                            👁️ View Submission
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        document.querySelector(`[onclick*="'${tabName}'"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    renderLessonView(container) {
        if (!this.currentLesson || !this.currentCourse) {
            this.backToOverview();
            return;
        }

        const lesson = this.currentLesson;
        const course = this.currentCourse;
        const lessonIndex = course.lessons.findIndex(l => l.id === lesson.id);
        const nextLesson = course.lessons[lessonIndex + 1];
        const prevLesson = course.lessons[lessonIndex - 1];

        const lessonViewHTML = `
            <div class="lesson-view-container">
                <!-- Lesson Navigation -->
                <div class="lesson-nav">
                    <button class="btn btn-secondary" onclick="window.studentPortal.modules.courses.viewCourse('${course.id}')">
                        ← Back to Course
                    </button>
                    <div class="lesson-breadcrumb">
                        <span>Courses</span> / <span>${course.name}</span> / <span>${lesson.title}</span>
                    </div>
                </div>

                <!-- Lesson Header -->
                <div class="lesson-header">
                    <div class="lesson-info">
                        <h1 class="lesson-title">${lesson.title}</h1>
                        <div class="lesson-meta">
                            <span class="lesson-course">${course.name}</span>
                            <span class="lesson-duration">⏱️ ${lesson.duration}</span>
                            <span class="lesson-type">${lesson.type}</span>
                        </div>
                    </div>
                    <div class="lesson-progress">
                        <span>Lesson ${lessonIndex + 1} of ${course.lessons.length}</span>
                        ${UIComponents.createProgressBar(((lessonIndex + 1) / course.lessons.length) * 100, 'Course Progress', '#667b68')}
                    </div>
                </div>

                <!-- Lesson Content -->
                <div class="lesson-content">
                    ${this.renderLessonContent(lesson)}
                </div>

                <!-- Lesson Navigation -->
                <div class="lesson-navigation">
                    ${prevLesson ? `
                        <button class="btn btn-secondary" onclick="window.studentPortal.modules.courses.startLesson('${course.id}', '${prevLesson.id}')">
                            ← Previous: ${prevLesson.title}
                        </button>
                    ` : '<div></div>'}

                    <div class="lesson-actions">
                        ${!lesson.completed ? `
                            <button class="btn btn-success" onclick="window.studentPortal.modules.courses.completeLesson('${course.id}', '${lesson.id}')">
                                ✅ Mark Complete
                            </button>
                        ` : `
                            <span class="completed-badge">✅ Completed</span>
                        `}
                    </div>

                    ${nextLesson ? `
                        <button class="btn btn-primary" onclick="window.studentPortal.modules.courses.startLesson('${course.id}', '${nextLesson.id}')">
                            Next: ${nextLesson.title} →
                        </button>
                    ` : `
                        <button class="btn btn-success" onclick="window.studentPortal.modules.courses.viewCourse('${course.id}')">
                            🎉 Course Complete
                        </button>
                    `}
                </div>
            </div>
        `;

        container.innerHTML = lessonViewHTML;
    }

    renderLessonContent(lesson) {
        switch (lesson.type) {
            case 'video':
                return this.renderVideoLesson(lesson);
            case 'interactive':
                return this.renderInteractiveLesson(lesson);
            case 'tutorial':
                return this.renderTutorialLesson(lesson);
            default:
                return this.renderDefaultLesson(lesson);
        }
    }

    renderVideoLesson(lesson) {
        return `
            <div class="video-lesson">
                <div class="video-player">
                    <div class="video-placeholder">
                        🎥 Video Player
                        <p>Video content for: ${lesson.title}</p>
                        <p>Duration: ${lesson.duration}</p>
                        <button class="btn btn-primary">▶️ Play Video</button>
                    </div>
                </div>
                <div class="video-notes">
                    <h3>📝 Lesson Notes</h3>
                    <textarea placeholder="Take notes while watching..." rows="6"></textarea>
                    <button class="btn btn-secondary">💾 Save Notes</button>
                </div>
            </div>
        `;
    }

    renderInteractiveLesson(lesson) {
        return `
            <div class="interactive-lesson">
                <div class="interactive-content">
                    <h3>🎮 Interactive Learning</h3>
                    <p>Interactive content for: ${lesson.title}</p>
                    <div class="interactive-placeholder">
                        <p>Interactive exercises and simulations would be loaded here</p>
                        <button class="btn btn-primary">🚀 Start Interactive Session</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderTutorialLesson(lesson) {
        return `
            <div class="tutorial-lesson">
                <div class="tutorial-content">
                    <h3>📖 Tutorial Content</h3>
                    <div class="tutorial-text">
                        <p>This is a comprehensive tutorial on: <strong>${lesson.title}</strong></p>
                        <p>Duration: ${lesson.duration}</p>
                        <div class="tutorial-steps">
                            <h4>Steps to follow:</h4>
                            <ol>
                                <li>Read through the material carefully</li>
                                <li>Practice the examples provided</li>
                                <li>Complete the exercises</li>
                                <li>Mark the lesson as complete</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderDefaultLesson(lesson) {
        return `
            <div class="default-lesson">
                <h3>📄 ${lesson.title}</h3>
                <p>Lesson content would be displayed here</p>
                <p>Type: ${lesson.type}</p>
                <p>Duration: ${lesson.duration}</p>
            </div>
        `;
    }

    completeLesson(courseId, lessonId) {
        console.log(`✅ Completing lesson: ${lessonId} in course: ${courseId}`);

        // Update lesson status
        const course = this.courses.find(c => c.id === courseId);
        if (course) {
            const lesson = course.lessons.find(l => l.id === lessonId);
            if (lesson) {
                lesson.completed = true;

                // Update course progress
                const completedLessons = course.lessons.filter(l => l.completed).length;
                course.progress = Math.round((completedLessons / course.totalLessons) * 100);
                course.completedLessons = completedLessons;

                UIComponents.showNotification(`✅ Lesson completed! Progress: ${course.progress}%`, 'success');

                // Re-render to update UI
                this.render();
            }
        }
    }

    renderModuleCard(module, moduleNumber) {
        const lessons = module.lessons || [];
        const completedLessons = lessons.filter(l => l.completed).length;
        const progressPercent = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

        return `
            <div class="module-card">
                <div class="module-header">
                    <div class="module-meta">
                        <span class="module-number">Module ${moduleNumber}</span>
                        <span class="module-weeks">Week ${module.week_start}-${module.week_end}</span>
                    </div>
                    <h3 class="module-title">${module.title}</h3>
                    <p class="module-description">${module.description}</p>
                </div>

                <div class="module-progress">
                    ${UIComponents.createProgressBar(progressPercent, `${completedLessons}/${lessons.length} lessons completed`, '#667b68')}
                </div>

                <div class="module-lessons">
                    <h4>📚 Lessons (${lessons.length})</h4>
                    <div class="lessons-list">
                        ${lessons.map((lesson, index) => this.renderLessonItem(lesson, index + 1)).join('')}
                    </div>
                </div>

                <div class="module-actions">
                    <button class="btn btn-primary" onclick="window.studentPortal.modules.courses.startModule('${module.id}')">
                        ${completedLessons === 0 ? '🚀 Start Module' : '▶️ Continue Module'}
                    </button>
                    <button class="btn btn-secondary" onclick="window.studentPortal.modules.courses.viewModuleDetails('${module.id}')">
                        📖 View Details
                    </button>
                </div>
            </div>
        `;
    }

    renderLessonItem(lesson, lessonNumber) {
        const statusIcon = lesson.completed ? '✅' : '⏳';
        const statusClass = lesson.completed ? 'completed' : 'pending';

        return `
            <div class="lesson-item ${statusClass}">
                <div class="lesson-info">
                    <span class="lesson-status">${statusIcon}</span>
                    <div class="lesson-details">
                        <span class="lesson-title">${lesson.title}</span>
                        <span class="lesson-meta">${lesson.duration}min • ${lesson.type}</span>
                    </div>
                </div>
                <button class="btn btn-sm ${lesson.completed ? 'btn-secondary' : 'btn-primary'}"
                        onclick="window.studentPortal.modules.courses.startLesson('${lesson.id}')">
                    ${lesson.completed ? '👁️ Review' : '▶️ Start'}
                </button>
            </div>
        `;
    }

    startModule(moduleId) {
        console.log(`🚀 Starting module: ${moduleId}`);
        UIComponents.showNotification('🚧 Module learning interface coming soon!', 'info');
    }

    viewModuleDetails(moduleId) {
        console.log(`📖 Viewing module details: ${moduleId}`);
        UIComponents.showNotification('🚧 Module details view coming soon!', 'info');
    }

    startLesson(lessonId) {
        console.log(`📚 Starting lesson: ${lessonId}`);
        UIComponents.showNotification('🚧 Lesson interface coming soon!', 'info');
    }

    addCoursesStyles() {
        if (document.querySelector('#courses-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'courses-styles';
        styles.textContent = `
            /* Base Styles */
            .courses-container, .course-detail-container, .lesson-view-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 1rem;
            }

            /* Header Styles */
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

            /* Stats Grid */
            .courses-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            /* Quick Actions */
            .quick-actions {
                margin-bottom: 2rem;
            }

            .continue-learning {
                padding: 1rem 0;
            }

            .continue-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1rem;
                background: #f9fafb;
                border-radius: 8px;
                margin-bottom: 0.75rem;
            }

            .continue-course {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 0.25rem;
            }

            .continue-lesson {
                font-size: 0.875rem;
                color: #6b7280;
                margin-bottom: 0.25rem;
            }

            .continue-progress {
                font-size: 0.75rem;
                color: #667b68;
                font-weight: 500;
            }

            /* Course Cards */
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

            .course-meta {
                display: flex;
                gap: 0.5rem;
                align-items: center;
            }

            .course-code {
                font-weight: 700;
                color: #667b68;
                font-size: 0.75rem;
                background: #f3f4f6;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
            }

            .course-category {
                font-size: 0.75rem;
                color: #6b7280;
                background: #e5e7eb;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
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

            /* Course Stats */
            .course-stats {
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;
                flex-wrap: wrap;
            }

            .stat-item {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                font-size: 0.75rem;
                color: #6b7280;
            }

            .stat-icon {
                font-size: 0.875rem;
            }

            /* Next Lesson */
            .next-lesson {
                background: #f0f9ff;
                border: 1px solid #e0f2fe;
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1rem;
            }

            .next-lesson-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }

            .next-lesson-label {
                font-size: 0.75rem;
                font-weight: 600;
                color: #0369a1;
                text-transform: uppercase;
            }

            .lesson-type {
                font-size: 0.75rem;
                padding: 0.125rem 0.5rem;
                border-radius: 4px;
                font-weight: 500;
            }

            .lesson-type.video { background: #fef3c7; color: #92400e; }
            .lesson-type.interactive { background: #d1fae5; color: #065f46; }
            .lesson-type.tutorial { background: #e0e7ff; color: #3730a3; }

            .next-lesson-title {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 0.25rem;
            }

            .next-lesson-duration {
                font-size: 0.875rem;
                color: #6b7280;
            }

            /* Assignments Alert */
            .assignments-alert {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: #fef3c7;
                border: 1px solid #fbbf24;
                border-radius: 6px;
                padding: 0.75rem;
                margin-bottom: 1rem;
            }

            .alert-icon {
                font-size: 1rem;
            }

            .alert-text {
                font-size: 0.875rem;
                color: #92400e;
                font-weight: 500;
            }

            /* Course Actions */
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

            /* Button Styles */
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

            .btn-sm {
                padding: 0.375rem 0.75rem;
                font-size: 0.875rem;
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

            .btn-success {
                background: #10b981;
                color: white;
            }

            .btn-success:hover {
                background: #059669;
            }

            /* Navigation Styles */
            .course-nav, .lesson-nav {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #e5e7eb;
            }

            .course-breadcrumb, .lesson-breadcrumb {
                color: #6b7280;
                font-size: 0.875rem;
            }

            /* Course Detail Styles */
            .course-detail-header {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                margin-bottom: 2rem;
            }

            .course-detail-meta {
                display: flex;
                gap: 0.75rem;
                align-items: center;
                margin-bottom: 1rem;
            }

            .course-detail-title {
                font-size: 2rem;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 0.5rem;
            }

            .course-detail-instructor {
                color: #6b7280;
                font-size: 1rem;
                margin-bottom: 1rem;
            }

            .course-detail-description {
                color: #6b7280;
                font-size: 1rem;
                line-height: 1.6;
                margin-bottom: 2rem;
            }

            .course-detail-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .detail-stat {
                text-align: center;
            }

            .stat-value {
                display: block;
                font-size: 1.5rem;
                font-weight: 700;
                color: #667b68;
                margin-bottom: 0.25rem;
            }

            .stat-label {
                font-size: 0.875rem;
                color: #6b7280;
            }

            /* Tabs Styles */
            .course-tabs {
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

            .tab-btn:hover {
                color: #374151;
            }

            .tab-content {
                display: none;
            }

            .tab-content.active {
                display: block;
            }

            /* Modules Grid */
            .modules-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                gap: 1.5rem;
                margin-top: 1rem;
            }

            .module-card {
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                border: 1px solid #e5e7eb;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            }

            .module-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }

            .module-header {
                margin-bottom: 1rem;
            }

            .module-meta {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
            }

            .module-number {
                background: #667b68;
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: 600;
            }

            .module-weeks {
                background: #f3f4f6;
                color: #6b7280;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.75rem;
            }

            .module-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: #1f2937;
                margin: 0.5rem 0;
            }

            .module-description {
                color: #6b7280;
                font-size: 0.875rem;
                line-height: 1.5;
            }

            .module-progress {
                margin: 1rem 0;
            }

            .module-lessons h4 {
                font-size: 1rem;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 0.75rem;
            }

            .lessons-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                margin-bottom: 1rem;
            }

            .lesson-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem;
                background: #f9fafb;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }

            .lesson-item.completed {
                background: #f0f9ff;
                border-color: #bae6fd;
            }

            .lesson-info {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                flex: 1;
            }

            .lesson-details {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }

            .lesson-title {
                font-weight: 500;
                color: #1f2937;
                font-size: 0.875rem;
            }

            .lesson-meta {
                font-size: 0.75rem;
                color: #6b7280;
            }

            .module-actions {
                display: flex;
                gap: 0.75rem;
                margin-top: 1rem;
            }

            .module-actions .btn {
                flex: 1;
            }

            /* Lessons Grid */
            .lessons-grid {
                display: grid;
                gap: 1rem;
            }

            .lesson-card {
                display: flex;
                align-items: center;
                gap: 1rem;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 1rem;
                transition: all 0.2s;
            }

            .lesson-card:hover {
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            .lesson-card.completed {
                background: #f0fdf4;
                border-color: #bbf7d0;
            }

            .lesson-card.locked {
                opacity: 0.6;
                background: #f9fafb;
            }

            .lesson-number {
                width: 2rem;
                height: 2rem;
                border-radius: 50%;
                background: #f3f4f6;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                color: #374151;
                font-size: 0.875rem;
            }

            .lesson-card.completed .lesson-number {
                background: #10b981;
                color: white;
            }

            .lesson-content {
                flex: 1;
            }

            .lesson-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }

            .lesson-title {
                font-weight: 600;
                color: #1f2937;
            }

            .lesson-status {
                font-size: 1.25rem;
            }

            .lesson-meta {
                display: flex;
                gap: 1rem;
                font-size: 0.875rem;
                color: #6b7280;
            }

            .lesson-actions {
                min-width: 120px;
                text-align: right;
            }

            .locked-text {
                font-size: 0.75rem;
                color: #9ca3af;
                font-style: italic;
            }

            /* Assignment Styles */
            .assignments-section {
                display: flex;
                flex-direction: column;
                gap: 2rem;
            }

            .assignments-group h3 {
                color: #1f2937;
                margin-bottom: 1rem;
                font-size: 1.25rem;
            }

            .assignment-card {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 1.5rem;
                margin-bottom: 1rem;
            }

            .assignment-card.completed {
                background: #f0fdf4;
                border-color: #bbf7d0;
            }

            .assignment-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }

            .assignment-title {
                font-weight: 600;
                color: #1f2937;
                font-size: 1.125rem;
            }

            .assignment-meta {
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;
                font-size: 0.875rem;
                color: #6b7280;
            }

            .assignment-actions {
                display: flex;
                gap: 0.75rem;
            }

            /* Lesson View Styles */
            .lesson-header {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                margin-bottom: 2rem;
            }

            .lesson-title {
                font-size: 2rem;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 1rem;
            }

            .lesson-meta {
                display: flex;
                gap: 1rem;
                color: #6b7280;
                font-size: 0.875rem;
                margin-bottom: 1rem;
            }

            .lesson-course {
                font-weight: 500;
                color: #667b68;
            }

            .lesson-progress {
                margin-top: 1rem;
            }

            .lesson-progress span {
                display: block;
                margin-bottom: 0.5rem;
                font-size: 0.875rem;
                color: #6b7280;
            }

            /* Lesson Content Styles */
            .lesson-content {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                margin-bottom: 2rem;
                min-height: 400px;
            }

            .video-lesson, .interactive-lesson, .tutorial-lesson, .default-lesson {
                height: 100%;
            }

            .video-player {
                background: #f3f4f6;
                border-radius: 8px;
                margin-bottom: 2rem;
            }

            .video-placeholder {
                padding: 4rem 2rem;
                text-align: center;
                color: #6b7280;
            }

            .video-placeholder p {
                margin: 0.5rem 0;
            }

            .video-notes {
                background: #f9fafb;
                border-radius: 8px;
                padding: 1.5rem;
            }

            .video-notes h3 {
                margin-bottom: 1rem;
                color: #1f2937;
            }

            .video-notes textarea {
                width: 100%;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                padding: 0.75rem;
                margin-bottom: 1rem;
                resize: vertical;
            }

            .interactive-content, .tutorial-content {
                text-align: center;
                padding: 2rem;
            }

            .interactive-placeholder {
                background: #f0f9ff;
                border: 2px dashed #3b82f6;
                border-radius: 8px;
                padding: 3rem 2rem;
                margin-top: 2rem;
            }

            .tutorial-text {
                text-align: left;
                max-width: 800px;
                margin: 0 auto;
            }

            .tutorial-steps {
                background: #f9fafb;
                border-radius: 8px;
                padding: 1.5rem;
                margin-top: 2rem;
            }

            .tutorial-steps h4 {
                margin-bottom: 1rem;
                color: #1f2937;
            }

            .tutorial-steps ol {
                padding-left: 1.5rem;
            }

            .tutorial-steps li {
                margin-bottom: 0.5rem;
                line-height: 1.6;
            }

            /* Lesson Navigation */
            .lesson-navigation {
                display: grid;
                grid-template-columns: 1fr auto 1fr;
                gap: 1rem;
                align-items: center;
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            .lesson-navigation > div:first-child {
                justify-self: start;
            }

            .lesson-navigation > div:last-child {
                justify-self: end;
            }

            .lesson-actions {
                display: flex;
                gap: 0.75rem;
                align-items: center;
            }

            .completed-badge {
                background: #10b981;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                font-weight: 500;
                font-size: 0.875rem;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .courses-container, .course-detail-container, .lesson-view-container {
                    padding: 0.5rem;
                }

                .courses-stats {
                    grid-template-columns: 1fr;
                }

                .courses-grid {
                    grid-template-columns: 1fr;
                }

                .course-stats {
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .course-actions {
                    flex-direction: column;
                }

                .course-detail-stats {
                    grid-template-columns: repeat(2, 1fr);
                }

                .course-tabs {
                    flex-wrap: wrap;
                }

                .lesson-navigation {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                    text-align: center;
                }

                .lesson-navigation > div {
                    justify-self: center !important;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    async refresh() {
        console.log('🔄 Refreshing courses data...');
        await this.render();
    }
}
