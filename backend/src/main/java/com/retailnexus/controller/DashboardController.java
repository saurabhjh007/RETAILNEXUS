package com.retailnexus.controller;

import com.retailnexus.dto.ApiResponse;
import com.retailnexus.dto.DashboardSummaryDto;
import com.retailnexus.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getDashboardSummary(
            @RequestParam(required = false) Long warehouseId) {
        DashboardSummaryDto summary = dashboardService.getDashboardSummary(warehouseId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
