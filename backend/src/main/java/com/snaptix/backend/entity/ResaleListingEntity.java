package com.snaptix.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "resale_listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResaleListingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID passId;

    @Column(nullable = false)
    private UUID sellerId;

    private UUID buyerId;

    @Column(nullable = false)
    private BigDecimal listingPrice;

    @Column(nullable = false)
    private BigDecimal originalFaceValue;

    @Column(nullable = false)
    private String status; // "ACTIVE", "SOLD", "CANCELLED"

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "ACTIVE";
        }
    }
}
