/**
 * AgenticLearn Student Portal - Profile Module
 * Student profile management with real backend integration
 * Green computing: No fallback data, direct backend dependency
 */

import { UIComponents } from '../components/ui-components.js';

export class ProfileModule {
    constructor() {
        this.profile = null;
        this.isEditing = false;
    }

    /**
     * Initialize profile module
     */
    async initialize() {
        console.log('👤 Initializing Profile Module...');
        
        try {
            // Load profile data from backend
            await this.loadProfile();
        } catch (error) {
            console.error('❌ Profile Module initialization failed:', error);
            UIComponents.showNotification('Profile initialization failed: ' + error.message, 'error');
        }
    }

    /**
     * Load profile data from cache first, then backend
     */
    loadFromCache() {
        const savedProfile = localStorage.getItem('agenticlearn_student_profile');
        if (savedProfile) {
            try {
                this.profile = JSON.parse(savedProfile);
            } catch (error) {
                // Silent fail for cache parsing errors
            }
        }
    }

    /**
     * Load profile data from backend
     */
    async loadProfile() {
        try {
            // Get API client from global scope
            const apiClient = window.studentPortal?.api;
            if (!apiClient) {
                throw new Error('API client not available');
            }

            const response = await apiClient.getProfile();
            // Backend returns profile in different structure
            this.profile = response.profile || response.data || response;
            
        } catch (error) {
            // No fallback data per green computing principles
            throw new Error('Failed to load profile from backend: ' + error.message);
        }
    }

    /**
     * Render profile interface
     */
    async render() {
        // Get profile page (should already exist and be active from showPage)
        const profilePage = document.getElementById('page-profile');
        if (!profilePage) {
            return;
        }

        const container = profilePage;

        // Show loading state
        UIComponents.showLoading(container, '👤 Loading Student Profile...');

        try {
            // Ensure profile is loaded
            if (!this.profile) {
                await this.loadProfile();
            }

            // Render profile interface
            this.renderProfileInterface(container);

        } catch (error) {
            console.error('❌ Failed to render profile:', error);
            container.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 3rem; color: #dc2626;">
                    <h3>❌ Failed to Load Profile</h3>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="window.studentPortal.modules.profile.render()">
                        🔄 Retry
                    </button>
                </div>
            `;
        }
    }

    /**
     * Render profile interface
     */
    renderProfileInterface(container) {
        const profileHTML = `
            <div class="profile-container">
                <!-- Profile Header -->
                <div class="profile-header">
                    <div class="profile-avatar-large">
                        ${this.profile.name ? this.profile.name.charAt(0).toUpperCase() : '👤'}
                    </div>
                    <div class="profile-info">
                        <h1>${this.profile.name || 'Student'}</h1>
                        <p class="profile-role">${this.profile.role || 'Student'}</p>
                        <p class="profile-id">Student ID: ${this.profile.student_id || 'N/A'}</p>
                    </div>
                    <div class="profile-actions">
                        <button class="btn btn-primary" onclick="window.studentPortal.modules.profile.toggleEdit()">
                            ${this.isEditing ? '❌ Cancel' : '✏️ Edit Profile'}
                        </button>
                    </div>
                </div>

                <!-- Profile Content -->
                <div class="profile-content">
                    ${this.isEditing ? this.renderEditForm() : this.renderViewMode()}
                </div>

                <!-- Academic Information -->
                <div class="academic-info">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-icon">🎓</div>
                            <div>
                                <div class="card-title">Academic Information</div>
                                <div class="card-subtitle">Your academic details and progress</div>
                            </div>
                        </div>
                        <div class="academic-details">
                            <div class="detail-item">
                                <span class="detail-label">Program:</span>
                                <span class="detail-value">${this.profile.program || 'Not specified'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Year:</span>
                                <span class="detail-value">${this.profile.year || 'Not specified'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">GPA:</span>
                                <span class="detail-value">${this.profile.gpa || 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Credits Completed:</span>
                                <span class="detail-value">${this.profile.credits_completed || '0'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Learning Preferences -->
                <div class="preferences-section">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-icon">⚙️</div>
                            <div>
                                <div class="card-title">Learning Preferences</div>
                                <div class="card-subtitle">Customize your learning experience</div>
                            </div>
                        </div>
                        <div class="preferences-content">
                            <div class="preference-item">
                                <span class="preference-label">Preferred Learning Style:</span>
                                <span class="preference-value">${this.profile.learning_style || 'Visual'}</span>
                            </div>
                            <div class="preference-item">
                                <span class="preference-label">Study Time Preference:</span>
                                <span class="preference-value">${this.profile.study_time || 'Morning'}</span>
                            </div>
                            <div class="preference-item">
                                <span class="preference-label">Notification Preferences:</span>
                                <span class="preference-value">${this.profile.notifications ? 'Enabled' : 'Disabled'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = profileHTML;
        this.addProfileStyles();
    }

    /**
     * Render view mode
     */
    renderViewMode() {
        return `
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">📋</div>
                    <div>
                        <div class="card-title">Personal Information</div>
                        <div class="card-subtitle">Your basic profile information</div>
                    </div>
                </div>
                <div class="profile-details">
                    <div class="detail-row">
                        <div class="detail-item">
                            <span class="detail-label">Full Name:</span>
                            <span class="detail-value">${this.profile.name || 'Not provided'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Email:</span>
                            <span class="detail-value">${this.profile.email || 'Not provided'}</span>
                        </div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-item">
                            <span class="detail-label">Phone:</span>
                            <span class="detail-value">${this.profile.phone || 'Not provided'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Date of Birth:</span>
                            <span class="detail-value">${this.profile.date_of_birth || 'Not provided'}</span>
                        </div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-item full-width">
                            <span class="detail-label">Bio:</span>
                            <span class="detail-value">${this.profile.bio || 'No bio provided'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render edit form
     */
    renderEditForm() {
        return `
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">✏️</div>
                    <div>
                        <div class="card-title">Edit Profile</div>
                        <div class="card-subtitle">Update your personal information</div>
                    </div>
                </div>
                <form id="profile-form" class="profile-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="profile-name">Full Name</label>
                            <input type="text" id="profile-name" value="${this.profile.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="profile-email">Email</label>
                            <input type="email" id="profile-email" value="${this.profile.email || ''}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="profile-phone">Phone</label>
                            <input type="tel" id="profile-phone" value="${this.profile.phone || ''}">
                        </div>
                        <div class="form-group">
                            <label for="profile-dob">Date of Birth</label>
                            <input type="date" id="profile-dob" value="${this.profile.date_of_birth || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="profile-bio">Bio</label>
                        <textarea id="profile-bio" rows="4" placeholder="Tell us about yourself...">${this.profile.bio || ''}</textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">💾 Save Changes</button>
                        <button type="button" class="btn btn-secondary" onclick="window.studentPortal.modules.profile.toggleEdit()">
                            ❌ Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    /**
     * Toggle edit mode
     */
    toggleEdit() {
        this.isEditing = !this.isEditing;
        this.renderProfileInterface(document.getElementById('page-profile'));
        
        if (this.isEditing) {
            // Bind form submit event
            const form = document.getElementById('profile-form');
            if (form) {
                form.addEventListener('submit', this.saveProfile.bind(this));
            }
        }
    }

    /**
     * Save profile changes
     */
    async saveProfile(event) {
        event.preventDefault();

        const formData = {
            name: document.getElementById('profile-name').value,
            email: document.getElementById('profile-email').value,
            phone: document.getElementById('profile-phone').value,
            date_of_birth: document.getElementById('profile-dob').value,
            bio: document.getElementById('profile-bio').value
        };

        try {
            // Update local profile
            this.profile = { ...this.profile, ...formData };

            // Save to backend
            const apiClient = window.studentPortal?.api;
            if (apiClient) {
                await apiClient.updateProfile(formData);
            }

            // Refresh profile data from backend to ensure consistency
            const freshProfile = await apiClient.getProfile();
            const updatedProfile = freshProfile.profile || freshProfile.data || freshProfile;
            
            // Update local profile with fresh data
            this.profile = updatedProfile;
            
            // Update global state to refresh UI components
            if (window.studentPortal && window.studentPortal.state) {
                window.studentPortal.state.student = updatedProfile;
                
                // Re-render header with updated data
                if (window.renderHeader) {
                    window.renderHeader();
                }
                
                // Show updated welcome message
                UIComponents.showNotification(
                    `✅ Profile updated! Welcome ${updatedProfile.name}`,
                    'success'
                );
            } else {
                UIComponents.showNotification('Profile updated successfully!', 'success');
            }

            this.isEditing = false;
            this.renderProfileInterface(document.getElementById('page-profile'));

        } catch (error) {
            console.error('❌ Failed to save profile:', error);
            UIComponents.showNotification('Failed to save profile: ' + error.message, 'error');
        }
    }

    /**
     * Add profile-specific styles
     */
    addProfileStyles() {
        if (document.querySelector('#profile-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'profile-styles';
        styles.textContent = `
            .profile-container {
                max-width: 800px;
                margin: 0 auto;
            }
            
            .profile-header {
                display: flex;
                align-items: center;
                gap: 2rem;
                margin-bottom: 2rem;
                padding: 2rem;
                background: white;
                border-radius: 12px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .profile-avatar-large {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: #667b68;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 2rem;
                font-weight: 700;
                flex-shrink: 0;
            }
            
            .profile-info {
                flex: 1;
            }
            
            .profile-info h1 {
                margin: 0 0 0.5rem 0;
                font-size: 1.875rem;
                font-weight: 700;
                color: #1f2937;
            }
            
            .profile-role {
                color: #667b68;
                font-weight: 600;
                margin: 0 0 0.25rem 0;
            }
            
            .profile-id {
                color: #6b7280;
                font-size: 0.875rem;
                margin: 0;
            }
            
            .profile-details, .academic-details, .preferences-content {
                padding: 1.5rem;
            }
            
            .detail-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
                margin-bottom: 1.5rem;
            }
            
            .detail-row:last-child {
                margin-bottom: 0;
            }
            
            .detail-item {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .detail-item.full-width {
                grid-column: 1 / -1;
            }
            
            .detail-label, .preference-label {
                font-weight: 600;
                color: #374151;
                font-size: 0.875rem;
            }
            
            .detail-value, .preference-value {
                color: #6b7280;
                font-size: 1rem;
            }
            
            .academic-info, .preferences-section {
                margin-bottom: 2rem;
            }
            
            .preference-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 0;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .preference-item:last-child {
                border-bottom: none;
            }
            
            .profile-form {
                padding: 1.5rem;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1.5rem;
                margin-bottom: 1.5rem;
            }
            
            .form-group {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .form-group label {
                font-weight: 600;
                color: #374151;
                font-size: 0.875rem;
            }
            
            .form-group input, .form-group textarea {
                padding: 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 1rem;
                transition: border-color 0.2s;
            }
            
            .form-group input:focus, .form-group textarea:focus {
                outline: none;
                border-color: #667b68;
                box-shadow: 0 0 0 3px rgba(102, 123, 104, 0.1);
            }
            
            .form-actions {
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
                margin-top: 2rem;
                padding-top: 1.5rem;
                border-top: 1px solid #f3f4f6;
            }
            
            .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .btn-primary {
                background: #667b68;
                color: white;
            }
            
            .btn-primary:hover {
                background: #4a5a4c;
            }
            
            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
            }
            
            .btn-secondary:hover {
                background: #e5e7eb;
            }
            
            @media (max-width: 768px) {
                .profile-header {
                    flex-direction: column;
                    text-align: center;
                }
                
                .detail-row, .form-row {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }
                
                .form-actions {
                    flex-direction: column;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * Refresh profile data
     */
    async refresh() {
        console.log('🔄 Refreshing profile data...');
        await this.loadProfile();
        await this.render();
    }
}
