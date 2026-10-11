package com.example.smartspend.service.impl;

import com.example.smartspend.dto.CategorySummaryDTO;
import com.example.smartspend.dto.MonthlySummaryResponseDTO;
import com.example.smartspend.entity.Category.CategoryType;
import com.example.smartspend.entity.Transaction;
import com.example.smartspend.repository.TransactionRepository;
import com.example.smartspend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private final TransactionRepository transactionRepository;

    @Override
    public MonthlySummaryResponseDTO getMonthlySummary(Long userId, Integer month, Integer year) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Transaction> transactions = transactionRepository.findByUserIdAndTransactionDateBetween(userId, startDate, endDate);

        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getCategory().getType() == CategoryType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = transactions.stream()
                .filter(t -> t.getCategory().getType() == CategoryType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netSavings = totalIncome.subtract(totalExpense);

        Map<String, BigDecimal> breakdownMap = transactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getCategory().getName() + "###" + t.getCategory().getType().name(),
                        Collectors.mapping(Transaction::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        List<CategorySummaryDTO> breakdown = breakdownMap.entrySet().stream()
                .map(entry -> {
                    String[] parts = entry.getKey().split("###");
                    return CategorySummaryDTO.builder()
                            .categoryName(parts[0])
                            .categoryType(parts[1])
                            .totalAmount(entry.getValue())
                            .build();
                })
                .collect(Collectors.toList());

        return MonthlySummaryResponseDTO.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netSavings(netSavings)
                .categoryBreakdown(breakdown)
                .build();
    }
}