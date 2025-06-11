// Database Population Script for AgenticLearn
// This script will populate the database with realistic dummy data

const API_BASE = 'https://asia-southeast2-agenticai-462517.cloudfunctions.net/domyid/api/agenticlearn';

// Sample data structures
const sampleCourses = [
    {
        title: "Digital Business Fundamentals",
        description: "Comprehensive course covering digital transformation, e-commerce basics, online marketing, and digital tools for Indonesian businesses",
        duration: 8,
        level: "beginner",
        status: "active"
    },
    {
        title: "Advanced Digital Marketing",
        description: "Deep dive into SEO, SEM, social media marketing, content strategy, and analytics for business growth",
        duration: 12,
        level: "intermediate", 
        status: "active"
    },
    {
        title: "E-commerce Business Development",
        description: "Build and scale your online business with marketplace strategies, customer acquisition, and retention techniques",
        duration: 16,
        level: "advanced",
        status: "active"
    }
];

const sampleModules = [
    {
        title: "Digital Literacy Essentials",
        description: "Foundation digital skills for business professionals",
        order: 1,
        duration: 2,
        lessons: [
            {
                title: "Introduction to Digital Tools",
                content: "Overview of essential digital tools for business",
                type: "video",
                duration: 30,
                order: 1
            },
            {
                title: "Email and Communication",
                content: "Professional email management and digital communication",
                type: "interactive",
                duration: 45,
                order: 2
            },
            {
                title: "File Management and Cloud Storage",
                content: "Organizing digital files and using cloud storage effectively",
                type: "practical",
                duration: 60,
                order: 3
            }
        ]
    },
    {
        title: "E-commerce Basics",
        description: "Understanding online business fundamentals",
        order: 2,
        duration: 3,
        lessons: [
            {
                title: "Introduction to E-commerce",
                content: "What is e-commerce and its benefits for business",
                type: "video",
                duration: 40,
                order: 1
            },
            {
                title: "Choosing the Right Platform",
                content: "Comparing different e-commerce platforms and marketplaces",
                type: "comparison",
                duration: 50,
                order: 2
            },
            {
                title: "Setting Up Your Online Store",
                content: "Step-by-step guide to creating your first online store",
                type: "hands-on",
                duration: 90,
                order: 3
            }
        ]
    }
];

const sampleProgress = [
    {
        student_id: "sample_student_1",
        course_id: "course_1",
        current_module: 1,
        current_lesson: 3,
        completed_lessons: ["lesson_1", "lesson_2"],
        progress_percentage: 35,
        completed_lessons_count: 2,
        total_lessons: 6,
        last_accessed_at: new Date().toISOString()
    }
];

const sampleAssessments = [
    {
        category: "digital_skills",
        questions: [
            {
                id: "ds_1",
                question: "How comfortable are you with using email for business communication?",
                type: "scale",
                options: ["1 - Not comfortable", "2 - Slightly comfortable", "3 - Moderately comfortable", "4 - Very comfortable", "5 - Extremely comfortable"],
                category: "digital_skills"
            },
            {
                id: "ds_2", 
                question: "Have you ever created or managed a social media account for business purposes?",
                type: "multiple_choice",
                options: ["Never", "Once or twice", "Occasionally", "Regularly", "I manage multiple business accounts"],
                category: "digital_skills"
            },
            {
                id: "ds_3",
                question: "How would you rate your ability to use online tools for file sharing and collaboration?",
                type: "scale",
                options: ["1 - No experience", "2 - Basic", "3 - Intermediate", "4 - Advanced", "5 - Expert"],
                category: "digital_skills"
            }
        ]
    },
    {
        category: "learning_style",
        questions: [
            {
                id: "ls_1",
                question: "I learn best when I can:",
                type: "multiple_choice",
                options: ["See visual examples and diagrams", "Listen to explanations and discussions", "Practice hands-on activities", "Read detailed instructions"],
                category: "learning_style"
            },
            {
                id: "ls_2",
                question: "When learning something new, I prefer to:",
                type: "multiple_choice", 
                options: ["Start with theory then practice", "Jump right into practice", "Learn with others in groups", "Study independently at my own pace"],
                category: "learning_style"
            }
        ]
    }
];

const sampleGoals = [
    {
        student_id: "sample_student_1",
        title: "Complete Digital Business Fundamentals Course",
        description: "Finish all modules and achieve 80% score in final assessment",
        target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        progress: 35,
        status: "in_progress",
        milestones: [
            {
                title: "Complete Module 1: Digital Literacy",
                target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                status: "in_progress"
            },
            {
                title: "Complete Module 2: E-commerce Basics", 
                target_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                status: "pending"
            }
        ]
    }
];

const sampleRecommendations = [
    {
        student_id: "sample_student_1",
        title: "Digital Marketing Fundamentals",
        description: "Based on your progress in Digital Business, we recommend starting with marketing basics to build a strong foundation.",
        type: "course_recommendation",
        priority: "high",
        reason: "Complements current learning path"
    },
    {
        student_id: "sample_student_1", 
        title: "E-commerce Platform Setup",
        description: "Your learning style suggests hands-on practice. Try setting up an online store to apply your digital business knowledge.",
        type: "practical_exercise",
        priority: "medium",
        reason: "Matches kinesthetic learning preference"
    },
    {
        student_id: "sample_student_1",
        title: "Social Media Strategy",
        description: "Complete your digital business toolkit by learning how to leverage social media for business growth.",
        type: "skill_development",
        priority: "medium", 
        reason: "Fills knowledge gap in digital marketing"
    }
];

// Function to populate database
async function populateDatabase() {
    console.log('🔄 Starting database population...');
    
    try {
        // Initialize content
        const initResponse = await fetch(`${API_BASE}/content/initialize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (initResponse.ok) {
            const initData = await initResponse.json();
            console.log('✅ Database initialized:', initData);
        } else {
            console.warn('⚠️ Database initialization failed');
        }
        
        console.log('✅ Database population completed');
        return true;
        
    } catch (error) {
        console.error('❌ Database population failed:', error);
        return false;
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        populateDatabase,
        sampleCourses,
        sampleModules,
        sampleProgress,
        sampleAssessments,
        sampleGoals,
        sampleRecommendations
    };
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    window.populateDatabase = populateDatabase;
    console.log('✅ Database population script loaded');
}
