// achievements.js - сервис для управления достижениями в приложении TaskMaster

// Определение всех доступных достижений
export const achievementsList = [
    // Ежедневные достижения
    {
        id: 'beginner',
        category: 'daily',
        title: 'First Step',
        description: 'Complete your first task',
        icon: '🎯',
        requirement: 1,
        points: 10
    },
    {
        id: 'productive_day',
        category: 'daily',
        title: 'Productive Day',
        description: 'Complete 5 tasks in one day',
        icon: '⭐',
        requirement: 5,
        points: 25
    },
    {
        id: 'super_productive_day',
        category: 'daily',
        title: 'Super Productive Day',
        description: 'Complete 10 tasks in one day',
        icon: '🌟',
        requirement: 10,
        points: 50,
        secret: true
    },
    {
        id: 'early_bird',
        category: 'daily',
        title: 'Early Bird',
        description: 'Complete a task before 6 AM',
        icon: '🌅',
        requirement: 1,
        points: 30
    },
    {
        id: 'night_owl',
        category: 'daily',
        title: 'Night Owl',
        description: 'Complete a task after midnight',
        icon: '🌙',
        requirement: 1,
        points: 30
    },

    // Еженедельные достижения
    {
        id: 'goal_oriented',
        category: 'weekly',
        title: 'Goal Oriented',
        description: 'Complete 10 tasks in a week',
        icon: '🎯',
        requirement: 10,
        points: 50
    },
    {
        id: 'weekend_warrior',
        category: 'weekly',
        title: 'Weekend Warrior',
        description: 'Complete 5 tasks during weekend',
        icon: '💪',
        requirement: 5,
        points: 40
    },
    {
        id: 'perfect_week',
        category: 'weekly',
        title: 'Perfect Week',
        description: 'Complete at least 1 task every day of the week',
        icon: '✨',
        requirement: 7,
        points: 70
    },

    // Ежемесячные достижения
    {
        id: 'project_leader',
        category: 'monthly',
        title: 'Project Leader',
        description: 'Complete all tasks in a month',
        icon: '👑',
        requirement: 'all',
        points: 100
    },
    {
        id: 'time_master',
        category: 'monthly',
        title: 'Time Master',
        description: 'Complete 50 tasks',
        icon: '⌛',
        requirement: 50,
        points: 150
    },
    {
        id: 'consistency',
        category: 'monthly',
        title: 'Consistency King',
        description: 'Complete tasks for 30 days in a row',
        icon: '📈',
        requirement: 30,
        points: 200
    },

    // Специальные достижения
    {
        id: 'early_planner',
        category: 'special',
        title: 'Early Planner',
        description: 'Plan tasks a week in advance',
        icon: '📅',
        requirement: 7,
        points: 40
    },
    {
        id: 'speed_runner',
        category: 'special',
        title: 'Speed Runner',
        description: 'Complete 3 tasks within an hour',
        icon: '⚡',
        requirement: 3,
        points: 30
    },
    {
        id: 'multitasker',
        category: 'special',
        title: 'Multitasker',
        description: 'Complete tasks in 5 different categories',
        icon: '🎭',
        requirement: 5,
        points: 50
    },
    {
        id: 'organization_master',
        category: 'special',
        title: 'Organization Master',
        description: 'Categorize 20 tasks',
        icon: '📊',
        requirement: 20,
        points: 40
    },
    {
        id: 'priority_expert',
        category: 'special',
        title: 'Priority Expert',
        description: 'Complete 10 high-priority tasks',
        icon: '🔥',
        requirement: 10,
        points: 60,
        secret: true
    }
];

// Категории достижений
export const achievementCategories = [
    { id: 'daily', name: 'Daily Excellence', description: 'Achievements for daily productivity', icon: '📆' },
    { id: 'weekly', name: 'Weekly Milestones', description: 'Achievements for weekly consistency', icon: '📅' },
    { id: 'monthly', name: 'Monthly Mastery', description: 'Long-term achievements', icon: '📈' },
    { id: 'special', name: 'Special Achievements', description: 'Unique productivity milestones', icon: '🏆' }
];

// Класс для управления достижениями и прогрессом
class AchievementsService {
    constructor() {
        // Инициализация свойств
        this.unlockedAchievements = new Set();
        this.achievementsProgress = {};
        this.stats = {
            totalTasksCompleted: 0,
            totalPoints: 0,
            dailyTaskCounts: {},
            streak: 0,
            lastCompletionDate: null,
            categoriesUsed: new Set(),
            completedTasksByPriority: { high: 0, medium: 0, low: 0 },
            weeklyTasks: 0,
            tasksCompletedByDay: [0, 0, 0, 0, 0, 0, 0],
            lastWeekReset: null
        };
        this.recentCompletions = [];

        // Загрузка состояния из localStorage
        this.loadState();

        // Настройка слушателей событий
        this.initEventListeners();

        // Проверка необходимости сброса еженедельной статистики
        this.checkWeeklyReset();
    }

    // Загрузка состояния достижений из localStorage
    loadState() {
        try {
            // Загрузка разблокированных достижений
            const unlockedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
            this.unlockedAchievements = new Set(unlockedAchievements);

            // Загрузка прогресса достижений
            this.achievementsProgress = JSON.parse(localStorage.getItem('achievementsProgress') || '{}');

            // Загрузка общих статистических данных
            const savedStats = JSON.parse(localStorage.getItem('achievementStats') || '{}');

            // Конвертируем массив категорий в Set для правильного отслеживания
            const categoriesUsed = Array.isArray(savedStats.categoriesUsed)
                ? new Set(savedStats.categoriesUsed)
                : new Set();

            // Объединение сохраненных данных с дефолтными
            this.stats = {
                totalTasksCompleted: savedStats.totalTasksCompleted || 0,
                totalPoints: savedStats.totalPoints || 0,
                dailyTaskCounts: savedStats.dailyTaskCounts || {},
                streak: savedStats.streak || 0,
                lastCompletionDate: savedStats.lastCompletionDate,
                categoriesUsed: categoriesUsed,
                completedTasksByPriority: savedStats.completedTasksByPriority || { high: 0, medium: 0, low: 0 },
                weeklyTasks: savedStats.weeklyTasks || 0,
                tasksCompletedByDay: savedStats.tasksCompletedByDay || [0, 0, 0, 0, 0, 0, 0],
                lastWeekReset: savedStats.lastWeekReset || null
            };

            console.log("Loaded achievement state:", {
                unlockedCount: this.unlockedAchievements.size,
                stats: this.stats
            });
        } catch (error) {
            console.error('Error loading achievements state:', error);
            // Инициализируем дефолтные значения в случае ошибки
            this.resetState();
        }
    }

    // Сброс состояния на дефолтные значения
    resetState() {
        this.unlockedAchievements = new Set();
        this.achievementsProgress = {};
        this.stats = {
            totalTasksCompleted: 0,
            totalPoints: 0,
            dailyTaskCounts: {},
            streak: 0,
            lastCompletionDate: null,
            categoriesUsed: new Set(),
            completedTasksByPriority: { high: 0, medium: 0, low: 0 },
            weeklyTasks: 0,
            tasksCompletedByDay: [0, 0, 0, 0, 0, 0, 0],
            lastWeekReset: null
        };
        this.recentCompletions = [];
    }

    // Сохранение состояния достижений в localStorage
    saveState() {
        // Конвертируем Set в Array для хранения
        const categoriesArray = Array.from(this.stats.categoriesUsed);
        const statsToSave = {
            ...this.stats,
            categoriesUsed: categoriesArray
        };

        localStorage.setItem('achievements', JSON.stringify([...this.unlockedAchievements]));
        localStorage.setItem('achievementsProgress', JSON.stringify(this.achievementsProgress));
        localStorage.setItem('achievementStats', JSON.stringify(statsToSave));

        console.log("Saved achievement state:", {
            unlockedCount: this.unlockedAchievements.size,
            totalPoints: this.stats.totalPoints,
            streak: this.stats.streak
        });
    }

    // Инициализация слушателей событий
    initEventListeners() {
        // Слушатель для завершения задачи
        document.addEventListener('task-completed', (event) => {
            console.log('Task completed event received:', event.detail);
            this.trackTaskCompletion(event.detail);
        });

        // Слушатель для создания задачи
        document.addEventListener('task-created', (event) => {
            console.log('Task created event received:', event.detail);
            this.trackTaskCreation(event.detail);
        });

        // Добавляем глобальный обработчик для симуляции завершения задачи (для тестирования)
        if (typeof window !== 'undefined') {
            window.completeTaskManually = (taskData = null) => {
                const defaultTaskData = {
                    description: 'Test task',
                    priority: 'medium',
                    category: 'work',
                    day: new Date().getDate(),
                    month: new Date().getMonth(),
                    year: new Date().getFullYear()
                };

                const data = taskData || defaultTaskData;

                this.trackTaskCompletion(data);
                console.log('Manual task completion tracked:', data);
                return 'Task completion simulated';
            };
        }
    }

    // Проверка необходимости сброса еженедельной статистики
    checkWeeklyReset() {
        const now = new Date();
        const currentDay = now.getDay(); // 0 = воскресенье

        // Если сегодня воскресенье и мы еще не сбрасывали статистику на этой неделе
        if (currentDay === 0) {
            const today = now.toDateString();

            // Если мы не сбрасывали статистику сегодня
            if (this.stats.lastWeekReset !== today) {
                console.log('Resetting weekly stats');
                this.stats.weeklyTasks = 0;
                this.stats.tasksCompletedByDay = [0, 0, 0, 0, 0, 0, 0];
                this.stats.lastWeekReset = today;
                this.saveState();
            }
        }
    }

    // Отслеживание завершения задачи
    trackTaskCompletion(taskData) {
        const now = new Date();
        const today = now.toDateString();
        const currentHour = now.getHours();
        const currentDay = now.getDay(); // 0 = воскресенье
        const isWeekend = currentDay === 0 || currentDay === 6;

        // Обновляем общую статистику
        this.stats.totalTasksCompleted++;

        // Отслеживаем задачи по дням
        if (!this.stats.dailyTaskCounts[today]) {
            this.stats.dailyTaskCounts[today] = 0;
        }
        this.stats.dailyTaskCounts[today]++;

        // Обновляем серию последовательных дней
        if (this.stats.lastCompletionDate) {
            const lastDate = new Date(this.stats.lastCompletionDate);
            const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                this.stats.streak++;
            } else if (diffDays > 1) {
                this.stats.streak = 1;
            }
        } else {
            this.stats.streak = 1;
        }
        this.stats.lastCompletionDate = today;

        // Отслеживаем задачи по приоритету
        if (taskData.priority) {
            this.stats.completedTasksByPriority[taskData.priority]++;
        }

        // Отслеживаем категории задач
        if (taskData.category) {
            this.stats.categoriesUsed.add(taskData.category);
        }

        // Отслеживаем задачи по дням недели
        this.stats.tasksCompletedByDay[currentDay]++;

        // Отслеживаем еженедельные задачи
        this.stats.weeklyTasks++;

        // Добавляем текущее время для отслеживания hourlyTasks
        this.recentCompletions.push(now.getTime());
        // Убираем старые записи (старше часа)
        this.recentCompletions = this.recentCompletions.filter(time =>
            now.getTime() - time < 60 * 60 * 1000
        );

        // Проверяем достижения после обновления статистики
        this.checkAchievements({
            currentHour,
            today,
            isWeekend,
            taskData
        });

        // Сохраняем обновленное состояние
        this.saveState();

        // Для целей отладки выводим текущее состояние
        console.log('Updated stats after task completion:', {
            totalTasks: this.stats.totalTasksCompleted,
            todayTasks: this.stats.dailyTaskCounts[today],
            streak: this.stats.streak,
            points: this.stats.totalPoints,
            categoriesUsed: this.stats.categoriesUsed.size,
            recentCompletions: this.recentCompletions.length
        });
    }

    // Отслеживание создания задачи
    trackTaskCreation(taskData) {
        // Проверяем заранее запланированные задачи
        const now = new Date();
        const taskDate = new Date(taskData.year, taskData.month, taskData.day);
        const daysInAdvance = Math.floor((taskDate - now) / (1000 * 60 * 60 * 24));

        if (daysInAdvance >= 7) {
            // Задача запланирована как минимум на неделю вперед
            this.updateProgress('early_planner', 1);
            console.log('Early planner progress updated:', this.achievementsProgress['early_planner']);
        }

        this.saveState();
    }

    // Проверка достижений на основе текущих данных
    checkAchievements(context) {
        const { currentHour, today, isWeekend, taskData } = context;

        // Проверяем ежедневные достижения
        this.checkDailyAchievements(currentHour, today);

        // Проверяем еженедельные достижения
        this.checkWeeklyAchievements(isWeekend);

        // Проверяем ежемесячные достижения
        this.checkMonthlyAchievements();

        // Проверяем специальные достижения
        this.checkSpecialAchievements(taskData);
    }

    // Проверка ежедневных достижений
    checkDailyAchievements(currentHour, today) {
        // First Step - завершение первой задачи
        if (this.stats.totalTasksCompleted === 1) {
            this.unlockAchievement('beginner');
        }

        // Productive Day - завершение 5 задач за день
        if (this.stats.dailyTaskCounts[today] >= 5) {
            this.unlockAchievement('productive_day');
        }

        // Super Productive Day - завершение 10 задач за день
        if (this.stats.dailyTaskCounts[today] >= 10) {
            this.unlockAchievement('super_productive_day');
        }

        // Early Bird - завершение задачи до 6 утра
        if (currentHour < 6) {
            this.unlockAchievement('early_bird');
        }

        // Night Owl - завершение задачи после полуночи и до 4 утра
        if (currentHour >= 0 && currentHour < 4) {
            this.unlockAchievement('night_owl');
        }
    }

    // Проверка еженедельных достижений
    checkWeeklyAchievements(isWeekend) {
        // Goal Oriented - завершение 10 задач за неделю
        if (this.stats.weeklyTasks >= 10) {
            this.unlockAchievement('goal_oriented');
        }

        // Weekend Warrior - завершение 5 задач в выходные
        if (isWeekend) {
            this.updateProgress('weekend_warrior', 1);

            if (this.achievementsProgress['weekend_warrior'] >= 5) {
                this.unlockAchievement('weekend_warrior');
            }
        }

        // Perfect Week - завершение минимум 1 задачи каждый день недели
        const hasTaskEveryDay = this.stats.tasksCompletedByDay.every(count => count > 0);
        if (hasTaskEveryDay) {
            this.unlockAchievement('perfect_week');
        }
    }

    // Проверка ежемесячных достижений
    checkMonthlyAchievements() {
        // Time Master - завершение 50 задач
        if (this.stats.totalTasksCompleted >= 50) {
            this.unlockAchievement('time_master');
        }

        // Consistency King - завершение задач 30 дней подряд
        if (this.stats.streak >= 30) {
            this.unlockAchievement('consistency');
        }
    }

    // Проверка специальных достижений
    checkSpecialAchievements() {
        // Speed Runner - завершение 3 задач за час
        if (this.recentCompletions.length >= 3) {
            this.unlockAchievement('speed_runner');
        }

        // Multitasker - завершение задач в 5 различных категориях
        if (this.stats.categoriesUsed.size >= 5) {
            this.unlockAchievement('multitasker');
        }

        // Priority Expert - завершение 10 высокоприоритетных задач
        if (this.stats.completedTasksByPriority.high >= 10) {
            this.unlockAchievement('priority_expert');
        }
    }

    // Обновление прогресса достижения
    updateProgress(achievementId, increment = 1) {
        if (!this.achievementsProgress[achievementId]) {
            this.achievementsProgress[achievementId] = 0;
        }

        this.achievementsProgress[achievementId] += increment;

        // Получаем целевое значение для достижения
        const achievement = achievementsList.find(a => a.id === achievementId);
        if (!achievement) return;

        // Проверяем, достигнуто ли целевое значение
        if (this.achievementsProgress[achievementId] >= achievement.requirement) {
            this.unlockAchievement(achievementId);
        }
    }

    // Разблокировка достижения
    unlockAchievement(achievementId) {
        // Проверяем, не разблокировано ли уже достижение
        if (this.unlockedAchievements.has(achievementId)) {
            return false;
        }

        // Находим достижение в списке
        const achievement = achievementsList.find(a => a.id === achievementId);
        if (!achievement) {
            console.error(`Achievement with id "${achievementId}" not found`);
            return false;
        }

        // Разблокируем достижение
        this.unlockedAchievements.add(achievementId);

        // Добавляем очки
        this.stats.totalPoints += achievement.points;

        // Сохраняем состояние
        this.saveState();

        // Отправляем событие о разблокировке достижения
        const event = new CustomEvent('achievement-unlocked', {
            detail: {
                id: achievementId,
                title: achievement.title,
                description: achievement.description,
                icon: achievement.icon,
                points: achievement.points
            }
        });
        document.dispatchEvent(event);

        console.log('Achievement unlocked:', achievement.title, '(+', achievement.points, 'points)');

        return true;
    }

    // Получение списка всех достижений с информацией о разблокировке
    getAllAchievements() {
        return achievementsList.map(achievement => {
            const isUnlocked = this.unlockedAchievements.has(achievement.id);
            const progress = this.achievementsProgress[achievement.id] || 0;
            const totalRequired = achievement.requirement;

            // Скрываем информацию о "секретных" достижениях, пока они не разблокированы
            if (achievement.secret && !isUnlocked) {
                return {
                    id: achievement.id,
                    category: achievement.category,
                    title: "???",
                    description: "Secret achievement",
                    icon: "❓",
                    isUnlocked: false,
                    progress: 0,
                    totalRequired: 1,
                    secret: true,
                    points: 0
                };
            }

            return {
                ...achievement,
                isUnlocked,
                progress,
                totalRequired
            };
        });
    }

    // Получение статистики достижений
    getStats() {
        const totalAchievements = achievementsList.length;
        const unlockedCount = this.unlockedAchievements.size;
        const progressPercentage = Math.round((unlockedCount / totalAchievements) * 100) || 0;

        return {
            totalAchievements,
            unlockedCount,
            progressPercentage,
            totalPoints: this.stats.totalPoints,
            streak: this.stats.streak
        };
    }

    // Получение достижений по категории
    getAchievementsByCategory() {
        const result = {};

        achievementCategories.forEach(category => {
            result[category.id] = this.getAllAchievements().filter(
                achievement => achievement.category === category.id
            );
        });

        return result;
    }

    // Для тестирования и отладки: разблокировать случайное достижение
    unlockRandomAchievement() {
        const lockedAchievements = achievementsList
            .filter(a => !this.unlockedAchievements.has(a.id))
            .map(a => a.id);

        if (lockedAchievements.length === 0) {
            console.log('All achievements are already unlocked!');
            return false;
        }

        const randomId = lockedAchievements[Math.floor(Math.random() * lockedAchievements.length)];
        return this.unlockAchievement(randomId);
    }

    // Сброс всех достижений (для тестирования)
    resetAllAchievements() {
        this.resetState();
        this.saveState();
        console.log('All achievements have been reset');
        return true;
    }
}

// Создаем и экспортируем экземпляр сервиса достижений
const achievementsService = new AchievementsService();

// Добавляем сервис в глобальный объект window для отладки
if (typeof window !== 'undefined') {
    window.achievementsService = achievementsService;
}

export default achievementsService;