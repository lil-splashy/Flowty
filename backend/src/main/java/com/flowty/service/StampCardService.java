package com.flowty.service;

import com.flowty.dto.RewardTransactionResponse;
import com.flowty.dto.StampCardResponse;
import com.flowty.dto.StampSlotResponse;
import com.flowty.model.*;
import com.flowty.repository.RewardTransactionRepository;
import com.flowty.repository.StampCardRepository;
import com.flowty.repository.ToDoListItemRepository;
import com.flowty.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StampCardService {

    private static final int MAX_SLOTS = 10;
    private static final int POINTS_PER_STAMP = 10;
    private static final int BONUS_POINTS_ON_REDEEM = 50;

    private final StampCardRepository stampCardRepository;
    private final UserRepository userRepository;
    private final ToDoListItemRepository toDoListItemRepository;
    private final RewardTransactionRepository rewardTransactionRepository;

    public List<StampCardResponse> getUserStampCards(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return stampCardRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<RewardTransactionResponse> getUserRewardTransactions(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                .withZone(ZoneId.systemDefault());

        return rewardTransactionRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(tx -> RewardTransactionResponse.builder()
                        .id(tx.getId())
                        .type(tx.getType().name())
                        .points(tx.getPoints())
                        .habitName(tx.getHabitName())
                        .createdAt(formatter.format(tx.getCreatedAt()))
                        .build())
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

        fillNextSlot(card, null, user);
        stampCardRepository.save(card);
        return toResponse(card);
    }

    @Transactional
    public void addStampForHabitCompletion(String username, Long habitId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        HabitItem habitItem = null;
        String habitName = "Unknown";

        if (habitId != null) {
            habitItem = toDoListItemRepository.findById(habitId)
                    .filter(item -> item instanceof HabitItem)
                    .map(item -> (HabitItem) item)
                    .orElse(null);
            if (habitItem != null) {
                habitName = habitItem.getTitle();
            }
        }

        StampCardResponse activeCard = getOrCreateActiveCard(username);
        StampCard card = stampCardRepository.findById(activeCard.getId())
                .orElseThrow(() -> new RuntimeException("Stamp card not found"));

        if (card.isRedeemed() || card.getTotalStamps() >= MAX_SLOTS) {
            StampCard newCard = createNewCard(card.getUser());
            card = newCard;
        }

        StampSlot slot = fillNextSlot(card, habitItem, user);
        stampCardRepository.save(card);

        RewardTransaction tx = RewardTransaction.builder()
                .user(user)
                .habitItem(habitItem)
                .habitName(habitName)
                .type(RewardTransaction.TransactionType.STAMP_EARNED)
                .points(POINTS_PER_STAMP)
                .stampCard(card)
                .stampSlot(slot)
                .build();
        rewardTransactionRepository.save(tx);

        user.setTotalPoints(user.getTotalPoints() + POINTS_PER_STAMP);
        userRepository.save(user);
    }

    @Transactional
    public void addStampForChoreCompletion(String username, Long choreId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String choreName = "Unknown";

        if (choreId != null) {
            ChoreItem choreItem = toDoListItemRepository.findById(choreId)
                    .filter(item -> item instanceof ChoreItem)
                    .map(item -> (ChoreItem) item)
                    .orElse(null);
            if (choreItem != null) {
                choreName = choreItem.getTitle();
            }
        }

        StampCardResponse activeCard = getOrCreateActiveCard(username);
        StampCard card = stampCardRepository.findById(activeCard.getId())
                .orElseThrow(() -> new RuntimeException("Stamp card not found"));

        if (card.isRedeemed() || card.getTotalStamps() >= MAX_SLOTS) {
            StampCard newCard = createNewCard(card.getUser());
            card = newCard;
        }

        StampSlot slot = fillNextSlot(card, null, user);
        stampCardRepository.save(card);

        RewardTransaction tx = RewardTransaction.builder()
                .user(user)
                .habitName(choreName)
                .type(RewardTransaction.TransactionType.STAMP_EARNED)
                .points(POINTS_PER_STAMP)
                .stampCard(card)
                .stampSlot(slot)
                .build();
        rewardTransactionRepository.save(tx);

        user.setTotalPoints(user.getTotalPoints() + POINTS_PER_STAMP);
        userRepository.save(user);
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

        User user = card.getUser();
        RewardTransaction tx = RewardTransaction.builder()
                .user(user)
                .type(RewardTransaction.TransactionType.CARD_REDEEMED)
                .points(BONUS_POINTS_ON_REDEEM)
                .stampCard(card)
                .build();
        rewardTransactionRepository.save(tx);

        user.setTotalPoints(user.getTotalPoints() + BONUS_POINTS_ON_REDEEM);
        userRepository.save(user);

        return toResponse(card);
    }

    private StampSlot fillNextSlot(StampCard card, HabitItem habitItem, User user) {
        int nextSlotNumber = card.getTotalStamps() + 1;
        StampSlot slot = StampSlot.builder()
                .stampCard(card)
                .slotNumber(nextSlotNumber)
                .filled(true)
                .filledAt(Instant.now())
                .habitItem(habitItem)
                .build();

        card.getSlots().add(slot);
        card.setTotalStamps(card.getTotalStamps() + 1);
        return slot;
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