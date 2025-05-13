<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="profile-header">
        <div class="header-content">
          <h1 class="profile-title">{{ $t('profile.title') }}</h1>
          <p class="profile-subtitle">{{ $t('profile.subtitle') }}</p>
        </div>
        <button v-if="isEditing" class="btn save-profile" @click="saveProfile">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          <span>{{ $t('profile.saveChanges') }}</span>
        </button>
        <button v-else class="btn edit-profile" @click="startEditing">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <span>{{ $t('profile.edit') }}</span>
        </button>
      </div>

      <div class="profile-sections">
        <div class="profile-section user-info">
          <div class="section-header">
            <h2>{{ $t('profile.personalInfo') }}</h2>
          </div>
          <div class="section-content">
            <div class="avatar-container">
              <div class="avatar" :style="avatarStyle">
                <div v-if="!userData.avatarUrl && !isEditing" class="avatar-placeholder">
                  {{ userInitials }}
                </div>
                <input
                    v-if="isEditing"
                    type="file"
                    ref="fileInput"
                    accept="image/*"
                    class="avatar-input"
                    @change="handleAvatarChange"
                />
                <div v-if="isEditing" class="avatar-overlay">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
              </div>
              <div class="user-details">
                <div v-if="!isEditing" class="user-name">{{ userData.name }}</div>
                <input
                    v-else
                    type="text"
                    class="edit-input name-input"
                    v-model="editedProfile.name"
                    :placeholder="$t('profile.nameLabel')"
                />
                <div class="user-email">{{ userData.email }}</div>
                <div v-if="!isEditing && userData.jobTitle" class="user-job-title">{{ userData.jobTitle }}</div>
                <input
                    v-else
                    type="text"
                    class="edit-input"
                    v-model="editedProfile.jobTitle"
                    :placeholder="$t('profile.jobTitleLabel')"
                />
                <div v-if="!isEditing && userData.location" class="user-location">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{{ userData.location }}</span>
                </div>
                <input
                    v-else
                    type="text"
                    class="edit-input"
                    v-model="editedProfile.location"
                    :placeholder="$t('profile.locationLabel')"
                />
              </div>
            </div>

            <div class="bio-container">
              <h3>{{ $t('profile.bioTitle') }}</h3>
              <div v-if="!isEditing" class="user-bio">
                {{ userData.bio || $t('profile.noBio') }}
              </div>
              <textarea
                  v-else
                  class="edit-textarea bio-textarea"
                  v-model="editedProfile.bio"
                  :placeholder="$t('profile.bioPlaceholder')"
                  rows="5"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="profile-section user-stats">
          <div class="section-header">
            <h2>{{ $t('profile.stats') }}</h2>
          </div>
          <div class="stats-container">
            <div class="stat-card">
              <div class="stat-value">{{ userData.totalTasks || 0 }}</div>
              <div class="stat-label">{{ $t('profile.totalTasks') }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ userData.completedTasks || 0 }}</div>
              <div class="stat-label">{{ $t('profile.completedTasks') }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ userData.achievements || 0 }}</div>
              <div class="stat-label">{{ $t('profile.achievements') }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ userData.achievementPoints || 0 }}</div>
              <div class="stat-label">{{ $t('profile.achievementPoints') }}</div>
            </div>
          </div>

          <div class="completion-rate">
            <h3>{{ $t('profile.completionRate') }}</h3>
            <div class="progress-container">
              <div class="progress-bar" :style="{ width: completionRate + '%' }"></div>
            </div>
            <div class="progress-label">{{ completionRate }}%</div>
          </div>
        </div>

        <div class="profile-section preferences">
          <div class="section-header">
            <h2>{{ $t('profile.preferences') }}</h2>
          </div>
          <div class="preferences-container">
            <div class="preference-item">
              <div class="preference-label">{{ $t('profile.theme') }}</div>
              <div class="theme-selector">
                <button
                    class="theme-option"
                    :class="{ active: userData.theme === 'dark' }"
                    @click="updateTheme('dark')"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                  <span>{{ $t('profile.darkTheme') }}</span>
                </button>
                <button
                    class="theme-option"
                    :class="{ active: userData.theme === 'light' }"
                    @click="updateTheme('light')"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                  <span>{{ $t('profile.lightTheme') }}</span>
                </button>
              </div>
            </div>

            <div class="preference-item">
              <div class="preference-label">{{ $t('profile.language') }}</div>
              <div class="language-selector">
                <button
                    v-for="lang in availableLanguages"
                    :key="lang.code"
                    class="language-option"
                    :class="{ active: currentLanguage === lang.code }"
                    @click="changeLanguage(lang.code)"
                >
                  <span>{{ lang.name }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-section security">
          <div class="section-header">
            <h2>{{ $t('profile.security') }}</h2>
          </div>
          <div class="security-container">
            <button class="btn change-password-btn" @click="showPasswordModal = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>{{ $t('profile.changePassword') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Password Change Modal -->
    <div v-if="showPasswordModal" class="modal">
      <div class="modal-backdrop" @click="showPasswordModal = false"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ $t('profile.changePassword') }}</h3>
          <button class="close-btn" @click="showPasswordModal = false">×</button>
        </div>
        <div class="modal-body">
          <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
          <div v-if="passwordSuccess" class="success-message">{{ passwordSuccess }}</div>

          <div class="form-group">
            <label for="current-password">{{ $t('profile.currentPassword') }}</label>
            <input
                type="password"
                id="current-password"
                v-model="passwordForm.currentPassword"
                :placeholder="$t('profile.currentPasswordPlaceholder')"
                class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="new-password">{{ $t('profile.newPassword') }}</label>
            <input
                type="password"
                id="new-password"
                v-model="passwordForm.newPassword"
                :placeholder="$t('profile.newPasswordPlaceholder')"
                class="form-control"
                @input="checkPasswordStrength"
            />

            <div v-if="passwordForm.newPassword" class="password-strength">
              <div class="strength-label">{{ $t('auth.passwordStrength.weak') }}: <span :class="strengthClass">{{ passwordStrength }}</span></div>
              <div class="strength-meter">
                <div class="strength-segment" :class="{ active: passwordScore >= 1 }"></div>
                <div class="strength-segment" :class="{ active: passwordScore >= 2 }"></div>
                <div class="strength-segment" :class="{ active: passwordScore >= 3 }"></div>
                <div class="strength-segment" :class="{ active: passwordScore >= 4 }"></div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="confirm-password">{{ $t('profile.confirmPassword') }}</label>
            <input
                type="password"
                id="confirm-password"
                v-model="passwordForm.confirmPassword"
                :placeholder="$t('profile.confirmPasswordPlaceholder')"
                class="form-control"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="showPasswordModal = false">{{ $t('profile.cancel') }}</button>
          <button class="btn btn-primary" @click="changePassword" :disabled="isPasswordChanging">
            <span v-if="!isPasswordChanging">{{ $t('profile.updatePassword') }}</span>
            <span v-else class="loading-spinner"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import apiService from '../services/api';

export default {
  setup() {
    const i18n = useI18n();
    return { i18n };
  },

  data() {
    return {
      userData: {
        id: null,
        name: '',
        email: '',
        bio: '',
        avatarUrl: '',
        theme: 'dark',
        location: '',
        jobTitle: '',
        totalTasks: 0,
        completedTasks: 0,
        achievements: 0,
        achievementPoints: 0
      },
      isEditing: false,
      editedProfile: {
        name: '',
        bio: '',
        jobTitle: '',
        location: ''
      },
      selectedAvatar: null,
      isLoading: false,
      error: null,
      showPasswordModal: false,
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordError: null,
      passwordSuccess: null,
      isPasswordChanging: false,
      passwordScore: 0,
      passwordStrength: '',
      strengthClass: '',
      availableLanguages: [
        { code: 'en', name: 'English' },
        { code: 'ru', name: 'Русский' },
        { code: 'lv', name: 'Latviešu' }
      ]
    };
  },

  computed: {
    userInitials() {
      if (!this.userData.name) return '';
      return this.userData.name
          .split(' ')
          .map(word => word.charAt(0).toUpperCase())
          .slice(0, 2)
          .join('');
    },
    avatarStyle() {
      if (this.userData.avatarUrl) {
        return {
          backgroundImage: `url(${this.userData.avatarUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      }
      return {};
    },
    completionRate() {
      if (!this.userData.totalTasks || this.userData.totalTasks === 0) {
        return 0;
      }
      const rate = Math.round((this.userData.completedTasks / this.userData.totalTasks) * 100);
      return Math.min(rate, 100);
    },
    currentLanguage() {
      return this.i18n.locale.value;
    }
  },

  async mounted() {
    await this.loadUserProfile();
  },

  methods: {
    async loadUserProfile() {
      this.isLoading = true;
      this.error = null;

      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          this.$router.push('/auth');
          return;
        }

        const response = await apiService.getUserProfile(userId);
        this.userData = response.data;

        // Initialize edited profile with current values
        this.editedProfile = {
          name: this.userData.name,
          bio: this.userData.bio || '',
          jobTitle: this.userData.jobTitle || '',
          location: this.userData.location || ''
        };
      } catch (error) {
        console.error('Failed to load user profile:', error);
        this.error = error.response?.data?.error || 'Failed to load profile data';
      } finally {
        this.isLoading = false;
      }
    },

    startEditing() {
      this.isEditing = true;
    },

    async saveProfile() {
      this.isLoading = true;

      try {
        const userId = localStorage.getItem('user_id');

        // Upload avatar if selected
        if (this.selectedAvatar) {
          await this.uploadAvatar();
        }

        // Update profile data
        const profileData = {
          name: this.editedProfile.name,
          bio: this.editedProfile.bio,
          jobTitle: this.editedProfile.jobTitle,
          location: this.editedProfile.location
        };

        await apiService.updateProfile(userId, profileData);

        // Reload user profile
        await this.loadUserProfile();

        this.isEditing = false;
        this.selectedAvatar = null;
      } catch (error) {
        console.error('Failed to save profile:', error);
        // Display error to user
      } finally {
        this.isLoading = false;
      }
    },

    handleAvatarChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedAvatar = file;

        // Preview the image
        const reader = new FileReader();
        reader.onload = (e) => {
          this.avatarPreview = e.target.result;
          // Update avatar style for immediate feedback
          this.$el.querySelector('.avatar').style.backgroundImage = `url(${e.target.result})`;
          this.$el.querySelector('.avatar').style.backgroundSize = 'cover';
          this.$el.querySelector('.avatar').style.backgroundPosition = 'center';
        };
        reader.readAsDataURL(file);
      }
    },

    async uploadAvatar() {
      if (!this.selectedAvatar) return;

      const formData = new FormData();
      formData.append('file', this.selectedAvatar);

      try {
        const userId = localStorage.getItem('user_id');
        const response = await apiService.uploadAvatar(userId, formData);
        this.userData.avatarUrl = response.data.avatarUrl;
        return response.data.avatarUrl;
      } catch (error) {
        console.error('Failed to upload avatar:', error);
        throw error;
      }
    },

    async updateTheme(theme) {
      if (this.userData.theme === theme) return;

      try {
        const userId = localStorage.getItem('user_id');
        await apiService.updateProfile(userId, { theme });

        // Update theme in localStorage and toggle class
        localStorage.setItem('theme', theme);
        document.documentElement.classList.toggle('light-theme', theme === 'light');

        // Update local state
        this.userData.theme = theme;
      } catch (error) {
        console.error('Failed to update theme:', error);
      }
    },

    changeLanguage(lang) {
      this.i18n.locale.value = lang;
      localStorage.setItem('language', lang);
    },

    checkPasswordStrength() {
      const password = this.passwordForm.newPassword;

      if (!password) {
        this.passwordScore = 0;
        this.passwordStrength = '';
        return;
      }

      let score = 0;

      if (password.length >= 8) score++;
      if (password.length >= 10) score++;

      if (/[A-Z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;

      this.passwordScore = Math.min(score, 4);

      const strengthTexts = [
        this.i18n.t('auth.passwordStrength.weak'),
        this.i18n.t('auth.passwordStrength.fair'),
        this.i18n.t('auth.passwordStrength.good'),
        this.i18n.t('auth.passwordStrength.strong'),
        this.i18n.t('auth.passwordStrength.veryStrong')
      ];
      const strengthClasses = ['weak', 'fair', 'good', 'strong', 'very-strong'];

      this.passwordStrength = strengthTexts[Math.min(this.passwordScore, 4)];
      this.strengthClass = strengthClasses[Math.min(this.passwordScore, 4)];
    },

    async changePassword() {
      this.passwordError = null;
      this.passwordSuccess = null;

      // Validation
      if (!this.passwordForm.currentPassword) {
        this.passwordError = this.i18n.t('profile.errors.currentPasswordRequired');
        return;
      }

      if (!this.passwordForm.newPassword) {
        this.passwordError = this.i18n.t('profile.errors.newPasswordRequired');
        return;
      }

      if (this.passwordForm.newPassword.length < 8) {
        this.passwordError = this.i18n.t('profile.errors.passwordTooShort');
        return;
      }

      if (this.passwordScore < 2) {
        this.passwordError = this.i18n.t('profile.errors.passwordTooWeak');
        return;
      }

      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.passwordError = this.i18n.t('profile.errors.passwordsDoNotMatch');
        return;
      }

      this.isPasswordChanging = true;

      try {
        const userId = localStorage.getItem('user_id');
        await apiService.changePassword(userId, {
          currentPassword: this.passwordForm.currentPassword,
          newPassword: this.passwordForm.newPassword
        });

        this.passwordSuccess = this.i18n.t('profile.passwordChangeSuccess');

        // Reset form
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };

        // Close modal after delay
        setTimeout(() => {
          this.showPasswordModal = false;
          this.passwordSuccess = null;
        }, 2000);
      } catch (error) {
        console.error('Failed to change password:', error);
        this.passwordError = error.response?.data?.error || this.i18n.t('profile.errors.passwordChangeFailed');
      } finally {
        this.isPasswordChanging = false;
      }
    }
  }
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 2rem;
  color: var(--color-text);
}

.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.profile-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.profile-subtitle {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.edit-profile, .save-profile {
  background: var(--color-primary);
  color: white;
}

.edit-profile:hover, .save-profile:hover {
  background: var(--color-primary-dark);
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(99, 102, 241, 0.3);
}

.profile-sections {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.profile-section {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease;
}

.profile-section:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1rem;
}

.section-header h2 {
  font-size: 1.5rem;
  color: var(--color-text);
}

.user-info {
  grid-column: 1;
  grid-row: 1 / span 2;
}

.avatar-container {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--color-card-bg-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: var(--color-text);
  position: relative;
  border: 3px solid var(--color-primary);
  overflow: hidden;
}

.avatar-placeholder {
  font-weight: 600;
}

.avatar-input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar:hover .avatar-overlay {
  opacity: 1;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.user-email {
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.user-job-title {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: var(--color-primary);
}

.user-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.edit-input {
  width: 100%;
  padding: 0.75rem;
  background: var(--color-card-bg-hover);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  margin-bottom: 1rem;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.edit-input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.name-input {
  font-size: 1.2rem;
  font-weight: 600;
}

.bio-container {
  margin-top: 1rem;
}

.bio-container h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.user-bio {
  color: var(--color-text-secondary);
  line-height: 1.6;
  white-space: pre-line;
}

.edit-textarea {
  width: 100%;
  padding: 0.75rem;
  background: var(--color-card-bg-hover);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 1rem;
  resize: vertical;
  min-height: 150px;
  font-family: inherit;
  transition: all 0.3s ease;
}

.edit-textarea:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.user-stats {
  grid-column: 2;
  grid-row: 1;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-card {
  background: var(--color-card-bg-hover);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.completion-rate {
  margin-top: 2rem;
}

.completion-rate h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.progress-container {
  height: 8px;
  background: var(--color-card-bg-hover);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.8s ease;
}

.progress-label {
  text-align: right;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.preferences {
  grid-column: 2;
  grid-row: 2;
}

.preferences-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.preference-item {
  margin-bottom: 1.5rem;
}

.preference-label {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.theme-selector, .language-selector {
  display: flex;
  gap: 1rem;
}

.theme-option, .language-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--color-card-bg-hover);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-option:hover, .language-option:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.theme-option.active, .language-option.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.security {
  grid-column: 1 / span 2;
  grid-row: 3;
}

.security-container {
  display: flex;
  justify-content: flex-start;
}

.change-password-btn {
  background: var(--color-card-bg-hover);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.change-password-btn:hover {
  background: var(--color-card-bg-hover);
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.modal-content {
  background: var(--bg-gradient-start);
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  border: 1px solid var(--color-border);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 1;
  animation: slideUp 0.3s ease;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.5rem;
  color: var(--color-text);
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: var(--color-text);
  transform: rotate(90deg);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-text);
  font-size: 0.95rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  background: var(--color-card-bg-hover);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.error-message {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.success-message {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.password-strength {
  margin-top: 0.75rem;
  font-size: 0.8rem;
}

.strength-meter {
  display: flex;
  gap: 0.25rem;
  height: 4px;
  margin-top: 0.5rem;
}

.strength-segment {
  flex: 1;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.strength-segment.active:nth-child(1) {
  background: #e53e3e;
}

.strength-segment.active:nth-child(2) {
  background: #f59e0b;
}

.strength-segment.active:nth-child(3) {
  background: #10b981;
}

.strength-segment.active:nth-child(4) {
  background: #059669;
}

.strength-label span.weak {
  color: #e53e3e;
}

.strength-label span.fair {
  color: #f59e0b;
}

.strength-label span.good {
  color: #10b981;
}

.strength-label span.strong,
.strength-label span.very-strong {
  color: #059669;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.btn-cancel:hover {
  color: var(--color-text);
  background: var(--color-card-bg-hover);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(99, 102, 241, 0.3);
}

.btn-primary:disabled {
  background: #a3a3a3;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .profile-sections {
    grid-template-columns: 1fr;
  }

  .user-info,
  .user-stats,
  .preferences,
  .security {
    grid-column: 1;
  }

  .user-info {
    grid-row: 1;
  }

  .user-stats {
    grid-row: 2;
  }

  .preferences {
    grid-row: 3;
  }

  .security {
    grid-row: 4;
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }

  .profile-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .avatar-container {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }

  .theme-selector, .language-selector {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .profile-title {
    font-size: 2rem;
  }

  .avatar {
    width: 100px;
    height: 100px;
    font-size: 2rem;
  }

  .profile-section {
    padding: 1rem;
  }

  .modal-content {
    width: 95%;
  }
}
</style>