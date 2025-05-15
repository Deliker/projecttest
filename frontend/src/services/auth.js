
import apiService from './api';

export default {
  // Current authentication state
  state: {
    isAuthenticated: false,
    user: null,
    userId: null,
    token: null,
    loading: false,
    error: null
  },

  // Initialize auth state from localStorage
  init() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    const userId = localStorage.getItem('user_id');

    if (token && user && userId) {
      try {
        this.state.token = token;
        this.state.user = JSON.parse(user);
        this.state.userId = parseInt(userId);
        this.state.isAuthenticated = true;
        console.log("Auth initialized with user role:", this.state.user?.role);
      } catch (e) {
        console.error('Error parsing stored user data', e);
        this.logout();
      }
    }
  },

  // Check if current user has admin role
  isAdmin() {
    console.log("Checking admin status, current role:", this.state.user?.role);
    // Check for both uppercase and lowercase role values to be safe
    return this.state.user &&
        (this.state.user.role === 'ADMIN' ||
            this.state.user.role === 'admin' ||
            this.state.user.role === 'Admin');
  },

  // Register a new user
  async register(name, email, password) {
    this.state.loading = true;
    this.state.error = null;

    try {
      await apiService.register({ name, email, password });

      // Automatically log in after successful registration
      return this.login(email, password);
    } catch (error) {
      this.state.error = error.response?.data?.error || 'Registration failed';
      this.state.loading = false;
      throw error;
    }
  },

  // Login user
  async login(email, password) {
    this.state.loading = true;
    this.state.error = null;

    try {
      const response = await apiService.login({ email, password });
      document.dispatchEvent(new Event('user-logged-in'));

      // Make sure we get the role from the response
      const { id, name, email: userEmail, token, role } = response.data;

      // Store auth data including role
      this.state.isAuthenticated = true;
      this.state.user = { name, email: userEmail, role };
      this.state.userId = id;
      this.state.token = token;

      // Persist to localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(this.state.user));
      localStorage.setItem('user_id', id);

      this.state.loading = false;
      return response.data;
    } catch (error) {
      this.state.error = error.response?.data?.error || 'Login failed';
      this.state.loading = false;
      throw error;
    }
  },

  // Logout user
  logout() {
    // Clear state
    this.state.isAuthenticated = false;
    this.state.user = null;
    this.state.userId = null;
    this.state.token = null;
    document.dispatchEvent(new Event('user-logged-out'));
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_id');
  },

  // Get user profile data
  async getUserProfile() {
    if (!this.state.isAuthenticated || !this.state.userId) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await apiService.getUserInfo(this.state.userId);

      // If the profile response includes role information, update it
      if (response.data && response.data.role) {
        this.state.user = {
          ...this.state.user,
          role: response.data.role
        };
        localStorage.setItem('user', JSON.stringify(this.state.user));
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return this.state.isAuthenticated;
  },

  // Get current user
  getCurrentUser() {
    return this.state.user;
  },

  // Get user ID
  getUserId() {
    return this.state.userId;
  }
};