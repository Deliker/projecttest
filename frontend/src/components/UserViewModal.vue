<!-- UserViewModal.vue -->
<template>
  <div class="modal">
    <div class="modal-overlay" @click="close"></div>
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ $t('admin.users.viewUser') }}</h3>
        <button class="close-btn" @click="close">×</button>
      </div>
      <div v-if="loading" class="modal-body loading-container">
        <div class="loading-spinner"></div>
        <p>{{ $t('admin.users.loading') }}</p>
      </div>
      <div v-else-if="error" class="modal-body error-container">
        <p class="error-message">{{ error }}</p>
        <button @click="loadUserDetails" class="btn retry-btn">
          {{ $t('admin.actions.retry') }}
        </button>
      </div>
      <div v-else-if="user" class="modal-body">
        <div class="user-profile">
          <div class="user-header">
            <div class="user-avatar">
              <img v-if="user.avatarUrl" :src="user.avatarUrl" alt="User avatar" />
              <div v-else class="avatar-placeholder">
                {{ getUserInitials() }}
              </div>
            </div>
            <div class="user-basic-info">
              <h2>{{ user.name }}</h2>
              <p class="user-email">{{ user.email }}</p>
              <span class="user-role" :class="{ 'admin-role': isUserAdmin() }">
                {{ isUserAdmin() ? $t('admin.roles.admin') : $t('admin.roles.user') }}
              </span>
            </div>
          </div>

          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-icon tasks-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ user.totalTasks || 0 }}</div>
                <div class="stat-label">{{ $t('admin.users.totalTasks') }}</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon completed-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ user.completedTasks || 0 }}</div>
                <div class="stat-label">{{ $t('admin.users.completedTasks') }}</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon achievements-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="8" r="7"></circle>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ user.achievements || 0 }}</div>
                <div class="stat-label">{{ $t('admin.users.achievements') }}</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon points-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ user.achievementPoints || 0 }}</div>
                <div class="stat-label">{{ $t('admin.users.points') }}</div>
              </div>
            </div>
          </div>

          <div class="user-details">
            <div class="detail-row">
              <span class="detail-label">{{ $t('admin.users.lastActive') }}:</span>
              <span class="detail-value">{{ formatDate(user.lastActive) }}</span>
            </div>

            <div class="detail-row" v-if="user.jobTitle">
              <span class="detail-label">{{ $t('admin.users.jobTitle') }}:</span>
              <span class="detail-value">{{ user.jobTitle }}</span>
            </div>

            <div class="detail-row" v-if="user.location">
              <span class="detail-label">{{ $t('admin.users.location') }}:</span>
              <span class="detail-value">{{ user.location }}</span>
            </div>

            <div class="detail-row" v-if="user.theme">
              <span class="detail-label">{{ $t('admin.users.theme') }}:</span>
              <span class="detail-value">{{ user.theme === 'dark' ? $t('admin.users.darkTheme') : $t('admin.users.lightTheme') }}</span>
            </div>
          </div>

          <div class="bio-section" v-if="user.bio">
            <h4>{{ $t('admin.users.bio') }}</h4>
            <p>{{ user.bio }}</p>
          </div>
        </div>
      </div>
      <div v-else class="modal-body">
        <p class="empty-message">{{ $t('admin.users.userNotFound') }}</p>
      </div>
      <div class="modal-footer">
        <button @click="close" class="btn cancel-btn">{{ $t('admin.actions.close') }}</button>
        <button @click="editUser" class="btn primary-btn">{{ $t('admin.actions.edit') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import apiService from '../services/api';

export default {
  props: {
    userId: {
      type: [Number, String],
      required: true
    }
  },

  emits: ['close', 'edit-user'],

  setup() {
    const i18n = useI18n();
    return { i18n };
  },

  data() {
    return {
      user: null,
      loading: false,
      error: null
    };
  },

  mounted() {
    this.loadUserDetails();
  },

  methods: {
    async loadUserDetails() {
      this.loading = true;
      this.error = null;

      try {
        console.log('Loading user details for ID:', this.userId);
        const response = await apiService.getUserById(this.userId);
        this.user = response.data;
        console.log('User details loaded:', this.user);
      } catch (error) {
        console.error('Failed to load user details:', error);
        this.error = this.$t('admin.errors.loadUserDetails') || 'Failed to load user details';
      } finally {
        this.loading = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return this.$t('admin.users.never') || 'Never';

      return new Date(dateString).toLocaleDateString(this.i18n.locale.value, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    getUserInitials() {
      if (!this.user || !this.user.name) return '?';

      return this.user.name
          .split(' ')
          .map(name => name.charAt(0))
          .join('')
          .toUpperCase()
          .substring(0, 2);
    },

    isUserAdmin() {
      if (!this.user) return false;

      if (typeof this.user.role === 'string') {
        return this.user.role.toUpperCase() === 'ADMIN';
      } else if (typeof this.user.role === 'object' && this.user.role !== null) {
        return this.user.role.name?.toUpperCase() === 'ADMIN';
      }

      return false;
    },

    close() {
      this.$emit('close');
    },

    editUser() {
      this.$emit('edit-user', this.userId);
    }
  }
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
}

.modal-container {
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  background: var(--color-card-bg);
  border-radius: 12px;
  z-index: 1001;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.loading-spinner {
  display: block;
  width: 40px;
  height: 40px;
  margin-bottom: 1rem;
  border: 4px solid rgba(var(--color-primary-rgb), 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--color-primary);
  animation: spin 1s linear infinite;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
}

.error-message {
  color: var(--color-danger);
  text-align: center;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background: var(--color-card-bg-hover);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  cursor: pointer;
}

.empty-message {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 2rem 0;
}

/* User Profile Styles */
.user-profile {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-card-bg-hover);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  background: var(--color-primary);
  color: white;
}

.user-basic-info {
  flex: 1;
}

.user-basic-info h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
}

.user-email {
  margin: 0 0 0.5rem 0;
  color: var(--color-text-secondary);
}

.user-role {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  background: var(--color-card-bg-hover);
  color: var(--color-text);
}

.admin-role {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
}

.user-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat-item {
  background: var(--color-card-bg-hover);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.tasks-icon {
  background: linear-gradient(135deg, #4F46E5, #818CF8);
}

.completed-icon {
  background: linear-gradient(135deg, #10B981, #34D399);
}

.achievements-icon {
  background: linear-gradient(135deg, #F59E0B, #FBBF24);
}

.points-icon {
  background: linear-gradient(135deg, #EC4899, #F472B6);
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.detail-row {
  display: flex;
  align-items: center;
}

.detail-label {
  width: 120px;
  min-width: 120px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.detail-value {
  color: var(--color-text);
}

.bio-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.bio-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.bio-section p {
  margin: 0;
  line-height: 1.5;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-medium);
}

.primary-btn {
  background: var(--color-primary);
  color: white;
}

.primary-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(var(--color-primary-rgb), 0.3);
}

.cancel-btn {
  background: var(--color-card-bg-hover);
  color: var(--color-text);
}

.cancel-btn:hover {
  background: var(--color-border);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

@media (max-width: 768px) {
  .user-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .user-stats {
    grid-template-columns: 1fr 1fr;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .detail-label {
    width: 100%;
  }
}
</style>