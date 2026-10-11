package com.example.smartspend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetResponseDTO {

    private Long id;
    private BigDecimal monthlyLimit;
    private Integer month;
    private Integer year;
    private CategoryDTO category;
    private Long userId;
    private LocalDateTime createdAt;
}