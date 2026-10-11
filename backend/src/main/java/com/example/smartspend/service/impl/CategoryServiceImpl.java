package com.example.smartspend.service.impl;

import com.example.smartspend.dto.CategoryDTO;
import com.example.smartspend.entity.Category;
import com.example.smartspend.entity.Category.CategoryType;
import com.example.smartspend.repository.CategoryRepository;
import com.example.smartspend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        if (categoryRepository.existsByName(categoryDTO.getName())) {
            throw new IllegalArgumentException("Category with name '" + categoryDTO.getName() + "' already exists");
        }

        Category category = Category.builder()
                .name(categoryDTO.getName())
                .type(categoryDTO.getType())
                .build();

        Category savedCategory = categoryRepository.save(category);
        return mapToDTO(savedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> getCategoriesByType(CategoryType type) {
        return categoryRepository.findByType(type).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + id));
        return mapToDTO(category);
    }

    @Override
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new IllegalArgumentException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }

    private CategoryDTO mapToDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .build();
    }
}