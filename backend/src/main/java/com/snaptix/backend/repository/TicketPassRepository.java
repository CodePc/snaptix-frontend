package com.snaptix.backend.repository;

import com.snaptix.backend.entity.TicketPassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TicketPassRepository extends JpaRepository<TicketPassEntity, UUID> {
    List<TicketPassEntity> findByUserIdAndPassStatus(UUID userId, String passStatus);
    List<TicketPassEntity> findByOrderId(UUID orderId);
}
