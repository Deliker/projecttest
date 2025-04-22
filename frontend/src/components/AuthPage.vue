<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-box">
        <div class="auth-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="logo-text">TaskMaster</span>
        </div>

        <div class="auth-forms">
          <transition name="form-fade" mode="out-in">
            <form v-if="!isRegistering" @submit.prevent="handleLogin" class="auth-form" key="login">
              <h2 class="form-title">{{ $t('auth.login.title') }}</h2>
              <p class="auth-subtitle">{{ $t('auth.login.subtitle') }}</p>

              <div v-if="error" class="error-alert">
                {{ error }}
              </div>

              <div class="form-group" :class="{ 'has-error': loginErrors.email }">
                <label for="login-email">{{ $t('auth.login.email') }}</label>
                <input
                    type="email"
                    id="login-email"
                    v-model="loginForm.email"
                    required
                    :placeholder="$t('auth.login.email')"
                    @focus="loginErrors.email = ''"
                />
                <span v-if="loginErrors.email" class="error-message">{{ loginErrors.email }}</span>
              </div>

              <div class="form-group" :class="{ 'has-error': loginErrors.password }">
                <label for="login-password">{{ $t('auth.login.password') }}</label>
                <div class="password-input">
                  <input
                      :type="showPassword ? 'text' : 'password'"
                      id="login-password"
                      v-model="loginForm.password"
                      required
                      :placeholder="$t('auth.login.password')"
                      @focus="loginErrors.password = ''"
                  />
                  <button
                      type="button"
                      class="toggle-password"
                      @click="togglePassword"
                      aria-label="Toggle password visibility"
                  >
                    <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                </div>
                <span v-if="loginErrors.password" class="error-message">{{ loginErrors.password }}</span>
              </div>

              <div class="form-actions">
                <label class="remember-me">
                  <input type="checkbox" v-model="loginForm.remember" />
                  <span>{{ $t('auth.login.rememberMe') }}</span>
                </label>
                <a href="#" class="forgot-password">{{ $t('auth.login.forgotPassword') }}</a>
              </div>

              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="!loading">{{ $t('nav.login') }}</span>
                <span v-else class="loading-spinner"></span>
              </button>

              <div class="social-login">
                <p class="or-divider"><span>{{ $t('auth.login.continueWith') }}</span></p>
                <div class="social-buttons">
                  <button type="button" class="social-btn google">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="currentColor"/>
                    </svg>
                    <span>Google</span>
                  </button>
                  <button type="button" class="social-btn apple">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.05 20.28c-.98.95-2.05.02-3.18.02-1.13 0-2.18.89-3.18-.02-3.16.04-4.44-1.88-4.44-1.88-2.92-4.56-.69-11.34 2.85-11.34.77 0 1.97.74 3.11.74 1.14 0 2.4-.74 3.17-.74 2.34 0 4.5 3.89 4.5 8.55 0 1.88-2.5 4.23-2.83 4.67z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M15.08 4.59c-.68.4-2.55.44-3.17-1.09.08-.21 2.58-.95 3.17 1.09z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Apple</span>
                  </button>
                </div>
              </div>

              <p class="auth-switch">
                {{ $t('auth.login.noAccount') }}
                <a href="#" @click.prevent="toggleForm">{{ $t('auth.login.signUp') }}</a>
              </p>
            </form>

            <form v-else @submit.prevent="handleRegister" class="auth-form" key="register">
              <h2 class="form-title">{{ $t('auth.register.title') }}</h2>
              <p class="auth-subtitle">{{ $t('auth.register.subtitle') }}</p>

              <div v-if="error" class="error-alert">
                {{ error }}
              </div>

              <div class="form-group" :class="{ 'has-error': registerErrors.name }">
                <label for="register-name">{{ $t('auth.register.fullName') }}</label>
                <input
                    type="text"
                    id="register-name"
                    v-model="registerForm.name"
                    required
                    :placeholder="$t('auth.register.fullName')"
                    @focus="registerErrors.name = ''"
                />
                <span v-if="registerErrors.name" class="error-message">{{ registerErrors.name }}</span>
              </div>

              <div class="form-group" :class="{ 'has-error': registerErrors.email }">
                <label for="register-email">{{ $t('auth.register.email') }}</label>
                <input
                    type="email"
                    id="register-email"
                    v-model="registerForm.email"
                    required
                    :placeholder="$t('auth.register.email')"
                    @focus="registerErrors.email = ''"
                />
                <span v-if="registerErrors.email" class="error-message">{{ registerErrors.email }}</span>
              </div>

              <div class="form-group" :class="{ 'has-error': registerErrors.password }">
                <label for="register-password">{{ $t('auth.register.password') }}</label>
                <div class="password-input">
                  <input
                      :type="showPassword ? 'text' : 'password'"
                      id="register-password"
                      v-model="registerForm.password"
                      required
                      :placeholder="$t('auth.register.createPassword')"
                      @focus="registerErrors.password = ''"
                      @input="checkPasswordStrength"
                  />
                  <button
                      type="button"
                      class="toggle-password"
                      @click="togglePassword"
                      aria-label="Toggle password visibility"
                  >
                    <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                </div>
                <span v-if="registerErrors.password" class="error-message">{{ registerErrors.password }}</span>

                <div class="password-strength" v-if="registerForm.password">
                  <div class="strength-label">{{ $t('auth.passwordStrength.weak') }}: <span :class="strengthClass">{{ passwordStrength }}</span></div>
                  <div class="strength-meter">
                    <div class="strength-segment" :class="{ active: passwordScore >= 1 }"></div>
                    <div class="strength-segment" :class="{ active: passwordScore >= 2 }"></div>
                    <div class="strength-segment" :class="{ active: passwordScore >= 3 }"></div>
                    <div class="strength-segment" :class="{ active: passwordScore >= 4 }"></div>
                  </div>
                </div>
              </div>

              <div class="form-group" :class="{ 'has-error': registerErrors.confirmPassword }">
                <label for="register-confirm-password">{{ $t('auth.register.confirmPassword') }}</label>
                <div class="password-input">
                  <input
                      :type="showPassword ? 'text' : 'password'"
                      id="register-confirm-password"
                      v-model="registerForm.confirmPassword"
                      required
                      :placeholder="$t('auth.register.confirmYourPassword')"
                      @focus="registerErrors.confirmPassword = ''"
                  />
                </div>
                <span v-if="registerErrors.confirmPassword" class="error-message">{{ registerErrors.confirmPassword }}</span>
              </div>

              <div class="form-group terms-checkbox">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="registerForm.agreeTerms" required />
                  <span>{{ $t('auth.register.agreeTerms') }} <a href="#" class="terms-link">{{ $t('auth.register.termsService') }}</a> {{ $t('auth.register.and') }} <a href="#" class="terms-link">{{ $t('auth.register.privacyPolicy') }}</a></span>
                </label>
                <span v-if="registerErrors.agreeTerms" class="error-message">{{ registerErrors.agreeTerms }}</span>
              </div>

              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="!loading">{{ $t('nav.signup') }}</span>
                <span v-else class="loading-spinner"></span>
              </button>

              <div class="social-login">
                <p class="or-divider"><span>{{ $t('auth.register.signUpWith') }}</span></p>
                <div class="social-buttons">
                  <button type="button" class="social-btn google">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="currentColor"/>
                    </svg>
                    <span>Google</span>
                  </button>
                  <button type="button" class="social-btn apple">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.05 20.28c-.98.95-2.05.02-3.18.02-1.13 0-2.18.89-3.18-.02-3.16.04-4.44-1.88-4.44-1.88-2.92-4.56-.69-11.34 2.85-11.34.77 0 1.97.74 3.11.74 1.14 0 2.4-.74 3.17-.74 2.34 0 4.5 3.89 4.5 8.55 0 1.88-2.5 4.23-2.83 4.67z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M15.08 4.59c-.68.4-2.55.44-3.17-1.09.08-.21 2.58-.95 3.17 1.09z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Apple</span>
                  </button>
                </div>
              </div>

              <p class="auth-switch">
                {{ $t('auth.register.alreadyAccount') }}
                <a href="#" @click.prevent="toggleForm">{{ $t('auth.register.logIn') }}</a>
              </p>
            </form>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import authService from '../services/auth';

export default {
  setup() {
    const i18n = useI18n();
    return { i18n };
  },
  data() {
    return {
      isRegistering: this.$route.query.mode === 'register',
      showPassword: false,
      loading: false,
      error: null,
      loginForm: {
        email: '',
        password: '',
        remember: false
      },
      registerForm: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
      },
      loginErrors: {
        email: '',
        password: '',
        general: ''
      },
      registerErrors: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: '',
        general: ''
      },
      passwordScore: 0,
      passwordStrength: '',
      strengthClass: ''
    }
  },
  watch: {
    '$route.query.mode': {
      handler(newMode) {
        this.isRegistering = newMode === 'register';
        this.error = null;
      },
      immediate: true
    }
  },
  methods: {
    toggleForm() {
      this.isRegistering = !this.isRegistering;
      this.showPassword = false;
      this.resetErrors();
      this.error = null;
      this.$router.replace({
        query: {
          mode: this.isRegistering ? 'register' : 'login'
        }
      });
    },
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    validateLoginForm() {
      let isValid = true;
      this.resetErrors();

      if (!this.loginForm.email) {
        this.loginErrors.email = this.$t('auth.validation.required', { field: this.$t('auth.login.email') });
        isValid = false;
      } else if (!this.isValidEmail(this.loginForm.email)) {
        this.loginErrors.email = this.$t('auth.validation.validEmail');
        isValid = false;
      }

      if (!this.loginForm.password) {
        this.loginErrors.password = this.$t('auth.validation.required', { field: this.$t('auth.login.password') });
        isValid = false;
      }

      return isValid;
    },
    validateRegisterForm() {
      let isValid = true;
      this.resetErrors();

      if (!this.registerForm.name || this.registerForm.name.trim().length < 2) {
        this.registerErrors.name = this.$t('auth.validation.minLength', { field: this.$t('auth.register.fullName'), length: 2 });
        isValid = false;
      }

      if (!this.registerForm.email) {
        this.registerErrors.email = this.$t('auth.validation.required', { field: this.$t('auth.register.email') });
        isValid = false;
      } else if (!this.isValidEmail(this.registerForm.email)) {
        this.registerErrors.email = this.$t('auth.validation.validEmail');
        isValid = false;
      }

      if (!this.registerForm.password) {
        this.registerErrors.password = this.$t('auth.validation.required', { field: this.$t('auth.register.password') });
        isValid = false;
      } else if (this.registerForm.password.length < 8) {
        this.registerErrors.password = this.$t('auth.validation.minLength', { field: this.$t('auth.register.password'), length: 8 });
        isValid = false;
      } else if (this.passwordScore < 2) {
        this.registerErrors.password = this.$t('auth.validation.weakPassword');
        isValid = false;
      }

      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.registerErrors.confirmPassword = this.$t('auth.validation.passwordsMatch');
        isValid = false;
      }

      if (!this.registerForm.agreeTerms) {
        this.registerErrors.agreeTerms = this.$t('auth.validation.agreeTerms');
        isValid = false;
      }

      return isValid;
    },
    isValidEmail(email) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    },
    checkPasswordStrength() {
      const password = this.registerForm.password;

      if (!password) {
        this.passwordScore = 0;
        this.passwordStrength = '';
        return;
      }

      let score = 0;

      if (password.length >= 8) score++;
      if (password.length >= 10) score++;

      if (/[A-Z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;

      this.passwordScore = Math.min(score, 4);

      const strengthTexts = [
        this.$t('auth.passwordStrength.weak'),
        this.$t('auth.passwordStrength.fair'),
        this.$t('auth.passwordStrength.good'),
        this.$t('auth.passwordStrength.strong'),
        this.$t('auth.passwordStrength.veryStrong')
      ];
      const strengthClasses = ['weak', 'fair', 'good', 'strong', 'very-strong'];

      this.passwordStrength = strengthTexts[Math.min(this.passwordScore, 4)];
      this.strengthClass = strengthClasses[Math.min(this.passwordScore, 4)];
    },
    resetErrors() {
      this.loginErrors = {
        email: '',
        password: '',
        general: ''
      };
      this.registerErrors = {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: '',
        general: ''
      };
      this.error = null;
    },
    async handleLogin() {
      if (!this.validateLoginForm()) return;

      this.loading = true;
      this.error = null;

      try {
        await authService.login(this.loginForm.email, this.loginForm.password);
        
        // Redirect to the calendar page or to the requested route
        const redirectPath = this.$route.query.redirect || '/calendar';
        this.$router.push(redirectPath);
      } catch (error) {
        console.error('Login error:', error);
        this.error = error.response?.data?.error || 'Login failed. Please check your credentials.';
        this.loading = false;
      }
    },
    async handleRegister() {
      if (!this.validateRegisterForm()) return;

      this.loading = true;
      this.error = null;

      try {
        await authService.register(
          this.registerForm.name,
          this.registerForm.email,
          this.registerForm.password
        );
        
        // User will be logged in automatically after registration
        this.$router.push('/calendar');
      } catch (error) {
        console.error('Registration error:', error);
        this.error = error.response?.data?.error || 'Registration failed. Please try again.';
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  transition: background var(--transition-medium);
}

.auth-container {
  width: 100%;
  max-width: 480px;
  animation: fadeSlideUp var(--transition-medium) ease-out;
}

.auth-box {
  background: var(--color-card-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: var(--box-shadow);
  transition: all var(--transition-medium);
}

.auth-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  color: var(--color-text);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.auth-form {
  color: var(--color-text);
}

.form-title {
  font-size: 1.75rem;
  text-align: center;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.auth-subtitle {
  text-align: center;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.error-alert {
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border-radius: 8px;
  border: 1px solid rgba(220, 53, 69, 0.2);
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 1rem;
  transition: all var(--transition-medium);
}

.form-group.has-error input {
  border-color: #e53e3e;
}

.error-message {
  color: #e53e3e;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  display: block;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.light-theme .form-group input:focus {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.light-theme .form-group input::placeholder {
  color: rgba(0, 0, 0, 0.4);
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);
}

.toggle-password:hover {
  color: var(--color-text);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.remember-me input {
  cursor: pointer;
  width: 1rem;
  height: 1rem;
}

.forgot-password {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.forgot-password:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

.btn {
  width: 100%;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-medium);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  position: relative;
  overflow: hidden;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.light-theme .btn-primary:hover {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.btn-primary:disabled {
  background: #a3a3a3;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.auth-switch {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.auth-switch a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  margin-left: 0.25rem;
  transition: color var(--transition-fast);
}

.auth-switch a:hover {
  text-decoration: underline;
  color: var(--color-primary-dark);
}

.social-login {
  margin-top: 2rem;
}

.or-divider {
  display: flex;
    align-items: center;
    margin: 2rem 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
}

.or-divider::before,
.or-divider::after {
  content: "";
    flex: 1;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.or-divider::before {
  left: 0;
}

.or-divider::after {
  right: 0;
}

.or-divider span {
  padding: 0 1rem;
}

.light-theme .or-divider span {
  background-color: var(--bg-gradient-start);
}

.social-buttons {
  display: flex;
  gap: 1rem;
}

.social-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-medium);
  border: 1px solid var(--color-border);
  background: var(--color-card-bg);
  color: var(--color-text);
}

.social-btn:hover {
  transform: translateY(-2px);
  background: var(--color-card-bg-hover);
  border-color: var(--color-border);
}

.social-btn.google:hover {
  border-color: #db4437;
}

.social-btn.apple:hover {
  border-color: #a3a3a3;
}

.terms-checkbox {
  margin-top: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
}

.checkbox-label input {
  margin-top: 0.2rem;
  width: auto;
}

.terms-link {
  color: var(--color-primary);
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.password-strength {
  margin-top: 0.75rem;
}

.strength-label {
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
  color: var(--color-text-secondary);
}

.strength-label span {
  font-weight: 500;
}

.strength-label span.weak {
  color: #e53e3e;
}

.strength-label span.fair {
  color: #f59e0b;
}

.strength-label span.good {
  color: #10b981;
}

.strength-label span.strong,
.strength-label span.very-strong {
  color: #059669;
}

.strength-meter {
  display: flex;
  gap: 0.25rem;
  height: 4px;
}

.strength-segment {
  flex: 1;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.light-theme .strength-segment {
  background: rgba(0, 0, 0, 0.1);
}

.strength-segment.active:nth-child(1) {
  background: #e53e3e;
}

.strength-segment.active:nth-child(2) {
  background: #f59e0b;
}

.strength-segment.active:nth-child(3) {
  background: #10b981;
}

.strength-segment.active:nth-child(4) {
  background: #059669;
}

/* Form transition */
.form-fade-enter-active,
.form-fade-leave-active {
  transition: opacity var(--transition-medium), transform var(--transition-medium);
}

.form-fade-enter-from,
.form-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .auth-box {
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .auth-box {
    padding: 1.5rem 1rem;
  }

  .social-buttons {
    flex-direction: column;
  }

  .form-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .forgot-password {
    align-self: flex-end;
  }
}
</style>