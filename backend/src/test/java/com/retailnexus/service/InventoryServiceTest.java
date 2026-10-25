package com.retailnexus.service;

import com.retailnexus.dto.StockAdjustmentRequest;
import com.retailnexus.dto.StockTransferRequest;
import com.retailnexus.entity.*;
import com.retailnexus.exception.InsufficientStockException;
import com.retailnexus.exception.InvalidOperationException;
import com.retailnexus.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private WarehouseRepository warehouseRepository;
    @Mock
    private InventoryMovementRepository movementRepository;
    @Mock
    private AlertRepository alertRepository;
    @Mock
    private AuditService auditService;

    @InjectMocks
    private InventoryService inventoryService;

    private Product product;
    private Warehouse sourceWarehouse;
    private Warehouse destWarehouse;
    private Inventory sourceInventory;
    private Inventory destInventory;

    @BeforeEach
    void setUp() {
        Category category = new Category("Foods", "CAT-FOOD", "Food Items");
        product = new Product();
        product.setId(1L);
        product.setSku("SKU-FOOD-001");
        product.setName("Tata Salt 1kg");
        product.setCategory(category);
        product.setCostPrice(BigDecimal.valueOf(20.00));
        product.setSellingPrice(BigDecimal.valueOf(28.00));
        product.setReorderThreshold(15);

        sourceWarehouse = new Warehouse();
        sourceWarehouse.setId(1L);
        sourceWarehouse.setCode("WH-MUM-01");
        sourceWarehouse.setName("Mumbai Hub");

        destWarehouse = new Warehouse();
        destWarehouse.setId(2L);
        destWarehouse.setCode("WH-DEL-01");
        destWarehouse.setName("Delhi DC");

        sourceInventory = new Inventory(product, sourceWarehouse, 100, 10);
        destInventory = new Inventory(product, destWarehouse, 20, 0);
    }

    @Test
    @DisplayName("Should successfully transfer stock atomically between two warehouses")
    void testTransferStock_Success() {
        StockTransferRequest request = new StockTransferRequest();
        request.setProductId(1L);
        request.setSourceWarehouseId(1L);
        request.setDestinationWarehouseId(2L);
        request.setQuantity(30);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(sourceWarehouse));
        when(warehouseRepository.findById(2L)).thenReturn(Optional.of(destWarehouse));
        when(inventoryRepository.findWithLockByProductIdAndWarehouseId(1L, 1L)).thenReturn(Optional.of(sourceInventory));
        when(inventoryRepository.findWithLockByProductIdAndWarehouseId(1L, 2L)).thenReturn(Optional.of(destInventory));

        inventoryService.transferStock(request);

        // Source onHand was 100, deducted 30 -> 70
        assertEquals(70, sourceInventory.getOnHandQuantity());
        // Dest onHand was 20, added 30 -> 50
        assertEquals(50, destInventory.getOnHandQuantity());

        verify(inventoryRepository, times(2)).save(any(Inventory.class));
        verify(movementRepository, times(1)).save(any(InventoryMovement.class));
    }

    @Test
    @DisplayName("Should reject transfer when source available stock is insufficient")
    void testTransferStock_InsufficientStock() {
        StockTransferRequest request = new StockTransferRequest();
        request.setProductId(1L);
        request.setSourceWarehouseId(1L);
        request.setDestinationWarehouseId(2L);
        request.setQuantity(95); // Available is 100 - 10 = 90

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(sourceWarehouse));
        when(warehouseRepository.findById(2L)).thenReturn(Optional.of(destWarehouse));
        when(inventoryRepository.findWithLockByProductIdAndWarehouseId(1L, 1L)).thenReturn(Optional.of(sourceInventory));

        assertThrows(InsufficientStockException.class, () -> inventoryService.transferStock(request));

        verify(inventoryRepository, never()).save(destInventory);
    }

    @Test
    @DisplayName("Should reject transfer when source and destination warehouse are identical")
    void testTransferStock_SameWarehouse_Rejected() {
        StockTransferRequest request = new StockTransferRequest();
        request.setProductId(1L);
        request.setSourceWarehouseId(1L);
        request.setDestinationWarehouseId(1L);
        request.setQuantity(10);

        assertThrows(InvalidOperationException.class, () -> inventoryService.transferStock(request));
    }

    @Test
    @DisplayName("Should prevent stock adjustment from causing negative inventory")
    void testAdjustStock_NegativeInventory_Rejected() {
        StockAdjustmentRequest request = new StockAdjustmentRequest();
        request.setProductId(1L);
        request.setWarehouseId(1L);
        request.setAdjustmentQuantity(-150); // onHand is only 100

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(sourceWarehouse));
        when(inventoryRepository.findWithLockByProductIdAndWarehouseId(1L, 1L)).thenReturn(Optional.of(sourceInventory));

        assertThrows(InsufficientStockException.class, () -> inventoryService.adjustStock(request));
    }

    @Test
    @DisplayName("Should successfully adjust stock upward and record ledger movement")
    void testAdjustStock_Positive_Success() {
        StockAdjustmentRequest request = new StockAdjustmentRequest();
        request.setProductId(1L);
        request.setWarehouseId(1L);
        request.setAdjustmentQuantity(25);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(sourceWarehouse));
        when(inventoryRepository.findWithLockByProductIdAndWarehouseId(1L, 1L)).thenReturn(Optional.of(sourceInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(sourceInventory);

        inventoryService.adjustStock(request);

        assertEquals(125, sourceInventory.getOnHandQuantity());
        verify(movementRepository, times(1)).save(any(InventoryMovement.class));
    }
}
