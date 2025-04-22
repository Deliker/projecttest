package com.example.demo.repository;

import com.example.demo.model.Achievement;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    
    // Find all achievements for a specific user
    List<Achievement> findByUser(User user);
    
    // Find all achievements for a user by category
    List<Achievement> findByUserAndCategory(User user, String category);
    
    // Find a specific achievement by ID for a user
    Optional<Achievement> findByUserAndAchievementId(User user, String achievementId);
    
    // Check if user has a specific achievement
    boolean existsByUserAndAchievementId(User user, String achievementId);
    
    // Count achievements by category for a user
    @Query("SELECT a.category, COUNT(a) FROM Achievement a WHERE a.user = ?1 GROUP BY a.category")
    List<Object[]> countAchievementsByCategory(User user);
    
    // Get total achievement points for a user
    @Query("SELECT SUM(a.points) FROM Achievement a WHERE a.user = ?1")
    Integer getTotalPoints(User user);
    
    // Get latest achievements
    List<Achievement> findTop5ByUserOrderByUnlockedAtDesc(User user);
    
    // Get achievements in order of points (highest first)
    List<Achievement> findByUserOrderByPointsDesc(User user);
}