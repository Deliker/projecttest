<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- Animated background shape -->
      <div class="background-shape shape-1"></div>
      <div class="background-shape shape-2"></div>

      <!-- Profile header with glassmorphism effect -->
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

      <!-- Main profile sections -->
      <div class="profile-sections">
        <!-- Left column - User info -->
        <div class="profile-column main-column">
          <!-- User info card -->
          <div class="profile-card user-info-card">
            <div class="card-header">
              <h2>{{ $t('profile.personalInfo') }}</h2>
              <div class="card-badge">{{ $t('profile.personal') }}</div>
            </div>

            <div class="user-profile-content">
              <div class="avatar-wrapper">
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

                <div class="avatar-status">
                  <div class="status-indicator online"></div>
                  <span class="status-text">{{ $t('profile.online') }}</span>
                </div>
              </div>

              <div class="user-details">
                <div class="user-details-header">
                  <div v-if="!isEditing" class="user-name">{{ userData.name }}</div>
                  <input
                      v-else
                      type="text"
                      class="edit-input name-input"
                      v-model="editedProfile.name"
                      :placeholder="$t('profile.nameLabel')"
                  />
                  <div v-if="!isEditing && userData.jobTitle" class="user-job-title">{{ userData.jobTitle }}</div>
                  <input
                      v-else
                      type="text"
                      class="edit-input"
                      v-model="editedProfile.jobTitle"
                      :placeholder="$t('profile.jobTitleLabel')"
                  />
                </div>

                <div class="user-details-secondary">
                  <div class="user-detail-item">
                    <div class="detail-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <div class="detail-content">
                      <div class="detail-label">{{ $t('profile.emailLabel') }}</div>
                      <div class="user-email">{{ userData.email }}</div>
                    </div>
                  </div>

                  <div class="user-detail-item">
                    <div class="detail-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <div class="detail-content">
                      <div class="detail-label">{{ $t('profile.locationLabel') }}</div>
                      <div v-if="!isEditing" class="user-location">
                        {{ userData.location || $t('profile.noLocation') }}
                      </div>
                      <input
                          v-else
                          type="text"
                          class="edit-input"
                          v-model="editedProfile.location"
                          :placeholder="$t('profile.locationPlaceholder')"
                      />
                    </div>
                  </div>

                  <div class="user-detail-item">
                    <div class="detail-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                    </div>
                    <div class="detail-content">
                      <div class="detail-label">{{ $t('profile.memberSince') }}</div>
                      <div class="user-member-since">{{ formattedMemberSince }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bio card -->
          <div class="profile-card bio-card">
            <div class="card-header">
              <h2>{{ $t('profile.bioTitle') }}</h2>
            </div>
            <div class="bio-container">
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

          <!-- Security card -->
          <div class="profile-card security-card">
            <div class="card-header">
              <h2>{{ $t('profile.security') }}</h2>
              <div class="card-badge secure">{{ $t('profile.secure') }}</div>
            </div>
            <div class="security-container">
              <div class="security-item">
                <div class="security-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div class="security-details">
                  <div class="security-title">{{ $t('profile.passwordTitle') }}</div>
                  <div class="security-subtitle">{{ $t('profile.passwordSubtitle') }}</div>
                </div>
                <button class="btn change-password-btn" @click="showPasswordModal = true">
                  {{ $t('profile.changePassword') }}
                </button>
              </div>

              <div class="security-item">
                <div class="security-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div class="security-details">
                  <div class="security-title">{{ $t('profile.twoFactorTitle') }}</div>
                  <div class="security-subtitle">{{ $t('profile.twoFactorSubtitle') }}</div>
                </div>
                <label class="switch">
                  <input type="checkbox" v-model="twoFactorEnabled">
                  <span class="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Right column - Stats and preferences -->
        <div class="profile-column secondary-column">
          <!-- Stats card -->
          <div class="profile-card stats-card">
            <div class="card-header">
              <h2>{{ $t('profile.stats') }}</h2>
              <div class="card-badge progress">{{ completionRate }}%</div>
            </div>

            <div class="stats-container">
              <div class="stat-item">
                <div class="stat-icon tasks-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <div class="stat-details">
                  <div class="stat-value">{{ userData.totalTasks || 0 }}</div>
                  <div class="stat-label">{{ $t('profile.totalTasks') }}</div>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon completed-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 11 12 14 22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                </div>
                <div class="stat-details">
                  <div class="stat-value">{{ userData.completedTasks || 0 }}</div>
                  <div class="stat-label">{{ $t('profile.completedTasks') }}</div>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon achievements-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 15C8.13401 15 5 11.866 5 8V3H19V8C19 11.866 15.866 15 12 15Z"/>
                    <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88"/>
                  </svg>
                </div>
                <div class="stat-details">
                  <div class="stat-value">{{ userData.achievements || 0 }}</div>
                  <div class="stat-label">{{ $t('profile.achievements') }}</div>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon points-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="8" r="7"/>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                  </svg>
                </div>
                <div class="stat-details">
                  <div class="stat-value">{{ userData.achievementPoints || 0 }}</div>
                  <div class="stat-label">{{ $t('profile.achievementPoints') }}</div>
                </div>
              </div>
            </div>

            <div class="completion-rate">
              <div class="completion-header">
                <h3>{{ $t('profile.completionRate') }}</h3>
                <div class="completion-percent">{{ completionRate }}%</div>
              </div>
              <div class="progress-container">
                <div class="progress-bar" :style="{ width: completionRate + '%' }"></div>
              </div>
            </div>

            <div class="view-all-stats">
              <router-link to="/statistics" class="view-all-link">
                {{ $t('profile.viewAllStats') }}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </router-link>
            </div>
          </div>

          <!-- Preferences card -->
          <div class="profile-card preferences-card">
            <div class="card-header">
              <h2>{{ $t('profile.preferences') }}</h2>
            </div>

            <div class="preferences-container">
              <!-- Theme selector -->
              <div class="preference-item">
                <div class="preference-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="5"/>
                    <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>
                  </svg>
                </div>
                <div class="preference-details">
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
              </div>

              <!-- Language selector -->
              <div class="preference-item">
                <div class="preference-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/>
                    <path d="M2 12H22"/>
                    <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z"/>
                  </svg>
                </div>
                <div class="preference-details">
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

              <!-- Notification settings -->
              <div class="preference-item">
                <div class="preference-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
                <div class="preference-details">
                  <div class="preference-label">{{ $t('profile.notifications') }}</div>
                  <div class="notification-options">
                    <div class="notification-option">
                      <span>{{ $t('profile.emailNotifications') }}</span>
                      <label class="switch">
                        <input type="checkbox" v-model="emailNotifications">
                        <span class="slider round"></span>
                      </label>
                    </div>
                    <div class="notification-option">
                      <span>{{ $t('profile.taskReminders') }}</span>
                      <label class="switch">
                        <input type="checkbox" v-model="taskReminders">
                        <span class="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Password Change Modal -->
    <transition name="modal-fade">
      <div v-if="showPasswordModal" class="modal">
        <div class="modal-backdrop" @click="showPasswordModal = false"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ $t('profile.changePassword') }}</h3>
            <button class="close-btn" @click="showPasswordModal = false">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div v-if="passwordError" class="error-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {{ passwordError }}
            </div>
            <div v-if="passwordSuccess" class="success-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              {{ passwordSuccess }}
            </div>

            <div class="form-group">
              <label for="current-password">{{ $t('profile.currentPassword') }}</label>
              <div class="password-input-wrapper">
                <input
                    :type="showCurrentPassword ? 'text' : 'password'"
                    id="current-password"
                    v-model="passwordForm.currentPassword"
                    :placeholder="$t('profile.currentPasswordPlaceholder')"
                    class="form-control"
                />
                <button
                    type="button"
                    class="toggle-password-visibility"
                    @click="showCurrentPassword = !showCurrentPassword"
                >
                  <svg v-if="showCurrentPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="new-password">{{ $t('profile.newPassword') }}</label>
              <div class="password-input-wrapper">
                <input
                    :type="showNewPassword ? 'text' : 'password'"
                    id="new-password"
                    v-model="passwordForm.newPassword"
                    :placeholder="$t('profile.newPasswordPlaceholder')"
                    class="form-control"
                    @input="checkPasswordStrength"
                />
                <button
                    type="button"
                    class="toggle-password-visibility"
                    @click="showNewPassword = !showNewPassword"
                >
                  <svg v-if="showNewPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>

              <div v-if="passwordForm.newPassword" class="password-strength">
                <div class="strength-label">{{ $t('profile.passwordStrength') }}: <span :class="strengthClass">{{ passwordStrength }}</span></div>
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
              <div class="password-input-wrapper">
                <input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    id="confirm-password"
                    v-model="passwordForm.confirmPassword"
                    :placeholder="$t('profile.confirmPasswordPlaceholder')"
                    class="form-control"
                />
                <button
                    type="button"
                    class="toggle-password-visibility"
                    @click="showConfirmPassword = !showConfirmPassword"
                >
                  <svg v-if="showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
              <div v-if="passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword" class="password-mismatch">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {{ $t('profile.passwordMismatch') }}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-cancel" @click="showPasswordModal = false">{{ $t('profile.cancel') }}</button>
            <button class="btn btn-primary" @click="changePassword" :disabled="isPasswordChanging || !canSubmitPasswordChange">
              <span v-if="!isPasswordChanging">{{ $t('profile.updatePassword') }}</span>
              <span v-else class="loading-spinner"></span>
            </button>
          </div>
        </div>
      </div>
    </transition>
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
        achievementPoints: 0,
        memberSince: new Date().toISOString() // Default value
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
      ],
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      twoFactorEnabled: false,
      emailNotifications: true,
      taskReminders: true
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
        // Check if the URL already includes http:// or https://
        const avatarUrl = this.userData.avatarUrl.startsWith('http')
            ? this.userData.avatarUrl
            : `http://localhost:8081${this.userData.avatarUrl}`;

        return {
          backgroundImage: `url(${avatarUrl})`,
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
    },

    formattedMemberSince() {
      if (!this.userData.memberSince) return '';

      try {
        const date = new Date(this.userData.memberSince);
        return new Intl.DateTimeFormat(this.currentLanguage, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(date);
      } catch (error) {
        console.error('Error formatting date:', error);
        return '';
      }
    },

    canSubmitPasswordChange() {
      return (
          this.passwordForm.currentPassword &&
          this.passwordForm.newPassword &&
          this.passwordForm.confirmPassword &&
          this.passwordForm.newPassword === this.passwordForm.confirmPassword &&
          this.passwordScore >= 2
      );
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
        this.userData = {
          ...response.data,
          memberSince: response.data.memberSince || new Date().toISOString() // Ensure a default
        };

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

        this.showCurrentPassword = false;
        this.showNewPassword = false;
        this.showConfirmPassword = false;

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
/* Base styling */
:root {
  /* Color variables are defined in the App.vue */
  --color-primary-rgb: 99, 102, 241;
  --color-success: #10b981;
  --color-success-rgb: 16, 185, 129;
  --color-warning: #f59e0b;
  --color-warning-rgb: 245, 158, 11;
  --color-danger: #ef4444;
  --color-danger-rgb: 239, 68, 68;
  --color-info: #3b82f6;
  --color-info-rgb: 59, 130, 246;
}

.profile-page {
  min-height: 100vh;
  padding: 2rem;
  color: var(--color-text);
  position: relative;
  overflow-x: hidden; /* Prevent horizontal overflow */
  display: flex;      /* Use flexbox for better layout control */
  flex-direction: column;
  align-items: center;
}

.profile-container {
  max-width: 1200px;
  width: 100%;        /* Ensure it takes full width up to max-width */
  margin: 0 auto;
  position: relative;
  animation: fadeIn 0.5s ease;
  z-index: 1;         /* Ensure content stays above background shapes */
}

/* Fix 2: Constrain background shapes and make them fixed */
.background-shape {
  position: fixed;     /* Change from absolute to fixed */
  border-radius: 50%;
  opacity: 0.05;
  filter: blur(60px);
  z-index: 0;          /* Ensure they stay below content */
  pointer-events: none; /* Make sure they don't interfere with interactions */
}

.shape-1 {
  top: 5%;
  right: 0;
  width: 400px;
  height: 400px;
  background: linear-gradient(45deg, var(--color-primary), var(--color-secondary));
  animation: gentle-float 20s ease-in-out infinite alternate;
}

.shape-2 {
  bottom: 5%;
  left: 0;
  width: 300px;
  height: 300px;
  background: linear-gradient(45deg, var(--color-secondary), var(--color-accent));
  animation: gentle-float 25s ease-in-out infinite alternate-reverse;
}

/* Fix 3: Gentler animation with less movement to prevent shifting */
@keyframes gentle-float {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    transform: translate(20px, 20px) rotate(5deg); /* Reduced movement */
  }
}

/* Fix 4: Improved responsive layout for smaller screens */
@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }

  .background-shape {
    opacity: 0.03; /* Further reduce opacity on mobile */
  }

  .shape-1, .shape-2 {
    width: 250px;
    height: 250px;
  }
}
/* Profile header */
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  background: rgba(var(--bg-gradient-start-rgb), 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.profile-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeInUp 0.6s ease-out;
}

.profile-subtitle {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  animation: fadeInUp 0.8s ease-out;
}

/* Buttons */
.btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
}

.edit-profile, .save-profile {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 3px 10px rgba(var(--color-primary-rgb), 0.3);
}

.edit-profile:hover, .save-profile:hover {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(var(--color-primary-rgb), 0.4);
}

/* Main layout */
.profile-sections {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 1.5rem;
}

.profile-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Cards */
.profile-card {
  background: rgba(var(--bg-gradient-start-rgb), 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeIn 0.5s ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.profile-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  border-color: rgba(var(--color-primary-rgb), 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.card-header h2 {
  font-size: 1.5rem;
  color: var(--color-text);
  font-weight: 600;
}

.card-badge {
  padding: 0.4rem 0.8rem;
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-badge.secure {
  background: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success);
}

.card-badge.progress {
  background: rgba(var(--color-info-rgb), 0.1);
  color: var(--color-info);
}

/* User info card */
.user-profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
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
  overflow: hidden;
  border: 3px solid var(--color-primary);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
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

.avatar-status {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(var(--color-success-rgb), 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 5px rgba(var(--color-success-rgb), 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(var(--color-success-rgb), 0);
  }
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.user-details-header {
  text-align: center;
  margin-bottom: 0.5rem;
}

.user-name {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
  background: linear-gradient(135deg, var(--color-text), rgba(var(--color-primary-rgb), 0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.user-job-title {
  font-size: 1.1rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.user-details-secondary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-detail-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--color-card-bg-hover);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.user-detail-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.detail-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.user-detail-item:hover .detail-icon {
  transform: scale(1.1);
  background: rgba(var(--color-primary-rgb), 0.2);
}

.detail-content {
  flex: 1;
}

.detail-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.user-email {
  color: var(--color-text);
}

.user-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
}

.user-member-since {
  color: var(--color-text);
}

/* Bio card */
.bio-container {
  padding: 1rem;
}

.user-bio {
  color: var(--color-text-secondary);
  line-height: 1.8;
  white-space: pre-line;
  font-size: 1rem;
}

/* Input fields */
.edit-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  color: var(--color-text);
  margin-bottom: 1rem;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.edit-input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
  transform: translateY(-2px);
}

.name-input {
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
}

.edit-textarea {
  width: 100%;
  padding: 1rem;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  color: var(--color-text);
  font-size: 1rem;
  resize: vertical;
  min-height: 150px;
  font-family: inherit;
  line-height: 1.8;
  transition: all 0.3s ease;
}

.edit-textarea:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
  transform: translateY(-2px);
}

/* Stats card */
.stats-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-card-bg-hover);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.3s ease;
  color: white;
}

.stat-item:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

.tasks-icon {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.completed-icon {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.achievements-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.points-icon {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.stat-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.25rem;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.completion-rate {
  margin: 1.5rem 0;
  padding: 1rem;
  background: var(--color-card-bg-hover);
  border-radius: 12px;
}

.completion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.completion-header h3 {
  font-size: 1.1rem;
  font-weight: 500;
}

.completion-percent {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-primary);
}

.progress-container {
  height: 10px;
  background: rgba(var(--color-text-rgb), 0.1);
  border-radius: 5px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(to right, var(--color-primary), var(--color-secondary));
  border-radius: 5px;
  transition: width 1s ease;
}

.view-all-stats {
  margin-top: 1.5rem;
  text-align: center;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary);
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
}

.view-all-link:hover {
  transform: translateX(5px);
  color: var(--color-primary-dark);
}

/* Preferences card */
.preferences-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.preference-item {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--color-card-bg-hover);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.preference-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

.preference-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.preference-item:hover .preference-icon {
  transform: scale(1.1);
  background: rgba(var(--color-primary-rgb), 0.2);
}

.preference-details {
  flex: 1;
}

.preference-label {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: var(--color-text);
  font-weight: 500;
}

.theme-selector, .language-selector {
  display: flex;
  gap: 0.75rem;
}

.theme-option, .language-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.theme-option:hover, .language-option:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.theme-option.active, .language-option.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  box-shadow: 0 5px 15px rgba(var(--color-primary-rgb), 0.3);
}

.notification-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notification-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--color-card-bg);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.notification-option:hover {
  background: var(--color-card-bg-hover);
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-card-bg);
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: var(--color-text-secondary);
  transition: .4s;
}

input:checked + .slider {
  background-color: var(--color-primary);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--color-primary);
}

input:checked + .slider:before {
  transform: translateX(22px);
  background-color: white;
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

/* Security card */
.security-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--color-card-bg-hover);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.security-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.security-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.security-item:hover .security-icon {
  transform: scale(1.1);
  background: rgba(var(--color-primary-rgb), 0.2);
}

.security-details {
  flex: 1;
}

.security-title {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.security-subtitle {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.change-password-btn {
  padding: 0.6rem 1rem;
  background: var(--color-primary);
  color: white;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.change-password-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(var(--color-primary-rgb), 0.3);
}

/* Modal styles */
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
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(var(--color-primary-rgb), 0.05);
}

.modal-header h3 {
  font-size: 1.5rem;
  color: var(--color-text);
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.close-btn:hover {
  color: var(--color-text);
  background: var(--color-card-bg-hover);
  transform: rotate(90deg);
}

.modal-body {
  padding: 1.5rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(var(--color-danger-rgb), 0.1);
  color: var(--color-danger);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(var(--color-danger-rgb), 0.2);
}

.success-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(var(--color-success-rgb), 0.2);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 500;
}

.password-input-wrapper {
  position: relative;
}

.toggle-password-visibility {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.toggle-password-visibility:hover {
  color: var(--color-text);
}

.form-control {
  width: 100%;
  padding: 0.85rem 1rem;
  background: var(--color-card-bg-hover);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  color: var(--color-text);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
  transform: translateY(-2px);
}

.password-strength {
  margin-top: 1rem;
}

.strength-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.strength-label span {
  font-weight: 600;
}

.strength-label span.weak {
  color: var(--color-danger);
}

.strength-label span.fair {
  color: var(--color-warning);
}

.strength-label span.good {
  color: var(--color-info);
}

.strength-label span.strong,
.strength-label span.very-strong {
  color: var(--color-success);
}

.strength-meter {
  display: flex;
  gap: 0.25rem;
  height: 6px;
  margin-bottom: 0.75rem;
}

.strength-segment {
  flex: 1;
  height: 100%;
  background: rgba(var(--color-text-rgb), 0.1);
  border-radius: 3px;
  transition: background 0.3s ease;
}

.strength-segment.active:nth-child(1) {
  background: var(--color-danger);
}

.strength-segment.active:nth-child(2) {
  background: var(--color-warning);
}

.strength-segment.active:nth-child(3) {
  background: var(--color-info);
}

.strength-segment.active:nth-child(4) {
  background: var(--color-success);
}

.password-mismatch {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-danger);
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: rgba(var(--color-card-bg-rgb), 0.3);
}

.btn-cancel {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
}

.btn-cancel:hover {
  color: var(--color-text);
  background: var(--color-card-bg-hover);
  transform: translateY(-2px);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(var(--color-primary-rgb), 0.3);
}

.btn-primary:disabled {
  background: var(--color-text-secondary);
  cursor: not-allowed;
  opacity: 0.7;
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

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive styles */
@media (max-width: 1200px) {
  .profile-sections {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .profile-column {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }

  .profile-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
    padding: 1.25rem;
  }

  .btn {
    width: 100%;
  }

  .user-profile-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }

  .theme-selector,
  .language-selector {
    flex-direction: column;
  }

  .preference-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .preference-icon {
    margin-bottom: 1rem;
  }

  .security-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1.5rem;
  }

  .security-icon {
    margin-bottom: 0.5rem;
  }

  .change-password-btn {
    width: 100%;
  }

  .modal-content {
    width: 95%;
  }
}

@media (max-width: 480px) {
  .profile-card {
    padding: 1.25rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .card-badge {
    align-self: flex-start;
  }

  .user-detail-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
  }

  .detail-content {
    text-align: center;
  }

  .modal-header {
    padding: 1.25rem;
  }

  .modal-body,
  .modal-footer {
    padding: 1.25rem;
  }

  .modal-footer {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-cancel,
  .btn-primary {
    width: 100%;
  }
}
</style>