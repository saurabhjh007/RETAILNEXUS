package com.retailnexus.service;

import com.retailnexus.dto.ReceivePoItemRequest;
import com.retailnexus.dto.ReceivePoRequest;
import com.retailnexus.entity.*;
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
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PurchaseOrderServiceTest {

    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;
    @Mock
    private PurchaseOrderItemRepository purchaseOrderItemRepository;
    @Mock
    private SupplierRepository supplierRepository;
    @Mock
    private WarehouseRepository warehouseRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private InventoryRepository inventoryRepository;
    @Mock
    private InventoryMovementRepository movementRepository;
    @Mock
    private AuditService auditService;

    @InjectMocks
    private PurchaseOrderService purchaseOrderService;

    private PurchaseOrder po;
    private PurchaseOrderItem item;
    private Product product;
    private Warehouse warehouse;
    private Inventory inventory;

    @BeforeEach
    void setUp() {
        Category category = new Category("Foods", "CAT-FOOD", "Foods");
        product = new Product();
        product.setId(10L);
        product.setSku("SKU-FOOD-001");
        product.setName("Tata Salt");
        product.setCategory(category);
        product.setCostPrice(BigDecimal.valueOf(20.00));
        product.setSellingPrice(BigDecimal.valueOf(28.00));

        warehouse = new Warehouse();
        warehouse.setId(1L);
        warehouse.setCode("WH-MUM-01");
        warehouse.setName("Mumbai Hub");

        Supplier supplier = new Supplier();
        supplier.setId(1L);
        supplier.setName("Tata Consumer");
        supplier.setCode("SUP-TATA-01");

        po = new PurchaseOrder();
        po.setId(100L);
        po.setOrderNumber("PO-2026-0001");
        po.setSupplier(supplier);
        po.setDestinationWarehouse(warehouse);
        po.setOrderDate(LocalDate.now());
        po.setStatus("APPROVED");

        item = new PurchaseOrderItem();
        item.setId(500L);
        item.setPurchaseOrder(po);
        item.setProduct(product);
        item.setQuantityOrdered(100);
        item.setQuantityReceived(40);
        item.setUnitCost(BigDecimal.valueOf(20.00));
        item.setTotalCost(BigDecimal.valueOf(2000.00));

        List<PurchaseOrderItem> items = new ArrayList<>();
        items.add(item);
        po.setItems(items);

        inventory = new Inventory(product, warehouse, 50, 0);
    }

    @Test
    @DisplayName("Should prevent receiving quantity greater than outstanding ordered quantity")
    void testReceiveGoods_OverReceive_Rejected() {
        ReceivePoRequest request = new ReceivePoRequest();
        request.setItems(List.of(new ReceivePoItemRequest(500L, 70))); // Outstanding is only 100 - 40 = 60

        when(purchaseOrderRepository.findById(100L)).thenReturn(Optional.of(po));

        assertThrows(InvalidOperationException.class, () -> purchaseOrderService.receiveGoods(100L, request));
        verify(inventoryRepository, never()).save(any(Inventory.class));
    }

    @Test
    @DisplayName("Should receive goods, update warehouse inventory, and transition status to FULLY_RECEIVED")
    void testReceiveGoods_FullReceipt_Success() {
        ReceivePoRequest request = new ReceivePoRequest();
        request.setItems(List.of(new ReceivePoItemRequest(500L, 60))); // Exactly fills remaining 60

        when(purchaseOrderRepository.findById(100L)).thenReturn(Optional.of(po));
        when(inventoryRepository.findWithLockByProductIdAndWarehouseId(10L, 1L)).thenReturn(Optional.of(inventory));
        when(purchaseOrderRepository.save(any(PurchaseOrder.class))).thenReturn(po);

        purchaseOrderService.receiveGoods(100L, request);

        assertEquals(100, item.getQuantityReceived());
        assertEquals("FULLY_RECEIVED", po.getStatus());
        assertEquals(110, inventory.getOnHandQuantity()); // 50 + 60 = 110

        verify(inventoryRepository, times(1)).save(inventory);
        verify(movementRepository, times(1)).save(any(InventoryMovement.class));
    }
}
