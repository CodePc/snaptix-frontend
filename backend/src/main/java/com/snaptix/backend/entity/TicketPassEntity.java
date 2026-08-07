package com.snaptix.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ticket_passes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketPassEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID orderId;

    @Column(nullable = false)
    private UUID tierId;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String passStatus; // "ACTIVE", "CHECKED_IN", "RESOLD", "CANCELLED"

    @Column(nullable = false)
    private String secretHmacKey; // Cryptographic seed for 15s rotating QR code token

    private LocalDateTime issuedAt;

    @PrePersist
    public void prePersist() {
        if (issuedAt == null) {
            issuedAt = LocalDateTime.now();
        }
        if (passStatus == null) {
            passStatus = "ACTIVE";
        }
    }
}
