package com.example.smartspend.service.impl;

import com.example.smartspend.dto.CategoryDTO;
import com.example.smartspend.dto.TransactionRequestDTO;
import com.example.smartspend.dto.TransactionResponseDTO;
import com.example.smartspend.entity.Category;
import com.example.smartspend.entity.Transaction;
import com.example.smartspend.entity.User;
import com.example.smartspend.repository.CategoryRepository;
import com.example.smartspend.repository.TransactionRepository;
import com.example.smartspend.repository.UserRepository;
import com.example.smartspend.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    public TransactionResponseDTO createTransaction(TransactionRequestDTO requestDTO) {
        User user = userRepository.findById(requestDTO.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + requestDTO.getUserId()));

        Category category = categoryRepository.findById(requestDTO.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + requestDTO.getCategoryId()));

        Transaction transaction = Transaction.builder()
                .amount(requestDTO.getAmount())
                .description(requestDTO.getDescription())
                .transactionDate(requestDTO.getTransactionDate() != null ? requestDTO.getTransactionDate() : LocalDate.now())
                .category(category)
                .user(user)
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);
        return mapToDTO(savedTransaction);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> getTransactionsByUser(Long userId) {
        return transactionRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> getTransactionsByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByUserIdAndTransactionDateBetween(userId, startDate, endDate).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteTransaction(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new IllegalArgumentException("Transaction not found with id: " + id);
        }
        transactionRepository.deleteById(id);
    }

    private TransactionResponseDTO mapToDTO(Transaction transaction) {
        CategoryDTO categoryDTO = CategoryDTO.builder()
                .id(transaction.getCategory().getId())
                .name(transaction.getCategory().getName())
                .type(transaction.getCategory().getType())
                .build();

        return TransactionResponseDTO.builder()
                .id(transaction.getId())
                .amount(transaction.getAmount())
                .description(transaction.getDescription())
                .transactionDate(transaction.getTransactionDate())
                .category(categoryDTO)
                .userId(transaction.getUser().getId())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}