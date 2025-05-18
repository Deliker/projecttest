package com.example.demo.service;

import com.example.demo.model.Achievement;
import com.example.demo.model.Task;
import com.example.demo.model.User;
import com.example.demo.repository.AchievementRepository;
import com.example.demo.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class AchievementService {

    private static final Logger logger = Logger.getLogger(AchievementService.class.getName());

    private final AchievementRepository achievementRepository;
    private final TaskRepository taskRepository;

    // Achievement definitions (in a real app, these might be stored in a database)
    private final Map<String, Map<String, Object>> achievementDefinitions = new HashMap<>();

    @Autowired
    public AchievementService(AchievementRepository achievementRepository, TaskRepository taskRepository) {
        this.achievementRepository = achievementRepository;
        this.taskRepository = taskRepository;
        initializeAchievementDefinitions();
    }

    private void initializeAchievementDefinitions() {
        // Daily achievements
        addAchievementDefinition("beginner", "First Step", "Complete your first task", "🎯", 10, "daily");
        addAchievementDefinition("productive_day", "Productive Day", "Complete 5 tasks in one day", "⭐", 25, "daily");
        addAchievementDefinition("super_productive_day", "Super Productive Day", "Complete 10 tasks in one day", "🌟", 50, "daily");
        addAchievementDefinition("early_bird", "Early Bird", "Complete a task before 6 AM", "🌅", 30, "daily");
        addAchievementDefinition("night_owl", "Night Owl", "Complete a task after midnight", "🌙", 30, "daily");

        // Weekly achievements
        addAchievementDefinition("goal_oriented", "Goal Oriented", "Complete 10 tasks in a week", "🎯", 50, "weekly");
        addAchievementDefinition("weekend_warrior", "Weekend Warrior", "Complete 5 tasks during weekend", "💪", 40, "weekly");
        addAchievementDefinition("perfect_week", "Perfect Week", "Complete at least 1 task every day of the week", "✨", 70, "weekly");

        // Monthly achievements
        addAchievementDefinition("project_leader", "Project Leader", "Complete all tasks in a month", "👑", 100, "monthly");
        addAchievementDefinition("time_master", "Time Master", "Complete 50 tasks", "⌛", 150, "monthly");
        addAchievementDefinition("consistency", "Consistency King", "Complete tasks for 30 days in a row", "📈", 200, "monthly");

        // Special achievements
        addAchievementDefinition("early_planner", "Early Planner", "Plan tasks a week in advance", "📅", 40, "special");
        addAchievementDefinition("speed_runner", "Speed Runner", "Complete 3 tasks within an hour", "⚡", 30, "special");
        addAchievementDefinition("multitasker", "Multitasker", "Complete tasks in 5 different categories", "🎭", 50, "special");
        addAchievementDefinition("organization_master", "Organization Master", "Categorize 20 tasks", "📊", 40, "special");
        addAchievementDefinition("priority_expert", "Priority Expert", "Complete 10 high-priority tasks", "🔥", 60, "special");
    }

    private void addAchievementDefinition(String id, String title, String description, String icon, int points, String category) {
        Map<String, Object> achievement = new HashMap<>();
        achievement.put("title", title);
        achievement.put("description", description);
        achievement.put("icon", icon);
        achievement.put("points", points);
        achievement.put("category", category);

        achievementDefinitions.put(id, achievement);
    }

    public List<Achievement> getAllAchievementsForUser(User user) {
        return achievementRepository.findByUser(user);
    }

    public Optional<Achievement> getAchievementById(Long id) {
        return achievementRepository.findById(id);
    }

    public List<Achievement> getAchievementsByCategory(User user, String category) {
        return achievementRepository.findByUserAndCategory(user, category);
    }

    public boolean hasAchievement(User user, String achievementId) {
        return achievementRepository.existsByUserAndAchievementId(user, achievementId);
    }

    @Transactional
    public Achievement unlockAchievement(User user, String achievementId) {
        // Check if user already has this achievement
        if (hasAchievement(user, achievementId)) {
            logger.info("User " + user.getId() + " already has achievement: " + achievementId);
            return null;
        }

        // Get achievement definition
        Map<String, Object> definition = achievementDefinitions.get(achievementId);
        if (definition == null) {
            logger.warning("Achievement definition not found: " + achievementId);
            throw new IllegalArgumentException("Achievement not found: " + achievementId);
        }

        logger.info("Unlocking achievement " + achievementId + " for user " + user.getId());

        // Create and save new achievement
        Achievement achievement = new Achievement(
                achievementId,
                (String) definition.get("title"),
                (String) definition.get("description"),
                (String) definition.get("icon"),
                (Integer) definition.get("points"),
                (String) definition.get("category"),
                user
        );

        return achievementRepository.save(achievement);
    }

    @Transactional
    public void checkAndGrantAchievements(User user, Task completedTask) {
        // This method is called after a task is completed
        logger.info("Checking achievements for user " + user.getId() + " after completing task " + completedTask.getId());

        try {
            // Check for first task achievement
            checkFirstTaskAchievement(user);

            // Check for time-based achievements
            checkTimeBasedAchievements(user, completedTask);

            // Check for quantity-based achievements
            checkQuantityBasedAchievements(user);

            // Check for category-based achievements
            checkCategoryBasedAchievements(user);

            // Check for priority-based achievements
            checkPriorityBasedAchievements(user);

            // Check for planning achievements
            checkPlanningAchievements(user);

            // Check for speed achievements
            checkSpeedAchievements(user, completedTask);

        } catch (Exception e) {
            logger.severe("Error while checking achievements: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void checkFirstTaskAchievement(User user) {
        long completedTasksCount = taskRepository.countByUserAndCompletedTrue(user);
        logger.info("User " + user.getId() + " has completed " + completedTasksCount + " tasks");

        if (completedTasksCount == 1) {
            unlockAchievement(user, "beginner");
        }

        // Time Master (50 tasks)
        if (completedTasksCount >= 50) {
            unlockAchievement(user, "time_master");
        }
    }

    private void checkTimeBasedAchievements(User user, Task completedTask) {
        LocalDateTime completionTime = completedTask.getCompletedAt();
        if (completionTime == null) {
            return;
        }

        // Early Bird achievement (before 6 AM)
        if (completionTime.getHour() < 6) {
            unlockAchievement(user, "early_bird");
        }

        // Night Owl achievement (after midnight and before 4 AM)
        if (completionTime.getHour() >= 0 && completionTime.getHour() < 4) {
            unlockAchievement(user, "night_owl");
        }

        // Check for daily achievements
        LocalDateTime startOfDay = completionTime.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = completionTime.toLocalDate().atTime(23, 59, 59);

        List<Task> tasksCompletedToday = taskRepository.findByUserAndCompletedTrueAndCompletedAtBetween(
                user, startOfDay, endOfDay
        );

        // Productive Day achievement (5 tasks in one day)
        if (tasksCompletedToday.size() >= 5) {
            unlockAchievement(user, "productive_day");
        }

        // Super Productive Day achievement (10 tasks in one day)
        if (tasksCompletedToday.size() >= 10) {
            unlockAchievement(user, "super_productive_day");
        }

        // Check for weekly achievements
        LocalDate today = completionTime.toLocalDate();
        LocalDate startOfWeek = today.minusDays(today.getDayOfWeek().getValue() - 1);
        LocalDate endOfWeek = startOfWeek.plusDays(6);

        LocalDateTime weekStart = startOfWeek.atStartOfDay();
        LocalDateTime weekEnd = endOfWeek.atTime(23, 59, 59);

        List<Task> tasksCompletedThisWeek = taskRepository.findByUserAndCompletedTrueAndCompletedAtBetween(
                user, weekStart, weekEnd
        );

        // Goal Oriented achievement (10 tasks in a week)
        if (tasksCompletedThisWeek.size() >= 10) {
            unlockAchievement(user, "goal_oriented");
        }

        // Weekend Warrior achievement (5 tasks during weekend)
        int weekendTaskCount = 0;
        for (Task task : tasksCompletedThisWeek) {
            int dayOfWeek = task.getCompletedAt().getDayOfWeek().getValue();
            if (dayOfWeek == 6 || dayOfWeek == 7) { // Saturday or Sunday
                weekendTaskCount++;
            }
        }

        if (weekendTaskCount >= 5) {
            unlockAchievement(user, "weekend_warrior");
        }

        // Perfect Week achievement (at least 1 task every day of the week)
        boolean[] daysWithTasks = new boolean[7]; // Sunday to Saturday

        for (Task task : tasksCompletedThisWeek) {
            int dayOfWeek = task.getCompletedAt().getDayOfWeek().getValue() % 7; // Convert to 0-6 (Sunday=0)
            daysWithTasks[dayOfWeek] = true;
        }

        boolean hasTaskEveryDay = true;
        for (boolean hasTask : daysWithTasks) {
            if (!hasTask) {
                hasTaskEveryDay = false;
                break;
            }
        }

        if (hasTaskEveryDay) {
            unlockAchievement(user, "perfect_week");
        }
    }

    private void checkQuantityBasedAchievements(User user) {
        // Get all tasks for this user
        List<Task> allTasks = taskRepository.findByUser(user);

        // Get completed tasks
        List<Task> completedTasks = taskRepository.findByUserAndCompletedTrue(user);

        // Project Leader achievement (complete all tasks in a month)
        if (!allTasks.isEmpty() && allTasks.size() == completedTasks.size()) {
            // All tasks are completed
            unlockAchievement(user, "project_leader");
        }
    }

    private void checkCategoryBasedAchievements(User user) {
        // Get all tasks for the user
        List<Task> allTasks = taskRepository.findByUser(user);

        // Multitasker achievement (tasks in 5 different categories)
        Map<String, Boolean> categories = new HashMap<>();
        for (Task task : allTasks) {
            if (task.getCategory() != null && !task.getCategory().trim().isEmpty()) {
                categories.put(task.getCategory(), true);
            }
        }

        if (categories.size() >= 5) {
            unlockAchievement(user, "multitasker");
        }

        // Organization Master achievement (categorize 20 tasks)
        long categorizedTasks = allTasks.stream()
                .filter(t -> t.getCategory() != null && !t.getCategory().trim().isEmpty())
                .count();

        if (categorizedTasks >= 20) {
            unlockAchievement(user, "organization_master");
        }
    }

    private void checkPriorityBasedAchievements(User user) {
        // Count high priority completed tasks
        List<Task> highPriorityTasks = taskRepository.findByUserAndPriorityAndCompletedTrue(user, "high");

        // Priority Expert achievement (10 high-priority tasks)
        if (highPriorityTasks.size() >= 10) {
            unlockAchievement(user, "priority_expert");
        }
    }

    void checkPlanningAchievements(User user) {
        // Get current date
        LocalDate today = LocalDate.now();
        LocalDate nextWeek = today.plusDays(7);

        // Count tasks planned for next week or later
        List<Task> allTasks = taskRepository.findByUser(user);
        int futureTasks = 0;

        for (Task task : allTasks) {
            if (task.getYear() != null && task.getMonth() != null && task.getDay() != null) {
                LocalDate taskDate = LocalDate.of(task.getYear(), task.getMonth() + 1, task.getDay());
                if (taskDate.isAfter(nextWeek)) {
                    futureTasks++;
                }
            }
        }

        // Early Planner achievement (plan tasks a week in advance)
        if (futureTasks >= 3) {
            unlockAchievement(user, "early_planner");
        }
    }

    private void checkSpeedAchievements(User user, Task completedTask) {
        LocalDateTime completionTime = completedTask.getCompletedAt();
        if (completionTime == null) {
            return;
        }

        // Check for tasks completed within an hour of this one
        LocalDateTime hourAgo = completionTime.minusHours(1);

        List<Task> tasksCompletedWithinHour = taskRepository.findByUserAndCompletedTrueAndCompletedAtBetween(
                user, hourAgo, completionTime
        );

        // Speed Runner achievement (3 tasks within an hour)
        if (tasksCompletedWithinHour.size() >= 3) {
            unlockAchievement(user, "speed_runner");
        }
    }

    public List<Achievement> getLatestAchievements(User user) {
        return achievementRepository.findTop5ByUserOrderByUnlockedAtDesc(user);
    }

    public Map<String, Long> getAchievementCountsByCategory(User user) {
        List<Object[]> results = achievementRepository.countAchievementsByCategory(user);
        Map<String, Long> categoryCounts = new HashMap<>();

        for (Object[] result : results) {
            String category = (String) result[0];
            Long count = ((Number) result[1]).longValue();
            categoryCounts.put(category, count);
        }

        return categoryCounts;
    }

    public Integer getTotalPoints(User user) {
        return achievementRepository.getTotalPoints(user);
    }

    public Map<String, Object> getAchievementStats(User user) {
        Map<String, Object> stats = new HashMap<>();

        // Get total achievements count
        int totalAchievements = achievementDefinitions.size();
        int unlockedCount = getAllAchievementsForUser(user).size();
        int progressPercentage = (int) Math.round((double) unlockedCount / totalAchievements * 100);

        // Get total points
        Integer totalPoints = getTotalPoints(user);
        if (totalPoints == null) {
            totalPoints = 0;
        }

        // Create stats map
        stats.put("totalAchievements", totalAchievements);
        stats.put("unlockedCount", unlockedCount);
        stats.put("progressPercentage", progressPercentage);
        stats.put("totalPoints", totalPoints);

        return stats;
    }
}