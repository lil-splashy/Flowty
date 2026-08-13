package com.flowty.service;

import com.flowty.dto.HabitRequest;
import com.flowty.dto.HabitResponse;
import com.flowty.model.HabitItem;
import com.flowty.model.User;
import com.flowty.repository.ToDoListItemRepository;
import com.flowty.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class HabitService {

    private static final Set<String> VALID_FREQUENCIES = Set.of("DAILY", "WEEKLY", "CUSTOM");
    private static final int MAX_NAME_LENGTH = 100;
    private static final int MAX_DESCRIPTION_LENGTH = 255;

    private final ToDoListItemRepository toDoListItemRepository;
    private final UserRepository userRepository;
    private final StampCardService stampCardService;

    public List<HabitResponse> getUserHabits(String username) {
        User user = findUser(username);
        return toDoListItemRepository.findAll().stream()
                .filter(item -> item instanceof HabitItem && item.getUser().equals(user))
                .map(item -> (HabitItem) item)
                .filter(h -> Boolean.TRUE.equals(h.getActive()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public HabitResponse createHabit(String username, HabitRequest request) {
        User user = findUser(username);

        String name = validateName(request.getName());
        String frequency = validateFrequency(request.getFrequency());
        validateDescription(request.getDescription());

        if (nameAlreadyUsed(user, name, null)) {
            throw new RuntimeException("A habit with this name already exists");
        }

        HabitItem habit = new HabitItem();
        habit.setUser(user);
        habit.setTitle(name);
        habit.setDescription(request.getDescription());
        habit.setFrequency(frequency);
        habit.setActive(true);
        habit.setCompleted(false);
        habit.setCurrentStreak(0);
        habit.setLongestStreak(0);

        toDoListItemRepository.save(habit);
        return toResponse(habit);
    }

    @Transactional
    public HabitResponse updateHabit(String username, Long id, HabitRequest request) {
        HabitItem habit = findHabit(id, username);

        String name = validateName(request.getName());
        String frequency = validateFrequency(request.getFrequency());
        validateDescription(request.getDescription());

        if (nameAlreadyUsed(habit.getUser(), name, habit.getId())) {
            throw new RuntimeException("A habit with this name already exists");
        }

        habit.setTitle(name);
        habit.setDescription(request.getDescription());
        habit.setFrequency(frequency);

        toDoListItemRepository.save(habit);
        return toResponse(habit);
    }

    @Transactional
    public HabitResponse toggleComplete(String username, Long id) {
        HabitItem habit = findHabit(id, username);

        if (Boolean.TRUE.equals(habit.getCompleted())) {
            habit.setCompleted(false);
            toDoListItemRepository.save(habit);
            return toResponse(habit);
        }

        habit.setCompleted(true);
        updateStreak(habit);
        toDoListItemRepository.save(habit);

        stampCardService.addStampForHabitCompletion(username, habit.getId());

        return toResponse(habit);
    }

    private void updateStreak(HabitItem habit) {
        LocalDate today = LocalDate.now();
        LocalDate lastCompleted = habit.getLastCompletedDate();

        if (lastCompleted == null) {
            habit.setCurrentStreak(1);
        } else if ("DAILY".equalsIgnoreCase(habit.getFrequency())) {
            if (lastCompleted.equals(today.minusDays(1))) {
                habit.setCurrentStreak(habit.getCurrentStreak() + 1);
            } else if (!lastCompleted.equals(today)) {
                habit.setCurrentStreak(1);
            }
        } else if ("WEEKLY".equalsIgnoreCase(habit.getFrequency())) {
            if (!lastCompleted.isBefore(today.minusDays(7)) && !lastCompleted.equals(today)) {
                habit.setCurrentStreak(habit.getCurrentStreak() + 1);
            } else if (!lastCompleted.equals(today)) {
                habit.setCurrentStreak(1);
            }
        } else {
            habit.setCurrentStreak(habit.getCurrentStreak() + 1);
        }

        if (habit.getCurrentStreak() > habit.getLongestStreak()) {
            habit.setLongestStreak(habit.getCurrentStreak());
        }

        habit.setLastCompletedDate(today);
    }

    /**
     * Soft delete. Sets active = false rather than removing the record so that
     * completion history, progress records, and earned rewards are preserved.
     */
    @Transactional
    public void deleteHabit(String username, Long id) {
        HabitItem habit = findHabit(id, username);
        habit.setActive(false);
        toDoListItemRepository.save(habit);
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private HabitItem findHabit(Long id, String username) {
        HabitItem habit = toDoListItemRepository.findById(id)
                .filter(item -> item instanceof HabitItem)
                .map(item -> (HabitItem) item)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        if (!habit.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized");
        }
        return habit;
    }

    private String validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new RuntimeException("Habit name is required");
        }
        String trimmed = name.trim();
        if (trimmed.length() > MAX_NAME_LENGTH) {
            throw new RuntimeException("Habit name must be 100 characters or fewer");
        }
        return trimmed;
    }

    private String validateFrequency(String frequency) {
        if (frequency == null || frequency.isBlank()) {
            throw new RuntimeException("Habit frequency is required");
        }
        String upper = frequency.trim().toUpperCase();
        if (!VALID_FREQUENCIES.contains(upper)) {
            throw new RuntimeException("Invalid frequency. Must be DAILY, WEEKLY, or CUSTOM");
        }
        return upper;
    }

    private void validateDescription(String description) {
        if (description != null && description.length() > MAX_DESCRIPTION_LENGTH) {
            throw new RuntimeException("Habit description must be 255 characters or fewer");
        }
    }

    private boolean nameAlreadyUsed(User user, String name, Long excludeId) {
        return toDoListItemRepository.findAll().stream()
                .filter(item -> item instanceof HabitItem)
                .map(item -> (HabitItem) item)
                .filter(h -> h.getUser().equals(user))
                .filter(h -> Boolean.TRUE.equals(h.getActive()))
                .filter(h -> excludeId == null || !h.getId().equals(excludeId))
                .anyMatch(h -> h.getTitle().equalsIgnoreCase(name));
    }

    private HabitResponse toResponse(HabitItem habit) {
        return HabitResponse.builder()
                .id(habit.getId())
                .name(habit.getTitle())
                .description(habit.getDescription())
                .frequency(habit.getFrequency())
                .completed(habit.getCompleted())
                .currentStreak(habit.getCurrentStreak())
                .longestStreak(habit.getLongestStreak())
                .build();
    }
}