// Data Seeder untuk AgenticLearn Database
// Mengisi database dengan data dummy yang realistic

class DataSeeder {
    constructor(db) {
        this.db = db;
    }

    // Seed all data
    async seedAll() {
        console.log('🌱 Starting database seeding...');
        
        try {
            await this.seedStudents();
            await this.seedDashboardMetrics();
            await this.seedAnalytics();
            await this.seedAssessments();
            await this.seedCommunications();
            await this.seedWorkflows();
            await this.seedReports();
            await this.seedIntegrations();
            await this.seedSecurity();
            await this.seedPerformance();
            await this.seedAIRecommendations();
            await this.seedSettings();
            
            console.log('✅ Database seeding completed successfully!');
            return true;
        } catch (error) {
            console.error('❌ Database seeding failed:', error);
            return false;
        }
    }

    // Check if data already exists
    async needsSeeding() {
        const studentCount = await this.db.count('students');
        return studentCount === 0;
    }

    // Seed Students Data
    async seedStudents() {
        const students = [
            {
                name: "Ahmad Susah",
                email: "ahmad.susah@university.edu",
                student_id: "2021001",
                status: "at-risk",
                progress: 45,
                last_activity: "2024-12-18T10:30:00Z",
                courses_enrolled: 3,
                assignments_completed: 12,
                assignments_pending: 8,
                average_grade: 65.5,
                attendance_rate: 78,
                engagement_score: 42,
                learning_style: "Visual",
                preferred_time: "Evening",
                notes: "Struggling with advanced concepts, needs additional support"
            },
            {
                name: "Maya Rajin",
                email: "maya.rajin@university.edu", 
                student_id: "2021002",
                status: "excellent",
                progress: 95,
                last_activity: "2024-12-20T14:15:00Z",
                courses_enrolled: 4,
                assignments_completed: 28,
                assignments_pending: 2,
                average_grade: 92.3,
                attendance_rate: 98,
                engagement_score: 96,
                learning_style: "Kinesthetic",
                preferred_time: "Morning",
                notes: "Outstanding performance, potential for advanced projects"
            },
            {
                name: "Lisa Cerdik",
                email: "lisa.cerdik@university.edu",
                student_id: "2021003", 
                status: "at-risk",
                progress: 38,
                last_activity: "2024-12-17T09:45:00Z",
                courses_enrolled: 3,
                assignments_completed: 8,
                assignments_pending: 12,
                average_grade: 58.2,
                attendance_rate: 65,
                engagement_score: 35,
                learning_style: "Auditory",
                preferred_time: "Afternoon",
                notes: "Frequent absences affecting performance"
            },
            {
                name: "Budi Tekun",
                email: "budi.tekun@university.edu",
                student_id: "2021004",
                status: "good",
                progress: 78,
                last_activity: "2024-12-20T11:20:00Z",
                courses_enrolled: 3,
                assignments_completed: 22,
                assignments_pending: 3,
                average_grade: 81.7,
                attendance_rate: 89,
                engagement_score: 82,
                learning_style: "Reading/Writing",
                preferred_time: "Morning",
                notes: "Consistent performer, good participation"
            },
            {
                name: "Sari Pintar",
                email: "sari.pintar@university.edu",
                student_id: "2021005",
                status: "excellent",
                progress: 88,
                last_activity: "2024-12-20T16:30:00Z",
                courses_enrolled: 4,
                assignments_completed: 26,
                assignments_pending: 1,
                average_grade: 89.4,
                attendance_rate: 94,
                engagement_score: 91,
                learning_style: "Visual",
                preferred_time: "Evening",
                notes: "Strong analytical skills, helps other students"
            }
        ];

        // Add more students to reach realistic numbers
        for (let i = 6; i <= 45; i++) {
            const statuses = ['excellent', 'good', 'average', 'at-risk'];
            const learningStyles = ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing'];
            const times = ['Morning', 'Afternoon', 'Evening'];
            
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const progress = status === 'excellent' ? 85 + Math.random() * 15 :
                           status === 'good' ? 70 + Math.random() * 15 :
                           status === 'average' ? 55 + Math.random() * 15 :
                           30 + Math.random() * 25;

            students.push({
                name: `Student ${i}`,
                email: `student${i}@university.edu`,
                student_id: `2021${String(i).padStart(3, '0')}`,
                status: status,
                progress: Math.round(progress),
                last_activity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                courses_enrolled: 3 + Math.floor(Math.random() * 2),
                assignments_completed: Math.floor(progress / 5),
                assignments_pending: Math.floor((100 - progress) / 10),
                average_grade: progress * 0.9 + Math.random() * 10,
                attendance_rate: Math.max(50, progress + Math.random() * 20 - 10),
                engagement_score: Math.max(30, progress + Math.random() * 20 - 10),
                learning_style: learningStyles[Math.floor(Math.random() * learningStyles.length)],
                preferred_time: times[Math.floor(Math.random() * times.length)],
                notes: `Auto-generated student profile ${i}`
            });
        }

        await this.db.bulkCreate('students', students);
        console.log('✅ Students data seeded');
    }

    // Seed Dashboard Metrics
    async seedDashboardMetrics() {
        const metrics = [
            {
                type: 'total_students',
                value: 45,
                label: 'Total Students',
                trend: '+5%',
                period: 'this_month'
            },
            {
                type: 'active_courses',
                value: 8,
                label: 'Active Courses', 
                trend: '+2',
                period: 'this_semester'
            },
            {
                type: 'completion_rate',
                value: 78.5,
                label: 'Completion Rate',
                trend: '+12%',
                period: 'this_month'
            },
            {
                type: 'engagement_score',
                value: 85.2,
                label: 'Engagement Score',
                trend: '+8%',
                period: 'this_week'
            },
            {
                type: 'assignments_submitted',
                value: 342,
                label: 'Assignments Submitted',
                trend: '+23',
                period: 'this_week'
            },
            {
                type: 'average_grade',
                value: 82.3,
                label: 'Average Grade',
                trend: '+3.2%',
                period: 'this_month'
            }
        ];

        await this.db.bulkCreate('dashboard_metrics', metrics);
        console.log('✅ Dashboard metrics seeded');
    }

    // Seed Analytics Data
    async seedAnalytics() {
        const analytics = [
            {
                type: 'learning_pattern',
                data: {
                    visual_learners: 35,
                    auditory_learners: 25,
                    kinesthetic_learners: 28,
                    reading_writing_learners: 12
                },
                period: 'current_semester'
            },
            {
                type: 'engagement_trends',
                data: {
                    daily_active_users: [32, 38, 42, 35, 41, 39, 28],
                    peak_hours: ['09:00', '14:00', '19:00'],
                    low_engagement_days: ['Sunday', 'Saturday']
                },
                period: 'last_week'
            },
            {
                type: 'performance_distribution',
                data: {
                    excellent: 18,
                    good: 15,
                    average: 8,
                    at_risk: 4
                },
                period: 'current_semester'
            }
        ];

        await this.db.bulkCreate('analytics', analytics);
        console.log('✅ Analytics data seeded');
    }

    // Continue with other seed methods...
    async seedAssessments() {
        const assessments = [
            {
                title: "Module 2 Quiz: Data Analytics",
                type: "quiz",
                status: "active",
                deadline: "2024-12-20T23:59:00Z",
                duration: 30,
                questions_count: 15,
                submissions: 32,
                total_students: 45,
                average_score: 82.5,
                average_time: 24,
                difficulty_analysis: {
                    easy: 5,
                    medium: 8,
                    hard: 2
                }
            },
            {
                title: "Assignment: Machine Learning Project", 
                type: "assignment",
                status: "active",
                deadline: "2024-12-25T23:59:00Z",
                duration: 14 * 24 * 60, // 2 weeks in minutes
                submissions: 18,
                total_students: 45,
                progress: 40,
                at_risk_students: 7
            },
            {
                title: "Module 1 Quiz: Introduction to Data Science",
                type: "quiz", 
                status: "completed",
                deadline: "2024-12-10T23:59:00Z",
                duration: 25,
                questions_count: 12,
                submissions: 45,
                total_students: 45,
                average_score: 85.2,
                completion_rate: 100
            }
        ];

        await this.db.bulkCreate('assessments', assessments);
        console.log('✅ Assessments data seeded');
    }

    async seedCommunications() {
        const communications = [
            {
                type: "message",
                from: "Ahmad Susah",
                subject: "Question about Assignment 2",
                content: "Hi Prof, I'm having trouble understanding the machine learning concepts in assignment 2. Could you please provide some additional resources?",
                timestamp: "2024-12-20T10:30:00Z",
                status: "unread",
                priority: "medium"
            },
            {
                type: "announcement",
                title: "Class Schedule Change",
                content: "Please note that tomorrow's class has been moved to 2 PM due to technical maintenance.",
                timestamp: "2024-12-19T15:45:00Z",
                status: "published",
                priority: "high"
            },
            {
                type: "message",
                from: "Maya Rajin", 
                subject: "Extra Credit Opportunity",
                content: "Professor, I'm interested in taking on additional projects. Are there any extra credit opportunities available?",
                timestamp: "2024-12-18T14:20:00Z",
                status: "read",
                priority: "low"
            }
        ];

        await this.db.bulkCreate('communications', communications);
        console.log('✅ Communications data seeded');
    }

    // Add more seed methods for other entities...
    async seedWorkflows() {
        const workflows = [
            {
                name: "Assignment Grading Workflow",
                type: "assignment",
                status: "active",
                trigger_count: 156,
                success_rate: 94.2,
                last_run: "2024-12-20T08:30:00Z",
                automation_rate: 87
            },
            {
                name: "Student Assessment Workflow", 
                type: "assessment",
                status: "active",
                trigger_count: 89,
                success_rate: 96.8,
                last_run: "2024-12-20T12:15:00Z",
                automation_rate: 92
            }
        ];

        await this.db.bulkCreate('workflows', workflows);
        console.log('✅ Workflows data seeded');
    }

    async seedReports() {
        const reports = [
            {
                name: "Weekly Progress Summary",
                type: "progress",
                frequency: "weekly",
                last_generated: "2024-12-20T17:00:00Z",
                size_mb: 2.3,
                format: "excel",
                recipients: ["admin@university.edu"]
            },
            {
                name: "Student Performance Alert",
                type: "alert", 
                frequency: "daily",
                last_generated: "2024-12-20T09:00:00Z",
                size_mb: 0.8,
                format: "pdf",
                recipients: ["instructor@university.edu"]
            }
        ];

        await this.db.bulkCreate('reports', reports);
        console.log('✅ Reports data seeded');
    }

    async seedIntegrations() {
        const integrations = [
            {
                name: "Google Classroom",
                type: "lms",
                status: "connected",
                last_sync: "2024-12-20T14:30:00Z",
                sync_status: "healthy",
                features: ["Assignment sync", "Grade passback", "Student roster sync"]
            },
            {
                name: "Zoom",
                type: "video_conferencing", 
                status: "connected",
                last_sync: "2024-12-20T14:00:00Z",
                sync_status: "healthy",
                features: ["Auto meeting creation", "Attendance tracking", "Recording integration"]
            },
            {
                name: "Moodle",
                type: "lms",
                status: "error",
                last_sync: "2024-12-19T10:15:00Z", 
                sync_status: "failed",
                error: "API rate limit exceeded",
                features: ["Course content sync", "Grade book integration", "User management"]
            }
        ];

        await this.db.bulkCreate('integrations', integrations);
        console.log('✅ Integrations data seeded');
    }

    async seedSecurity() {
        const security = [
            {
                type: "login_activity",
                successful_logins: 127,
                failed_attempts: 3,
                suspicious_activity: 0,
                period: "24h"
            },
            {
                type: "security_score",
                score: "A+",
                confidence: 94.2,
                last_audit: "2024-12-15T10:00:00Z"
            }
        ];

        await this.db.bulkCreate('security', security);
        console.log('✅ Security data seeded');
    }

    async seedPerformance() {
        const performance = [
            {
                type: "system_metrics",
                cpu_usage: 23,
                memory_usage: 67,
                disk_usage: 78,
                uptime: 99.9,
                response_time: 1.2,
                active_users: 847
            },
            {
                type: "user_experience",
                page_load_time: 1.2,
                time_to_interactive: 2.1,
                error_rate: 0.02,
                satisfaction_score: 4.8
            }
        ];

        await this.db.bulkCreate('performance', performance);
        console.log('✅ Performance data seeded');
    }

    async seedAIRecommendations() {
        const recommendations = [
            {
                type: "urgent",
                title: "Intervention Needed",
                description: "3 students (Maya Rajin, Lisa Cerdik, Ahmad Susah) are at high risk of failing",
                confidence: 94.2,
                actions: ["Schedule 1-on-1 sessions", "Provide additional resources", "Set up peer tutoring"],
                priority: "high"
            },
            {
                type: "content_optimization",
                title: "Content Optimization Needed", 
                description: "Module 2 content shows low engagement (45% completion rate)",
                confidence: 87.5,
                actions: ["Add interactive examples", "Break into smaller chunks", "Include video explanations"],
                priority: "medium"
            }
        ];

        await this.db.bulkCreate('ai_recommendations', recommendations);
        console.log('✅ AI Recommendations data seeded');
    }

    async seedSettings() {
        const settings = [
            {
                category: "profile",
                key: "full_name",
                value: "Dr. Sarah Educator"
            },
            {
                category: "profile", 
                key: "email",
                value: "sarah.educator@university.edu"
            },
            {
                category: "preferences",
                key: "theme",
                value: "light"
            },
            {
                category: "preferences",
                key: "language", 
                value: "id"
            },
            {
                category: "notifications",
                key: "email_notifications",
                value: true
            }
        ];

        await this.db.bulkCreate('settings', settings);
        console.log('✅ Settings data seeded');
    }
}

// Global seeder instance
window.DataSeeder = DataSeeder;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataSeeder;
}
