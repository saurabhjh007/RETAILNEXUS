package com.retailnexus.service;

import com.retailnexus.dto.*;
import com.retailnexus.entity.*;
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
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryMovementRepository movementRepository;
    private final AuditService auditService;

    public PurchaseOrderService(PurchaseOrderRepository purchaseOrderRepository,
                                PurchaseOrderItemRepository purchaseOrderItemRepository,
                                SupplierRepository supplierRepository,
                                WarehouseRepository warehouseRepository,
                                ProductRepository productRepository,
                                InventoryRepository inventoryRepository,
                                InventoryMovementRepository movementRepository,
                                AuditService auditService) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.purchaseOrderItemRepository = purchaseOrderItemRepository;
        this.supplierRepository = supplierRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.movementRepository = movementRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<PurchaseOrderDto> getPurchaseOrders(String query, Long supplierId, Long warehouseId, String status, Pageable pageable) {
        return purchaseOrderRepository.searchPurchaseOrders(query, supplierId, warehouseId, status, pageable)
            .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public PurchaseOrderDto getPurchaseOrderById(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with id: " + id));
        return mapToDto(po);
    }

    @Transactional
    public PurchaseOrderDto createPurchaseOrder(PurchaseOrderRequest request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
            .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));

        Warehouse warehouse = warehouseRepository.findById(request.getDestinationWarehouseId())
            .orElseThrow(() -> new ResourceNotFoundException("Destination warehouse not found with id: " + request.getDestinationWarehouseId()));

        String orderNumber = "PO-2026-" + String.format("%04d", (int)(Math.random() * 9000 + 1000));
        while (purchaseOrderRepository.existsByOrderNumber(orderNumber)) {
            orderNumber = "PO-2026-" + String.format("%04d", (int)(Math.random() * 9000 + 1000));
        }

        PurchaseOrder po = new PurchaseOrder();
        po.setOrderNumber(orderNumber);
        po.setSupplier(supplier);
        po.setDestinationWarehouse(warehouse);
        po.setOrderDate(request.getOrderDate());
        po.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        po.setStatus("DRAFT");
        po.setNotes(request.getNotes());
        po.setCreatedBy(getCurrentUsername());

        BigDecimal subtotal = BigDecimal.ZERO;
        List<PurchaseOrderItem> items = new ArrayList<>();

        for (PurchaseOrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemReq.getProductId()));

            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setPurchaseOrder(po);
            item.setProduct(product);
            item.setQuantityOrdered(itemReq.getQuantityOrdered());
            item.setQuantityReceived(0);
            item.setUnitCost(itemReq.getUnitCost());
            BigDecimal itemTotal = itemReq.getUnitCost().multiply(BigDecimal.valueOf(itemReq.getQuantityOrdered()));
            item.setTotalCost(itemTotal);

            subtotal = subtotal.add(itemTotal);
            items.add(item);
        }

        BigDecimal taxAmount = subtotal.multiply(BigDecimal.valueOf(0.05)); // Standard 5% GST approximation
        BigDecimal totalAmount = subtotal.add(taxAmount);

        po.setSubtotal(subtotal);
        po.setTaxAmount(taxAmount);
        po.setTotalAmount(totalAmount);
        po.setItems(items);

        PurchaseOrder saved = purchaseOrderRepository.save(po);
        auditService.record("PurchaseOrder", saved.getOrderNumber(), "CREATE", "Created PO for total ₹" + totalAmount);

        return mapToDto(saved);
    }

    @Transactional
    public PurchaseOrderDto updateStatus(Long id, String newStatus) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with id: " + id));

        String currentStatus = po.getStatus();

        if (currentStatus.equals("FULLY_RECEIVED") || currentStatus.equals("CANCELLED")) {
            throw new InvalidOperationException("Cannot change status of a " + currentStatus + " purchase order");
        }

        if (newStatus.equals("CANCELLED") && (currentStatus.equals("PARTIALLY_RECEIVED"))) {
            throw new InvalidOperationException("Cannot cancel a partially received purchase order");
        }

        po.setStatus(newStatus.toUpperCase());
        PurchaseOrder updated = purchaseOrderRepository.save(po);

        auditService.record("PurchaseOrder", updated.getOrderNumber(), "STATUS_CHANGE",
            "Status changed from " + currentStatus + " to " + newStatus);

        return mapToDto(updated);
    }

    @Transactional
    public PurchaseOrderDto receiveGoods(Long id, ReceivePoRequest request) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with id: " + id));

        if (!po.getStatus().equals("APPROVED") && !po.getStatus().equals("PARTIALLY_RECEIVED")) {
            throw new InvalidOperationException("Goods can only be received on APPROVED or PARTIALLY_RECEIVED orders. Current: " + po.getStatus());
        }

        Warehouse destWarehouse = po.getDestinationWarehouse();
        String currentUser = getCurrentUsername();

        Map<Long, PurchaseOrderItem> itemMap = po.getItems().stream()
            .collect(Collectors.toMap(PurchaseOrderItem::getId, item -> item));

        for (ReceivePoItemRequest receiveItem : request.getItems()) {
            PurchaseOrderItem item = itemMap.get(receiveItem.getItemId());
            if (item == null) {
                throw new InvalidOperationException("PO Item ID " + receiveItem.getItemId() + " does not belong to order " + po.getOrderNumber());
            }

            int currentReceived = item.getQuantityReceived();
            int remaining = item.getQuantityOrdered() - currentReceived;
            int toReceive = receiveItem.getQuantityToReceive();

            if (toReceive > remaining) {
                throw new InvalidOperationException("Cannot receive " + toReceive + " units of " + item.getProduct().getName() +
                    ". Outstanding quantity is only " + remaining);
            }

            item.setQuantityReceived(currentReceived + toReceive);
            purchaseOrderItemRepository.save(item);

            // Atomically update inventory in destination warehouse
            Product product = item.getProduct();
            Inventory inventory = inventoryRepository.findWithLockByProductIdAndWarehouseId(product.getId(), destWarehouse.getId())
                .orElseGet(() -> new Inventory(product, destWarehouse, 0, 0));

            inventory.setOnHandQuantity(inventory.getOnHandQuantity() + toReceive);
            inventoryRepository.save(inventory);

            // Record Movement ledger entry
            InventoryMovement movement = new InventoryMovement();
            movement.setProduct(product);
            movement.setDestinationWarehouse(destWarehouse);
            movement.setMovementType("PURCHASE_RECEIPT");
            movement.setQuantity(toReceive);
            movement.setReferenceId(po.getOrderNumber());
            movement.setNotes(request.getNotes() != null ? request.getNotes() : "Goods receipt for " + po.getOrderNumber());
            movement.setPerformedBy(currentUser);
            movementRepository.save(movement);
        }

        // Determine if all items are fully received
        boolean allFullyReceived = po.getItems().stream()
            .allMatch(item -> item.getQuantityReceived() >= item.getQuantityOrdered());

        po.setStatus(allFullyReceived ? "FULLY_RECEIVED" : "PARTIALLY_RECEIVED");
        PurchaseOrder updated = purchaseOrderRepository.save(po);

        auditService.record("PurchaseOrder", updated.getOrderNumber(), "RECEIVE_GOODS",
            "Received goods against order. New status: " + updated.getStatus());

        return mapToDto(updated);
    }

    public PurchaseOrderDto mapToDto(PurchaseOrder po) {
        PurchaseOrderDto dto = new PurchaseOrderDto();
        dto.setId(po.getId());
        dto.setOrderNumber(po.getOrderNumber());
        dto.setSupplierId(po.getSupplier().getId());
        dto.setSupplierName(po.getSupplier().getName());
        dto.setSupplierCode(po.getSupplier().getCode());
        dto.setDestinationWarehouseId(po.getDestinationWarehouse().getId());
        dto.setDestinationWarehouseName(po.getDestinationWarehouse().getName());
        dto.setDestinationWarehouseCode(po.getDestinationWarehouse().getCode());
        dto.setOrderDate(po.getOrderDate());
        dto.setExpectedDeliveryDate(po.getExpectedDeliveryDate());
        dto.setStatus(po.getStatus());
        dto.setSubtotal(po.getSubtotal());
        dto.setTaxAmount(po.getTaxAmount());
        dto.setTotalAmount(po.getTotalAmount());
        dto.setNotes(po.getNotes());
        dto.setCreatedBy(po.getCreatedBy());
        dto.setCreatedAt(po.getCreatedAt());
        dto.setUpdatedAt(po.getUpdatedAt());

        List<PurchaseOrderItemDto> itemDtos = po.getItems().stream().map(item -> {
            PurchaseOrderItemDto itemDto = new PurchaseOrderItemDto();
            itemDto.setId(item.getId());
            itemDto.setProductId(item.getProduct().getId());
            itemDto.setProductSku(item.getProduct().getSku());
            itemDto.setProductName(item.getProduct().getName());
            itemDto.setUnit(item.getProduct().getUnit());
            itemDto.setQuantityOrdered(item.getQuantityOrdered());
            itemDto.setQuantityReceived(item.getQuantityReceived());
            itemDto.setRemainingQuantity(Math.max(0, item.getQuantityOrdered() - item.getQuantityReceived()));
            itemDto.setUnitCost(item.getUnitCost());
            itemDto.setTotalCost(item.getTotalCost());
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
