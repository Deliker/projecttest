// main.js - обновление для добавления сервиса достижений

import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import i18n from './i18n';

// Импортируем компоненты страниц
import HomePage from './components/HomePage.vue';
import CalendarPage from './components/CalendarPage.vue';
import AchievementsPage from './components/AchievementsPage.vue';
import AuthPage from './components/AuthPage.vue';

// Добавляем импорт сервиса достижений для его инициализации
import './services/achievements';

// Check for existing authentication
const checkAuth = () => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');

    if (token && user) {
        try {
            return {
                isAuthenticated: true,
                user: JSON.parse(user),
                token: token
            };
        } catch (e) {
            // If parsing fails, clear local storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
    }

    return {
        isAuthenticated: false,
        user: null,
        token: null
    };
};

// Route guards
const requireAuth = (to, from, next) => {
    if (!auth.isAuthenticated) {
        next({
            path: '/auth',
            query: {
                redirect: to.fullPath,
                mode: 'login'
            }
        });
    } else {
        next();
    }
};

// Routes configuration
const routes = [
    {
        path: '/',
        component: HomePage,
        meta: { title: 'Home - TaskMaster' }
    },
    {
        path: '/calendar',
        component: CalendarPage,
        beforeEnter: requireAuth,
        meta: { title: 'Calendar - TaskMaster' }
    },
    {
        path: '/achievements',
        component: AchievementsPage,
        beforeEnter: requireAuth,
        meta: { title: 'Achievements - TaskMaster' }
    },
    {
        path: '/auth',
        component: AuthPage,
        meta: { title: 'Log In - TaskMaster' }
    },
    // Catch-all 404 route
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { top: 0 };
        }
    }
});

// Update document title based on route meta and current language
router.afterEach((to) => {
    // Динамически обновляем заголовок в зависимости от выбранного языка
    const appName = i18n.global.t('appName');

    if (to.path === '/') {
        document.title = appName;
    } else if (to.path === '/calendar') {
        document.title = `${i18n.global.t('nav.calendar')} - ${appName}`;
    } else if (to.path === '/achievements') {
        document.title = `${i18n.global.t('nav.achievements')} - ${appName}`;
    } else if (to.path === '/auth') {
        const mode = to.query.mode === 'register' ? i18n.global.t('nav.signup') : i18n.global.t('nav.login');
        document.title = `${mode} - ${appName}`;
    } else {
        document.title = to.meta.title || appName;
    }
});

// Get initial auth state
const auth = checkAuth();

// Create Vue app
const app = createApp(App);

// Global properties
app.config.globalProperties.$auth = auth;

// Используем i18n
app.use(i18n);

// Use router
app.use(router);

// Mount app
app.mount('#app');