package com.example.smartspend.service.impl;

import com.example.smartspend.dto.BudgetRequestDTO;
import com.example.smartspend.dto.BudgetResponseDTO;
import com.example.smartspend.dto.CategoryDTO;
import com.example.smartspend.entity.Budget;
import com.example.smartspend.entity.Category;
import com.example.smartspend.entity.User;
import com.example.smartspend.repository.BudgetRepository;
import com.example.smartspend.repository.CategoryRepository;
import com.example.smartspend.repository.UserRepository;
import com.example.smartspend.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    public BudgetResponseDTO setBudget(BudgetRequestDTO requestDTO) {
        User user = userRepository.findById(requestDTO.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + requestDTO.getUserId()));

        Category category = categoryRepository.findById(requestDTO.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + requestDTO.getCategoryId()));

        Budget budget = budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(
                        requestDTO.getUserId(), requestDTO.getCategoryId(), requestDTO.getMonth(), requestDTO.getYear())
                .map(existingBudget -> {
                    existingBudget.setMonthlyLimit(requestDTO.getMonthlyLimit());
                    return existingBudget;
                })
                .orElseGet(() -> Budget.builder()
                        .monthlyLimit(requestDTO.getMonthlyLimit())
                        .month(requestDTO.getMonth())
                        .year(requestDTO.getYear())
                        .category(category)
                        .user(user)
                        .build());

        Budget savedBudget = budgetRepository.save(budget);
        return mapToDTO(savedBudget);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BudgetResponseDTO> getBudgetsByUserAndMonth(Long userId, Integer month, Integer year) {
        return budgetRepository.findByUserIdAndMonthAndYear(userId, month, year).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetResponseDTO getBudgetByCategory(Long userId, Long categoryId, Integer month, Integer year) {
        Budget budget = budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(userId, categoryId, month, year)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found for the specified period and category"));
        return mapToDTO(budget);
    }

    @Override
    public void deleteBudget(Long id) {
        if (!budgetRepository.existsById(id)) {
            throw new IllegalArgumentException("Budget not found with id: " + id);
        }
        budgetRepository.deleteById(id);
    }

    private BudgetResponseDTO mapToDTO(Budget budget) {
        CategoryDTO categoryDTO = CategoryDTO.builder()
                .id(budget.getCategory().getId())
                .name(budget.getCategory().getName())
                .type(budget.getCategory().getType())
                .build();

        return BudgetResponseDTO.builder()
                .id(budget.getId())
                .monthlyLimit(budget.getMonthlyLimit())
                .month(budget.getMonth())
                .year(budget.getYear())
                .category(categoryDTO)
                .userId(budget.getUser().getId())
                .createdAt(budget.getCreatedAt())
                .build();
    }
}