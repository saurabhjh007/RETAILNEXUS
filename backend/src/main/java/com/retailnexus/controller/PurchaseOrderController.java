package com.retailnexus.controller;

import com.retailnexus.dto.*;
import com.retailnexus.service.PurchaseOrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PurchaseOrderDto>>> getPurchaseOrders(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "orderDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Page<PurchaseOrderDto> pos = purchaseOrderService.getPurchaseOrders(query, supplierId, warehouseId, status, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(pos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> getPurchaseOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(purchaseOrderService.getPurchaseOrderById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> createPurchaseOrder(@Valid @RequestBody PurchaseOrderRequest request) {
        PurchaseOrderDto created = purchaseOrderService.createPurchaseOrder(request);
        return new ResponseEntity<>(ApiResponse.success("Purchase order created successfully", created), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> updateStatus(@PathVariable Long id, @RequestParam String status) {
        PurchaseOrderDto updated = purchaseOrderService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Purchase order status updated", updated));
    }

    @PostMapping("/{id}/receive")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF')")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> receiveGoods(@PathVariable Long id, @Valid @RequestBody ReceivePoRequest request) {
        PurchaseOrderDto updated = purchaseOrderService.receiveGoods(id, request);
        return ResponseEntity.ok(ApiResponse.success("Goods received and inventory updated successfully", updated));
    }
}
