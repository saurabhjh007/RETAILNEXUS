package com.retailnexus.controller;

import com.retailnexus.dto.ApiResponse;
import com.retailnexus.dto.CustomerOrderDto;
import com.retailnexus.dto.CustomerOrderRequest;
import com.retailnexus.dto.OrderStatusUpdateRequest;
import com.retailnexus.service.CustomerOrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class CustomerOrderController {

    private final CustomerOrderService customerOrderService;

    public CustomerOrderController(CustomerOrderService customerOrderService) {
        this.customerOrderService = customerOrderService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CustomerOrderDto>>> getOrders(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "orderDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Page<CustomerOrderDto> orders = customerOrderService.getCustomerOrders(query, warehouseId, status, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerOrderDto>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(customerOrderService.getCustomerOrderById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF')")
    public ResponseEntity<ApiResponse<CustomerOrderDto>> createOrder(@Valid @RequestBody CustomerOrderRequest request) {
        CustomerOrderDto created = customerOrderService.createCustomerOrder(request);
        return new ResponseEntity<>(ApiResponse.success("Order confirmed and stock reserved successfully", created), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF')")
    public ResponseEntity<ApiResponse<CustomerOrderDto>> updateOrderStatus(@PathVariable Long id, @Valid @RequestBody OrderStatusUpdateRequest request) {
        CustomerOrderDto updated = customerOrderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", updated));
    }
}
