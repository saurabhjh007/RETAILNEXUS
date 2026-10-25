package com.retailnexus.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ReceivePoItemRequest {

    @NotNull(message = "PO Item ID is required")
    private Long itemId;

    @NotNull(message = "Quantity to receive is required")
    @Min(value = 1, message = "Quantity received must be at least 1")
    private Integer quantityToReceive;

    public ReceivePoItemRequest() {}

    public ReceivePoItemRequest(Long itemId, Integer quantityToReceive) {
        this.itemId = itemId;
        this.quantityToReceive = quantityToReceive;
    }

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public Integer getQuantityToReceive() { return quantityToReceive; }
    public void setQuantityToReceive(Integer quantityToReceive) { this.quantityToReceive = quantityToReceive; }
}
