package com.example.smartspend.controller;

import com.example.smartspend.dto.BudgetRequestDTO;
import com.example.smartspend.dto.BudgetResponseDTO;
import com.example.smartspend.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    public ResponseEntity<BudgetResponseDTO> setBudget(@Valid @RequestBody BudgetRequestDTO requestDTO) {
        BudgetResponseDTO created = budgetService.setBudget(requestDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BudgetResponseDTO>> getBudgetsByUserAndMonth(
            @PathVariable Long userId,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        return ResponseEntity.ok(budgetService.getBudgetsByUserAndMonth(userId, month, year));
    }

    @GetMapping("/user/{userId}/category/{categoryId}")
    public ResponseEntity<BudgetResponseDTO> getBudgetByCategory(
            @PathVariable Long userId,
            @PathVariable Long categoryId,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        return ResponseEntity.ok(budgetService.getBudgetByCategory(userId, categoryId, month, year));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}
