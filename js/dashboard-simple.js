// AgenticLearn Student Dashboard - Simple & Direct Implementation
console.log('🚀 Loading Simple Dashboard...');

// IMMEDIATE DEMO DATA LOADING
function loadDemoData() {
    console.log('📊 Loading demo data...');
    
    // Update progress bar
    const progressFill = document.getElementById("progress-fill");
    if (progressFill) {
        progressFill.style.width = "35%";
    }
    
    // Update available courses
    const availableCourses = document.getElementById("available-courses");
    if (availableCourses) {
        availableCourses.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">📚</div>
                    <div>
                        <div class="card-title">Digital Business Fundamentals</div>
                    </div>
                </div>
                <p>Master the essentials of digital business transformation, e-commerce, and online marketing strategies.</p>
                <div style="margin: 1rem 0;">
                    <span style="background: #19b69f; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; margin-right: 0.5rem;">Beginner</span>
                    <span style="background: #e06432; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; margin-right: 0.5rem;">8 weeks</span>
                    <span style="background: #f8ebeb; color: #424242; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">16 lessons</span>
                </div>
                <div style="margin-top: 1rem;">
                    <button class="btn btn-primary" onclick="startCourse('demo-course-1')" style="margin-right: 0.5rem;">Start Course</button>
                    <button class="btn btn-secondary" onclick="viewCourseDetails('demo-course-1')">View Details</button>
                </div>
            </div>
        `;
    }
    
    // Update current module
    const currentModule = document.getElementById("current-module");
    if (currentModule) {
        currentModule.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">📖</div>
                    <div>
                        <div class="card-title">Digital Literacy Essentials</div>
                        <div class="card-subtitle">Current Learning Module</div>
                    </div>
                </div>
                <p>Foundational digital skills untuk business professionals</p>
                <div style="margin: 1rem 0;">
                    <span style="background: #19b69f; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">Week 1-2</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 35%"></div>
                </div>
                <div style="margin-top: 1rem;">
                    <button class="btn btn-primary" onclick="continueDemoModule()" style="margin-right: 0.5rem;">Continue Learning</button>
                    <button class="btn btn-secondary" onclick="viewDemoLessons()">View Lessons</button>
                </div>
            </div>
        `;
    }
    
    // Update AI recommendations
    const aiRecommendations = document.getElementById("ai-recommendations");
    if (aiRecommendations) {
        aiRecommendations.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">🤖</div>
                    <div>
                        <div class="card-title">Digital Marketing Fundamentals</div>
                    </div>
                </div>
                <p>Based on your progress in Digital Business, we recommend starting with marketing basics to build a strong foundation.</p>
                <div style="margin-top: 1rem;">
                    <button class="btn btn-primary" onclick="startRecommendation('rec-1')" style="margin-right: 0.5rem;">Start Now</button>
                    <button class="btn btn-secondary" onclick="learnMore('rec-1')">Learn More</button>
                </div>
            </div>
        `;
    }
    
    console.log('✅ Demo data loaded');
}

// SIMPLE FUNCTION DEFINITIONS
function startCourse(courseId) {
    console.log('Starting course:', courseId);
    alert(`Starting Course: ${courseId}\n\nThis would:\n• Enroll you in the course\n• Set up progress tracking\n• Navigate to first lesson\n\nFeature coming soon!`);
}

function viewCourseDetails(courseId) {
    console.log('Viewing course details:', courseId);
    alert(`Course Details: ${courseId}\n\nThis would show:\n• Complete curriculum\n• Learning objectives\n• Prerequisites\n• Reviews\n\nFeature coming soon!`);
}

function continueModule(moduleId) {
    console.log('Continuing module:', moduleId);
    alert(`Continue Module: ${moduleId}\n\nThis would:\n• Resume from last lesson\n• Show progress\n• Load content\n\nFeature coming soon!`);
}

function viewModuleLessons(moduleId) {
    console.log('Viewing module lessons:', moduleId);
    alert(`Module Lessons: ${moduleId}\n\nThis would show:\n• List of lessons\n• Completion status\n• Learning objectives\n\nFeature coming soon!`);
}

function viewCourseProgress(courseId) {
    console.log('Viewing course progress:', courseId);
    alert(`Course Progress: ${courseId}\n\nThis would show:\n• Completion percentage\n• Quiz scores\n• Time spent\n\nFeature coming soon!`);
}

function startRecommendation(recId) {
    console.log('Starting recommendation:', recId);
    alert(`AI Recommendation: ${recId}\n\nThis would:\n• Start recommended path\n• Customize content\n• Track effectiveness\n\nFeature coming soon!`);
}

function learnMore(recId) {
    console.log('Learning more about:', recId);
    alert(`Recommendation Details: ${recId}\n\nThis would show:\n• Why recommended\n• Learning objectives\n• Time commitment\n\nFeature coming soon!`);
}

function startAssessment(type) {
    console.log('Starting assessment:', type);
    alert(`Assessment: ${type}\n\nThis would:\n• Start assessment interface\n• Track progress\n• Generate results\n\nFeature coming soon!`);
}

function openGoalSetting() {
    console.log('Opening goal setting');
    alert(`Goal Setting\n\nThis would open:\n• SMART goal creation\n• Timeline setting\n• Milestone planning\n\nFeature coming soon!`);
}

function viewActiveGoals() {
    console.log('Viewing active goals');
    alert(`Active Goals\n\nThis would show:\n• Current goals\n• Progress tracking\n• Achievement status\n\nFeature coming soon!`);
}

function generateDailyPlan() {
    console.log('Generating daily plan');
    alert(`Daily Plan\n\nThis would generate:\n• Personalized tasks\n• Learning schedule\n• Goal alignment\n\nFeature coming soon!`);
}

function loadPerformanceReport() {
    console.log('Loading performance report');
    alert(`Performance Report\n\nThis would show:\n• Learning analytics\n• Progress trends\n• Recommendations\n\nFeature coming soon!`);
}

function loadOptimizationStatus() {
    console.log('Loading optimization status');
    alert(`Optimization Status\n\nThis would show:\n• System performance\n• Resource usage\n• Improvements\n\nFeature coming soon!`);
}

function loadCarbonReport() {
    console.log('Loading carbon report');
    alert(`Carbon Report\n\nThis would show:\n• Environmental impact\n• Sustainability metrics\n• Green tips\n\nFeature coming soon!`);
}

function runSystemTest() {
    console.log('Running system test');
    alert(`System Test\n\nThis would run:\n• Connectivity tests\n• Performance checks\n• Feature validation\n\nFeature coming soon!`);
}

function toggleARIAChat() {
    console.log('Toggling ARIA chat');
    alert(`ARIA Chat\n\nThis would open:\n• AI tutor interface\n• Real-time assistance\n• Learning guidance\n\nFeature coming soon!`);
}

function toggleARIATutor() {
    console.log('Toggling ARIA tutor');
    alert(`ARIA Tutor\n\nThis would activate:\n• Intelligent tutoring\n• Adaptive guidance\n• Personalized help\n\nFeature coming soon!`);
}

function initializeContent() {
    console.log('Initializing content');
    alert(`Content Initialization\n\nThis would:\n• Set up personalized content\n• Configure preferences\n• Initialize tracking\n\nFeature coming soon!`);
}

function continueDemoModule() {
    console.log('Continuing demo module');
    alert(`Continue Demo Module\n\nThis would:\n• Resume from current lesson\n• Show interactive content\n• Track progress\n\nFeature coming soon!`);
}

function viewDemoLessons() {
    console.log('Viewing demo lessons');
    alert(`Demo Lessons\n\nDigital Literacy Essentials:\n\n✅ Lesson 1: Digital Tools\n✅ Lesson 2: Communication\n✅ Lesson 3: File Management\n🔄 Lesson 4: Current\n⏳ Lesson 5: Online Safety\n\nFeature coming soon!`);
}

function loadSectionData(section) {
    console.log('Loading section data:', section);
    // Section-specific data loading would go here
}

// EXPOSE ALL FUNCTIONS TO WINDOW
window.startCourse = startCourse;
window.viewCourseDetails = viewCourseDetails;
window.continueModule = continueModule;
window.viewModuleLessons = viewModuleLessons;
window.viewCourseProgress = viewCourseProgress;
window.startRecommendation = startRecommendation;
window.learnMore = learnMore;
window.startAssessment = startAssessment;
window.openGoalSetting = openGoalSetting;
window.viewActiveGoals = viewActiveGoals;
window.generateDailyPlan = generateDailyPlan;
window.loadPerformanceReport = loadPerformanceReport;
window.loadOptimizationStatus = loadOptimizationStatus;
window.loadCarbonReport = loadCarbonReport;
window.runSystemTest = runSystemTest;
window.toggleARIAChat = toggleARIAChat;
window.toggleARIATutor = toggleARIATutor;
window.initializeContent = initializeContent;
window.continueDemoModule = continueDemoModule;
window.viewDemoLessons = viewDemoLessons;
window.loadSectionData = loadSectionData;

console.log('✅ All functions exposed to window');

// INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded - initializing dashboard');
    loadDemoData();
});

// If DOM already loaded
if (document.readyState !== 'loading') {
    console.log('📄 DOM already ready - initializing dashboard');
    loadDemoData();
}

console.log('✅ Simple dashboard script loaded');
