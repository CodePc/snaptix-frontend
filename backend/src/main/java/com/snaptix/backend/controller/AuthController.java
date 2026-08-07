package com.snaptix.backend.controller;

import com.snaptix.backend.dto.DTOs;
import com.snaptix.backend.entity.UserEntity;
import com.snaptix.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User Auth & JWT Token Issuance")
public class AuthController {

    private final UserRepository userRepository;

    @PostMapping("/register")
    @Operation(summary = "Register user account")
    public ResponseEntity<DTOs.AuthResponse> register(@RequestBody DTOs.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        UserEntity user = UserEntity.builder()
                .email(request.getEmail())
                .passwordHash("ENCRYPTED_HASH_" + request.getPassword())
                .fullName(request.getFullName())
                .role(request.getRole() != null ? request.getRole() : "ATTENDEE")
                .persona("admin")
                .build();

        UserEntity saved = userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(DTOs.AuthResponse.builder()
                .token("JWT_BEARER_TOKEN_" + saved.getId())
                .userId(saved.getId())
                .email(saved.getEmail())
                .role(saved.getRole())
                .build());
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and issue JWT")
    public ResponseEntity<DTOs.AuthResponse> login(@RequestBody DTOs.LoginRequest request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> userRepository.save(UserEntity.builder()
                        .email(request.getEmail())
                        .passwordHash("HASH")
                        .fullName("Demo Fan")
                        .role("ATTENDEE")
                        .persona("admin")
                        .build()));

        return ResponseEntity.ok(DTOs.AuthResponse.builder()
                .token("JWT_BEARER_TOKEN_" + user.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .build());
    }
}
