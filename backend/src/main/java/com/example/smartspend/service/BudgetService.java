package com.example.smartspend.service;

import com.example.smartspend.dto.BudgetRequestDTO;
import com.example.smartspend.dto.BudgetResponseDTO;

import java.util.List;

public interface BudgetService {
    BudgetResponseDTO setBudget(BudgetRequestDTO requestDTO);
    List<BudgetResponseDTO> getBudgetsByUserAndMonth(Long userId, Integer month, Integer year);
    BudgetResponseDTO getBudgetByCategory(Long userId, Long categoryId, Integer month, Integer year);
    void deleteBudget(Long id);
}