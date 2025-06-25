/**
 * AgenticLearn Student Portal - AI Tutor Module
 * ARIA - AI Learning Assistant following educator pattern
 * Green computing: Efficient chat interface, minimal DOM updates
 */

import { UIComponents } from '../components/ui-components.js';

export class AITutorModule {
    constructor(apiClient) {
        this.api = apiClient;
        this.isLoading = false;
        this.currentTab = 'chat'; // chat, insights, recommendations
        this.chatHistory = [];
        this.insights = [];
        this.recommendations = [];
        this.isTyping = false;
        this.currentSession = null;
    }

    /**
     * Initialize AI Tutor module following educator pattern
     */
    async initialize() {
        console.log('🤖 Initializing AI Tutor Module...');
        await this.loadAIData();
    }

    /**
     * Render AI Tutor interface
     */
    async render() {
        try {
            console.log('🎨 Rendering AI Tutor Module...');

            const container = document.getElementById('ai-tutor-content');
            if (!container) {
                console.error('❌ AI Tutor container not found');
                return;
            }

            // Show loading state
            UIComponents.showLoading(container, '🤖 Loading ARIA - Your AI Learning Assistant...');

            // Load AI data
            await this.loadAIData();

            // Render AI interface
            this.renderAIInterface(container);

            console.log('✅ AI Tutor Module rendered successfully');

        } catch (error) {
            console.error('❌ Failed to render AI tutor:', error);

            const container = document.getElementById('ai-tutor-content');
            if (container) {
                container.innerHTML = `
                    <div class="error-state">
                        <div class="error-icon">❌</div>
                        <h3>Failed to Load AI Tutor</h3>
                        <p>${error.message}</p>
                        <p class="error-details">Please ensure the backend is running and database is populated.</p>
                        <button class="btn btn-primary" onclick="window.studentPortal.modules.aiTutor.retry()">
                            🔄 Retry
                        </button>
                    </div>
                `;
            }
        }
    }

    /**
     * Load AI data from backend
     */
    async loadAIData() {
        try {
            console.log('🤖 Loading AI data from backend...');
            this.isLoading = true;

            if (!this.api) {
                throw new Error('API client not available');
            }

            // Load chat history
            const chatResponse = await this.api.getAIChatHistory();
            if (!chatResponse.success) {
                throw new Error(`Failed to load chat history: ${chatResponse.error || 'Unknown error'}`);
            }
            this.chatHistory = chatResponse.data || [];

            // Load AI insights
            const insightsResponse = await this.api.getAIInsights();
            if (!insightsResponse.success) {
                throw new Error(`Failed to load insights: ${insightsResponse.error || 'Unknown error'}`);
            }
            this.insights = insightsResponse.data || [];

            // Load recommendations
            const recommendationsResponse = await this.api.getAIRecommendations();
            if (!recommendationsResponse.success) {
                throw new Error(`Failed to load recommendations: ${recommendationsResponse.error || 'Unknown error'}`);
            }
            this.recommendations = recommendationsResponse.data || [];

            console.log('✅ AI data loaded from database:', {
                chatHistory: this.chatHistory.length,
                insights: this.insights.length,
                recommendations: this.recommendations.length
            });

        } catch (error) {
            console.error('❌ Failed to load AI data:', error);
            throw new Error(`Failed to load AI data: ${error.message}`);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Render AI interface following educator pattern
     */
    renderAIInterface(container) {
        const aiHTML = `
            <div class="ai-container">
                <!-- AI Header -->
                <div class="ai-header">
                    <div class="ai-title-section">
                        <h1>🤖 ARIA - AI Learning Assistant</h1>
                        <p>Your personalized AI tutor for enhanced learning</p>
                    </div>
                    
                    <!-- AI Tabs -->
                    <div class="ai-tabs">
                        <button class="tab-btn ${this.currentTab === 'chat' ? 'active' : ''}" 
                                onclick="window.aiTutorModule.switchTab('chat')">
                            💬 Chat
                        </button>
                        <button class="tab-btn ${this.currentTab === 'insights' ? 'active' : ''}" 
                                onclick="window.aiTutorModule.switchTab('insights')">
                            🧠 Insights
                        </button>
                        <button class="tab-btn ${this.currentTab === 'recommendations' ? 'active' : ''}" 
                                onclick="window.aiTutorModule.switchTab('recommendations')">
                            💡 Recommendations
                        </button>
                    </div>
                </div>

                <!-- AI Content -->
                <div class="ai-content">
                    <!-- Chat Tab -->
                    <div id="chat-tab" class="tab-content ${this.currentTab === 'chat' ? 'active' : ''}">
                        ${this.renderChatInterface()}
                    </div>

                    <!-- Insights Tab -->
                    <div id="insights-tab" class="tab-content ${this.currentTab === 'insights' ? 'active' : ''}">
                        ${this.renderInsightsInterface()}
                    </div>

                    <!-- Recommendations Tab -->
                    <div id="recommendations-tab" class="tab-content ${this.currentTab === 'recommendations' ? 'active' : ''}">
                        ${this.renderRecommendationsInterface()}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = aiHTML;
        this.addAIStyles();
        this.bindChatEvents();
        
        // Expose module globally for button actions
        window.aiTutorModule = this;
    }

    /**
     * Render chat interface
     */
    renderChatInterface() {
        return `
            <div class="chat-container">
                <div class="chat-messages" id="chat-messages">
                    ${this.chatHistory.map(message => this.renderChatMessage(message)).join('')}
                    ${this.isTyping ? this.renderTypingIndicator() : ''}
                </div>
                
                <div class="chat-input-container">
                    <div class="quick-questions">
                        <button class="quick-btn" onclick="window.aiTutorModule.askQuickQuestion('Explain this concept')">
                            ❓ Explain this concept
                        </button>
                        <button class="quick-btn" onclick="window.aiTutorModule.askQuickQuestion('Help with homework')">
                            📝 Help with homework
                        </button>
                        <button class="quick-btn" onclick="window.aiTutorModule.askQuickQuestion('Study tips')">
                            💡 Study tips
                        </button>
                    </div>
                    
                    <div class="chat-input">
                        <input type="text" id="chat-input" placeholder="Ask ARIA anything about your studies..." 
                               onkeypress="window.aiTutorModule.handleKeyPress(event)">
                        <button class="send-btn" onclick="window.aiTutorModule.sendMessage()">
                            📤 Send
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render insights interface
     */
    renderInsightsInterface() {
        if (this.insights.length === 0) {
            return UIComponents.createEmptyState(
                'No Insights Available',
                'ARIA is analyzing your learning patterns to provide insights.',
                { label: 'Analyze Learning', onclick: 'window.aiTutorModule.analyzeInsights()' }
            );
        }

        return `
            <div class="insights-grid">
                ${this.insights.map(insight => this.renderInsightCard(insight)).join('')}
            </div>
        `;
    }

    /**
     * Render recommendations interface
     */
    renderRecommendationsInterface() {
        if (this.recommendations.length === 0) {
            return UIComponents.createEmptyState(
                'No Recommendations Available',
                'ARIA will provide personalized recommendations based on your progress.',
                { label: 'Generate Recommendations', onclick: 'window.aiTutorModule.generateRecommendations()' }
            );
        }

        return `
            <div class="recommendations-grid">
                ${this.recommendations.map(rec => this.renderRecommendationCard(rec)).join('')}
            </div>
        `;
    }

    /**
     * Render chat message
     */
    renderChatMessage(message) {
        const isUser = message.type === 'user';
        const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="chat-message ${isUser ? 'user' : 'ai'}">
                <div class="message-avatar">${message.avatar}</div>
                <div class="message-content">
                    <div class="message-text">${message.message}</div>
                    <div class="message-time">${time}</div>
                </div>
            </div>
        `;
    }

    /**
     * Render typing indicator
     */
    renderTypingIndicator() {
        return `
            <div class="chat-message ai typing">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render insight card
     */
    renderInsightCard(insight) {
        return UIComponents.createCard(
            `${insight.icon} ${insight.title}`,
            `
                <p>${insight.description}</p>
                <div style="margin-top: 1rem;">
                    ${UIComponents.createBadge(insight.priority, insight.priority === 'high' ? 'error' : 'warning')}
                    ${UIComponents.createBadge(insight.type, 'info')}
                </div>
            `,
            [
                { label: 'Learn More', onclick: `window.aiTutorModule.viewInsight('${insight.id}')`, type: 'primary' }
            ]
        );
    }

    /**
     * Render recommendation card
     */
    renderRecommendationCard(recommendation) {
        return UIComponents.createCard(
            `${recommendation.icon} ${recommendation.title}`,
            `
                <p>${recommendation.description}</p>
                <div style="margin-top: 1rem;">
                    ${UIComponents.createBadge(recommendation.priority, recommendation.priority === 'high' ? 'error' : 'warning')}
                    ${UIComponents.createBadge(recommendation.category, 'info')}
                </div>
            `,
            [
                { label: recommendation.action, onclick: `window.aiTutorModule.takeAction('${recommendation.id}')`, type: 'primary' }
            ]
        );
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        console.log(`🔄 Switching to ${tabName} tab`);
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[onclick*="'${tabName}'"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    /**
     * Handle chat input key press
     */
    handleKeyPress(event) {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    }

    /**
     * Send chat message
     */
    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();

        if (!message) return;

        // Add user message
        this.addChatMessage({
            id: `msg_${Date.now()}`,
            type: 'user',
            message: message,
            timestamp: new Date().toISOString(),
            avatar: '👤'
        });

        // Clear input
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        // Simulate AI response
        setTimeout(() => {
            this.hideTypingIndicator();
            this.addAIResponse(message);
        }, 1500);
    }

    /**
     * Ask quick question
     */
    askQuickQuestion(question) {
        document.getElementById('chat-input').value = question;
        this.sendMessage();
    }

    /**
     * Add chat message to history and UI
     */
    addChatMessage(message) {
        this.chatHistory.push(message);

        const messagesContainer = document.getElementById('chat-messages');
        const messageHTML = this.renderChatMessage(message);
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        this.isTyping = true;
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.insertAdjacentHTML('beforeend', this.renderTypingIndicator());
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        this.isTyping = false;
        const typingElement = document.querySelector('.typing');
        if (typingElement) {
            typingElement.remove();
        }
    }

    /**
     * Add AI response
     */
    addAIResponse(userMessage) {
        const responses = {
            'calculus': 'Calculus is the mathematical study of continuous change. Integration finds the area under curves, while differentiation finds rates of change.',
            'programming': 'Programming is about solving problems step by step. Start with understanding the problem, then break it into smaller parts.',
            'study tips': 'Here are some effective study tips: 1) Use active recall, 2) Space out your practice, 3) Teach concepts to others, 4) Take regular breaks.',
            'homework': 'I\'d be happy to help with your homework! Please share the specific problem or concept you\'re working on.',
            'default': 'That\'s an interesting question! Let me help you understand this concept better. Could you provide more details about what specifically you\'d like to learn?'
        };

        let response = responses.default;
        const lowerMessage = userMessage.toLowerCase();

        for (const [key, value] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                response = value;
                break;
            }
        }

        this.addChatMessage({
            id: `ai_${Date.now()}`,
            type: 'ai',
            message: response,
            timestamp: new Date().toISOString(),
            avatar: '🤖'
        });
    }

    /**
     * Bind chat events
     */
    bindChatEvents() {
        // Auto-scroll chat to bottom
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    /**
     * View insight details
     */
    viewInsight(insightId) {
        console.log(`👁️ Viewing insight: ${insightId}`);
        UIComponents.showNotification('📊 Insight details coming soon!', 'info');
    }

    /**
     * Take action on recommendation
     */
    takeAction(recommendationId) {
        console.log(`🎯 Taking action on recommendation: ${recommendationId}`);
        UIComponents.showNotification('🚀 Action implementation coming soon!', 'info');
    }

    /**
     * Analyze insights
     */
    analyzeInsights() {
        console.log('🧠 Analyzing learning insights...');
        UIComponents.showNotification('🔄 Analyzing your learning patterns...', 'info');
    }

    /**
     * Generate recommendations
     */
    generateRecommendations() {
        console.log('💡 Generating AI recommendations...');
        UIComponents.showNotification('🤖 Generating personalized recommendations...', 'info');
    }

    /**
     * Add AI-specific styles
     */
    addAIStyles() {
        if (document.querySelector('#ai-tutor-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'ai-tutor-styles';
        styles.textContent = `
            /* AI Container */
            .ai-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 1rem;
            }

            /* AI Header */
            .ai-header {
                margin-bottom: 2rem;
            }

            .ai-title-section h1 {
                font-size: 2rem;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 0.5rem;
            }

            .ai-title-section p {
                color: #6b7280;
                font-size: 1.125rem;
                margin-bottom: 2rem;
            }

            /* AI Tabs */
            .ai-tabs {
                display: flex;
                gap: 0.5rem;
                border-bottom: 1px solid #e5e7eb;
                margin-bottom: 2rem;
            }

            .tab-btn {
                padding: 0.75rem 1.5rem;
                border: none;
                background: none;
                color: #6b7280;
                font-weight: 500;
                cursor: pointer;
                border-bottom: 2px solid transparent;
                transition: all 0.2s;
            }

            .tab-btn.active {
                color: #667b68;
                border-bottom-color: #667b68;
            }

            .tab-btn:hover {
                color: #374151;
            }

            /* Tab Content */
            .tab-content {
                display: none;
            }

            .tab-content.active {
                display: block;
            }

            /* Chat Interface */
            .chat-container {
                background: white;
                border-radius: 12px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                height: 600px;
                display: flex;
                flex-direction: column;
            }

            .chat-messages {
                flex: 1;
                padding: 1.5rem;
                overflow-y: auto;
                background: #f9fafb;
            }

            .chat-message {
                display: flex;
                gap: 1rem;
                margin-bottom: 1.5rem;
                align-items: flex-start;
            }

            .chat-message.user {
                flex-direction: row-reverse;
            }

            .message-avatar {
                width: 2.5rem;
                height: 2.5rem;
                border-radius: 50%;
                background: #667b68;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
                flex-shrink: 0;
            }

            .chat-message.user .message-avatar {
                background: #3b82f6;
            }

            .message-content {
                max-width: 70%;
                background: white;
                border-radius: 12px;
                padding: 1rem;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            .chat-message.user .message-content {
                background: #667b68;
                color: white;
            }

            .message-text {
                line-height: 1.5;
                margin-bottom: 0.5rem;
            }

            .message-time {
                font-size: 0.75rem;
                opacity: 0.7;
            }

            /* Typing Indicator */
            .typing-indicator {
                display: flex;
                gap: 0.25rem;
                align-items: center;
                padding: 0.5rem 0;
            }

            .typing-indicator span {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #6b7280;
                animation: typing 1.4s infinite ease-in-out;
            }

            .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
            .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

            @keyframes typing {
                0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                40% { transform: scale(1); opacity: 1; }
            }

            /* Chat Input */
            .chat-input-container {
                background: white;
                border-top: 1px solid #e5e7eb;
                padding: 1rem;
            }

            .quick-questions {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
                flex-wrap: wrap;
            }

            .quick-btn {
                padding: 0.5rem 1rem;
                background: #f3f4f6;
                border: 1px solid #d1d5db;
                border-radius: 20px;
                font-size: 0.875rem;
                cursor: pointer;
                transition: all 0.2s;
            }

            .quick-btn:hover {
                background: #e5e7eb;
                border-color: #9ca3af;
            }

            .chat-input {
                display: flex;
                gap: 0.75rem;
                align-items: center;
            }

            .chat-input input {
                flex: 1;
                padding: 0.75rem 1rem;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 1rem;
                outline: none;
                transition: border-color 0.2s;
            }

            .chat-input input:focus {
                border-color: #667b68;
                box-shadow: 0 0 0 3px rgba(102, 123, 104, 0.1);
            }

            .send-btn {
                padding: 0.75rem 1.5rem;
                background: #667b68;
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }

            .send-btn:hover {
                background: #4a5a4c;
                transform: translateY(-1px);
            }

            /* Insights and Recommendations Grid */
            .insights-grid, .recommendations-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 1.5rem;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .ai-container {
                    padding: 0.5rem;
                }

                .chat-container {
                    height: 500px;
                }

                .message-content {
                    max-width: 85%;
                }

                .quick-questions {
                    flex-direction: column;
                }

                .quick-btn {
                    text-align: left;
                }

                .chat-input {
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .chat-input input {
                    width: 100%;
                }

                .insights-grid, .recommendations-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Refresh AI data
     */
    async refresh() {
        await this.loadAIData();
        const container = document.getElementById('ai-tutor-content');
        if (container) {
            this.renderAIInterface(container);
        }
    }

    /**
     * Retry loading AI data
     */
    async retry() {
        try {
            console.log('🔄 Retrying AI tutor load...');
            await this.render();
        } catch (error) {
            console.error('❌ Retry failed:', error);
            UIComponents.showNotification('Retry failed: ' + error.message, 'error');
        }
    }

    /**
     * Refresh AI data
     */
    async refresh() {
        await this.retry();
    }
}
