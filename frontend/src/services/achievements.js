/**
 * achievements.js - Modified to integrate with Spring Boot backend
 * This file provides a service for managing achievements in the TaskMaster application
 * with database persistence through REST API calls.
 */
import apiService from './api';

// Define all available achievements - this is just metadata, actual unlocks are stored in DB per user
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
        this.stats = this.getDefaultStats();
        this.recentCompletions = [];
        this.currentUserId = null;
        this.achievementsData = null;
        this.achievementsLoaded = false;

        // Setup event listeners
        this.initEventListeners();

        // Check if user is logged in
        this.checkUserLoginStatus();
    }

    // Default stats object
    getDefaultStats() {
        return {
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
    }

    // Check and update user login status
    checkUserLoginStatus() {
        const userId = localStorage.getItem('user_id');
        if (userId && userId !== this.currentUserId) {
            this.setCurrentUser(userId);
        }
    }

    // Set current user and load their achievements
    setCurrentUser(userId) {
        if (!userId) return;

        this.currentUserId = userId;
        this.loadUserAchievements();
        this.checkWeeklyReset();

        console.log(`Set current user ID for achievements: ${userId}`);
    }

    // Load achievements from API for current user
    async loadUserAchievements() {
        if (!this.currentUserId) {
            console.warn('Cannot load achievements: No user is logged in');
            return;
        }

        try {
            // Reset local state first
            this.resetState();

            // Fetch user's achievements from API
            const response = await apiService.getAllAchievements(this.currentUserId);
            const achievements = response.data;

            // Process achievement data
            if (Array.isArray(achievements)) {
                achievements.forEach(achievement => {
                    this.unlockedAchievements.add(achievement.achievementId);
                });
            }

            // Fetch achievement stats
            const statsResponse = await apiService.getAchievementStats(this.currentUserId);
            const stats = statsResponse.data;

            if (stats) {
                this.stats.totalPoints = stats.totalPoints || 0;
                this.stats.streak = stats.streak || 0;
            }

            this.achievementsLoaded = true;

            console.log("Loaded achievements for user", this.currentUserId, {
                unlockedCount: this.unlockedAchievements.size,
                stats: this.stats
            });
        } catch (error) {
            console.error('Error loading achievements:', error);
            this.achievementsLoaded = false;
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
                console.log('Resetting weekly stats for user', this.currentUserId);
                this.stats.weeklyTasks = 0;
                this.stats.tasksCompletedByDay = [0, 0, 0, 0, 0, 0, 0];
                this.stats.lastWeekReset = today;
            }
        }
    }

    // Reset state to default values
    resetState() {
        this.unlockedAchievements = new Set();
        this.achievementsProgress = {};
        this.stats = this.getDefaultStats();
        this.recentCompletions = [];
        this.achievementsLoaded = false;
    }

    // Initialize event listeners
    initEventListeners() {
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

        // Listen for user login/logout events
        document.addEventListener('user-logged-in', (event) => {
            console.log('User logged in event received:', event.detail);
            this.setCurrentUser(event.detail.userId);
        });

        document.addEventListener('user-logged-out', () => {
            console.log('User logged out event received');
            this.currentUserId = null;
            this.resetState();
        });
    }

    // Track task completion
    async trackTaskCompletion(taskData) {
        if (!this.currentUserId) {
            console.warn('Cannot track task completion: No user is logged in');
            return;
        }

        const now = new Date();
        const today = now.toDateString();
        const currentHour = now.getHours();
        const currentDay = now.getDay(); // 0 = Sunday
        const isWeekend = currentDay === 0 || currentDay === 6;

        // Update general stats
        this.stats.totalTasksCompleted++;

        // Track tasks by day
        if (!this.stats.dailyTaskCounts[today]) {
            this.stats.dailyTaskCounts[today] = 0;
        }
        this.stats.dailyTaskCounts[today]++;

        // Update consecutive days streak
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

        // Add current time for tracking hourly completions
        this.recentCompletions.push(now.getTime());
        // Remove old entries (older than one hour)
        this.recentCompletions = this.recentCompletions.filter(time =>
            now.getTime() - time < 60 * 60 * 1000
        );

        // Check achievements after updating stats
        await this.checkAchievements({
            currentHour,
            today,
            isWeekend,
            taskData
        });

        // Debug log current state
        console.log(`Updated stats for user ${this.currentUserId} after task completion:`, {
            totalTasks: this.stats.totalTasksCompleted,
            todayTasks: this.stats.dailyTaskCounts[today],
            streak: this.stats.streak,
            points: this.stats.totalPoints,
            categoriesUsed: this.stats.categoriesUsed.size,
            recentCompletions: this.recentCompletions.length
        });
    }

    // Track task creation
    async trackTaskCreation(taskData) {
        if (!this.currentUserId) {
            console.warn('Cannot track task creation: No user is logged in');
            return;
        }

        // Check for tasks planned in advance
        const now = new Date();
        const taskDate = new Date(taskData.year, taskData.month, taskData.day);
        const daysInAdvance = Math.floor((taskDate - now) / (1000 * 60 * 60 * 24));

        if (daysInAdvance >= 7) {
            // Task planned at least a week in advance
            await this.updateProgress('early_planner', 1);
            console.log(`Early planner progress updated for user ${this.currentUserId}:`,
                this.achievementsProgress['early_planner']);
        }
    }

    async checkSpecialAchievements() {
        // Speed Runner - complete 3 tasks in an hour
        if (this.recentCompletions.length >= 3) {
            await this.unlockAchievement('speed_runner');
        }

        // Multitasker - complete tasks in 5 different categories
        if (this.stats.categoriesUsed.size >= 5) {
            await this.unlockAchievement('multitasker');
        }

        // Priority Expert - complete 10 high-priority tasks
        if (this.stats.completedTasksByPriority.high >= 10) {
            await this.unlockAchievement('priority_expert');
        }
    }
    // Check achievements based on current data
    async checkAchievements(context) {
        if (!this.currentUserId) {
            console.warn('Cannot check achievements: No user is logged in');
            return;
        }

        const { currentHour, today, isWeekend, taskData } = context;

        // Check daily achievements
        await this.checkDailyAchievements(currentHour, today);

        // Check weekly achievements
        await this.checkWeeklyAchievements(isWeekend);

        // Check monthly achievements
        await this.checkMonthlyAchievements();

        // Check special achievements
        await this.checkSpecialAchievements(taskData);
    }

    // Check daily achievements
    async checkDailyAchievements(currentHour, today) {
        // First Step - complete first task
        if (this.stats.totalTasksCompleted === 1) {
            await this.unlockAchievement('beginner');
        }

        // Productive Day - complete 5 tasks in a day
        if (this.stats.dailyTaskCounts[today] >= 5) {
            await this.unlockAchievement('productive_day');
        }

        // Super Productive Day - complete 10 tasks in a day
        if (this.stats.dailyTaskCounts[today] >= 10) {
            await this.unlockAchievement('super_productive_day');
        }

        // Early Bird - complete task before 6 AM
        if (currentHour < 6) {
            await this.unlockAchievement('early_bird');
        }

        // Night Owl - complete task after midnight and before 4 AM
        if (currentHour >= 0 && currentHour < 4) {
            await this.unlockAchievement('night_owl');
        }
    }

    // Check weekly achievements
    async checkWeeklyAchievements(isWeekend) {
        // Goal Oriented - complete 10 tasks in a week
        if (this.stats.weeklyTasks >= 10) {
            await this.unlockAchievement('goal_oriented');
        }

        // Weekend Warrior - complete 5 tasks on weekends
        if (isWeekend) {
            await this.updateProgress('weekend_warrior', 1);

            if (this.achievementsProgress['weekend_warrior'] >= 5) {
                await this.unlockAchievement('weekend_warrior');
            }
        }

        // Perfect Week - complete at least 1 task every day of the week
        const hasTaskEveryDay = this.stats.tasksCompletedByDay.every(count => count > 0);
        if (hasTaskEveryDay) {
            await this.unlockAchievement('perfect_week');
        }
    }

    // Check monthly achievements
    async checkMonthlyAchievements() {
        // Time Master - complete 50 tasks
        if (this.stats.totalTasksCompleted >= 50) {
            await this.unlockAchievement('time_master');
        }

        // Consistency King - complete tasks 30 days in a row
        if (this.stats.streak >= 30) {
            await this.unlockAchievement('consistency');
        }
    }

    // Check special achievements


    // Update achievement progress
    async updateProgress(achievementId, increment = 1) {
        if (!this.currentUserId) {
            console.warn('Cannot update progress: No user is logged in');
            return;
        }

        if (!this.achievementsProgress[achievementId]) {
            this.achievementsProgress[achievementId] = 0;
        }

        this.achievementsProgress[achievementId] += increment;

        // Get target value for the achievement
        const achievement = achievementsList.find(a => a.id === achievementId);
        if (!achievement) return;

        // Check if target value has been reached
        if (this.achievementsProgress[achievementId] >= achievement.requirement) {
            await this.unlockAchievement(achievementId);
        }
    }

    // Unlock achievement
    async unlockAchievement(achievementId) {
        if (!this.currentUserId) {
            console.warn('Cannot unlock achievement: No user is logged in');
            return false;
        }

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

        try {
            // Unlock achievement on the server
            await apiService.unlockAchievement(this.currentUserId, achievementId);

            // Update local state
            this.unlockedAchievements.add(achievementId);

            // Add points
            this.stats.totalPoints += achievement.points;

            // Send achievement unlocked event
            const event = new CustomEvent('achievement-unlocked', {
                detail: {
                    id: achievementId,
                    title: achievement.title,
                    description: achievement.description,
                    icon: achievement.icon,
                    points: achievement.points,
                    userId: this.currentUserId
                }
            });
            document.dispatchEvent(event);

            console.log(`Achievement unlocked for user ${this.currentUserId}:`,
                achievement.title, '(+', achievement.points, 'points)');

            return true;
        } catch (error) {
            console.error(`Failed to unlock achievement ${achievementId}:`, error);
            return false;
        }
    }

    // Get list of all achievements with unlock information
    getAllAchievements() {
        if (!this.currentUserId) {
            console.warn('Cannot get achievements: No user is logged in');
            return achievementsList.map(achievement => ({
                ...achievement,
                isUnlocked: false,
                progress: 0,
                totalRequired: achievement.requirement
            }));
        }

        if (!this.achievementsLoaded) {
            // Trigger loading if not already loaded
            this.loadUserAchievements();
        }

        return achievementsList.map(achievement => {
            const isUnlocked = this.unlockedAchievements.has(achievement.id);
            const progress = this.achievementsProgress[achievement.id] || 0;
            const totalRequired = achievement.requirement;

            // Hide information about "secret" achievements until unlocked
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
    getStats() {
        if (!this.currentUserId) {
            console.warn('Cannot get stats: No user is logged in');
            return {
                totalAchievements: achievementsList.length,
                unlockedCount: 0,
                progressPercentage: 0,
                totalPoints: 0,
                streak: 0
            };
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
    getAchievementsByCategory() {
        const result = {};

        achievementCategories.forEach(category => {
            result[category.id] = this.getAllAchievements().filter(
                achievement => achievement.category === category.id
            );
        });

        return result;
    }

    // For testing: unlock random achievement
    async unlockRandomAchievement() {
        if (!this.currentUserId) {
            console.warn('Cannot unlock achievement: No user is logged in');
            return false;
        }

        const lockedAchievements = achievementsList
            .filter(a => !this.unlockedAchievements.has(a.id))
            .map(a => a.id);

        if (lockedAchievements.length === 0) {
            console.log('All achievements are already unlocked for user', this.currentUserId);
            return false;
        }

        const randomId = lockedAchievements[Math.floor(Math.random() * lockedAchievements.length)];
        return await this.unlockAchievement(randomId);
    }

    // Reset all achievements (for testing)
    async resetAllAchievements() {
        if (!this.currentUserId) {
            console.warn('Cannot reset achievements: No user is logged in');
            return false;
        }

        try {
            // We would need to implement a server API for this if needed
            // For now, just reset local state
            this.resetState();
            await this.loadUserAchievements();

            console.log('All achievements have been reset for user', this.currentUserId);
            return true;
        } catch (error) {
            console.error('Failed to reset achievements:', error);
            return false;
        }
    }
}

// Create and export achievements service instance
const achievementsService = new AchievementsService();

export default achievementsService;