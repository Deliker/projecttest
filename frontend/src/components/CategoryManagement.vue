<template>
  <div class="categories-manager">
    <div class="categories-header">
      <h2>{{ $t('categories.manage') }}</h2>
      <button class="btn add-category-btn" @click="openNewCategoryModal">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ $t('categories.add') }}</span>
      </button>
    </div>

    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">{{ $t('categories.loading') }}</div>
    </div>

    <div v-else-if="errorMessage" class="error-message">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
        <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2"/>
      </svg>
      <div>{{ errorMessage }}</div>
    </div>

    <div v-else>
      <!-- Default categories section -->
      <div class="categories-section">
        <h3>{{ $t('categories.default') }}</h3>
        <div class="categories-grid">
          <div v-for="category in defaultCategories" :key="category.id" class="category-card default">
            <div class="category-color" :style="{ backgroundColor: category.color }"></div>
            <div class="category-info">
              <div class="category-name">{{ $t(`calendar.categoryNames.${category.id}`) }}</div>
              <div class="category-type">{{ $t('categories.system') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Custom categories section -->
      <div class="categories-section">
        <h3>{{ $t('categories.custom') }}</h3>

        <div v-if="customCategories.length === 0" class="no-categories">
          <div class="no-categories-icon">🏷️</div>
          <p>{{ $t('categories.noCustom') }}</p>
          <button class="btn btn-primary" @click="openNewCategoryModal">
            {{ $t('categories.createFirst') }}
          </button>
        </div>

        <div v-else class="categories-grid">
          <div v-for="category in customCategories" :key="category.id" class="category-card">
            <div class="category-color" :style="{ backgroundColor: category.color }"></div>
            <div class="category-info">
              <div class="category-name">{{ category.name }}</div>
              <div class="category-type">{{ $t('categories.custom') }}</div>
            </div>
            <div class="category-actions">
              <button class="category-action edit" @click="editCategory(category)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button class="category-action delete" @click="confirmDeleteCategory(category)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Modal -->
    <transition name="modal-fade">
      <div v-if="showCategoryModal" class="modal">
        <div class="modal-backdrop" @click="closeCategoryModal"></div>
        <div class="modal-content">
          <button class="close-btn" @click="closeCategoryModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <h3 class="modal-title">
            {{ isEditing ? $t('categories.edit') : $t('categories.create') }}
          </h3>

          <div class="form-group">
            <label for="category-name">{{ $t('categories.nameLabel') }}</label>
            <input
                type="text"
                id="category-name"
                v-model="categoryForm.name"
                class="form-control"
                :placeholder="$t('categories.namePlaceholder')"
            />
            <div v-if="formErrors.name" class="error-text">{{ formErrors.name }}</div>
          </div>

          <div class="form-group">
            <label>{{ $t('categories.colorLabel') }}</label>
            <div class="color-picker">
              <button
                  v-for="color in availableColors"
                  :key="color"
                  class="color-option"
                  :class="{ active: categoryForm.color === color }"
                  :style="{ backgroundColor: color }"
                  @click="categoryForm.color = color"
              ></button>
            </div>
            <div v-if="formErrors.color" class="error-text">{{ formErrors.color }}</div>
          </div>

          <div class="modal-actions">
            <button class="btn btn-cancel" @click="closeCategoryModal">
              {{ $t('categories.cancel') }}
            </button>
            <button
                class="btn btn-primary"
                @click="saveCategory"
                :disabled="isSaving"
            >
              <span v-if="!isSaving">
                {{ isEditing ? $t('categories.update') : $t('categories.create') }}
              </span>
              <span v-else class="loading-spinner"></span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete Confirmation Modal -->
    <transition name="modal-fade">
      <div v-if="showDeleteModal" class="modal">
        <div class="modal-backdrop" @click="closeDeleteModal"></div>
        <div class="modal-content delete-modal">
          <div class="delete-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <h3 class="delete-title">{{ $t('categories.deleteTitle') }}</h3>

          <p class="delete-message">
            {{ $t('categories.deleteMessage', { name: categoryToDelete?.name }) }}
          </p>

          <p class="delete-warning">
            {{ $t('categories.deleteWarning') }}
          </p>

          <div class="delete-actions">
            <button class="btn btn-cancel" @click="closeDeleteModal">
              {{ $t('categories.cancel') }}
            </button>
            <button
                class="btn btn-danger"
                @click="deleteCategory"
                :disabled="isDeleting"
            >
              <span v-if="!isDeleting">{{ $t('categories.confirmDelete') }}</span>
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
  name: 'CategoryManagement',

  setup() {
    const i18n = useI18n();
    return { i18n };
  },

  data() {
    return {
      defaultCategories: [
        { id: 'work', name: 'Work', color: '#4CAF50' },
        { id: 'personal', name: 'Personal', color: '#2196F3' },
        { id: 'study', name: 'Study', color: '#9C27B0' },
        { id: 'health', name: 'Health', color: '#F44336' },
        { id: 'shopping', name: 'Shopping', color: '#FF9800' },
        { id: 'other', name: 'Other', color: '#757575' }
      ],
      customCategories: [],
      isLoading: false,
      errorMessage: null,

      // Modal state
      showCategoryModal: false,
      isEditing: false,
      categoryForm: {
        id: null,
        name: '',
        color: '#3F51B5'
      },
      formErrors: {
        name: null,
        color: null
      },
      isSaving: false,

      // Delete modal state
      showDeleteModal: false,
      categoryToDelete: null,
      isDeleting: false,

      // Available colors for picker
      availableColors: [
        '#F44336', // Red
        '#E91E63', // Pink
        '#9C27B0', // Purple
        '#673AB7', // Deep Purple
        '#3F51B5', // Indigo
        '#2196F3', // Blue
        '#03A9F4', // Light Blue
        '#00BCD4', // Cyan
        '#009688', // Teal
        '#4CAF50', // Green
        '#8BC34A', // Light Green
        '#CDDC39', // Lime
        '#FFEB3B', // Yellow
        '#FFC107', // Amber
        '#FF9800', // Orange
        '#FF5722', // Deep Orange
        '#795548', // Brown
        '#607D8B'  // Blue Grey
      ]
    };
  },

  mounted() {
    this.loadCategories();
  },

  methods: {
    async loadCategories() {
      this.isLoading = true;
      this.errorMessage = null;

      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          this.$router.push('/auth');
          return;
        }

        const response = await apiService.getAllCategories(userId);
        this.customCategories = response.data || [];
      } catch (error) {
        console.error('Failed to load categories:', error);
        this.errorMessage = this.$t('categories.loadError');
      } finally {
        this.isLoading = false;
      }
    },

    openNewCategoryModal() {
      this.isEditing = false;
      this.categoryForm = {
        id: null,
        name: '',
        color: '#3F51B5'
      };
      this.formErrors = { name: null, color: null };
      this.showCategoryModal = true;
    },

    editCategory(category) {
      this.isEditing = true;
      this.categoryForm = {
        id: category.id,
        name: category.name,
        color: category.color
      };
      this.formErrors = { name: null, color: null };
      this.showCategoryModal = true;
    },

    closeCategoryModal() {
      this.showCategoryModal = false;
    },

    async saveCategory() {
      // Validate form
      this.formErrors = { name: null, color: null };

      if (!this.categoryForm.name.trim()) {
        this.formErrors.name = this.$t('categories.errors.nameRequired');
        return;
      }

      if (!this.categoryForm.color) {
        this.formErrors.color = this.$t('categories.errors.colorRequired');
        return;
      }

      this.isSaving = true;

      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          this.$router.push('/auth');
          return;
        }

        if (this.isEditing) {
          // Update existing category
          await apiService.updateCategory(
              this.categoryForm.id,
              {
                name: this.categoryForm.name,
                color: this.categoryForm.color
              },
              userId
          );
        } else {
          // Create new category
          await apiService.createCategory(
              {
                name: this.categoryForm.name,
                color: this.categoryForm.color
              },
              userId
          );
        }

        // Reload categories and close modal
        await this.loadCategories();
        this.closeCategoryModal();
      } catch (error) {
        console.error('Failed to save category:', error);
        const errorMessage = error.response?.data?.error || this.$t('categories.saveError');

        if (errorMessage.includes('name already exists')) {
          this.formErrors.name = this.$t('categories.errors.nameExists');
        } else {
          this.formErrors.name = errorMessage;
        }
      } finally {
        this.isSaving = false;
      }
    },

    confirmDeleteCategory(category) {
      this.categoryToDelete = category;
      this.showDeleteModal = true;
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
      this.categoryToDelete = null;
    },

    async deleteCategory() {
      if (!this.categoryToDelete) return;

      this.isDeleting = true;

      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          this.$router.push('/auth');
          return;
        }

        await apiService.deleteCategory(this.categoryToDelete.id, userId);

        // Reload categories and close modal
        await this.loadCategories();
        this.closeDeleteModal();
      } catch (error) {
        console.error('Failed to delete category:', error);
        alert(this.$t('categories.deleteError'));
      } finally {
        this.isDeleting = false;
      }
    }
  }
};
</script>

<style scoped>
.categories-manager {
  width: 100%;
  padding: 1.5rem;
}

.categories-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.categories-header h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.add-category-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.2);
}

.add-category-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(var(--color-primary-rgb), 0.3);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(var(--color-text-rgb), 0.1);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(var(--color-danger-rgb), 0.1);
  color: var(--color-danger);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.categories-section {
  margin-bottom: 2.5rem;
}

.categories-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.25rem;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--color-card-bg);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.category-card.default {
  opacity: 0.8;
}

.category-color {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.category-card:hover .category-color {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.4rem;
  transition: all 0.3s ease;
}

.category-card:hover .category-name {
  transform: translateY(-2px);
}

.category-type {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.category-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
  opacity: 0;
  transition: all 0.3s ease;
}

.category-card:hover .category-actions {
  opacity: 1;
}

.category-action {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-action:hover {
  transform: translateY(-3px);
}

.category-action.edit:hover {
  border-color: #2196F3;
  color: #2196F3;
  background-color: rgba(33, 150, 243, 0.1);
}

.category-action.delete:hover {
  border-color: #F44336;
  color: #F44336;
  background-color: rgba(244, 67, 54, 0.1);
}

.no-categories {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--color-card-bg);
  border-radius: 12px;
  border: 1px dashed var(--color-border);
}

.no-categories-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
  animation: float 3s ease infinite;
}

.no-categories p {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
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
  width: 95%;
  max-width: 500px;
  border: 1px solid var(--color-border);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 1;
  padding: 2rem;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  color: var(--color-text);
  background: var(--color-card-bg-hover);
  transform: rotate(90deg);
}

.modal-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text);
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

.color-picker {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.color-option.active {
  transform: scale(1.1);
  border-color: white;
  box-shadow: 0 0 0 3px var(--color-primary);
}

.error-text {
  color: var(--color-danger);
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.btn-cancel {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.btn-cancel:hover {
  color: var(--color-text);
  background: var(--color-card-bg-hover);
  transform: translateY(-2px);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.2);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(var(--color-primary-rgb), 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-danger {
  background: var(--color-danger);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(var(--color-danger-rgb), 0.2);
}

.btn-danger:hover:not(:disabled) {
  background: #d32f2f;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(var(--color-danger-rgb), 0.3);
}

.btn-danger:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Delete Modal */
.delete-modal {
  max-width: 450px;
  text-align: center;
}

.delete-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: rgba(var(--color-danger-rgb), 0.1);
  color: var(--color-danger);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-title {
  color: var(--color-danger);
  margin-bottom: 1.5rem;
}

.delete-message {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.delete-warning {
  padding: 1rem;
  background: rgba(var(--color-warning-rgb), 0.1);
  color: var(--color-warning);
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.delete-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
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
@media (max-width: 768px) {
  .categories-manager {
    padding: 1rem;
  }

  .categories-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .add-category-btn {
    width: 100%;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .color-picker {
    grid-template-columns: repeat(3, 1fr);
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>