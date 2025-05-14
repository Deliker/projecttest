package com.example.demo.controller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.model.User;
import com.example.demo.service.FileUploadService;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
public class ProfileController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final FileUploadService fileUploadService;

    @Autowired
    public ProfileController(UserService userService, PasswordEncoder passwordEncoder, FileUploadService fileUploadService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.fileUploadService = fileUploadService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long userId) {
        Optional<User> userOpt = userService.getUserById(userId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Update last active timestamp
            user.setLastActive(LocalDateTime.now());
            userService.updateUser(user);

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            response.put("bio", user.getBio());
            response.put("avatarUrl", user.getAvatarUrl());
            response.put("theme", user.getTheme());
            response.put("location", user.getLocation());
            response.put("jobTitle", user.getJobTitle());
            response.put("lastActive", user.getLastActive());
            response.put("role", user.getRole().name());

            // Add statistics
            response.put("totalTasks", userService.countUserTasks(userId));
            response.put("completedTasks", userService.countCompletedTasks(userId));
            response.put("achievements", userService.countUserAchievements(userId));
            response.put("achievementPoints", userService.calculateTotalAchievementPoints(userId));

            return ResponseEntity.ok(response);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateProfile(@PathVariable Long userId, @RequestBody Map<String, Object> profileData) {
        Optional<User> userOpt = userService.getUserById(userId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Update basic profile fields
            if (profileData.containsKey("name")) {
                user.setName((String) profileData.get("name"));
            }

            if (profileData.containsKey("bio")) {
                user.setBio((String) profileData.get("bio"));
            }

            if (profileData.containsKey("theme")) {
                user.setTheme((String) profileData.get("theme"));
            }

            if (profileData.containsKey("location")) {
                user.setLocation((String) profileData.get("location"));
            }

            if (profileData.containsKey("jobTitle")) {
                user.setJobTitle((String) profileData.get("jobTitle"));
            }

            userService.updateUser(user);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile updated successfully");
            response.put("user", user);

            return ResponseEntity.ok(response);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PostMapping("/{userId}/avatar")
    public ResponseEntity<?> uploadAvatar(@PathVariable Long userId, @RequestParam("file") MultipartFile file) {
        Optional<User> userOpt = userService.getUserById(userId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            try {
                String avatarUrl = fileUploadService.uploadFile(file, "avatars");
                user.setAvatarUrl(avatarUrl);
                userService.updateUser(user);

                Map<String, Object> response = new HashMap<>();
                response.put("message", "Avatar uploaded successfully");
                response.put("avatarUrl", avatarUrl);

                return ResponseEntity.ok(response);
            } catch (IOException e) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Failed to upload avatar: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PostMapping("/{userId}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long userId, @RequestBody Map<String, String> passwordData) {
        Optional<User> userOpt = userService.getUserById(userId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");

            if (currentPassword == null || newPassword == null) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Current password and new password are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Verify current password
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Current password is incorrect");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Update password
            user.setPassword(passwordEncoder.encode(newPassword));
            userService.updateUser(user);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Password changed successfully");
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}