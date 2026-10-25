package com.retailnexus.controller;

import com.retailnexus.dto.AlertDto;
import com.retailnexus.dto.ApiResponse;
import com.retailnexus.service.AlertService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AlertDto>>> getAlerts(
            @RequestParam(required = false) Boolean acknowledged,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String alertType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {

        Page<AlertDto> alerts = alertService.getAlerts(acknowledged, severity, alertType, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        long count = alertService.getUnreadCount();
        return ResponseEntity.ok(ApiResponse.success(Map.of("unreadCount", count)));
    }

    @PatchMapping("/{id}/acknowledge")
    public ResponseEntity<ApiResponse<AlertDto>> acknowledgeAlert(@PathVariable Long id) {
        AlertDto alert = alertService.acknowledgeAlert(id);
        return ResponseEntity.ok(ApiResponse.success("Alert acknowledged", alert));
    }
}
