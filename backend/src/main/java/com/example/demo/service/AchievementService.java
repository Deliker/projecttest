package com.example.demo.service;

import com.example.demo.model.Achievement;
import com.example.demo.model.User;
import com.example.demo.repository.AchievementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AchievementService {

    private final AchievementRepository achievementRepository;

    // Achievement definitions (in a real app, these might be stored in a database)
    private final Map<String, Map<String, Object>> achievementDefinitions = new HashMap<>();

    @Autowired
    public AchievementService(AchievementRepository achievementRepository) {
        this.achievementRepository = achievementRepository;
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

    public Achievement unlockAchievement(User user, String achievementId) {
        // Check if user already has this achievement
        if (hasAchievement(user, achievementId)) {
            return null;
        }
        
        // Get achievement definition
        Map<String, Object> definition = achievementDefinitions.get(achievementId);
        if (definition == null) {
            throw new IllegalArgumentException("Achievement not found: " + achievementId);
        }
        
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

    public void checkAchievement(User user, String achievementId) {
        if (!hasAchievement(user, achievementId)) {
            unlockAchievement(user, achievementId);
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