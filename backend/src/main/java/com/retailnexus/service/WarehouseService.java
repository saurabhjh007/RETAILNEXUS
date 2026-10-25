package com.retailnexus.service;

import com.retailnexus.dto.WarehouseDto;
import com.retailnexus.dto.WarehouseRequest;
import com.retailnexus.entity.Inventory;
import com.retailnexus.entity.Product;
import com.retailnexus.entity.Warehouse;
import com.retailnexus.exception.InvalidOperationException;
import com.retailnexus.exception.ResourceNotFoundException;
import com.retailnexus.repository.InventoryRepository;
import com.retailnexus.repository.ProductRepository;
import com.retailnexus.repository.WarehouseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final AuditService auditService;

    public WarehouseService(WarehouseRepository warehouseRepository,
                            InventoryRepository inventoryRepository,
                            ProductRepository productRepository,
                            AuditService auditService) {
        this.warehouseRepository = warehouseRepository;
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<WarehouseDto> getAllWarehouses() {
        return warehouseRepository.findAll().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WarehouseDto getWarehouseById(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));
        return mapToDto(warehouse);
    }

    @Transactional
    public WarehouseDto createWarehouse(WarehouseRequest request) {
        if (warehouseRepository.existsByCode(request.getCode())) {
            throw new InvalidOperationException("Warehouse with code '" + request.getCode() + "' already exists");
        }

        Warehouse warehouse = new Warehouse();
        warehouse.setCode(request.getCode().toUpperCase().trim());
        warehouse.setName(request.getName());
        warehouse.setAddress(request.getAddress());
        warehouse.setCity(request.getCity());
        warehouse.setState(request.getState());
        warehouse.setPostalCode(request.getPostalCode());
        warehouse.setManagerName(request.getManagerName());
        warehouse.setContactEmail(request.getContactEmail());
        warehouse.setContactPhone(request.getContactPhone());
        warehouse.setActive(request.isActive());

        Warehouse saved = warehouseRepository.save(warehouse);

        // Auto-create zero-quantity inventory rows for existing active products
        List<Product> products = productRepository.findByActiveTrue();
        for (Product product : products) {
            Inventory inv = new Inventory(product, saved, 0, 0);
            inventoryRepository.save(inv);
        }

        auditService.record("Warehouse", saved.getCode(), "CREATE", "Created new warehouse: " + saved.getName());

        return mapToDto(saved);
    }

    @Transactional
    public WarehouseDto updateWarehouse(Long id, WarehouseRequest request) {
        Warehouse warehouse = warehouseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));

        if (!warehouse.getCode().equalsIgnoreCase(request.getCode().trim()) && warehouseRepository.existsByCode(request.getCode())) {
            throw new InvalidOperationException("Warehouse with code '" + request.getCode() + "' already exists");
        }

        warehouse.setCode(request.getCode().toUpperCase().trim());
        warehouse.setName(request.getName());
        warehouse.setAddress(request.getAddress());
        warehouse.setCity(request.getCity());
        warehouse.setState(request.getState());
        warehouse.setPostalCode(request.getPostalCode());
        warehouse.setManagerName(request.getManagerName());
        warehouse.setContactEmail(request.getContactEmail());
        warehouse.setContactPhone(request.getContactPhone());
        warehouse.setActive(request.isActive());

        Warehouse updated = warehouseRepository.save(warehouse);
        auditService.record("Warehouse", updated.getCode(), "UPDATE", "Updated warehouse: " + updated.getName());

        return mapToDto(updated);
    }

    public WarehouseDto mapToDto(Warehouse warehouse) {
        WarehouseDto dto = new WarehouseDto();
        dto.setId(warehouse.getId());
        dto.setCode(warehouse.getCode());
        dto.setName(warehouse.getName());
        dto.setAddress(warehouse.getAddress());
        dto.setCity(warehouse.getCity());
        dto.setState(warehouse.getState());
        dto.setPostalCode(warehouse.getPostalCode());
        dto.setManagerName(warehouse.getManagerName());
        dto.setContactEmail(warehouse.getContactEmail());
        dto.setContactPhone(warehouse.getContactPhone());
        dto.setActive(warehouse.isActive());

        List<Inventory> inventories = inventoryRepository.findByWarehouseId(warehouse.getId());
        int totalUnits = inventories.stream().mapToInt(Inventory::getOnHandQuantity).sum();
        long productCount = inventories.stream().filter(i -> i.getOnHandQuantity() > 0).count();

        BigDecimal valuation = BigDecimal.ZERO;
        for (Inventory inv : inventories) {
            BigDecimal cost = inv.getProduct().getCostPrice();
            valuation = valuation.add(cost.multiply(BigDecimal.valueOf(inv.getOnHandQuantity())));
        }

        dto.setTotalProductsCount((int) productCount);
        dto.setTotalUnits(totalUnits);
        dto.setTotalValuation(valuation);

        return dto;
    }
}
