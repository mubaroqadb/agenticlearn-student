// ARIA AI Tutor Testing Interface
import { apiClient } from "https://mubaroqadb.github.io/agenticlearn-shared/js/api-client.js";
import { ARIAChat } from "https://mubaroqadb.github.io/agenticlearn-shared/js/aria-chat.js";

// Testing state
let testMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    totalResponseTime: 0,
    carbonFootprint: 0
};

let currentSessionId = null;
let ariaTestChat = null;

// Initialize testing interface
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🧪 ARIA Testing Interface loaded');
    
    // Initialize test chat
    initializeTestChat();
    
    // Auto health check
    setTimeout(testARIAHealth, 1000);
    
    // Update metrics every 5 seconds
    setInterval(updateMetricsDisplay, 5000);
});

function initializeTestChat() {
    try {
        ariaTestChat = new ARIAChat('aria-chat-test', {
            theme: 'green',
            showSuggestions: true,
            showCarbonTracker: true,
            autoScroll: true,
            maxMessages: 20
        });
        
        console.log('🤖 ARIA Test Chat initialized');
        showNotification('ARIA Test Chat ready!', 'success');
    } catch (error) {
        console.error('Failed to initialize ARIA test chat:', error);
        showNotification('Failed to initialize ARIA chat', 'error');
    }
}

// Health Check Functions
async function testARIAHealth() {
    const startTime = performance.now();
    updateStatus('testing', 'Testing ARIA health...');
    
    try {
        const response = await apiClient.ariaHealthCheck();
        const responseTime = performance.now() - startTime;
        
        updateMetrics(true, responseTime);
        
        if (response.status === 'healthy') {
            updateStatus('online', 'ARIA AI Tutor Online');
            displayResults('health-results', {
                status: 'SUCCESS',
                data: response,
                responseTime: `${responseTime.toFixed(2)}ms`
            });
            showNotification('ARIA is healthy and ready! ✅', 'success');
        } else {
            updateStatus('offline', 'ARIA has issues');
            displayResults('health-results', {
                status: 'WARNING',
                data: response,
                responseTime: `${responseTime.toFixed(2)}ms`
            });
            showNotification('ARIA health check shows issues', 'warning');
        }
    } catch (error) {
        const responseTime = performance.now() - startTime;
        updateMetrics(false, responseTime);
        updateStatus('offline', 'ARIA Offline');
        displayResults('health-results', {
            status: 'ERROR',
            error: error.message,
            responseTime: `${responseTime.toFixed(2)}ms`
        });
        showNotification('ARIA health check failed', 'error');
    }
}

async function testAPIConnection() {
    const startTime = performance.now();
    
    try {
        // Test basic API connectivity
        const response = await fetch(apiClient.getEndpoint('aria') + '/health', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const responseTime = performance.now() - startTime;
        const data = await response.json();
        
        updateMetrics(response.ok, responseTime);
        
        displayResults('health-results', {
            status: response.ok ? 'SUCCESS' : 'ERROR',
            data: data,
            responseTime: `${responseTime.toFixed(2)}ms`,
            httpStatus: response.status
        });
        
        if (response.ok) {
            showNotification('API connection successful!', 'success');
        } else {
            showNotification('API connection failed', 'error');
        }
    } catch (error) {
        const responseTime = performance.now() - startTime;
        updateMetrics(false, responseTime);
        displayResults('health-results', {
            status: 'ERROR',
            error: error.message,
            responseTime: `${responseTime.toFixed(2)}ms`
        });
        showNotification('API connection test failed', 'error');
    }
}

// Knowledge Base Tests
async function testKnowledgeTopics() {
    const startTime = performance.now();
    
    try {
        const response = await apiClient.ariaGetKnowledge();
        const responseTime = performance.now() - startTime;
        
        updateMetrics(true, responseTime);
        displayResults('knowledge-results', {
            status: 'SUCCESS',
            data: response,
            responseTime: `${responseTime.toFixed(2)}ms`
        });
        showNotification('Knowledge topics loaded successfully!', 'success');
    } catch (error) {
        const responseTime = performance.now() - startTime;
        updateMetrics(false, responseTime);
        displayResults('knowledge-results', {
            status: 'ERROR',
            error: error.message,
            responseTime: `${responseTime.toFixed(2)}ms`
        });
        showNotification('Failed to load knowledge topics', 'error');
    }
}

async function testFAQDatabase() {
    const startTime = performance.now();
    
    try {
        const response = await apiClient.ariaGetKnowledge(null, 'faq');
        const responseTime = performance.now() - startTime;
        
        updateMetrics(true, responseTime);
        displayResults('knowledge-results', {
            status: 'SUCCESS',
            data: response,
            responseTime: `${responseTime.toFixed(2)}ms`,
            faqCount: Object.keys(response.data || {}).length
        });
        showNotification('FAQ database loaded successfully!', 'success');
    } catch (error) {
        const responseTime = performance.now() - startTime;
        updateMetrics(false, responseTime);
        displayResults('knowledge-results', {
            status: 'ERROR',
            error: error.message,
            responseTime: `${responseTime.toFixed(2)}ms`
        });
        showNotification('Failed to load FAQ database', 'error');
    }
}

async function testSpecificTopic(topic) {
    const startTime = performance.now();
    
    try {
        const response = await apiClient.ariaGetKnowledge(topic);
        const responseTime = performance.now() - startTime;
        
        updateMetrics(true, responseTime);
        displayResults('knowledge-results', {
            status: 'SUCCESS',
            topic: topic,
            data: response,
            responseTime: `${responseTime.toFixed(2)}ms`
        });
        showNotification(`Topic "${topic}" loaded successfully!`, 'success');
    } catch (error) {
        const responseTime = performance.now() - startTime;
        updateMetrics(false, responseTime);
        displayResults('knowledge-results', {
            status: 'ERROR',
            topic: topic,
            error: error.message,
            responseTime: `${responseTime.toFixed(2)}ms`
        });
        showNotification(`Failed to load topic "${topic}"`, 'error');
    }
}

// Session Management Tests
async function createTestSession() {
    const startTime = performance.now();
    
    try {
        const response = await apiClient.ariaCreateSession(
            ['Green Computing', 'Testing', 'AI Interaction'],
            { 
                source: 'testing_interface',
                timestamp: new Date().toISOString(),
                testMode: true
            }
        );
        
        const responseTime = performance.now() - startTime;
        currentSessionId = response.session_id;
        
        updateMetrics(true, responseTime);
        displayResults('session-results', {
            status: 'SUCCESS',
            sessionId: currentSessionId,
            data: response,
            responseTime: `${responseTime.toFixed(2)}ms`
        });
        showNotification('Test session created successfully!', 'success');
    } catch (error) {
        const responseTime = performance.now() - startTime;
        updateMetrics(false, responseTime);
        displayResults('session-results', {
            status: 'ERROR',
            error: error.message,
            responseTime: `${responseTime.toFixed(2)}ms`
        });
        showNotification('Failed to create test session', 'error');
    }
}

async function getSessionInfo() {
    if (!currentSessionId) {
        showNotification('No active session. Create one first!', 'warning');
        return;
    }
    
    const startTime = performance.now();
    
    try {
        const response = await apiClient.ariaGetSession(currentSessionId);
        const responseTime = performance.now() - startTime;
        
        updateMetrics(true, responseTime);
        displayResults('session-results', {
            status: 'SUCCESS',
            sessionId: currentSessionId,
            data: response,
            responseTime: `${responseTime.toFixed(2)}ms`
        });
        showNotification('Session info retrieved successfully!', 'success');
    } catch (error) {
        const responseTime = performance.now() - startTime;
        updateMetrics(false, responseTime);
        displayResults('session-results', {
            status: 'ERROR',
            sessionId: currentSessionId,
            error: error.message,
            responseTime: `${responseTime.toFixed(2)}ms`
        });
        showNotification('Failed to get session info', 'error');
    }
}

// Quick Test Function
async function quickTest(message) {
    if (!ariaTestChat) {
        showNotification('Test chat not initialized', 'error');
        return;
    }
    
    const startTime = performance.now();
    
    try {
        // Send message through test chat
        const response = await apiClient.ariaChatMessage(message, currentSessionId);
        const responseTime = performance.now() - startTime;
        
        updateMetrics(true, responseTime);
        showNotification(`Quick test completed: "${message}"`, 'success');
        
        // Log the result
        console.log('Quick Test Result:', {
            message,
            response: response.data.aria_response,
            intent: response.data.intent,
            confidence: response.data.confidence,
            responseTime: `${responseTime.toFixed(2)}ms`
        });
        
    } catch (error) {
        const responseTime = performance.now() - startTime;
        updateMetrics(false, responseTime);
        showNotification(`Quick test failed: ${error.message}`, 'error');
    }
}

// Utility Functions
function updateStatus(status, message) {
    const statusElement = document.getElementById('aria-status');
    if (!statusElement) return;
    
    statusElement.className = `status-indicator status-${status}`;
    
    const icon = status === 'online' ? '🟢' : status === 'testing' ? '🟡' : '🔴';
    statusElement.innerHTML = `<span>${icon}</span><span>${message}</span>`;
}

function displayResults(containerId, result) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.style.display = 'block';
    container.innerHTML = `
        <div style="margin-bottom: 0.5rem;">
            <strong>Status:</strong> <span style="color: ${result.status === 'SUCCESS' ? '#059669' : result.status === 'WARNING' ? '#F59E0B' : '#DC2626'}">${result.status}</span>
            <span style="float: right; color: #666;">${result.responseTime}</span>
        </div>
        ${result.error ? `<div style="color: #DC2626; margin-bottom: 0.5rem;"><strong>Error:</strong> ${result.error}</div>` : ''}
        ${result.sessionId ? `<div style="margin-bottom: 0.5rem;"><strong>Session ID:</strong> ${result.sessionId}</div>` : ''}
        ${result.topic ? `<div style="margin-bottom: 0.5rem;"><strong>Topic:</strong> ${result.topic}</div>` : ''}
        ${result.faqCount ? `<div style="margin-bottom: 0.5rem;"><strong>FAQ Count:</strong> ${result.faqCount}</div>` : ''}
        ${result.httpStatus ? `<div style="margin-bottom: 0.5rem;"><strong>HTTP Status:</strong> ${result.httpStatus}</div>` : ''}
        <pre style="background: #F1F5F9; padding: 0.5rem; border-radius: 4px; font-size: 0.75rem; overflow-x: auto;">${JSON.stringify(result.data, null, 2)}</pre>
    `;
}

function updateMetrics(success, responseTime) {
    testMetrics.totalRequests++;
    if (success) testMetrics.successfulRequests++;
    testMetrics.totalResponseTime += responseTime;
    testMetrics.carbonFootprint += (responseTime / 1000) * 0.001; // Estimate
    
    updateMetricsDisplay();
}

function updateMetricsDisplay() {
    const avgResponseTime = testMetrics.totalRequests > 0 ? 
        testMetrics.totalResponseTime / testMetrics.totalRequests : 0;
    const successRate = testMetrics.totalRequests > 0 ? 
        (testMetrics.successfulRequests / testMetrics.totalRequests) * 100 : 0;
    
    document.getElementById('response-time').textContent = `${avgResponseTime.toFixed(0)}ms`;
    document.getElementById('success-rate').textContent = `${successRate.toFixed(1)}%`;
    document.getElementById('total-requests').textContent = testMetrics.totalRequests;
    document.getElementById('carbon-footprint').textContent = `${testMetrics.carbonFootprint.toFixed(3)}g`;
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Export functions for global access
window.testARIAHealth = testARIAHealth;
window.testAPIConnection = testAPIConnection;
window.testKnowledgeTopics = testKnowledgeTopics;
window.testFAQDatabase = testFAQDatabase;
window.testSpecificTopic = testSpecificTopic;
window.createTestSession = createTestSession;
window.getSessionInfo = getSessionInfo;
window.quickTest = quickTest;
