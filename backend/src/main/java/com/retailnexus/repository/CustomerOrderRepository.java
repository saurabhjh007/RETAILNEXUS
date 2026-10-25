package com.retailnexus.repository;

import com.retailnexus.entity.CustomerOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    Optional<CustomerOrder> findByOrderNumber(String orderNumber);
    boolean existsByOrderNumber(String orderNumber);

    @Query("SELECT co FROM CustomerOrder co WHERE " +
           "(:warehouseId IS NULL OR co.warehouse.id = :warehouseId) AND " +
           "(:status IS NULL OR co.status = :status) AND " +
           "(:query IS NULL OR LOWER(co.orderNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(co.customerName) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<CustomerOrder> searchOrders(@Param("query") String query,
                                     @Param("warehouseId") Long warehouseId,
                                     @Param("status") String status,
                                     Pageable pageable);

    List<CustomerOrder> findTop10ByOrderByOrderDateDesc();

    long countByStatus(String status);
}
