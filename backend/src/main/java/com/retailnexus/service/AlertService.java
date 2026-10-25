package com.retailnexus.service;

import com.retailnexus.dto.AlertDto;
import com.retailnexus.entity.Alert;
import com.retailnexus.exception.ResourceNotFoundException;
import com.retailnexus.repository.AlertRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AlertService {

    private final AlertRepository alertRepository;
    private final AuditService auditService;

    public AlertService(AlertRepository alertRepository, AuditService auditService) {
        this.alertRepository = alertRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<AlertDto> getAlerts(Boolean acknowledged, String severity, String alertType, Pageable pageable) {
        return alertRepository.searchAlerts(acknowledged, severity, alertType, pageable)
            .map(this::mapToDto);
    }

    @Transactional
    public AlertDto acknowledgeAlert(Long id) {
        Alert alert = alertRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + id));

        alert.setAcknowledged(true);
        alert.setAcknowledgedBy(getCurrentUsername());
        alert.setAcknowledgedAt(LocalDateTime.now());

        Alert saved = alertRepository.save(alert);
        auditService.record("Alert", String.valueOf(saved.getId()), "ACKNOWLEDGE", "Acknowledged alert: " + saved.getTitle());

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return alertRepository.countByAcknowledgedFalse();
    }

    public AlertDto mapToDto(Alert alert) {
        AlertDto dto = new AlertDto();
        dto.setId(alert.getId());
        dto.setAlertType(alert.getAlertType());
        dto.setSeverity(alert.getSeverity());
        dto.setTitle(alert.getTitle());
        dto.setMessage(alert.getMessage());
        if (alert.getProduct() != null) {
            dto.setProductId(alert.getProduct().getId());
            dto.setProductSku(alert.getProduct().getSku());
            dto.setProductName(alert.getProduct().getName());
        }
        if (alert.getWarehouse() != null) {
            dto.setWarehouseId(alert.getWarehouse().getId());
            dto.setWarehouseName(alert.getWarehouse().getName());
        }
        dto.setAcknowledged(alert.isAcknowledged());
        dto.setAcknowledgedBy(alert.getAcknowledgedBy());
        dto.setAcknowledgedAt(alert.getAcknowledgedAt());
        dto.setCreatedAt(alert.getCreatedAt());
        return dto;
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            return auth.getName();
        }
        return "System";
    }
}
