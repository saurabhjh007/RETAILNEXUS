package com.retailnexus.controller;

import com.retailnexus.dto.ApiResponse;
import com.retailnexus.service.ReportService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/valuation")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getValuationReport(
            @RequestParam(required = false) Long warehouseId) {
        Map<String, Object> report = reportService.getInventoryValuationReport(warehouseId);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/export/inventory-csv")
    public ResponseEntity<InputStreamResource> exportInventoryCsv(
            @RequestParam(required = false) Long warehouseId) {

        ByteArrayInputStream in = reportService.exportInventoryCsv(warehouseId);
        String filename = "retailnexus-inventory-" + LocalDate.now() + ".csv";

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);

        return ResponseEntity.ok()
            .headers(headers)
            .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
            .body(new InputStreamResource(in));
    }
}
