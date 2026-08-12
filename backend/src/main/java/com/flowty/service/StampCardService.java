package com.flowty.service;

import com.flowty.dto.StampCardResponse;
import com.flowty.dto.StampSlotResponse;
import com.flowty.model.StampCard;
import com.flowty.model.StampSlot;
import com.flowty.model.User;
import com.flowty.repository.StampCardRepository;
import com.flowty.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StampCardService {

    private static final int MAX_SLOTS = 10;

    private final StampCardRepository stampCardRepository;
    private final UserRepository userRepository;

    public List<StampCardResponse> getUserStampCards(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return stampCardRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public StampCardResponse getOrCreateActiveCard(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        StampCard card = stampCardRepository
                .findFirstByUserAndRedeemedFalseOrderByCreatedAtDesc(user)
                .orElseGet(() -> createNewCard(user));

        return toResponse(card);
    }

    @Transactional
    public StampCardResponse addStamp(String username, UUID cardId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        StampCard card = stampCardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Stamp card not found"));

        if (!card.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized");
        }

        if (card.isRedeemed()) {
            throw new RuntimeException("Card already redeemed");
        }

        if (card.getTotalStamps() >= MAX_SLOTS) {
            throw new RuntimeException("Card already full");
        }

        int nextSlotNumber = card.getTotalStamps() + 1;
        StampSlot slot = card.getSlots().stream()
                .filter(s -> s.getSlotNumber() == nextSlotNumber)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Slot " + nextSlotNumber + " not found"));

        slot.setFilled(true);
        slot.setFilledAt(Instant.now());

        card.setTotalStamps(card.getTotalStamps() + 1);
        
        stampCardRepository.save(card);
        return toResponse(card);
    }

    @Transactional
    public StampCardResponse redeemCard(String username, UUID cardId) {
        StampCard card = stampCardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Stamp card not found"));

        if (!card.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized");
        }

        if (card.isRedeemed()) {
            throw new RuntimeException("Card already redeemed");
        }

        if (card.getTotalStamps() < MAX_SLOTS) {
            throw new RuntimeException("Card not yet full");
        }

        card.setRedeemed(true);
        stampCardRepository.save(card);
        return toResponse(card);
    }

    private StampCard createNewCard(User user) {
        StampCard card = StampCard.builder()
                .user(user)
                .build();

        for (int i = 1; i <= MAX_SLOTS; i++) {
            StampSlot slot = StampSlot.builder()
                    .stampCard(card)
                    .slotNumber(i)
                    .filled(false)
                    .build();
            card.getSlots().add(slot);
        }

        return stampCardRepository.save(card);
    }

    private StampCardResponse toResponse(StampCard card) {
        List<StampSlotResponse> slotResponses = card.getSlots().stream()
                .sorted(Comparator.comparingInt(StampSlot::getSlotNumber))
                .map(slot -> StampSlotResponse.builder()
                        .slotNumber(slot.getSlotNumber())
                        .filled(slot.isFilled())
                        .build())
                .toList();

        return StampCardResponse.builder()
                .id(card.getId())
                .totalStamps(card.getTotalStamps())
                .redeemed(card.isRedeemed())
                .slots(slotResponses)
                .build();
    }
}
