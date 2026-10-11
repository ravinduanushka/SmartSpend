package com.example.smartspend.service;

import com.example.smartspend.dto.TransactionRequestDTO;
import com.example.smartspend.dto.TransactionResponseDTO;

import java.time.LocalDate;
import java.util.List;

public interface TransactionService {
    TransactionResponseDTO createTransaction(TransactionRequestDTO requestDTO);
    List<TransactionResponseDTO> getTransactionsByUser(Long userId);
    List<TransactionResponseDTO> getTransactionsByDateRange(Long userId, LocalDate startDate, LocalDate endDate);
    void deleteTransaction(Long id);
}