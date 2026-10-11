package com.example.smartspend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponseDTO {

    private Long id;
    private BigDecimal amount;
    private String description;
    private LocalDate transactionDate;
    private CategoryDTO category;
    private Long userId;
    private LocalDateTime createdAt;
}