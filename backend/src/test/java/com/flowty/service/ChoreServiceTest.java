package com.flowty.service;

import com.flowty.dto.ChoreRequest;
import com.flowty.model.Chore;
import com.flowty.model.User;
import com.flowty.model.enums.ChoreCategory;
import com.flowty.repository.ChoreRepository;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChoreServiceTest {

    @Mock
    private ChoreRepository choreRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ChoreService choreService;

    @Test
    void getUserChoresReturnsChoresForUser() {
        User user = User.builder().username("test").email("t@t.com").password("x").build();
        when(userRepository.findByUsername("test")).thenReturn(Optional.of(user));
        Chore chore = Chore.builder().user(user).rollNumber(1).description("Test chore").category(ChoreCategory.CHORE).build();
        when(choreRepository.findByUserOrderByRollNumberAsc(user)).thenReturn(List.of(chore));

        var result = choreService.getUserChores("test");

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getDescription()).isEqualTo("Test chore");
    }

    @Test
    void toggleCompleteFlipsCompletedFlag() {
        User user = User.builder().username("test").email("t@t.com").password("x").build();
        UUID choreId = UUID.randomUUID();
        Chore chore = Chore.builder().id(choreId).user(user).rollNumber(1).description("Test").category(ChoreCategory.CHORE).completed(false).build();
        when(choreRepository.findById(choreId)).thenReturn(Optional.of(chore));
        when(choreRepository.save(any())).thenReturn(chore);

        var result = choreService.toggleComplete("test", choreId);

        assertThat(result.isCompleted()).isTrue();
    }
}