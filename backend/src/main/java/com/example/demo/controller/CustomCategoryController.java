package com.example.demo.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.CategoryDTO;
import com.example.demo.model.CustomCategory;
import com.example.demo.model.User;
import com.example.demo.service.CustomCategoryService;
import com.example.demo.service.UserService;

import java.util.logging.Logger;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
public class CustomCategoryController {

    private static final Logger LOGGER = Logger.getLogger(CustomCategoryController.class.getName());

    private final CustomCategoryService customCategoryService;
    private final UserService userService;

    @Autowired
    public CustomCategoryController(CustomCategoryService customCategoryService, UserService userService) {
        this.customCategoryService = customCategoryService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getAllCategoriesForUser(@RequestParam Long userId) {
        LOGGER.info("Getting all categories for user ID: " + userId);

        Optional<User> userOpt = userService.getUserById(userId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            LOGGER.info("User found: " + user.getId());

            List<CustomCategory> categories = customCategoryService.getAllCategoriesForUser(user);
            LOGGER.info("Retrieved " + categories.size() + " categories");

            // Convert to DTO to avoid serialization issues
            List<CategoryDTO> categoryDTOs = categories.stream()
                    .map(category -> new CategoryDTO(
                            category.getId(),
                            category.getName(),
                            category.getColor(),
                            category.getUser().getId()))
                    .collect(Collectors.toList());

            // Debug log all categories
            for (CategoryDTO dto : categoryDTOs) {
                LOGGER.info("Category DTO in controller: " + dto.toString());
            }

            return ResponseEntity.ok(categoryDTOs);
        } else {
            LOGGER.warning("User not found with ID: " + userId);
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id, @RequestParam Long userId) {
        Optional<User> userOpt = userService.getUserById(userId);

        if (!userOpt.isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        Optional<CustomCategory> categoryOpt = customCategoryService.getCategoryById(id, userOpt.get());

        if (categoryOpt.isPresent()) {
            CustomCategory category = categoryOpt.get();
            CategoryDTO dto = new CategoryDTO(
                    category.getId(),
                    category.getName(),
                    category.getColor(),
                    category.getUser().getId()
            );
            return ResponseEntity.ok(dto);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Category not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody CustomCategory category, @RequestParam Long userId) {
        LOGGER.info("Creating category for user ID: " + userId + " with name: " + category.getName());

        Optional<User> userOpt = userService.getUserById(userId);

        if (!userOpt.isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        try {
            CustomCategory createdCategory = customCategoryService.createCategory(category, userOpt.get());
            LOGGER.info("Category created successfully with ID: " + createdCategory.getId());

            CategoryDTO dto = new CategoryDTO(
                    createdCategory.getId(),
                    createdCategory.getName(),
                    createdCategory.getColor(),
                    createdCategory.getUser().getId()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (IllegalArgumentException e) {
            LOGGER.warning("Failed to create category: " + e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(
            @PathVariable Long id,
            @RequestBody CustomCategory categoryDetails,
            @RequestParam Long userId) {

        LOGGER.info("Updating category ID: " + id + " for user ID: " + userId);

        Optional<User> userOpt = userService.getUserById(userId);

        if (!userOpt.isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        try {
            CustomCategory updatedCategory = customCategoryService.updateCategory(id, categoryDetails, userOpt.get());
            LOGGER.info("Category updated successfully");

            CategoryDTO dto = new CategoryDTO(
                    updatedCategory.getId(),
                    updatedCategory.getName(),
                    updatedCategory.getColor(),
                    updatedCategory.getUser().getId()
            );

            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            LOGGER.warning("Failed to update category: " + e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id, @RequestParam Long userId) {
        LOGGER.info("Deleting category ID: " + id + " for user ID: " + userId);

        Optional<User> userOpt = userService.getUserById(userId);

        if (!userOpt.isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        try {
            customCategoryService.deleteCategory(id, userOpt.get());

            Map<String, String> response = new HashMap<>();
            response.put("message", "Category deleted successfully");
            LOGGER.info("Category deleted successfully");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            LOGGER.warning("Failed to delete category: " + e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}