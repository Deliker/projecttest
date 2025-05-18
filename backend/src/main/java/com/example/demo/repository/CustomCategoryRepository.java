package com.example.demo.repository;

import com.example.demo.model.CustomCategory;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomCategoryRepository extends JpaRepository<CustomCategory, Long> {

    List<CustomCategory> findByUser(User user);

    Optional<CustomCategory> findByIdAndUser(Long id, User user);

    boolean existsByNameAndUser(String name, User user);
}