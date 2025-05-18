package com.example.demo.service;

import com.example.demo.model.CustomCategory;
import com.example.demo.model.User;
import com.example.demo.repository.CustomCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomCategoryService {

    private final CustomCategoryRepository customCategoryRepository;

    @Autowired
    public CustomCategoryService(CustomCategoryRepository customCategoryRepository) {
        this.customCategoryRepository = customCategoryRepository;
    }

    public List<CustomCategory> getAllCategoriesForUser(User user) {
        return customCategoryRepository.findByUser(user);
    }

    public Optional<CustomCategory> getCategoryById(Long id, User user) {
        return customCategoryRepository.findByIdAndUser(id, user);
    }

    public CustomCategory createCategory(CustomCategory category, User user) {
        // Check if a category with this name already exists for the user
        if (customCategoryRepository.existsByNameAndUser(category.getName(), user)) {
            throw new IllegalArgumentException("A category with this name already exists");
        }

        category.setUser(user);
        return customCategoryRepository.save(category);
    }

    public CustomCategory updateCategory(Long id, CustomCategory categoryDetails, User user) {
        Optional<CustomCategory> categoryOpt = customCategoryRepository.findByIdAndUser(id, user);

        if (categoryOpt.isPresent()) {
            CustomCategory category = categoryOpt.get();

            // Check if name is being changed and if new name already exists
            if (!category.getName().equals(categoryDetails.getName()) &&
                    customCategoryRepository.existsByNameAndUser(categoryDetails.getName(), user)) {
                throw new IllegalArgumentException("A category with this name already exists");
            }

            category.setName(categoryDetails.getName());
            category.setColor(categoryDetails.getColor());

            return customCategoryRepository.save(category);
        } else {
            throw new IllegalArgumentException("Category not found or not owned by user");
        }
    }

    public void deleteCategory(Long id, User user) {
        Optional<CustomCategory> categoryOpt = customCategoryRepository.findByIdAndUser(id, user);

        if (categoryOpt.isPresent()) {
            customCategoryRepository.delete(categoryOpt.get());
        } else {
            throw new IllegalArgumentException("Category not found or not owned by user");
        }
    }
}