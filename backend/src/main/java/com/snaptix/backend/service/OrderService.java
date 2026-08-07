package com.snaptix.backend.service;

import com.snaptix.backend.dto.DTOs;
import com.snaptix.backend.entity.OrderEntity;
import com.snaptix.backend.entity.TicketPassEntity;
import com.snaptix.backend.entity.TicketTierEntity;
import com.snaptix.backend.repository.OrderRepository;
import com.snaptix.backend.repository.TicketPassRepository;
import com.snaptix.backend.repository.TicketTierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final TicketTierRepository ticketTierRepository;
    private final TicketPassRepository ticketPassRepository;
    private final DynamicPassService dynamicPassService;

    @Transactional
    public DTOs.OrderResponse createOrder(DTOs.CreateOrderRequest request, UUID userId) {
        TicketTierEntity tier = ticketTierRepository.findById(request.getTierId())
                .orElseThrow(() -> new IllegalArgumentException("Ticket Tier not found"));

        if (tier.getTicketsSold() + request.getQuantity() > tier.getCapacity()) {
            throw new IllegalStateException("Insufficient ticket capacity available");
        }

        // Increment capacity with row locking
        tier.setTicketsSold(tier.getTicketsSold() + request.getQuantity());
        ticketTierRepository.save(tier);

        BigDecimal total = tier.getPrice().multiply(BigDecimal.valueOf(request.getQuantity()));

        OrderEntity order = OrderEntity.builder()
                .userId(userId)
                .totalAmount(total)
                .paymentStatus("COMPLETED")
                .transactionRef("TXN_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .build();

        OrderEntity savedOrder = orderRepository.save(order);

        List<DTOs.TicketPassResponse> passResponses = new ArrayList<>();

        for (int i = 0; i < request.getQuantity(); i++) {
            String secretKey = UUID.randomUUID().toString().replace("-", "");

            TicketPassEntity pass = TicketPassEntity.builder()
                    .orderId(savedOrder.getId())
                    .tierId(tier.getId())
                    .userId(userId)
                    .passStatus("ACTIVE")
                    .secretHmacKey(secretKey)
                    .build();

            TicketPassEntity savedPass = ticketPassRepository.save(pass);

            String currentToken = dynamicPassService.generateCurrentToken(secretKey, savedPass.getId());
            int secondsRemaining = dynamicPassService.getSecondsRemaining();

            passResponses.add(DTOs.TicketPassResponse.builder()
                    .passId(savedPass.getId())
                    .tierId(tier.getId())
                    .passStatus(savedPass.getPassStatus())
                    .currentToken(currentToken)
                    .secondsRemaining(secondsRemaining)
                    .build());
        }

        return DTOs.OrderResponse.builder()
                .orderId(savedOrder.getId())
                .totalAmount(total)
                .paymentStatus(savedOrder.getPaymentStatus())
                .passes(passResponses)
                .build();
    }
}
