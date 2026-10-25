package com.retailnexus.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class ReceivePoRequest {

    @NotEmpty(message = "Items to receive cannot be empty")
    @Valid
    private List<ReceivePoItemRequest> items;

    private String notes;

    public ReceivePoRequest() {}

    public List<ReceivePoItemRequest> getItems() { return items; }
    public void setItems(List<ReceivePoItemRequest> items) { this.items = items; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
