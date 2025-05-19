<!-- UserEditModal.vue -->
<template>
  <div class="modal">
    <div class="modal-overlay" @click="cancelEdit"></div>
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ $t('admin.users.editUser') }}</h3>
        <button class="close-btn" @click="cancelEdit">×</button>
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
        <form @submit.prevent="saveChanges" class="user-edit-form">
          <div class="form-group">
            <label for="name">{{ $t('admin.users.name') }}</label>
            <input
                type="text"
                id="name"
                v-model="editedUser.name"
                class="form-control"
                required
            />
          </div>

          <div class="form-group">
            <label for="email">{{ $t('admin.users.email') }}</label>
            <input
                type="email"
                id="email"
                v-model="editedUser.email"
                class="form-control"
                required
            />
          </div>

          <div class="form-group">
            <label for="role">{{ $t('admin.users.role') }}</label>
            <select id="role" v-model="editedUser.role" class="form-control">
              <option value="USER">{{ $t('admin.roles.user') }}</option>
              <option value="ADMIN">{{ $t('admin.roles.admin') }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="jobTitle">{{ $t('admin.users.jobTitle') }}</label>
            <input
                type="text"
                id="jobTitle"
                v-model="editedUser.jobTitle"
                class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="location">{{ $t('admin.users.location') }}</label>
            <input
                type="text"
                id="location"
                v-model="editedUser.location"
                class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="theme">{{ $t('admin.users.theme') }}</label>
            <select id="theme" v-model="editedUser.theme" class="form-control">
              <option value="dark">{{ $t('admin.users.darkTheme') }}</option>
              <option value="light">{{ $t('admin.users.lightTheme') }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="bio">{{ $t('admin.users.bio') }}</label>
            <textarea
                id="bio"
                v-model="editedUser.bio"
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
        <button @click="cancelEdit" class="btn cancel-btn" :disabled="saving">
          {{ $t('admin.actions.cancel') }}
        </button>
        <button @click="saveChanges" class="btn primary-btn" :disabled="saving || !user">
          <span v-if="saving">
            <span class="spinner-small"></span> {{ $t('admin.users.saving') }}
          </span>
          <span v-else>{{ $t('admin.actions.save') }}</span>
        </button>
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

  emits: ['close', 'user-updated'],

  setup() {
    const i18n = useI18n();
    return { i18n };
  },

  data() {
    return {
      user: null,
      editedUser: {},
      loading: false,
      error: null,
      saving: false,
      saveError: null
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
        console.log('Loading user details for editing, ID:', this.userId);
        const response = await apiService.getUserById(this.userId);
        this.user = response.data;

        // Create a copy of the user object for editing
        this.editedUser = {
          id: this.user.id,
          name: this.user.name || '',
          email: this.user.email || '',
          role: this.user.role,
          jobTitle: this.user.jobTitle || '',
          location: this.user.location || '',
          theme: this.user.theme || 'dark',
          bio: this.user.bio || ''
        };

        // Normalize role if it's an object
        if (typeof this.editedUser.role === 'object' && this.editedUser.role) {
          this.editedUser.role = this.editedUser.role.name || 'USER';
        }

        console.log('User details loaded for editing:', this.user);
        console.log('Edited user object:', this.editedUser);
      } catch (error) {
        console.error('Failed to load user details for editing:', error);
        this.error = this.$t('admin.errors.loadUserDetails') || 'Failed to load user details';
      } finally {
        this.loading = false;
      }
    },

    async saveChanges() {
      this.saving = true;
      this.saveError = null;

      try {
        console.log('Saving user changes:', this.editedUser);

        // First update the user role if it changed
        if (this.user.role !== this.editedUser.role) {
          console.log('Role changed, updating role to:', this.editedUser.role);
          await apiService.updateUserRole(this.userId, { role: this.editedUser.role });
        }

        // Then update the user profile
        await apiService.updateProfile(this.userId, {
          name: this.editedUser.name,
          bio: this.editedUser.bio,
          theme: this.editedUser.theme,
          location: this.editedUser.location,
          jobTitle: this.editedUser.jobTitle
        });

        // Emit event to update parent component
        this.$emit('user-updated', this.editedUser);
        this.$emit('close');

        // Show success notification (in a real app would use a notification library)
        alert(this.$t('admin.notifications.userUpdated') || 'User updated successfully');
      } catch (error) {
        console.error('Failed to save user changes:', error);
        this.saveError = this.$t('admin.errors.saveUser') || 'Failed to save user changes';
      } finally {
        this.saving = false;
      }
    },

    cancelEdit() {
      this.$emit('close');
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
  max-width: 600px;
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

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
}

.error-message, .save-error-message {
  color: var(--color-danger);
  text-align: center;
  margin: 1rem 0;
  padding: 0.75rem;
  background: rgba(var(--color-danger-rgb), 0.1);
  border-radius: 4px;
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

/* Form Styles */
.user-edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--color-text);
}

.form-control {
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
  .form-group {
    gap: 0.3rem;
  }

  .form-control {
    padding: 0.6rem 0.8rem;
  }

  .btn {
    padding: 0.6rem 1.2rem;
  }
}
</style>