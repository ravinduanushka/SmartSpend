package com.example.smartspend.service;

import com.example.smartspend.dto.MonthlySummaryResponseDTO;

public interface AnalyticsService {
    MonthlySummaryResponseDTO getMonthlySummary(Long userId, Integer month, Integer year);
}