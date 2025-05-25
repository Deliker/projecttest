import { reactive } from 'vue';
import apiService from './api';

// Создаем реактивное состояние с той же структурой, что была изначально
const state = reactive({
  isAuthenticated: false,
  user: null,
  userId: null,
  token: null,
  loading: false,
  error: null
});

export default {
  // Current authentication state - возвращаем реактивное состояние
  state,

  // Initialize auth state from localStorage
  init() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    const userId = localStorage.getItem('user_id');

    if (token && user && userId) {
      try {
        state.token = token;
        state.user = JSON.parse(user);
        state.userId = parseInt(userId);
        state.isAuthenticated = true;
        console.log("Auth initialized with user:", state.user);
        console.log("User role:", state.user?.role);
      } catch (e) {
        console.error('Error parsing stored user data', e);
        this.logout();
      }
    }
  },

  // Check if current user has admin role
  isAdmin() {
    console.log("Checking admin status, current user:", state.user);

    if (!state.user) {
      console.log("No user is logged in");
      return false;
    }

    // Check role in different formats since it might be stored differently
    const role = state.user.role;
    console.log("User role:", role, "Type:", typeof role);

    if (typeof role === 'string') {
      const normalizedRole = role.toUpperCase();
      console.log("Normalized role:", normalizedRole);
      return normalizedRole === 'ADMIN';
    } else if (typeof role === 'object' && role !== null) {
      // Handle when role is an object with name property
      const roleName = role.name || '';
      console.log("Role object name:", roleName);
      return roleName.toUpperCase() === 'ADMIN';
    }

    return false;
  },

  // Register a new user
  async register(name, email, password) {
    state.loading = true;
    state.error = null;

    try {
      await apiService.register({ name, email, password });

      // Automatically log in after successful registration
      return this.login(email, password);
    } catch (error) {
      state.error = error.response?.data?.error || 'Registration failed';
      state.loading = false;
      throw error;
    }
  },

  // Login user
  async login(email, password) {
    state.loading = true;
    state.error = null;

    try {
      const response = await apiService.login({ email, password });
      document.dispatchEvent(new Event('user-logged-in'));

      // Make sure we get the role from the response
      const { id, name, email: userEmail, token, role } = response.data;
      console.log("Login response:", response.data);

      // Store auth data including role
      state.isAuthenticated = true;
      state.user = {
        id,
        name,
        email: userEmail,
        role
      };
      state.userId = id;
      state.token = token;

      // Persist to localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(state.user));
      localStorage.setItem('user_id', id);

      console.log("User stored after login:", state.user);
      console.log("Is admin after login?", this.isAdmin());

      state.loading = false;
      return response.data;
    } catch (error) {
      state.error = error.response?.data?.error || 'Login failed';
      state.loading = false;
      throw error;
    }
  },

  // Logout user
  logout() {
    // Clear state
    state.isAuthenticated = false;
    state.user = null;
    state.userId = null;
    state.token = null;
    state.loading = false;
    state.error = null;

    document.dispatchEvent(new Event('user-logged-out'));

    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_id');

    console.log("User logged out, state cleared");
  },

  // Get user profile data
  async getUserProfile() {
    if (!state.isAuthenticated || !state.userId) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await apiService.getUserInfo(state.userId);
      console.log("Profile response:", response.data);

      // If the profile response includes role information, update it
      if (response.data && response.data.role) {
        state.user = {
          ...state.user,
          role: response.data.role
        };
        localStorage.setItem('user', JSON.stringify(state.user));
        console.log("Updated user role:", state.user.role);
        console.log("Is admin after profile update?", this.isAdmin());
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return state.isAuthenticated;
  },

  // Get current user
  getCurrentUser() {
    return state.user;
  },

  // Get user ID
  getUserId() {
    return state.userId;
  }
};