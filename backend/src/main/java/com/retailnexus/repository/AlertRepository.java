package com.retailnexus.repository;

import com.retailnexus.entity.Alert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    @Query("SELECT a FROM Alert a WHERE " +
           "(:acknowledged IS NULL OR a.acknowledged = :acknowledged) AND " +
           "(:severity IS NULL OR a.severity = :severity) AND " +
           "(:alertType IS NULL OR a.alertType = :alertType)")
    Page<Alert> searchAlerts(@Param("acknowledged") Boolean acknowledged,
                             @Param("severity") String severity,
                             @Param("alertType") String alertType,
                             Pageable pageable);

    List<Alert> findByAcknowledgedFalseOrderByCreatedAtDesc();

    long countByAcknowledgedFalse();
}
