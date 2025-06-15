// Student Portal - Database-Driven Implementation
// Synced with Educator Portal Database Architecture

import { DatabaseManager } from './database.js';
import { DatabaseAdapter } from './database-adapter.js';

// Initialize Database Manager
let dbManager;
let dbAdapter;

// Student Portal State
let currentStudent = null;
let studentData = {};
let enrolledCourses = [];
let assignments = [];
let grades = [];

// Initialize Student Portal
async function initializeStudentPortal() {
    console.log('🎓 Initializing Student Portal with Database...');
    
    try {
        // Initialize database
        dbManager = new DatabaseManager();
        await dbManager.init();
        
        dbAdapter = new DatabaseAdapter(dbManager);
        
        // Load student data
        await loadStudentProfile();
        await loadEnrolledCourses();
        await loadAssignments();
        await loadGrades();
        await loadStudentProgress();
        
        // Setup event listeners
        setupEventListeners();
        
        // Update UI
        updateDashboard();
        
        console.log('✅ Student Portal initialized successfully');
        showNotification('Welcome to AgenticLearn Student Portal! 🎓', 'success');
        
    } catch (error) {
        console.error('❌ Failed to initialize Student Portal:', error);
        showNotification('Failed to load student portal. Using demo mode.', 'warning');
        loadDemoData();
    }
}

// Load Student Profile
async function loadStudentProfile() {
    try {
        // Get current student from database
        const students = await dbAdapter.getStudents();
        
        if (students && students.length > 0) {
            // For demo, use first student as current user
            currentStudent = students[0];
            studentData = {
                id: currentStudent.id,
                name: currentStudent.name,
                email: currentStudent.email,
                avatar: currentStudent.avatar,
                enrollmentDate: currentStudent.enrollmentDate,
                status: currentStudent.status
            };
            
            // Update UI
            updateElement('student-name', studentData.name);
            updateElement('student-email', studentData.email);
            
        } else {
            throw new Error('No student data found');
        }
        
    } catch (error) {
        console.error('Failed to load student profile:', error);
        // Use demo student data
        studentData = {
            id: 'demo-student-1',
            name: 'Demo Student',
            email: 'demo@student.edu',
            avatar: 'DS',
            enrollmentDate: new Date().toISOString(),
            status: 'active'
        };
        updateElement('student-name', studentData.name);
    }
}

// Load Enrolled Courses
async function loadEnrolledCourses() {
    try {
        const courses = await dbAdapter.getCourses();
        
        if (courses && courses.length > 0) {
            // For demo, enroll student in first 2 courses
            enrolledCourses = courses.slice(0, 2).map(course => ({
                ...course,
                enrollmentDate: new Date().toISOString(),
                progress: Math.floor(Math.random() * 80) + 20, // 20-100%
                lastAccessed: new Date().toISOString()
            }));
        }
        
        renderEnrolledCourses();
        
    } catch (error) {
        console.error('Failed to load enrolled courses:', error);
        enrolledCourses = [];
    }
}

// Load Assignments
async function loadAssignments() {
    try {
        const allAssignments = await dbAdapter.getAssignments();
        
        if (allAssignments && allAssignments.length > 0) {
            // Filter assignments for enrolled courses
            assignments = allAssignments.filter(assignment => 
                enrolledCourses.some(course => course.id === assignment.courseId)
            ).map(assignment => ({
                ...assignment,
                submissionStatus: Math.random() > 0.5 ? 'submitted' : 'pending',
                submissionDate: Math.random() > 0.5 ? new Date().toISOString() : null,
                grade: Math.random() > 0.5 ? Math.floor(Math.random() * 40) + 60 : null
            }));
        }
        
        renderAssignments();
        
    } catch (error) {
        console.error('Failed to load assignments:', error);
        assignments = [];
    }
}

// Load Grades
async function loadGrades() {
    try {
        // Generate grades based on assignments
        grades = assignments.filter(a => a.grade !== null).map(assignment => ({
            id: `grade-${assignment.id}`,
            assignmentId: assignment.id,
            assignmentTitle: assignment.title,
            courseId: assignment.courseId,
            courseName: enrolledCourses.find(c => c.id === assignment.courseId)?.title || 'Unknown Course',
            grade: assignment.grade,
            maxGrade: assignment.maxPoints || 100,
            submissionDate: assignment.submissionDate,
            feedback: 'Good work! Keep it up.'
        }));
        
        renderGrades();
        
    } catch (error) {
        console.error('Failed to load grades:', error);
        grades = [];
    }
}

// Load Student Progress
async function loadStudentProgress() {
    try {
        // Calculate overall progress
        const totalProgress = enrolledCourses.reduce((sum, course) => sum + course.progress, 0);
        const averageProgress = enrolledCourses.length > 0 ? totalProgress / enrolledCourses.length : 0;
        
        const totalGrades = grades.reduce((sum, grade) => sum + grade.grade, 0);
        const averageGrade = grades.length > 0 ? totalGrades / grades.length : 0;
        
        const completedAssignments = assignments.filter(a => a.submissionStatus === 'submitted').length;
        const totalAssignments = assignments.length;
        
        // Update progress metrics
        updateProgressMetrics({
            overallProgress: Math.round(averageProgress),
            averageGrade: Math.round(averageGrade),
            completedAssignments,
            totalAssignments,
            enrolledCourses: enrolledCourses.length
        });
        
    } catch (error) {
        console.error('Failed to load student progress:', error);
    }
}

// Render Functions
function renderEnrolledCourses() {
    const container = document.getElementById('enrolled-courses-list');
    if (!container) {
        console.log('⚠️ enrolled-courses-list container not found');
        return;
    }

    if (enrolledCourses.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--gray-600);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📚</div>
                <h3>No Enrolled Courses</h3>
                <p>You haven't enrolled in any courses yet.</p>
                <button class="btn btn-success" style="margin-top: 1rem;">Browse Available Courses</button>
            </div>
        `;
        return;
    }

    const coursesHTML = enrolledCourses.map(course => `
        <div style="background: var(--white); border: 1px solid var(--accent); border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; cursor: pointer; transition: all 0.2s ease;"
             onclick="viewCourse('${course.id}')"
             onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-md)'"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="color: var(--primary); margin: 0; font-size: 1.125rem;">${course.title}</h3>
                <span style="background: var(--success); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">${course.progress}% Complete</span>
            </div>
            <p style="color: var(--gray-700); margin-bottom: 1rem; font-size: 0.875rem;">${course.description}</p>
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem; font-size: 0.75rem; color: var(--gray-600);">
                <span>📚 ${course.level}</span>
                <span>⏱️ ${course.duration} weeks</span>
                <span>📅 Last accessed: ${new Date(course.lastAccessed).toLocaleDateString()}</span>
            </div>
            <div style="background: var(--accent); height: 8px; border-radius: 4px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, var(--success), var(--primary)); height: 100%; width: ${course.progress}%; transition: width 0.3s ease; border-radius: 4px;"></div>
            </div>
        </div>
    `).join('');

    container.innerHTML = coursesHTML;
    console.log(`✅ Rendered ${enrolledCourses.length} enrolled courses`);
}

function renderAssignments() {
    const container = document.getElementById('assignments-list');
    if (!container) {
        console.log('⚠️ assignments-list container not found');
        return;
    }

    if (assignments.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--gray-600);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📝</div>
                <h3>No Assignments</h3>
                <p>No assignments available at the moment.</p>
            </div>
        `;
        return;
    }

    const assignmentsHTML = assignments.map(assignment => {
        const course = enrolledCourses.find(c => c.id === assignment.courseId);
        const statusColor = assignment.submissionStatus === 'submitted' ? 'var(--success)' : 'var(--warning)';
        const statusIcon = assignment.submissionStatus === 'submitted' ? '✅' : '⏳';
        const statusText = assignment.submissionStatus === 'submitted' ? 'Submitted' : 'Pending';

        return `
            <div style="background: var(--white); border: 1px solid var(--accent); border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; cursor: pointer; transition: all 0.2s ease;"
                 onclick="viewAssignment('${assignment.id}')"
                 onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-md)'"
                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h4 style="color: var(--primary); margin: 0; font-size: 1rem;">${assignment.title}</h4>
                    <span style="background: ${statusColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">
                        ${statusIcon} ${statusText}
                    </span>
                </div>
                <p style="color: var(--gray-600); margin-bottom: 1rem; font-size: 0.875rem; font-weight: 600;">${course?.title || 'Unknown Course'}</p>
                <div style="display: flex; gap: 1rem; font-size: 0.75rem; color: var(--gray-600);">
                    <span>📅 Due: ${new Date(assignment.dueDate).toLocaleDateString()}</span>
                    ${assignment.grade ? `<span>📊 Grade: ${assignment.grade}/${assignment.maxPoints || 100}</span>` : ''}
                    ${assignment.submissionDate ? `<span>📤 Submitted: ${new Date(assignment.submissionDate).toLocaleDateString()}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = assignmentsHTML;
    console.log(`✅ Rendered ${assignments.length} assignments`);
}

function renderGrades() {
    const container = document.getElementById('grades-list');
    if (!container) {
        console.log('⚠️ grades-list container not found');
        return;
    }

    if (grades.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--gray-600);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                <h3>No Grades Available</h3>
                <p>Your grades will appear here once assignments are graded.</p>
            </div>
        `;
        return;
    }

    const gradesHTML = grades.map(grade => {
        let gradeColor = 'var(--error)';
        let gradeLabel = 'Needs Improvement';

        if (grade.grade >= 80) {
            gradeColor = 'var(--success)';
            gradeLabel = 'Excellent';
        } else if (grade.grade >= 70) {
            gradeColor = 'var(--warning)';
            gradeLabel = 'Good';
        }

        const percentage = Math.round((grade.grade / grade.maxGrade) * 100);

        return `
            <div style="background: var(--white); border: 1px solid var(--accent); border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h4 style="color: var(--primary); margin: 0; font-size: 1rem;">${grade.assignmentTitle}</h4>
                    <div style="text-align: right;">
                        <div style="background: ${gradeColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">
                            ${grade.grade}/${grade.maxGrade} (${percentage}%)
                        </div>
                        <div style="font-size: 0.75rem; color: ${gradeColor}; font-weight: 600;">${gradeLabel}</div>
                    </div>
                </div>
                <p style="color: var(--gray-600); margin-bottom: 1rem; font-size: 0.875rem; font-weight: 600;">${grade.courseName}</p>
                <div style="background: var(--accent); padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                    <div style="font-size: 0.875rem; color: var(--gray-700); margin-bottom: 0.5rem;">
                        <strong>Feedback:</strong> ${grade.feedback}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--gray-600);">
                        📅 Submitted: ${new Date(grade.submissionDate).toLocaleDateString()}
                    </div>
                </div>
                <div style="background: var(--gray-200); height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: ${gradeColor}; height: 100%; width: ${percentage}%; transition: width 0.3s ease; border-radius: 4px;"></div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = gradesHTML;
    console.log(`✅ Rendered ${grades.length} grades`);
}

// Update Progress Metrics
function updateProgressMetrics(metrics) {
    updateElement('overall-progress', `${metrics.overallProgress}%`);
    updateElement('average-grade', `${metrics.averageGrade}%`);
    updateElement('completed-assignments', `${metrics.completedAssignments}/${metrics.totalAssignments}`);
    updateElement('enrolled-courses-count', metrics.enrolledCourses);
    
    // Update progress bars
    const progressBar = document.getElementById('overall-progress-bar');
    if (progressBar) {
        progressBar.style.width = `${metrics.overallProgress}%`;
    }
}

// Utility Functions
function updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = content;
    }
}

function showNotification(message, type = 'info') {
    console.log(`${type.toUpperCase()}: ${message}`);
    // TODO: Implement proper notification system
}

function setupEventListeners() {
    // Add event listeners for student portal interactions
    console.log('Setting up student portal event listeners...');

    // AI Chat functionality
    const aiChatInput = document.getElementById('ai-chat-input');
    const sendButton = document.getElementById('btn-send-message');

    if (aiChatInput) {
        aiChatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendAIMessage();
            }
        });
    }

    if (sendButton) {
        sendButton.addEventListener('click', sendAIMessage);
    }

    // Filter functionality
    const courseFilter = document.getElementById('filter-course-status');
    const levelFilter = document.getElementById('filter-course-level');
    const searchInput = document.getElementById('search-courses');

    if (courseFilter) {
        courseFilter.addEventListener('change', filterCourses);
    }

    if (levelFilter) {
        levelFilter.addEventListener('change', filterCourses);
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterCourses);
    }

    // Assignment filters
    const assignmentStatusFilter = document.getElementById('filter-assignment-status');
    const assignmentCourseFilter = document.getElementById('filter-assignment-course');
    const assignmentSearch = document.getElementById('search-assignments');

    if (assignmentStatusFilter) {
        assignmentStatusFilter.addEventListener('change', filterAssignments);
    }

    if (assignmentCourseFilter) {
        assignmentCourseFilter.addEventListener('change', filterAssignments);
    }

    if (assignmentSearch) {
        assignmentSearch.addEventListener('input', filterAssignments);
    }

    // Resource filters
    const resourceTypeFilter = document.getElementById('filter-resource-type');
    const resourceCourseFilter = document.getElementById('filter-resource-course');
    const resourceSearch = document.getElementById('search-resources-input');

    if (resourceTypeFilter) {
        resourceTypeFilter.addEventListener('change', filterResources);
    }

    if (resourceCourseFilter) {
        resourceCourseFilter.addEventListener('change', filterResources);
    }

    if (resourceSearch) {
        resourceSearch.addEventListener('input', filterResources);
    }
}

// Filter Functions
function filterCourses() {
    console.log('Filtering courses...');
    // Implementation for course filtering
}

function filterAssignments() {
    console.log('Filtering assignments...');
    // Implementation for assignment filtering
}

function filterResources() {
    console.log('Filtering resources...');
    // Implementation for resource filtering
}

function loadDemoData() {
    console.log('Loading demo data for student portal...');

    // Demo student data
    studentData = {
        id: 'demo-student-1',
        name: 'Alex Johnson',
        email: 'alex.johnson@student.edu',
        avatar: 'AJ',
        enrollmentDate: new Date().toISOString(),
        status: 'active'
    };

    // Demo enrolled courses
    enrolledCourses = [
        {
            id: 'course-1',
            title: 'Digital Business Fundamentals',
            description: 'Learn the basics of digital business transformation and strategy.',
            level: 'Beginner',
            duration: '8',
            progress: 75,
            lastAccessed: new Date().toISOString(),
            enrollmentDate: new Date().toISOString()
        },
        {
            id: 'course-2',
            title: 'Data Analytics Essentials',
            description: 'Master data analysis techniques and tools for business insights.',
            level: 'Intermediate',
            duration: '10',
            progress: 45,
            lastAccessed: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            enrollmentDate: new Date().toISOString()
        }
    ];

    // Demo assignments
    assignments = [
        {
            id: 'assignment-1',
            title: 'Digital Strategy Analysis',
            courseId: 'course-1',
            dueDate: new Date(Date.now() + 7 * 86400000).toISOString(), // Next week
            submissionStatus: 'pending',
            submissionDate: null,
            grade: null,
            maxPoints: 100
        },
        {
            id: 'assignment-2',
            title: 'Data Visualization Project',
            courseId: 'course-2',
            dueDate: new Date(Date.now() + 3 * 86400000).toISOString(), // 3 days
            submissionStatus: 'submitted',
            submissionDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            grade: 85,
            maxPoints: 100
        },
        {
            id: 'assignment-3',
            title: 'Business Case Study',
            courseId: 'course-1',
            dueDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday (overdue)
            submissionStatus: 'submitted',
            submissionDate: new Date(Date.now() - 2 * 86400000).toISOString(),
            grade: 92,
            maxPoints: 100
        }
    ];

    // Demo grades
    grades = assignments.filter(a => a.grade !== null).map(assignment => ({
        id: `grade-${assignment.id}`,
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        courseId: assignment.courseId,
        courseName: enrolledCourses.find(c => c.id === assignment.courseId)?.title || 'Unknown Course',
        grade: assignment.grade,
        maxGrade: assignment.maxPoints || 100,
        submissionDate: assignment.submissionDate,
        feedback: assignment.grade >= 90 ? 'Excellent work! Outstanding analysis and presentation.' :
                 assignment.grade >= 80 ? 'Good work! Well-structured and comprehensive.' :
                 'Good effort. Consider reviewing the feedback for improvement.'
    }));

    // Update UI with demo data
    updateElement('student-name', studentData.name);
    updateElement('student-email', studentData.email);

    // Render demo data
    renderEnrolledCourses();
    renderAssignments();
    renderGrades();
    updateDashboard();

    console.log('✅ Demo data loaded successfully');
    showNotification('Demo data loaded. Student portal ready!', 'success');
}

// Global Functions for UI Interactions
window.viewCourse = function(courseId) {
    console.log('Viewing course:', courseId);
    showNotification(`Opening course: ${courseId}`, 'info');
};

window.viewAssignment = function(assignmentId) {
    console.log('Viewing assignment:', assignmentId);
    showNotification(`Opening assignment: ${assignmentId}`, 'info');
};

// Additional Student Portal Functions
window.downloadResource = function(resourceId) {
    console.log('Downloading resource:', resourceId);
    showNotification(`Downloading resource: ${resourceId}`, 'info');
};

window.askAITutor = function(question) {
    console.log('Asking AI Tutor:', question);
    showNotification('AI Tutor is processing your question...', 'info');

    // Simulate AI response
    setTimeout(() => {
        const responses = [
            "Great question! Let me help you understand this concept...",
            "Based on your learning progress, I recommend...",
            "Here's a simplified explanation of that topic...",
            "You might find it helpful to review the related materials..."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        // Add AI response to chat
        const chatContainer = document.getElementById('ai-chat-messages');
        if (chatContainer) {
            const responseDiv = document.createElement('div');
            responseDiv.style.cssText = 'background: var(--primary); color: white; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; max-width: 80%;';
            responseDiv.innerHTML = `<strong>AI Tutor:</strong> ${randomResponse}`;
            chatContainer.appendChild(responseDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, 1500);
};

window.sendAIMessage = function() {
    const input = document.getElementById('ai-chat-input');
    if (input && input.value.trim()) {
        const message = input.value.trim();

        // Add user message to chat
        const chatContainer = document.getElementById('ai-chat-messages');
        if (chatContainer) {
            const messageDiv = document.createElement('div');
            messageDiv.style.cssText = 'background: var(--white); padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; max-width: 80%; margin-left: auto; text-align: right;';
            messageDiv.innerHTML = `<strong>You:</strong> ${message}`;
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        // Clear input and ask AI
        input.value = '';
        askAITutor(message);
    }
};

// Update Dashboard with Student-specific Data
function updateDashboard() {
    try {
        // Update student-specific metrics
        updateElement('student-name', studentData.name || 'Student');
        updateElement('student-email', studentData.email || 'student@example.com');

        // Update course metrics
        updateElement('enrolled-courses-count', enrolledCourses.length);
        updateElement('active-courses', enrolledCourses.filter(c => c.progress < 100).length);

        // Update assignment metrics
        const pendingAssignments = assignments.filter(a => a.submissionStatus === 'pending').length;
        const submittedAssignments = assignments.filter(a => a.submissionStatus === 'submitted').length;

        updateElement('pending-assignments', pendingAssignments);
        updateElement('pending-assignments-value', pendingAssignments);
        updateElement('submitted-assignments-value', submittedAssignments);
        updateElement('total-assignments-value', assignments.length);

        // Calculate overdue assignments (simplified)
        const overdueAssignments = Math.floor(Math.random() * 3); // Demo data
        updateElement('overdue-assignments-value', overdueAssignments);

        // Update other metrics
        updateElement('upcoming-deadlines', Math.floor(Math.random() * 5) + 1);
        updateElement('study-streak', Math.floor(Math.random() * 15) + 1);

        // Update time-based elements
        updateElement('last-activity-time', new Date().toLocaleTimeString());

        // Update AI metrics
        updateElement('ai-sessions', Math.floor(Math.random() * 20) + 5);
        updateElement('questions-answered', Math.floor(Math.random() * 50) + 15);
        updateElement('study-recommendations', Math.floor(Math.random() * 10) + 3);
        updateElement('improvement-score', Math.floor(Math.random() * 30) + 70 + '%');

        // Update resource metrics
        updateElement('total-resources', Math.floor(Math.random() * 50) + 25);
        updateElement('video-resources', Math.floor(Math.random() * 20) + 10);
        updateElement('document-resources', Math.floor(Math.random() * 15) + 8);
        updateElement('interactive-resources', Math.floor(Math.random() * 10) + 5);

        // Update schedule metrics
        updateElement('today-classes', Math.floor(Math.random() * 4) + 1);
        updateElement('this-week-classes', Math.floor(Math.random() * 15) + 8);
        updateElement('upcoming-exams', Math.floor(Math.random() * 3) + 1);
        updateElement('study-hours-week', Math.floor(Math.random() * 20) + 15);

        // Update grade metrics
        const gpa = (Math.random() * 1.5 + 2.5).toFixed(2); // 2.5-4.0 GPA
        updateElement('overall-gpa-value', gpa);
        updateElement('current-semester-gpa', (Math.random() * 1.5 + 2.5).toFixed(2));
        updateElement('completed-credits', Math.floor(Math.random() * 60) + 30);
        updateElement('academic-standing', parseFloat(gpa) >= 3.5 ? 'Dean\'s List' : parseFloat(gpa) >= 3.0 ? 'Good Standing' : 'Satisfactory');

        console.log('✅ Dashboard updated successfully');

    } catch (error) {
        console.error('❌ Failed to update dashboard:', error);
    }
}

// Export functions
export {
    initializeStudentPortal,
    loadStudentProfile,
    loadEnrolledCourses,
    loadAssignments,
    loadGrades,
    updateProgressMetrics
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎓 DOM Content Loaded - Initializing Student Portal...');

    // Add small delay to ensure all scripts are loaded
    setTimeout(() => {
        initializeStudentPortal();
    }, 500);
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStudentPortal);
} else {
    // DOM already loaded
    setTimeout(() => {
        initializeStudentPortal();
    }, 500);
}

console.log('🎓 Student Portal Database Module loaded');
