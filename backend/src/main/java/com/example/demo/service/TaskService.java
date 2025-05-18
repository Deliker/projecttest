package com.example.demo.service;

import com.example.demo.model.Task;
import com.example.demo.model.User;
import com.example.demo.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class TaskService {

    private static final Logger logger = Logger.getLogger(TaskService.class.getName());

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

        // Check for planning achievements (early_planner)
        try {
            if (achievementService != null) {
                logger.info("Checking for planning achievements after creating task: " + savedTask.getId());
                achievementService.checkPlanningAchievements(user);
            }
        } catch (Exception e) {
            logger.severe("Error checking planning achievements: " + e.getMessage());
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

    @Transactional
    public Task completeTask(Long id, User user) {
        Optional<Task> taskOpt = taskRepository.findById(id);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();

            // Only proceed if task is not already completed
            if (!Boolean.TRUE.equals(task.getCompleted())) {
                logger.info("Completing task " + id + " for user " + user.getId());

                task.setCompleted(true);
                task.setCompletedAt(LocalDateTime.now());

                Task savedTask = taskRepository.save(task);

                // Check achievements after completing the task
                try {
                    if (achievementService != null) {
                        logger.info("Checking achievements after completing task: " + savedTask.getId());
                        achievementService.checkAndGrantAchievements(user, savedTask);
                    }
                } catch (Exception e) {
                    logger.severe("Error checking achievements: " + e.getMessage());
                }

                return savedTask;
            }
            return task;
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
}