package com.example.demo.service;

import com.example.demo.model.CustomCategory;
import com.example.demo.model.User;
import com.example.demo.repository.CustomCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class CustomCategoryService {
    private static final Logger LOGGER = Logger.getLogger(CustomCategoryService.class.getName());

    private final CustomCategoryRepository customCategoryRepository;

    @Autowired
    public CustomCategoryService(CustomCategoryRepository customCategoryRepository) {
        this.customCategoryRepository = customCategoryRepository;
    }

    public List<CustomCategory> getAllCategoriesForUser(User user) {
        List<CustomCategory> categories = customCategoryRepository.findByUser(user);
        LOGGER.info("Retrieved " + categories.size() + " categories for user ID: " + user.getId());
        for (CustomCategory category : categories) {
            LOGGER.info("Category: " + category.toString());
        }
        return categories;
    }

    public Optional<CustomCategory> getCategoryById(Long id, User user) {
        Optional<CustomCategory> categoryOpt = customCategoryRepository.findByIdAndUser(id, user);
        if (categoryOpt.isPresent()) {
            LOGGER.info("Found category by ID: " + id + " for user ID: " + user.getId());
        } else {
            LOGGER.info("Category not found with ID: " + id + " for user ID: " + user.getId());
        }
        return categoryOpt;
    }

    public CustomCategory createCategory(CustomCategory category, User user) {
        // Check if a category with this name already exists for the user
        if (customCategoryRepository.existsByNameAndUser(category.getName(), user)) {
            LOGGER.warning("Category with name '" + category.getName() + "' already exists for user ID: " + user.getId());
            throw new IllegalArgumentException("A category with this name already exists");
        }

        category.setUser(user);
        CustomCategory savedCategory = customCategoryRepository.save(category);
        LOGGER.info("Created new category: " + savedCategory.toString() + " for user ID: " + user.getId());
        return savedCategory;
    }

    public CustomCategory updateCategory(Long id, CustomCategory categoryDetails, User user) {
        Optional<CustomCategory> categoryOpt = customCategoryRepository.findByIdAndUser(id, user);

        if (categoryOpt.isPresent()) {
            CustomCategory category = categoryOpt.get();

            // Check if name is being changed and if new name already exists
            if (!category.getName().equals(categoryDetails.getName()) &&
                    customCategoryRepository.existsByNameAndUser(categoryDetails.getName(), user)) {
                LOGGER.warning("Cannot update category - name '" + categoryDetails.getName() + "' already exists for user ID: " + user.getId());
                throw new IllegalArgumentException("A category with this name already exists");
            }

            category.setName(categoryDetails.getName());
            category.setColor(categoryDetails.getColor());

            CustomCategory updatedCategory = customCategoryRepository.save(category);
            LOGGER.info("Updated category: " + updatedCategory.toString() + " for user ID: " + user.getId());
            return updatedCategory;
        } else {
            LOGGER.warning("Cannot update - category not found with ID: " + id + " for user ID: " + user.getId());
            throw new IllegalArgumentException("Category not found or not owned by user");
        }
    }

    public void deleteCategory(Long id, User user) {
        Optional<CustomCategory> categoryOpt = customCategoryRepository.findByIdAndUser(id, user);

        if (categoryOpt.isPresent()) {
            CustomCategory categoryToDelete = categoryOpt.get();
            LOGGER.info("Deleting category: " + categoryToDelete.toString() + " for user ID: " + user.getId());
            customCategoryRepository.delete(categoryToDelete);
        } else {
            LOGGER.warning("Cannot delete - category not found with ID: " + id + " for user ID: " + user.getId());
            throw new IllegalArgumentException("Category not found or not owned by user");
        }
    }
}