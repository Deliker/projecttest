<template>
  <div class="admin-panel">
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
          <div v-if="loading" class="loading-spinner-container">
            <div class="loading-spinner"></div>
            <p>Loading users data...</p>
          </div>
          <div v-else-if="error" class="error-message">
            <p>{{ error }}</p>
            <button @click="retryLoadUsers" class="btn retry-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M23 4v6h-6M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path>
              </svg>
              Retry
            </button>
          </div>
          <div v-else-if="users.length === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <p>No users found in the system</p>
          </div>
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
                    type="button"
                    @click="handleViewClick(user.id)"
                    class="action-btn view-btn"
                    :title="$t('admin.actions.view')"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" fill="none"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" fill="none"/>
                  </svg>
                </button>
                <button
                    type="button"
                    @click="handleEditClick(user.id)"
                    class="action-btn edit-btn"
                    :title="$t('admin.actions.edit')"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" fill="none"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" fill="none"/>
                  </svg>
                </button>
                <button
                    type="button"
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

        <div v-if="statsLoading" class="loading-spinner-container">
          <div class="loading-spinner"></div>
          <p>Loading dashboard statistics...</p>
        </div>
        <div v-else-if="statsError" class="error-message">
          <p>{{ statsError }}</p>
          <button @click="loadStats" class="btn retry-btn">Retry</button>
        </div>
        <div v-else class="stats-cards">
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

          <div v-if="settingsMessage" class="settings-message" :class="{ success: !settingsError, error: settingsError }">
            {{ settingsMessage }}
          </div>

          <button @click="saveSettings" class="btn primary-btn" :disabled="settingsSaving">
            <span v-if="settingsSaving">
              <span class="spinner-small"></span> Saving...
            </span>
            <span v-else>{{ $t('admin.settings.saveSettings') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Тестовое модальное окно для проверки -->
    <div class="test-modal-button" v-if="activeTab === 'users'">
      <button @click="showTestModal = true" class="btn test-btn">
        Тестовое модальное окно
      </button>

      <div v-if="showTestModal" class="test-modal">
        <div class="modal-overlay" @click="showTestModal = false"></div>
        <div class="modal-container">
          <div class="modal-header">
            <h3>Тестовое модальное окно</h3>
            <button class="close-btn" @click="showTestModal = false">×</button>
          </div>
          <div class="modal-body">
            <p>Это тестовое модальное окно для проверки работы модальных компонентов.</p>
          </div>
          <div class="modal-footer">
            <button @click="showTestModal = false" class="btn cancel-btn">Закрыть</button>
          </div>
        </div>
      </div>
    </div>

    <!-- User View Modal -->
    <div v-if="showViewModal" class="modal">
      <div class="modal-overlay" @click="closeViewModal"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ $t('admin.users.viewUser') }}</h3>
          <button class="close-btn" @click="closeViewModal">×</button>
        </div>
        <div v-if="viewLoading" class="modal-body loading-container">
          <div class="loading-spinner"></div>
          <p>{{ $t('admin.users.loading') }}</p>
        </div>
        <div v-else-if="viewError" class="modal-body error-container">
          <p class="error-message">{{ viewError }}</p>
          <button @click="loadUserForView" class="btn retry-btn">
            {{ $t('admin.actions.retry') }}
          </button>
        </div>
        <div v-else-if="viewUser" class="modal-body">
          <div class="user-profile">
            <div class="user-header">
              <div class="user-avatar">
                <img v-if="viewUser.avatarUrl" :src="viewUser.avatarUrl" alt="User avatar" />
                <div v-else class="avatar-placeholder">
                  {{ getUserInitials(viewUser) }}
                </div>
              </div>
              <div class="user-basic-info">
                <h2>{{ viewUser.name }}</h2>
                <p class="user-email">{{ viewUser.email }}</p>
                <span class="user-role" :class="{ 'admin-role': isUserAdmin(viewUser) }">
                  {{ isUserAdmin(viewUser) ? $t('admin.roles.admin') : $t('admin.roles.user') }}
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
                  <div class="stat-value">{{ viewUser.totalTasks || 0 }}</div>
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
                  <div class="stat-value">{{ viewUser.completedTasks || 0 }}</div>
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
                  <div class="stat-value">{{ viewUser.achievements || 0 }}</div>
                  <div class="stat-label">{{ $t('admin.users.achievements') }}</div>
                </div>
              </div>
            </div>

            <div class="user-details">
              <div class="detail-row" v-if="viewUser.lastActive">
                <span class="detail-label">{{ $t('admin.users.lastActive') }}:</span>
                <span class="detail-value">{{ formatDate(viewUser.lastActive) }}</span>
              </div>

              <div class="detail-row" v-if="viewUser.jobTitle">
                <span class="detail-label">{{ $t('admin.users.jobTitle') }}:</span>
                <span class="detail-value">{{ viewUser.jobTitle }}</span>
              </div>

              <div class="detail-row" v-if="viewUser.location">
                <span class="detail-label">{{ $t('admin.users.location') }}:</span>
                <span class="detail-value">{{ viewUser.location }}</span>
              </div>

              <div class="detail-row" v-if="viewUser.theme">
                <span class="detail-label">{{ $t('admin.users.theme') }}:</span>
                <span class="detail-value">{{ viewUser.theme === 'dark' ? $t('admin.users.darkTheme') : $t('admin.users.lightTheme') }}</span>
              </div>
            </div>

            <div class="bio-section" v-if="viewUser.bio">
              <h4>{{ $t('admin.users.bio') }}</h4>
              <p>{{ viewUser.bio }}</p>
            </div>
          </div>
        </div>
        <div v-else class="modal-body">
          <p class="empty-message">{{ $t('admin.users.userNotFound') }}</p>
        </div>
        <div class="modal-footer">
          <button @click="closeViewModal" class="btn cancel-btn">{{ $t('admin.actions.close') }}</button>
          <button @click="handleEditClick(selectedUserId)" class="btn primary-btn">{{ $t('admin.actions.edit') }}</button>
        </div>
      </div>
    </div>

    <!-- User Edit Modal -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-overlay" @click="closeEditModal"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ $t('admin.users.editUser') }}</h3>
          <button class="close-btn" @click="closeEditModal">×</button>
        </div>
        <div v-if="editLoading" class="modal-body loading-container">
          <div class="loading-spinner"></div>
          <p>{{ $t('admin.users.loading') }}</p>
        </div>
        <div v-else-if="editError" class="modal-body error-container">
          <p class="error-message">{{ editError }}</p>
          <button @click="loadUserForEdit" class="btn retry-btn">
            {{ $t('admin.actions.retry') }}
          </button>
        </div>
        <div v-else-if="editUser" class="modal-body">
          <form @submit.prevent="saveUserChanges" class="user-edit-form">
            <div class="form-group">
              <label for="name">{{ $t('admin.users.name') }}</label>
              <input
                  type="text"
                  id="name"
                  v-model="editUser.name"
                  class="form-control"
                  required
              />
            </div>

            <div class="form-group">
              <label for="email">{{ $t('admin.users.email') }}</label>
              <input
                  type="email"
                  id="email"
                  v-model="editUser.email"
                  class="form-control"
                  required
              />
            </div>

            <div class="form-group">
              <label for="role">{{ $t('admin.users.role') }}</label>
              <select id="role" v-model="editUser.role" class="form-control">
                <option value="USER">{{ $t('admin.roles.user') }}</option>
                <option value="ADMIN">{{ $t('admin.roles.admin') }}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="jobTitle">{{ $t('admin.users.jobTitle') }}</label>
              <input
                  type="text"
                  id="jobTitle"
                  v-model="editUser.jobTitle"
                  class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="location">{{ $t('admin.users.location') }}</label>
              <input
                  type="text"
                  id="location"
                  v-model="editUser.location"
                  class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="theme">{{ $t('admin.users.theme') }}</label>
              <select id="theme" v-model="editUser.theme" class="form-control">
                <option value="dark">{{ $t('admin.users.darkTheme') }}</option>
                <option value="light">{{ $t('admin.users.lightTheme') }}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="bio">{{ $t('admin.users.bio') }}</label>
              <textarea
                  id="bio"
                  v-model="editUser.bio"
                  class="form-control text-area"
                  rows="4"
              ></textarea>
            </div>
          </form>

          <div v-if="saveError" class="save-error-message">
            {{ saveError }}
          </div>
        </div>
        <div v-else class="modal-body">
          <p class="empty-message">{{ $t('admin.users.userNotFound') }}</p>
        </div>
        <div class="modal-footer">
          <button @click="closeEditModal" class="btn cancel-btn" :disabled="saving">
            {{ $t('admin.actions.cancel') }}
          </button>
          <button @click="saveUserChanges" class="btn primary-btn" :disabled="saving || !editUser">
            <span v-if="saving">
              <span class="spinner-small"></span> {{ $t('admin.users.saving') }}
            </span>
            <span v-else>{{ $t('admin.actions.save') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal for Delete -->
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
          <button class="btn cancel-btn" @click="showDeleteModal = false" :disabled="deleteUserLoading">
            {{ $t('admin.actions.cancel') }}
          </button>
          <button class="btn delete-btn" @click="deleteUser" :disabled="deleteUserLoading">
            <span v-if="deleteUserLoading">
              <span class="spinner-small"></span> Deleting...
            </span>
            <span v-else>{{ $t('admin.actions.confirm') }}</span>
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
      statsLoading: false,
      statsError: null,

      settings: {
        appName: 'TaskMaster',
        defaultLanguage: 'en',
        enableRegistration: true
      },
      settingsSaving: false,
      settingsMessage: null,
      settingsError: false,

      // Модальные окна и состояния пользователей
      selectedUserId: null,

      // Тестовое модальное окно
      showTestModal: false,

      // View Modal
      showViewModal: false,
      viewUser: null,
      viewLoading: false,
      viewError: null,

      // Edit Modal
      showEditModal: false,
      editUser: null,
      editLoading: false,
      editError: null,
      saving: false,
      saveError: null,

      // Delete Modal
      showDeleteModal: false,
      userToDelete: null,
      deleteUserLoading: false
    };
  },

  computed: {
    filteredUsers() {
      if (!this.userSearchQuery) {
        return this.users;
      }

      const query = this.userSearchQuery.toLowerCase();
      return this.users.filter(user =>
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
      );
    }
  },

  methods: {
    async loadUsers() {
      this.loading = true;
      this.error = null;

      try {
        console.log('Starting to load users...');
        const response = await apiService.getAdminUsers();
        console.log('Users received:', response.data);

        // Make sure the response is an array
        if (Array.isArray(response.data)) {
          this.users = response.data;
        } else {
          console.warn('Unexpected response format, expected array:', response.data);
          this.users = [];
        }

        this.loading = false;
      } catch (error) {
        console.error('Failed to load users:', error);
        this.error = this.$t('admin.errors.loadUsers') || 'Failed to load users. Please try again.';
        this.loading = false;
      }
    },

    retryLoadUsers() {
      this.loadUsers();
    },

    async loadStats() {
      this.statsLoading = true;
      this.statsError = null;

      try {
        console.log('Loading admin stats...');
        const response = await apiService.getAdminStats();
        console.log('Stats received:', response.data);
        this.stats = response.data || {};
        this.statsLoading = false;
      } catch (error) {
        console.error('Failed to load stats:', error);
        this.statsError = this.$t('admin.errors.loadStats');
        this.statsLoading = false;
      }
    },

    // Обработчики кнопок действий пользователей
    handleViewClick(userId) {
      console.log('View button clicked for user:', userId);
      this.selectedUserId = userId;
      this.showViewModal = true;
      this.loadUserForView();
    },

    handleEditClick(userId) {
      console.log('Edit button clicked for user:', userId);
      this.selectedUserId = userId;
      this.showEditModal = true;
      this.showViewModal = false; // Закрываем окно просмотра, если открыто
      this.loadUserForEdit();
    },

    // Загрузка данных пользователя для просмотра
    async loadUserForView() {
      if (!this.selectedUserId) return;

      this.viewLoading = true;
      this.viewError = null;

      try {
        console.log('Loading user details for view, ID:', this.selectedUserId);
        const response = await apiService.getUserById(this.selectedUserId);
        this.viewUser = response.data;
        console.log('User details loaded for view:', this.viewUser);
      } catch (error) {
        console.error('Failed to load user details for view:', error);
        this.viewError = this.$t('admin.errors.loadUserDetails');
      } finally {
        this.viewLoading = false;
      }
    },

    // Загрузка данных пользователя для редактирования
    async loadUserForEdit() {
      if (!this.selectedUserId) return;

      this.editLoading = true;
      this.editError = null;

      try {
        console.log('Loading user details for edit, ID:', this.selectedUserId);
        const response = await apiService.getUserById(this.selectedUserId);
        const userData = response.data;

        // Создаем копию для редактирования
        this.editUser = {
          id: userData.id,
          name: userData.name || '',
          email: userData.email || '',
          role: this.normalizeRole(userData.role),
          jobTitle: userData.jobTitle || '',
          location: userData.location || '',
          theme: userData.theme || 'dark',
          bio: userData.bio || ''
        };

        console.log('User details loaded for edit:', this.editUser);
      } catch (error) {
        console.error('Failed to load user details for edit:', error);
        this.editError = this.$t('admin.errors.loadUserDetails');
      } finally {
        this.editLoading = false;
      }
    },

    // Нормализация роли пользователя
    normalizeRole(role) {
      if (typeof role === 'string') {
        return role;
      } else if (typeof role === 'object' && role) {
        return role.name || 'USER';
      }
      return 'USER';
    },

    // Проверка, является ли пользователь администратором
    isUserAdmin(user) {
      if (!user) return false;

      const role = user.role;
      if (typeof role === 'string') {
        return role.toUpperCase() === 'ADMIN';
      } else if (typeof role === 'object' && role) {
        return (role.name || '').toUpperCase() === 'ADMIN';
      }

      return false;
    },

    // Получение инициалов пользователя
    getUserInitials(user) {
      if (!user || !user.name) return '?';

      return user.name
          .split(' ')
          .map(name => name.charAt(0))
          .join('')
          .toUpperCase()
          .substring(0, 2);
    },

    // Закрытие модальных окон
    closeViewModal() {
      console.log('Closing view modal');
      this.showViewModal = false;
      this.viewUser = null;
    },

    closeEditModal() {
      console.log('Closing edit modal');
      this.showEditModal = false;
      this.editUser = null;
      this.saveError = null;
    },

    // Сохранение изменений пользователя
    async saveUserChanges() {
      if (!this.editUser) return;

      this.saving = true;
      this.saveError = null;

      try {
        console.log('Saving user changes:', this.editUser);

        // Сначала обновляем роль, если она изменилась
        if (this.editUser.role !== this.normalizeRole(this.viewUser?.role)) {
          console.log('Updating role to:', this.editUser.role);
          await apiService.updateUserRole(this.editUser.id, { role: this.editUser.role });
        }

        // Затем обновляем профиль пользователя
        await apiService.updateProfile(this.editUser.id, {
          name: this.editUser.name,
          bio: this.editUser.bio,
          theme: this.editUser.theme,
          location: this.editUser.location,
          jobTitle: this.editUser.jobTitle
        });

        // Находим и обновляем пользователя в списке
        const index = this.users.findIndex(u => u.id === this.editUser.id);
        if (index !== -1) {
          this.users[index] = {
            ...this.users[index],
            ...this.editUser
          };
        }

        // Закрываем модальное окно
        this.showEditModal = false;

        // Показываем уведомление
        alert(this.$t('admin.notifications.userUpdated'));

        // Обновляем список пользователей
        this.loadUsers();
      } catch (error) {
        console.error('Failed to save user changes:', error);
        this.saveError = this.$t('admin.errors.saveUser');
      } finally {
        this.saving = false;
      }
    },

    // Обновление роли пользователя
    async updateUserRole(userId, role) {
      try {
        console.log(`Updating user ${userId} role to ${role}`);
        await apiService.updateUserRole(userId, { role });
        alert(this.$t('admin.notifications.roleUpdated'));
      } catch (error) {
        console.error('Failed to update user role:', error);
        alert(this.$t('admin.notifications.roleUpdateFailed'));
      }
    },

    // Удаление пользователя
    confirmDeleteUser(userId) {
      this.userToDelete = userId;
      this.showDeleteModal = true;
    },

    async deleteUser() {
      if (!this.userToDelete) return;

      this.deleteUserLoading = true;

      try {
        console.log(`Deleting user ${this.userToDelete}`);
        await apiService.deleteUser(this.userToDelete);

        // Удаляем пользователя из списка
        this.users = this.users.filter(user => user.id !== this.userToDelete);

        this.showDeleteModal = false;
        this.userToDelete = null;
        this.deleteUserLoading = false;

        // Обновляем статистику
        this.loadStats();

        alert(this.$t('admin.notifications.userDeleted'));
      } catch (error) {
        console.error('Failed to delete user:', error);
        this.deleteUserLoading = false;

        alert(this.$t('admin.notifications.userDeleteFailed'));
      }
    },

    // Настройки приложения
    async saveSettings() {
      this.settingsSaving = true;
      this.settingsMessage = null;
      this.settingsError = false;

      try {
        console.log('Saving settings:', this.settings);
        await apiService.updateAdminSettings(this.settings);

        this.settingsMessage = this.$t('admin.settings.saveSuccess');
        this.settingsError = false;

        // Скрываем сообщение через 3 секунды
        setTimeout(() => {
          this.settingsMessage = null;
        }, 3000);
      } catch (error) {
        console.error('Failed to save settings:', error);
        this.settingsMessage = this.$t('admin.settings.saveError');
        this.settingsError = true;
      } finally {
        this.settingsSaving = false;
      }
    },

    // Форматирование даты
    formatDate(dateString) {
      if (!dateString) return this.$t('admin.users.never') || 'N/A';

      return new Date(dateString).toLocaleDateString(this.i18n.locale.value, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  },

  mounted() {
    console.log('AdminPanel component mounted');
    console.log('Current auth state:', this.$auth);

    // Инициализируем состояния модальных окон
    this.showViewModal = false;
    this.showEditModal = false;
    this.selectedUserId = null;

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

.loading-spinner-container {
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

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 0.5rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 2px solid white;
  animation: spin 1s linear infinite;
}

.error-message {
  color: var(--color-danger);
  text-align: center;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
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

.empty-state {
  padding: 3rem 0;
  text-align: center;
  color: var(--color-text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-state svg {
  opacity: 0.5;
  stroke-width: 1;
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

.text-area {
  resize: vertical;
  min-height: 80px;
}

.settings-message {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.settings-message.success {
  background: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success);
  border: 1px solid rgba(var(--color-success-rgb), 0.2);
}

.settings-message.error {
  background: rgba(var(--color-danger-rgb), 0.1);
  color: var(--color-danger);
  border: 1px solid rgba(var(--color-danger-rgb), 0.2);
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

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.primary-btn {
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.primary-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(var(--color-primary-rgb), 0.3);
}

.cancel-btn {
  background: var(--color-card-bg-hover);
  color: var(--color-text);
}

.cancel-btn:hover:not(:disabled) {
  background: var(--color-border);
}

.test-btn {
  background: var(--color-info);
  color: white;
  margin: 1rem 0;
}

.test-modal-button {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

/* Стили для модальных окон */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
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
  z-index: 2001;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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

.save-error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  color: var(--color-danger);
  background: rgba(var(--color-danger-rgb), 0.1);
  border-radius: 4px;
  text-align: center;
}

/* Стили для просмотра пользователя */
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

/* Анимации */
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Медиа-запросы */
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

  .search-box {
    width: 100%;
    max-width: 300px;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

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