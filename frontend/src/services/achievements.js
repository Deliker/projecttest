// achievements.js - service for managing achievements in TaskMaster application
import apiService from './api';
import auth from './auth';

// Define all available achievements
export const achievementsList = [
    // Daily achievements
    {
        id: 'beginner',
        category: 'daily',
        title: 'First Step',
        description: 'Complete your first task',
        icon: '🎯',
        requirement: 1,
        points: 10
    },
    {
        id: 'productive_day',
        category: 'daily',
        title: 'Productive Day',
        description: 'Complete 5 tasks in one day',
        icon: '⭐',
        requirement: 5,
        points: 25
    },
    {
        id: 'super_productive_day',
        category: 'daily',
        title: 'Super Productive Day',
        description: 'Complete 10 tasks in one day',
        icon: '🌟',
        requirement: 10,
        points: 50,
        secret: true
    },
    {
        id: 'early_bird',
        category: 'daily',
        title: 'Early Bird',
        description: 'Complete a task before 6 AM',
        icon: '🌅',
        requirement: 1,
        points: 30
    },
    {
        id: 'night_owl',
        category: 'daily',
        title: 'Night Owl',
        description: 'Complete a task after midnight',
        icon: '🌙',
        requirement: 1,
        points: 30
    },

    // Weekly achievements
    {
        id: 'goal_oriented',
        category: 'weekly',
        title: 'Goal Oriented',
        description: 'Complete 10 tasks in a week',
        icon: '🎯',
        requirement: 10,
        points: 50
    },
    {
        id: 'weekend_warrior',
        category: 'weekly',
        title: 'Weekend Warrior',
        description: 'Complete 5 tasks during weekend',
        icon: '💪',
        requirement: 5,
        points: 40
    },
    {
        id: 'perfect_week',
        category: 'weekly',
        title: 'Perfect Week',
        description: 'Complete at least 1 task every day of the week',
        icon: '✨',
        requirement: 7,
        points: 70
    },

    // Monthly achievements
    {
        id: 'project_leader',
        category: 'monthly',
        title: 'Project Leader',
        description: 'Complete all tasks in a month',
        icon: '👑',
        requirement: 'all',
        points: 100
    },
    {
        id: 'time_master',
        category: 'monthly',
        title: 'Time Master',
        description: 'Complete 50 tasks',
        icon: '⌛',
        requirement: 50,
        points: 150
    },
    {
        id: 'consistency',
        category: 'monthly',
        title: 'Consistency King',
        description: 'Complete tasks for 30 days in a row',
        icon: '📈',
        requirement: 30,
        points: 200
    },

    // Special achievements
    {
        id: 'early_planner',
        category: 'special',
        title: 'Early Planner',
        description: 'Plan tasks a week in advance',
        icon: '📅',
        requirement: 7,
        points: 40
    },
    {
        id: 'speed_runner',
        category: 'special',
        title: 'Speed Runner',
        description: 'Complete 3 tasks within an hour',
        icon: '⚡',
        requirement: 3,
        points: 30
    },
    {
        id: 'multitasker',
        category: 'special',
        title: 'Multitasker',
        description: 'Complete tasks in 5 different categories',
        icon: '🎭',
        requirement: 5,
        points: 50
    },
    {
        id: 'organization_master',
        category: 'special',
        title: 'Organization Master',
        description: 'Categorize 20 tasks',
        icon: '📊',
        requirement: 20,
        points: 40
    },
    {
        id: 'priority_expert',
        category: 'special',
        title: 'Priority Expert',
        description: 'Complete 10 high-priority tasks',
        icon: '🔥',
        requirement: 10,
        points: 60,
        secret: true
    }
];

// Achievement categories
export const achievementCategories = [
    { id: 'daily', name: 'Daily Excellence', description: 'Achievements for daily productivity', icon: '📆' },
    { id: 'weekly', name: 'Weekly Milestones', description: 'Achievements for weekly consistency', icon: '📅' },
    { id: 'monthly', name: 'Monthly Mastery', description: 'Long-term achievements', icon: '📈' },
    { id: 'special', name: 'Special Achievements', description: 'Unique productivity milestones', icon: '🏆' }
];

// Class for managing achievements and progress
class AchievementsService {
    constructor() {
        // Initialize properties
        this.unlockedAchievements = new Set();
        this.achievementsProgress = {};
        this.stats = {
            totalTasksCompleted: 0,
            totalPoints: 0,
            dailyTaskCounts: {},
            streak: 0,
            lastCompletionDate: null,
            categoriesUsed: new Set(),
            completedTasksByPriority: { high: 0, medium: 0, low: 0 },
            weeklyTasks: 0,
            tasksCompletedByDay: [0, 0, 0, 0, 0, 0, 0],
            lastWeekReset: null
        };
        this.recentCompletions = [];
        this.currentUserId = null;

        // Set up event listeners
        this.initEventListeners();

        // Check if we need to reset weekly stats
        this.checkWeeklyReset();

        // Load achievements if a user is already logged in
        if (this.getCurrentUserId()) {
            this.loadState();
        }
    }

    // Get current user ID from auth service
    getCurrentUserId() {
        if (auth && auth.state && auth.state.userId) {
            return auth.state.userId;
        }
        return null;
    }

    // Generate user-specific keys for localStorage
    getUserStorageKey(baseKey) {
        const userId = this.getCurrentUserId();
        if (!userId) return null;
        return `user_${userId}_${baseKey}`;
    }

    // Load achievements state
    async loadState() {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn('No user ID available, cannot load achievements');
            return;
        }

        this.currentUserId = userId;

        try {
            // First attempt to load from API
            const achievementsFromApi = await this.loadAchievementsFromApi(userId);

            if (achievementsFromApi) {
                console.log('Loaded achievements from API for user:', userId);
                return;
            }

            // Fallback to localStorage if API fails
            this.loadFromLocalStorage(userId);
        } catch (error) {
            console.error('Error loading achievements:', error);
            // Fallback to localStorage if API fails
            this.loadFromLocalStorage(userId);
        }
    }

    // Load achievements from API
    async loadAchievementsFromApi(userId) {
        try {
            // Get all achievements for user
            const achievementsResponse = await apiService.getAllAchievements(userId);
            if (!achievementsResponse || !achievementsResponse.data) {
                return false;
            }

            // Transform API data to local format
            const achievements = achievementsResponse.data;
            this.unlockedAchievements = new Set(achievements.map(a => a.achievementId));

            // Get achievement stats
            const statsResponse = await apiService.getAchievementStats(userId);
            if (statsResponse && statsResponse.data) {
                const apiStats = statsResponse.data;

                // Update local stats from API data
                this.stats.totalPoints = apiStats.totalPoints || 0;
                this.stats.unlockedCount = apiStats.unlockedCount || 0;
                this.stats.progressPercentage = apiStats.progressPercentage || 0;
            }

            console.log("Loaded achievement state from API:", {
                unlockedCount: this.unlockedAchievements.size,
                stats: this.stats
            });

            return true;
        } catch (error) {
            console.error('Failed to load achievements from API:', error);
            return false;
        }
    }

    // Load achievements from localStorage (fallback)
    loadFromLocalStorage(userId) {
        try {
            // Use user-specific keys for localStorage
            const achievementsKey = this.getUserStorageKey('achievements');
            const progressKey = this.getUserStorageKey('achievementsProgress');
            const statsKey = this.getUserStorageKey('achievementStats');

            if (!achievementsKey || !progressKey || !statsKey) {
                return;
            }

            // Load unlocked achievements
            const unlockedAchievements = JSON.parse(localStorage.getItem(achievementsKey) || '[]');
            this.unlockedAchievements = new Set(unlockedAchievements);

            // Load achievements progress
            this.achievementsProgress = JSON.parse(localStorage.getItem(progressKey) || '{}');

            // Load general statistics data
            const savedStats = JSON.parse(localStorage.getItem(statsKey) || '{}');

            // Convert categories array to Set for proper tracking
            const categoriesUsed = Array.isArray(savedStats.categoriesUsed)
                ? new Set(savedStats.categoriesUsed)
                : new Set();

            // Combine saved data with defaults
            this.stats = {
                totalTasksCompleted: savedStats.totalTasksCompleted || 0,
                totalPoints: savedStats.totalPoints || 0,
                dailyTaskCounts: savedStats.dailyTaskCounts || {},
                streak: savedStats.streak || 0,
                lastCompletionDate: savedStats.lastCompletionDate,
                categoriesUsed: categoriesUsed,
                completedTasksByPriority: savedStats.completedTasksByPriority || { high: 0, medium: 0, low: 0 },
                weeklyTasks: savedStats.weeklyTasks || 0,
                tasksCompletedByDay: savedStats.tasksCompletedByDay || [0, 0, 0, 0, 0, 0, 0],
                lastWeekReset: savedStats.lastWeekReset || null
            };

            console.log("Loaded achievement state from localStorage:", {
                unlockedCount: this.unlockedAchievements.size,
                stats: this.stats
            });
        } catch (error) {
            console.error('Error loading achievements from localStorage:', error);
            // Initialize default values in case of error
            this.resetState();
        }
    }

    // Reset state to default values
    resetState() {
        this.unlockedAchievements = new Set();
        this.achievementsProgress = {};
        this.stats = {
            totalTasksCompleted: 0,
            totalPoints: 0,
            dailyTaskCounts: {},
            streak: 0,
            lastCompletionDate: null,
            categoriesUsed: new Set(),
            completedTasksByPriority: { high: 0, medium: 0, low: 0 },
            weeklyTasks: 0,
            tasksCompletedByDay: [0, 0, 0, 0, 0, 0, 0],
            lastWeekReset: null
        };
        this.recentCompletions = [];
    }

    // Save achievements state
    async saveState() {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn('No user ID available, cannot save achievements');
            return;
        }

        // Save to localStorage as backup
        this.saveToLocalStorage(userId);

        // Also attempt to save to API
        await this.saveToApi(userId);
    }

    // Save achievements to API
    async saveToApi(userId) {
        // Nothing to unlock if unlockedAchievements is empty
        if (this.unlockedAchievements.size === 0) {
            return;
        }

        try {
            // For each unlocked achievement that hasn't been saved to the API yet
            for (const achievementId of this.unlockedAchievements) {
                try {
                    // Check if user already has this achievement
                    const checkResponse = await apiService.checkAchievement(userId, achievementId);
                    const hasAchievement = checkResponse.data?.hasAchievement;

                    // If they don't have it, unlock it via API
                    if (!hasAchievement) {
                        await apiService.unlockAchievement(userId, achievementId);
                        console.log(`Achievement ${achievementId} saved to API for user ${userId}`);
                    }
                } catch (error) {
                    console.error(`Failed to save achievement ${achievementId} to API:`, error);
                }
            }
        } catch (error) {
            console.error('Error saving achievements to API:', error);
        }
    }

    // Save achievements to localStorage (backup)
    saveToLocalStorage(userId) {
        try {
            // Use user-specific keys for localStorage
            const achievementsKey = this.getUserStorageKey('achievements');
            const progressKey = this.getUserStorageKey('achievementsProgress');
            const statsKey = this.getUserStorageKey('achievementStats');

            if (!achievementsKey || !progressKey || !statsKey) {
                return;
            }

            // Convert Set to Array for storage
            const categoriesArray = Array.from(this.stats.categoriesUsed);
            const statsToSave = {
                ...this.stats,
                categoriesUsed: categoriesArray
            };

            // Save to localStorage with user-specific keys
            localStorage.setItem(achievementsKey, JSON.stringify([...this.unlockedAchievements]));
            localStorage.setItem(progressKey, JSON.stringify(this.achievementsProgress));
            localStorage.setItem(statsKey, JSON.stringify(statsToSave));

            console.log("Saved achievement state to localStorage:", {
                unlockedCount: this.unlockedAchievements.size,
                totalPoints: this.stats.totalPoints,
                streak: this.stats.streak
            });
        } catch (error) {
            console.error('Error saving achievements to localStorage:', error);
        }
    }

    // Initialize event listeners
    initEventListeners() {
        // Listen for user login/logout events
        document.addEventListener('user-logged-in', () => {
            this.loadState();
        });

        document.addEventListener('user-logged-out', () => {
            this.resetState();
        });

        // Listen for task completion
        document.addEventListener('task-completed', (event) => {
            console.log('Task completed event received:', event.detail);
            this.trackTaskCompletion(event.detail);
        });

        // Listen for task creation
        document.addEventListener('task-created', (event) => {
            console.log('Task created event received:', event.detail);
            this.trackTaskCreation(event.detail);
        });

        // Add global handler for achievement testing (for development)
        if (typeof window !== 'undefined') {
            window.completeTaskManually = (taskData = null) => {
                const defaultTaskData = {
                    description: 'Test task',
                    priority: 'medium',
                    category: 'work',
                    day: new Date().getDate(),
                    month: new Date().getMonth(),
                    year: new Date().getFullYear()
                };

                const data = taskData || defaultTaskData;
                this.trackTaskCompletion(data);
                console.log('Manual task completion tracked:', data);
                return 'Task completion simulated';
            };
        }
    }

    // Check if weekly stats need to be reset
    checkWeeklyReset() {
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday

        // If today is Sunday and we haven't reset stats this week
        if (currentDay === 0) {
            const today = now.toDateString();

            // If we haven't reset stats today
            if (this.stats.lastWeekReset !== today) {
                console.log('Resetting weekly stats');
                this.stats.weeklyTasks = 0;
                this.stats.tasksCompletedByDay = [0, 0, 0, 0, 0, 0, 0];
                this.stats.lastWeekReset = today;
                this.saveState();
            }
        }
    }

    // Track task completion
    trackTaskCompletion(taskData) {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn('No user ID available, cannot track task completion');
            return;
        }

        const now = new Date();
        const today = now.toDateString();
        const currentHour = now.getHours();
        const currentDay = now.getDay(); // 0 = Sunday
        const isWeekend = currentDay === 0 || currentDay === 6;

        // Update general statistics
        this.stats.totalTasksCompleted++;

        // Track tasks by day
        if (!this.stats.dailyTaskCounts[today]) {
            this.stats.dailyTaskCounts[today] = 0;
        }
        this.stats.dailyTaskCounts[today]++;

        // Update consecutive day streak
        if (this.stats.lastCompletionDate) {
            const lastDate = new Date(this.stats.lastCompletionDate);
            const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                this.stats.streak++;
            } else if (diffDays > 1) {
                this.stats.streak = 1;
            }
        } else {
            this.stats.streak = 1;
        }
        this.stats.lastCompletionDate = today;

        // Track tasks by priority
        if (taskData.priority) {
            this.stats.completedTasksByPriority[taskData.priority]++;
        }

        // Track task categories
        if (taskData.category) {
            this.stats.categoriesUsed.add(taskData.category);
        }

        // Track tasks by day of week
        this.stats.tasksCompletedByDay[currentDay]++;

        // Track weekly tasks
        this.stats.weeklyTasks++;

        // Add current time for tracking hourly tasks
        this.recentCompletions.push(now.getTime());
        // Remove old entries (older than an hour)
        this.recentCompletions = this.recentCompletions.filter(time =>
            now.getTime() - time < 60 * 60 * 1000
        );

        // Check achievements after updating statistics
        this.checkAchievements({
            currentHour,
            today,
            isWeekend,
            taskData
        });

        // Save updated state
        this.saveState();

        // For debugging, output current state
        console.log('Updated stats after task completion:', {
            totalTasks: this.stats.totalTasksCompleted,
            todayTasks: this.stats.dailyTaskCounts[today],
            streak: this.stats.streak,
            points: this.stats.totalPoints,
            categoriesUsed: this.stats.categoriesUsed.size,
            recentCompletions: this.recentCompletions.length
        });
    }

    // Track task creation
    trackTaskCreation(taskData) {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn('No user ID available, cannot track task creation');
            return;
        }

        // Check for planned ahead tasks
        const now = new Date();
        const taskDate = new Date(taskData.year, taskData.month, taskData.day);
        const daysInAdvance = Math.floor((taskDate - now) / (1000 * 60 * 60 * 24));

        if (daysInAdvance >= 7) {
            // Task is planned at least a week ahead
            this.updateProgress('early_planner', 1);
            console.log('Early planner progress updated:', this.achievementsProgress['early_planner']);
        }

        this.saveState();
    }

    // Check achievements based on current data
    checkAchievements(context) {
        const { currentHour, today, isWeekend, taskData } = context;

        // Check daily achievements
        this.checkDailyAchievements(currentHour, today);

        // Check weekly achievements
        this.checkWeeklyAchievements(isWeekend);

        // Check monthly achievements
        this.checkMonthlyAchievements();

        // Check special achievements
        this.checkSpecialAchievements(taskData);
    }

    // Check daily achievements
    checkDailyAchievements(currentHour, today) {
        // First Step - complete first task
        if (this.stats.totalTasksCompleted === 1) {
            this.unlockAchievement('beginner');
        }

        // Productive Day - complete 5 tasks in a day
        if (this.stats.dailyTaskCounts[today] >= 5) {
            this.unlockAchievement('productive_day');
        }

        // Super Productive Day - complete 10 tasks in a day
        if (this.stats.dailyTaskCounts[today] >= 10) {
            this.unlockAchievement('super_productive_day');
        }

        // Early Bird - complete task before 6 AM
        if (currentHour < 6) {
            this.unlockAchievement('early_bird');
        }

        // Night Owl - complete task after midnight and before 4 AM
        if (currentHour >= 0 && currentHour < 4) {
            this.unlockAchievement('night_owl');
        }
    }

    // Check weekly achievements
    checkWeeklyAchievements(isWeekend) {
        // Goal Oriented - complete 10 tasks in a week
        if (this.stats.weeklyTasks >= 10) {
            this.unlockAchievement('goal_oriented');
        }

        // Weekend Warrior - complete 5 tasks on weekends
        if (isWeekend) {
            this.updateProgress('weekend_warrior', 1);

            if (this.achievementsProgress['weekend_warrior'] >= 5) {
                this.unlockAchievement('weekend_warrior');
            }
        }

        // Perfect Week - complete at least 1 task every day of the week
        const hasTaskEveryDay = this.stats.tasksCompletedByDay.every(count => count > 0);
        if (hasTaskEveryDay) {
            this.unlockAchievement('perfect_week');
        }
    }

    // Check monthly achievements
    checkMonthlyAchievements() {
        // Time Master - complete 50 tasks
        if (this.stats.totalTasksCompleted >= 50) {
            this.unlockAchievement('time_master');
        }

        // Consistency King - complete tasks for 30 consecutive days
        if (this.stats.streak >= 30) {
            this.unlockAchievement('consistency');
        }
    }

    // Check special achievements
    checkSpecialAchievements() {
        // Speed Runner - complete 3 tasks in an hour
        if (this.recentCompletions.length >= 3) {
            this.unlockAchievement('speed_runner');
        }

        // Multitasker - complete tasks in 5 different categories
        if (this.stats.categoriesUsed.size >= 5) {
            this.unlockAchievement('multitasker');
        }

        // Priority Expert - complete 10 high priority tasks
        if (this.stats.completedTasksByPriority.high >= 10) {
            this.unlockAchievement('priority_expert');
        }
    }

    // Update achievement progress
    updateProgress(achievementId, increment = 1) {
        if (!this.achievementsProgress[achievementId]) {
            this.achievementsProgress[achievementId] = 0;
        }

        this.achievementsProgress[achievementId] += increment;

        // Get target value for achievement
        const achievement = achievementsList.find(a => a.id === achievementId);
        if (!achievement) return;

        // Check if target value has been reached
        if (this.achievementsProgress[achievementId] >= achievement.requirement) {
            this.unlockAchievement(achievementId);
        }
    }

    // Unlock achievement - updated to use API
    async unlockAchievement(achievementId) {
        // Check if achievement is already unlocked
        if (this.unlockedAchievements.has(achievementId)) {
            return false;
        }

        // Find achievement in list
        const achievement = achievementsList.find(a => a.id === achievementId);
        if (!achievement) {
            console.error(`Achievement with id "${achievementId}" not found`);
            return false;
        }

        // Unlock achievement
        this.unlockedAchievements.add(achievementId);

        // Add points
        this.stats.totalPoints += achievement.points;

        // Save state
        await this.saveState();

        // Send event for achievement unlock
        const event = new CustomEvent('achievement-unlocked', {
            detail: {
                id: achievementId,
                title: achievement.title,
                description: achievement.description,
                icon: achievement.icon,
                points: achievement.points
            }
        });
        document.dispatchEvent(event);

        console.log('Achievement unlocked:', achievement.title, '(+', achievement.points, 'points)');

        return true;
    }

    // Get all achievements with unlocked status
    async getAllAchievements() {
        // Make sure we have the latest data from API
        const userId = this.getCurrentUserId();
        if (userId && userId !== this.currentUserId) {
            await this.loadState();
        }

        return achievementsList.map(achievement => {
            const isUnlocked = this.unlockedAchievements.has(achievement.id);
            const progress = this.achievementsProgress[achievement.id] || 0;
            const totalRequired = achievement.requirement;

            // Hide info about "secret" achievements until unlocked
            if (achievement.secret && !isUnlocked) {
                return {
                    id: achievement.id,
                    category: achievement.category,
                    title: "???",
                    description: "Secret achievement",
                    icon: "❓",
                    isUnlocked: false,
                    progress: 0,
                    totalRequired: 1,
                    secret: true,
                    points: 0
                };
            }

            return {
                ...achievement,
                isUnlocked,
                progress,
                totalRequired
            };
        });
    }

    // Get achievement statistics
    async getStats() {
        // Make sure we have the latest data from API
        const userId = this.getCurrentUserId();
        if (userId && userId !== this.currentUserId) {
            await this.loadState();
        }

        const totalAchievements = achievementsList.length;
        const unlockedCount = this.unlockedAchievements.size;
        const progressPercentage = Math.round((unlockedCount / totalAchievements) * 100) || 0;

        return {
            totalAchievements,
            unlockedCount,
            progressPercentage,
            totalPoints: this.stats.totalPoints,
            streak: this.stats.streak
        };
    }

    // Get achievements by category
    async getAchievementsByCategory() {
        // Make sure we have the latest data from API
        const userId = this.getCurrentUserId();
        if (userId && userId !== this.currentUserId) {
            await this.loadState();
        }

        const achievements = await this.getAllAchievements();
        const result = {};

        achievementCategories.forEach(category => {
            result[category.id] = achievements.filter(
                achievement => achievement.category === category.id
            );
        });

        return result;
    }

    // For testing: unlock random achievement
    async unlockRandomAchievement() {
        const achievements = await this.getAllAchievements();
        const lockedAchievements = achievements
            .filter(a => !a.isUnlocked)
            .map(a => a.id);

        if (lockedAchievements.length === 0) {
            console.log('All achievements are already unlocked!');
            return false;
        }

        const randomId = lockedAchievements[Math.floor(Math.random() * lockedAchievements.length)];
        return this.unlockAchievement(randomId);
    }

    // Reset all achievements (for testing)
    async resetAllAchievements() {
        this.resetState();
        await this.saveState();
        console.log('All achievements have been reset');
        return true;
    }
}

// Create and export achievements service instance
const achievementsService = new AchievementsService();

// Add service to window for debugging
if (typeof window !== 'undefined') {
    window.achievementsService = achievementsService;
}

export default achievementsService;