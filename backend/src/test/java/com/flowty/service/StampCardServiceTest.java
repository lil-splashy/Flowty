package com.flowty.service;

import com.flowty.model.StampCard;
import com.flowty.model.User;
import com.flowty.repository.StampCardRepository;
import com.flowty.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StampCardServiceTest {

    @Mock
    private StampCardRepository stampCardRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private StampCardService service;

    private User user(String name) {
        User u = new User();
        u.setUsername(name);
        u.setEmail(name + "@test.com");
        u.setPassword("password");
        return u;
    }

    private StampCard stampCard(User user, UUID id, boolean redeemed, int totalStamps) {
        StampCard card = new StampCard();
        card.setId(id);
        card.setUser(user);
        card.setRedeemed(redeemed);
        card.setTotalStamps(totalStamps);
        card.setSlots(List.of());
        return card;
    }

    @Test
    void getUserStampCardsLoadsCardsForUser() {
        User user = user("alice");
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));
        when(stampCardRepository.findByUserOrderByCreatedAtDesc(user))
                .thenReturn(List.of(stampCard(user, UUID.randomUUID(), false, 5)));

        var result = service.getUserStampCards("alice");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTotalStamps()).isEqualTo(5);
        assertThat(result.get(0).getSlots()).isEmpty();
    }

    @Test
    void getOrCreateActiveCardReturnsExistingWhenAvailable() {
        User user = user("alice");
        StampCard existing = stampCard(user, UUID.randomUUID(), false, 3);

        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));
        when(stampCardRepository.findFirstByUserAndRedeemedFalseOrderByCreatedAtDesc(user))
                .thenReturn(Optional.of(existing));

        var result = service.getOrCreateActiveCard("alice");

        assertThat(result.getId()).isEqualTo(existing.getId());
        assertThat(result.getTotalStamps()).isEqualTo(3);
    }

    @Test
    void addStampIncrementsCounterAndMarksSlotFilled() {
        User user = user("alice");
        StampCard card = stampCard(user, UUID.randomUUID(), false, 0);

        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(stampCardRepository.findById(card.getId())).thenReturn(Optional.of(card));
        when(stampCardRepository.save(any(StampCard.class))).thenAnswer(i -> i.getArgument(0));

        var result = service.addStamp("alice", card.getId());

        assertThat(result.getTotalStamps()).isEqualTo(1);
        assertThat(result.getSlots()).anyMatch(slot -> slot.getSlotNumber() == 1 && slot.isFilled());
        verify(stampCardRepository).save(card);
    }

    @Test
    void addStampRejectsIfCardAlreadyRedeemed() {
        User user = user("alice");
        StampCard card = stampCard(user, UUID.randomUUID(), true, 10);

        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(stampCardRepository.findById(card.getId())).thenReturn(Optional.of(card));

        assertThatThrownBy(() -> service.addStamp("alice", card.getId()))
                .hasMessageContaining("already redeemed");
    }

    @Test
    void redeemCardWorksOnlyAtFullCard() {
        User user = user("alice");
        UUID cardId = UUID.randomUUID();
        StampCard ready = stampCard(user, cardId, false, 10);
        StampCard notReady = stampCard(user, UUID.randomUUID(), false, 7);

        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(stampCardRepository.findById(cardId))
                .thenReturn(Optional.of(ready));
        when(stampCardRepository.save(any(StampCard.class))).thenAnswer(i -> i.getArgument(0));

        var redeemed = service.redeemCard("alice", cardId);

        assertThat(redeemed.isRedeemed()).isTrue();
        verify(stampCardRepository).save(ready);

        when(stampCardRepository.findById(notReady.getId())).thenReturn(Optional.of(notReady));
        assertThatThrownBy(() -> service.redeemCard("alice", notReady.getId()))
                .hasMessageContaining("not yet full");
    }

    @Test
    void addStampRejectsWhenNotOwner() {
        User owner = user("owner");
        User intruder = user("intruder");
        StampCard card = stampCard(owner, UUID.randomUUID(), false, 10);

        when(userRepository.findByUsername("intruder")).thenReturn(Optional.of(intruder));
        when(stampCardRepository.findById(card.getId())).thenReturn(Optional.of(card));

        assertThatThrownBy(() -> service.addStamp("intruder", card.getId()))
                .hasMessageContaining("Not authorized");
    }
}
