// Assessment System - AgenticLearn Student
import { apiClient } from "https://mubaroqadb.github.io/agenticlearn-shared/js/api-client.js";

class AssessmentManager {
    constructor() {
        this.currentAssessmentType = null;
        this.questions = [];
        this.responses = [];
        this.currentQuestionIndex = 0;
        this.carbonFootprint = 0;
        this.startTime = Date.now();
        
        console.log("🎯 Assessment Manager initialized");
        this.updateCarbonIndicator();
    }

    async startAssessment(type) {
        console.log(`🚀 Starting ${type} assessment`);
        
        try {
            this.currentAssessmentType = type;
            this.currentQuestionIndex = 0;
            this.responses = [];
            
            // Show loading
            this.showLoading("Memuat pertanyaan assessment...");
            
            // Load questions based on type
            let questionsData;
            switch(type) {
                case 'digital-skills':
                    questionsData = await apiClient.getDigitalSkillsAssessment();
                    break;
                case 'learning-style':
                    questionsData = await apiClient.getLearningStyleAssessment();
                    break;
                case 'tech-comfort':
                    questionsData = await apiClient.getTechComfortSurvey();
                    break;
                default:
                    throw new Error('Unknown assessment type');
            }
            
            this.questions = questionsData.questions || [];
            
            if (this.questions.length === 0) {
                throw new Error('No questions received from server');
            }
            
            // Hide selection, show assessment
            document.getElementById('assessment-selection').classList.add('hidden');
            document.getElementById('assessment-container').classList.remove('hidden');
            document.getElementById('assessment-container').classList.add('fade-in');
            
            // Update progress info
            document.getElementById('total-questions').textContent = this.questions.length;
            
            // Show first question
            this.displayCurrentQuestion();
            this.updateProgress();
            
            console.log(`✅ Assessment loaded: ${this.questions.length} questions`);
            
        } catch (error) {
            console.error('Failed to start assessment:', error);
            this.showError('Gagal memuat assessment. Silakan coba lagi.');
        }
    }

    displayCurrentQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        if (!question) return;
        
        const questionDisplay = document.getElementById('question-display');
        
        // Create question HTML
        const questionHTML = `
            <div class="question-container fade-in">
                <div class="question-number">
                    Pertanyaan ${this.currentQuestionIndex + 1}
                </div>
                <div class="question-text">
                    ${question.question}
                </div>
                <div class="options-container">
                    ${this.createOptionsHTML(question)}
                </div>
            </div>
        `;
        
        questionDisplay.innerHTML = questionHTML;
        
        // Add event listeners to options
        this.attachOptionListeners();
        
        // Update navigation buttons
        this.updateNavigationButtons();
    }

    createOptionsHTML(question) {
        if (question.type === 'scale') {
            return question.options.map((option, index) => `
                <div class="option" onclick="selectOption('${question.id}', '${option}')">
                    <input type="radio" name="question_${question.id}" value="${option}" id="option_${question.id}_${index}">
                    <label class="option-text" for="option_${question.id}_${index}">
                        ${option} ${this.getScaleLabel(option)}
                    </label>
                </div>
            `).join('');
        } else {
            return question.options.map((option, index) => `
                <div class="option" onclick="selectOption('${question.id}', '${option}')">
                    <input type="radio" name="question_${question.id}" value="${option}" id="option_${question.id}_${index}">
                    <label class="option-text" for="option_${question.id}_${index}">
                        ${option}
                    </label>
                </div>
            `).join('');
        }
    }

    getScaleLabel(value) {
        const labels = {
            '1': '(Sangat Rendah)',
            '2': '(Rendah)', 
            '3': '(Sedang)',
            '4': '(Tinggi)',
            '5': '(Sangat Tinggi)'
        };
        return labels[value] || '';
    }

    attachOptionListeners() {
        const options = document.querySelectorAll('.option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                // Remove selected class from all options
                options.forEach(opt => opt.classList.remove('selected'));
                // Add selected class to clicked option
                option.classList.add('selected');
                
                // Check the radio button
                const radio = option.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                }
                
                // Enable next button
                document.getElementById('btn-next').disabled = false;
            });
        });
    }

    selectOption(questionId, answer) {
        // Store response
        const existingResponseIndex = this.responses.findIndex(r => r.question_id === questionId);
        const response = { question_id: questionId, answer: answer };
        
        if (existingResponseIndex >= 0) {
            this.responses[existingResponseIndex] = response;
        } else {
            this.responses.push(response);
        }
        
        console.log(`📝 Response recorded: ${questionId} = ${answer}`);
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayCurrentQuestion();
            this.updateProgress();
        } else {
            // Assessment complete
            this.submitAssessment();
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayCurrentQuestion();
            this.updateProgress();
        }
    }

    updateProgress() {
        const current = this.currentQuestionIndex + 1;
        const total = this.questions.length;
        const percentage = Math.round((current / total) * 100);
        
        document.getElementById('current-question').textContent = current;
        document.getElementById('progress-percentage').textContent = `${percentage}%`;
        document.getElementById('progress-fill').style.width = `${percentage}%`;
    }

    updateNavigationButtons() {
        const btnPrevious = document.getElementById('btn-previous');
        const btnNext = document.getElementById('btn-next');
        
        // Previous button
        btnPrevious.disabled = this.currentQuestionIndex === 0;
        
        // Next button - check if current question is answered
        const currentQuestion = this.questions[this.currentQuestionIndex];
        const hasResponse = this.responses.some(r => r.question_id === currentQuestion.id);
        btnNext.disabled = !hasResponse;
        
        // Update next button text
        if (this.currentQuestionIndex === this.questions.length - 1) {
            btnNext.innerHTML = 'Selesai ✅';
        } else {
            btnNext.innerHTML = 'Selanjutnya →';
        }
    }

    async submitAssessment() {
        console.log(`📤 Submitting ${this.currentAssessmentType} assessment`);
        
        try {
            // Show loading
            this.showAssessmentLoading();
            
            let result;
            switch(this.currentAssessmentType) {
                case 'digital-skills':
                    result = await apiClient.submitDigitalSkillsAssessment(this.responses);
                    break;
                case 'learning-style':
                    result = await apiClient.submitLearningStyleAssessment(this.responses);
                    break;
                case 'tech-comfort':
                    result = await apiClient.submitTechComfortSurvey(this.responses);
                    break;
            }
            
            console.log('✅ Assessment submitted successfully:', result);
            this.displayResults(result);
            
        } catch (error) {
            console.error('Failed to submit assessment:', error);
            this.showError('Gagal mengirim assessment. Silakan coba lagi.');
        }
    }

    showAssessmentLoading() {
        document.getElementById('assessment-container').classList.add('hidden');
        document.getElementById('results-container').classList.remove('hidden');
        document.getElementById('results-loading').style.display = 'block';
        document.getElementById('results-content').classList.add('hidden');
    }

    displayResults(result) {
        document.getElementById('results-loading').style.display = 'none';
        document.getElementById('results-content').classList.remove('hidden');
        
        const resultsContent = document.getElementById('results-content');
        
        if (this.currentAssessmentType === 'digital-skills') {
            resultsContent.innerHTML = `
                <div class="results-score">${result.score}%</div>
                <div class="results-level">Level: ${this.translateLevel(result.level)}</div>
                <div class="results-description">
                    ${this.getDigitalSkillsDescription(result.level)}
                </div>
                <button class="btn btn-primary" onclick="location.href='index.html'">
                    Lanjut ke Dashboard
                </button>
            `;
        } else if (this.currentAssessmentType === 'learning-style') {
            resultsContent.innerHTML = `
                <div class="results-score">🧠</div>
                <div class="results-level">Gaya Belajar: ${this.translateLearningStyle(result.style)}</div>
                <div class="results-description">
                    ${this.getLearningStyleDescription(result.style)}
                    <br><br>
                    <strong>Preferensi Anda:</strong><br>
                    Visual: ${result.preferences.visual}% | 
                    Auditory: ${result.preferences.auditory}% | 
                    Kinesthetic: ${result.preferences.kinesthetic}% | 
                    Reading: ${result.preferences.reading}%
                </div>
                <button class="btn btn-primary" onclick="location.href='index.html'">
                    Lanjut ke Dashboard
                </button>
            `;
        }
        
        // Calculate completion time
        const completionTime = Math.round((Date.now() - this.startTime) / 1000);
        console.log(`⏱️ Assessment completed in ${completionTime} seconds`);
        
        // Update carbon footprint
        this.carbonFootprint += completionTime * 0.001; // Estimate
        this.updateCarbonIndicator();
    }

    translateLevel(level) {
        const translations = {
            'beginner': 'Pemula',
            'intermediate': 'Menengah', 
            'advanced': 'Mahir'
        };
        return translations[level] || level;
    }

    translateLearningStyle(style) {
        const translations = {
            'visual': 'Visual',
            'auditory': 'Auditori',
            'kinesthetic': 'Kinestetik',
            'reading': 'Membaca/Menulis'
        };
        return translations[style] || style;
    }

    getDigitalSkillsDescription(level) {
        const descriptions = {
            'beginner': 'Anda memiliki dasar-dasar kemampuan digital. Fokus pada pembelajaran tools dasar seperti email, cloud storage, dan komunikasi digital.',
            'intermediate': 'Kemampuan digital Anda cukup baik. Anda siap untuk mempelajari tools yang lebih advanced seperti analytics dan automation.',
            'advanced': 'Kemampuan digital Anda sangat baik! Anda siap untuk topik advanced seperti AI tools, advanced analytics, dan digital strategy.'
        };
        return descriptions[level] || 'Hasil assessment Anda telah disimpan.';
    }

    getLearningStyleDescription(style) {
        const descriptions = {
            'visual': 'Anda belajar paling efektif melalui gambar, diagram, dan visualisasi. Konten video dan infografis akan sangat membantu.',
            'auditory': 'Anda belajar paling efektif melalui mendengar. Podcast, diskusi, dan penjelasan audio akan sangat membantu.',
            'kinesthetic': 'Anda belajar paling efektif melalui praktik langsung. Hands-on exercises dan simulasi akan sangat membantu.',
            'reading': 'Anda belajar paling efektif melalui membaca dan menulis. Artikel, e-book, dan note-taking akan sangat membantu.'
        };
        return descriptions[style] || 'Gaya belajar Anda telah diidentifikasi.';
    }

    showLoading(message) {
        // Implementation for showing loading state
        console.log(`⏳ ${message}`);
    }

    showError(message) {
        alert(`❌ ${message}`);
        console.error(message);
    }

    updateCarbonIndicator() {
        const indicator = document.getElementById('carbon-indicator');
        if (indicator) {
            indicator.textContent = `🌱 ${this.carbonFootprint.toFixed(3)}g CO2`;
        }
    }
}

// Initialize Assessment Manager
const assessmentManager = new AssessmentManager();

// Global functions for HTML onclick handlers
window.startAssessment = (type) => assessmentManager.startAssessment(type);
window.selectOption = (questionId, answer) => assessmentManager.selectOption(questionId, answer);
window.nextQuestion = () => assessmentManager.nextQuestion();
window.previousQuestion = () => assessmentManager.previousQuestion();

// Export for module usage
export { AssessmentManager };
