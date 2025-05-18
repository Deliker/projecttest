package com.example.demo.dto;

/**
 * Data Transfer Object for CustomCategory to avoid Jackson serialization issues
 */
public class CategoryDTO {

    private Long id;
    private String name;
    private String color;
    private Long userId;

    // Default constructor
    public CategoryDTO() {
    }

    // Constructor with fields
    public CategoryDTO(Long id, String name, String color, Long userId) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.userId = userId;
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

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    @Override
    public String toString() {
        return "CategoryDTO{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", color='" + color + '\'' +
                ", userId=" + userId +
                '}';
    }
}