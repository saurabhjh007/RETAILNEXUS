package com.retailnexus.repository;

import com.retailnexus.entity.InventoryMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {

    @Query("SELECT m FROM InventoryMovement m WHERE " +
           "(:productId IS NULL OR m.product.id = :productId) AND " +
           "(:warehouseId IS NULL OR m.sourceWarehouse.id = :warehouseId OR m.destinationWarehouse.id = :warehouseId) AND " +
           "(:movementType IS NULL OR m.movementType = :movementType) AND " +
           "(:startDate IS NULL OR m.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR m.createdAt <= :endDate)")
    Page<InventoryMovement> searchMovements(@Param("productId") Long productId,
                                           @Param("warehouseId") Long warehouseId,
                                           @Param("movementType") String movementType,
                                           @Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate,
                                           Pageable pageable);

    List<InventoryMovement> findTop10ByOrderByCreatedAtDesc();
}
