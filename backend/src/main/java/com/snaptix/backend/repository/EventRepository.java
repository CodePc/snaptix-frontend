package com.snaptix.backend.repository;

import com.snaptix.backend.entity.EventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<EventEntity, UUID> {
    List<EventEntity> findByStatus(String status);
    List<EventEntity> findByCategoryAndStatus(String category, String status);
    List<EventEntity> findByCityAndStatus(String city, String status);
}
