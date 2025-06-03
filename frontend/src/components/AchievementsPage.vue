<template>
  <div class="achievements-page">
    <div class="achievements-header">
      <div class="achievements-header-content">
        <h1 class="achievements-title">{{ $t('achievements.title') }}</h1>
        <p class="achievements-subtitle">{{ $t('achievements.subtitle') }}</p>

        <div class="achievements-stats">
          <div class="stat-row">
            <div class="stat-item">
              <div class="stat-circle">
                <svg viewBox="0 0 36 36" class="circular-chart">
                  <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path :stroke-dasharray="`${stats.progressPercentage}, 100`" class="circle" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div class="stat-percentage">{{ stats.progressPercentage }}%</div>
              </div>
              <span class="stat-number">{{ stats.unlockedCount }}/{{ stats.totalAchievements }}</span>
              <span class="stat-label">{{ $t('achievements.stats.unlocked') }}</span>
            </div>

            <div class="stat-item">
              <div class="total-points">
                <div class="points-icon">🏆</div>
                <div class="points-value">{{ stats.totalPoints }}</div>
              </div>
              <span class="stat-label">{{ $t('achievements.stats.totalPoints') }}</span>
            </div>

            <div class="stat-item">
              <div class="streak-counter">
                <div class="streak-icon">🔥</div>
                <div class="streak-value">{{ stats.streak || 0 }}</div>
              </div>
              <span class="stat-label">{{ $t('achievements.stats.streak') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="search-filter-container">
      <div class="search-box">
        <input
            type="text"
            :placeholder="$t('achievements.search')"
            v-model="searchQuery"
            class="search-input"
        />
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="search-icon">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <div class="filter-container">
        <button
            v-for="filterOption in filterOptions"
            :key="filterOption.value"
            class="filter-btn"
            :class="{ active: filter === filterOption.value }"
            @click="filter = filterOption.value"
        >
          {{ $t(`achievements.filters.${filterOption.value}`) }}
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="achievements-loading">
      <div class="loading-spinner"></div>
      <p>{{ $t('achievements.loading') }}</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="achievements-error">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <h3>{{ $t('achievements.error.title') }}</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadAchievements">{{ $t('achievements.error.retry') }}</button>
    </div>

    <!-- Success state with achievements -->
    <div v-else class="achievements-grid">
      <div
          class="achievement-category"
          v-for="category in categories"
          :key="category.id"
          v-show="hasCategoryAchievements(category.id)"
      >
        <div class="category-header">
          <div class="category-icon">{{ category.icon }}</div>
          <h2 class="category-title">{{ $t(`achievements.categories.${category.id}`) }}</h2>
        </div>

        <transition-group name="achievement-list" tag="div" class="achievements-list">
          <div
              v-for="achievement in filterAchievements(achievementsByCategory[category.id] || [])"
              :key="achievement.id"
              class="achievement-card"
              :class="{
                'locked': !achievement.isUnlocked,
                'secret': achievement.secret && !achievement.isUnlocked
              }"
              v-show="!shouldHideAchievement(achievement)"
          >
            <div class="achievement-card-inner">
              <div class="achievement-icon" :class="{'locked-icon': !achievement.isUnlocked}">{{ achievement.icon }}</div>
              <div class="achievement-info">
                <h3>{{ achievement.title }}</h3>
                <p>{{ achievement.description }}</p>

                <div v-if="!achievement.isUnlocked && !achievement.secret" class="achievement-progress">
                  <div class="progress-bar">
                    <div
                        class="progress-fill"
                        :style="{ width: `${Math.min(achievement.progress / achievement.totalRequired * 100, 100)}%` }"
                    ></div>
                  </div>
                  <div class="progress-text">
                    {{ achievement.progress }} / {{ achievement.totalRequired }}
                  </div>
                </div>

                <div v-if="achievement.isUnlocked" class="achievement-points">
                  +{{ achievement.points }} pts
                </div>
              </div>
              <div class="achievement-status">
                <div v-if="achievement.isUnlocked" class="status-badge unlocked">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{{ $t('achievements.status.unlocked') }}</span>
                </div>
                <div v-else-if="achievement.secret" class="status-badge secret">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{{ $t('achievements.status.secret') }}</span>
                </div>
                <div v-else class="status-badge locked">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{{ $t('achievements.status.locked') }}</span>
                </div>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>

    <div v-if="showEmptyState" class="empty-state">
      <div class="empty-state-content">
        <div class="empty-icon">🔍</div>
        <h3>{{ $t('achievements.empty.title') }}</h3>
        <p>{{ $t('achievements.empty.subtitle') }}</p>
        <button class="reset-btn" @click="resetFilters">{{ $t('achievements.empty.reset') }}</button>
      </div>
    </div>

    <!-- Debug Panel for Development Mode -->
    <div v-if="isDevMode && showDebugPanel" class="debug-panel">
      <div class="debug-header">
        <h4>{{ $t('achievements.debug.title') }}</h4>
        <button class="debug-close-btn" @click="toggleDebugPanel" :title="$t('achievements.debug.hide')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <button class="debug-btn unlock-random" @click="unlockRandomAchievement">
        {{ $t('achievements.debug.unlockRandom') }}
      </button>
      <button class="debug-btn reset-all" @click="resetAllAchievements">
        {{ $t('achievements.debug.resetAll') }}
      </button>
      <div class="debug-achievements-list">
        <h4>{{ $t('achievements.debug.status') }}:</h4>
        <div v-for="category in categories" :key="category.id">
          <strong>{{ category.id }}:</strong>
          <span v-for="ach in achievementsByCategory[category.id] || []"
                :key="ach.id"
                :class="{'unlocked-debug': ach.isUnlocked}">
            {{ ach.id }}{{ ach.isUnlocked ? '(✓)' : '(✗)' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Debug Panel Toggle Button -->
    <div v-if="isDevMode && !showDebugPanel" class="debug-toggle">
      <button class="debug-toggle-btn" @click="toggleDebugPanel" :title="$t('achievements.debug.show')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Debug
      </button>
    </div>
  </div>
</template>

<script>
import achievementsService, { achievementCategories } from '@/services/achievements';
export default {
  data() {
    return {
      searchQuery: '',
      filter: 'all',
      filterOptions: [
        { value: 'all', label: 'All' },
        { value: 'unlocked', label: 'Unlocked' },
        { value: 'locked', label: 'Locked' }
      ],
      categories: achievementCategories,
      achievementsByCategory: {},
      stats: {
        unlockedCount: 0,
        totalAchievements: 0,
        progressPercentage: 0,
        totalPoints: 0,
        streak: 0
      },
      isLoading: true,
      error: null,
      isDevMode: process.env.NODE_ENV === 'development',
      showDebugPanel: false, // Initially hidden
      refreshInterval: null
    };
  },

  computed: {
    showEmptyState() {
      // If loading or has error, don't show empty state
      if (this.isLoading || this.error) {
        return false;
      }

      // Check if any achievements are visible after filtering
      for (const categoryId in this.achievementsByCategory) {
        const filteredAchievements = this.filterAchievements(this.achievementsByCategory[categoryId] || []);
        if (filteredAchievements.length > 0) {
          return false;
        }
      }
      return true;
    }
  },

  methods: {
    async loadAchievements() {
      this.isLoading = true;
      this.error = null;

      try {
        console.log("[AchievementsPage] Loading achievements...");

        // Force cache clearance to ensure fresh data
        achievementsService.clearCache();

        // Load achievements by category
        this.achievementsByCategory = await achievementsService.getAchievementsByCategory();

        // Load stats
        this.stats = await achievementsService.getStats();

        // Debug logging
        console.log("----- ACHIEVEMENT DISPLAY DIAGNOSTICS -----");
        console.log("Current filter:", this.filter);

        // Log information about categories and achievement counts
        for (const categoryId in this.achievementsByCategory) {
          const achievements = this.achievementsByCategory[categoryId] || [];
          const unlocked = achievements.filter(a => a.isUnlocked).length;
          console.log(`Category ${categoryId}: ${achievements.length} total, ${unlocked} unlocked`);

          // Log full list of unlocked achievements in this category
          if (unlocked > 0) {
            console.log("Unlocked achievements in this category:",
                achievements.filter(a => a.isUnlocked).map(a => a.id));
          }
        }

        // Calculate total unlocked achievements across all categories
        let totalUnlocked = 0;
        for (const categoryId in this.achievementsByCategory) {
          const achievements = this.achievementsByCategory[categoryId] || [];
          totalUnlocked += achievements.filter(a => a.isUnlocked).length;
        }
        console.log("Total unlocked achievements across all categories:", totalUnlocked);

        // Check stats consistency
        console.log("Stats object shows:", this.stats.unlockedCount, "unlocked");
        console.log("----- END DIAGNOSTICS -----");

        this.isLoading = false;
      } catch (error) {
        console.error('[AchievementsPage] Error loading achievements:', error);
        this.error = this.$t('achievements.error.message');
        this.isLoading = false;
      }
    },

    filterAchievements(achievements) {
      if (!Array.isArray(achievements)) {
        return [];
      }

      console.log("Filtering", achievements.length, "achievements:");

      const filtered = achievements.filter(achievement => {
        // Filter by search query
        const searchMatch = !this.searchQuery ||
            (achievement.title && achievement.title.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
            (achievement.description && achievement.description.toLowerCase().includes(this.searchQuery.toLowerCase()));

        // Filter by unlock status
        const statusMatch = this.filter === 'all' ||
            (this.filter === 'unlocked' && achievement.isUnlocked) ||
            (this.filter === 'locked' && !achievement.isUnlocked);

        return searchMatch && statusMatch;
      });

      console.log("After filtering:", filtered.length, "achievements");

      // Log how many achievements are unlocked in this category
      const unlocked = filtered.filter(a => a.isUnlocked).length;
      if (unlocked > 0) {
        console.log(unlocked, "unlocked achievements in this category:",
            filtered.filter(a => a.isUnlocked).map(a => a.id));
      }

      return filtered;
    },

    shouldHideAchievement(achievement) {
      // Check achievement is valid
      if (!achievement) {
        console.warn("[AchievementsPage] Attempted to check a null/undefined achievement");
        return true;
      }

      // Check achievement fields exist (defensive)
      const title = achievement.title || '';
      const description = achievement.description || '';
      const isUnlocked = !!achievement.isUnlocked;

      // Filter by search query
      if (this.searchQuery) {
        const matchesTitle = title.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesDescription = description.toLowerCase().includes(this.searchQuery.toLowerCase());

        if (!matchesTitle && !matchesDescription) {
          return true;
        }
      }

      // Filter by unlock status
      if (this.filter === 'unlocked' && !isUnlocked) {
        return true;
      }

      if (this.filter === 'locked' && isUnlocked) {
        return true;
      }

      return false;
    },

    hasCategoryAchievements(categoryId) {
      const achievements = this.achievementsByCategory[categoryId] || [];
      return this.filterAchievements(achievements).length > 0;
    },

    resetFilters() {
      this.searchQuery = '';
      this.filter = 'all';
    },

    toggleDebugPanel() {
      this.showDebugPanel = !this.showDebugPanel;
    },

    async unlockRandomAchievement() {
      try {
        console.log("[AchievementsPage] Unlocking random achievement...");
        const success = await achievementsService.unlockRandomAchievement();

        if (success) {
          console.log("[AchievementsPage] Successfully unlocked random achievement");
          // Reload achievements to refresh the display
          this.loadAchievements();
        } else {
          console.log("[AchievementsPage] Could not unlock random achievement");
        }
      } catch (error) {
        console.error('[AchievementsPage] Error unlocking random achievement:', error);
      }
    },

    async resetAllAchievements() {
      if (confirm(this.$t('achievements.confirmReset'))) {
        try {
          console.log("[AchievementsPage] Resetting all achievements...");
          await achievementsService.resetAllAchievements();

          // Reload achievements to reflect changes
          this.loadAchievements();
        } catch (error) {
          console.error('[AchievementsPage] Error resetting achievements:', error);
        }
      }
    },

    checkAchievementStatus() {
      console.log("[AchievementsPage] Checking achievement status...");
      this.loadAchievements();
    }
  },

  async mounted() {
    console.log("[AchievementsPage] Component mounted");
    await this.loadAchievements();

    // Check for new achievements every 30 seconds
    this.refreshInterval = setInterval(() => {
      console.log("[AchievementsPage] Refreshing achievements data");
      this.loadAchievements();
    }, 30000);

    // Listen for task completion events to check for new achievements
    document.addEventListener('task-completed', () => {
      console.log("[AchievementsPage] Task completed event detected");
      setTimeout(() => this.loadAchievements(), 1000);
    });

    // Also listen for task creation events
    document.addEventListener('task-created', () => {
      console.log("[AchievementsPage] Task created event detected");
      setTimeout(() => this.loadAchievements(), 1000);
    });
  },

  beforeUnmount() {
    console.log("[AchievementsPage] Component will unmount");
    // Clear refresh interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Remove event listeners
    document.removeEventListener('task-completed', this.checkAchievementStatus);
    document.removeEventListener('task-created', this.checkAchievementStatus);
  }
};
</script>

<style scoped>
.achievements-page {
  padding: 2rem;
  min-height: 100vh;
  color: var(--color-text);
}

.achievements-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 3rem 1rem;
  background: var(--color-card-bg);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.achievements-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, var(--color-primary-light) 0%, transparent 70%);
  opacity: 0.1;
}

.achievements-header-content {
  position: relative;
  z-index: 1;
}

.achievements-title {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  background: linear-gradient(to right, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeSlideDown var(--transition-medium) forwards;
}

.achievements-subtitle {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  animation: fadeSlideDown var(--transition-medium) 0.1s forwards;
}

.achievements-stats {
  animation: fadeSlideDown var(--transition-medium) 0.2s forwards;
  max-width: 900px;
  margin: 0 auto;
}

.stat-row {
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-circle {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 1rem;
}

.circular-chart {
  width: 100%;
  height: 100%;
}

.circle-bg {
  fill: none;
  stroke: var(--color-card-bg-hover);
  stroke-width: 3;
}

.circle {
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.8s ease;
}

.stat-percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-text);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.total-points, .streak-counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.points-icon, .streak-icon {
  font-size: 2.5rem;
  animation: pulse 1.5s infinite alternate;
}

.points-value, .streak-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-text);
}

.search-filter-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 0 0.5rem;
}

.search-box {
  position: relative;
  max-width: 300px;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-card-bg);
  color: var(--color-text);
  font-size: 0.9rem;
  transition: all var(--transition-medium);
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
  outline: none;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
}

.filter-container {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.75rem 1.25rem;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-medium);
}

.filter-btn:hover {
  background: var(--color-card-bg-hover);
}

.filter-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  font-weight: 500;
}

/* Loading & Error states */
.achievements-loading,
.achievements-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: var(--color-card-bg);
  border-radius: 16px;
  margin-bottom: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(var(--color-primary-rgb), 0.1);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

.achievements-error svg {
  color: var(--color-danger);
  margin-bottom: 1rem;
  width: 48px;
  height: 48px;
}

.achievements-error h3 {
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.achievements-error p {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-medium);
}

.retry-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

/* Achievements Grid */
.achievements-grid {
  display: grid;
  gap: 2.5rem;
  max-width: 1280px;
  margin: 0 auto;
  animation: fadeIn 0.5s forwards;
}

.achievement-category {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  transition: all var(--transition-medium);
  animation: fadeSlideUp var(--transition-medium) forwards;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
}

.achievement-category:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.category-icon {
  font-size: 1.8rem;
  background: rgba(var(--color-primary-rgb), 0.1);
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.category-title {
  font-size: 1.5rem;
  color: var(--color-text);
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 0.5rem;
  display: inline-block;
}

.achievements-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.achievement-card {
  position: relative;
  transition: all var(--transition-medium);
  transform-style: preserve-3d;
  perspective: 1000px;
}

.achievement-card-inner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--color-card-bg-hover);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  transition: all var(--transition-medium);
  position: relative;
  overflow: hidden;
  height: 100%;
}

.achievement-card:hover .achievement-card-inner {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary-light);
}

.achievement-card.locked .achievement-card-inner {
  background: var(--color-card-bg);
  filter: grayscale(0.7);
  opacity: 0.8;
}

.achievement-card.locked:hover .achievement-card-inner {
  opacity: 0.9;
  filter: grayscale(0.3);
}

.achievement-card.secret .achievement-card-inner {
  background: rgba(var(--color-primary-rgb), 0.05);
  border-style: dashed;
}

.achievement-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  flex-shrink: 0;
  transition: all var(--transition-medium);
}

.achievement-card:hover .achievement-icon {
  transform: scale(1.1) rotate(5deg);
}

.locked-icon {
  filter: grayscale(1);
}

.achievement-info {
  flex: 1;
  overflow: hidden;
}

.achievement-info h3 {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
  color: var(--color-text);
}

.achievement-info p {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.achievement-progress {
  margin-top: 0.75rem;
}

.progress-bar {
  height: 6px;
  background: var(--color-card-bg);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-align: right;
}

.achievement-points {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-primary);
}

.achievement-status {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.unlocked {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

.status-badge.locked {
  background: rgba(158, 158, 158, 0.2);
  color: #9E9E9E;
}

.status-badge.secret {
  background: rgba(var(--color-primary-rgb), 0.2);
  color: var(--color-primary);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  text-align: center;
}

.empty-state-content {
  max-width: 300px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.empty-state p {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
}

.reset-btn {
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-medium);
}

.reset-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

/* Debug Panel */
.debug-panel {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 50;
  background: rgba(0, 0, 0, 0.9);
  padding: 1rem;
  border-radius: 12px;
  max-width: 320px;
  border: 1px solid var(--color-border);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  color: white;
}

.debug-header h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--color-primary);
}

.debug-close-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.debug-close-btn:hover {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.1);
}

.debug-btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.debug-btn.unlock-random {
  background: var(--color-primary);
  color: white;
}

.debug-btn.unlock-random:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.debug-btn.reset-all {
  background: #ff4444;
  color: white;
}

.debug-btn.reset-all:hover {
  background: #cc0000;
  transform: translateY(-1px);
}

.debug-achievements-list {
  margin-top: 1rem;
  font-size: 0.75rem;
  color: white;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
}

.debug-achievements-list h4 {
  margin: 0 0 0.5rem 0;
  color: var(--color-primary);
}

.unlocked-debug {
  color: #4CAF50;
  margin-right: 0.5rem;
}

/* Debug Toggle Button */
.debug-toggle {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  z-index: 50;
}

.debug-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: var(--color-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.debug-toggle-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Animations */
@keyframes fadeSlideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.1);
  }
}

.achievement-list-enter-active,
.achievement-list-leave-active {
  transition: all var(--transition-medium);
}

.achievement-list-enter-from,
.achievement-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.achievement-list-move {
  transition: transform var(--transition-medium);
}

/* Responsive styles */
@media (max-width: 1024px) {
  .achievements-page {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .achievements-page {
    padding: 1rem;
  }

  .achievements-title {
    font-size: 2rem;
  }

  .search-filter-container {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .filter-container {
    justify-content: stretch;
  }

  .filter-btn {
    flex: 1;
    text-align: center;
    padding: 0.75rem 0.5rem;
  }

  .achievements-list {
    grid-template-columns: 1fr;
  }

  .achievement-category {
    padding: 1.5rem;
  }

  .stat-row {
    flex-direction: column;
    gap: 2rem;
  }

  .debug-panel {
    max-width: 280px;
  }
}

@media (max-width: 480px) {
  .achievements-header {
    padding: 2rem 1rem;
  }

  .achievements-title {
    font-size: 1.75rem;
  }

  .achievements-subtitle {
    font-size: 0.9rem;
  }

  .stat-circle {
    width: 100px;
    height: 100px;
  }

  .category-title {
    font-size: 1.25rem;
  }

  .debug-panel {
    left: 0.5rem;
    bottom: 0.5rem;
    max-width: calc(100vw - 1rem);
  }

  .debug-toggle {
    left: 0.5rem;
    bottom: 0.5rem;
  }
}
</style>