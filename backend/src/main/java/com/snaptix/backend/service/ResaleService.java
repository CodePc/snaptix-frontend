package com.snaptix.backend.service;

import com.snaptix.backend.entity.ResaleListingEntity;
import com.snaptix.backend.entity.TicketPassEntity;
import com.snaptix.backend.repository.ResaleListingRepository;
import com.snaptix.backend.repository.TicketPassRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResaleService {

    private final ResaleListingRepository resaleListingRepository;
    private final TicketPassRepository ticketPassRepository;

    public List<ResaleListingEntity> getActiveResales() {
        return resaleListingRepository.findByStatus("ACTIVE");
    }

    @Transactional
    public ResaleListingEntity createResaleListing(UUID passId, UUID sellerId, BigDecimal listingPrice, BigDecimal faceValue) {
        TicketPassEntity pass = ticketPassRepository.findById(passId)
                .orElseThrow(() -> new IllegalArgumentException("Pass not found"));

        if (!pass.getUserId().equals(sellerId)) {
            throw new IllegalArgumentException("Only the pass owner can list it for resale");
        }

        // Cap face value + 10% anti-scalping rule
        BigDecimal maxAllowedPrice = faceValue.multiply(BigDecimal.valueOf(1.10));
        if (listingPrice.compareTo(maxAllowedPrice) > 0) {
            throw new IllegalArgumentException("Resale price cannot exceed 110% of original face value");
        }

        pass.setPassStatus("LISTED_FOR_RESALE");
        ticketPassRepository.save(pass);

        ResaleListingEntity listing = ResaleListingEntity.builder()
                .passId(passId)
                .sellerId(sellerId)
                .listingPrice(listingPrice)
                .originalFaceValue(faceValue)
                .status("ACTIVE")
                .build();

        return resaleListingRepository.save(listing);
    }

    @Transactional
    public void completeResalePurchase(UUID listingId, UUID buyerId) {
        ResaleListingEntity listing = resaleListingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Resale listing not found"));

        if (!"ACTIVE".equals(listing.getStatus())) {
            throw new IllegalStateException("Resale listing is no longer active");
        }

        TicketPassEntity oldPass = ticketPassRepository.findById(listing.getPassId())
                .orElseThrow(() -> new IllegalArgumentException("Associated ticket pass not found"));

        // Invalidate old pass
        oldPass.setPassStatus("RESOLD");
        ticketPassRepository.save(oldPass);

        // Re-issue new dynamic pass with fresh secret HMAC key to new buyer
        TicketPassEntity newPass = TicketPassEntity.builder()
                .orderId(oldPass.getOrderId())
                .tierId(oldPass.getTierId())
                .userId(buyerId)
                .passStatus("ACTIVE")
                .secretHmacKey(UUID.randomUUID().toString().replace("-", ""))
                .build();

        ticketPassRepository.save(newPass);

        listing.setBuyerId(buyerId);
        listing.setStatus("SOLD");
        resaleListingRepository.save(listing);
    }
}
