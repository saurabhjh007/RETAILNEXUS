package com.retailnexus.repository;

import com.retailnexus.entity.AgileSprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgileSprintRepository extends JpaRepository<AgileSprint, Integer> {
    List<AgileSprint> findAllByOrderBySprintNumberAsc();
}
