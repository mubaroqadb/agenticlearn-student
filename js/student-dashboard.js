// AgenticLearn Student Dashboard dengan Shared Components + ARIA AI
import { apiClient } from "https://YOUR_USERNAME.github.io/agenticlearn-shared/js/api-client.js";
import { UIComponents } from "https://YOUR_USERNAME.github.io/agenticlearn-shared/js/ui-components.js";
import { ARIAChat } from "https://YOUR_USERNAME.github.io/agenticlearn-shared/js/aria-chat.js";
import { getCookie } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/cookie.js";
import { setInner, onClick } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/element.js";
import { redirect } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/url.js";

// Global ARIA instance
let ariaChat = null;

async function initializeStudentDashboard() {
    const token = getCookie("login");
    if (!token) {
        redirect("https://YOUR_USERNAME.github.io/agenticlearn-auth");
        return;
    }

    try {
        // Load user data using shared API client
        const response = await apiClient.request("/auth/me");
        setInner("user-name", response.user.name);
        
        // Load dashboard data
        await loadStudentProgress();
        await loadAIRecommendations();
        await loadCurrentModule();
        
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
        UIComponents.showNotification(`Welcome back, ${response.user.name}! 🌱`, "success");
        
        console.log("🌱 Student Dashboard loaded with shared components");
    } catch (error) {
        console.error("Failed to load student dashboard:", error);
        setInner("user-name", "Error loading dashboard");
        UIComponents.showNotification("Failed to load dashboard", "error");
    }
}

async function loadStudentProgress() {
    try {
        const progress = await apiClient.request("/student/progress");
        
        // Update progress bar
        const progressFill = document.getElementById("progress-fill");
        if (progressFill) {
            progressFill.style.width = `${progress.overallProgress || 0}%`;
        }
        
        // Create stats cards using shared UI components
        const statsHTML = `
            <div class="grid">
                ${UIComponents.createCard(
                    "📚 Courses Completed",
                    `<div class="metric-value">${progress.completedCourses || 0}</div>`,
                    []
                )}
                ${UIComponents.createCard(
                    "⭐ Average Score",
                    `<div class="metric-value">${progress.averageScore || 0}%</div>`,
                    []
                )}
                ${UIComponents.createCard(
                    "🔥 Streak Days",
                    `<div class="metric-value">${progress.streakDays || 0}</div>`,
                    []
                )}
                ${UIComponents.createCard(
                    "🎯 Goals Achieved",
                    `<div class="metric-value">${progress.goalsAchieved || 0}</div>`,
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
        const recommendations = await apiClient.request("/student/ai-recommendations");
        
        let recommendationsHTML = "";
        if (recommendations && recommendations.length > 0) {
            recommendations.slice(0, 3).forEach(rec => {
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

async function loadCurrentModule() {
    try {
        const currentModule = await apiClient.request("/student/current-module");
        
        if (currentModule) {
            const moduleHTML = UIComponents.createCard(
                `📖 ${currentModule.title}`,
                `
                    <p>${currentModule.description}</p>
                    ${UIComponents.createProgressBar(currentModule.progress || 0, "Module Progress")}
                `,
                [
                    { label: "Continue Learning", handler: `continueModule('${currentModule.id}')` },
                    { label: "View Details", handler: `viewModuleDetails('${currentModule.id}')` }
                ]
            );
            
            setInner("current-module", moduleHTML);
        } else {
            setInner("current-module", UIComponents.createCard(
                "📚 Start Learning",
                "No active module. Browse available courses to start your learning journey!",
                [
                    { label: "Browse Courses", handler: "browseCourses()" }
                ]
            ));
        }
        
    } catch (error) {
        console.error("Failed to load current module:", error);
        setInner("current-module", UIComponents.createCard(
            "Error",
            "Failed to load current module",
            []
        ));
    }
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
