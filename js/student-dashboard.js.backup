// AgenticLearn Student Dashboard dengan JSCroot
import { getCookie } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/cookie.js";
import { setInner, onClick } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/element.js";
import { redirect } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/url.js";

// Global variables for components
let UIComponents, ARIAChat;

// Initialize components
async function initializeComponents() {
    try {
        const uiModule = await import("https://mubaroqadb.github.io/agenticlearn-shared/js/ui-components.js");
        UIComponents = uiModule.UIComponents;
        console.log("✅ UIComponents loaded");
    } catch (error) {
        console.warn("⚠️ Failed to load UIComponents, using fallback");
        // Fallback UIComponents
        UIComponents = {
            createCard: (title, content, actions = []) => {
                const actionsHTML = actions.map(action =>
                    `<button class="btn" onclick="${action.handler}">${action.label}</button>`
                ).join(' ');
                return `
                    <div class="card" style="background: white; padding: 1rem; margin: 1rem 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h3 style="margin: 0 0 0.5rem 0; color: #2563eb;">${title}</h3>
                        <div>${content}</div>
                        ${actionsHTML ? `<div style="margin-top: 1rem;">${actionsHTML}</div>` : ''}
                    </div>
                `;
            },
            createProgressBar: (percentage, label) => {
                return `
                    <div style="margin: 1rem 0;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span>${label}</span>
                            <span>${percentage}%</span>
                        </div>
                        <div style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                            <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, #059669, #2563eb); transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                `;
            },
            showNotification: (message, type = 'info') => {
                console.log(`${type.toUpperCase()}: ${message}`);
                // Simple notification fallback
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed; top: 20px; right: 20px; z-index: 1000;
                    background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#2563eb'};
                    color: white; padding: 1rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    max-width: 300px; animation: slideIn 0.3s ease-out;
                `;
                notification.textContent = message;
                document.body.appendChild(notification);

                setTimeout(() => {
                    notification.style.animation = 'slideOut 0.3s ease-out';
                    setTimeout(() => notification.remove(), 300);
                }, 3000);
            }
        };
    }

    try {
        const ariaModule = await import("https://mubaroqadb.github.io/agenticlearn-shared/js/aria-chat.js");
        ARIAChat = ariaModule.ARIAChat;
        console.log("✅ ARIAChat loaded");
    } catch (error) {
        console.warn("⚠️ Failed to load ARIAChat, using fallback");
        ARIAChat = class {
            constructor() {
                console.log("ARIA Chat fallback initialized");
            }
            show() { console.log("ARIA Chat show"); }
            hide() { console.log("ARIA Chat hide"); }
            toggle() { console.log("ARIA Chat toggle"); }
        };
    }
}

// Simple API client for direct backend calls
const compatApiClient = {
    async request(endpoint) {
        try {
            const token = getCookie("access_token") || getCookie("login");
            // Always use localhost backend for development
            const baseURL = "http://localhost:8080/api/v1";

            console.log(`🔄 Making request to: ${baseURL}${endpoint}`);

            const response = await fetch(`${baseURL}${endpoint}`, {
                headers: {
                    "Authorization": token ? `Bearer ${token}` : "",
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });

            console.log(`📡 Response status: ${response.status}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("📊 Response data:", data);
            return data;
        } catch (error) {
            console.error("❌ API Request failed:", error);
            throw error;
        }
    }
};

// Global ARIA instance
let ariaChat = null;

async function initializeStudentDashboard() {
    // Set dashboard start time for carbon tracking
    window.dashboardStartTime = Date.now();

    // Initialize components first
    await initializeComponents();

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
        await loadEnrolledCourses();
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

        // Verify global functions are available
        console.log("🔍 Global functions verification:");
        console.log("- startCourse:", typeof window.startCourse);
        console.log("- viewCourseDetails:", typeof window.viewCourseDetails);
        console.log("- continueModule:", typeof window.continueModule);
        console.log("- viewModuleLessons:", typeof window.viewModuleLessons);

    } catch (error) {
        console.error("Failed to load student dashboard:", error);
        setInner("user-name", "Demo Student");

        // Load with mock data
        await loadStudentProgress();
        await loadEnrolledCourses();
        await loadAIRecommendations();
        await loadCurrentModule();
        setupEventListeners();
        initializeARIA();
        updateCarbonIndicator();

        UIComponents.showNotification("Dashboard loaded in demo mode", "info");

        // Verify global functions are available in error case too
        console.log("🔍 Global functions verification (error case):");
        console.log("- startCourse:", typeof window.startCourse);
        console.log("- viewCourseDetails:", typeof window.viewCourseDetails);
        console.log("- continueModule:", typeof window.continueModule);
        console.log("- viewModuleLessons:", typeof window.viewModuleLessons);
    }
}

async function loadStudentProgress() {
    try {
        console.log("🔄 Loading student progress from database...");

        // Get real dashboard data from backend
        const dashboardResponse = await compatApiClient.request("/learning/dashboard");
        console.log("📊 Dashboard response:", dashboardResponse);

        let progressData = {};
        let overallProgress = 0;
        let completedCourses = 0;
        let totalLessons = 0;
        let completedLessons = 0;
        let averageScore = 0;

        if (dashboardResponse.status === 'success' && dashboardResponse.data) {
            const data = dashboardResponse.data;

            // Calculate metrics from real data
            completedCourses = data.enrolled_courses ? data.enrolled_courses.length : 0;

            // Calculate overall progress and lessons
            if (data.enrolled_courses && data.enrolled_courses.length > 0) {
                let totalProgressSum = 0;
                let totalScoreSum = 0;
                let scoreCount = 0;

                data.enrolled_courses.forEach(enrollment => {
                    const progress = enrollment.progress;
                    if (progress) {
                        totalProgressSum += progress.overall_progress || 0;
                        completedLessons += progress.completed_lessons ? progress.completed_lessons.length : 0;
                        totalLessons += progress.total_lessons || 0;

                        if (progress.average_score && progress.average_score > 0) {
                            totalScoreSum += progress.average_score;
                            scoreCount++;
                        }
                    }
                });

                overallProgress = completedCourses > 0 ? Math.round(totalProgressSum / completedCourses) : 0;
                averageScore = scoreCount > 0 ? Math.round(totalScoreSum / scoreCount) : 0;
            }

            progressData = {
                overallProgress,
                completedCourses,
                totalLessons,
                completedLessons,
                averageScore,
                enrolledCourses: data.enrolled_courses || [],
                recentSubmissions: data.recent_submissions || []
            };

            console.log("✅ Calculated progress data:", progressData);
        } else {
            console.warn("⚠️ No dashboard data, using fallback");
            // Fallback to demo data
            progressData = {
                overallProgress: 25,
                completedCourses: 0,
                totalLessons: 8,
                completedLessons: 2,
                averageScore: 0,
                enrolledCourses: [],
                recentSubmissions: []
            };
        }

        // Update progress bar
        const progressFill = document.getElementById("progress-fill");
        if (progressFill) {
            progressFill.style.width = `${progressData.overallProgress}%`;
        }

        // Create stats cards with real data
        const statsHTML = `
            <div class="grid">
                ${UIComponents.createCard(
                    "📚 Enrolled Courses",
                    `<div class="metric-value">${progressData.completedCourses}</div>
                     <div class="metric-subtitle">Active enrollments</div>`,
                    []
                )}
                ${UIComponents.createCard(
                    "📖 Lessons Progress",
                    `<div class="metric-value">${progressData.completedLessons}/${progressData.totalLessons}</div>
                     <div class="metric-subtitle">Lessons completed</div>`,
                    []
                )}
                ${UIComponents.createCard(
                    "⭐ Average Score",
                    `<div class="metric-value">${progressData.averageScore}%</div>
                     <div class="metric-subtitle">Quiz performance</div>`,
                    []
                )}
                ${UIComponents.createCard(
                    "🎯 Overall Progress",
                    `<div class="metric-value">${progressData.overallProgress}%</div>
                     <div class="metric-subtitle">Course completion</div>`,
                    []
                )}
            </div>
        `;

        setInner("stats-grid", statsHTML);

        // Store progress data globally for other functions
        window.studentProgressData = progressData;

    } catch (error) {
        console.error("❌ Failed to load student progress:", error);

        // Show error with fallback data
        const fallbackHTML = `
            <div class="grid">
                ${UIComponents.createCard(
                    "📚 Enrolled Courses",
                    `<div class="metric-value">0</div>
                     <div class="metric-subtitle">No data available</div>`,
                    []
                )}
                ${UIComponents.createCard(
                    "📖 Lessons Progress",
                    `<div class="metric-value">0/0</div>
                     <div class="metric-subtitle">No data available</div>`,
                    []
                )}
                ${UIComponents.createCard(
                    "⭐ Average Score",
                    `<div class="metric-value">0%</div>
                     <div class="metric-subtitle">No data available</div>`,
                    []
                )}
                ${UIComponents.createCard(
                    "🎯 Overall Progress",
                    `<div class="metric-value">0%</div>
                     <div class="metric-subtitle">No data available</div>`,
                    []
                )}
            </div>
        `;

        setInner("stats-grid", fallbackHTML);
        UIComponents.showNotification("Failed to load progress data. Using offline mode.", "warning");
    }
}

async function loadEnrolledCourses() {
    try {
        console.log("🔄 Loading enrolled courses...");

        // Use enrolled courses from dashboard data
        const progressData = window.studentProgressData;

        if (progressData && progressData.enrolledCourses && progressData.enrolledCourses.length > 0) {
            console.log(`✅ Found ${progressData.enrolledCourses.length} enrolled courses`);

            let enrolledHTML = "";
            progressData.enrolledCourses.forEach(enrollment => {
                const course = enrollment.course;
                const progress = enrollment.progress;

                const progressPercentage = progress ? Math.round(progress.overall_progress || 0) : 0;
                const completedLessons = progress && progress.completed_lessons ? progress.completed_lessons.length : 0;
                const totalLessons = progress ? progress.total_lessons || 0 : 0;

                enrolledHTML += UIComponents.createCard(
                    `📚 ${course.title}`,
                    `
                        <p>${course.description}</p>
                        <div style="margin: 1rem 0;">
                            <span class="badge" style="background: var(--primary); color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
                                ${course.level} • ${course.duration} weeks
                            </span>
                            <span class="badge" style="background: var(--success); color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
                                ${completedLessons}/${totalLessons} lessons
                            </span>
                        </div>
                        ${UIComponents.createProgressBar(progressPercentage, "Course Progress")}
                        <div style="margin-top: 1rem;">
                            <small style="color: #6b7280;">
                                Last activity: ${progress && progress.last_accessed ? new Date(progress.last_accessed).toLocaleDateString() : 'Never'}
                            </small>
                        </div>
                    `,
                    [
                        { label: "Continue Learning", handler: `viewCourseDetails('${course._id}')` },
                        { label: "View Progress", handler: `viewCourseProgress('${course._id}')` }
                    ]
                );
            });

            setInner("enrolled-courses", enrolledHTML);
        } else {
            console.log("📚 No enrolled courses found");
            setInner("enrolled-courses", UIComponents.createCard(
                "🎯 Start Your Learning Journey",
                `
                    <p>You haven't enrolled in any courses yet. Browse available courses below and start your digital business mastery journey!</p>
                    <div style="margin: 1rem 0;">
                        <span class="badge" style="background: var(--info); color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
                            Ready to begin?
                        </span>
                    </div>
                `,
                [
                    { label: "Browse Courses", handler: "scrollToAvailableCourses()" }
                ]
            ));
        }

    } catch (error) {
        console.error("❌ Failed to load enrolled courses:", error);
        setInner("enrolled-courses", UIComponents.createCard(
            "Error",
            "Failed to load enrolled courses. Please try again later.",
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
        console.log("🔄 Loading current module from enrolled courses...");

        // Use enrolled courses from dashboard data
        const progressData = window.studentProgressData;

        if (progressData && progressData.enrolledCourses && progressData.enrolledCourses.length > 0) {
            const enrollment = progressData.enrolledCourses[0]; // Get first enrolled course
            const course = enrollment.course;
            const progress = enrollment.progress;

            console.log("📖 Current enrolled course:", course);
            console.log("📊 Course progress:", progress);

            // Get modules for this course
            try {
                const modulesResponse = await compatApiClient.request(`/learning/courses/${course._id}`);
                console.log("📋 Modules response:", modulesResponse);

                if (modulesResponse.status === 'success' && modulesResponse.data && modulesResponse.data.modules) {
                    const modules = modulesResponse.data.modules;

                    // Find current module based on progress or use first module
                    let currentModule = modules[0];
                    if (progress && progress.current_module_id) {
                        const foundModule = modules.find(m => m._id === progress.current_module_id);
                        if (foundModule) currentModule = foundModule;
                    }

                    if (currentModule) {
                        // Calculate module progress
                        let moduleProgress = 0;
                        if (progress && progress.completed_lessons) {
                            const moduleCompletedLessons = progress.completed_lessons.filter(lessonId =>
                                currentModule.lessons && currentModule.lessons.includes(lessonId)
                            ).length;
                            const totalModuleLessons = currentModule.lessons ? currentModule.lessons.length : 1;
                            moduleProgress = Math.round((moduleCompletedLessons / totalModuleLessons) * 100);
                        }

                        const moduleHTML = UIComponents.createCard(
                            `📖 ${currentModule.title}`,
                            `
                                <p>${currentModule.description}</p>
                                <div style="margin: 1rem 0;">
                                    <span class="badge" style="background: var(--primary); color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
                                        Week ${currentModule.week_start}-${currentModule.week_end}
                                    </span>
                                    <span class="badge" style="background: var(--success); color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
                                        ${currentModule.lessons ? currentModule.lessons.length : 0} lessons
                                    </span>
                                </div>
                                ${UIComponents.createProgressBar(moduleProgress, "Module Progress")}
                                <div style="margin-top: 1rem;">
                                    <small style="color: #6b7280;">
                                        Course: ${course.title} • ${progress ? Math.round(progress.overall_progress || 0) : 0}% complete
                                    </small>
                                </div>
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

        // If no enrolled courses, show available courses instead
        console.log("📚 No enrolled courses found, showing available courses...");
        await loadAvailableCoursesForCurrentModule();

    } catch (error) {
        console.error("Failed to load current module:", error);
        loadDemoModule();
    }
}

async function loadAvailableCoursesForCurrentModule() {
    try {
        const courses = await compatApiClient.request("/learning/courses?page=1&limit=1");

        if (courses.status === 'success' && courses.data && courses.data.courses && courses.data.courses.length > 0) {
            const course = courses.data.courses[0];

            const courseHTML = UIComponents.createCard(
                `🎯 Start Your Learning Journey`,
                `
                    <h4 style="margin: 0 0 0.5rem 0; color: #2563eb;">${course.title}</h4>
                    <p>${course.description}</p>
                    <div style="margin: 1rem 0;">
                        <span class="badge" style="background: var(--primary); color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
                            ${course.level} • ${course.duration} weeks
                        </span>
                    </div>
                    <div style="margin-top: 1rem;">
                        <small style="color: #6b7280;">
                            Ready to begin your digital business mastery journey?
                        </small>
                    </div>
                `,
                [
                    { label: "Enroll Now", handler: `startCourse('${course._id}')` },
                    { label: "View Details", handler: `viewCourseDetails('${course._id}')` }
                ]
            );

            setInner("current-module", courseHTML);
        } else {
            loadDemoModule();
        }
    } catch (error) {
        console.error("Failed to load available courses:", error);
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
    onClick("btn-assessment", async () => {
        UIComponents.showNotification("Starting quick assessment...", "info");
        await startQuickAssessment();
    });

    onClick("btn-progress", () => {
        UIComponents.showNotification("Opening detailed progress view...", "info");
        showProgressModal();
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
    // Simple carbon calculation based on page activity
    const now = Date.now();
    const startTime = window.dashboardStartTime || now;
    const runtime = (now - startTime) / 1000; // seconds
    const estimatedCarbon = runtime * 0.000001; // Very rough estimate

    const indicator = document.getElementById("carbon-indicator");
    if (indicator) {
        indicator.textContent = `🌱 ${estimatedCarbon.toFixed(6)}g CO2`;
    }
}

// Global functions for UI interactions
window.startRecommendation = async function(id) {
    console.log("🎯 startRecommendation called with id:", id);

    if (typeof UIComponents !== 'undefined' && UIComponents.showNotification) {
        UIComponents.showNotification(`Starting recommendation: ${id}`, "info");
    } else {
        alert(`Starting recommendation: ${id}`);
    }

    try {
        // Get recommendation details and start it
        const response = await compatApiClient.request(`/personalization/recommendations/${id}/start`);
        if (response.status === 'success') {
            UIComponents.showNotification("Recommendation started! 🎯", "success");
            // Refresh current module to show new content
            await loadCurrentModule();
        }
    } catch (error) {
        console.log("🔄 API failed, using demo mode for recommendation:", id);
        // Fallback to demo mode
        if (typeof UIComponents !== 'undefined' && UIComponents.showNotification) {
            UIComponents.showNotification("Recommendation started! 🎯 (Demo Mode)", "success");
        } else {
            alert("Recommendation started! 🎯 (Demo Mode)");
        }

        // Navigate to relevant content based on recommendation
        setTimeout(() => {
            if (id.includes('green') || id.includes('computing')) {
                window.location.href = 'course-details.html?id=demo-course-1';
            } else {
                window.location.href = 'module-learning.html?id=demo-module-1';
            }
        }, 1000);
    }
};

window.learnMore = async function(id) {
    console.log("📖 learnMore called with id:", id);

    if (typeof UIComponents !== 'undefined' && UIComponents.showNotification) {
        UIComponents.showNotification(`Loading details for: ${id}`, "info");
    } else {
        alert(`Loading details for: ${id}`);
    }

    try {
        // Get detailed information about the recommendation
        const response = await compatApiClient.request(`/personalization/recommendations/${id}`);
        if (response.status === 'success') {
            showRecommendationModal(response.data);
        }
    } catch (error) {
        console.log("🔄 API failed, showing demo recommendation details:", id);
        // Fallback to demo mode - show demo recommendation modal
        showDemoRecommendationModal(id);
    }
};

window.continueModule = async function(id) {
    UIComponents.showNotification(`Continuing module: ${id}`, "info");
    try {
        // Navigate to module learning page
        window.location.href = `module-learning.html?id=${id}`;
    } catch (error) {
        UIComponents.showNotification("Failed to continue module", "error");
    }
};

window.viewModuleDetails = async function(id) {
    UIComponents.showNotification(`Loading module details: ${id}`, "info");
    try {
        const response = await compatApiClient.request(`/learning/modules/${id}`);
        if (response.status === 'success') {
            showModuleModal(response.data);
        }
    } catch (error) {
        UIComponents.showNotification("Failed to load module details", "error");
    }
};

window.browseCourses = function() {
    UIComponents.showNotification("Opening course catalog...", "info");
    // Scroll to courses section
    document.getElementById('available-courses').scrollIntoView({ behavior: 'smooth' });
};

// Course interaction functions
window.startCourse = async function(courseId) {
    console.log("🚀 startCourse called with courseId:", courseId);
    console.log("🔍 UIComponents available:", typeof UIComponents);

    if (typeof UIComponents !== 'undefined' && UIComponents.showNotification) {
        UIComponents.showNotification(`Starting course: ${courseId}`, "info");
    } else {
        console.log("⚠️ UIComponents not available, using alert");
        alert(`Starting course: ${courseId}`);
    }

    console.log("🚀 Starting course:", courseId);

    try {
        // Check if user is authenticated
        const token = getCookie("access_token") || getCookie("login");
        if (!token) {
            UIComponents.showNotification("Please login to start a course", "error");
            showLoginModal();
            return;
        }

        // Check if user is already enrolled by checking dashboard
        const dashboardResponse = await compatApiClient.request("/learning/dashboard");
        if (dashboardResponse.status === 'success' && dashboardResponse.data.enrolled_courses) {
            const isEnrolled = dashboardResponse.data.enrolled_courses.some(
                enrollment => enrollment.course._id === courseId
            );

            if (isEnrolled) {
                UIComponents.showNotification("You are already enrolled in this course! 🎉", "success");
                // Navigate to course details or first module
                window.location.href = `course-details.html?id=${courseId}`;
                return;
            }
        }

        // Navigate directly to course details page
        UIComponents.showNotification("Opening course details...", "info");
        setTimeout(() => {
            window.location.href = `course-details.html?id=${courseId}`;
        }, 500);

    } catch (error) {
        console.error("Failed to start course:", error);
        if (error.message.includes('401')) {
            UIComponents.showNotification("Please login to start a course", "error");
            showLoginModal();
        } else {
            // Navigate to course details anyway
            UIComponents.showNotification("Opening course details...", "info");
            setTimeout(() => {
                window.location.href = `course-details.html?id=${courseId}`;
            }, 500);
        }
    }
};

window.viewCourseDetails = async function(courseId) {
    console.log("📖 viewCourseDetails called with courseId:", courseId);
    console.log("🔍 UIComponents available:", typeof UIComponents);

    if (typeof UIComponents !== 'undefined' && UIComponents.showNotification) {
        UIComponents.showNotification(`Loading course details: ${courseId}`, "info");
    } else {
        console.log("⚠️ UIComponents not available, using alert");
        alert(`Loading course details: ${courseId}`);
    }

    console.log("📖 Viewing course details:", courseId);

    // Navigate directly to course details page
    console.log("🔄 Navigating to:", `course-details.html?id=${courseId}`);
    window.location.href = `course-details.html?id=${courseId}`;
};

window.startDemoCourse = function() {
    UIComponents.showNotification("Opening demo course...", "info");
    setTimeout(() => {
        window.location.href = `course-details.html?id=demo-course-1`;
    }, 500);
};

window.viewDemoCourseDetails = function() {
    UIComponents.showNotification("Opening demo course details...", "info");
    setTimeout(() => {
        window.location.href = `course-details.html?id=demo-course-1`;
    }, 500);
};

// Removed duplicate function - already defined above

window.viewModuleLessons = function(moduleId) {
    UIComponents.showNotification(`Loading lessons for module: ${moduleId}`, "info");
    console.log("📝 Loading lessons for module:", moduleId);
    // Navigate to module learning page
    setTimeout(() => {
        window.location.href = `module-learning.html?id=${moduleId}`;
    }, 500);
};

window.continueDemoModule = function() {
    UIComponents.showNotification("Continuing demo module...", "info");
    setTimeout(() => {
        window.location.href = `module-learning.html?id=demo-module-1`;
    }, 500);
};

window.viewDemoLessons = function() {
    UIComponents.showNotification("Loading demo lessons...", "info");
    setTimeout(() => {
        window.location.href = `module-learning.html?id=demo-module-1`;
    }, 500);
};

window.viewCourseProgress = function(courseId) {
    UIComponents.showNotification(`Loading progress for course: ${courseId}`, "info");
    console.log("📊 Viewing course progress:", courseId);

    // For now, navigate to course details which shows progress
    setTimeout(() => {
        window.location.href = `course-details.html?id=${courseId}&tab=progress`;
    }, 500);
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
        const health = await compatApiClient.request("/aria/health");
        console.log('🤖 ARIA Health:', health);

        if (health.status === 'success' || health.status === 'healthy') {
            UIComponents.showNotification("ARIA AI Tutor online dan siap! ✅", "success");
        } else {
            UIComponents.showNotification("ARIA AI Tutor mengalami masalah", "warning");
        }
    } catch (error) {
        console.error('ARIA Health Check failed:', error);
        UIComponents.showNotification("ARIA AI Tutor menggunakan mode offline", "info");
    }
}

// Modal Functions
function showCourseModal(course) {
    const modalHTML = `
        <div id="course-modal" class="modal-overlay" onclick="closeModal('course-modal')">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>📚 ${course.title}</h2>
                    <button class="modal-close" onclick="closeModal('course-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${course.description}</p>
                    <div class="course-info">
                        <span class="badge">Level: ${course.level}</span>
                        <span class="badge">Duration: ${course.duration} weeks</span>
                        <span class="badge">Status: ${course.status}</span>
                    </div>
                    ${course.modules ? `
                        <h3>📋 Modules (${course.modules.length})</h3>
                        <ul>
                            ${course.modules.map(module => `<li>${module.title}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn" onclick="startCourse('${course._id}')">Start Course</button>
                    <button class="btn" onclick="closeModal('course-modal')">Close</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    addModalStyles();
}

function showModuleModal(module) {
    const modalHTML = `
        <div id="module-modal" class="modal-overlay" onclick="closeModal('module-modal')">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>📖 ${module.title}</h2>
                    <button class="modal-close" onclick="closeModal('module-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${module.description}</p>
                    <div class="module-info">
                        <span class="badge">Week ${module.week_start}-${module.week_end}</span>
                        <span class="badge">Lessons: ${module.lessons?.length || 0}</span>
                    </div>
                    ${module.lessons ? `
                        <h3>📝 Lessons</h3>
                        <ul>
                            ${module.lessons.map(lesson => `
                                <li>
                                    <strong>${lesson.title}</strong>
                                    <span class="lesson-type">(${lesson.type})</span>
                                </li>
                            `).join('')}
                        </ul>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn" onclick="continueModule('${module._id}')">Start Module</button>
                    <button class="btn" onclick="closeModal('module-modal')">Close</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    addModalStyles();
}

function showDemoRecommendationModal(id) {
    const demoRecommendations = {
        'rec1': {
            title: 'Green Computing Fundamentals',
            description: 'Based on your learning pattern, we recommend starting with energy efficiency concepts.',
            details: 'This recommendation focuses on sustainable computing practices and energy-efficient technologies.',
            benefits: ['Reduce energy consumption', 'Learn sustainable practices', 'Understand green technologies'],
            estimatedTime: '2-3 hours'
        },
        'rec2': {
            title: 'Digital Marketing Mastery',
            description: 'Enhance your digital marketing skills with advanced strategies.',
            details: 'Advanced digital marketing techniques specifically designed for Indonesian market.',
            benefits: ['Master social media marketing', 'Learn content strategy', 'Understand analytics'],
            estimatedTime: '4-5 hours'
        }
    };

    const rec = demoRecommendations[id] || demoRecommendations['rec1'];

    const modalHTML = `
        <div id="recommendation-modal" class="modal-overlay" onclick="closeModal('recommendation-modal')">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>🤖 ${rec.title}</h2>
                    <button class="modal-close" onclick="closeModal('recommendation-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Description:</strong> ${rec.description}</p>
                    <p><strong>Details:</strong> ${rec.details}</p>
                    <div style="margin: 1rem 0;">
                        <h4>📋 Benefits:</h4>
                        <ul>
                            ${rec.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                        </ul>
                    </div>
                    <p><strong>⏱️ Estimated Time:</strong> ${rec.estimatedTime}</p>
                    <div style="background: #f0f9ff; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
                        <p style="margin: 0; color: #2563eb;"><strong>💡 Demo Mode:</strong> This is a demonstration of AI-powered learning recommendations.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn" onclick="startRecommendation('${id}')">Start Learning</button>
                    <button class="btn" onclick="closeModal('recommendation-modal')" style="background: #6b7280;">Close</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    addModalStyles();
}

function showLoginModal() {
    const modalHTML = `
        <div id="login-modal" class="modal-overlay" onclick="closeModal('login-modal')">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>🔐 Login Required</h2>
                    <button class="modal-close" onclick="closeModal('login-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Please login to access course features.</p>
                    <div style="background: #f0f9ff; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                        <h4 style="color: #2563eb; margin-bottom: 0.5rem;">Demo Credentials:</h4>
                        <p style="margin: 0.25rem 0; font-size: 0.875rem;">
                            <strong>Email:</strong> student1@agenticlearn.id<br>
                            <strong>Password:</strong> password123
                        </p>
                    </div>
                    <form id="login-form" onsubmit="handleLogin(event)">
                        <div class="form-group">
                            <label for="email">Email:</label>
                            <input type="email" id="email" name="email" value="student1@agenticlearn.id" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password:</label>
                            <input type="password" id="password" name="password" value="password123" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn" onclick="document.getElementById('login-form').submit()">Login</button>
                    <button class="btn" onclick="showRegisterModal()">Register</button>
                    <button class="btn" onclick="closeModal('login-modal')">Cancel</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    addModalStyles();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

function addModalStyles() {
    if (document.getElementById('modal-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'modal-styles';
    styles.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .modal-content {
            background: white;
            border-radius: 8px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        .modal-header {
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
        }
        .modal-body {
            padding: 1rem;
        }
        .modal-footer {
            padding: 1rem;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 0.5rem;
            justify-content: flex-end;
        }
        .course-info, .module-info {
            margin: 1rem 0;
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        .form-group {
            margin-bottom: 1rem;
        }
        .form-group label {
            display: block;
            margin-bottom: 0.25rem;
            font-weight: 500;
        }
        .form-group input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 4px;
        }
        .lesson-type {
            color: #6b7280;
            font-size: 0.875rem;
        }
        .assessment-progress {
            margin-bottom: 2rem;
        }
        .question {
            margin-bottom: 2rem;
        }
        .question h3 {
            margin-bottom: 1rem;
            color: #1f2937;
        }
        .options {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        .option {
            display: flex;
            align-items: center;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .option:hover {
            background: #f9fafb;
            border-color: #2563eb;
        }
        .option input[type="radio"] {
            margin-right: 0.75rem;
        }
        .assessment-results {
            text-align: center;
        }
        .score-display {
            margin-bottom: 2rem;
        }
        .score-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: linear-gradient(135deg, #059669, #2563eb);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
        }
        .score-number {
            color: white;
            font-size: 2rem;
            font-weight: bold;
        }
        .results-details {
            text-align: left;
            margin-bottom: 1.5rem;
        }
        .results-details p {
            margin-bottom: 0.5rem;
        }
        .recommendations {
            text-align: left;
        }
        .recommendations ul {
            margin-top: 0.5rem;
            padding-left: 1.5rem;
        }
        .progress-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .stat-item {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem;
            background: #f9fafb;
            border-radius: 6px;
        }
        .stat-label {
            font-weight: 500;
        }
        .stat-value {
            font-weight: bold;
            color: #2563eb;
        }
        .activity-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        .activity-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            background: #f9fafb;
            border-radius: 6px;
        }
        .activity-icon {
            font-size: 1.25rem;
        }
        .activity-text {
            flex: 1;
        }
        .activity-time {
            color: #6b7280;
            font-size: 0.875rem;
        }
    `;
    document.head.appendChild(styles);
}

// Authentication Functions
window.handleLogin = async function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const credentials = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        UIComponents.showNotification("Logging in...", "info");
        const response = await fetch("http://localhost:8080/api/v1/auth/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            // Store token - handle both JWT and demo tokens
            const token = data.data.access_token || data.data.token;
            if (token) {
                document.cookie = `access_token=${token}; path=/; max-age=86400`;
                document.cookie = `login=${token}; path=/; max-age=86400`;

                UIComponents.showNotification("Login successful! 🎉", "success");
                closeModal('login-modal');

                // Refresh dashboard
                await initializeStudentDashboard();
            } else {
                UIComponents.showNotification("No token received", "error");
            }
        } else {
            UIComponents.showNotification(data.message || "Login failed", "error");
        }
    } catch (error) {
        console.error("Login error:", error);
        UIComponents.showNotification("Login failed", "error");
    }
};

// Assessment Functions
async function startQuickAssessment() {
    try {
        const token = getCookie("access_token") || getCookie("login");
        if (!token) {
            UIComponents.showNotification("Please login to take assessment", "error");
            showLoginModal();
            return;
        }

        // Try to get available courses for assessment
        let course;
        try {
            const coursesResponse = await compatApiClient.request("/learning/courses?page=1&limit=1");
            if (coursesResponse.data?.courses?.length) {
                course = coursesResponse.data.courses[0];
            }
        } catch (apiError) {
            console.log("🔄 API failed, using demo course for assessment");
        }

        // Fallback to demo course if API fails
        if (!course) {
            course = {
                title: "Digital Business Mastery",
                description: "Comprehensive digital business skills assessment"
            };
            UIComponents.showNotification("Starting assessment in demo mode...", "info");
        }

        // Show assessment modal
        showAssessmentModal(course);

    } catch (error) {
        console.error("Failed to start assessment:", error);
        UIComponents.showNotification("Failed to start assessment", "error");
    }
}

function showAssessmentModal(course) {
    const questions = [
        {
            question: "What is Green Computing?",
            options: [
                "Computing with green colored hardware",
                "Environmentally sustainable computing practices",
                "Computing in green buildings",
                "Using renewable energy only"
            ],
            correct: 1
        },
        {
            question: "Which practice reduces IT carbon footprint?",
            options: [
                "Running servers 24/7",
                "Using energy-efficient hardware",
                "Keeping all devices plugged in",
                "Maximizing screen brightness"
            ],
            correct: 1
        },
        {
            question: "What is the main goal of sustainable software development?",
            options: [
                "Writing more code",
                "Using more resources",
                "Minimizing environmental impact",
                "Increasing processing time"
            ],
            correct: 2
        }
    ];

    const modalHTML = `
        <div id="assessment-modal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🎯 Quick Assessment - ${course.title}</h2>
                    <button class="modal-close" onclick="closeModal('assessment-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="assessment-content">
                        <div class="assessment-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" id="assessment-progress" style="width: 0%"></div>
                            </div>
                            <span id="question-counter">Question 1 of ${questions.length}</span>
                        </div>
                        <div id="question-container">
                            <!-- Questions will be loaded here -->
                        </div>
                    </div>
                    <div id="assessment-results" style="display: none;">
                        <!-- Results will be shown here -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn" id="prev-question" onclick="previousQuestion()" disabled>Previous</button>
                    <button class="btn" id="next-question" onclick="nextQuestion()">Next</button>
                    <button class="btn" id="submit-assessment" onclick="submitAssessment()" style="display: none;">Submit</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    addModalStyles();

    // Initialize assessment
    window.assessmentData = {
        questions: questions,
        currentQuestion: 0,
        answers: [],
        startTime: new Date()
    };

    loadQuestion();
}

function loadQuestion() {
    const { questions, currentQuestion } = window.assessmentData;
    const question = questions[currentQuestion];

    const questionHTML = `
        <div class="question">
            <h3>${question.question}</h3>
            <div class="options">
                ${question.options.map((option, index) => `
                    <label class="option">
                        <input type="radio" name="answer" value="${index}" onchange="selectAnswer(${index})">
                        <span>${option}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('question-container').innerHTML = questionHTML;

    // Update progress
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById('assessment-progress').style.width = `${progress}%`;
    document.getElementById('question-counter').textContent = `Question ${currentQuestion + 1} of ${questions.length}`;

    // Update buttons
    document.getElementById('prev-question').disabled = currentQuestion === 0;
    document.getElementById('next-question').style.display = currentQuestion === questions.length - 1 ? 'none' : 'inline-block';
    document.getElementById('submit-assessment').style.display = currentQuestion === questions.length - 1 ? 'inline-block' : 'none';

    // Restore previous answer if exists
    if (window.assessmentData.answers[currentQuestion] !== undefined) {
        const radio = document.querySelector(`input[value="${window.assessmentData.answers[currentQuestion]}"]`);
        if (radio) radio.checked = true;
    }
}

window.selectAnswer = function(answerIndex) {
    window.assessmentData.answers[window.assessmentData.currentQuestion] = answerIndex;
};

window.nextQuestion = function() {
    if (window.assessmentData.currentQuestion < window.assessmentData.questions.length - 1) {
        window.assessmentData.currentQuestion++;
        loadQuestion();
    }
};

window.previousQuestion = function() {
    if (window.assessmentData.currentQuestion > 0) {
        window.assessmentData.currentQuestion--;
        loadQuestion();
    }
};

window.submitAssessment = async function() {
    const { questions, answers, startTime } = window.assessmentData;

    // Calculate score
    let correct = 0;
    answers.forEach((answer, index) => {
        if (answer === questions[index].correct) {
            correct++;
        }
    });

    const score = Math.round((correct / questions.length) * 100);
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000); // seconds

    try {
        // Submit to backend (if available)
        const token = getCookie("access_token") || getCookie("login");
        if (token) {
            await compatApiClient.request("/learning/assessment/quick", {
                method: 'POST',
                body: {
                    answers: answers,
                    score: score,
                    duration: duration,
                    start_time: startTime
                }
            });
        }
    } catch (error) {
        console.log("Failed to submit to backend, showing local results");
    }

    // Show results
    showAssessmentResults(score, correct, questions.length, duration);
};

function showAssessmentResults(score, correct, total, duration) {
    const resultsHTML = `
        <div class="assessment-results">
            <div class="score-display">
                <div class="score-circle">
                    <span class="score-number">${score}%</span>
                </div>
                <h3>Assessment Complete!</h3>
            </div>
            <div class="results-details">
                <p><strong>Correct Answers:</strong> ${correct} out of ${total}</p>
                <p><strong>Time Taken:</strong> ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}</p>
                <p><strong>Performance:</strong> ${score >= 80 ? '🎉 Excellent!' : score >= 60 ? '👍 Good!' : '📚 Keep Learning!'}</p>
            </div>
            <div class="recommendations">
                <h4>Next Steps:</h4>
                <ul>
                    ${score < 60 ? '<li>Review Green Computing fundamentals</li>' : ''}
                    ${score < 80 ? '<li>Practice with more assessments</li>' : ''}
                    <li>Continue with the course modules</li>
                    <li>Chat with ARIA AI for personalized help</li>
                </ul>
            </div>
        </div>
    `;

    document.getElementById('assessment-content').style.display = 'none';
    document.getElementById('assessment-results').innerHTML = resultsHTML;
    document.getElementById('assessment-results').style.display = 'block';

    // Update modal footer
    document.querySelector('#assessment-modal .modal-footer').innerHTML = `
        <button class="btn" onclick="closeModal('assessment-modal')">Close</button>
        <button class="btn" onclick="retakeAssessment()">Retake</button>
    `;

    // Update progress in dashboard
    setTimeout(() => {
        loadStudentProgress();
        UIComponents.showNotification(`Assessment completed! Score: ${score}%`, score >= 60 ? "success" : "info");
    }, 1000);
}

window.retakeAssessment = function() {
    closeModal('assessment-modal');
    setTimeout(() => startQuickAssessment(), 500);
};

// Progress Modal
function showProgressModal() {
    const modalHTML = `
        <div id="progress-modal" class="modal-overlay" onclick="closeModal('progress-modal')">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>📊 Learning Progress</h2>
                    <button class="modal-close" onclick="closeModal('progress-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="detailed-progress">
                        <div class="loading">Loading detailed progress...</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn" onclick="closeModal('progress-modal')">Close</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    addModalStyles();
    loadDetailedProgress();
}

async function loadDetailedProgress() {
    try {
        const token = getCookie("access_token") || getCookie("login");
        if (!token) {
            document.getElementById('detailed-progress').innerHTML = `
                <p>Please login to view detailed progress.</p>
                <button class="btn" onclick="showLoginModal()">Login</button>
            `;
            return;
        }

        // Get detailed progress from backend
        const response = await compatApiClient.request("/learning/dashboard");
        const progressHTML = `
            <div class="progress-overview">
                <h3>Overall Progress</h3>
                <div class="progress-stats">
                    <div class="stat-item">
                        <span class="stat-label">Courses Enrolled:</span>
                        <span class="stat-value">${response.data?.enrolled_courses || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Lessons Completed:</span>
                        <span class="stat-value">${response.data?.completed_lessons || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Overall Progress:</span>
                        <span class="stat-value">${response.data?.overall_progress || 0}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Certificates Earned:</span>
                        <span class="stat-value">${response.data?.certificates_earned || 0}</span>
                    </div>
                </div>
            </div>

            <div class="recent-activity">
                <h3>Recent Activity</h3>
                <div class="activity-list">
                    <div class="activity-item">
                        <span class="activity-icon">📚</span>
                        <span class="activity-text">Started Digital Business Mastery course</span>
                        <span class="activity-time">Today</span>
                    </div>
                    <div class="activity-item">
                        <span class="activity-icon">🎯</span>
                        <span class="activity-text">Completed Quick Assessment</span>
                        <span class="activity-time">Today</span>
                    </div>
                    <div class="activity-item">
                        <span class="activity-icon">🤖</span>
                        <span class="activity-text">Chatted with ARIA AI Tutor</span>
                        <span class="activity-time">Today</span>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('detailed-progress').innerHTML = progressHTML;

    } catch (error) {
        console.error("Failed to load detailed progress:", error);
        document.getElementById('detailed-progress').innerHTML = `
            <p>Failed to load progress data. Please try again later.</p>
        `;
    }
}

// Auto-test ARIA health on load
setTimeout(testARIAHealth, 3000);

document.addEventListener('DOMContentLoaded', initializeStudentDashboard);
