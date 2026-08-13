package com.flowty.controller;

import com.flowty.dto.SpendRequest;
import com.flowty.dto.SpendResponse;
import com.flowty.model.RewardTransaction;
import com.flowty.model.User;
import com.flowty.repository.UserRepository;
import com.flowty.service.RewardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
public class RewardController {

    private final RewardService rewardService;
    private final UserRepository userRepository;

    @PostMapping("/spend")
    public ResponseEntity<SpendResponse> spend(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody SpendRequest request) {

        User user = userRepository.findByUsername(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        int previousBalance = user.getTotalPoints();
        RewardTransaction tx = rewardService.spendPoints(user, request.getPoints(), request.getItemName());
        User refreshed = userRepository.findByUsername(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(SpendResponse.builder()
                .previousBalance(previousBalance)
                .newBalance(refreshed.getTotalPoints())
                .pointsSpent(Math.abs(tx.getPoints()))
                .itemName(request.getItemName())
                .build());
    }
}