// frontend/src/components/AdminPanel.vue
<template>
  <div class="admin-panel">
    <div class="admin-debug-info" v-if="shouldShowDebug">
      <div class="debug-header">
        <h3>Admin Panel Debug Info</h3>
        <button @click="toggleDebugInfo" class="toggle-debug-btn">
          {{ showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info' }}
        </button>
      </div>

      <div v-if="showDebugInfo" class="debug-content">
        <div class="debug-item">
          <strong>Is Authenticated:</strong> {{ $auth.isAuthenticated }}
        </div>
        <div class="debug-item">
          <strong>Current User:</strong> {{ $auth.user ? $auth.user.name : 'None' }}
        </div>
        <div class="debug-item">
          <strong>User Role:</strong> {{ $auth.user ? $auth.user.role : 'None' }}
        </div>
        <div class="debug-item">
          <strong>User ID:</strong> {{ $auth.userId }}
        </div>
        <div class="debug-actions">
          <button @click="checkAdminStatus" class="debug-btn">
            Check Admin Status
          </button>
          <button @click="refreshUserInfo" class="debug-btn">
            Refresh User Info
          </button>
        </div>
        <div v-if="debugMessage" class="debug-message">
          {{ debugMessage }}
        </div>
      </div>
    </div>
    <div class="admin-header">
      <h1 class="admin-title">{{ $t('admin.title') }}</h1>
      <p class="admin-subtitle">{{ $t('admin.subtitle') }}</p>
    </div>

    <div class="admin-tabs">
      <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
      >
        <span class="tab-icon" v-html="tab.icon"></span>
        <span>{{ $t(`admin.tabs.${tab.id}`) }}</span>
      </button>
    </div>

    <div class="admin-content">
      <!-- Users Management Tab -->
      <div v-if="activeTab === 'users'" class="tab-content">
        <div class="panel-header">
          <h2>{{ $t('admin.users.title') }}</h2>
          <div class="search-box">
            <input
                type="text"
                v-model="userSearchQuery"
                :placeholder="$t('admin.users.search')"
                class="search-input"
            />
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" stroke="currentColor" fill="none" stroke-width="2"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
        </div>

        <div class="users-list-container">
          <div v-if="loading" class="loading-spinner"></div>
          <div v-else-if="error" class="error-message">{{ error }}</div>
          <table v-else class="users-table">
            <thead>
            <tr>
              <th>ID</th>
              <th>{{ $t('admin.users.name') }}</th>
              <th>{{ $t('admin.users.email') }}</th>
              <th>{{ $t('admin.users.role') }}</th>
              <th>{{ $t('admin.users.lastActive') }}</th>
              <th>{{ $t('admin.users.actions') }}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <select
                    v-model="user.role"
                    @change="updateUserRole(user.id, user.role)"
                    class="role-select"
                >
                  <option value="USER">{{ $t('admin.roles.user') }}</option>
                  <option value="ADMIN">{{ $t('admin.roles.admin') }}</option>
                </select>
              </td>
              <td>{{ formatDate(user.lastActive) }}</td>
              <td class="actions-cell">
                <button
                    @click="viewUser(user.id)"
                    class="action-btn view-btn"
                    :title="$t('admin.actions.view')"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" fill="none"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" fill="none"/>
                  </svg>
                </button>
                <button
                    @click="editUser(user.id)"
                    class="action-btn edit-btn"
                    :title="$t('admin.actions.edit')"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" fill="none"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" fill="none"/>
                  </svg>
                </button>
                <button
                    @click="confirmDeleteUser(user.id)"
                    class="action-btn delete-btn"
                    :title="$t('admin.actions.delete')"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" fill="none"/>
                  </svg>
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Dashboard Tab -->
      <div v-if="activeTab === 'dashboard'" class="tab-content">
        <div class="panel-header">
          <h2>{{ $t('admin.dashboard.title') }}</h2>
        </div>

        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon users-icon">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" fill="none"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" fill="none"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" fill="none"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" fill="none"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalUsers || 0 }}</div>
              <div class="stat-label">{{ $t('admin.dashboard.totalUsers') }}</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon tasks-icon">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" fill="none"/>
                <polyline points="14 2 14 8 20 8" stroke="currentColor" fill="none"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor"/>
                <polyline points="10 9 9 9 8 9" stroke="currentColor"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalTasks || 0 }}</div>
              <div class="stat-label">{{ $t('admin.dashboard.totalTasks') }}</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon completed-icon">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" fill="none"/>
                <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" fill="none"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.completedTasks || 0 }}</div>
              <div class="stat-label">{{ $t('admin.dashboard.completedTasks') }}</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon achievements-icon">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="7" stroke="currentColor" fill="none"/>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" stroke="currentColor" fill="none"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalAchievements || 0 }}</div>
              <div class="stat-label">{{ $t('admin.dashboard.totalAchievements') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Tab -->
      <div v-if="activeTab === 'settings'" class="tab-content">
        <div class="panel-header">
          <h2>{{ $t('admin.settings.title') }}</h2>
        </div>

        <div class="settings-form">
          <div class="form-group">
            <label>{{ $t('admin.settings.appName') }}</label>
            <input type="text" v-model="settings.appName" class="form-control" />
          </div>

          <div class="form-group">
            <label>{{ $t('admin.settings.defaultLanguage') }}</label>
            <select v-model="settings.defaultLanguage" class="form-control">
              <option value="en">English</option>
              <option value="ru">Русский</option>
              <option value="lv">Latviešu</option>
            </select>
          </div>

          <div class="form-group">
            <label>{{ $t('admin.settings.enableRegistration') }}</label>
            <div class="toggle-switch">
              <input type="checkbox" id="registration-toggle" v-model="settings.enableRegistration" />
              <label for="registration-toggle"></label>
            </div>
          </div>

          <button @click="saveSettings" class="btn primary-btn">
            {{ $t('admin.settings.saveSettings') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-overlay" @click="showDeleteModal = false"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ $t('admin.users.confirmDelete') }}</h3>
          <button class="close-btn" @click="showDeleteModal = false">×</button>
        </div>
        <div class="modal-body">
          <p>{{ $t('admin.users.deleteWarning') }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn cancel-btn" @click="showDeleteModal = false">
            {{ $t('admin.actions.cancel') }}
          </button>
          <button class="btn delete-btn" @click="deleteUser">
            {{ $t('admin.actions.confirm') }}
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
      activeTab: 'users',
      tabs: [
        { id: 'users', icon: '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" fill="none"/><circle cx="9" cy="7" r="4" stroke="currentColor" fill="none"/></svg>' },
        { id: 'dashboard', icon: '<svg width="20" height="20" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" stroke="currentColor" fill="none"/><rect x="14" y="3" width="7" height="5" stroke="currentColor" fill="none"/><rect x="14" y="12" width="7" height="9" stroke="currentColor" fill="none"/><rect x="3" y="16" width="7" height="5" stroke="currentColor" fill="none"/></svg>' },
        { id: 'settings', icon: '<svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" stroke="currentColor" fill="none"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" fill="none"/></svg>' }
      ],
      users: [],
      userSearchQuery: '',
      loading: false,
      error: null,
      stats: {},
      settings: {
        appName: 'TaskMaster',
        defaultLanguage: 'en',
        enableRegistration: true
      },
      showDeleteModal: false,
      userToDelete: null
    };
  },

  computed: {
    filteredUsers() {
      if (!this.userSearchQuery) {
        return this.users;
      }

      const query = this.userSearchQuery.toLowerCase();
      return this.users.filter(user =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }
  },

  methods: {
    async loadUsers() {
      this.loading = true;
      this.error = null;

      try {
        const response = await apiService.getAdminUsers();
        this.users = response.data;
      } catch (error) {
        console.error('Failed to load users:', error);
        this.error = this.$t('admin.errors.loadUsers');
      } finally {
        this.loading = false;
      }
    },

    async loadStats() {
      try {
        const response = await apiService.getAdminStats();
        this.stats = response.data;
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    },

    async updateUserRole(userId, role) {
      try {
        await apiService.updateUserRole(userId, { role });
        // Successful notification could be added here
      } catch (error) {
        console.error('Failed to update user role:', error);
        // Error notification could be added here
      }
    },

    viewUser(userId) {
      // Navigate to user details page or open modal
      this.$router.push(`/admin/users/${userId}`);
    },

    editUser(userId) {
      // Navigate to user edit page or open modal
      this.$router.push(`/admin/users/${userId}/edit`);
    },

    confirmDeleteUser(userId) {
      this.userToDelete = userId;
      this.showDeleteModal = true;
    },

    async deleteUser() {
      if (!this.userToDelete) return;

      try {
        await apiService.deleteUser(this.userToDelete);
        this.users = this.users.filter(user => user.id !== this.userToDelete);
        this.showDeleteModal = false;
        this.userToDelete = null;
      } catch (error) {
        console.error('Failed to delete user:', error);
        // Error notification could be added here
      }
    },

    async saveSettings() {
      try {
        // API call to save settings
        await apiService.updateAdminSettings(this.settings);
        // Success notification could be added here
      } catch (error) {
        console.error('Failed to save settings:', error);
        // Error notification could be added here
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';

      return new Date(dateString).toLocaleDateString(this.i18n.locale.value, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  },

  mounted() {
    this.loadUsers();
    this.loadStats();
  }
};
</script>

<style scoped>
.admin-panel {
  padding: 2rem;
  min-height: 100vh;
  color: var(--color-text);
}

.admin-header {
  margin-bottom: 2rem;
  text-align: center;
}

.admin-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.admin-subtitle {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
}

.admin-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1rem;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition-medium);
}

.tab-button:hover {
  background: var(--color-card-bg-hover);
  transform: translateY(-3px);
}

.tab-button.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  box-shadow: 0 4px 15px rgba(var(--color-primary-rgb), 0.2);
}

.tab-content {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid var(--color-border);
  animation: fadeIn 0.3s ease;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.panel-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
}

.search-box {
  position: relative;
  width: 300px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: var(--color-card-bg-hover);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  transition: all var(--transition-medium);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.users-table th,
.users-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.users-table th {
  font-weight: 600;
  color: var(--color-text);
  background: var(--color-card-bg-hover);
}

.users-table tr:hover {
  background: var(--color-card-bg-hover);
}

.role-select {
  padding: 0.5rem;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-medium);
}

.view-btn {
  background: rgba(var(--color-info-rgb), 0.1);
  color: var(--color-info);
}

.edit-btn {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
}

.delete-btn {
  background: rgba(var(--color-danger-rgb), 0.1);
  color: var(--color-danger);
}

.action-btn:hover {
  transform: translateY(-2px);
}

.view-btn:hover {
  background: var(--color-info);
  color: white;
}

.edit-btn:hover {
  background: var(--color-primary);
  color: white;
}

.delete-btn:hover {
  background: var(--color-danger);
  color: white;
}

.loading-spinner {
  display: block;
  width: 40px;
  height: 40px;
  margin: 2rem auto;
  border: 4px solid rgba(var(--color-primary-rgb), 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--color-primary);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  padding: 1rem;
  background: rgba(var(--color-danger-rgb), 0.1);
  color: var(--color-danger);
  border-radius: 8px;
  text-align: center;
  margin: 1rem 0;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.stat-card {
  background: var(--color-card-bg-hover);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all var(--transition-medium);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.users-icon {
  background: linear-gradient(135deg, #4F46E5, #818CF8);
}

.tasks-icon {
  background: linear-gradient(135deg, #10B981, #34D399);
}

.completed-icon {
  background: linear-gradient(135deg, #F59E0B, #FBBF24);
}

.achievements-icon {
  background: linear-gradient(135deg, #EC4899, #F472B6);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.settings-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-text);
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--color-card-bg-hover);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  transition: all var(--transition-medium);
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-border);
  border-radius: 34px;
  transition: .4s;
}

.toggle-switch label:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  border-radius: 50%;
  transition: .4s;
}

.toggle-switch input:checked + label {
  background-color: var(--color-primary);
}

.toggle-switch input:checked + label:before {
  transform: translateX(26px);
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
  max-width: 500px;
  background: var(--color-card-bg);
  border-radius: 12px;
  z-index: 1001;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
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
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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
  .admin-tabs {
    overflow-x: auto;
    padding-bottom: 1rem;
  }

  .tab-button {
    padding: 0.75rem 1rem;
    white-space: nowrap;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .users-table {
    display: block;
    overflow-x: auto;
  }
}
</style>