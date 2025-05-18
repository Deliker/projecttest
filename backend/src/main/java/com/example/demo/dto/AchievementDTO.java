package com.example.demo.dto;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Achievement to avoid Jackson serialization issues
 */
public class AchievementDTO {

    private Long id;
    private String achievementId;
    private String title;
    private String description;
    private String icon;
    private Integer points;
    private String category;
    private LocalDateTime unlockedAt;
    private Long userId;

    // Default constructor
    public AchievementDTO() {
    }

    // Constructor with fields
    public AchievementDTO(Long id, String achievementId, String title, String description,
                          String icon, Integer points, String category,
                          LocalDateTime unlockedAt, Long userId) {
        this.id = id;
        this.achievementId = achievementId;
        this.title = title;
        this.description = description;
        this.icon = icon;
        this.points = points;
        this.category = category;
        this.unlockedAt = unlockedAt;
        this.userId = userId;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAchievementId() {
        return achievementId;
    }

    public void setAchievementId(String achievementId) {
        this.achievementId = achievementId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDateTime getUnlockedAt() {
        return unlockedAt;
    }

    public void setUnlockedAt(LocalDateTime unlockedAt) {
        this.unlockedAt = unlockedAt;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    @Override
    public String toString() {
        return "AchievementDTO{" +
                "id=" + id +
                ", achievementId='" + achievementId + '\'' +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", icon='" + icon + '\'' +
                ", points=" + points +
                ", category='" + category + '\'' +
                ", unlockedAt=" + unlockedAt +
                ", userId=" + userId +
                '}';
    }
}