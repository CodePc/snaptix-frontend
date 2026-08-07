package com.snaptix.backend.repository;

import com.snaptix.backend.entity.TicketTierEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketTierRepository extends JpaRepository<TicketTierEntity, UUID> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<TicketTierEntity> findById(UUID id);
}
