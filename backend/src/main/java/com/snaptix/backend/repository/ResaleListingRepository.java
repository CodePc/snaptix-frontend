package com.snaptix.backend.repository;

import com.snaptix.backend.entity.ResaleListingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResaleListingRepository extends JpaRepository<ResaleListingEntity, UUID> {
    List<ResaleListingEntity> findByStatus(String status);
    List<ResaleListingEntity> findBySellerId(UUID sellerId);
}
