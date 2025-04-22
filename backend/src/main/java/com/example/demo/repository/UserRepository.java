package com.example.demo.repository;

import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Find user by email
    Optional<User> findByEmail(String email);
    
    // Check if email exists
    boolean existsByEmail(String email);
    
    // Find user by name (case insensitive)
    @Query("SELECT u FROM User u WHERE LOWER(u.name) = LOWER(?1)")
    Optional<User> findByNameIgnoreCase(String name);
    
    // Find user by email and password (for login)
    Optional<User> findByEmailAndPassword(String email, String password);
    
    // Count number of tasks for a user
    @Query("SELECT COUNT(t) FROM User u JOIN u.tasks t WHERE u.id = ?1")
    long countUserTasks(Long userId);
    
    // Count number of completed tasks for a user
    @Query("SELECT COUNT(t) FROM User u JOIN u.tasks t WHERE u.id = ?1 AND t.completed = true")
    long countCompletedTasks(Long userId);
    
    // Count number of achievements for a user
    @Query("SELECT COUNT(a) FROM User u JOIN u.achievements a WHERE u.id = ?1")
    long countUserAchievements(Long userId);
    
    // Calculate total achievement points for a user
    @Query("SELECT SUM(a.points) FROM User u JOIN u.achievements a WHERE u.id = ?1")
    Integer calculateTotalAchievementPoints(Long userId);
}