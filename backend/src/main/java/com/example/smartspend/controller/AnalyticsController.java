package com.example.smartspend.controller;

import com.example.smartspend.dto.MonthlySummaryResponseDTO;
import com.example.smartspend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary/{userId}")
    public ResponseEntity<MonthlySummaryResponseDTO> getMonthlySummary(
            @PathVariable Long userId,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        return ResponseEntity.ok(analyticsService.getMonthlySummary(userId, month, year));
    }
}