package com.retailnexus.service;

import com.retailnexus.dto.CategoryDto;
import com.retailnexus.dto.ProductDto;
import com.retailnexus.dto.ProductRequest;
import com.retailnexus.entity.Category;
import com.retailnexus.entity.Inventory;
import com.retailnexus.entity.Product;
import com.retailnexus.entity.Warehouse;
import com.retailnexus.exception.InvalidOperationException;
import com.retailnexus.exception.ResourceNotFoundException;
import com.retailnexus.repository.CategoryRepository;
import com.retailnexus.repository.InventoryRepository;
import com.retailnexus.repository.ProductRepository;
import com.retailnexus.repository.WarehouseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;
    private final WarehouseRepository warehouseRepository;
    private final AuditService auditService;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          InventoryRepository inventoryRepository,
                          WarehouseRepository warehouseRepository,
                          AuditService auditService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.inventoryRepository = inventoryRepository;
        this.warehouseRepository = warehouseRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> getProducts(String query, Long categoryId, Boolean active, Pageable pageable) {
        return productRepository.searchProducts(query, categoryId, active, pageable)
            .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToDto(product);
    }

    @Transactional
    public ProductDto createProduct(ProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new InvalidOperationException("Product with SKU '" + request.getSku() + "' already exists");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Product product = new Product();
        product.setSku(request.getSku().toUpperCase().trim());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setCostPrice(request.getCostPrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setReorderThreshold(request.getReorderThreshold());
        product.setUnit(request.getUnit() != null ? request.getUnit() : "Units");
        product.setBarcode(request.getBarcode());
        product.setActive(request.isActive());

        Product savedProduct = productRepository.save(product);

        // Auto-initialize inventory record across all active warehouses with 0 quantity
        List<Warehouse> warehouses = warehouseRepository.findByActiveTrue();
        for (Warehouse warehouse : warehouses) {
            Inventory inv = new Inventory(savedProduct, warehouse, 0, 0);
            inventoryRepository.save(inv);
        }

        auditService.record("Product", savedProduct.getSku(), "CREATE", "Created product: " + savedProduct.getName());

        return mapToDto(savedProduct);
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (!product.getSku().equalsIgnoreCase(request.getSku().trim()) && productRepository.existsBySku(request.getSku())) {
            throw new InvalidOperationException("Product with SKU '" + request.getSku() + "' already exists");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        product.setSku(request.getSku().toUpperCase().trim());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setCostPrice(request.getCostPrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setReorderThreshold(request.getReorderThreshold());
        product.setUnit(request.getUnit() != null ? request.getUnit() : "Units");
        product.setBarcode(request.getBarcode());
        product.setActive(request.isActive());

        Product updatedProduct = productRepository.save(product);
        auditService.record("Product", updatedProduct.getSku(), "UPDATE", "Updated product details: " + updatedProduct.getName());

        return mapToDto(updatedProduct);
    }

    @Transactional
    public ProductDto toggleProductActive(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setActive(!product.isActive());
        Product saved = productRepository.save(product);

        String status = saved.isActive() ? "ACTIVATED" : "DEACTIVATED";
        auditService.record("Product", saved.getSku(), status, "Product status changed to " + status);

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
            .map(c -> new CategoryDto(c.getId(), c.getName(), c.getCode(), c.getDescription()))
            .collect(Collectors.toList());
    }

    public ProductDto mapToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setSku(product.getSku());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setCategoryId(product.getCategory().getId());
        dto.setCategoryName(product.getCategory().getName());
        dto.setCategoryCode(product.getCategory().getCode());
        dto.setCostPrice(product.getCostPrice());
        dto.setSellingPrice(product.getSellingPrice());
        dto.setReorderThreshold(product.getReorderThreshold());
        dto.setUnit(product.getUnit());
        dto.setBarcode(product.getBarcode());
        dto.setActive(product.isActive());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());

        List<Inventory> inventories = inventoryRepository.findByProductId(product.getId());
        int onHand = inventories.stream().mapToInt(Inventory::getOnHandQuantity).sum();
        int reserved = inventories.stream().mapToInt(Inventory::getReservedQuantity).sum();
        int available = Math.max(0, onHand - reserved);

        dto.setTotalOnHandStock(onHand);
        dto.setTotalReservedStock(reserved);
        dto.setTotalAvailableStock(available);

        if (available <= 0) {
            dto.setStockStatus("OUT_OF_STOCK");
        } else if (available <= product.getReorderThreshold()) {
            dto.setStockStatus("LOW_STOCK");
        } else {
            dto.setStockStatus("IN_STOCK");
        }

        return dto;
    }
}
