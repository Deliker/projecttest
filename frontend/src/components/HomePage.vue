<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          {{ $t('home.hero.titleStart') }}
          <span class="accent">{{ $t('home.hero.titleAccent') }}</span>
        </h1>
        <p class="hero-subtitle">{{ $t('home.hero.subtitle') }}</p>
        <div class="hero-actions">
          <router-link to="/calendar" class="btn btn-primary">
            <span>{{ $t('home.hero.getStarted') }}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14m-7-7l7 7-7 7"/>
            </svg>
          </router-link>
        </div>
      </div>

      <div class="hero-visual">
        <div class="calendar-preview">
          <div class="preview-header">
            <div class="preview-dot"></div>
            <div class="preview-dot"></div>
            <div class="preview-dot"></div>
          </div>
          <div class="preview-content">
            <div class="preview-month">{{ localizedCurrentDate }}</div>
            <div class="preview-days">
              <div class="preview-day-label">{{ $t('calendar.weekdays.mon') }}</div>
              <div class="preview-day-label">{{ $t('calendar.weekdays.tue') }}</div>
              <div class="preview-day-label">{{ $t('calendar.weekdays.wed') }}</div>
              <div class="preview-day-label">{{ $t('calendar.weekdays.thu') }}</div>
              <div class="preview-day-label">{{ $t('calendar.weekdays.fri') }}</div>
              <div class="preview-day-label">{{ $t('calendar.weekdays.sat') }}</div>
              <div class="preview-day-label">{{ $t('calendar.weekdays.sun') }}</div>
            </div>
            <div class="preview-grid">
              <div v-for="i in 30" :key="i" class="preview-day" :class="{'preview-has-task': [3, 7, 12, 15, 19, 23, 27].includes(i), 'preview-today': i === 15}">
                {{ i }}
              </div>
              <div class="preview-task">Meeting with team</div>
              <div class="preview-task">Project deadline</div>
              <div class="preview-task">Call with client</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="section-header">
        <h2 class="section-title">{{ $t('home.features.title') }}</h2>
        <p class="section-subtitle">{{ $t('home.features.subtitle') }}</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h3>{{ $t('home.features.smartPlanning') }}</h3>
          <p>{{ $t('home.features.smartPlanningDesc') }}</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
              <path d="M2 17L12 22L22 17"/>
              <path d="M2 12L12 17L22 12"/>
            </svg>
          </div>
          <h3>{{ $t('home.features.timeOptimization') }}</h3>
          <p>{{ $t('home.features.timeOptimizationDesc') }}</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h3>{{ $t('home.features.taskTracking') }}</h3>
          <p>{{ $t('home.features.taskTrackingDesc') }}</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 15C8.13401 15 5 11.866 5 8V3H19V8C19 11.866 15.866 15 12 15Z"/>
              <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88"/>
            </svg>
          </div>
          <h3>{{ $t('home.features.achievementSystem') }}</h3>
          <p>{{ $t('home.features.achievementSystemDesc') }}</p>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="cta-content">
        <h2>{{ $t('home.cta.title') }}</h2>
        <p>{{ $t('home.cta.subtitle') }}</p>
        <router-link to="/calendar" class="btn btn-primary">{{ $t('home.hero.startNow') }}</router-link>
      </div>
    </section>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import axios from 'axios';

export default {
  setup() {
    const i18n = useI18n();

    const localizedCurrentDate = computed(() => {
      const currentDate = new Date();
      const monthKey = [
        'calendar.month.january',
        'calendar.month.february',
        'calendar.month.march',
        'calendar.month.april',
        'calendar.month.may',
        'calendar.month.june',
        'calendar.month.july',
        'calendar.month.august',
        'calendar.month.september',
        'calendar.month.october',
        'calendar.month.november',
        'calendar.month.december'
      ][currentDate.getMonth()];

      return `${i18n.t(monthKey)} ${currentDate.getFullYear()}`;
    });

    return {
      localizedCurrentDate
    };
  },
  methods: {
    async testConnection() {
      try {
        console.log('Начало запроса к API...');
        const response = await axios.get('/api/test');
        console.log('Ответ успешно получен:', response.data);
        alert('Соединение успешно: ' + response.data.message);
      } catch (error) {
        console.error('Ошибка соединения:', error);
        alert('Ошибка соединения: ' + error.message);
      }
    }
  }
};
</script>
<style scoped>
.home-page {
  min-height: 100vh;
  color: var(--color-text);
  overflow-x: hidden;
}

.hero-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6rem 2rem;
  gap: 4rem;
  min-height: 90vh;
}

.hero-content {
  flex: 1;
  max-width: 600px;
  animation: fadeSlideUp var(--transition-medium) ease-out;
}

.hero-title {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.hero-title .accent {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  white-space: nowrap;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  margin-bottom: 2.5rem;
  line-height: 1.6;
  animation: fadeSlideUp var(--transition-medium) ease-out 0.2s backwards;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  animation: fadeSlideUp var(--transition-medium) ease-out 0.4s backwards;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  transition: all var(--transition-medium);
  border: none;
  cursor: pointer;
  text-decoration: none;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.btn-secondary {
  background: var(--color-card-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-card-bg-hover);
  transform: translateY(-2px);
}

.hero-stats {
  display: flex;
  align-items: center;
  margin-top: 3rem;
  padding: 1.5rem;
  background: var(--color-card-bg);
  border-radius: 12px;
  animation: fadeSlideUp var(--transition-medium) ease-out 0.6s backwards;
  border: 1px solid var(--color-border);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--color-border);
  margin: 0 2rem;
}

.hero-visual {
  flex: 1;
  max-width: 600px;
  animation: fadeSlideUp var(--transition-medium) ease-out 0.8s backwards;
  perspective: 1000px;
}

.calendar-preview {
  background: var(--color-card-bg);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  padding: 1.5rem;
  transform: perspective(1000px) rotateY(-15deg) rotateX(5deg);
  transition: transform var(--transition-medium);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.calendar-preview::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
      45deg,
      transparent 0%,
      rgba(255, 255, 255, 0.03) 50%,
      transparent 100%
  );
  transform: rotate(45deg);
  animation: lightSweep 8s linear infinite;
}

@keyframes lightSweep {
  0% {
    transform: rotate(45deg) translateY(100%);
  }
  100% {
    transform: rotate(45deg) translateY(-100%);
  }
}

.calendar-preview:hover {
  transform: perspective(1000px) rotateY(-10deg) rotateX(3deg) translateY(-10px);
  box-shadow: 0 40px 70px rgba(0, 0, 0, 0.2);
}

.preview-header {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.preview-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-month {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.preview-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.preview-day-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-align: center;
  font-weight: 500;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  position: relative;
}

.preview-day {
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: var(--color-text);
  background: var(--color-card-bg-hover);
  border-radius: 6px;
  transition: all var(--transition-medium);
}

.preview-has-task {
  background: rgba(99, 102, 241, 0.15);
  color: var(--color-primary);
  font-weight: 600;
}

.preview-today {
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
}

.preview-task {
  position: absolute;
  background: var(--color-primary);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  opacity: 0.9;
}

.preview-task:nth-child(31) {
  top: 20%;
  left: 15%;
  transform: rotate(-3deg);
}

.preview-task:nth-child(32) {
  top: 40%;
  right: 15%;
  transform: rotate(2deg);
  background: var(--color-secondary);
}

.preview-task:nth-child(33) {
  bottom: 20%;
  left: 30%;
  transform: rotate(-1deg);
  background: var(--color-accent);
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section-subtitle {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  max-width: 700px;
  margin: 0 auto;
}

.features-section {
  padding: 6rem 2rem;
  background: var(--color-card-bg);
  position: relative;
  overflow: hidden;
}

.features-section::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, var(--color-primary) 0%, transparent 70%);
  top: -300px;
  right: -300px;
  opacity: 0.1;
  z-index: 0;
}

.features-section::after {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, var(--color-secondary) 0%, transparent 70%);
  bottom: -300px;
  left: -300px;
  opacity: 0.1;
  z-index: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
  max-width: 1280px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.feature-card {
  background: var(--bg-gradient-start);
  border-radius: 16px;
  padding: 2.5rem;
  transition: all var(--transition-medium);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary);
}

.feature-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;
  transition: all var(--transition-medium);
}

.feature-card:hover .feature-icon {
  transform: scale(1.1) rotate(5deg);
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.feature-card p {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.cta-section {
  padding: 6rem 2rem;
  background: var(--color-card-bg);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  opacity: 0.1;
  mask: radial-gradient(circle at center, black 0%, transparent 70%);
}

.cta-content {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto;
}

.cta-section h2 {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.cta-section p {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  margin-bottom: 2.5rem;
}

.cta-section .btn-primary {
  font-size: 1.1rem;
  padding: 1rem 2rem;
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1280px) {
  .hero-title {
    font-size: 3.5rem;
  }
}

@media (max-width: 1024px) {
  .hero-section {
    flex-direction: column;
    padding: 4rem 2rem;
    text-align: center;
    gap: 4rem;
  }

  .hero-content {
    max-width: 100%;
  }

  .hero-title {
    font-size: 3rem;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-stats {
    width: 100%;
  }

  .hero-visual {
    max-width: 500px;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .feature-card {
    padding: 2rem;
  }

  .cta-section h2 {
    font-size: 2.5rem;
  }

  .cta-section p {
    font-size: 1.1rem;
  }
}

@media (max-width: 640px) {
  .hero-actions {
    flex-direction: column;
    width: 100%;
    gap: 1rem;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .hero-stats {
    flex-direction: column;
    gap: 1.5rem;
  }

  .stat-divider {
    width: 80%;
    height: 1px;
    margin: 0;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .cta-section h2 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .preview-days, .preview-grid {
    gap: 0.25rem;
  }

  .preview-day {
    font-size: 0.75rem;
  }

  .section-title {
    font-size: 1.75rem;
  }
}
</style>