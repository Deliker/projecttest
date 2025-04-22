package com.example.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Achievement;
import com.example.demo.model.User;
import com.example.demo.service.AchievementService;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/api/achievements")
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
public class AchievementController {

    private final AchievementService achievementService;
    private final UserService userService;

    @Autowired
    public AchievementController(AchievementService achievementService, UserService userService) {
        this.achievementService = achievementService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getAllAchievementsForUser(@RequestParam Long userId) {
        Optional<User> userOpt = userService.getUserById(userId);
        
        if (userOpt.isPresent()) {
            List<Achievement> achievements = achievementService.getAllAchievementsForUser(userOpt.get());
            return ResponseEntity.ok(achievements);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAchievementById(@PathVariable Long id) {
        Optional<Achievement> achievementOpt = achievementService.getAchievementById(id);
        
        if (achievementOpt.isPresent()) {
            return ResponseEntity.ok(achievementOpt.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Achievement not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<?> getAchievementsByCategory(
            @PathVariable String category,
            @RequestParam Long userId) {
        
        Optional<User> userOpt = userService.getUserById(userId);
        
        if (userOpt.isPresent()) {
            List<Achievement> achievements = achievementService.getAchievementsByCategory(userOpt.get(), category);
            return ResponseEntity.ok(achievements);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/check/{achievementId}")
    public ResponseEntity<?> checkAchievement(
            @PathVariable String achievementId,
            @RequestParam Long userId) {
        
        Optional<User> userOpt = userService.getUserById(userId);
        
        if (userOpt.isPresent()) {
            boolean hasAchievement = achievementService.hasAchievement(userOpt.get(), achievementId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("hasAchievement", hasAchievement);
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PostMapping("/unlock/{achievementId}")
    public ResponseEntity<?> unlockAchievement(
            @PathVariable String achievementId,
            @RequestParam Long userId) {
        
        Optional<User> userOpt = userService.getUserById(userId);
        
        if (!userOpt.isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
        try {
            Achievement achievement = achievementService.unlockAchievement(userOpt.get(), achievementId);
            
            if (achievement == null) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Achievement already unlocked");
                return ResponseEntity.ok(response);
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(achievement);
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestAchievements(@RequestParam Long userId) {
        Optional<User> userOpt = userService.getUserById(userId);
        
        if (userOpt.isPresent()) {
            List<Achievement> achievements = achievementService.getLatestAchievements(userOpt.get());
            return ResponseEntity.ok(achievements);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getAchievementStats(@RequestParam Long userId) {
        Optional<User> userOpt = userService.getUserById(userId);
        
        if (userOpt.isPresent()) {
            Map<String, Object> stats = achievementService.getAchievementStats(userOpt.get());
            return ResponseEntity.ok(stats);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/category-counts")
    public ResponseEntity<?> getAchievementCountsByCategory(@RequestParam Long userId) {
        Optional<User> userOpt = userService.getUserById(userId);
        
        if (userOpt.isPresent()) {
            Map<String, Long> categoryCounts = achievementService.getAchievementCountsByCategory(userOpt.get());
            return ResponseEntity.ok(categoryCounts);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/points")
    public ResponseEntity<?> getTotalPoints(@RequestParam Long userId) {
        Optional<User> userOpt = userService.getUserById(userId);
        
        if (userOpt.isPresent()) {
            Integer totalPoints = achievementService.getTotalPoints(userOpt.get());
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalPoints", totalPoints != null ? totalPoints : 0);
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}