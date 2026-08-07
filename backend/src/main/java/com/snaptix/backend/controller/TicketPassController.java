package com.snaptix.backend.controller;

import com.snaptix.backend.dto.DTOs;
import com.snaptix.backend.service.DynamicPassService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/passes")
@RequiredArgsConstructor
@Tag(name = "Dynamic Passes", description = "Anti-Scalping 15-second Rotating HMAC Pass Validation")
public class TicketPassController {

    private final DynamicPassService dynamicPassService;

    @PostMapping("/{id}/validate")
    @Operation(summary = "Validate gate scanner check-in with rotating 6-digit HMAC token")
    public ResponseEntity<DTOs.ValidatePassResponse> validatePass(
            @PathVariable UUID id,
            @RequestBody DTOs.ValidatePassRequest request) {

        boolean isValid = dynamicPassService.validateGateCheckIn(id, request.getToken());

        if (isValid) {
            return ResponseEntity.ok(DTOs.ValidatePassResponse.builder()
                    .valid(true)
                    .message("Entry granted. Ticket pass verified successfully.")
                    .passId(id)
                    .build());
        } else {
            return ResponseEntity.badRequest().body(DTOs.ValidatePassResponse.builder()
                    .valid(false)
                    .message("Invalid or expired pass token. Entry denied.")
                    .passId(id)
                    .build());
        }
    }
}
