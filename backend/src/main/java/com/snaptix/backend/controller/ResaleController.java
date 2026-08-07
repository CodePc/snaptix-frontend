package com.snaptix.backend.controller;

import com.snaptix.backend.entity.ResaleListingEntity;
import com.snaptix.backend.service.ResaleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/resale")
@RequiredArgsConstructor
@Tag(name = "Resale Market", description = "Capped Face-Value Secondary Market")
public class ResaleController {

    private final ResaleService resaleService;

    @GetMapping
    @Operation(summary = "List active resale tickets")
    public ResponseEntity<List<ResaleListingEntity>> getActiveResales() {
        return ResponseEntity.ok(resaleService.getActiveResales());
    }

    @PostMapping("/list")
    @Operation(summary = "List unused pass for resale (Capped at Face Value + 10%)")
    public ResponseEntity<ResaleListingEntity> listTicket(
            @RequestParam UUID passId,
            @RequestParam BigDecimal listingPrice,
            @RequestParam BigDecimal originalFaceValue) {
        UUID mockSellerId = UUID.randomUUID();
        ResaleListingEntity listing = resaleService.createResaleListing(passId, mockSellerId, listingPrice, originalFaceValue);
        return ResponseEntity.status(HttpStatus.CREATED).body(listing);
    }

    @PostMapping("/{id}/buy")
    @Operation(summary = "Buy resale ticket (Transfers pass & re-issues HMAC seed)")
    public ResponseEntity<String> buyResaleTicket(@PathVariable UUID id) {
        UUID mockBuyerId = UUID.randomUUID();
        resaleService.completeResalePurchase(id, mockBuyerId);
        return ResponseEntity.ok("Resale purchase completed. New ticket pass issued to buyer.");
    }
}
