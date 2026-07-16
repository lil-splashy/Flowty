package com.flowty.service;

import com.flowty.dto.ChoreRequest;
import com.flowty.model.ChoreItem;
import com.flowty.model.User;
import com.flowty.repository.ToDoListItemRepository;
import com.flowty.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChoreServiceTest {

    @Mock
    private ToDoListItemRepository toDoListItemRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ChoreService choreService;

    private ChoreItem createChoreItem(User user, int rollNumber, String description, String category) {
        ChoreItem item = new ChoreItem();
        item.setId(1L);
        item.setUser(user);
        item.setTitle(description);
        item.setDescription(description);
        item.setRollNumber(rollNumber);
        item.setCategory(category);
        return item;
    }

    @Test
    void getUserChoresReturnsChoresForUser() {
        User user = User.builder().username("test").email("t@t.com").password("x").build();
        when(userRepository.findByUsername("test")).thenReturn(Optional.of(user));
        ChoreItem choreItem = createChoreItem(user, 1, "Test chore", "CHORE");
        when(toDoListItemRepository.findChoreItemsByUserOrderByRollNumberAsc(user)).thenReturn(List.of(choreItem));

        var result = choreService.getUserChores("test");

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getDescription()).isEqualTo("Test chore");
    }

    @Test
    void toggleCompleteFlipsCompletedFlag() {
        User user = User.builder().username("test").email("t@t.com").password("x").build();
        ChoreItem choreItem = createChoreItem(user, 1, "Test", "CHORE");
        when(toDoListItemRepository.findById(1L)).thenReturn(Optional.of(choreItem));
        when(toDoListItemRepository.save(any())).thenReturn(choreItem);

        var result = choreService.toggleComplete("test", 1L);

        assertThat(result.getCompleted()).isTrue();
    }
}