package com.snaptix.backend.controller;

import com.snaptix.backend.dto.DTOs;
import com.snaptix.backend.entity.EventEntity;
import com.snaptix.backend.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
@Tag(name = "Events", description = "Event Discovery & Approval Lifecycle Endpoints")
public class EventController {

    private final EventService eventService;

    @GetMapping
    @Operation(summary = "List published live events")
    public ResponseEntity<List<EventEntity>> getPublishedEvents() {
        return ResponseEntity.ok(eventService.getAllPublishedEvents());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single event by UUID")
    public ResponseEntity<EventEntity> getEventById(@PathVariable UUID id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @PostMapping
    @Operation(summary = "Create draft or pending event")
    public ResponseEntity<EventEntity> createEvent(@RequestBody DTOs.CreateEventRequest request) {
        // Mocked organizer ID for demonstration
        UUID mockOrganizerId = UUID.randomUUID();
        EventEntity created = eventService.createEvent(request, mockOrganizerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update event status (Submit draft or Approve/Reject)")
    public ResponseEntity<EventEntity> updateStatus(@PathVariable UUID id, @RequestBody DTOs.UpdateEventStatusRequest request) {
        EventEntity updated = eventService.updateEventStatus(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }
}
