package com.snaptix.backend.service;

import com.snaptix.backend.dto.DTOs;
import com.snaptix.backend.entity.EventEntity;
import com.snaptix.backend.entity.TicketTierEntity;
import com.snaptix.backend.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    public List<EventEntity> getAllPublishedEvents() {
        return eventRepository.findByStatus("published");
    }

    public EventEntity getEventById(UUID id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
    }

    @Transactional
    public EventEntity createEvent(DTOs.CreateEventRequest request, UUID organizerId) {
        EventEntity event = EventEntity.builder()
                .organizerId(organizerId)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .city(request.getCity())
                .venue(request.getVenue())
                .imageUrl(request.getImageUrl())
                .eventDate(request.getEventDate())
                .createdByPersona(request.getCreatedByPersona() != null ? request.getCreatedByPersona() : "admin")
                .status("moderator".equalsIgnoreCase(request.getCreatedByPersona()) ? "pending_approval" : "published")
                .build();

        if (request.getTiers() != null) {
            for (DTOs.CreateTierRequest tr : request.getTiers()) {
                TicketTierEntity tier = TicketTierEntity.builder()
                        .event(event)
                        .name(tr.getName())
                        .price(tr.getPrice())
                        .capacity(tr.getCapacity())
                        .ticketsSold(0)
                        .build();
                event.getTiers().add(tier);
            }
        }

        return eventRepository.save(event);
    }

    @Transactional
    public EventEntity updateEventStatus(UUID eventId, String newStatus) {
        EventEntity event = getEventById(eventId);
        event.setStatus(newStatus);
        return eventRepository.save(event);
    }
}
