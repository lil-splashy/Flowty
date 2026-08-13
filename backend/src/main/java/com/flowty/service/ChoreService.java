package com.flowty.service;

import com.flowty.dto.ChoreRequest;
import com.flowty.dto.ChoreResponse;
import com.flowty.model.ChoreItem;
import com.flowty.model.User;
import com.flowty.repository.ToDoListItemRepository;
import com.flowty.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChoreService {

    private final ToDoListItemRepository toDoListItemRepository;
    private final UserRepository userRepository;
    private final StampCardService stampCardService;

    public List<ChoreResponse> getUserChores(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return toDoListItemRepository.findChoreItemsByUserOrderByRollNumberAsc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ChoreResponse createChore(String username, ChoreRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChoreItem choreItem = new ChoreItem();
        choreItem.setUser(user);
        choreItem.setTitle(request.getDescription());
        choreItem.setDescription(request.getDescription());
        choreItem.setRollNumber(request.getRollNumber());
        choreItem.setCategory(request.getCategory());

        toDoListItemRepository.save(choreItem);
        return toResponse(choreItem);
    }

    @Transactional
    public ChoreResponse updateChore(String username, Long choreId, ChoreRequest request) {
        ChoreItem choreItem = findChoreItemOrThrow(choreId);

        if (!choreItem.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized");
        }

        choreItem.setTitle(request.getDescription());
        choreItem.setDescription(request.getDescription());
        choreItem.setRollNumber(request.getRollNumber());
        choreItem.setCategory(request.getCategory());

        toDoListItemRepository.save(choreItem);
        return toResponse(choreItem);
    }

    @Transactional
    public ChoreResponse toggleComplete(String username, Long choreId) {
        ChoreItem choreItem = findChoreItemOrThrow(choreId);

        if (!choreItem.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized");
        }

        choreItem.setCompleted(!choreItem.getCompleted());
        toDoListItemRepository.save(choreItem);

        if (choreItem.getCompleted()) {
            stampCardService.addStampForChoreCompletion(username, choreId);
        }

        return toResponse(choreItem);
    }

    @Transactional
    public void deleteChore(String username, Long choreId) {
        ChoreItem choreItem = findChoreItemOrThrow(choreId);

        if (!choreItem.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized");
        }

        toDoListItemRepository.delete(choreItem);
    }

    private ChoreItem findChoreItemOrThrow(Long id) {
        return toDoListItemRepository.findById(id)
                .filter(item -> item instanceof ChoreItem)
                .map(item -> (ChoreItem) item)
                .orElseThrow(() -> new RuntimeException("Chore not found"));
    }

    private ChoreResponse toResponse(ChoreItem choreItem) {
        return ChoreResponse.builder()
                .id(choreItem.getId())
                .rollNumber(choreItem.getRollNumber())
                .description(choreItem.getDescription())
                .category(choreItem.getCategory())
                .completed(choreItem.getCompleted())
                .build();
    }
}