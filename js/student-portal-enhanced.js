// Enhanced Student Portal with Cloud Functions Integration
import { AgenticAPIClient } from "../agenticlearn-shared/js/api-client.js";
import { getCookie, deleteCookie } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/cookie.js";
import { setInner, onClick } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/element.js";
import { redirect } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/url.js";

// Initialize API client for Cloud Functions
const apiClient = new AgenticAPIClient();

// Get GitHub username for redirects
const GITHUB_USERNAME = window.location.hostname.includes('github.io') 
    ? window.location.hostname.split('.')[0] 
    : 'mubaroqadb';

let currentCourse = null;
let currentLesson = null;
let quizStartTime = null;

async function initializeStudentPortal() {
    const token = getCookie("access_token") || getCookie("login");
    if (!token) {
        redirect(`https://${GITHUB_USERNAME}.github.io/agenticlearn-auth`);
        return;
    }

    try {
        // Load student data and dashboard
        await loadStudentProfile();
        await loadDashboard();
        await loadAvailableCourses();
        
        // Setup event listeners
        setupEventListeners();

        // Update carbon indicator
        updateCarbonIndicator();

        showNotification("Student Portal loaded successfully! 🌱", "success");
        console.log("🌱 Student Portal loaded with real backend integration");
    } catch (error) {
        console.error("Failed to load student portal:", error);
        showNotification("Failed to load student portal", "error");
    }
}

async function loadStudentProfile() {
    try {
        const userName = getCookie("user_name") || "Student";
        const userEmail = getCookie("user_email") || "";
        
        setInner("student-name", userName);
        setInner("student-email", userEmail);
    } catch (error) {
        console.error("Failed to load student profile:", error);
        setInner("student-name", "Demo Student");
    }
}

async function loadDashboard() {
    try {
        const dashboard = await apiClient.assessment('/dashboard');

        if (dashboard.status === 'success') {
            const data = dashboard.data;
            
            // Update dashboard metrics
            setInner("enrolled-courses", data.enrolled_courses || 0);
            setInner("completed-lessons", data.completed_lessons || 0);
            setInner("total-progress", `${Math.round(data.overall_progress || 0)}%`);
            setInner("certificates-earned", data.certificates_earned || 0);
            
            // Render enrolled courses
            if (data.enrollments && data.enrollments.length > 0) {
                renderEnrolledCourses(data.enrollments);
            } else {
                setInner("enrolled-courses-list", "<p>Belum ada kursus yang diikuti. Silakan pilih kursus dari daftar yang tersedia.</p>");
            }
        }
    } catch (error) {
        console.error("Failed to load dashboard:", error);
        // Use demo data
        setInner("enrolled-courses", "1");
        setInner("completed-lessons", "3");
        setInner("total-progress", "25%");
        setInner("certificates-earned", "0");
        showNotification("Using demo data for dashboard", "info");
    }
}

async function loadAvailableCourses() {
    try {
        const courses = await apiClient.content('/courses?page=1&limit=10');

        if (courses.status === 'success' && courses.data.courses) {
            renderAvailableCourses(courses.data.courses);
        }
    } catch (error) {
        console.error("Failed to load courses:", error);
        renderDemoCourses();
        showNotification("Using demo data for courses", "info");
    }
}

function renderEnrolledCourses(enrollments) {
    const html = enrollments.map(enrollment => `
        <div class="course-card">
            <h4>${enrollment.course.title}</h4>
            <p>${enrollment.course.description}</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${enrollment.progress_percentage}%"></div>
            </div>
            <p>Progress: ${Math.round(enrollment.progress_percentage)}%</p>
            <button class="btn btn-primary" onclick="openCourse('${enrollment.course._id}')">
                Lanjutkan Belajar
            </button>
        </div>
    `).join('');
    
    setInner("enrolled-courses-list", html);
}

function renderAvailableCourses(courses) {
    const html = courses.map(course => `
        <div class="course-card">
            <h4>${course.title}</h4>
            <p>${course.description}</p>
            <div class="course-meta">
                <span>📚 ${course.modules?.length || 0} Modules</span>
                <span>⏱️ ${course.duration} weeks</span>
                <span>📊 ${course.level}</span>
            </div>
            <button class="btn btn-success" onclick="enrollCourse('${course._id}')">
                Daftar Kursus
            </button>
            <button class="btn btn-outline" onclick="viewCourseDetails('${course._id}')">
                Lihat Detail
            </button>
        </div>
    `).join('');
    
    setInner("available-courses-list", html);
}

function renderDemoCourses() {
    const demoCourses = [
        {
            _id: "demo-course-1",
            title: "Digital Business Mastery for Indonesian Professionals",
            description: "Comprehensive 16-week program covering digital literacy, e-commerce, digital marketing",
            duration: 16,
            level: "beginner",
            modules: [{}, {}]
        }
    ];
    renderAvailableCourses(demoCourses);
}

async function openCourse(courseId) {
    try {
        currentCourse = courseId;
        const courseDetails = await apiClient.content(`/courses/${courseId}`);

        if (courseDetails.status === 'success') {
            renderCourseContent(courseDetails.data);
            showSection('course-content');
        }
    } catch (error) {
        console.error("Failed to open course:", error);
        showNotification("Failed to load course content", "error");
    }
}

async function viewCourseDetails(courseId) {
    try {
        const courseDetails = await apiClient.content(`/courses/${courseId}`);

        if (courseDetails.status === 'success') {
            renderCoursePreview(courseDetails.data);
            showSection('course-preview');
        }
    } catch (error) {
        console.error("Failed to load course details:", error);
        showNotification("Failed to load course details", "error");
    }
}

function renderCourseContent(courseData) {
    const { course, modules } = courseData;
    
    setInner("course-title", course.title);
    setInner("course-description", course.description);
    
    if (modules && modules.length > 0) {
        const modulesHTML = modules.map((module, index) => `
            <div class="module-card">
                <h4>Module ${module.order}: ${module.title}</h4>
                <p>${module.description}</p>
                <div class="objectives">
                    <h5>Learning Objectives:</h5>
                    <ul>
                        ${module.objectives?.map(obj => `<li>${obj}</li>`).join('') || ''}
                    </ul>
                </div>
                <button class="btn btn-primary" onclick="loadModuleLessons('${module._id}')">
                    Mulai Module
                </button>
            </div>
        `).join('');
        
        setInner("course-modules", modulesHTML);
    }
}

async function loadModuleLessons(moduleId) {
    try {
        // For now, we'll load lessons by course ID since our API structure
        const modules = await apiClient.content(`/modules/${moduleId}`);

        if (modules.status === 'success') {
            // Find the specific module and its lessons
            // This would need to be enhanced based on actual API structure
            showNotification("Module lessons loaded", "success");
        }
    } catch (error) {
        console.error("Failed to load module lessons:", error);
        showNotification("Failed to load lessons", "error");
    }
}

async function enrollCourse(courseId) {
    try {
        // Note: We need to implement enrollment endpoint in backend
        showNotification("Enrollment feature coming soon!", "info");
        
        // For now, simulate enrollment
        setTimeout(() => {
            showNotification("Successfully enrolled in course!", "success");
            loadDashboard(); // Refresh dashboard
        }, 1000);
    } catch (error) {
        console.error("Failed to enroll:", error);
        showNotification("Failed to enroll in course", "error");
    }
}

function setupEventListeners() {
    onClick("btn-refresh-dashboard", refreshDashboard);
    onClick("btn-view-certificates", viewCertificates);
    onClick("btn-logout", logout);
    
    // Navigation
    onClick("nav-dashboard", () => showSection('dashboard'));
    onClick("nav-courses", () => showSection('available-courses'));
    onClick("nav-progress", () => showSection('progress-tracking'));
}

async function refreshDashboard() {
    showNotification("🔄 Refreshing dashboard...", "info");
    try {
        await loadDashboard();
        await loadAvailableCourses();
        updateCarbonIndicator();
        showNotification("✅ Dashboard refreshed!", "success");
    } catch (error) {
        showNotification("❌ Failed to refresh dashboard", "error");
    }
}

function viewCertificates() {
    showNotification("📜 Certificate viewer coming soon!", "info");
}

function logout() {
    // Clear all cookies
    deleteCookie("access_token");
    deleteCookie("refresh_token");
    deleteCookie("user_role");
    deleteCookie("user_email");
    deleteCookie("user_name");
    deleteCookie("login");
    
    showNotification("Logged out successfully", "success");
    setTimeout(() => {
        redirect(`https://${GITHUB_USERNAME}.github.io/agenticlearn-auth`);
    }, 1000);
}

function showSection(sectionId) {
    // Hide all sections
    const sections = ['dashboard', 'available-courses', 'course-content', 'course-preview', 'progress-tracking'];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.style.display = 'block';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function updateCarbonIndicator() {
    const metrics = apiClient.getCarbonMetrics();
    const indicator = document.getElementById("carbon-indicator");
    if (indicator) {
        indicator.textContent = `🌱 ${metrics.totalCarbon.toFixed(6)}g CO2`;
    }
}

// Global functions
window.openCourse = openCourse;
window.viewCourseDetails = viewCourseDetails;
window.enrollCourse = enrollCourse;
window.loadModuleLessons = loadModuleLessons;

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', initializeStudentPortal);

console.log("🌱 AgenticLearn Enhanced Student Portal loaded with Cloud Functions");
