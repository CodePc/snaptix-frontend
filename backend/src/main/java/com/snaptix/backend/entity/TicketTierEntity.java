package com.snaptix.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "ticket_tiers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketTierEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnore
    private EventEntity event;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private Integer ticketsSold;

    @PrePersist
    public void prePersist() {
        if (ticketsSold == null) {
            ticketsSold = 0;
        }
        if (price == null) {
            price = BigDecimal.ZERO;
        }
    }
}
