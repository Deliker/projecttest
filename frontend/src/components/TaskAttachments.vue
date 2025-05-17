<template>
  <div class="task-attachments">
    <!-- File Upload Section -->
    <div class="attachment-upload">
      <h4 class="attachment-title">{{ $t('attachments.title') }}</h4>

      <div class="upload-controls">
        <input
            type="file"
            ref="fileInput"
            class="file-input"
            @change="handleFileChange"
            :disabled="isUploading"
        />

        <div class="upload-btn-wrapper">
          <button
              class="btn upload-btn"
              @click="triggerFileInput"
              :disabled="isUploading"
          >
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="upload-icon"
            >
              <path
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
              />
              <path
                  d="M17 8l-5-5-5 5"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
              />
              <path
                  d="M12 3v12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
              />
            </svg>
            {{ $t('attachments.chooseFile') }}
          </button>

          <span v-if="selectedFile" class="selected-file">
            {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
            <button
                class="remove-file-btn"
                @click.stop="clearSelectedFile"
                :title="$t('attachments.clear')"
            >
              <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
              >
                <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
              </svg>
            </button>
          </span>
        </div>

        <button
            class="btn upload-submit-btn"
            @click="uploadFile"
            :disabled="!selectedFile || isUploading"
        >
          <span v-if="isUploading" class="loading-spinner"></span>
          {{ $t('attachments.upload') }}
        </button>
      </div>

      <!-- Upload Progress -->
      <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <div class="progress-text">{{ uploadProgress }}%</div>
      </div>

      <!-- Error Messages -->
      <div v-if="uploadError" class="error-message">
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
          <path
              d="M12 8v4M12 16h.01"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
          />
        </svg>
        {{ uploadError }}
      </div>
    </div>

    <!-- Attachment List -->
    <div v-if="attachments.length > 0" class="attachments-list">
      <transition-group name="list" tag="div">
        <div v-for="attachment in attachments" :key="attachment.id" class="attachment-item">
          <div class="attachment-icon">
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
              <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
              />
              <path
                  d="M14 2v6h6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
              />
              <path
                  d="M16 13H8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
              />
              <path
                  d="M16 17H8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
              />
              <path
                  d="M10 9H9"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
              />
            </svg>
          </div>

          <div class="attachment-details">
            <div class="attachment-name" :title="attachment.originalFilename">
              {{ truncateFilename(attachment.originalFilename, 25) }}
            </div>
            <div class="attachment-meta">
              <span class="attachment-size">{{ formatFileSize(attachment.size) }}</span>
              <span class="attachment-date">{{ formatDate(attachment.uploadedAt) }}</span>
            </div>
          </div>

          <div class="attachment-actions">
            <button
                class="btn-icon download-btn"
                @click="downloadAttachment(attachment)"
                :title="$t('attachments.download')"
            >
              <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
              >
                <path
                    d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    d="M7 10l5 5 5-5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    d="M12 15V3"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
              </svg>
            </button>

            <button
                class="btn-icon delete-btn"
                @click="deleteAttachment(attachment)"
                :title="$t('attachments.delete')"
            >
              <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
              >
                <path
                    d="M3 6h18"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    d="M10 11v6M14 11v6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading" class="attachments-empty">
      <div class="empty-icon">📎</div>
      <p>{{ $t('attachments.noAttachments') }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !attachments.length" class="attachments-loading">
      <div class="loading-spinner"></div>
      <p>{{ $t('attachments.loading') }}</p>
    </div>
  </div>
</template>

<script>
import apiService from '../services/api';

export default {
  name: 'TaskAttachments',

  props: {
    taskId: {
      type: [Number, String],
      required: true
    }
  },

  data() {
    return {
      attachments: [],
      selectedFile: null,
      isUploading: false,
      isLoading: false,
      uploadProgress: 0,
      uploadError: null
    };
  },

  created() {
    if (this.taskId) {
      this.loadAttachments();
    }
  },

  watch: {
    taskId(newValue) {
      if (newValue) {
        this.loadAttachments();
      } else {
        this.attachments = [];
      }
    }
  },

  methods: {
    async loadAttachments() {
      if (!this.taskId) return;

      this.isLoading = true;

      try {
        const response = await apiService.getTaskAttachments(this.taskId);
        this.attachments = response.data || [];
      } catch (error) {
        console.error('Error loading attachments:', error);
      } finally {
        this.isLoading = false;
      }
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    handleFileChange(event) {
      const files = event.target.files;
      if (files.length > 0) {
        this.selectedFile = files[0];
        this.uploadError = null;
      }
    },

    clearSelectedFile() {
      this.selectedFile = null;
      this.$refs.fileInput.value = null;
      this.uploadError = null;
    },

    async uploadFile() {
      if (!this.selectedFile || !this.taskId) return;

      this.isUploading = true;
      this.uploadProgress = 0;
      this.uploadError = null;

      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          throw new Error('User not logged in');
        }

        // FormData for the file upload
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('taskId', this.taskId);
        formData.append('userId', userId);

        // Use axios directly to track progress
        const response = await apiService.uploadTaskAttachment(
            this.selectedFile,
            this.taskId,
            userId,
            (progressEvent) => {
              this.uploadProgress = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
              );
            }
        );

        // Add the new attachment to the list
        if (response.data) {
          this.attachments.unshift(response.data);
        }

        // Reset the file input
        this.clearSelectedFile();

        // Emit event to notify parent component
        this.$emit('attachment-added', response.data);

      } catch (error) {
        console.error('Error uploading file:', error);
        this.uploadError = error.response?.data?.error || 'Failed to upload file';
      } finally {
        this.isUploading = false;
        this.uploadProgress = 0;
      }
    },

    async downloadAttachment(attachment) {
      try {
        const response = await apiService.downloadAttachment(attachment.id);

        // Create a download link and trigger it
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', attachment.originalFilename);
        document.body.appendChild(link);
        link.click();

        // Clean up
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading attachment:', error);
        alert('Failed to download the file. Please try again.');
      }
    },

    async deleteAttachment(attachment) {
      if (!confirm(this.$t('attachments.confirmDelete'))) {
        return;
      }

      try {
        await apiService.deleteAttachment(attachment.id);

        // Remove from local list
        const index = this.attachments.findIndex(a => a.id === attachment.id);
        if (index !== -1) {
          this.attachments.splice(index, 1);
        }

        // Emit event to notify parent component
        this.$emit('attachment-deleted', attachment);
      } catch (error) {
        console.error('Error deleting attachment:', error);
        alert('Failed to delete the attachment. Please try again.');
      }
    },

    // Helper methods
    formatFileSize(bytes) {
      if (!bytes) return '0 B';

      const units = ['B', 'KB', 'MB', 'GB'];
      let i = 0;
      while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
      }

      return `${bytes.toFixed(1)} ${units[i]}`;
    },

    formatDate(dateString) {
      if (!dateString) return '';

      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    truncateFilename(filename, maxLength) {
      if (!filename) return '';

      if (filename.length <= maxLength) {
        return filename;
      }

      // Find extension
      const lastDotIndex = filename.lastIndexOf('.');
      if (lastDotIndex === -1) {
        return filename.substring(0, maxLength - 3) + '...';
      }

      const extension = filename.substring(lastDotIndex);
      const nameWithoutExt = filename.substring(0, lastDotIndex);

      const availableChars = maxLength - extension.length - 3; // 3 for '...'
      return nameWithoutExt.substring(0, availableChars) + '...' + extension;
    }
  }
};
</script>

<style scoped>
.task-attachments {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.attachment-title {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.attachment-upload {
  margin-bottom: 1.5rem;
}

.upload-controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.file-input {
  display: none;
}

.upload-btn-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: var(--color-card-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  background: var(--color-card-bg-hover);
  transform: translateY(-2px);
}

.upload-submit-btn {
  padding: 0.6rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.upload-submit-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

.upload-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.selected-file {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-file-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-file-btn:hover {
  color: var(--color-danger);
  transform: scale(1.1);
}

.upload-progress {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--color-card-bg);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  width: 2.5rem;
  text-align: right;
}

.error-message {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-danger);
  font-size: 0.85rem;
}

.attachments-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: var(--color-card-bg);
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid var(--color-border);
}

.attachment-item:hover {
  background: var(--color-card-bg-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.attachment-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  margin-right: 0.75rem;
}

.attachment-details {
  flex: 1;
  overflow: hidden;
}

.attachment-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.attachment-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.download-btn:hover {
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
  border-color: #2196F3;
  transform: translateY(-2px);
}

.delete-btn:hover {
  background: rgba(255, 68, 68, 0.1);
  color: #ff4444;
  border-color: #ff4444;
  transform: translateY(-2px);
}

.attachments-empty {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.attachments-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.loading-spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid rgba(var(--color-primary-rgb), 0.2);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* List animations */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Responsive styles */
@media (max-width: 768px) {
  .upload-controls {
    flex-direction: column;
    align-items: flex-start;
  }

  .upload-btn-wrapper {
    width: 100%;
  }

  .upload-submit-btn {
    width: 100%;
  }
}
</style>