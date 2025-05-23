import axios from 'axios';

const API_URL = 'http://localhost:8081/api';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add interceptor to include authentication token in requests
apiClient.interceptors.request.use(
    config => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
    response => {
      // Log successful responses for debugging
      console.log(`API Response [${response.config.method.toUpperCase()}] ${response.config.url}:`, response);
      return response;
    },
    error => {
      // Log error responses
      console.error('API Error:', error.response || error);
      return Promise.reject(error);
    }
);

export default {
  // Auth endpoints
  register(userData) {
    return apiClient.post('/auth/register', userData);
  },

  login(credentials) {
    return apiClient.post('/auth/login', credentials);
  },

  // Profile endpoints
  getUserProfile(userId) {
    return apiClient.get(`/profile/${userId}`);
  },

  updateProfile(userId, profileData) {
    return apiClient.put(`/profile/${userId}`, profileData);
  },

  uploadAvatar(userId, formData) {
    return apiClient.post(`/profile/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  changePassword(userId, passwordData) {
    return apiClient.post(`/profile/${userId}/change-password`, passwordData);
  },

  getUserInfo(userId) {
    return apiClient.get(`/auth/user?userId=${userId}`);
  },

  // Task attachment endpoints
  uploadTaskAttachment(file, taskId, userId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId);
    formData.append('userId', userId);

    return apiClient.post('/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  getTaskAttachments(taskId) {
    return apiClient.get(`/attachments/task/${taskId}`);
  },

  downloadAttachment(attachmentId) {
    return apiClient.get(`/attachments/download/${attachmentId}`, {
      responseType: 'blob'
    });
  },

  deleteAttachment(attachmentId) {
    return apiClient.delete(`/attachments/${attachmentId}`);
  },

  // Task endpoints
  getAllTasks(userId) {
    return apiClient.get(`/tasks?userId=${userId}`);
  },

  getTasksForDate(userId, year, month, day) {
    return apiClient.get(`/tasks/date?userId=${userId}&year=${year}&month=${month}&day=${day}`);
  },

  getTasksForMonth(userId, year, month) {
    return apiClient.get(`/tasks/month?userId=${userId}&year=${year}&month=${month}`);
  },

  createTask(taskData, userId) {
    return apiClient.post(`/tasks?userId=${userId}`, taskData);
  },

  getTaskById(taskId) {
    return apiClient.get(`/tasks/${taskId}`);
  },

  updateTask(taskId, taskData) {
    return apiClient.put(`/tasks/${taskId}`, taskData);
  },

  deleteTask(taskId) {
    return apiClient.delete(`/tasks/${taskId}`);
  },

  completeTask(taskId, userId) {
    return apiClient.post(`/tasks/${taskId}/complete?userId=${userId}`);
  },

  getCompletedTasks(userId) {
    return apiClient.get(`/tasks/completed?userId=${userId}`);
  },

  getIncompleteTasks(userId) {
    return apiClient.get(`/tasks/incomplete?userId=${userId}`);
  },

  getTasksByCategory(userId, category) {
    return apiClient.get(`/tasks/category/${category}?userId=${userId}`);
  },

  getTasksByPriority(userId, priority) {
    return apiClient.get(`/tasks/priority/${priority}?userId=${userId}`);
  },

  getTaskStats(userId) {
    return apiClient.get(`/tasks/stats?userId=${userId}`);
  },

  // Category endpoints with improved error handling
  getAllCategories(userId) {
    console.log('API call: getAllCategories for user ID:', userId);
    return apiClient.get(`/categories?userId=${userId}`)
        .catch(error => {
          console.error('Error in getAllCategories:', error);
          throw error;
        });
  },

  getCategoryById(categoryId, userId) {
    console.log('API call: getCategoryById', categoryId, 'for user ID:', userId);
    return apiClient.get(`/categories/${categoryId}?userId=${userId}`)
        .catch(error => {
          console.error('Error in getCategoryById:', error);
          throw error;
        });
  },

  createCategory(categoryData, userId) {
    console.log('API call: createCategory for user ID:', userId, 'data:', categoryData);
    return apiClient.post(`/categories?userId=${userId}`, categoryData)
        .catch(error => {
          console.error('Error in createCategory:', error);
          throw error;
        });
  },

  updateCategory(categoryId, categoryData, userId) {
    console.log('API call: updateCategory', categoryId, 'for user ID:', userId, 'data:', categoryData);
    return apiClient.put(`/categories/${categoryId}?userId=${userId}`, categoryData)
        .catch(error => {
          console.error('Error in updateCategory:', error);
          throw error;
        });
  },

  deleteCategory(categoryId, userId) {
    console.log('API call: deleteCategory', categoryId, 'for user ID:', userId);
    return apiClient.delete(`/categories/${categoryId}?userId=${userId}`)
        .catch(error => {
          console.error('Error in deleteCategory:', error);
          throw error;
        });
  },

  // Achievement endpoints
  getAllAchievements(userId) {
    return apiClient.get(`/achievements?userId=${userId}`);
  },

  getAchievementById(achievementId) {
    return apiClient.get(`/achievements/${achievementId}`);
  },

  getAchievementsByCategory(userId, category) {
    return apiClient.get(`/achievements/category/${category}?userId=${userId}`);
  },

  checkAchievement(userId, achievementId) {
    return apiClient.get(`/achievements/check/${achievementId}?userId=${userId}`);
  },

  unlockAchievement(userId, achievementId) {
    return apiClient.post(`/achievements/unlock/${achievementId}?userId=${userId}`);
  },

  getLatestAchievements(userId) {
    return apiClient.get(`/achievements/latest?userId=${userId}`);
  },

  getAchievementStats(userId) {
    return apiClient.get(`/achievements/stats?userId=${userId}`);
  },

  getAchievementCategoryCounts(userId) {
    return apiClient.get(`/achievements/category-counts?userId=${userId}`);
  },

  getTotalAchievementPoints(userId) {
    return apiClient.get(`/achievements/points?userId=${userId}`);
  },

  // Admin endpoints
  getAdminUsers() {
    return apiClient.get('/admin/users');
  },

  getUserById(userId) {
    return apiClient.get(`/admin/users/${userId}`);
  },

  updateUserRole(userId, roleData) {
    return apiClient.put(`/admin/users/${userId}/role`, roleData);
  },

  deleteUser(userId) {
    return apiClient.delete(`/admin/users/${userId}`);
  },

  getAdminStats() {
    return apiClient.get('/admin/stats');
  },

  updateAdminSettings(settings) {
    return apiClient.put('/admin/settings', settings);
  },

  // Test endpoint
  testConnection() {
    return apiClient.get('/test');
  }
};