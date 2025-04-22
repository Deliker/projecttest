package com.example.demo.repository;

import com.example.demo.model.Task;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    // Find all tasks for a specific user
    List<Task> findByUser(User user);
    
    // Find all tasks for a specific user and date
    List<Task> findByUserAndYearAndMonthAndDay(User user, Integer year, Integer month, Integer day);
    
    // Find all completed tasks for a user
    List<Task> findByUserAndCompletedTrue(User user);
    
    // Find all incomplete tasks for a user
    List<Task> findByUserAndCompletedFalse(User user);
    
    // Find tasks by category for a user
    List<Task> findByUserAndCategory(User user, String category);
    
    // Find tasks by priority for a user
    List<Task> findByUserAndPriority(User user, String priority);
    
    // Find tasks completed in a date range
    List<Task> findByUserAndCompletedTrueAndCompletedAtBetween(User user, LocalDateTime start, LocalDateTime end);
    
    // Count tasks completed by a user
    long countByUserAndCompletedTrue(User user);
    
    // Custom query to find tasks for a specific user and month
    @Query("SELECT t FROM Task t WHERE t.user = ?1 AND t.year = ?2 AND t.month = ?3")
    List<Task> findByUserAndYearAndMonth(User user, Integer year, Integer month);
    
    // Custom query to count tasks by category
    @Query("SELECT t.category, COUNT(t) FROM Task t WHERE t.user = ?1 GROUP BY t.category")
    List<Object[]> countTasksByCategory(User user);
    
    // Custom query to find tasks for a week (starting from a specific date)
    @Query("SELECT t FROM Task t WHERE t.user = ?1 AND " +
           "((t.year = ?2 AND t.month = ?3 AND t.day >= ?4) OR " +
           "(t.year = ?5 AND t.month = ?6 AND t.day <= ?7))")
    List<Task> findTasksForWeek(User user, 
                              Integer startYear, Integer startMonth, Integer startDay,
                              Integer endYear, Integer endMonth, Integer endDay);
}