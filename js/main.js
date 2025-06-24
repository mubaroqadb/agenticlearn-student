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
            developmentMode: true // No auth required
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
                refreshData: this.refreshData.bind(this)
            };

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
            dashboard: new DashboardModule(),
            courses: new CoursesModule(),
            assignments: new AssignmentsModule(),
            grades: new GradesModule(),
            profile: new ProfileModule()
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
        // Sidebar navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    this.loadPage(page);
                }
            });
        });

        // Mobile menu toggle (if exists)
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('collapsed');
            });
        }
    }

    /**
     * Load and display a specific page
     */
    async loadPage(pageName) {
        try {
            console.log(`📄 Loading page: ${pageName}`);

            // Update active navigation
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            const activeNavItem = document.querySelector(`[data-page="${pageName}"]`);
            if (activeNavItem) {
                activeNavItem.classList.add('active');
            }

            // Hide all pages
            document.querySelectorAll('.page-content').forEach(page => {
                page.classList.remove('active');
            });

            // Show target page
            const targetPage = document.getElementById(`page-${pageName}`);
            if (targetPage) {
                targetPage.classList.add('active');
            }

            // Load module content
            const module = this.state.modules[pageName];
            if (module && typeof module.render === 'function') {
                await module.render();
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
}

// ===== APPLICATION STARTUP =====
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const portal = new StudentPortal();
        await portal.initialize();
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
