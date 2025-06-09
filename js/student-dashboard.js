// AgenticLearn Student Dashboard dengan Shared Components + ARIA AI
import { apiClient } from "https://mubaroqadb.github.io/agenticlearn-shared/js/api-client.js";
import { UIComponents } from "https://mubaroqadb.github.io/agenticlearn-shared/js/ui-components.js";
import { ARIAChat } from "https://mubaroqadb.github.io/agenticlearn-shared/js/aria-chat.js";
import { getCookie } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/cookie.js";
import { setInner, onClick } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/element.js";
import { redirect } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/url.js";

// Create compatibility wrapper for API client
const compatApiClient = {
    async request(endpoint) {
        // Map endpoints to correct service calls
        if (endpoint.startsWith('/auth/')) {
            return apiClient.auth(endpoint.replace('/auth', ''));
        } else if (endpoint.startsWith('/learning/')) {
            return apiClient.content(endpoint.replace('/learning', ''));
        } else if (endpoint.startsWith('/personalization/')) {
            return apiClient.personalization(endpoint.replace('/personalization', ''));
        } else if (endpoint.startsWith('/aria/')) {
            return apiClient.aria(endpoint.replace('/aria', ''));
        } else {
            // Fallback to direct backend call
            const token = getCookie("access_token") || getCookie("login");
            const baseURL = window.location.hostname.includes('localhost')
                ? "http://localhost:8080/api/v1"
                : "https://agenticlearn-backend-production.up.railway.app/api/v1";

            console.log(`🔄 Making request to: ${baseURL}${endpoint}`);

            const response = await fetch(`${baseURL}${endpoint}`, {
                headers: {
                    "Authorization": token ? `Bearer ${token}` : "",
                    "Content-Type": "application/json"
                }
            });

            console.log(`📡 Response status: ${response.status}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log("📊 Response data:", data);
            return data;
        }
    }
};

// Global ARIA instance
let ariaChat = null;

async function initializeStudentDashboard() {
    const token = getCookie("login");

    try {
        // Load user data - use mock data if no token or API fails
        let userName = "Demo Student";
        if (token) {
            try {
                const response = await compatApiClient.request("/auth/profile");
                userName = response.data?.profile?.name || response.data?.email || "Demo Student";
            } catch (error) {
                console.log("Using demo mode - API not available");
                userName = "Demo Student (Offline Mode)";
            }
        } else {
            userName = "Guest User";
        }

        setInner("user-name", userName);

        // Load dashboard data
        await loadStudentProgress();
        await loadAvailableCourses();
        await loadCurrentModule();
        await loadAIRecommendations();

        // Setup event listeners
        setupEventListeners();

        // Initialize ARIA Chat
        initializeARIA();

        // Update carbon indicator
        updateCarbonIndicator();

        // Auto-refresh every 30 seconds
        setInterval(() => {
            loadStudentProgress();
            updateCarbonIndicator();
        }, 30000);

        // Show welcome notification
        UIComponents.showNotification(`Welcome back, ${userName}! 🌱`, "success");

        console.log("🌱 Student Dashboard loaded with shared components");
    } catch (error) {
        console.error("Failed to load student dashboard:", error);
        setInner("user-name", "Demo Student");

        // Load with mock data
        await loadStudentProgress();
        await loadAIRecommendations();
        await loadCurrentModule();
        setupEventListeners();
        initializeARIA();
        updateCarbonIndicator();

        UIComponents.showNotification("Dashboard loaded in demo mode", "info");
    }
}

async function loadStudentProgress() {
    try {
        // Use available endpoint or create mock data
        const progress = await compatApiClient.request("/learning/dashboard").catch(() => ({
            overallProgress: 65,
            completedCourses: 2,
            averageScore: 85,
            streakDays: 7,
            goalsAchieved: 3
        }));
        
        // Update progress bar
        const progressFill = document.getElementById("progress-fill");
        if (progressFill) {
            progressFill.style.width = `${progress.data?.overallProgress || progress.overallProgress || 0}%`;
        }
        
        // Create stats cards using shared UI components
        const statsHTML = `
            <div class="grid">
                ${UIComponents.createCard(
                    "📚 Courses Completed",
                    `<div class="metric-value">${progress.data?.completedCourses || progress.completedCourses || 0}</div>`,
                    []
                )}
                ${UIComponents.createCard(
                    "⭐ Average Score",
                    `<div class="metric-value">${progress.data?.averageScore || progress.averageScore || 0}%</div>`,
                    []
                )}
                ${UIComponents.createCard(
                    "🔥 Streak Days",
                    `<div class="metric-value">${progress.data?.streakDays || progress.streakDays || 0}</div>`,
                    []
                )}
                ${UIComponents.createCard(
                    "🎯 Goals Achieved",
                    `<div class="metric-value">${progress.data?.goalsAchieved || progress.goalsAchieved || 0}</div>`,
                    []
                )}
            </div>
        `;
        
        setInner("stats-grid", statsHTML);
        
    } catch (error) {
        console.error("Failed to load student progress:", error);
        setInner("stats-grid", UIComponents.createCard(
            "Error",
            "Failed to load progress data",
            []
        ));
    }
}

async function loadAIRecommendations() {
    try {
        // Use available endpoint or create mock data
        const recommendations = await compatApiClient.request("/personalization/recommendations/675a1b2c3d4e5f6789012345").catch(() => [
            {
                id: "rec1",
                title: "Green Computing Fundamentals",
                description: "Based on your learning pattern, we recommend starting with energy efficiency concepts."
            },
            {
                id: "rec2",
                title: "Carbon Footprint Calculation",
                description: "Learn how to measure and reduce IT environmental impact."
            }
        ]);
        
        let recommendationsHTML = "";
        const recData = recommendations.data || recommendations;
        if (recData && recData.length > 0) {
            recData.slice(0, 3).forEach(rec => {
                recommendationsHTML += UIComponents.createCard(
                    `🤖 ${rec.title}`,
                    rec.description,
                    [
                        { label: "Start Now", handler: `startRecommendation('${rec.id}')` },
                        { label: "Learn More", handler: `learnMore('${rec.id}')` }
                    ]
                );
            });
        } else {
            recommendationsHTML = UIComponents.createCard(
                "🤖 AI Recommendations",
                "No recommendations available at the moment. Complete more activities to get personalized suggestions!",
                []
            );
        }
        
        setInner("ai-recommendations", recommendationsHTML);
        
    } catch (error) {
        console.error("Failed to load AI recommendations:", error);
        setInner("ai-recommendations", UIComponents.createCard(
            "Error",
            "Failed to load AI recommendations",
            []
        ));
    }
}

async function loadAvailableCourses() {
    try {
        console.log("🔄 Loading available courses from database...");

        // Get courses from database
        const response = await compatApiClient.request("/learning/courses?page=1&limit=10");
        console.log("📚 Courses response:", response);

        if (response.status === 'success' && response.data && response.data.courses) {
            const courses = response.data.courses;
            console.log(`✅ Found ${courses.length} courses`);

            let coursesHTML = "";
            courses.forEach(course => {
                coursesHTML += UIComponents.createCard(
                    `📚 ${course.title}`,
                    `
                        <p>${course.description}</p>
                        <div style="margin: 1rem 0;">
                            <span class="badge" style="background: var(--success); color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
                                ${course.level} • ${course.duration} weeks
                            </span>
                        </div>
                    `,
                    [
                        { label: "Mulai Kursus", handler: `startCourse('${course._id}')` },
                        { label: "Lihat Detail", handler: `viewCourseDetails('${course._id}')` }
                    ]
                );
            });

            setInner("available-courses", coursesHTML);
        } else {
            console.warn("⚠️ No courses found in response");
            setInner("available-courses", UIComponents.createCard(
                "📚 Belum Ada Kursus",
                "Belum ada kursus yang tersedia saat ini. Silakan coba lagi nanti.",
                []
            ));
        }

    } catch (error) {
        console.error("❌ Failed to load courses:", error);
        setInner("available-courses", UIComponents.createCard(
            "Error",
            "Gagal memuat kursus. Menggunakan data demo.",
            []
        ));

        // Load demo course
        loadDemoCourse();
    }
}

function loadDemoCourse() {
    const demoHTML = UIComponents.createCard(
        "📚 Digital Business Mastery for Indonesian Professionals",
        `
            <p>Comprehensive 16-week program covering digital literacy, e-commerce, digital marketing, business development, and industry integration specifically designed for Indonesian market</p>
            <div style="margin: 1rem 0;">
                <span class="badge" style="background: var(--success); color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
                    beginner • 16 weeks
                </span>
            </div>
        `,
        [
            { label: "Mulai Kursus", handler: "startDemoCourse()" },
            { label: "Lihat Detail", handler: "viewDemoCourseDetails()" }
        ]
    );

    setInner("available-courses", demoHTML);
}

async function loadCurrentModule() {
    try {
        console.log("🔄 Loading current module...");

        // Try to get current progress first
        const courses = await compatApiClient.request("/learning/courses?page=1&limit=1");

        if (courses.status === 'success' && courses.data && courses.data.courses && courses.data.courses.length > 0) {
            const course = courses.data.courses[0];
            console.log("📖 Current course:", course);

            // Get modules for this course
            try {
                const modulesResponse = await compatApiClient.request(`/learning/courses/${course._id}`);
                console.log("📋 Modules response:", modulesResponse);

                if (modulesResponse.status === 'success' && modulesResponse.data && modulesResponse.data.modules) {
                    const modules = modulesResponse.data.modules;
                    const currentModule = modules[0]; // Get first module as current

                    if (currentModule) {
                        const moduleHTML = UIComponents.createCard(
                            `📖 ${currentModule.title}`,
                            `
                                <p>${currentModule.description}</p>
                                <div style="margin: 1rem 0;">
                                    <span class="badge" style="background: var(--primary); color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
                                        Week ${currentModule.week_start}-${currentModule.week_end}
                                    </span>
                                </div>
                                ${UIComponents.createProgressBar(25, "Module Progress")}
                            `,
                            [
                                { label: "Lanjutkan Belajar", handler: `continueModule('${currentModule._id}')` },
                                { label: "Lihat Lessons", handler: `viewModuleLessons('${currentModule._id}')` }
                            ]
                        );

                        setInner("current-module", moduleHTML);
                        return;
                    }
                }
            } catch (moduleError) {
                console.error("Failed to load modules:", moduleError);
            }
        }

        // Fallback to demo module
        loadDemoModule();

    } catch (error) {
        console.error("Failed to load current module:", error);
        loadDemoModule();
    }
}

function loadDemoModule() {
    const demoHTML = UIComponents.createCard(
        "📖 Digital Literacy Essentials",
        `
            <p>Foundational digital skills untuk business professionals</p>
            <div style="margin: 1rem 0;">
                <span class="badge" style="background: var(--primary); color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
                    Week 1-2
                </span>
            </div>
            ${UIComponents.createProgressBar(25, "Module Progress")}
        `,
        [
            { label: "Lanjutkan Belajar", handler: "continueDemoModule()" },
            { label: "Lihat Lessons", handler: "viewDemoLessons()" }
        ]
    );

    setInner("current-module", demoHTML);
}

function setupEventListeners() {
    onClick("btn-assessment", () => {
        UIComponents.showNotification("Starting quick assessment...", "info");
        // TODO: Implement assessment
        setTimeout(() => {
            UIComponents.showNotification("Assessment completed! 🎉", "success");
        }, 2000);
    });
    
    onClick("btn-progress", () => {
        UIComponents.showNotification("Opening detailed progress view...", "info");
        // TODO: Implement detailed progress view
    });
    
    onClick("btn-chat", () => {
        toggleARIAChat();
    });

    onClick("btn-aria-toggle", () => {
        toggleARIAChat();
    });

    // ARIA floating button
    const ariaFloatingBtn = document.getElementById("aria-floating-btn");
    if (ariaFloatingBtn) {
        ariaFloatingBtn.addEventListener('click', toggleARIAChat);

        // Hover effects
        ariaFloatingBtn.addEventListener('mouseenter', () => {
            ariaFloatingBtn.style.transform = 'scale(1.1)';
            ariaFloatingBtn.style.boxShadow = '0 6px 20px rgba(46, 125, 50, 0.4)';
        });

        ariaFloatingBtn.addEventListener('mouseleave', () => {
            ariaFloatingBtn.style.transform = 'scale(1)';
            ariaFloatingBtn.style.boxShadow = '0 4px 16px rgba(46, 125, 50, 0.3)';
        });
    }
}

function updateCarbonIndicator() {
    const metrics = apiClient.getCarbonMetrics();
    const indicator = document.getElementById("carbon-indicator");
    if (indicator) {
        indicator.textContent = `🌱 ${metrics.totalCarbon.toFixed(6)}g CO2`;
    }
}

// Global functions for UI interactions
window.startRecommendation = function(id) {
    UIComponents.showNotification(`Starting recommendation: ${id}`, "info");
    // TODO: Implement recommendation start
};

window.learnMore = function(id) {
    UIComponents.showNotification(`Learning more about: ${id}`, "info");
    // TODO: Implement learn more
};

window.continueModule = function(id) {
    UIComponents.showNotification(`Continuing module: ${id}`, "info");
    // TODO: Implement module continuation
};

window.viewModuleDetails = function(id) {
    UIComponents.showNotification(`Viewing details for module: ${id}`, "info");
    // TODO: Implement module details view
};

window.browseCourses = function() {
    UIComponents.showNotification("Opening course catalog...", "info");
    // TODO: Implement course browsing
};

// Course interaction functions
window.startCourse = function(courseId) {
    UIComponents.showNotification(`Starting course: ${courseId}`, "info");
    console.log("🚀 Starting course:", courseId);
    // TODO: Implement course start logic
    // For now, show success message
    setTimeout(() => {
        UIComponents.showNotification("Course started! Check your current module.", "success");
        loadCurrentModule(); // Refresh current module
    }, 1000);
};

window.viewCourseDetails = function(courseId) {
    UIComponents.showNotification(`Loading course details: ${courseId}`, "info");
    console.log("📖 Viewing course details:", courseId);
    // Redirect to course details page
    window.location.href = `course-details.html?id=${courseId}`;
};

window.startDemoCourse = function() {
    UIComponents.showNotification("Starting demo course...", "info");
    setTimeout(() => {
        UIComponents.showNotification("Demo course started! 🎉", "success");
        loadDemoModule();
    }, 1000);
};

window.viewDemoCourseDetails = function() {
    UIComponents.showNotification("Showing demo course details...", "info");
    // TODO: Show demo course details modal
};

window.continueModule = function(moduleId) {
    UIComponents.showNotification(`Continuing module: ${moduleId}`, "info");
    console.log("📖 Continuing module:", moduleId);
    // TODO: Navigate to module learning page
};

window.viewModuleLessons = function(moduleId) {
    UIComponents.showNotification(`Loading lessons for module: ${moduleId}`, "info");
    console.log("📝 Loading lessons for module:", moduleId);
    // TODO: Show lessons list or navigate to lessons page
};

window.continueDemoModule = function() {
    UIComponents.showNotification("Continuing demo module...", "info");
    // TODO: Navigate to demo module content
};

window.viewDemoLessons = function() {
    UIComponents.showNotification("Loading demo lessons...", "info");
    // TODO: Show demo lessons
};

// ARIA Chat Functions
function initializeARIA() {
    try {
        // Initialize ARIA chat widget
        ariaChat = new ARIAChat('aria-chat-widget', {
            theme: 'green',
            showSuggestions: true,
            showCarbonTracker: true,
            autoScroll: true,
            maxMessages: 50
        });

        console.log('🤖 ARIA Chat initialized successfully');

        // Show welcome message after 2 seconds
        setTimeout(() => {
            UIComponents.showNotification("ARIA AI Tutor siap membantu! Klik tombol 🤖 untuk mulai chat.", "info");
        }, 2000);

    } catch (error) {
        console.error('Failed to initialize ARIA:', error);
        UIComponents.showNotification("ARIA AI Tutor tidak tersedia saat ini", "error");
    }
}

function toggleARIAChat() {
    const chatWidget = document.getElementById('aria-chat-widget');
    const floatingBtn = document.getElementById('aria-floating-btn');

    if (!ariaChat) {
        UIComponents.showNotification("ARIA sedang dimuat...", "info");
        return;
    }

    if (chatWidget.style.display === 'none' || !chatWidget.style.display) {
        // Show chat
        chatWidget.style.display = 'block';
        floatingBtn.style.display = 'none';

        // Track interaction
        updateCarbonIndicator();

        UIComponents.showNotification("ARIA AI Tutor aktif! 🤖", "success");
    } else {
        // Hide chat
        chatWidget.style.display = 'none';
        floatingBtn.style.display = 'flex';
    }
}

// Test ARIA Health
async function testARIAHealth() {
    try {
        const health = await apiClient.ariaHealthCheck();
        console.log('🤖 ARIA Health:', health);

        if (health.status === 'healthy') {
            UIComponents.showNotification("ARIA AI Tutor online dan siap! ✅", "success");
        } else {
            UIComponents.showNotification("ARIA AI Tutor mengalami masalah", "warning");
        }
    } catch (error) {
        console.error('ARIA Health Check failed:', error);
        UIComponents.showNotification("ARIA AI Tutor offline", "error");
    }
}

// Auto-test ARIA health on load
setTimeout(testARIAHealth, 3000);

document.addEventListener('DOMContentLoaded', initializeStudentDashboard);
