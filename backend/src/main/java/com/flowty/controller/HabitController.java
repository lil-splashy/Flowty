package com.flowty.controller;

import com.flowty.dto.HabitRequest;
import com.flowty.dto.HabitResponse;
import com.flowty.service.HabitService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/habits")
public class HabitController {

    private final HabitService habitService;

    public HabitController(HabitService habitService) {
        this.habitService = habitService;
    }

    @GetMapping
    public ResponseEntity<List<HabitResponse>> getHabits(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(habitService.getUserHabits(principal.getUsername()));
    }

    @PostMapping
    public ResponseEntity<HabitResponse> createHabit(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody HabitRequest request) {
        return ResponseEntity.ok(habitService.createHabit(principal.getUsername(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HabitResponse> updateHabit(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @RequestBody HabitRequest request) {
        return ResponseEntity.ok(habitService.updateHabit(principal.getUsername(), id, request));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<HabitResponse> toggleComplete(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(habitService.toggleComplete(principal.getUsername(), id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteHabit(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id) {
        habitService.deleteHabit(principal.getUsername(), id);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}