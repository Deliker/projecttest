// Simplified achievement service that relies on the backend for achievements logic
import apiService from './api';

// Achievement categories with metadata
export const achievementCategories = [
    { id: 'daily', name: 'Daily Achievements', description: 'Achievements for daily productivity', icon: '📆' },
    { id: 'weekly', name: 'Weekly Milestones', description: 'Achievements for weekly consistency', icon: '📅' },
    { id: 'monthly', name: 'Monthly Mastery', description: 'Long-term achievements', icon: '📈' },
    { id: 'special', name: 'Special Achievements', description: 'Unique productivity milestones', icon: '🏆' }
];

// Achievement definitions (used for display and notification purposes only)
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
 * Simplified AchievementsService - Let the backend do the hard work
 */
class AchievementsService {
    constructor() {
        // Cache structure for achievements and stats
        this._cache = {
            achievements: null,
            stats: null,
            userId: null,
            lastFetched: 0
        };

        // Set up event listeners for achievement notifications
        this._setupAchievementNotifications();
    }

    /**
     * Clear the cache to force new data fetching
     */
    clearCache() {
        this._cache = {
            achievements: null,
            stats: null,
            userId: null,
            lastFetched: 0
        };
    }

    /**
     * Get the current user ID from localStorage
     */
    _getCurrentUserId() {
        return localStorage.getItem('user_id');
    }

    /**
     * Set up listeners for task completion and creation events
     * to poll for new achievements
     */
    _setupAchievementNotifications() {
        // Listen for task completion events
        document.addEventListener('task-completed', () => {
            this._checkForNewAchievements();
        });

        // Listen for task creation events
        document.addEventListener('task-created', () => {
            this._checkForNewAchievements();
        });
    }

    /**
     * Poll the server for new achievements
     */
    async _checkForNewAchievements() {
        const userId = this._getCurrentUserId();
        if (!userId) return;

        try {
            // Get the current achievements
            const currentAchievements = this._cache.achievements || [];
            const currentCount = currentAchievements.length;

            // Fetch the latest achievements (force refresh)
            this.clearCache();
            const newAchievements = await this.getAllAchievements();

            // If we have more achievements than before, find the new ones
            if (newAchievements.length > currentCount) {
                // Sort by unlocked time to get the newest first
                const sortedAchievements = newAchievements
                    .filter(a => a.isUnlocked)
                    .sort((a, b) => {
                        if (!a.unlockedAt) return 1;
                        if (!b.unlockedAt) return -1;
                        return new Date(b.unlockedAt) - new Date(a.unlockedAt);
                    });

                // Get the most recently unlocked achievement
                if (sortedAchievements.length > 0) {
                    const latestAchievement = sortedAchievements[0];

                    // Dispatch notification events
                    this._notifyAchievementUnlocked(latestAchievement);
                }
            }
        } catch (error) {
            console.error('Error checking for new achievements:', error);
        }
    }

    /**
     * Show a notification for a newly unlocked achievement
     */
    _notifyAchievementUnlocked(achievement) {
        if (!achievement || !achievement.id) return;

        const achievementInfo = achievementsList.find(a => a.id === achievement.id);
        if (!achievementInfo) return;

        // Create and dispatch the event
        const event = new CustomEvent('achievement-unlocked', {
            detail: {
                id: achievement.id,
                title: achievementInfo.title,
                description: achievementInfo.description,
                icon: achievementInfo.icon,
                points: achievementInfo.points
            }
        });

        document.dispatchEvent(event);
    }

    /**
     * Get all achievements for the current user
     */
    async getAllAchievements() {
        const userId = this._getCurrentUserId();
        if (!userId) {
            console.warn('No user ID available, returning empty achievements list');
            return [];
        }

        // Check if we have valid cached data
        if (this._cache.achievements &&
            this._cache.userId === userId &&
            Date.now() - this._cache.lastFetched < 60000) { // Cache for 1 minute
            return this._cache.achievements;
        }

        try {
            // Get unlocked achievements from backend
            const response = await apiService.getAllAchievements(userId);
            console.log("ACHIEVEMENT RESPONSE DATA:", response.data); // Debug line
            const unlockedAchievements = response.data || [];
            console.log("Number of unlocked achievements:", unlockedAchievements.length); // Debug line

            // Create a map of unlocked achievement IDs for quick lookup
            const unlockedMap = {};
            unlockedAchievements.forEach(achievement => {
                console.log("Processing achievement:", achievement); // Debug line
                if (achievement && achievement.achievementId) {
                    unlockedMap[achievement.achievementId] = achievement;
                    console.log("Added to unlockedMap:", achievement.achievementId); // Debug line
                } else {
                    console.warn("Achievement missing achievementId:", achievement); // Debug line
                }
            });

            // Build the complete achievement list with unlock status
            const allAchievements = achievementsList.map(achievement => {
                const isUnlocked = !!unlockedMap[achievement.id];
                const unlockedData = unlockedMap[achievement.id] || {};
                console.log(`Achievement ${achievement.id} unlocked status:`, isUnlocked);
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

            // Update cache
            this._cache.achievements = allAchievements;
            this._cache.userId = userId;
            this._cache.lastFetched = Date.now();

            return allAchievements;
        } catch (error) {
            console.error('Error fetching achievements:', error);
            return [];
        }
    }

    /**
     * Get achievement statistics
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

        // Check if we have valid cached stats
        if (this._cache.stats &&
            this._cache.userId === userId &&
            Date.now() - this._cache.lastFetched < 60000) { // Cache for 1 minute
            return this._cache.stats;
        }

        try {
            // Get stats from backend
            const response = await apiService.getAchievementStats(userId);
            const stats = response.data || {};

            // If stats are incomplete, supplement with calculated values
            if (!stats.totalAchievements) {
                const achievements = await this.getAllAchievements();
                const unlockedCount = achievements.filter(a => a.isUnlocked).length;

                stats.totalAchievements = achievementsList.length;
                stats.unlockedCount = unlockedCount;
                stats.progressPercentage = Math.round((unlockedCount / achievementsList.length) * 100);
            }

            // Update cache
            this._cache.stats = stats;
            this._cache.userId = userId;

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
     * Unlock a random achievement (for testing/development)
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

            // Directly unlock through the API
            const userId = this._getCurrentUserId();
            if (!userId) return false;

            const response = await apiService.unlockAchievement(userId, randomAchievement.id);

            // Clear the cache and check for new achievements
            this.clearCache();
            await this._checkForNewAchievements();

            return response.status === 201;
        } catch (error) {
            console.error('Error unlocking random achievement:', error);
            return false;
        }
    }

    /**
     * Reset all achievements (for development only)
     * This requires a backend implementation
     */
    async resetAllAchievements() {
        console.log('Achievement reset functionality needs to be implemented in the backend');
        // This would require a backend endpoint to reset achievements
        this.clearCache();
        return true;
    }
}

// Create a singleton instance
const achievementsService = new AchievementsService();

// Export the service as default export
export default achievementsService;