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

export default {
  // Auth endpoints
  register(userData) {
    return apiClient.post('/auth/register', userData);
  },
  uploadTaskAttachment(file, taskId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId);

    return axios.post('/api/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getTaskAttachments(taskId) {
    return axios.get(`/api/attachments/task/${taskId}`);
  },

// Delete an attachment
  deleteAttachment(attachmentId) {
    return axios.delete(`/api/attachments/${attachmentId}`);
  },
  login(credentials) {
    return apiClient.post('/auth/login', credentials);
  },
  
  getUserInfo(userId) {
    return apiClient.get(`/auth/user?userId=${userId}`);
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
  
  // Test endpoint
  testConnection() {
    return apiClient.get('/test');
  }
};