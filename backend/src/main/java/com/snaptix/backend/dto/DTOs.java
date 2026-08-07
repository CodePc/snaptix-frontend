package com.snaptix.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class DTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegisterRequest {
        private String email;
        private String password;
        private String fullName;
        private String role; // "ATTENDEE", "ORGANISER"
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private String token;
        private UUID userId;
        private String email;
        private String role;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateEventRequest {
        private String title;
        private String description;
        private String category;
        private String city;
        private String venue;
        private String imageUrl;
        private LocalDateTime eventDate;
        private String createdByPersona; // "admin", "moderator"
        private List<CreateTierRequest> tiers;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateTierRequest {
        private String name;
        private BigDecimal price;
        private Integer capacity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateEventStatusRequest {
        private String status; // "draft", "pending_approval", "published", "rejected", "completed"
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateOrderRequest {
        private UUID tierId;
        private Integer quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderResponse {
        private UUID orderId;
        private BigDecimal totalAmount;
        private String paymentStatus;
        private List<TicketPassResponse> passes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TicketPassResponse {
        private UUID passId;
        private UUID tierId;
        private String passStatus;
        private String currentToken; // 6-digit rotating HMAC token
        private Integer secondsRemaining;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ValidatePassRequest {
        private String token;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ValidatePassResponse {
        private boolean valid;
        private String message;
        private UUID passId;
    }
}
