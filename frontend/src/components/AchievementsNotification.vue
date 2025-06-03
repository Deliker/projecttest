<template>
  <transition name="notification-slide">
    <div v-if="isVisible" class="achievement-notification">
      <div class="achievement-notification-content">
        <button @click="close" class="notification-close" aria-label="Close notification">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <div class="achievement-icon">{{ notification.icon }}</div>

        <div class="achievement-text">
          <div class="achievement-title">{{ $t('achievements.unlocked').toUpperCase() }}</div>
          <div class="achievement-name">{{ getTranslatedTitle() }}</div>
          <div class="achievement-description">{{ getTranslatedDescription() }}</div>
          <div class="achievement-points">+{{ notification.points }} pts</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'AchievementNotification',
  data() {
    return {
      isVisible: false,
      notification: {
        id: '',
        titleKey: '',
        descriptionKey: '',
        icon: '🏆',
        points: 0
      },
      timeoutId: null,
      recentlyShownAchievements: new Set(),
      isMounted: false
    };
  },
  mounted() {
    console.log('🏆 AchievementNotification component mounted');

    if (!window.achievementListenerRegistered) {
      document.removeEventListener('achievement-unlocked', this.handleAchievementUnlocked);
      document.addEventListener('achievement-unlocked', this.handleAchievementUnlocked);
      window.achievementListenerRegistered = true;
      console.log('🏆 Achievement notification listener registered');
    }

    this.isMounted = true;
  },
  beforeUnmount() {
    console.log('🏆 AchievementNotification component will unmount');

    if (this.isMounted && window.achievementListenerRegistered) {
      document.removeEventListener('achievement-unlocked', this.handleAchievementUnlocked);
      window.achievementListenerRegistered = false;
      console.log('🏆 Achievement notification listener removed');
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  },
  methods: {
    handleAchievementUnlocked(event) {
      if (!event || !event.detail) {
        console.warn('Invalid achievement unlock event:', event);
        return;
      }

      console.log('🏆 Achievement unlocked event received:', event.detail);

      const achievementId = event.detail.id || '';

      if (this.recentlyShownAchievements.has(achievementId)) {
        console.log(`Skipping duplicate notification for achievement: ${achievementId}`);
        return;
      }

      // Устанавливаем данные уведомления
      this.notification = {
        id: achievementId,
        titleKey: event.detail.titleKey || '',
        descriptionKey: event.detail.descriptionKey || '',
        icon: event.detail.icon || '🏆',
        points: event.detail.points || 0
      };

      this.recentlyShownAchievements.add(achievementId);

      setTimeout(() => {
        this.recentlyShownAchievements.delete(achievementId);
      }, 10000);

      this.isVisible = true;
      console.log('🏆 Showing achievement notification:', this.notification);

      this.playUnlockSound();

      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }

      this.timeoutId = setTimeout(() => {
        this.isVisible = false;
      }, 5000);
    },

    getTranslatedTitle() {
      if (!this.notification.titleKey) {
        return this.$t('achievements.unlocked');
      }

      // Проверяем ключ в секции calendar.achievements
      const calendarKey = `calendar.achievements.${this.notification.titleKey}`;
      if (this.$te(calendarKey)) {
        return this.$t(calendarKey);
      }

      // Проверяем ключ в секции achievements
      const achievementKey = `achievements.${this.notification.titleKey}`;
      if (this.$te(achievementKey)) {
        return this.$t(achievementKey);
      }

      // Fallback
      return this.notification.titleKey || this.$t('achievements.unlocked');
    },

    getTranslatedDescription() {
      if (!this.notification.descriptionKey) {
        return '';
      }

      // Проверяем ключ с суффиксом Desc в calendar.achievements
      let descKey = this.notification.descriptionKey;
      if (!descKey.endsWith('Desc')) {
        descKey = descKey + 'Desc';
      }

      const calendarDescKey = `calendar.achievements.${descKey}`;
      if (this.$te(calendarDescKey)) {
        return this.$t(calendarDescKey);
      }

      // Проверяем без суффикса в calendar.achievements
      const calendarKey = `calendar.achievements.${this.notification.descriptionKey}`;
      if (this.$te(calendarKey)) {
        return this.$t(calendarKey);
      }

      // Проверяем в секции achievements
      const achievementDescKey = `achievements.${descKey}`;
      if (this.$te(achievementDescKey)) {
        return this.$t(achievementDescKey);
      }

      const achievementKey = `achievements.${this.notification.descriptionKey}`;
      if (this.$te(achievementKey)) {
        return this.$t(achievementKey);
      }

      // Fallback
      return this.notification.descriptionKey || '';
    },

    close() {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      this.isVisible = false;
    },

    playUnlockSound() {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(587.33, audioContext.currentTime);

        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        console.error('Error playing achievement sound:', error);
      }
    }
  }
};
</script>

<style scoped>
.achievement-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  z-index: 10000;
  width: 380px;
  border: 2px solid #4A90E2;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3), 0 0 15px rgba(74, 144, 226, 0.3);
}

.achievement-notification-content {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  position: relative;
}

.notification-close {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: rotate(90deg);
}

.achievement-icon {
  font-size: 4rem;
  animation: bounce 0.6s infinite alternate;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
  flex-shrink: 0;
}

.achievement-text {
  flex: 1;
  padding-top: 0.5rem;
}

.achievement-title {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  letter-spacing: 2px;
  margin-bottom: 0.75rem;
}

.achievement-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4A90E2;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.achievement-description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
  line-height: 1.4;
}

.achievement-points {
  font-size: 1.2rem;
  color: #4A90E2;
  font-weight: 700;
}

@keyframes bounce {
  from {
    transform: scale(1) rotate(-5deg);
  }
  to {
    transform: scale(1.1) rotate(5deg);
  }
}

.notification-slide-enter-active,
.notification-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.notification-slide-enter-from {
  transform: translateX(100%) scale(0.8);
  opacity: 0;
}

.notification-slide-leave-to {
  transform: translateX(100%) scale(0.8);
  opacity: 0;
}

@media (max-width: 480px) {
  .achievement-notification {
    left: 1rem;
    right: 1rem;
    width: auto;
    padding: 1.5rem;
  }

  .achievement-icon {
    font-size: 3rem;
  }

  .achievement-name {
    font-size: 1.3rem;
  }

  .achievement-description {
    font-size: 0.9rem;
  }
}
</style>