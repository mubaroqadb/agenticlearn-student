/**
 * Resources Module for AgenticLearn Student Portal
 * Manages learning resources, study materials, and references
 */

class ResourcesModule {
    constructor(apiClient) {
        this.api = apiClient;
        this.resources = [];
        this.categories = [];
        this.isLoading = false;
    }

    /**
     * Render the resources interface
     */
    async render() {
        try {
            console.log('📚 Rendering Resources module...');
            
            const container = document.getElementById('resources-content');
            if (!container) {
                console.error('❌ Resources container not found');
                return;
            }

            // Show loading state
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <h3>Loading Resources...</h3>
                    <p>Fetching learning materials and study resources</p>
                </div>
            `;

            // Load resources data
            await this.loadResourcesData();

            // Render resources interface
            this.renderResourcesInterface(container);

            console.log('✅ Resources module rendered successfully');

        } catch (error) {
            console.error('❌ Failed to render resources:', error);
            
            const container = document.getElementById('resources-content');
            if (container) {
                container.innerHTML = `
                    <div class="error-state">
                        <div class="error-icon">❌</div>
                        <h3>Failed to Load Resources</h3>
                        <p>${error.message}</p>
                        <p class="error-details">Please ensure the backend is running and database is populated.</p>
                        <button class="btn btn-primary" onclick="window.studentPortal.modules.resources.retry()">
                            🔄 Retry
                        </button>
                    </div>
                `;
            }
        }
    }

    /**
     * Load resources data from backend
     */
    async loadResourcesData() {
        try {
            console.log('📚 Loading resources data from backend...');
            this.isLoading = true;

            // For now, use static data since backend endpoint doesn't exist yet
            // TODO: Implement backend endpoint for resources
            this.resources = [
                {
                    id: 'res_001',
                    title: 'JavaScript Fundamentals Guide',
                    description: 'Comprehensive guide covering JavaScript basics, functions, and DOM manipulation',
                    category: 'Programming',
                    type: 'document',
                    format: 'PDF',
                    size: '2.5 MB',
                    url: '#',
                    thumbnail: '📄',
                    tags: ['JavaScript', 'Programming', 'Fundamentals'],
                    difficulty: 'Beginner',
                    estimated_time: '2 hours',
                    downloads: 1250,
                    rating: 4.8,
                    last_updated: '2025-06-20'
                },
                {
                    id: 'res_002',
                    title: 'HTML & CSS Best Practices',
                    description: 'Modern HTML5 and CSS3 techniques for responsive web design',
                    category: 'Web Development',
                    type: 'video',
                    format: 'MP4',
                    size: '150 MB',
                    url: '#',
                    thumbnail: '🎥',
                    tags: ['HTML', 'CSS', 'Responsive Design'],
                    difficulty: 'Intermediate',
                    estimated_time: '1.5 hours',
                    downloads: 890,
                    rating: 4.6,
                    last_updated: '2025-06-18'
                },
                {
                    id: 'res_003',
                    title: 'Digital Safety Handbook',
                    description: 'Essential guide to online security, privacy, and digital citizenship',
                    category: 'Digital Literacy',
                    type: 'interactive',
                    format: 'Web',
                    size: '5 MB',
                    url: '#',
                    thumbnail: '🛡️',
                    tags: ['Security', 'Privacy', 'Digital Citizenship'],
                    difficulty: 'Beginner',
                    estimated_time: '45 minutes',
                    downloads: 2100,
                    rating: 4.9,
                    last_updated: '2025-06-22'
                },
                {
                    id: 'res_004',
                    title: 'Programming Logic Exercises',
                    description: 'Interactive exercises to develop logical thinking and problem-solving skills',
                    category: 'Programming',
                    type: 'exercise',
                    format: 'Interactive',
                    size: '10 MB',
                    url: '#',
                    thumbnail: '🧩',
                    tags: ['Logic', 'Problem Solving', 'Exercises'],
                    difficulty: 'Intermediate',
                    estimated_time: '3 hours',
                    downloads: 750,
                    rating: 4.7,
                    last_updated: '2025-06-15'
                },
                {
                    id: 'res_005',
                    title: 'Green Computing Guide',
                    description: 'Learn about sustainable technology practices and environmental impact',
                    category: 'Sustainability',
                    type: 'document',
                    format: 'PDF',
                    size: '1.8 MB',
                    url: '#',
                    thumbnail: '🌱',
                    tags: ['Green Computing', 'Sustainability', 'Environment'],
                    difficulty: 'Beginner',
                    estimated_time: '1 hour',
                    downloads: 450,
                    rating: 4.5,
                    last_updated: '2025-06-10'
                }
            ];

            this.categories = [
                { id: 'all', name: 'All Resources', count: this.resources.length },
                { id: 'programming', name: 'Programming', count: 2 },
                { id: 'web-development', name: 'Web Development', count: 1 },
                { id: 'digital-literacy', name: 'Digital Literacy', count: 1 },
                { id: 'sustainability', name: 'Sustainability', count: 1 }
            ];

            console.log('✅ Resources data loaded:', {
                resources: this.resources.length,
                categories: this.categories.length
            });

        } catch (error) {
            console.error('❌ Failed to load resources data:', error);
            throw new Error(`Failed to load resources data: ${error.message}`);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Render resources interface
     */
    renderResourcesInterface(container) {
        container.innerHTML = `
            <div class="resources-header">
                <div class="page-header">
                    <h2 class="page-title">📚 Learning Resources</h2>
                    <p class="page-subtitle">Access study materials, guides, and references</p>
                </div>
                
                <div class="resources-filters">
                    <div class="filter-categories">
                        ${this.categories.map(category => `
                            <button class="filter-btn ${category.id === 'all' ? 'active' : ''}" 
                                    data-category="${category.id}">
                                ${category.name} (${category.count})
                            </button>
                        `).join('')}
                    </div>
                    
                    <div class="search-box">
                        <input type="text" id="resources-search" placeholder="Search resources..." />
                        <span class="search-icon">🔍</span>
                    </div>
                </div>
            </div>

            <div class="resources-grid" id="resources-grid">
                ${this.renderResourceCards()}
            </div>
        `;

        // Add event listeners
        this.setupEventListeners();
    }

    /**
     * Render resource cards
     */
    renderResourceCards() {
        return this.resources.map(resource => `
            <div class="resource-card" data-category="${resource.category.toLowerCase().replace(' ', '-')}">
                <div class="resource-thumbnail">
                    <span class="resource-icon">${resource.thumbnail}</span>
                    <div class="resource-type">${resource.type}</div>
                </div>
                
                <div class="resource-content">
                    <h3 class="resource-title">${resource.title}</h3>
                    <p class="resource-description">${resource.description}</p>
                    
                    <div class="resource-meta">
                        <span class="resource-difficulty ${resource.difficulty.toLowerCase()}">${resource.difficulty}</span>
                        <span class="resource-time">⏱️ ${resource.estimated_time}</span>
                        <span class="resource-rating">⭐ ${resource.rating}</span>
                    </div>
                    
                    <div class="resource-tags">
                        ${resource.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    
                    <div class="resource-actions">
                        <button class="btn btn-primary" onclick="window.studentPortal.modules.resources.openResource('${resource.id}')">
                            📖 Open Resource
                        </button>
                        <button class="btn btn-secondary" onclick="window.studentPortal.modules.resources.downloadResource('${resource.id}')">
                            💾 Download
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Category filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterByCategory(category);
                
                // Update active state
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Search functionality
        const searchInput = document.getElementById('resources-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchResources(e.target.value);
            });
        }
    }

    /**
     * Filter resources by category
     */
    filterByCategory(category) {
        const cards = document.querySelectorAll('.resource-card');
        cards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    /**
     * Search resources
     */
    searchResources(query) {
        const cards = document.querySelectorAll('.resource-card');
        const searchTerm = query.toLowerCase();
        
        cards.forEach(card => {
            const title = card.querySelector('.resource-title').textContent.toLowerCase();
            const description = card.querySelector('.resource-description').textContent.toLowerCase();
            const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());
            
            const matches = title.includes(searchTerm) || 
                          description.includes(searchTerm) || 
                          tags.some(tag => tag.includes(searchTerm));
            
            card.style.display = matches ? 'block' : 'none';
        });
    }

    /**
     * Open resource
     */
    openResource(resourceId) {
        const resource = this.resources.find(r => r.id === resourceId);
        if (resource) {
            console.log('📖 Opening resource:', resource.title);
            UIComponents.showNotification(`Opening ${resource.title}`, 'info');
            // TODO: Implement actual resource opening logic
        }
    }

    /**
     * Download resource
     */
    downloadResource(resourceId) {
        const resource = this.resources.find(r => r.id === resourceId);
        if (resource) {
            console.log('💾 Downloading resource:', resource.title);
            UIComponents.showNotification(`Downloading ${resource.title}`, 'success');
            // TODO: Implement actual download logic
        }
    }

    /**
     * Retry loading resources
     */
    async retry() {
        try {
            console.log('🔄 Retrying resources load...');
            await this.render();
        } catch (error) {
            console.error('❌ Retry failed:', error);
            UIComponents.showNotification('Retry failed: ' + error.message, 'error');
        }
    }

    /**
     * Refresh resources data
     */
    async refresh() {
        await this.retry();
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResourcesModule;
}
