import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import i18n from './i18n';

// Import CSS
import './assets/styles/main.css';

// Import services
import auth from './services/auth';

// Import the TaskAttachments component
import TaskAttachments from './components/TaskAttachments.vue';
import AchievementNotification from './components/AchievementsNotification.vue';

// Import components
import HomePage from './components/HomePage.vue';
import CalendarPage from './components/CalendarPage.vue';
import AchievementsPage from './components/AchievementsPage.vue';
import AuthPage from './components/AuthPage.vue';
import UserProfilePage from './components/UserProfilePage.vue';
import AdminPanel from "./components/AdminPanel.vue";
import CategoryManagement from './components/CategoryManagement.vue';
import UserViewModal from './components/UserViewModal.vue';
import UserEditModal from './components/UserEditModal.vue';

// Initialize auth service
auth.init();

// Admin route guard
const requireAdminAuth = (to, from, next) => {
    if (!auth.isAuthenticated()) {
        next({
            path: '/auth',
            query: {
                redirect: to.fullPath,
                mode: 'login'
            }
        });
    } else if (!auth.isAdmin()) {
        // Redirect non-admin users to the home page
        next({ path: '/' });
    } else {
        next();
    }
};

// Route guards for authenticated routes
const requireAuth = (to, from, next) => {
    if (!auth.isAuthenticated()) {
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
        path: '/profile',
        component: UserProfilePage,
        beforeEnter: requireAuth,
        meta: { title: 'Profile - TaskMaster' }
    },
    {
        path: '/categories',
        component: CategoryManagement,
        beforeEnter: requireAuth,
        meta: { title: 'Manage Categories - TaskMaster' }
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
    {
        path: '/admin',
        component: AdminPanel,
        beforeEnter: requireAdminAuth,
        meta: { title: 'Admin Panel - TaskMaster' }
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
    // Dynamically update title based on selected language
    const appName = i18n.global.t('appName');

    if (to.path === '/') {
        document.title = appName;
    } else if (to.path === '/calendar') {
        document.title = `${i18n.global.t('nav.calendar')} - ${appName}`;
    } else if (to.path === '/achievements') {
        document.title = `${i18n.global.t('nav.achievements')} - ${appName}`;
    } else if (to.path === '/categories') {
        document.title = `${i18n.global.t('nav.categories')} - ${appName}`;
    } else if (to.path === '/admin') {
        document.title = `${i18n.global.t('nav.admin')} - ${appName}`;
    } else if (to.path === '/auth') {
        const mode = to.query.mode === 'register' ? i18n.global.t('nav.signup') : i18n.global.t('nav.login');
        document.title = `${mode} - ${appName}`;
    } else {
        document.title = to.meta.title || appName;
    }
});

// Create Vue app
const app = createApp(App);

// Register components globally
app.component('TaskAttachments', TaskAttachments);
app.component('AchievementNotification', AchievementNotification);
app.component('UserViewModal', UserViewModal);
app.component('UserEditModal', UserEditModal);

// Global properties - передаем весь auth объект
app.config.globalProperties.$auth = auth;

// Use i18n
app.use(i18n);

// Use router
app.use(router);

// Mount app
app.mount('#app');