package com.example.smartspend.service;

import com.example.smartspend.dto.CategoryDTO;
import com.example.smartspend.entity.Category.CategoryType;

import java.util.List;

public interface CategoryService {
    CategoryDTO createCategory(CategoryDTO categoryDTO);
    List<CategoryDTO> getAllCategories();
    List<CategoryDTO> getCategoriesByType(CategoryType type);
    CategoryDTO getCategoryById(Long id);
    void deleteCategory(Long id);
}