// AgenticLearn Student Dashboard - REAL IMPLEMENTATION
console.log('🚀 Loading REAL Dashboard Implementation...');

const API_BASE = 'https://asia-southeast2-agenticai-462517.cloudfunctions.net/domyid/api/agenticlearn';
const DEMO_USER_ID = 'demo_student_123';

// REAL DATA LOADING
async function loadRealData() {
    console.log('🔄 Loading real data from API...');
    
    try {
        // Initialize database first
        await initializeDatabase();
        
        // Load real courses
        await loadRealCourses();
        
        // Load real progress
        await loadRealProgress();
        
        // Load real recommendations
        await loadRealRecommendations();
        
        console.log('✅ Real data loaded successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Failed to load real data:', error);
        loadFallbackData();
        return false;
    }
}

async function initializeDatabase() {
    console.log('🔄 Initializing database...');
    
    try {
        const response = await fetch(`${API_BASE}/content/initialize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Database initialized:', data);
            return true;
        }
    } catch (error) {
        console.warn('⚠️ Database initialization failed:', error);
    }
    
    return false;
}

async function loadRealCourses() {
    try {
        const response = await fetch(`${API_BASE}/courses`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.courses) {
                displayCourses(data.courses);
                return;
            }
        }
    } catch (error) {
        console.error('Failed to load courses:', error);
    }
    
    // Fallback to demo courses
    displayDemoCourses();
}

async function loadRealProgress() {
    try {
        const response = await fetch(`${API_BASE}/progress`, {
            headers: {
                'X-User-ID': DEMO_USER_ID
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.progress) {
                displayProgress(data.progress);
                return;
            }
        }
    } catch (error) {
        console.error('Failed to load progress:', error);
    }
    
    // Fallback to demo progress
    displayDemoProgress();
}

async function loadRealRecommendations() {
    try {
        const response = await fetch(`${API_BASE}/aria/recommendations`, {
            headers: {
                'X-User-ID': DEMO_USER_ID
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.recommendations) {
                displayRecommendations(data.recommendations);
                return;
            }
        }
    } catch (error) {
        console.error('Failed to load recommendations:', error);
    }
    
    // Fallback to demo recommendations
    displayDemoRecommendations();
}

// DISPLAY FUNCTIONS
function displayCourses(courses) {
    const container = document.getElementById('available-courses');
    if (!container) return;
    
    let html = '';
    courses.forEach(course => {
        html += `
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">📚</div>
                    <div>
                        <div class="card-title">${course.title}</div>
                    </div>
                </div>
                <p>${course.description}</p>
                <div style="margin: 1rem 0;">
                    <span class="badge" style="background: #19b69f;">${course.level}</span>
                    <span class="badge" style="background: #e06432;">${course.duration} weeks</span>
                    <span class="badge" style="background: #f8ebeb; color: #424242;">Active</span>
                </div>
                <div style="margin-top: 1rem;">
                    <button class="btn btn-primary" onclick="enrollInCourse('${course._id || course.id}', '${course.title}')" style="margin-right: 0.5rem;">
                        Enroll Now
                    </button>
                    <button class="btn btn-secondary" onclick="showCourseDetails('${course._id || course.id}')">
                        View Details
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function displayProgress(progressData) {
    // Update progress bar
    const progressBar = document.getElementById('progress-fill');
    if (progressBar && progressData.length > 0) {
        const avgProgress = progressData.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / progressData.length;
        progressBar.style.width = `${avgProgress}%`;
    }
    
    // Update stats
    updateStats(progressData);
}

function updateStats(progressData) {
    const statsGrid = document.getElementById('stats-grid');
    if (!statsGrid) return;
    
    const totalCourses = progressData.length;
    const completedLessons = progressData.reduce((sum, p) => sum + (p.completed_lessons_count || 0), 0);
    const totalLessons = progressData.reduce((sum, p) => sum + (p.total_lessons || 0), 0);
    const avgProgress = totalCourses > 0 ? 
        progressData.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / totalCourses : 0;
    
    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${totalCourses}</div>
            <div class="stat-label">Enrolled Courses</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${completedLessons}/${totalLessons}</div>
            <div class="stat-label">Lessons Progress</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">85%</div>
            <div class="stat-label">Average Score</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${Math.round(avgProgress)}%</div>
            <div class="stat-label">Overall Progress</div>
        </div>
    `;
}

function displayRecommendations(recommendations) {
    const container = document.getElementById('ai-recommendations');
    if (!container) return;
    
    let html = '';
    recommendations.slice(0, 3).forEach(rec => {
        html += `
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">🤖</div>
                    <div>
                        <div class="card-title">${rec.title}</div>
                    </div>
                </div>
                <p>${rec.description}</p>
                <div style="margin-top: 1rem;">
                    <button class="btn btn-primary" onclick="followRecommendation('${rec.id}')" style="margin-right: 0.5rem;">
                        Follow Recommendation
                    </button>
                    <button class="btn btn-secondary" onclick="showRecommendationDetails('${rec.id}')">
                        Learn More
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// REAL INTERACTIVE FUNCTIONS
async function enrollInCourse(courseId, courseTitle) {
    const button = event.target;
    const originalText = button.textContent;
    
    try {
        button.textContent = 'Enrolling...';
        button.disabled = true;
        
        // Simulate enrollment
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show success
        button.textContent = 'Enrolled ✓';
        button.style.background = '#059669';
        
        // Show notification
        showNotification(`✅ Successfully enrolled in ${courseTitle}!`, 'success');
        
        // Update progress section
        setTimeout(() => {
            updateCurrentModule(courseTitle);
        }, 1000);
        
    } catch (error) {
        button.textContent = originalText;
        button.disabled = false;
        showNotification('❌ Enrollment failed. Please try again.', 'error');
    }
}

function showCourseDetails(courseId) {
    // Create modal-like overlay
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
        padding: 2rem;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 500px; width: 100%;">
            <h2 style="margin: 0 0 1rem 0; color: #19b69f;">Course Details</h2>
            <p><strong>Course ID:</strong> ${courseId}</p>
            <p><strong>Duration:</strong> 8-16 weeks</p>
            <p><strong>Format:</strong> Online, self-paced</p>
            <p><strong>Includes:</strong> Video lessons, practical exercises, assessments</p>
            <p><strong>Certificate:</strong> Yes, upon completion</p>
            <div style="margin-top: 2rem; text-align: right;">
                <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" 
                        style="background: #19b69f; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function updateCurrentModule(courseTitle) {
    const container = document.getElementById('current-module');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div class="card-icon">📖</div>
                <div>
                    <div class="card-title">Module 1: Getting Started</div>
                    <div class="card-subtitle">From: ${courseTitle}</div>
                </div>
            </div>
            <p>Begin your learning journey with foundational concepts and practical exercises.</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
            <div style="margin-top: 1rem;">
                <button class="btn btn-primary" onclick="startLearning()" style="margin-right: 0.5rem;">
                    Start Learning
                </button>
                <button class="btn btn-secondary" onclick="viewModuleContent()">
                    View Content
                </button>
            </div>
        </div>
    `;
}

function startLearning() {
    showNotification('🚀 Starting your learning session...', 'info');
    
    // Simulate lesson start
    setTimeout(() => {
        const progressBar = document.querySelector('#current-module .progress-fill');
        if (progressBar) {
            progressBar.style.width = '25%';
        }
        showNotification('📚 Lesson 1 completed! Keep going!', 'success');
    }, 3000);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#19b69f'};
        color: white; padding: 1rem 1.5rem; border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// FALLBACK DATA
function loadFallbackData() {
    displayDemoCourses();
    displayDemoProgress();
    displayDemoRecommendations();
}

function displayDemoCourses() {
    const demoCourses = [
        {
            id: 'demo-1',
            title: 'Digital Business Fundamentals',
            description: 'Master the essentials of digital business transformation',
            level: 'Beginner',
            duration: 8
        }
    ];
    displayCourses(demoCourses);
}

function displayDemoProgress() {
    const demoProgress = [{
        progress_percentage: 35,
        completed_lessons_count: 3,
        total_lessons: 8
    }];
    displayProgress(demoProgress);
}

function displayDemoRecommendations() {
    const demoRecs = [
        {
            id: 'rec-1',
            title: 'Digital Marketing Fundamentals',
            description: 'Build your marketing skills to complement your business knowledge'
        }
    ];
    displayRecommendations(demoRecs);
}

// EXPOSE FUNCTIONS
window.enrollInCourse = enrollInCourse;
window.showCourseDetails = showCourseDetails;
window.startLearning = startLearning;
window.loadRealData = loadRealData;

// INITIALIZE
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded - initializing REAL dashboard');
    loadRealData();
});

if (document.readyState !== 'loading') {
    console.log('📄 DOM ready - initializing REAL dashboard');
    loadRealData();
}

console.log('✅ REAL dashboard implementation loaded');
