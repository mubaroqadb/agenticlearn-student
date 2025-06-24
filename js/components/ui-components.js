/**
 * AgenticLearn Student Portal - UI Components
 * Reusable UI components for consistent design
 * Green computing: Minimal DOM manipulation, efficient rendering
 */

export class UIComponents {
    /**
     * Show notification to user
     */
    static showNotification(message, type = 'info', duration = 5000) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    max-width: 400px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    animation: slideIn 0.3s ease-out;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.5rem;
                    gap: 1rem;
                }
                
                .notification-message {
                    flex: 1;
                    font-size: 0.875rem;
                    font-weight: 500;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 1.25rem;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                }
                
                .notification-close:hover {
                    opacity: 1;
                }
                
                .notification-success {
                    background: #667b68;
                    color: white;
                }
                
                .notification-error {
                    background: #dc2626;
                    color: white;
                }
                
                .notification-warning {
                    background: #f59e0b;
                    color: white;
                }
                
                .notification-info {
                    background: #3b82f6;
                    color: white;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        // Add to DOM
        document.body.appendChild(notification);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, duration);
        }
    }

    /**
     * Create a stats card component
     */
    static createStatsCard(config, data) {
        const { title, icon, color = '#667b68' } = config;
        const { value, change, trend } = data;

        return `
            <div class="stats-card" style="border-left: 4px solid ${color};">
                <div class="stats-header">
                    <div class="stats-icon" style="background: ${color};">${icon}</div>
                    <div class="stats-info">
                        <div class="stats-title">${title}</div>
                        <div class="stats-value">${value}</div>
                    </div>
                </div>
                ${change !== undefined ? `
                    <div class="stats-change ${trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : 'neutral'}">
                        ${trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '➡️'} ${change}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Create a progress bar component
     */
    static createProgressBar(percentage, label = '', color = '#667b68') {
        return `
            <div class="progress-container">
                ${label ? `<div class="progress-label">${label}</div>` : ''}
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%; background: ${color};"></div>
                </div>
                <div class="progress-text">${percentage}%</div>
            </div>
        `;
    }

    /**
     * Create a badge component
     */
    static createBadge(text, type = 'default') {
        const colors = {
            default: '#6b7280',
            success: '#667b68',
            warning: '#f59e0b',
            error: '#dc2626',
            info: '#3b82f6'
        };

        return `
            <span class="badge" style="background: ${colors[type] || colors.default}; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">
                ${text}
            </span>
        `;
    }

    /**
     * Create a metric card component
     */
    static createMetricCard(title, value, change, icon, borderColor = '#667b68') {
        return `
            <div class="metric-card" style="border-left: 4px solid ${borderColor};">
                <div class="metric-header">
                    <span class="metric-icon">${icon}</span>
                    <span class="metric-title">${title}</span>
                </div>
                <div class="metric-value">${value}</div>
                ${change ? `<div class="metric-change">${change}</div>` : ''}
            </div>
        `;
    }

    /**
     * Create a loading spinner
     */
    static createLoadingSpinner(size = 'medium') {
        const sizes = {
            small: '20px',
            medium: '40px',
            large: '60px'
        };

        return `
            <div class="loading-spinner" style="width: ${sizes[size]}; height: ${sizes[size]};">
                <div class="spinner-border" style="
                    width: 100%;
                    height: 100%;
                    border: 3px solid #f3f4f6;
                    border-top: 3px solid #667b68;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                "></div>
            </div>
        `;
    }

    /**
     * Create a modal dialog
     */
    static createModal(title, content, actions = []) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    ${actions.map(action => `
                        <button class="btn ${action.class || 'btn-secondary'}" onclick="${action.onclick || ''}">
                            ${action.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Add modal styles if not present
        if (!document.querySelector('#modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'modal-styles';
            styles.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }
                
                .modal-dialog {
                    background: white;
                    border-radius: 8px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                }
                
                .modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1.5rem;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .modal-title {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 600;
                }
                
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    opacity: 0.7;
                }
                
                .modal-close:hover {
                    opacity: 1;
                }
                
                .modal-body {
                    padding: 1.5rem;
                }
                
                .modal-footer {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: flex-end;
                    padding: 1.5rem;
                    border-top: 1px solid #e5e7eb;
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(modal);
        return modal;
    }

    /**
     * Show loading state
     */
    static showLoading(container, message = 'Loading...') {
        if (typeof container === 'string') {
            container = document.getElementById(container);
        }

        if (container) {
            container.innerHTML = `
                <div class="loading-state" style="text-align: center; padding: 3rem; color: #6b7280;">
                    ${this.createLoadingSpinner('large')}
                    <h3 style="margin: 1rem 0 0.5rem 0;">${message}</h3>
                </div>
            `;
        }
    }

    /**
     * Hide loading state
     */
    static hideLoading(container) {
        if (typeof container === 'string') {
            container = document.getElementById(container);
        }

        if (container) {
            const loadingState = container.querySelector('.loading-state');
            if (loadingState) {
                loadingState.remove();
            }
        }
    }
}
