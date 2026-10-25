package com.retailnexus.service;

import com.retailnexus.dto.InventoryDto;
import com.retailnexus.dto.InventoryMovementDto;
import com.retailnexus.dto.StockAdjustmentRequest;
import com.retailnexus.dto.StockTransferRequest;
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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryMovementRepository movementRepository;
    private final AlertRepository alertRepository;
    private final AuditService auditService;

    public InventoryService(InventoryRepository inventoryRepository,
                            ProductRepository productRepository,
                            WarehouseRepository warehouseRepository,
                            InventoryMovementRepository movementRepository,
                            AlertRepository alertRepository,
                            AuditService auditService) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
        this.movementRepository = movementRepository;
        this.alertRepository = alertRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<InventoryDto> getInventories(String query, Long warehouseId, Pageable pageable) {
        return inventoryRepository.searchInventory(query, warehouseId, pageable)
            .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public List<InventoryDto> getInventoriesByProduct(Long productId) {
        return inventoryRepository.findByProductId(productId).stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public InventoryDto adjustStock(StockAdjustmentRequest request) {
        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
            .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + request.getWarehouseId()));

        Inventory inventory = inventoryRepository.findWithLockByProductIdAndWarehouseId(product.getId(), warehouse.getId())
            .orElseGet(() -> new Inventory(product, warehouse, 0, 0));

        int currentOnHand = inventory.getOnHandQuantity();
        int newOnHand = currentOnHand + request.getAdjustmentQuantity();

        if (newOnHand < 0) {
            throw new InsufficientStockException("Cannot reduce stock below zero. Current on-hand: " + currentOnHand + ", Adjustment: " + request.getAdjustmentQuantity());
        }

        if (newOnHand < inventory.getReservedQuantity()) {
            throw new InsufficientStockException("Cannot reduce stock below currently reserved quantity (" + inventory.getReservedQuantity() + ")");
        }

        inventory.setOnHandQuantity(newOnHand);
        Inventory saved = inventoryRepository.save(inventory);

        // Record movement
        String currentUser = getCurrentUsername();
        String refId = "ADJ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        InventoryMovement movement = new InventoryMovement();
        movement.setProduct(product);
        if (request.getAdjustmentQuantity() > 0) {
            movement.setDestinationWarehouse(warehouse);
        } else {
            movement.setSourceWarehouse(warehouse);
        }
        movement.setMovementType("MANUAL_ADJUSTMENT");
        movement.setQuantity(request.getAdjustmentQuantity());
        movement.setReferenceId(refId);
        movement.setNotes(request.getNotes() != null ? request.getNotes() : "Manual stock adjustment");
        movement.setPerformedBy(currentUser);
        movementRepository.save(movement);

        auditService.record("Inventory", product.getSku() + "@" + warehouse.getCode(), "ADJUSTMENT",
            "Adjusted by " + request.getAdjustmentQuantity() + " units. New On-Hand: " + newOnHand);

        checkAndGenerateStockAlert(saved);

        return mapToDto(saved);
    }

    @Transactional
    public void transferStock(StockTransferRequest request) {
        if (request.getSourceWarehouseId().equals(request.getDestinationWarehouseId())) {
            throw new InvalidOperationException("Source and destination warehouses cannot be the same");
        }

        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        Warehouse sourceWarehouse = warehouseRepository.findById(request.getSourceWarehouseId())
            .orElseThrow(() -> new ResourceNotFoundException("Source warehouse not found with id: " + request.getSourceWarehouseId()));

        Warehouse destWarehouse = warehouseRepository.findById(request.getDestinationWarehouseId())
            .orElseThrow(() -> new ResourceNotFoundException("Destination warehouse not found with id: " + request.getDestinationWarehouseId()));

        // Atomic locking on source inventory
        Inventory sourceInv = inventoryRepository.findWithLockByProductIdAndWarehouseId(product.getId(), sourceWarehouse.getId())
            .orElseThrow(() -> new InsufficientStockException("No inventory record for product in source warehouse"));

        if (sourceInv.getAvailableQuantity() < request.getQuantity()) {
            throw new InsufficientStockException("Insufficient available stock in " + sourceWarehouse.getName() +
                ". Available: " + sourceInv.getAvailableQuantity() + ", Requested: " + request.getQuantity());
        }

        // Lock or create destination inventory
        Inventory destInv = inventoryRepository.findWithLockByProductIdAndWarehouseId(product.getId(), destWarehouse.getId())
            .orElseGet(() -> new Inventory(product, destWarehouse, 0, 0));

        // Deduct from source, add to destination
        sourceInv.setOnHandQuantity(sourceInv.getOnHandQuantity() - request.getQuantity());
        destInv.setOnHandQuantity(destInv.getOnHandQuantity() + request.getQuantity());

        inventoryRepository.save(sourceInv);
        inventoryRepository.save(destInv);

        // Record atomic transfer movement ledger entry
        String refId = "TRF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String currentUser = getCurrentUsername();

        InventoryMovement movement = new InventoryMovement();
        movement.setProduct(product);
        movement.setSourceWarehouse(sourceWarehouse);
        movement.setDestinationWarehouse(destWarehouse);
        movement.setMovementType("STOCK_TRANSFER");
        movement.setQuantity(request.getQuantity());
        movement.setReferenceId(refId);
        movement.setNotes(request.getNotes() != null ? request.getNotes() : "Inter-warehouse transfer");
        movement.setPerformedBy(currentUser);
        movementRepository.save(movement);

        auditService.record("InventoryTransfer", refId, "TRANSFER",
            "Transferred " + request.getQuantity() + " units of " + product.getSku() +
            " from " + sourceWarehouse.getCode() + " to " + destWarehouse.getCode());

        checkAndGenerateStockAlert(sourceInv);
    }

    @Transactional(readOnly = true)
    public Page<InventoryMovementDto> getMovements(Long productId, Long warehouseId, String movementType,
                                                   LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return movementRepository.searchMovements(productId, warehouseId, movementType, startDate, endDate, pageable)
            .map(this::mapMovementToDto);
    }

    @Transactional(readOnly = true)
    public List<InventoryDto> getLowStockAlerts() {
        return inventoryRepository.findLowStockInventories().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    private void checkAndGenerateStockAlert(Inventory inventory) {
        int available = inventory.getAvailableQuantity();
        Product product = inventory.getProduct();
        Warehouse warehouse = inventory.getWarehouse();

        if (available <= 0) {
            Alert alert = new Alert();
            alert.setAlertType("OUT_OF_STOCK");
            alert.setSeverity("CRITICAL");
            alert.setTitle("Out of Stock: " + product.getName());
            alert.setMessage("Zero available units of " + product.getSku() + " at " + warehouse.getName());
            alert.setProduct(product);
            alert.setWarehouse(warehouse);
            alertRepository.save(alert);
        } else if (available <= product.getReorderThreshold()) {
            Alert alert = new Alert();
            alert.setAlertType("LOW_STOCK");
            alert.setSeverity("WARNING");
            alert.setTitle("Low Stock Alert: " + product.getName());
            alert.setMessage("Available units (" + available + ") is at or below reorder threshold (" +
                product.getReorderThreshold() + ") at " + warehouse.getName());
            alert.setProduct(product);
            alert.setWarehouse(warehouse);
            alertRepository.save(alert);
        }
    }

    public InventoryDto mapToDto(Inventory inventory) {
        InventoryDto dto = new InventoryDto();
        dto.setId(inventory.getId());
        dto.setProductId(inventory.getProduct().getId());
        dto.setProductSku(inventory.getProduct().getSku());
        dto.setProductName(inventory.getProduct().getName());
        dto.setCategoryName(inventory.getProduct().getCategory().getName());
        dto.setWarehouseId(inventory.getWarehouse().getId());
        dto.setWarehouseCode(inventory.getWarehouse().getCode());
        dto.setWarehouseName(inventory.getWarehouse().getName());
        dto.setOnHandQuantity(inventory.getOnHandQuantity());
        dto.setReservedQuantity(inventory.getReservedQuantity());
        dto.setAvailableQuantity(inventory.getAvailableQuantity());
        dto.setReorderThreshold(inventory.getProduct().getReorderThreshold());
        dto.setUnit(inventory.getProduct().getUnit());
        dto.setCostPrice(inventory.getProduct().getCostPrice());
        dto.setSellingPrice(inventory.getProduct().getSellingPrice());
        dto.setUpdatedAt(inventory.getUpdatedAt());

        BigDecimal valuation = inventory.getProduct().getCostPrice().multiply(BigDecimal.valueOf(inventory.getOnHandQuantity()));
        dto.setTotalValuation(valuation);

        int available = inventory.getAvailableQuantity();
        if (available <= 0) {
            dto.setStockStatus("OUT_OF_STOCK");
        } else if (available <= inventory.getProduct().getReorderThreshold()) {
            dto.setStockStatus("LOW_STOCK");
        } else {
            dto.setStockStatus("IN_STOCK");
        }

        return dto;
    }

    public InventoryMovementDto mapMovementToDto(InventoryMovement movement) {
        InventoryMovementDto dto = new InventoryMovementDto();
        dto.setId(movement.getId());
        dto.setProductId(movement.getProduct().getId());
        dto.setProductSku(movement.getProduct().getSku());
        dto.setProductName(movement.getProduct().getName());
        if (movement.getSourceWarehouse() != null) {
            dto.setSourceWarehouseId(movement.getSourceWarehouse().getId());
            dto.setSourceWarehouseName(movement.getSourceWarehouse().getName());
        }
        if (movement.getDestinationWarehouse() != null) {
            dto.setDestinationWarehouseId(movement.getDestinationWarehouse().getId());
            dto.setDestinationWarehouseName(movement.getDestinationWarehouse().getName());
        }
        dto.setMovementType(movement.getMovementType());
        dto.setQuantity(movement.getQuantity());
        dto.setReferenceId(movement.getReferenceId());
        dto.setNotes(movement.getNotes());
        dto.setPerformedBy(movement.getPerformedBy());
        dto.setCreatedAt(movement.getCreatedAt());
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
