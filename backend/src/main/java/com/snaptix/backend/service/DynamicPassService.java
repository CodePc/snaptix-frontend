package com.snaptix.backend.service;

import com.snaptix.backend.entity.TicketPassEntity;
import com.snaptix.backend.repository.TicketPassRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DynamicPassService {

    private final TicketPassRepository ticketPassRepository;
    private static final int TIME_STEP_SECONDS = 15;

    /**
     * Generates a 6-digit rotating HMAC token for the current 15-second window
     */
    public String generateCurrentToken(String secretKey, UUID passId) {
        long timeBucket = System.currentTimeMillis() / (TIME_STEP_SECONDS * 1000L);
        return calculateHmacToken(secretKey, passId.toString(), timeBucket);
    }

    /**
     * Calculates remaining seconds in the current 15s window
     */
    public int getSecondsRemaining() {
        long currentMs = System.currentTimeMillis();
        long stepMs = TIME_STEP_SECONDS * 1000L;
        return (int) ((stepMs - (currentMs % stepMs)) / 1000L);
    }

    /**
     * Validates scanned token against current, previous, and next time windows (anti-scalping)
     */
    public boolean validateGateCheckIn(UUID passId, String tokenToValidate) {
        TicketPassEntity pass = ticketPassRepository.findById(passId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket Pass not found"));

        if (!"ACTIVE".equals(pass.getPassStatus())) {
            return false;
        }

        long currentBucket = System.currentTimeMillis() / (TIME_STEP_SECONDS * 1000L);

        // Check current bucket, previous bucket (clock drift), and next bucket
        for (long window = currentBucket - 1; window <= currentBucket + 1; window++) {
            String expectedToken = calculateHmacToken(pass.getSecretHmacKey(), passId.toString(), window);
            if (expectedToken.equals(tokenToValidate)) {
                // Mark as checked in
                pass.setPassStatus("CHECKED_IN");
                ticketPassRepository.save(pass);
                return true;
            }
        }

        return false;
    }

    private String calculateHmacToken(String secret, String passId, long timeBucket) {
        try {
            String payload = passId + ":" + timeBucket;
            Mac sha256HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256HMAC.init(secretKey);
            byte[] hmacBytes = sha256HMAC.doFinal(payload.getBytes(StandardCharsets.UTF_8));

            // Dynamic truncation to 6 digits
            int offset = hmacBytes[hmacBytes.length - 1] & 0x0F;
            int binary = ((hmacBytes[offset] & 0x7F) << 24)
                       | ((hmacBytes[offset + 1] & 0xFF) << 16)
                       | ((hmacBytes[offset + 2] & 0xFF) << 8)
                       | (hmacBytes[offset + 3] & 0xFF);

            int otp = binary % 1000000;
            return String.format("%06d", otp);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error computing HMAC token", e);
        }
    }
}
