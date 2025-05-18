package com.example.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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

import com.example.demo.model.CustomCategory;
import com.example.demo.model.User;
import com.example.demo.service.CustomCategoryService;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
public class CustomCategoryController {

    private final CustomCategoryService customCategoryService;
    private final UserService userService;

    @Autowired
    public CustomCategoryController(CustomCategoryService customCategoryService, UserService userService) {
        this.customCategoryService = customCategoryService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getAllCategoriesForUser(@RequestParam Long userId) {
        Optional<User> userOpt = userService.getUserById(userId);

        if (userOpt.isPresent()) {
            List<CustomCategory> categories = customCategoryService.getAllCategoriesForUser(userOpt.get());
            return ResponseEntity.ok(categories);
        } else {
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
            return ResponseEntity.ok(categoryOpt.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Category not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody CustomCategory category, @RequestParam Long userId) {
        Optional<User> userOpt = userService.getUserById(userId);

        if (!userOpt.isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        try {
            CustomCategory createdCategory = customCategoryService.createCategory(category, userOpt.get());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
        } catch (IllegalArgumentException e) {
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

        Optional<User> userOpt = userService.getUserById(userId);

        if (!userOpt.isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        try {
            CustomCategory updatedCategory = customCategoryService.updateCategory(id, categoryDetails, userOpt.get());
            return ResponseEntity.ok(updatedCategory);
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id, @RequestParam Long userId) {
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
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}