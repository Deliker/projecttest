package com.example.demo.service;

import com.example.demo.model.Task;
import com.example.demo.model.User;
import com.example.demo.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final AchievementService achievementService;

    @Autowired
    public TaskService(TaskRepository taskRepository, AchievementService achievementService) {
        this.taskRepository = taskRepository;
        this.achievementService = achievementService;
    }

    public List<Task> getAllTasksForUser(User user) {
        return taskRepository.findByUser(user);
    }

    public List<Task> getTasksForUserOnDate(User user, Integer year, Integer month, Integer day) {
        return taskRepository.findByUserAndYearAndMonthAndDay(user, year, month, day);
    }

    public List<Task> getTasksForUserInMonth(User user, Integer year, Integer month) {
        return taskRepository.findByUserAndYearAndMonth(user, year, month);
    }

    public Task createTask(Task task, User user) {
        task.setUser(user);
        Task savedTask = taskRepository.save(task);
        
        // Check for "early_planner" achievement
        LocalDateTime taskDate = LocalDateTime.of(task.getYear(), task.getMonth() + 1, task.getDay(), 0, 0);
        LocalDateTime now = LocalDateTime.now();
        if (taskDate.isAfter(now.plusDays(7))) {
            achievementService.checkAchievement(user, "early_planner");
        }
        
        return savedTask;
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    public Task updateTask(Task task) {
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    public Task completeTask(Long id, User user) {
        Optional<Task> taskOpt = taskRepository.findById(id);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            task.setCompleted(true);
            task.setCompletedAt(LocalDateTime.now());
            
            Task savedTask = taskRepository.save(task);
            
            // Trigger achievement check after completing a task
            checkAchievementsAfterTaskCompletion(user, task);
            
            return savedTask;
        }
        return null;
    }

    public List<Task> getCompletedTasksForUser(User user) {
        return taskRepository.findByUserAndCompletedTrue(user);
    }

    public List<Task> getIncompleteTasksForUser(User user) {
        return taskRepository.findByUserAndCompletedFalse(user);
    }

    public List<Task> getTasksByCategory(User user, String category) {
        return taskRepository.findByUserAndCategory(user, category);
    }

    public List<Task> getTasksByPriority(User user, String priority) {
        return taskRepository.findByUserAndPriority(user, priority);
    }

    public long getCompletedTaskCount(User user) {
        return taskRepository.countByUserAndCompletedTrue(user);
    }

    public Map<String, Long> getTaskCountsByCategory(User user) {
        List<Object[]> results = taskRepository.countTasksByCategory(user);
        Map<String, Long> categoryCounts = new HashMap<>();
        
        for (Object[] result : results) {
            String category = (String) result[0];
            Long count = ((Number) result[1]).longValue();
            categoryCounts.put(category, count);
        }
        
        return categoryCounts;
    }

    public List<Task> getTasksForWeek(User user, LocalDateTime startDate) {
        LocalDateTime endDate = startDate.plusDays(6);
        
        return taskRepository.findTasksForWeek(
            user,
            startDate.getYear(), startDate.getMonthValue() - 1, startDate.getDayOfMonth(),
            endDate.getYear(), endDate.getMonthValue() - 1, endDate.getDayOfMonth()
        );
    }

    private void checkAchievementsAfterTaskCompletion(User user, Task task) {
        // Get total completed tasks count
        long completedTasksCount = taskRepository.countByUserAndCompletedTrue(user);
        
        // Check for first task achievement
        if (completedTasksCount == 1) {
            achievementService.checkAchievement(user, "beginner");
        }
        
        // Check for time master achievement (50 tasks)
        if (completedTasksCount >= 50) {
            achievementService.checkAchievement(user, "time_master");
        }
        
        // Check tasks completed today
        LocalDateTime today = LocalDateTime.now();
        LocalDateTime startOfDay = today.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = today.toLocalDate().atTime(23, 59, 59);
        
        List<Task> tasksCompletedToday = taskRepository.findByUserAndCompletedTrueAndCompletedAtBetween(
            user, startOfDay, endOfDay
        );
        
        // Check for productive day achievement (5 tasks in one day)
        if (tasksCompletedToday.size() >= 5) {
            achievementService.checkAchievement(user, "productive_day");
        }
        
        // Check for super productive day achievement (10 tasks in one day)
        if (tasksCompletedToday.size() >= 10) {
            achievementService.checkAchievement(user, "super_productive_day");
        }
        
        // Check for early bird achievement (task completed before 6 AM)
        LocalDateTime completionTime = task.getCompletedAt();
        if (completionTime.getHour() < 6) {
            achievementService.checkAchievement(user, "early_bird");
        }
        
        // Check for night owl achievement (task completed after midnight)
        if (completionTime.getHour() >= 0 && completionTime.getHour() < 4) {
            achievementService.checkAchievement(user, "night_owl");
        }
        
        // Check for priority expert achievement (10 high priority tasks)
        if ("high".equals(task.getPriority())) {
            long highPriorityTasksCompleted = taskRepository.findByUserAndCompletedTrue(user).stream()
                .filter(t -> "high".equals(t.getPriority()))
                .count();
                
            if (highPriorityTasksCompleted >= 10) {
                achievementService.checkAchievement(user, "priority_expert");
            }
        }
        
        // Check for multitasker achievement (tasks in 5 different categories)
        Map<String, Long> categoryCounts = getTaskCountsByCategory(user);
        if (categoryCounts.size() >= 5) {
            achievementService.checkAchievement(user, "multitasker");
        }
        
        // Weekly achievements will be checked elsewhere as they require more context
    }
}