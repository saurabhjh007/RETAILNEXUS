package com.retailnexus.controller;

import com.retailnexus.dto.AgileSprintDto;
import com.retailnexus.dto.ApiResponse;
import com.retailnexus.service.AgileSprintService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agile")
public class AgileSprintController {

    private final AgileSprintService agileSprintService;

    public AgileSprintController(AgileSprintService agileSprintService) {
        this.agileSprintService = agileSprintService;
    }

    @GetMapping("/sprints")
    public ResponseEntity<ApiResponse<List<AgileSprintDto>>> getSprints() {
        return ResponseEntity.ok(ApiResponse.success(agileSprintService.getAllSprints()));
    }

    @PatchMapping("/sprints/{sprintNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<ApiResponse<AgileSprintDto>> updateSprintProgress(
            @PathVariable Integer sprintNumber,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer completedPoints) {

        AgileSprintDto updated = agileSprintService.updateSprintProgress(sprintNumber, status, completedPoints);
        return ResponseEntity.ok(ApiResponse.success("Sprint progress updated", updated));
    }
}
