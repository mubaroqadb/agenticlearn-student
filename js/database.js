// AgenticLearn Database Manager
// Menggunakan IndexedDB untuk storage yang robust

class AgenticLearnDB {
    constructor() {
        this.dbName = 'AgenticLearnDB';
        this.version = 1;
        this.db = null;
        this.stores = [
            'students',
            'analytics',
            'assessments', 
            'communications',
            'workflows',
            'reports',
            'integrations',
            'security',
            'performance',
            'settings',
            'ai_recommendations',
            'dashboard_metrics'
        ];
    }

    // Initialize database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                this.stores.forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
                        
                        // Add indexes based on store type
                        switch(storeName) {
                            case 'students':
                                store.createIndex('email', 'email', { unique: true });
                                store.createIndex('status', 'status', { unique: false });
                                break;
                            case 'assessments':
                                store.createIndex('type', 'type', { unique: false });
                                store.createIndex('status', 'status', { unique: false });
                                break;
                            case 'communications':
                                store.createIndex('type', 'type', { unique: false });
                                store.createIndex('timestamp', 'timestamp', { unique: false });
                                break;
                        }
                    }
                });
            };
        });
    }

    // Generic CRUD operations
    async create(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        data.created_at = new Date().toISOString();
        data.updated_at = new Date().toISOString();
        return store.add(data);
    }

    async read(storeName, id = null) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        
        if (id) {
            return store.get(id);
        } else {
            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }
    }

    async update(storeName, id, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        data.id = id;
        data.updated_at = new Date().toISOString();
        return store.put(data);
    }

    async delete(storeName, id) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return store.delete(id);
    }

    // Bulk operations
    async bulkCreate(storeName, dataArray) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        const promises = dataArray.map(data => {
            data.created_at = new Date().toISOString();
            data.updated_at = new Date().toISOString();
            return store.add(data);
        });
        
        return Promise.all(promises);
    }

    async clear(storeName) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return store.clear();
    }

    // Query operations
    async query(storeName, indexName, value) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        
        return new Promise((resolve, reject) => {
            const request = index.getAll(value);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Count records
    async count(storeName) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        
        return new Promise((resolve, reject) => {
            const request = store.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Search functionality
    async search(storeName, searchTerm, fields = []) {
        const allData = await this.read(storeName);
        
        if (!searchTerm) return allData;
        
        return allData.filter(item => {
            return fields.some(field => {
                const value = item[field];
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(searchTerm.toLowerCase());
                }
                return false;
            });
        });
    }

    // Analytics helpers
    async getAnalytics(storeName, groupBy = null, dateRange = null) {
        const data = await this.read(storeName);
        
        if (dateRange) {
            const { start, end } = dateRange;
            return data.filter(item => {
                const itemDate = new Date(item.created_at);
                return itemDate >= start && itemDate <= end;
            });
        }
        
        if (groupBy) {
            const grouped = {};
            data.forEach(item => {
                const key = item[groupBy] || 'unknown';
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(item);
            });
            return grouped;
        }
        
        return data;
    }
}

// Global database instance
window.AgenticDB = new AgenticLearnDB();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgenticLearnDB;
}
