export default {
    // General
    appName: 'TaskMaster',

    // Navigation
    nav: {
        calendar: 'Calendar',
        achievements: 'Achievements',
        about: 'About',
        login: 'Login',
        signup: 'Sign Up',
        logout: 'Logout'
    },

    // Home Page
    home: {
        hero: {
            titleStart: 'Master Your Time,',
            titleAccent: 'Achieve More',
            subtitle: 'Streamline your tasks, track your achievements, and boost productivity with our intuitive task management system',
            getStarted: 'Get Started',
            startNow: 'Start Now — It\'s Free'
        },
        features: {
            title: 'Why Choose TaskMaster?',
            subtitle: 'Powerful features to elevate your productivity and help you achieve more every day',
            smartPlanning: 'Smart Planning',
            smartPlanningDesc: 'Organize and manage your tasks with our intuitive calendar interface. Plan your day, week, or month with ease.',
            timeOptimization: 'Time Optimization',
            timeOptimizationDesc: 'Structure your time efficiently with smart task management tools. Prioritize tasks and focus on what matters most.',
            taskTracking: 'Task Tracking',
            taskTrackingDesc: 'Monitor your progress and stay on top of your daily tasks. Never miss a deadline or important commitment again.',
            achievementSystem: 'Achievement System',
            achievementSystemDesc: 'Unlock achievements as you improve your productivity. Track your journey and stay motivated with rewards.'
        },
        cta: {
            title: 'Ready to Optimize Your Time?',
            subtitle: 'Join thousands of users who have transformed their daily productivity with TaskMaster'
        }
    },

    // Calendar Page
    calendar: {
        title: 'Your Calendar',
        subtitle: 'Organize your tasks and boost productivity',
        addTask: 'Add Task',
        filter: 'Filter',
        searchTasks: 'Search tasks...',
        clearFilters: 'Clear Filters',
        categories: 'Categories',
        priority: 'Priority',
        high: 'High',
        medium: 'Medium',
        low: 'Low',
        month: {
            january: 'January',
            february: 'February',
            march: 'March',
            april: 'April',
            may: 'May',
            june: 'June',
            july: 'July',
            august: 'August',
            september: 'September',
            october: 'October',
            november: 'November',
            december: 'December'
        },
        weekdays: {
            mon: 'Mon',
            tue: 'Tue',
            wed: 'Wed',
            thu: 'Thu',
            fri: 'Fri',
            sat: 'Sat',
            sun: 'Sun'
        },
        categoryNames: {
            work: 'Work',
            personal: 'Personal',
            study: 'Study',
            health: 'Health',
            shopping: 'Shopping',
            other: 'Other'
        },
        modal: {
            addTask: 'Add Task',
            editTask: 'Edit Task',
            date: 'Date:',
            taskDescription: 'Task Description:',
            whatToDo: 'What do you need to do?',
            category: 'Category:',
            taskDuration: 'Task Duration:',
            weeks: 'Weeks',
            days: 'Days',
            hours: 'Hours',
            minutes: 'Minutes',
            saveTask: 'Save Task',
            saveChanges: 'Save Changes',
            noTasks: 'No tasks for this day',
            confirmDelete: 'Are you sure you want to delete this task?'
        },
        achievements: {
            unlocked: 'Achievement Unlocked!',
            beginner: 'First Step (Complete your first task)',
            productiveDay: 'Productive Day (Complete 5 tasks in one day)',
            earlyBird: 'Early Bird (Complete a task before 6 AM)',
            nightOwl: 'Night Owl (Complete a task after midnight)',
            goalOriented: 'Goal Oriented (Complete 10 tasks in a week)',
            weekendWarrior: 'Weekend Warrior (Complete 5 tasks during weekend)',
            perfectWeek: 'Perfect Week (Complete at least 1 task every day of the week)',
            projectLeader: 'Project Leader (Complete all tasks in a month)',
            timeMaster: 'Time Master (Complete 50 tasks)',
            consistency: 'Consistency King (Complete tasks for 30 days in a row)',
            earlyPlanner: 'Early Planner (Plan tasks a week in advance)',
            speedRunner: 'Speed Runner (Complete 3 tasks within an hour)',
            multitasker: 'Multitasker (Complete tasks in 5 different categories)'
        }
    },

    // Achievements Page
    achievements: {
        title: 'Your Achievements',
        subtitle: 'Track your productivity journey and unlock rewards',
        stats: {
            unlocked: 'Achievements Unlocked',
            totalPoints: 'Total Points',
            streak: 'Achievements Streak',
        },
        search: 'Search achievements...',
        filters: {
            all: 'All',
            unlocked: 'Unlocked',
            locked: 'Locked'
        },
        categories: {
            daily: 'Daily Excellence',
            weekly: 'Weekly Milestones',
            monthly: 'Monthly Mastery',
            special: 'Special Achievements'
        },
        status: {
            unlocked: 'Unlocked',
            locked: 'Locked',
            secret: 'Secret',
        },
        empty: {
            title: 'No achievements found',
            subtitle: 'Try adjusting your search or filter criteria',
            reset: 'Reset Filters'
        }
    },

    // Auth Page
    auth: {
        login: {
            title: 'Welcome Back',
            subtitle: 'Log in to your account to continue',
            email: 'Email',
            password: 'Password',
            rememberMe: 'Remember me',
            forgotPassword: 'Forgot password?',
            noAccount: 'Don\'t have an account?',
            signUp: 'Sign Up',
            continueWith: 'or continue with'
        },
        register: {
            title: 'Create Account',
            subtitle: 'Join TaskMaster to boost your productivity',
            fullName: 'Full Name',
            email: 'Email',
            password: 'Password',
            confirmPassword: 'Confirm Password',
            createPassword: 'Create a password',
            confirmYourPassword: 'Confirm your password',
            agreeTerms: 'I agree to the',
            termsService: 'Terms of Service',
            and: 'and',
            privacyPolicy: 'Privacy Policy',
            alreadyAccount: 'Already have an account?',
            logIn: 'Log In',
            signUpWith: 'or sign up with'
        },
        validation: {
            required: '{field} is required',
            validEmail: 'Please enter a valid email address',
            minLength: '{field} must be at least {length} characters',
            passwordsMatch: 'Passwords do not match',
            weakPassword: 'Password is too weak',
            agreeTerms: 'You must agree to the Terms and Privacy Policy'
        },
        passwordStrength: {
            weak: 'Weak',
            fair: 'Fair',
            good: 'Good',
            strong: 'Strong',
            veryStrong: 'Very Strong'
        }
    },

    //About Page
    about: {
        titleStart: 'About us',
        titleAccent: 'TaskMaster',
        description: 'TaskMaster is a powerful task management tool designed to help you optimize your time and boost productivity. With features like smart planning, task tracking, and an achievement system, TaskMaster empowers you to take control of your tasks and achieve more every day. Whether you\'re managing personal projects or professional commitments, TaskMaster is here to support your journey towards success.',
        OurTeam: 'Meet the Team',
        team1: 'Danils Makarovs - Morale Support',
        team2: 'Deniska Ustinovičš - Fullstack Developer',
        team3: 'Rolands Kalniņš - Designer',
        team: {
            subtitle: 'We are a team of passionate individuals dedicated to helping you achieve your goals. Our mission is to provide you with the best tools and resources to optimize your time and boost your productivity.',
            text1: "He has a lot of experience in providing moral assistance. Without moral support, our team couldn't have done well.",
            text2: '10 years experience, the most valuable asset on any team. Also knows how to cook.',
            text3: "There's nothing to say, just that he's the best."
        },
        cta: {
            title: 'Wanna try it out?',
            subtitle: 'Then join us and start your productivity journey today!',
        },
    },

    // Language Selection
    language: {
        select: 'Language',
        en: 'English',
        ru: 'Русский',
        lv: 'Latviešu'
    }
};