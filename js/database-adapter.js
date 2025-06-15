// Database Adapter untuk AgenticLearn Portal
// Menghubungkan UI dengan database dan menyediakan data untuk semua halaman

class DatabaseAdapter {
    constructor() {
        this.db = null;
        this.isInitialized = false;
        this.cache = {};
    }

    // Initialize database and seed data if needed
    async initialize() {
        if (this.isInitialized) return true;

        try {
            console.log('🔄 Initializing database adapter...');
            
            // Initialize database
            this.db = window.AgenticDB;
            await this.db.init();
            console.log('✅ Database initialized');
            
            // Check if we need to seed data
            const seeder = new window.DataSeeder(this.db);
            const needsSeeding = await seeder.needsSeeding();
            
            if (needsSeeding) {
                console.log('🌱 Seeding database with initial data...');
                await seeder.seedAll();
            }
            
            this.isInitialized = true;
            console.log('✅ Database adapter ready');
            return true;
        } catch (error) {
            console.error('❌ Database adapter initialization failed:', error);
            return false;
        }
    }

    // Dashboard Data
    async getDashboardMetrics() {
        if (!this.isInitialized) await this.initialize();
        
        try {
            const metrics = await this.db.read('dashboard_metrics');
            const studentsCount = await this.db.count('students');
            const assessmentsCount = await this.db.count('assessments');
            
            return {
                totalStudents: studentsCount,
                activeCourses: 8,
                completionRate: 78.5,
                engagementScore: 85.2,
                assignmentsSubmitted: 342,
                averageGrade: 82.3,
                metrics: metrics
            };
        } catch (error) {
            console.error('❌ Failed to get dashboard metrics:', error);
            return this.getFallbackDashboardData();
        }
    }

    // Students Data
    async getStudents(filters = {}) {
        if (!this.isInitialized) await this.initialize();
        
        try {
            let students = await this.db.read('students');
            
            // Apply filters
            if (filters.status) {
                students = students.filter(s => s.status === filters.status);
            }
            if (filters.search) {
                students = await this.db.search('students', filters.search, ['name', 'email', 'student_id']);
            }
            
            // Transform data for UI
            return students.map(student => ({
                id: student.id,
                name: student.name,
                email: student.email,
                studentId: student.student_id,
                status: student.status,
                progress: student.progress,
                lastActivity: this.formatTimeAgo(student.last_activity),
                coursesEnrolled: student.courses_enrolled,
                assignmentsCompleted: student.assignments_completed,
                assignmentsPending: student.assignments_pending,
                averageGrade: student.average_grade,
                attendanceRate: student.attendance_rate,
                engagementScore: student.engagement_score,
                learningStyle: student.learning_style,
                preferredTime: student.preferred_time,
                notes: student.notes
            }));
        } catch (error) {
            console.error('❌ Failed to get students:', error);
            return this.getFallbackStudentsData();
        }
    }

    // Analytics Data
    async getAnalytics() {
        if (!this.isInitialized) await this.initialize();
        
        try {
            const analytics = await this.db.read('analytics');
            const students = await this.db.read('students');
            
            // Process analytics data
            const result = {};
            analytics.forEach(item => {
                result[item.type] = item.data;
            });
            
            // Add real-time calculations
            result.studentStats = this.calculateStudentStats(students);
            result.engagementTrends = this.calculateEngagementTrends(students);
            
            return result;
        } catch (error) {
            console.error('❌ Failed to get analytics:', error);
            return this.getFallbackAnalyticsData();
        }
    }

    // Assessments Data
    async getAssessments(type = null) {
        if (!this.isInitialized) await this.initialize();
        
        try {
            let assessments = await this.db.read('assessments');
            
            if (type) {
                assessments = assessments.filter(a => a.type === type);
            }
            
            return assessments;
        } catch (error) {
            console.error('❌ Failed to get assessments:', error);
            return this.getFallbackAssessmentsData();
        }
    }

    // Communications Data
    async getCommunications(type = null) {
        if (!this.isInitialized) await this.initialize();
        
        try {
            let communications = await this.db.read('communications');
            
            if (type) {
                communications = communications.filter(c => c.type === type);
            }
            
            // Sort by timestamp (newest first)
            communications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            return communications;
        } catch (error) {
            console.error('❌ Failed to get communications:', error);
            return this.getFallbackCommunicationsData();
        }
    }

    // Workflows Data
    async getWorkflows() {
        if (!this.isInitialized) await this.initialize();
        
        try {
            return await this.db.read('workflows');
        } catch (error) {
            console.error('❌ Failed to get workflows:', error);
            return this.getFallbackWorkflowsData();
        }
    }

    // Reports Data
    async getReports() {
        if (!this.isInitialized) await this.initialize();
        
        try {
            return await this.db.read('reports');
        } catch (error) {
            console.error('❌ Failed to get reports:', error);
            return this.getFallbackReportsData();
        }
    }

    // Integrations Data
    async getIntegrations() {
        if (!this.isInitialized) await this.initialize();
        
        try {
            return await this.db.read('integrations');
        } catch (error) {
            console.error('❌ Failed to get integrations:', error);
            return this.getFallbackIntegrationsData();
        }
    }

    // Security Data
    async getSecurityData() {
        if (!this.isInitialized) await this.initialize();
        
        try {
            const security = await this.db.read('security');
            const result = {};
            security.forEach(item => {
                result[item.type] = item;
            });
            return result;
        } catch (error) {
            console.error('❌ Failed to get security data:', error);
            return this.getFallbackSecurityData();
        }
    }

    // Performance Data
    async getPerformanceData() {
        if (!this.isInitialized) await this.initialize();
        
        try {
            const performance = await this.db.read('performance');
            const result = {};
            performance.forEach(item => {
                result[item.type] = item;
            });
            return result;
        } catch (error) {
            console.error('❌ Failed to get performance data:', error);
            return this.getFallbackPerformanceData();
        }
    }

    // AI Recommendations Data
    async getAIRecommendations() {
        if (!this.isInitialized) await this.initialize();
        
        try {
            return await this.db.read('ai_recommendations');
        } catch (error) {
            console.error('❌ Failed to get AI recommendations:', error);
            return this.getFallbackAIRecommendationsData();
        }
    }

    // Settings Data
    async getSettings() {
        if (!this.isInitialized) await this.initialize();
        
        try {
            const settings = await this.db.read('settings');
            const result = {};
            settings.forEach(setting => {
                if (!result[setting.category]) {
                    result[setting.category] = {};
                }
                result[setting.category][setting.key] = setting.value;
            });
            return result;
        } catch (error) {
            console.error('❌ Failed to get settings:', error);
            return this.getFallbackSettingsData();
        }
    }

    // CRUD Operations
    async createStudent(studentData) {
        if (!this.isInitialized) await this.initialize();
        
        try {
            return await this.db.create('students', studentData);
        } catch (error) {
            console.error('❌ Failed to create student:', error);
            throw error;
        }
    }

    async updateStudent(id, studentData) {
        if (!this.isInitialized) await this.initialize();
        
        try {
            return await this.db.update('students', id, studentData);
        } catch (error) {
            console.error('❌ Failed to update student:', error);
            throw error;
        }
    }

    async deleteStudent(id) {
        if (!this.isInitialized) await this.initialize();
        
        try {
            return await this.db.delete('students', id);
        } catch (error) {
            console.error('❌ Failed to delete student:', error);
            throw error;
        }
    }

    // Helper Methods
    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} days ago`;
        
        return date.toLocaleDateString();
    }

    calculateStudentStats(students) {
        const stats = {
            excellent: 0,
            good: 0,
            average: 0,
            at_risk: 0
        };
        
        students.forEach(student => {
            stats[student.status] = (stats[student.status] || 0) + 1;
        });
        
        return stats;
    }

    calculateEngagementTrends(students) {
        // Calculate engagement trends based on student data
        const totalEngagement = students.reduce((sum, student) => sum + student.engagement_score, 0);
        const averageEngagement = totalEngagement / students.length;
        
        return {
            average: Math.round(averageEngagement),
            trend: '+8%', // This could be calculated based on historical data
            peak_hours: ['09:00', '14:00', '19:00']
        };
    }

    // Fallback data methods (in case database fails)
    getFallbackDashboardData() {
        return {
            totalStudents: 45,
            activeCourses: 8,
            completionRate: 78.5,
            engagementScore: 85.2,
            assignmentsSubmitted: 342,
            averageGrade: 82.3
        };
    }

    getFallbackStudentsData() {
        return [
            {
                id: 1,
                name: "Ahmad Susah",
                email: "ahmad.susah@university.edu",
                studentId: "2021001",
                status: "at-risk",
                progress: 45,
                lastActivity: "2 hours ago"
            }
        ];
    }

    getFallbackAnalyticsData() {
        return {
            learning_pattern: {
                visual_learners: 35,
                auditory_learners: 25,
                kinesthetic_learners: 28,
                reading_writing_learners: 12
            }
        };
    }

    getFallbackAssessmentsData() {
        return [
            {
                id: 1,
                title: "Module 2 Quiz: Data Analytics",
                type: "quiz",
                status: "active"
            }
        ];
    }

    getFallbackCommunicationsData() {
        return [
            {
                id: 1,
                type: "message",
                from: "Ahmad Susah",
                subject: "Question about Assignment 2"
            }
        ];
    }

    getFallbackWorkflowsData() {
        return [
            {
                id: 1,
                name: "Assignment Grading Workflow",
                type: "assignment",
                status: "active"
            }
        ];
    }

    getFallbackReportsData() {
        return [
            {
                id: 1,
                name: "Weekly Progress Summary",
                type: "progress"
            }
        ];
    }

    getFallbackIntegrationsData() {
        return [
            {
                id: 1,
                name: "Google Classroom",
                type: "lms",
                status: "connected"
            }
        ];
    }

    getFallbackSecurityData() {
        return {
            login_activity: {
                successful_logins: 127,
                failed_attempts: 3
            }
        };
    }

    getFallbackPerformanceData() {
        return {
            system_metrics: {
                cpu_usage: 23,
                memory_usage: 67,
                uptime: 99.9
            }
        };
    }

    getFallbackAIRecommendationsData() {
        return [
            {
                id: 1,
                type: "urgent",
                title: "Intervention Needed"
            }
        ];
    }

    getFallbackSettingsData() {
        return {
            profile: {
                full_name: "Dr. Sarah Educator",
                email: "sarah.educator@university.edu"
            }
        };
    }
}

// Global database adapter instance
window.DatabaseAdapter = new DatabaseAdapter();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseAdapter;
}
