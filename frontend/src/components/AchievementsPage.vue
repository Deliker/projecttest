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
                <div class="streak-value">{{ stats.streak }}</div>
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

    <div class="achievements-grid">
      <div class="achievement-category" v-for="category in categories" :key="category.id">
        <div class="category-header">
          <div class="category-icon">{{ category.icon }}</div>
          <h2 class="category-title">{{ $t(`achievements.categories.${category.id}`) }}</h2>
        </div>

        <transition-group name="achievement-list" tag="div" class="achievements-list">
          <div
              v-for="achievement in filterAchievements(achievementsByCategory[category.id])"
              :key="achievement.id"
              class="achievement-card"
              :class="{
              'locked': !achievement.isUnlocked,
              'secret': achievement.secret && !achievement.isUnlocked,
              'achievement-hidden': shouldHideAchievement(achievement)
            }"
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

    <transition name="notification-slide">
      <div v-if="showNotification" class="achievement-notification">
        <div class="achievement-notification-content">
          <div class="achievement-icon">{{ notificationData.icon }}</div>
          <div class="achievement-text">
            <div class="achievement-title">{{ $t('achievements.unlocked') }}</div>
            <div class="achievement-name">{{ notificationData.title }}</div>
            <div class="achievement-description">{{ notificationData.description }}</div>
            <div class="achievement-points">+{{ notificationData.points }} pts</div>
          </div>
          <button @click="showNotification = false" class="notification-close" aria-label="Close notification">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </transition>

  <div v-if="isDevMode" class="debug-panel">
      <button class="debug-btn unlock-random" @click="unlockRandomAchievement">
        Unlock Random Achievement
      </button>
      <button class="debug-btn reset-all" @click="resetAllAchievements">
        Reset All Achievements
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
      showNotification: false,
      notificationData: {
        id: '',
        title: '',
        description: '',
        icon: '🏆',
        points: 0
      },
      isDevMode: process.env.NODE_ENV === 'development'
    };
  },

  computed: {
    showEmptyState() {
      for (const categoryId in this.achievementsByCategory) {
        const filteredAchievements = this.filterAchievements(this.achievementsByCategory[categoryId]);
        if (filteredAchievements.length > 0) {
          return false;
        }
      }
      return true;
    }
  },

  methods: {
    loadAchievements() {
      this.achievementsByCategory = achievementsService.getAchievementsByCategory();

      this.stats = achievementsService.getStats();
    },

    filterAchievements(achievements) {
      if (!achievements) return [];

      return achievements.filter(achievement => {
        const matchesSearch = !this.searchQuery ||
            achievement.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            achievement.description.toLowerCase().includes(this.searchQuery.toLowerCase());

        const matchesFilter = this.filter === 'all' ||
            (this.filter === 'unlocked' && achievement.isUnlocked) ||
            (this.filter === 'locked' && !achievement.isUnlocked);

        return matchesSearch && matchesFilter;
      });
    },

    shouldHideAchievement(achievement) {
      if (this.searchQuery &&
          !achievement.title.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
          !achievement.description.toLowerCase().includes(this.searchQuery.toLowerCase())) {
        return true;
      }
      if (this.filter === 'unlocked' && !achievement.isUnlocked) {
        return true;
      }

      if (this.filter === 'locked' && achievement.isUnlocked) {
        return true;
      }

      return false;
    },

    resetFilters() {
      this.searchQuery = '';
      this.filter = 'all';
    },

    handleAchievementUnlocked(event) {
      const achievementData = event.detail;

      this.loadAchievements();

      this.notificationData = achievementData;
      this.showNotification = true;

      setTimeout(() => {
        this.showNotification = false;
      }, 5000);
    },

    unlockRandomAchievement() {
      achievementsService.unlockRandomAchievement();
      this.loadAchievements();
    },

    resetAllAchievements() {
      if (confirm('Are you sure you want to reset all achievements? This cannot be undone!')) {
        achievementsService.resetAllAchievements();
        this.loadAchievements();
      }
    }
  },

  mounted() {
    this.loadAchievements();

    document.addEventListener('achievement-unlocked', this.handleAchievementUnlocked);
  },

  beforeUnmount() {
    document.removeEventListener('achievement-unlocked', this.handleAchievementUnlocked);
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

@keyframes pulse {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.1);
  }
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
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 0.9rem;
  transition: all var(--transition-medium);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--color-card-bg-hover);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
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

.achievement-hidden {
  display: none;
}

.achievement-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  z-index: 100;
  width: 350px;
  border: 1px solid var(--color-primary);
  animation: fadeSlideIn var(--transition-medium) forwards;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.light-theme .achievement-notification {
  background: rgba(255, 255, 255, 0.9);
}

.achievement-notification-content {
  display: flex;
  gap: 1rem;
  position: relative;
}

.achievement-notification .achievement-icon {
  font-size: 3rem;
  animation: bounce 0.5s infinite alternate;
  background: none;
  width: auto;
  height: auto;
}

.achievement-notification .achievement-text {
  flex: 1;
}

.achievement-notification .achievement-title {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.25rem;
}

.achievement-notification .achievement-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}

.achievement-notification .achievement-description {
  font-size: 0.9rem;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.achievement-notification .achievement-points {
  font-size: 1rem;
  color: var(--color-primary);
  font-weight: 600;
}

.notification-close {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.notification-close:hover {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(90deg);
}

/* Debug панель (только для разработки) */
.debug-panel {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 50;
}

.debug-btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.debug-btn.unlock-random {
  background: var(--color-primary);
  color: white;
}

.debug-btn.reset-all {
  background: #ff4444;
  color: white;
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

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
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

@keyframes bounce {
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

.notification-slide-enter-active,
.notification-slide-leave-active {
  transition: all var(--transition-medium);
}

.notification-slide-enter-from,
.notification-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Media Queries */
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

  .achievement-notification {
    left: 1rem;
    right: 1rem;
    width: auto;
  }
}
</style>