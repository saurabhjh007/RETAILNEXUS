package com.retailnexus.dto;

import jakarta.validation.constraints.NotBlank;

public class OrderStatusUpdateRequest {

    @NotBlank(message = "New status is required")
    private String status; // PROCESSING, READY_TO_DISPATCH, DISPATCHED, DELIVERED, CANCELLED

    private String notes;

    public OrderStatusUpdateRequest() {}

    public OrderStatusUpdateRequest(String status, String notes) {
        this.status = status;
        this.notes = notes;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
