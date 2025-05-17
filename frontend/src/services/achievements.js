// Improved achievements.js service to prevent duplicate events and fix display issues

import apiService from './api';

// Achievement categories with metadata
export const achievementCategories = [
    { id: 'daily', name: 'Ежедневные достижения', description: 'Достижения для ежедневной продуктивности', icon: '📆' },
    { id: 'weekly', name: 'Еженедельные вехи', description: 'Достижения для еженедельной стабильности', icon: '📅' },
    { id: 'monthly', name: 'Ежемесячное мастерство', description: 'Долгосрочные достижения', icon: '📈' },
    { id: 'special', name: 'Особые достижения', description: 'Уникальные вехи продуктивности', icon: '🏆' }
];

// Achievement definitions
export const achievementsList = [
    // Daily achievements
    {
        id: 'beginner',
        category: 'daily',
        title: 'First Step',
        description: 'Complete your first task',
        icon: '🎯',
        points: 10
    },
    {
        id: 'productive_day',
        category: 'daily',
        title: 'Productive Day',
        description: 'Complete 5 tasks in one day',
        icon: '⭐',
        points: 25
    },
    {
        id: 'super_productive_day',
        category: 'daily',
        title: 'Super Productive Day',
        description: 'Complete 10 tasks in one day',
        icon: '🌟',
        points: 50,
        secret: true
    },
    {
        id: 'early_bird',
        category: 'daily',
        title: 'Early Bird',
        description: 'Complete a task before 6 AM',
        icon: '🌅',
        points: 30
    },
    {
        id: 'night_owl',
        category: 'daily',
        title: 'Night Owl',
        description: 'Complete a task after midnight',
        icon: '🌙',
        points: 30
    },

    // Weekly achievements
    {
        id: 'goal_oriented',
        category: 'weekly',
        title: 'Goal Oriented',
        description: 'Complete 10 tasks in a week',
        icon: '🎯',
        points: 50
    },
    {
        id: 'weekend_warrior',
        category: 'weekly',
        title: 'Weekend Warrior',
        description: 'Complete 5 tasks during weekend',
        icon: '💪',
        points: 40
    },
    {
        id: 'perfect_week',
        category: 'weekly',
        title: 'Perfect Week',
        description: 'Complete at least 1 task every day of the week',
        icon: '✨',
        points: 70
    },

    // Monthly achievements
    {
        id: 'project_leader',
        category: 'monthly',
        title: 'Project Leader',
        description: 'Complete all tasks in a month',
        icon: '👑',
        points: 100
    },
    {
        id: 'time_master',
        category: 'monthly',
        title: 'Time Master',
        description: 'Complete 50 tasks',
        icon: '⌛',
        points: 150
    },
    {
        id: 'consistency',
        category: 'monthly',
        title: 'Consistency King',
        description: 'Complete tasks for 30 days in a row',
        icon: '📈',
        points: 200
    },

    // Special achievements
    {
        id: 'early_planner',
        category: 'special',
        title: 'Early Planner',
        description: 'Plan tasks a week in advance',
        icon: '📅',
        points: 40
    },
    {
        id: 'speed_runner',
        category: 'special',
        title: 'Speed Runner',
        description: 'Complete 3 tasks within an hour',
        icon: '⚡',
        points: 30
    },
    {
        id: 'multitasker',
        category: 'special',
        title: 'Multitasker',
        description: 'Complete tasks in 5 different categories',
        icon: '🎭',
        points: 50
    },
    {
        id: 'organization_master',
        category: 'special',
        title: 'Organization Master',
        description: 'Categorize 20 tasks',
        icon: '📊',
        points: 40
    },
    {
        id: 'priority_expert',
        category: 'special',
        title: 'Priority Expert',
        description: 'Complete 10 high-priority tasks',
        icon: '🔥',
        points: 60,
        secret: true
    }
];

/**
 * AchievementsService - Improved to fix display issues and prevent duplicate notifications
 */
class AchievementsService {
    constructor() {
        // Cached achievements for the current user
        this._achievementCache = null;
        this._statCache = null;
        this._lastUserId = null;
        this._recentlyUnlockedAchievements = new Set();

        // Create a custom event dispatcher
        this._eventDispatcher = new EventTarget();
    }

    /**
     * Get the current user ID from localStorage
     * @returns {string|null} User ID or null if not logged in
     */
    _getCurrentUserId() {
        return localStorage.getItem('user_id');
    }

    /**
     * Clear the achievement cache
     */
    clearCache() {
        this._achievementCache = null;
        this._statCache = null;
        this._lastUserId = null;
    }

    /**
     * Get all achievements for the current user
     * @returns {Promise<Array>} List of achievements with unlock status
     */
    async getAllAchievements() {
        const userId = this._getCurrentUserId();
        if (!userId) {
            console.warn('No user ID available, returning empty achievements list');
            return [];
        }

        // Check if we have cached data for this user
        if (this._achievementCache && this._lastUserId === userId) {
            return this._achievementCache;
        }

        try {
            // Get unlocked achievements from backend
            const response = await apiService.getAllAchievements(userId);
            const unlockedAchievements = response.data || [];

            // Create a map of unlocked achievement IDs for quick lookup
            const unlockedMap = {};
            unlockedAchievements.forEach(achievement => {
                if (achievement && achievement.achievementId) {
                    unlockedMap[achievement.achievementId] = achievement;
                }
            });

            // Build the complete achievement list with unlock status
            const allAchievements = achievementsList.map(achievement => {
                const isUnlocked = !!unlockedMap[achievement.id];
                const unlockedData = unlockedMap[achievement.id] || {};

                // For secret achievements not yet unlocked, hide details
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

                // For normal achievements or unlocked secret ones, show details
                return {
                    ...achievement,
                    isUnlocked,
                    unlockedAt: unlockedData.unlockedAt || null,
                    progress: isUnlocked ? 1 : 0,
                    totalRequired: 1
                };
            });

            // Cache the result
            this._achievementCache = allAchievements;
            this._lastUserId = userId;

            return allAchievements;
        } catch (error) {
            console.error('Error fetching achievements:', error);
            return [];
        }
    }

    /**
     * Get achievement statistics
     * @returns {Promise<Object>} Achievement statistics
     */
    async getStats() {
        const userId = this._getCurrentUserId();
        if (!userId) {
            return {
                totalAchievements: achievementsList.length,
                unlockedCount: 0,
                progressPercentage: 0,
                totalPoints: 0,
                streak: 0
            };
        }

        // Check if we have cached stats
        if (this._statCache && this._lastUserId === userId) {
            return this._statCache;
        }

        try {
            // Get stats from backend
            const response = await apiService.getAchievementStats(userId);
            const stats = response.data || {};

            // If stats are empty or incomplete, calculate them
            if (!stats.totalAchievements) {
                const achievements = await this.getAllAchievements();
                const unlockedCount = achievements.filter(a => a.isUnlocked).length;
                const totalPoints = achievements
                    .filter(a => a.isUnlocked)
                    .reduce((sum, a) => sum + a.points, 0);

                const calculatedStats = {
                    totalAchievements: achievementsList.length,
                    unlockedCount,
                    progressPercentage: Math.round((unlockedCount / achievementsList.length) * 100),
                    totalPoints,
                    streak: stats.streak || 0
                };

                // Cache the result
                this._statCache = calculatedStats;
                return calculatedStats;
            }

            // Cache and return the backend stats
            this._statCache = stats;
            return stats;
        } catch (error) {
            console.error('Error fetching achievement stats:', error);

            // Return default stats on error
            return {
                totalAchievements: achievementsList.length,
                unlockedCount: 0,
                progressPercentage: 0,
                totalPoints: 0,
                streak: 0
            };
        }
    }

    /**
     * Get achievements grouped by category
     * @returns {Promise<Object>} Achievements organized by category
     */
    async getAchievementsByCategory() {
        const achievements = await this.getAllAchievements();

        // Create result object with empty arrays for each category
        const result = {};
        achievementCategories.forEach(category => {
            result[category.id] = [];
        });

        // Sort achievements into categories
        achievements.forEach(achievement => {
            if (achievement.category && result[achievement.category]) {
                result[achievement.category].push(achievement);
            }
        });

        return result;
    }

    /**
     * Unlock an achievement for the current user
     * @param {string} achievementId - ID of the achievement to unlock
     * @returns {Promise<boolean>} Success status
     */
    async unlockAchievement(achievementId) {
        const userId = this._getCurrentUserId();
        if (!userId) {
            console.warn('No user ID available, cannot unlock achievement');
            return false;
        }

        // Prevent duplicate unlocks in a short time period
        if (this._recentlyUnlockedAchievements.has(achievementId)) {
            console.log(`Skipping duplicate unlock for achievement: ${achievementId}`);
            return false;
        }

        try {
            // First check if achievement is already unlocked
            const response = await apiService.checkAchievement(userId, achievementId);
            const hasAchievement = response.data?.hasAchievement;

            if (hasAchievement) {
                console.log(`Achievement ${achievementId} already unlocked`);
                return false;
            }

            // Add to recently unlocked set to prevent duplicates
            this._recentlyUnlockedAchievements.add(achievementId);

            // Auto-remove after 10 seconds to prevent memory buildup
            setTimeout(() => {
                this._recentlyUnlockedAchievements.delete(achievementId);
            }, 10000);

            // Unlock the achievement
            const unlockResponse = await apiService.unlockAchievement(userId, achievementId);

            if (unlockResponse.status === 201) {
                console.log(`Achievement ${achievementId} unlocked successfully`);

                // Clear the cache
                this.clearCache();

                // Find the achievement details
                const achievement = achievementsList.find(a => a.id === achievementId);
                if (achievement) {
                    // Dispatch notification event
                    const event = new CustomEvent('achievement-unlocked', {
                        detail: {
                            id: achievementId,
                            title: achievement.title,
                            description: achievement.description,
                            icon: achievement.icon,
                            points: achievement.points
                        }
                    });

                    // Use setTimeout to ensure the event is dispatched after any current processing
                    setTimeout(() => {
                        document.dispatchEvent(event);
                    }, 100);
                }

                return true;
            }

            return false;
        } catch (error) {
            console.error(`Error unlocking achievement ${achievementId}:`, error);
            return false;
        }
    }

    /**
     * Unlock a random achievement (for testing)
     */
    async unlockRandomAchievement() {
        try {
            // Get all achievements and filter out already unlocked ones
            const allAchievements = await this.getAllAchievements();
            const lockedAchievements = allAchievements.filter(a => !a.isUnlocked);

            if (lockedAchievements.length === 0) {
                console.log('All achievements are already unlocked');
                return false;
            }

            // Select a random locked achievement
            const randomIndex = Math.floor(Math.random() * lockedAchievements.length);
            const randomAchievement = lockedAchievements[randomIndex];

            // Unlock it
            return await this.unlockAchievement(randomAchievement.id);
        } catch (error) {
            console.error('Error unlocking random achievement:', error);
            return false;
        }
    }

    /**
     * Reset all achievements (for testing)
     */
    async resetAllAchievements() {
        console.log('Achievement reset functionality is not implemented in the backend');
        // This would require a backend endpoint to reset achievements
        this.clearCache();
        return true;
    }
}

// Create a singleton instance
const achievementsService = new AchievementsService();

// Export for use in other components
export default achievementsService;