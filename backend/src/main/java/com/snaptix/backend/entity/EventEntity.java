package com.snaptix.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID organizerId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String venue;

    private String imageUrl;

    @Column(nullable = false)
    private String status; // "draft", "pending_approval", "published", "rejected", "completed"

    @Column(nullable = false)
    private String createdByPersona; // "admin", "moderator"

    @Column(nullable = false)
    private LocalDateTime eventDate;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TicketTierEntity> tiers = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "draft";
        }
        if (createdByPersona == null) {
            createdByPersona = "admin";
        }
    }
}
