/**
 * AgenticLearn Student Portal - API Client
 * Handles all backend communication for student portal
 * Green computing: Minimal HTTP requests, efficient data handling
 */

import { API_CONFIG } from './config.js';

export class APIClient {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.endpoints = API_CONFIG.ENDPOINTS;
        this.developmentMode = true; // No auth required in development
    }

    /**
     * Make HTTP request to backend
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        // In development mode, don't add auth headers
        if (!this.developmentMode) {
            // Auth headers would be added here in production
            // defaultOptions.headers['Authorization'] = `Bearer ${token}`;
        }

        const requestOptions = { ...defaultOptions, ...options };

        try {
            console.log(`🌐 API Request: ${requestOptions.method} ${url}`);
            
            const response = await fetch(url, requestOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ API Response: ${requestOptions.method} ${url}`, data);
            
            return data;
        } catch (error) {
            console.error(`❌ API Error: ${requestOptions.method} ${url}`, error);
            throw error;
        }
    }

    /**
     * Test backend connection and get student profile
     */
    async testConnection() {
        console.log("🔄 Testing AgenticAI backend connection...");

        if (this.developmentMode) {
            console.log("🔧 Development Mode: Using mock student profile");
            // Return mock student profile for development
            return {
                success: true,
                profile: {
                    name: "Alex Student",
                    email: "alex.student@agenticlearn.edu",
                    role: "student",
                    student_id: "STU001",
                    program: "Computer Science",
                    year: "2nd Year",
                    gpa: 3.5,
                    credits_completed: 45,
                    learning_style: "Visual",
                    study_time: "Morning",
                    notifications: true,
                    phone: "+1 (555) 987-6543",
                    date_of_birth: "2002-05-15",
                    bio: "Passionate computer science student interested in AI and machine learning."
                }
            };
        }

        console.log("🔗 Testing profile endpoint:", `${this.baseURL}${this.endpoints.STUDENT_PROFILE}`);

        // Get real profile data from backend
        const profileResponse = await this.request(this.endpoints.STUDENT_PROFILE);
        console.log("📥 Profile response:", profileResponse);

        if (profileResponse && profileResponse.success && profileResponse.profile) {
            console.log("✅ AgenticAI backend connection successful!");
            return {
                success: true,
                profile: profileResponse.profile
            };
        } else {
            console.error("❌ AgenticAI backend response invalid:", profileResponse);
            throw new Error("Backend connection failed - no fallback allowed per Green Computing principles");
        }
    }

    /**
     * Get student profile
     */
    async getProfile() {
        return this.request(this.endpoints.STUDENT_PROFILE);
    }

    /**
     * Update student profile
     */
    async updateProfile(profileData) {
        return this.request(this.endpoints.STUDENT_PROFILE, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    /**
     * Get student dashboard data
     */
    async getDashboardData() {
        if (this.developmentMode) {
            return {
                success: true,
                data: {
                    overview: {
                        totalCourses: 4,
                        activeCourses: 3,
                        completedAssignments: 12,
                        pendingAssignments: 3,
                        overallProgress: 75,
                        currentGPA: 3.5
                    },
                    recentActivity: [
                        { icon: '📝', title: 'Submitted Assignment 3', time: '2 hours ago' },
                        { icon: '📚', title: 'Completed Chapter 5 Reading', time: '1 day ago' },
                        { icon: '🎯', title: 'Achieved 90% in Quiz 2', time: '2 days ago' }
                    ],
                    upcomingDeadlines: [
                        { date: 'Jan 20', title: 'Programming Project', course: 'CS101', priority: 'high' },
                        { date: 'Jan 22', title: 'Math Problem Set', course: 'MATH201', priority: 'medium' }
                    ],
                    achievements: [
                        { icon: '🏆', title: 'Perfect Attendance', description: 'Attended all classes this month' },
                        { icon: '⭐', title: 'Top Performer', description: 'Scored highest in midterm exam' }
                    ],
                    recommendations: [
                        { title: 'Review Calculus Concepts', description: 'Based on your recent quiz performance', actionText: 'Start Review' },
                        { title: 'Join Study Group', description: 'Connect with classmates for collaborative learning', actionText: 'Find Groups' }
                    ]
                }
            };
        }
        return this.request(this.endpoints.STUDENT_DASHBOARD);
    }

    /**
     * Get student courses
     */
    async getCourses() {
        if (this.developmentMode) {
            return {
                success: true,
                courses: [
                    {
                        id: 'cs101',
                        name: 'Introduction to Computer Science',
                        code: 'CS101',
                        instructor: 'Dr. Sarah Johnson',
                        progress: 75,
                        status: 'active',
                        nextClass: '2024-01-15 10:00',
                        description: 'Fundamentals of programming and computational thinking'
                    },
                    {
                        id: 'math201',
                        name: 'Calculus II',
                        code: 'MATH201',
                        instructor: 'Prof. Michael Chen',
                        progress: 60,
                        status: 'active',
                        nextClass: '2024-01-16 14:00',
                        description: 'Advanced calculus concepts and applications'
                    },
                    {
                        id: 'phys101',
                        name: 'Physics I',
                        code: 'PHYS101',
                        instructor: 'Dr. Emily Rodriguez',
                        progress: 85,
                        status: 'active',
                        nextClass: '2024-01-17 09:00',
                        description: 'Classical mechanics and thermodynamics'
                    }
                ]
            };
        }
        return this.request(this.endpoints.STUDENT_COURSES);
    }

    /**
     * Get course details
     */
    async getCourseDetails(courseId) {
        return this.request(`${this.endpoints.STUDENT_COURSES}/${courseId}`);
    }

    /**
     * Get student assignments
     */
    async getAssignments() {
        if (this.developmentMode) {
            return {
                success: true,
                assignments: [
                    {
                        id: 'assign1',
                        title: 'Programming Project 1',
                        course: 'CS101',
                        dueDate: '2024-01-20',
                        status: 'pending',
                        priority: 'high',
                        description: 'Create a simple calculator application using Python',
                        points: 100
                    },
                    {
                        id: 'assign2',
                        title: 'Calculus Problem Set 3',
                        course: 'MATH201',
                        dueDate: '2024-01-18',
                        status: 'submitted',
                        priority: 'medium',
                        description: 'Solve integration problems from Chapter 7',
                        points: 50
                    },
                    {
                        id: 'assign3',
                        title: 'Physics Lab Report',
                        course: 'PHYS101',
                        dueDate: '2024-01-25',
                        status: 'pending',
                        priority: 'medium',
                        description: 'Write lab report on pendulum motion experiment',
                        points: 75
                    }
                ]
            };
        }
        return this.request(this.endpoints.STUDENT_ASSIGNMENTS);
    }

    /**
     * Submit assignment
     */
    async submitAssignment(assignmentId, submissionData) {
        return this.request(`${this.endpoints.STUDENT_ASSIGNMENTS}/${assignmentId}/submit`, {
            method: 'POST',
            body: JSON.stringify(submissionData)
        });
    }

    /**
     * Get student grades
     */
    async getGrades() {
        if (this.developmentMode) {
            return {
                success: true,
                grades: [
                    {
                        course: 'CS101',
                        courseName: 'Introduction to Computer Science',
                        assignments: [
                            { name: 'Assignment 1', score: 85, maxScore: 100, weight: 20 },
                            { name: 'Midterm Exam', score: 78, maxScore: 100, weight: 30 },
                            { name: 'Final Project', score: 92, maxScore: 100, weight: 50 }
                        ],
                        currentGrade: 'B+',
                        gpa: 3.3
                    },
                    {
                        course: 'MATH201',
                        courseName: 'Calculus II',
                        assignments: [
                            { name: 'Problem Set 1', score: 90, maxScore: 100, weight: 25 },
                            { name: 'Problem Set 2', score: 88, maxScore: 100, weight: 25 },
                            { name: 'Midterm', score: 82, maxScore: 100, weight: 50 }
                        ],
                        currentGrade: 'A-',
                        gpa: 3.7
                    },
                    {
                        course: 'PHYS101',
                        courseName: 'Physics I',
                        assignments: [
                            { name: 'Lab Report 1', score: 95, maxScore: 100, weight: 30 },
                            { name: 'Quiz 1', score: 87, maxScore: 100, weight: 20 },
                            { name: 'Midterm', score: 91, maxScore: 100, weight: 50 }
                        ],
                        currentGrade: 'A',
                        gpa: 4.0
                    }
                ],
                gpa: {
                    current: 3.7,
                    cumulative: 3.5,
                    credits: 45,
                    trend: 'up'
                }
            };
        }
        return this.request(this.endpoints.STUDENT_GRADES);
    }

    /**
     * Get learning progress
     */
    async getProgress() {
        return this.request(this.endpoints.STUDENT_PROGRESS);
    }

    /**
     * Get messages/communications
     */
    async getMessages() {
        return this.request(this.endpoints.STUDENT_MESSAGES);
    }

    /**
     * Send message to educator
     */
    async sendMessage(messageData) {
        return this.request(this.endpoints.STUDENT_MESSAGES, {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
    }

    /**
     * Get announcements
     */
    async getAnnouncements() {
        return this.request(this.endpoints.STUDENT_ANNOUNCEMENTS);
    }

    /**
     * Get AI tutor recommendations
     */
    async getAIRecommendations() {
        return this.request(this.endpoints.STUDENT_AI_TUTOR);
    }

    /**
     * Get study plan
     */
    async getStudyPlan() {
        return this.request(this.endpoints.STUDENT_STUDY_PLAN);
    }

    /**
     * Update study plan
     */
    async updateStudyPlan(planData) {
        return this.request(this.endpoints.STUDENT_STUDY_PLAN, {
            method: 'PUT',
            body: JSON.stringify(planData)
        });
    }

    /**
     * Get learning resources
     */
    async getResources() {
        return this.request(this.endpoints.STUDENT_RESOURCES);
    }

    /**
     * Track learning activity
     */
    async trackActivity(activityData) {
        return this.request(this.endpoints.STUDENT_ACTIVITY, {
            method: 'POST',
            body: JSON.stringify(activityData)
        });
    }

    /**
     * Get learning analytics
     */
    async getAnalytics() {
        return this.request(this.endpoints.STUDENT_ANALYTICS);
    }
}
