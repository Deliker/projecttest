<template>
  <transition name="notification-slide">
    <div v-if="isVisible" class="achievement-notification">
      <div class="achievement-notification-content">
        <div class="achievement-icon">{{ notification.icon }}</div>
        <div class="achievement-text">
          <div class="achievement-title">{{ $t('achievements.unlocked') }}</div>
          <div class="achievement-name">{{ notification.title }}</div>
          <div class="achievement-description">{{ notification.description }}</div>
          <div class="achievement-points">+{{ notification.points }} pts</div>
        </div>
        <button @click="close" class="notification-close" aria-label="Close notification">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
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
        title: '',
        description: '',
        icon: '🏆',
        points: 0
      },
      timeoutId: null,
      // Keep track of recently shown achievements to prevent duplicates
      recentlyShownAchievements: new Set(),
      // Track when the component is mounted to prevent duplicate event registration
      isMounted: false
    };
  },
  mounted() {
    // Ensure we only register the event listener once by using a window-level check
    if (!window.achievementListenerRegistered) {
      // Add a flag to window to track if the listener is already registered
      window.achievementListenerRegistered = true;

      // Remove any existing listeners first to avoid duplicates
      document.removeEventListener('achievement-unlocked', this.handleAchievementUnlocked);

      // Add the event listener
      document.addEventListener('achievement-unlocked', this.handleAchievementUnlocked);
      console.log('🏆 Achievement notification listener registered (singleton)');
    } else {
      console.log('🏆 Achievement notification listener already registered, skipping');
    }

    this.isMounted = true;
  },
  beforeUnmount() {
    // Only remove event listener if this is the original instance that added it
    if (this.isMounted && window.achievementListenerRegistered) {
      document.removeEventListener('achievement-unlocked', this.handleAchievementUnlocked);
      window.achievementListenerRegistered = false;
      console.log('🏆 Achievement notification listener removed');
    }

    // Clear any pending timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  },
  methods: {
    handleAchievementUnlocked(event) {
      // Handle null or invalid event data
      if (!event || !event.detail) {
        console.warn('Invalid achievement unlock event:', event);
        return;
      }

      const achievementId = event.detail.id || '';

      // Prevent duplicate notifications for the same achievement in a short time period
      if (this.recentlyShownAchievements.has(achievementId)) {
        console.log(`Skipping duplicate notification for achievement: ${achievementId}`);
        return;
      }

      console.log(`Showing notification for achievement: ${achievementId}`);

      // Set notification data
      this.notification = {
        id: achievementId,
        title: event.detail.title || 'Achievement Unlocked',
        description: event.detail.description || '',
        icon: event.detail.icon || '🏆',
        points: event.detail.points || 0
      };

      // Add to recently shown achievements
      this.recentlyShownAchievements.add(achievementId);

      // Auto-clear from recently shown after 10 seconds to prevent memory buildup
      setTimeout(() => {
        this.recentlyShownAchievements.delete(achievementId);
      }, 10000);

      // Show notification
      this.isVisible = true;

      // Play a sound effect if available
      this.playUnlockSound();

      // Auto-hide after delay
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }

      this.timeoutId = setTimeout(() => {
        this.isVisible = false;
      }, 5000);
    },

    close() {
      // Clear any pending timeout
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }

      // Hide notification
      this.isVisible = false;
    },

    playUnlockSound() {
      try {
        // Create a simple audio context and oscillator for a success sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(587.33, audioContext.currentTime); // D5

        // Create gain node for volume control
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Start and stop
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
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  z-index: 10000;
  width: 350px;
  border: 1px solid var(--color-primary);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2), 0 0 10px rgba(var(--color-primary-rgb), 0.3);
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
  background: none;
  border: none;
  position: absolute;
  top: 0;
  right: 0;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-close:hover {
  color: var(--color-text);
  transform: rotate(90deg);
}

@keyframes bounce {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.1);
  }
}

.notification-slide-enter-active,
.notification-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.notification-slide-enter-from,
.notification-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@media (max-width: 480px) {
  .achievement-notification {
    left: 1rem;
    right: 1rem;
    width: auto;
  }
}
</style>