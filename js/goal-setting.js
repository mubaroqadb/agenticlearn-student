// Goal Setting System - AgenticLearn Student
import { apiClient } from "https://mubaroqadb.github.io/agenticlearn-shared/js/api-client.js";

class GoalSettingManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.goalData = {
            category: '',
            priority: '',
            title: '',
            description: '',
            targetDate: '',
            milestones: []
        };
        this.goals = [];
        
        console.log("🎯 Goal Setting Manager initialized");
        this.init();
    }

    async init() {
        // Load existing goals
        await this.loadExistingGoals();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('goal-target-date').min = today;
        
        // Add first milestone by default
        this.addMilestone();
    }

    setupEventListeners() {
        // Category selection
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.goalData.category = card.dataset.category;
                this.updateNavigationButtons();
            });
        });

        // Priority selection
        document.getElementById('goal-priority').addEventListener('change', (e) => {
            this.goalData.priority = e.target.value;
            this.updateNavigationButtons();
        });

        // Form inputs
        document.getElementById('goal-title').addEventListener('input', (e) => {
            this.goalData.title = e.target.value;
            this.updateNavigationButtons();
        });

        document.getElementById('goal-description').addEventListener('input', (e) => {
            this.goalData.description = e.target.value;
            this.updateNavigationButtons();
        });

        document.getElementById('goal-target-date').addEventListener('change', (e) => {
            this.goalData.targetDate = e.target.value;
            this.updateNavigationButtons();
        });
    }

    nextStep() {
        if (!this.validateCurrentStep()) {
            return;
        }

        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateStepDisplay();
            
            if (this.currentStep === 4) {
                this.generateReview();
            }
        } else {
            // Final step - save goal
            this.saveGoal();
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    updateStepDisplay() {
        // Hide all steps
        document.querySelectorAll('.wizard-step').forEach(step => {
            step.classList.add('hidden');
        });

        // Show current step
        document.getElementById(`wizard-step-${this.currentStep}`).classList.remove('hidden');

        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index + 1 < this.currentStep) {
                step.classList.add('completed');
            } else if (index + 1 === this.currentStep) {
                step.classList.add('active');
            }
        });

        // Update navigation buttons
        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const btnPrevious = document.getElementById('btn-previous');
        const btnNext = document.getElementById('btn-next');

        // Previous button
        btnPrevious.style.display = this.currentStep > 1 ? 'block' : 'none';

        // Next button
        const isValid = this.validateCurrentStep();
        btnNext.disabled = !isValid;

        if (this.currentStep === this.totalSteps) {
            btnNext.innerHTML = 'Simpan Tujuan ✅';
        } else {
            btnNext.innerHTML = 'Selanjutnya →';
        }
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return this.goalData.category && this.goalData.priority;
            case 2:
                return this.goalData.title.trim() && this.goalData.description.trim() && this.goalData.targetDate;
            case 3:
                this.collectMilestones();
                return this.goalData.milestones.length > 0;
            case 4:
                return true;
            default:
                return false;
        }
    }

    addMilestone() {
        const milestonesContainer = document.getElementById('milestones-list');
        const milestoneIndex = milestonesContainer.children.length;
        
        const milestoneHTML = `
            <div class="milestone" data-index="${milestoneIndex}">
                <input type="text" class="milestone-input" placeholder="Judul milestone..." 
                       id="milestone-title-${milestoneIndex}">
                <input type="date" class="milestone-input" id="milestone-date-${milestoneIndex}">
                <button type="button" class="btn btn-secondary" onclick="removeMilestone(${milestoneIndex})" 
                        style="padding: 0.5rem;">🗑️</button>
            </div>
        `;
        
        milestonesContainer.insertAdjacentHTML('beforeend', milestoneHTML);
        
        // Set minimum date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById(`milestone-date-${milestoneIndex}`).min = today;
    }

    removeMilestone(index) {
        const milestone = document.querySelector(`[data-index="${index}"]`);
        if (milestone) {
            milestone.remove();
        }
    }

    collectMilestones() {
        this.goalData.milestones = [];
        document.querySelectorAll('.milestone').forEach((milestone, index) => {
            const title = milestone.querySelector(`#milestone-title-${index}`)?.value.trim();
            const date = milestone.querySelector(`#milestone-date-${index}`)?.value;
            
            if (title && date) {
                this.goalData.milestones.push({
                    title: title,
                    description: `Milestone ${index + 1}: ${title}`,
                    due_date: new Date(date),
                    completed: false
                });
            }
        });
    }

    generateReview() {
        const reviewContainer = document.getElementById('goal-review');
        
        const categoryNames = {
            career: '💼 Karir',
            skill: '🚀 Skill',
            project: '📋 Project',
            academic: '🎓 Akademik'
        };

        const priorityNames = {
            high: '🔴 Tinggi',
            medium: '🟡 Sedang',
            low: '🟢 Rendah'
        };

        const targetDate = new Date(this.goalData.targetDate);
        const formattedDate = targetDate.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        reviewContainer.innerHTML = `
            <div style="background: var(--gray-50); padding: 1.5rem; border-radius: var(--radius-sm); margin-bottom: 1.5rem;">
                <h3 style="margin-bottom: 1rem; color: var(--gray-800);">📋 Ringkasan Tujuan</h3>
                
                <div style="display: grid; gap: 1rem;">
                    <div><strong>Kategori:</strong> ${categoryNames[this.goalData.category]}</div>
                    <div><strong>Prioritas:</strong> ${priorityNames[this.goalData.priority]}</div>
                    <div><strong>Judul:</strong> ${this.goalData.title}</div>
                    <div><strong>Target Tanggal:</strong> ${formattedDate}</div>
                </div>
                
                <div style="margin-top: 1rem;">
                    <strong>Deskripsi:</strong>
                    <p style="margin-top: 0.5rem; color: var(--gray-600); line-height: 1.6;">
                        ${this.goalData.description}
                    </p>
                </div>
            </div>

            <div style="background: var(--gray-50); padding: 1.5rem; border-radius: var(--radius-sm);">
                <h3 style="margin-bottom: 1rem; color: var(--gray-800);">🎯 Milestone (${this.goalData.milestones.length})</h3>
                
                ${this.goalData.milestones.map((milestone, index) => `
                    <div style="padding: 0.75rem; background: white; border-radius: 6px; margin-bottom: 0.5rem; border-left: 3px solid var(--primary);">
                        <div style="font-weight: 500;">${milestone.title}</div>
                        <div style="font-size: 0.875rem; color: var(--gray-600);">
                            Target: ${new Date(milestone.due_date).toLocaleDateString('id-ID')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async saveGoal() {
        try {
            console.log('🎯 Saving goal:', this.goalData);
            
            // Show loading
            const btnNext = document.getElementById('btn-next');
            const originalText = btnNext.innerHTML;
            btnNext.innerHTML = '⏳ Menyimpan...';
            btnNext.disabled = true;

            // Prepare goal data for API
            const goalPayload = {
                title: this.goalData.title,
                description: this.goalData.description,
                category: this.goalData.category,
                priority: this.goalData.priority,
                target_date: new Date(this.goalData.targetDate),
                milestones: this.goalData.milestones
            };

            // Save to backend (mock for now)
            const response = await this.mockSaveGoal(goalPayload);
            
            if (response.success) {
                // Add to local goals list
                this.goals.push({
                    ...goalPayload,
                    id: Date.now().toString(),
                    status: 'active',
                    progress: 0,
                    created_at: new Date()
                });

                // Show success message
                this.showSuccessMessage();
                
                // Reset wizard and show goals list
                setTimeout(() => {
                    this.resetWizard();
                    this.showGoalsList();
                }, 2000);
            } else {
                throw new Error('Failed to save goal');
            }

        } catch (error) {
            console.error('Failed to save goal:', error);
            alert('Gagal menyimpan tujuan. Silakan coba lagi.');
            
            // Reset button
            const btnNext = document.getElementById('btn-next');
            btnNext.innerHTML = 'Simpan Tujuan ✅';
            btnNext.disabled = false;
        }
    }

    async mockSaveGoal(goalData) {
        // Mock API call - replace with actual API when available
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, goal: goalData });
            }, 1000);
        });
    }

    showSuccessMessage() {
        const reviewContainer = document.getElementById('goal-review');
        reviewContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
                <h2 style="color: var(--success); margin-bottom: 1rem;">Tujuan Berhasil Disimpan!</h2>
                <p style="color: var(--gray-600); margin-bottom: 1.5rem;">
                    Tujuan pembelajaran Anda telah disimpan dan akan membantu personalisasi pengalaman belajar Anda.
                </p>
                <div style="background: var(--success); color: white; padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem;">
                    ✅ AI ARIA akan memberikan rekomendasi pembelajaran yang sesuai dengan tujuan Anda
                </div>
            </div>
        `;
    }

    resetWizard() {
        this.currentStep = 1;
        this.goalData = {
            category: '',
            priority: '',
            title: '',
            description: '',
            targetDate: '',
            milestones: []
        };

        // Reset form
        document.querySelectorAll('.category-card').forEach(card => card.classList.remove('selected'));
        document.getElementById('goal-priority').value = '';
        document.getElementById('goal-title').value = '';
        document.getElementById('goal-description').value = '';
        document.getElementById('goal-target-date').value = '';
        document.getElementById('milestones-list').innerHTML = '';
        
        this.addMilestone(); // Add default milestone
        this.updateStepDisplay();
    }

    async loadExistingGoals() {
        try {
            // Mock loading goals - replace with actual API
            this.goals = [
                {
                    id: '1',
                    title: 'Menguasai Digital Marketing',
                    description: 'Mempelajari strategi digital marketing untuk bisnis online',
                    category: 'skill',
                    priority: 'high',
                    status: 'active',
                    progress: 35,
                    target_date: new Date('2024-06-30'),
                    created_at: new Date('2024-01-15')
                }
            ];
        } catch (error) {
            console.error('Failed to load goals:', error);
            this.goals = [];
        }
    }

    showGoalsList() {
        document.getElementById('goal-wizard').classList.add('hidden');
        document.getElementById('goals-list').classList.remove('hidden');
        this.renderGoalsList();
    }

    showGoalWizard() {
        document.getElementById('goals-list').classList.add('hidden');
        document.getElementById('goal-wizard').classList.remove('hidden');
        this.resetWizard();
    }

    renderGoalsList() {
        const container = document.getElementById('goals-container');
        
        if (this.goals.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--gray-600);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎯</div>
                    <h3>Belum Ada Tujuan</h3>
                    <p>Mulai dengan menetapkan tujuan pembelajaran pertama Anda!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.goals.map(goal => `
            <div class="goal-item">
                <div class="goal-header">
                    <div class="goal-title">${goal.title}</div>
                    <div class="goal-category">${this.getCategoryName(goal.category)}</div>
                </div>
                <p style="color: var(--gray-600); margin-bottom: 1rem;">${goal.description}</p>
                <div class="goal-progress">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Progress</span>
                        <span>${goal.progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${goal.progress}%"></div>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button class="btn btn-primary" onclick="updateGoalProgress('${goal.id}')">
                        📊 Update Progress
                    </button>
                    <button class="btn btn-secondary" onclick="editGoal('${goal.id}')">
                        ✏️ Edit
                    </button>
                </div>
            </div>
        `).join('');
    }

    getCategoryName(category) {
        const names = {
            career: '💼 Karir',
            skill: '🚀 Skill', 
            project: '📋 Project',
            academic: '🎓 Akademik'
        };
        return names[category] || category;
    }
}

// Initialize Goal Setting Manager
const goalManager = new GoalSettingManager();

// Global functions for HTML onclick handlers
window.nextStep = () => goalManager.nextStep();
window.previousStep = () => goalManager.previousStep();
window.addMilestone = () => goalManager.addMilestone();
window.removeMilestone = (index) => goalManager.removeMilestone(index);
window.showGoalWizard = () => goalManager.showGoalWizard();
window.showGoalsList = () => goalManager.showGoalsList();

// Check URL parameters to show goals list if needed
if (window.location.search.includes('view=goals')) {
    setTimeout(() => goalManager.showGoalsList(), 100);
}

// Export for module usage
export { GoalSettingManager };
