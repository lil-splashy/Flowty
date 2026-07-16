package com.flowty.service;

import com.flowty.dto.ChoreRequest;
import com.flowty.dto.ChoreResponse;
import com.flowty.model.Chore;
import com.flowty.model.User;
import com.flowty.model.enums.ChoreCategory;
import com.flowty.repository.ChoreRepository;
import com.flowty.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChoreService {

    private final ChoreRepository choreRepository;
    private final UserRepository userRepository;

    public List<ChoreResponse> getUserChores(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return choreRepository.findByUserOrderByRollNumberAsc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ChoreResponse createChore(String username, ChoreRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChoreCategory category;
        try {
            category = ChoreCategory.valueOf(request.getCategory().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid category. Must be CHORE, STUDY, or LEGENDARY");
        }

        Chore chore = Chore.builder()
                .user(user)
                .rollNumber(request.getRollNumber())
                .description(request.getDescription())
                .category(category)
                .build();

        choreRepository.save(chore);
        return toResponse(chore);
    }

    @Transactional
    public ChoreResponse updateChore(String username, UUID choreId, ChoreRequest request) {
        Chore chore = choreRepository.findById(choreId)
                .orElseThrow(() -> new RuntimeException("Chore not found"));

        if (!chore.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized");
        }

        ChoreCategory category;
        try {
            category = ChoreCategory.valueOf(request.getCategory().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid category");
        }

        chore.setRollNumber(request.getRollNumber());
        chore.setDescription(request.getDescription());
        chore.setCategory(category);

        choreRepository.save(chore);
        return toResponse(chore);
    }

    @Transactional
    public ChoreResponse toggleComplete(String username, UUID choreId) {
        Chore chore = choreRepository.findById(choreId)
                .orElseThrow(() -> new RuntimeException("Chore not found"));

        if (!chore.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized");
        }

        chore.setCompleted(!chore.isCompleted());
        choreRepository.save(chore);
        return toResponse(chore);
    }

    @Transactional
    public void deleteChore(String username, UUID choreId) {
        Chore chore = choreRepository.findById(choreId)
                .orElseThrow(() -> new RuntimeException("Chore not found"));

        if (!chore.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized");
        }

        choreRepository.delete(chore);
    }

    private ChoreResponse toResponse(Chore chore) {
        return ChoreResponse.builder()
                .id(chore.getId())
                .rollNumber(chore.getRollNumber())
                .description(chore.getDescription())
                .category(chore.getCategory().name())
                .completed(chore.isCompleted())
                .build();
    }
}