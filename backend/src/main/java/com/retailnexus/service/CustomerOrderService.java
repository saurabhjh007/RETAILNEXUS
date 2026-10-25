package com.retailnexus.service;

import com.retailnexus.dto.*;
import com.retailnexus.entity.*;
import com.retailnexus.exception.InsufficientStockException;
import com.retailnexus.exception.InvalidOperationException;
import com.retailnexus.exception.ResourceNotFoundException;
import com.retailnexus.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CustomerOrderService {

    private final CustomerOrderRepository customerOrderRepository;
    private final CustomerOrderItemRepository customerOrderItemRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryMovementRepository movementRepository;
    private final AuditService auditService;

    public CustomerOrderService(CustomerOrderRepository customerOrderRepository,
                                CustomerOrderItemRepository customerOrderItemRepository,
                                WarehouseRepository warehouseRepository,
                                ProductRepository productRepository,
                                InventoryRepository inventoryRepository,
                                InventoryMovementRepository movementRepository,
                                AuditService auditService) {
        this.customerOrderRepository = customerOrderRepository;
        this.customerOrderItemRepository = customerOrderItemRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.movementRepository = movementRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<CustomerOrderDto> getCustomerOrders(String query, Long warehouseId, String status, Pageable pageable) {
        return customerOrderRepository.searchOrders(query, warehouseId, status, pageable)
            .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public CustomerOrderDto getCustomerOrderById(Long id) {
        CustomerOrder order = customerOrderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer order not found with id: " + id));
        return mapToDto(order);
    }

    @Transactional
    public CustomerOrderDto createCustomerOrder(CustomerOrderRequest request) {
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
            .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + request.getWarehouseId()));

        String orderNumber = "ORD-2026-" + String.format("%04d", (int)(Math.random() * 9000 + 1000));
        while (customerOrderRepository.existsByOrderNumber(orderNumber)) {
            orderNumber = "ORD-2026-" + String.format("%04d", (int)(Math.random() * 9000 + 1000));
        }

        CustomerOrder order = new CustomerOrder();
        order.setOrderNumber(orderNumber);
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setWarehouse(warehouse);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("CONFIRMED"); // Auto-reserves stock
        order.setNotes(request.getNotes());

        BigDecimal subtotal = BigDecimal.ZERO;
        List<CustomerOrderItem> items = new ArrayList<>();
        String currentUser = getCurrentUsername();

        for (CustomerOrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemReq.getProductId()));

            // Concurrency check and lock row
            Inventory inventory = inventoryRepository.findWithLockByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                .orElseThrow(() -> new InsufficientStockException("Product " + product.getName() + " is not stocked at " + warehouse.getName()));

            int available = inventory.getAvailableQuantity();
            if (available < itemReq.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for " + product.getName() +
                    " at " + warehouse.getName() + ". Available: " + available + ", Requested: " + itemReq.getQuantity());
            }

            // Reserve stock atomically
            inventory.setReservedQuantity(inventory.getReservedQuantity() + itemReq.getQuantity());
            inventoryRepository.save(inventory);

            // Record reservation movement
            InventoryMovement resMovement = new InventoryMovement();
            resMovement.setProduct(product);
            resMovement.setSourceWarehouse(warehouse);
            resMovement.setMovementType("STOCK_RESERVATION");
            resMovement.setQuantity(itemReq.getQuantity());
            resMovement.setReferenceId(orderNumber);
            resMovement.setNotes("Stock reserved for customer order " + orderNumber);
            resMovement.setPerformedBy(currentUser);
            movementRepository.save(resMovement);

            CustomerOrderItem item = new CustomerOrderItem();
            item.setCustomerOrder(order);
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(product.getSellingPrice());
            BigDecimal itemTotal = product.getSellingPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            item.setTotalPrice(itemTotal);

            subtotal = subtotal.add(itemTotal);
            items.add(item);
        }

        BigDecimal taxAmount = subtotal.multiply(BigDecimal.valueOf(0.08)); // Standard 8% blended tax
        BigDecimal totalAmount = subtotal.add(taxAmount);

        order.setSubtotal(subtotal);
        order.setTaxAmount(taxAmount);
        order.setTotalAmount(totalAmount);
        order.setItems(items);

        CustomerOrder saved = customerOrderRepository.save(order);
        auditService.record("CustomerOrder", saved.getOrderNumber(), "CREATE", "Confirmed order for ₹" + totalAmount);

        return mapToDto(saved);
    }

    @Transactional
    public CustomerOrderDto updateOrderStatus(Long id, OrderStatusUpdateRequest request) {
        CustomerOrder order = customerOrderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer order not found with id: " + id));

        String currentStatus = order.getStatus();
        String targetStatus = request.getStatus().toUpperCase();

        if (currentStatus.equals("DELIVERED") || currentStatus.equals("CANCELLED")) {
            throw new InvalidOperationException("Cannot change status of an order that is already " + currentStatus);
        }

        Warehouse warehouse = order.getWarehouse();
        String currentUser = getCurrentUsername();

        // Check DISPATCH transition: decrement on_hand and reserved
        if (targetStatus.equals("DISPATCHED") && !currentStatus.equals("DISPATCHED")) {
            for (CustomerOrderItem item : order.getItems()) {
                Product product = item.getProduct();
                Inventory inventory = inventoryRepository.findWithLockByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                    .orElseThrow(() -> new InvalidOperationException("Inventory missing during dispatch"));

                int qty = item.getQuantity();
                inventory.setOnHandQuantity(Math.max(0, inventory.getOnHandQuantity() - qty));
                inventory.setReservedQuantity(Math.max(0, inventory.getReservedQuantity() - qty));
                inventoryRepository.save(inventory);

                // Record dispatch movement
                InventoryMovement mov = new InventoryMovement();
                mov.setProduct(product);
                mov.setSourceWarehouse(warehouse);
                mov.setMovementType("ORDER_DISPATCH");
                mov.setQuantity(qty);
                mov.setReferenceId(order.getOrderNumber());
                mov.setNotes("Order dispatched to " + order.getCustomerName());
                mov.setPerformedBy(currentUser);
                movementRepository.save(mov);
            }
        }
        // Check CANCELLED transition: release reserved stock
        else if (targetStatus.equals("CANCELLED")) {
            if (currentStatus.equals("DISPATCHED")) {
                throw new InvalidOperationException("Cannot cancel an order that has already been dispatched");
            }
            // Release reserved quantities
            for (CustomerOrderItem item : order.getItems()) {
                Product product = item.getProduct();
                Inventory inventory = inventoryRepository.findWithLockByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                    .orElseThrow(() -> new InvalidOperationException("Inventory missing during release"));

                int qty = item.getQuantity();
                inventory.setReservedQuantity(Math.max(0, inventory.getReservedQuantity() - qty));
                inventoryRepository.save(inventory);

                InventoryMovement relMovement = new InventoryMovement();
                relMovement.setProduct(product);
                relMovement.setDestinationWarehouse(warehouse);
                relMovement.setMovementType("STOCK_RELEASE");
                relMovement.setQuantity(qty);
                relMovement.setReferenceId(order.getOrderNumber());
                relMovement.setNotes("Stock reservation released on cancellation of " + order.getOrderNumber());
                relMovement.setPerformedBy(currentUser);
                movementRepository.save(relMovement);
            }
        }

        order.setStatus(targetStatus);
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            order.setNotes((order.getNotes() != null ? order.getNotes() + " | " : "") + request.getNotes());
        }

        CustomerOrder updated = customerOrderRepository.save(order);
        auditService.record("CustomerOrder", updated.getOrderNumber(), "STATUS_CHANGE",
            "Order status updated from " + currentStatus + " to " + targetStatus);

        return mapToDto(updated);
    }

    public CustomerOrderDto mapToDto(CustomerOrder order) {
        CustomerOrderDto dto = new CustomerOrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setCustomerName(order.getCustomerName());
        dto.setCustomerEmail(order.getCustomerEmail());
        dto.setCustomerPhone(order.getCustomerPhone());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setWarehouseId(order.getWarehouse().getId());
        dto.setWarehouseName(order.getWarehouse().getName());
        dto.setWarehouseCode(order.getWarehouse().getCode());
        dto.setOrderDate(order.getOrderDate());
        dto.setStatus(order.getStatus());
        dto.setSubtotal(order.getSubtotal());
        dto.setTaxAmount(order.getTaxAmount());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setNotes(order.getNotes());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        List<CustomerOrderItemDto> itemDtos = order.getItems().stream().map(item -> {
            CustomerOrderItemDto itemDto = new CustomerOrderItemDto();
            itemDto.setId(item.getId());
            itemDto.setProductId(item.getProduct().getId());
            itemDto.setProductSku(item.getProduct().getSku());
            itemDto.setProductName(item.getProduct().getName());
            itemDto.setUnit(item.getProduct().getUnit());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setUnitPrice(item.getUnitPrice());
            itemDto.setTotalPrice(item.getTotalPrice());
            return itemDto;
        }).collect(Collectors.toList());

        dto.setItems(itemDtos);
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
