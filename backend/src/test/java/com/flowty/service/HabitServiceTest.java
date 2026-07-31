package com.flowty.service;

import com.flowty.dto.HabitRequest;
import com.flowty.model.HabitItem;
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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HabitServiceTest {

    @Mock
    private ToDoListItemRepository toDoListItemRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private HabitService habitService;

    private User user(String name) {
        User u = new User();
        u.setUsername(name);
        u.setEmail(name + "@test.com");
        u.setPassword("pass");
        return u;
    }

    private HabitItem habit(User user, String title, String frequency, boolean active) {
        HabitItem h = new HabitItem();
        h.setId(1L);
        h.setUser(user);
        h.setTitle(title);
        h.setDescription("ok");
        h.setFrequency(frequency);
        h.setActive(active);
        h.setCompleted(false);
        return h;
    }

    private HabitRequest request(String name, String description, String frequency) {
        HabitRequest request = new HabitRequest();
        request.setName(name);
        request.setDescription(description);
        request.setFrequency(frequency);
        return request;
    }

    @Test
    void getUserHabitsReturnsOnlyActiveHabits() {
        User user = user("alice");
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));

        var first = habit(user, "Morning", "DAILY", true);
        var second = habit(user, "Old", "WEEKLY", false);
        when(toDoListItemRepository.findAll()).thenReturn(List.of(first, second));

        var result = habitService.getUserHabits("alice");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Morning");
    }

    @Test
    void createHabitTrimsNameAndSavesHabit() {
        User user = user("alice");
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));
        when(toDoListItemRepository.findAll()).thenReturn(List.of());
        when(toDoListItemRepository.save(any(HabitItem.class))).thenAnswer(i -> i.getArgument(0));

        var result = habitService.createHabit("alice", request("  Morning routine ", "desc", "daily"));

        assertThat(result.getName()).isEqualTo("Morning routine");
        assertThat(result.getFrequency()).isEqualTo("DAILY");
    }

    @Test
    void createHabitRejectsLongDescription() {
        User user = user("alice");
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));
        when(toDoListItemRepository.findAll()).thenReturn(List.of());
        String longText = "a".repeat(256);

        assertThatThrownBy(() -> habitService.createHabit("alice", request("Todo", longText, "WEEKLY")))
                .hasMessageContaining("255 characters");
    }

    @Test
    void createHabitRejectsInvalidFrequency() {
        User user = user("alice");
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));
        when(toDoListItemRepository.findAll()).thenReturn(List.of());

        assertThatThrownBy(() -> habitService.createHabit("alice", request("Todo", null, "yearly")))
                .hasMessageContaining("Invalid frequency");
    }

    @Test
    void createHabitRejectsDuplicateNameIfActive() {
        User user = user("alice");
        var existing = habit(user, "Morning", "DAILY", true);
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));
        when(toDoListItemRepository.findAll()).thenReturn(List.of(existing));

        assertThatThrownBy(() -> habitService.createHabit("alice", request("morning", null, "WEEKLY")))
                .hasMessageContaining("already exists");
    }

    @Test
    void updateHabitKeepsOwnershipCheck() {
        User alice = user("alice");
        User bob = user("bob");
        HabitItem habit = habit(alice, "Morning", "DAILY", true);
        when(toDoListItemRepository.findById(1L)).thenReturn(Optional.of(habit));
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(bob));

        assertThatThrownBy(() -> habitService.toggleComplete("alice", 1L))
                .hasMessageContaining("Not authorized");
    }

    @Test
    void deleteHabitSoftDeletes() {
        User alice = user("alice");
        var habit = habit(alice, "Morning", "DAILY", true);
        when(toDoListItemRepository.findById(1L)).thenReturn(Optional.of(habit));
        when(toDoListItemRepository.save(any())).thenReturn(habit);

        habitService.deleteHabit("alice", 1L);

        assertThat(habit.getActive()).isFalse();
        verify(toDoListItemRepository).save(habit);
    }
}
