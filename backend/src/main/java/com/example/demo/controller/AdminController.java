package com.example.demo.controller;

import com.example.demo.dto.UserDTO;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.service.TaskService;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
public class AdminController {
    private final UserService userService;
    private final TaskService taskService;

    @Autowired
    public AdminController(UserService userService, TaskService taskService) {
        this.userService = userService;
        this.taskService = taskService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();

            // Convert to DTOs to avoid serialization issues
            List<UserDTO> userDTOs = users.stream()
                    .map(user -> {
                        UserDTO dto = new UserDTO(
                                user.getId(),
                                user.getName(),
                                user.getEmail(),
                                user.getRole(),
                                user.getBio(),
                                user.getAvatarUrl(),
                                user.getTheme(),
                                user.getLastActive(),
                                user.getLocation(),
                                user.getJobTitle()
                        );

                        // Add statistics
                        Long userId = user.getId();
                        dto.setTotalTasks(userService.countUserTasks(userId));
                        dto.setCompletedTasks(userService.countCompletedTasks(userId));
                        dto.setAchievements(userService.countUserAchievements(userId));
                        dto.setAchievementPoints(userService.calculateTotalAchievementPoints(userId));

                        return dto;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(userDTOs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> userOpt = userService.getUserById(id);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            UserDTO dto = new UserDTO(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole(),
                    user.getBio(),
                    user.getAvatarUrl(),
                    user.getTheme(),
                    user.getLastActive(),
                    user.getLocation(),
                    user.getJobTitle()
            );

            // Add statistics
            dto.setTotalTasks(userService.countUserTasks(id));
            dto.setCompletedTasks(userService.countCompletedTasks(id));
            dto.setAchievements(userService.countUserAchievements(id));
            dto.setAchievementPoints(userService.calculateTotalAchievementPoints(id));

            return ResponseEntity.ok(dto);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> roleData) {
        try {
            String roleName = roleData.get("role");
            if (roleName == null) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Role is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            Optional<User> userOpt = userService.getUserById(id);
            if (!userOpt.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            User user = userOpt.get();
            try {
                Role role = Role.valueOf(roleName);
                user.setRole(role);
                userService.updateUser(user);

                Map<String, String> response = new HashMap<>();
                response.put("message", "User role updated successfully");
                return ResponseEntity.ok(response);
            } catch (IllegalArgumentException e) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Invalid role: " + roleName);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to update user role: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            Optional<User> userOpt = userService.getUserById(id);
            if (!userOpt.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            userService.deleteUser(id);

            Map<String, String> response = new HashMap<>();
            response.put("message", "User deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to delete user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats() {
        try {
            List<User> users = userService.getAllUsers();
            int totalUsers = users.size();

            // Count total tasks
            long totalTasks = 0;
            long completedTasks = 0;
            long totalAchievements = 0;

            for (User user : users) {
                Long userId = user.getId();
                totalTasks += userService.countUserTasks(userId);
                completedTasks += userService.countCompletedTasks(userId);
                totalAchievements += userService.countUserAchievements(userId);
            }

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("totalTasks", totalTasks);
            stats.put("completedTasks", completedTasks);
            stats.put("totalAchievements", totalAchievements);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to get admin stats: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateAdminSettings(@RequestBody Map<String, Object> settings) {
        // This is a placeholder for actual settings implementation
        // In a real app, you would store these settings in a database
        Map<String, String> response = new HashMap<>();
        response.put("message", "Settings updated successfully");
        return ResponseEntity.ok(response);
    }
}