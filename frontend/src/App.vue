<template>
  <div class="main-container" :class="{ 'light-theme': isLightTheme }">
    <header class="header">
      <div class="header-content">
        <router-link to="/" class="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-icon">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="logo-text">{{ $t('appName') }}</span>
        </router-link>

        <button class="nav-toggle" @click="toggleMobileNav" aria-label="Toggle navigation">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>

        <nav class="nav-links" :class="{ 'nav-open': mobileNavOpen }">
          <router-link to="/calendar" class="nav-item" @click="closeMobileNav">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="nav-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ $t('nav.calendar') }}</span>
          </router-link>

          <!-- New Categories Link -->
          <router-link to="/categories" class="nav-item" @click="closeMobileNav">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="nav-icon">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 14h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 3v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 3v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ $t('nav.categories') }}</span>
          </router-link>

          <router-link to="/achievements" class="nav-item" @click="closeMobileNav">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="nav-icon">
              <path d="M12 15C8.13401 15 5 11.866 5 8V3H19V8C19 11.866 15.866 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ $t('nav.achievements') }}</span>
          </router-link>
          <router-link to="/about" class="nav-item" @click="closeMobileNav">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="nav-icon">
              <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 8V8.01" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 12V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ $t('nav.about') }}</span>
          </router-link>
          <router-link
              v-if="$auth.isAdmin"
              to="/admin"
              class="nav-item"
              @click="closeMobileNav"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="nav-icon">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ $t('nav.admin') }}</span>
          </router-link>
          <!-- Theme toggle button -->
          <div class="theme-toggle-container">
            <button @click="toggleTheme" class="theme-toggle" aria-label="Toggle theme">
              <svg v-if="!isLightTheme" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
                <path d="M12 2V4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M12 20V22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M4 12L2 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M22 12L20 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M19.7778 4.22266L17.5558 6.25424" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M6.44446 17.5557L4.22266 19.7779" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M19.7778 19.7773L17.5558 17.5557" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M6.44446 6.25424L4.22266 4.22266" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <!-- Language selector -->
          <div class="language-selector">
            <button class="language-toggle" @click="toggleLanguageDropdown">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ $t('language.select') }}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :class="{ 'rotate-icon': showLanguageDropdown }">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div v-if="showLanguageDropdown" class="language-dropdown">
              <button
                  v-for="lang in availableLanguages"
                  :key="lang.code"
                  @click="changeLanguage(lang.code)"
                  class="language-option"
                  :class="{ 'active': currentLanguage === lang.code }"
              >
                {{ lang.name }}
              </button>
            </div>
          </div>
        </nav>

        <div class="auth-buttons">
          <div v-if="!isUserAuthenticated" class="auth-buttons-container">
            <router-link :to="{ path: '/auth', query: { mode: 'login' }}" class="btn btn-login">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="btn-icon">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ $t('nav.login') }}</span>
            </router-link>
            <router-link :to="{ path: '/auth', query: { mode: 'register' }}" class="btn btn-register">{{ $t('nav.signup') }}</router-link>
          </div>
          <div v-else class="user-menu">
            <div class="user-info">
              <span class="user-name">{{ currentUserName }}</span>
              <div class="user-actions">
                <router-link to="/profile" class="btn btn-profile">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{{ $t('nav.profile') }}</span>
                </router-link>
                <button @click="logout" class="btn btn-logout">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{{ $t('nav.logout') }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Router view container -->
    <div class="router-view-container">
      <router-view></router-view>
    </div>

    <transition name="achievement-slide">
      <div v-if="showAchievementNotification" class="achievement-notification">
        <div class="achievement-content">
          <div class="achievement-icon">🏆</div>
          <div class="achievement-text">
            <h4>{{ $t('calendar.achievements.unlocked') }}</h4>
            <p>{{ achievementMessage }}</p>
          </div>
          <button @click="closeAchievementNotification" class="achievement-close" aria-label="Close notification">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="achievement-progress">
          <div class="progress-bar" :style="{ width: notificationProgress + '%' }"></div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import { useI18n } from 'vue-i18n';

export default {
  setup() {
    const i18n = useI18n();
    return { i18n };
  },
  data() {
    return {
      showAchievementNotification: false,
      achievementMessage: '',
      notificationProgress: 100,
      notificationTimer: null,
      mobileNavOpen: false,
      isLightTheme: localStorage.getItem('theme') === 'light',
      showLanguageDropdown: false,
      availableLanguages: [
        { code: 'en', name: 'English' },
        { code: 'ru', name: 'Русский' },
        { code: 'lv', name: 'Latviešu' }
      ]
    }
  },
  computed: {
    currentLanguage() {
      return this.i18n.locale.value;
    },
    isUserAuthenticated() {
      return this.$auth.isAuthenticated;
    },
    currentUserName() {
      return this.$auth.user?.name || '';
    }
  },
  watch: {
    isLightTheme(newValue) {
      localStorage.setItem('theme', newValue ? 'light' : 'dark');
      document.documentElement.classList.toggle('light-theme', newValue);
    },
    '$route.path'() {
      // Close mobile nav when route changes
      this.closeMobileNav();
    }
  },
  mounted() {
    document.documentElement.classList.toggle('light-theme', this.isLightTheme);

    // Check and load authentication from localStorage
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        this.$auth.token = token;
        this.$auth.user = JSON.parse(user);
        this.$auth.isAuthenticated = true;
      } catch (e) {
        // If there's an error parsing, reset auth state
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }

    // Close language menu when clicking outside of it
    document.addEventListener('click', this.handleOutsideClick);

    // Listen for achievement unlocked events
    document.addEventListener('achievement-unlocked', this.handleAchievementUnlocked);
  },
  beforeUnmount() {
    if (this.notificationTimer) {
      clearInterval(this.notificationTimer);
    }
    document.removeEventListener('click', this.handleOutsideClick);

    // Remove achievement event listener
    document.removeEventListener('achievement-unlocked', this.handleAchievementUnlocked);
  },
  methods: {
    toggleMobileNav() {
      this.mobileNavOpen = !this.mobileNavOpen;
      document.body.classList.toggle('nav-open', this.mobileNavOpen);
    },
    closeMobileNav() {
      this.mobileNavOpen = false;
      document.body.classList.remove('nav-open');
    },
    closeAchievementNotification() {
      this.showAchievementNotification = false;
      if (this.notificationTimer) {
        clearInterval(this.notificationTimer);
        this.notificationTimer = null;
      }
    },
    toggleTheme() {
      this.isLightTheme = !this.isLightTheme;
    },
    logout() {
      this.$auth.isAuthenticated = false;
      this.$auth.user = null;
      this.$auth.token = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      this.$router.push('/auth');
    },
    toggleLanguageDropdown(event) {
      event.stopPropagation();
      this.showLanguageDropdown = !this.showLanguageDropdown;
    },
    changeLanguage(lang) {
      this.i18n.locale.value = lang;
      localStorage.setItem('language', lang);
      this.showLanguageDropdown = false;

      // Update page title after language change
      const appName = this.i18n.t('appName');
      const path = this.$router.currentRoute.value.path;

      if (path === '/') {
        document.title = appName;
      } else if (path === '/calendar') {
        document.title = `${this.i18n.t('nav.calendar')} - ${appName}`;
      } else if (path === '/achievements') {
        document.title = `${this.i18n.t('nav.achievements')} - ${appName}`;
      } else if (path === '/auth') {
        const mode = this.$router.currentRoute.value.query.mode === 'register'
            ? this.i18n.t('nav.signup')
            : this.i18n.t('nav.login');
        document.title = `${mode} - ${appName}`;
      }
    },
    handleOutsideClick(event) {
      const languageSelector = document.querySelector('.language-selector');
      if (languageSelector && !languageSelector.contains(event.target) && this.showLanguageDropdown) {
        this.showLanguageDropdown = false;
      }
    },
    handleAchievementUnlocked(event) {
      const achievementData = event.detail;

      console.log('Achievement unlocked event received:', achievementData);

      // Set notification data
      this.achievementMessage = `${achievementData.title} - ${achievementData.description}`;
      this.showAchievementNotification = true;
      this.notificationProgress = 100;

      // Clear any existing timer
      if (this.notificationTimer) {
        clearInterval(this.notificationTimer);
      }

      // Create new timer
      this.notificationTimer = setInterval(() => {
        this.notificationProgress -= 1;
        if (this.notificationProgress <= 0) {
          clearInterval(this.notificationTimer);
          this.showAchievementNotification = false;
        }
      }, 50);

      // Auto-close after 5 seconds
      setTimeout(() => {
        if (this.notificationTimer) {
          clearInterval(this.notificationTimer);
          this.showAchievementNotification = false;
        }
      }, 5000);
    }
  }
}
</script>

<style>
/* Component-specific styles */
.main-container {
  min-height: 100vh;
  overflow-x: hidden;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--header-bg);
  z-index: 100;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--header-border);
}

.header-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--color-text);
  z-index: 110;
}

.logo-icon {
  color: var(--color-text);
  transition: transform var(--transition-medium);
}

.logo:hover .logo-icon {
  transform: scale(1.1);
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.nav-toggle {
  display: none;
  background: transparent;
  border: none;
  z-index: 110;
  width: 32px;
  height: 32px;
  position: relative;
  cursor: pointer;
}

.hamburger-line {
  display: block;
  width: 24px;
  height: 2px;
  background-color: var(--color-text);
  margin: 5px auto;
  transition: all var(--transition-fast);
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--nav-item-color);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all var(--transition-medium);
}

.nav-item:hover {
  color: var(--color-text);
  background: var(--nav-item-hover-bg);
  transform: translateY(-2px);
}

.nav-item.active {
  color: var(--color-text);
  background: var(--nav-item-hover-bg);
}

.nav-icon {
  transition: transform var(--transition-medium);
}

.nav-item:hover .nav-icon {
  transform: translateY(-1px);
}

.theme-toggle-container {
  margin-left: 1rem;
}

.theme-toggle {
  background: transparent;
  border: none;
  color: var(--color-text);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.theme-toggle:hover {
  background: var(--nav-item-hover-bg);
  transform: rotate(15deg);
}

.language-selector {
  position: relative;
  margin-left: 1rem;
}

.language-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--nav-item-color);
  background: transparent;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-medium);
}

.language-toggle:hover {
  color: var(--color-text);
  background: var(--nav-item-hover-bg);
}

.rotate-icon {
  transform: rotate(180deg);
  transition: transform var(--transition-fast);
}

.language-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  min-width: 150px;
  background: var(--header-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: var(--box-shadow);
  z-index: 120;
  overflow: hidden;
}

.language-option {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 0.9rem;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.language-option:hover {
  background: var(--nav-item-hover-bg);
}

.language-option.active {
  color: var(--color-primary);
  background: var(--nav-item-hover-bg);
  font-weight: 500;
}

.auth-buttons {
  display: flex;
  align-items: center;
}

.auth-buttons-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 500;
}

.user-actions {
  display: flex;
  gap: 0.75rem;
}

.router-view-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 4rem;
  min-height: calc(100vh - 4rem);
  z-index: 1;
  position: relative;
}

.achievement-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  z-index: 200;
  width: 300px;
  border: 1px solid var(--color-border);
}

.achievement-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.achievement-icon {
  font-size: 2rem;
}

.achievement-text {
  flex: 1;
}

.achievement-text h4 {
  margin: 0;
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.achievement-text p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.achievement-progress {
  margin-top: 0.75rem;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.05s linear;
}

@media (max-width: 1024px) {
  .header-content {
    padding: 0 1.5rem;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }

  .nav-toggle {
    display: block;
  }

  .nav-links {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: var(--header-bg);
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform var(--transition-medium);
    gap: 2.5rem;
    padding: 2rem;
  }

  .nav-links.nav-open {
    transform: translateX(0);
  }

  .auth-buttons {
    z-index: 110;
  }

  .nav-item {
    font-size: 1.2rem;
  }

  .language-toggle {
    font-size: 1.2rem;
  }

  .language-dropdown {
    position: relative;
    width: 100%;
    margin-top: 1rem;
    box-shadow: none;
    border: 1px solid var(--color-border);
  }

  .nav-open .hamburger-line:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
  }

  .nav-open .hamburger-line:nth-child(2) {
    opacity: 0;
  }

  .nav-open .hamburger-line:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
  }
}

@media (max-width: 480px) {
  .auth-buttons-container {
    gap: 0.5rem;
  }

  .logo-text {
    display: none;
  }

  .achievement-notification {
    width: calc(100% - 2rem);
    left: 1rem;
    right: 1rem;
  }
}
</style>