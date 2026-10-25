package com.retailnexus.repository;

import com.retailnexus.entity.Inventory;
import com.retailnexus.entity.Product;
import com.retailnexus.entity.Warehouse;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductAndWarehouse(Product product, Warehouse warehouse);

    Optional<Inventory> findByProductIdAndWarehouseId(Long productId, Long warehouseId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.product.id = :productId AND i.warehouse.id = :warehouseId")
    Optional<Inventory> findWithLockByProductIdAndWarehouseId(@Param("productId") Long productId, @Param("warehouseId") Long warehouseId);

    List<Inventory> findByProductId(Long productId);

    List<Inventory> findByWarehouseId(Long warehouseId);

    @Query("SELECT i FROM Inventory i WHERE " +
           "(:warehouseId IS NULL OR i.warehouse.id = :warehouseId) AND " +
           "(:query IS NULL OR LOWER(i.product.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(i.product.sku) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Inventory> searchInventory(@Param("query") String query,
                                   @Param("warehouseId") Long warehouseId,
                                   Pageable pageable);

    @Query("SELECT i FROM Inventory i WHERE (i.onHandQuantity - i.reservedQuantity) <= i.product.reorderThreshold AND i.product.active = true")
    List<Inventory> findLowStockInventories();

    @Query("SELECT i FROM Inventory i WHERE (i.onHandQuantity - i.reservedQuantity) <= 0 AND i.product.active = true")
    List<Inventory> findOutOfStockInventories();
}
