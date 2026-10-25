package com.retailnexus.repository;

import com.retailnexus.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByCode(String code);
    boolean existsByCode(String code);

    @Query("SELECT s FROM Supplier s WHERE " +
           "(:active IS NULL OR s.active = :active) AND " +
           "(:query IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(s.code) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Supplier> searchSuppliers(@Param("query") String query,
                                  @Param("active") Boolean active,
                                  Pageable pageable);

    List<Supplier> findByActiveTrue();
}
