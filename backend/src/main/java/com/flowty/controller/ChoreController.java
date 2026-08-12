package com.flowty.controller;

import com.flowty.dto.ChoreRequest;
import com.flowty.dto.ChoreResponse;
import com.flowty.service.ChoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chores")
public class ChoreController {

    private final ChoreService choreService;

    public ChoreController(ChoreService choreService) {
        this.choreService = choreService;
    }

    @GetMapping
    public ResponseEntity<List<ChoreResponse>> getChores(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(choreService.getUserChores(principal.getUsername()));
    }

    @PostMapping
    public ResponseEntity<ChoreResponse> createChore(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody ChoreRequest request) {
        return ResponseEntity.ok(choreService.createChore(principal.getUsername(), request));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ChoreResponse> toggleComplete(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(choreService.toggleComplete(principal.getUsername(), id));
    }
}