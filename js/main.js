/**
 * AgenticLearn Student Portal - Main Application Entry Point
 * Modular architecture with clean code principles
 * Green computing: Vanilla JS ES6+, no external dependencies
 *
 * DEVELOPMENT MODE: No authentication required
 * This allows frontend development without auth dependencies
 */

import { API_CONFIG } from './core/config.js';
import { APIClient } from './core/api-client.js';
import { UIComponents } from './components/ui-components.js';
import { DashboardModule } from './modules/dashboard.js';
import { CoursesModule } from './modules/courses.js';
import { AssignmentsModule } from './modules/assignments.js';
import { GradesModule } from './modules/grades.js';
import { ProfileModule } from './modules/profile.js';
import { AssessmentModule } from './modules/assessment.js';
import { GoalsModule } from './modules/goals.js';
import { AITutorModule } from './modules/ai-tutor.js';
import { StudyPlannerModule } from './modules/study-planner.js';

/**
 * Student Portal Application Class
 */
class StudentPortal {
    constructor() {
        this.state = {
            student: null,
            currentPage: 'dashboard',
            isBackendConnected: false,
            modules: {},
            developmentMode: false // Use real backend
        };

        this.api = new APIClient();
        this.initialized = false;
    }

    /**
     * Initialize the student portal application
     */
    async initialize() {
        try {
            console.log('🚀 Initializing AgenticLearn Student Portal...');
            console.log('🔧 Development Mode: Auth bypassed for frontend development');

            // 1. Test backend connection - NO FALLBACK per green computing requirements
            const connectionResult = await this.api.testConnection();
            
            if (!connectionResult.success) {
                throw new Error(`Backend connection failed: ${connectionResult.error || 'Unknown error'}`);
            }
            
            console.log('🔗 Connection result:', connectionResult);
            
            // 2. Store student profile
            this.state.student = connectionResult.profile;
            this.state.isBackendConnected = true;
            
            console.log('👤 Student profile loaded:', this.state.student?.name);
            console.log('📋 Full student data:', this.state.student);

            // 3. Initialize UI
            this.renderHeader();
            
            // 3.1. Robust sidebar update with retry mechanism
            let retryCount = 0;
            const maxRetries = 10;
            const updateSidebar = () => {
                const sidebarName = document.getElementById('sidebar-student-name');
                if (sidebarName && this.state.student?.name) {
                    sidebarName.textContent = this.state.student.name;
                    console.log('✅ Sidebar name updated:', this.state.student.name);
                    return true;
                } else {
                    retryCount++;
                    if (retryCount < maxRetries) {
                        console.log(`⏳ Retry ${retryCount}/${maxRetries} - Sidebar element not ready`);
                        setTimeout(updateSidebar, 50);
                    } else {
                        console.error('❌ Failed to update sidebar after', maxRetries, 'retries');
                    }
                    return false;
                }
            };
            
            // Start sidebar update process
            setTimeout(updateSidebar, 50);

            // 4. Initialize modules
            await this.initializeModules();

            // 5. Setup navigation
            this.setupNavigation();

            // 5.1. Validate navigation setup
            this.validateNavigation();

            // 6. Load initial page
            await this.loadPage('dashboard');

            // 7. Show success notification with debug
            console.log('📢 Showing welcome notification for:', this.state.student?.name);
            UIComponents.showNotification(
                `✅ Connected to AgenticAI Backend! Welcome ${this.state.student?.name || 'Student'}`,
                'success'
            );

            // 8. Mark portal as initialized and expose global objects
            window.studentPortal = {
                initialized: true,
                api: this.api,
                state: this.state,
                loadPage: this.loadPage.bind(this),
                refreshData: this.refreshData.bind(this),
                modules: this.state.modules
            };

            // 9. Expose modules globally for HTML onclick handlers
            window.assessmentModule = this.state.modules.assessment;
            window.goalsModule = this.state.modules.goals;

            // 9. Expose global functions for modules
            window.renderHeader = this.renderHeader.bind(this);

            console.log('✅ Student Portal initialized successfully');

        } catch (error) {
            console.error('❌ Student Portal initialization failed:', error);
            UIComponents.showNotification(
                `❌ Failed to connect to backend: ${error.message}`,
                'error'
            );
            throw error;
        }
    }

    /**
     * Initialize all modules
     */
    async initializeModules() {
        console.log('🔧 Initializing modules...');

        this.state.modules = {
            dashboard: new DashboardModule(this.api),
            courses: new CoursesModule(this.api),
            assignments: new AssignmentsModule(this.api),
            grades: new GradesModule(this.api),
            profile: new ProfileModule(this.api),
            assessment: new AssessmentModule(this.api),
            goals: new GoalsModule(this.api),
            'ai-tutor': new AITutorModule(this.api),
            'study-planner': new StudyPlannerModule(this.api)
        };

        // Initialize each module
        for (const [name, module] of Object.entries(this.state.modules)) {
            try {
                await module.initialize();
                console.log(`✅ ${name} module initialized`);
            } catch (error) {
                console.error(`❌ Failed to initialize ${name} module:`, error);
            }
        }
    }

    /**
     * Setup navigation event handlers
     */
    setupNavigation() {
        console.log('🧭 Setting up navigation...');

        // Sidebar navigation - Enhanced with better error handling
        const menuItems = document.querySelectorAll('.menu-item');
        console.log(`📋 Found ${menuItems.length} menu items`);

        menuItems.forEach((item, index) => {
            const page = item.dataset.page;
            console.log(`📄 Menu item ${index}: ${page}`);

            if (!page) {
                console.warn(`⚠️ Menu item ${index} missing data-page attribute`);
                return;
            }

            item.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`🔄 Navigation clicked: ${page}`);
                this.loadPage(page);
            });
        });

        // Mobile menu toggle (if exists)
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('collapsed');
            });
        }

        // Add keyboard navigation support
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1': e.preventDefault(); this.loadPage('dashboard'); break;
                    case '2': e.preventDefault(); this.loadPage('courses'); break;
                    case '3': e.preventDefault(); this.loadPage('assignments'); break;
                    case '4': e.preventDefault(); this.loadPage('assessment'); break;
                    case '5': e.preventDefault(); this.loadPage('goals'); break;
                }
            }
        });

        console.log('✅ Navigation setup complete');
    }

    /**
     * Load and display a specific page
     */
    async loadPage(pageName) {
        try {
            console.log(`📄 Loading page: ${pageName}`);

            // Update active navigation - Fix selector to match HTML structure
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
            });

            const activeNavItem = document.querySelector(`[data-page="${pageName}"]`);
            if (activeNavItem) {
                activeNavItem.classList.add('active');
            }

            // Update page title in header
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) {
                pageTitle.textContent = this.getPageTitle(pageName);
            }

            // Hide all pages
            document.querySelectorAll('.page-content').forEach(page => {
                page.classList.remove('active');
                page.style.display = 'none';
            });

            // Show target page
            const targetPage = document.getElementById(`page-${pageName}`);
            if (targetPage) {
                targetPage.classList.add('active');
                targetPage.style.display = 'block';
            } else {
                console.warn(`⚠️ Page element not found: page-${pageName}`);
                throw new Error(`Page not found: ${pageName}`);
            }

            // Load module content
            const module = this.state.modules[pageName];
            if (module && typeof module.render === 'function') {
                await module.render();
            } else {
                // For pages without modules, show placeholder content
                this.renderPlaceholderContent(pageName, targetPage);
            }

            // Update state
            this.state.currentPage = pageName;

            console.log(`✅ Page loaded: ${pageName}`);

        } catch (error) {
            console.error(`❌ Failed to load page ${pageName}:`, error);
            UIComponents.showNotification(`Failed to load ${pageName}: ${error.message}`, 'error');
        }
    }

    /**
     * Refresh data from backend
     */
    async refreshData() {
        try {
            console.log('🔄 Refreshing data...');

            // Refresh current module
            const currentModule = this.state.modules[this.state.currentPage];
            if (currentModule && typeof currentModule.refresh === 'function') {
                await currentModule.refresh();
            }

            UIComponents.showNotification('Data refreshed successfully', 'success');
        } catch (error) {
            console.error('❌ Failed to refresh data:', error);
            UIComponents.showNotification('Failed to refresh data: ' + error.message, 'error');
        }
    }

    /**
     * Start specific assessment from dashboard
     */
    async startAssessment(assessmentType) {
        try {
            console.log(`🎯 Starting assessment: ${assessmentType}`);

            // Navigate to assessment page
            await this.loadPage('assessment');

            // Wait for assessment module to load, then start specific assessment
            setTimeout(() => {
                if (this.state.modules.assessment && this.state.modules.assessment.startSpecificAssessment) {
                    this.state.modules.assessment.startSpecificAssessment(assessmentType);
                } else {
                    console.warn('Assessment module not ready or method not available');
                    UIComponents.showNotification('Assessment module is loading, please try again in a moment', 'info');
                }
            }, 500);

        } catch (error) {
            console.error(`❌ Failed to start assessment ${assessmentType}:`, error);
            UIComponents.showNotification(`Failed to start assessment: ${error.message}`, 'error');
        }
    }

    /**
     * Get page title for header
     */
    getPageTitle(pageName) {
        const titles = {
            'dashboard': 'Dashboard',
            'courses': 'My Courses',
            'assignments': 'Assignments',
            'assessment': 'Assessment',
            'grades': 'Grades & Progress',
            'goals': 'Learning Goals',
            'study-planner': 'Study Planner',
            'ai-tutor': 'AI Tutor - ARIA',
            'profile': 'My Profile'
        };
        return titles[pageName] || 'AgenticLearn Student';
    }

    /**
     * Render placeholder content for pages without modules
     */
    renderPlaceholderContent(pageName, container) {
        if (!container) return;

        const placeholderContent = {
            'ai-tutor': {
                title: '🤖 AI Tutor',
                content: 'Chat with ARIA, your AI learning assistant',
                icon: '🤖'
            },
            'study-planner': {
                title: '📅 Study Planner',
                content: 'Plan your study schedule and track your progress',
                icon: '📅'
            },
            'resources': {
                title: '📚 Learning Resources',
                content: 'Access study materials and additional resources',
                icon: '📚'
            },
            'messages': {
                title: '💌 Messages',
                content: 'View messages from instructors and classmates',
                icon: '💌'
            },
            'announcements': {
                title: '📢 Announcements',
                content: 'Stay updated with important announcements',
                icon: '📢'
            },
            'settings': {
                title: '⚙️ Settings',
                content: 'Customize your learning experience',
                icon: '⚙️'
            }
        };

        const pageInfo = placeholderContent[pageName] || {
            title: `📄 ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}`,
            content: 'This feature is coming soon!',
            icon: '📄'
        };

        container.innerHTML = `
            <div class="placeholder-content">
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon">${pageInfo.icon}</div>
                        <div>
                            <div class="card-title">${pageInfo.title}</div>
                            <div class="card-subtitle">${pageInfo.content}</div>
                        </div>
                    </div>
                    <div style="padding: 2rem; text-align: center; color: #6b7280;">
                        <p>🚧 This feature is under development</p>
                        <p>Check back soon for updates!</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render header with student information
     */
    renderHeader() {
        if (this.state.student) {
            console.log('🎨 Rendering header for:', this.state.student.name);

            // Update header profile section
            const headerElement = document.querySelector('header');
            if (headerElement) {
                const profileSection = headerElement.querySelector('.profile-section');
                if (profileSection) {
                    profileSection.innerHTML = `
                        <div class="profile-info">
                            <div class="profile-name">${this.state.student.name}</div>
                            <div class="profile-role">${this.state.student.role || 'Student'}</div>
                        </div>
                        <div class="profile-avatar">
                            ${this.state.student.name.charAt(0)}
                        </div>
                    `;
                    console.log('✅ Header profile section updated');
                }
            }

            // Update sidebar footer name
            const sidebarName = document.getElementById('sidebar-student-name');
            if (sidebarName) {
                sidebarName.textContent = this.state.student.name;
                console.log('✅ Sidebar name updated:', this.state.student.name);
            } else {
                console.warn('⚠️ Sidebar name element not found');
            }
        } else {
            console.warn('⚠️ No student data available for header rendering');
        }
    }

    /**
     * Validate navigation setup
     */
    validateNavigation() {
        console.log('🔍 Validating navigation setup...');

        const issues = [];

        // Check menu items
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach((item, index) => {
            const page = item.dataset.page;
            if (!page) {
                issues.push(`Menu item ${index} missing data-page attribute`);
                return;
            }

            // Check if corresponding page exists
            const pageElement = document.getElementById(`page-${page}`);
            if (!pageElement) {
                issues.push(`Page element missing for: page-${page}`);
            }
        });

        // Check page elements
        const pageElements = document.querySelectorAll('.page-content');
        console.log(`📄 Found ${pageElements.length} page elements`);

        if (issues.length > 0) {
            console.warn('⚠️ Navigation validation issues:', issues);
            return false;
        }

        console.log('✅ Navigation validation passed');
        return true;
    }

    /**
     * Debug navigation state
     */
    debugNavigation() {
        console.log('🐛 Navigation Debug Info:');
        console.log('Current page:', this.state.currentPage);
        console.log('Available modules:', Object.keys(this.state.modules));

        const activeMenus = document.querySelectorAll('.menu-item.active');
        console.log('Active menu items:', activeMenus.length);

        const visiblePages = document.querySelectorAll('.page-content.active');
        console.log('Visible pages:', visiblePages.length);

        return {
            currentPage: this.state.currentPage,
            modules: Object.keys(this.state.modules),
            activeMenus: activeMenus.length,
            visiblePages: visiblePages.length
        };
    }
}

// ===== APPLICATION STARTUP =====
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const portal = new StudentPortal();
        await portal.initialize();

        // Make portal globally accessible for debugging and external calls
        window.studentPortal = portal;

        // Make specific methods globally accessible for HTML onclick handlers
        window.startAssessment = (assessmentType) => portal.startAssessment(assessmentType);
        window.loadPage = (pageName) => portal.loadPage(pageName);
        window.refreshData = () => portal.refreshData();
        window.debugNavigation = () => portal.debugNavigation();

        console.log('🎉 Student Portal initialization complete with global methods exposed!');

    } catch (error) {
        console.error('💥 Critical error during startup:', error);

        // Show error state in UI
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 2rem;">
                <div>
                    <h1 style="color: #dc2626; margin-bottom: 1rem;">⚠️ Application Error</h1>
                    <p style="color: #6b7280; margin-bottom: 2rem;">Failed to initialize Student Portal</p>
                    <p style="color: #374151; font-family: monospace; background: #f3f4f6; padding: 1rem; border-radius: 0.5rem;">
                        ${error.message}
                    </p>
                    <button onclick="location.reload()" style="margin-top: 2rem; padding: 0.75rem 1.5rem; background: #2563eb; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
                        🔄 Retry
                    </button>
                </div>
            </div>
        `;
    }
});
