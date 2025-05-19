package com.example.demo.dto;

import com.example.demo.model.Role;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for User to avoid Jackson serialization issues
 */
public class UserDTO {

    private Long id;
    private String name;
    private String email;
    private Role role;
    private String bio;
    private String avatarUrl;
    private String theme;
    private LocalDateTime lastActive;
    private String location;
    private String jobTitle;

    // Statistics fields
    private Long totalTasks;
    private Long completedTasks;
    private Long achievements;
    private Integer achievementPoints;

    // Default constructor
    public UserDTO() {
    }

    // Constructor with basic fields
    public UserDTO(Long id, String name, String email, Role role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    // Full constructor
    public UserDTO(Long id, String name, String email, Role role, String bio,
                   String avatarUrl, String theme, LocalDateTime lastActive,
                   String location, String jobTitle) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
        this.theme = theme;
        this.lastActive = lastActive;
        this.location = location;
        this.jobTitle = jobTitle;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public LocalDateTime getLastActive() {
        return lastActive;
    }

    public void setLastActive(LocalDateTime lastActive) {
        this.lastActive = lastActive;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public Long getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(Long totalTasks) {
        this.totalTasks = totalTasks;
    }

    public Long getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(Long completedTasks) {
        this.completedTasks = completedTasks;
    }

    public Long getAchievements() {
        return achievements;
    }

    public void setAchievements(Long achievements) {
        this.achievements = achievements;
    }

    public Integer getAchievementPoints() {
        return achievementPoints;
    }

    public void setAchievementPoints(Integer achievementPoints) {
        this.achievementPoints = achievementPoints;
    }
}