package com.example.demo.repository;

import com.example.demo.model.CustomCategory;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomCategoryRepository extends JpaRepository<CustomCategory, Long> {

    /**
     * Find all categories belonging to a specific user
     *
     * @param user the user owning the categories
     * @return list of categories
     */
    List<CustomCategory> findByUser(User user);

    /**
     * Find a category by ID that belongs to a specific user
     *
     * @param id the category ID
     * @param user the user owning the category
     * @return optional with the category if found
     */
    Optional<CustomCategory> findByIdAndUser(Long id, User user);

    /**
     * Check if a category with a specific name already exists for a user
     *
     * @param name the category name
     * @param user the user
     * @return true if such category exists
     */
    boolean existsByNameAndUser(String name, User user);

    /**
     * Custom query to list all categories for a user with eager loading
     */
    @Query("SELECT c FROM CustomCategory c WHERE c.user.id = :userId")
    List<CustomCategory> findAllByUserId(@Param("userId") Long userId);
}