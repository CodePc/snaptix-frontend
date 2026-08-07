package com.snaptix.backend.controller;

import com.snaptix.backend.dto.DTOs;
import com.snaptix.backend.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Ticket Purchase & Dynamic Pass Issuance")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Purchase tickets & issue anti-scalping passes")
    public ResponseEntity<DTOs.OrderResponse> createOrder(@RequestBody DTOs.CreateOrderRequest request) {
        UUID mockUserId = UUID.randomUUID();
        DTOs.OrderResponse response = orderService.createOrder(request, mockUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
