package com.retailnexus.repository;

import com.retailnexus.entity.PurchaseOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    Optional<PurchaseOrder> findByOrderNumber(String orderNumber);
    boolean existsByOrderNumber(String orderNumber);

    @Query("SELECT po FROM PurchaseOrder po WHERE " +
           "(:supplierId IS NULL OR po.supplier.id = :supplierId) AND " +
           "(:warehouseId IS NULL OR po.destinationWarehouse.id = :warehouseId) AND " +
           "(:status IS NULL OR po.status = :status) AND " +
           "(:query IS NULL OR LOWER(po.orderNumber) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<PurchaseOrder> searchPurchaseOrders(@Param("query") String query,
                                             @Param("supplierId") Long supplierId,
                                             @Param("warehouseId") Long warehouseId,
                                             @Param("status") String status,
                                             Pageable pageable);

    List<PurchaseOrder> findBySupplierIdOrderByOrderDateDesc(Long supplierId);

    long countByStatus(String status);
}
