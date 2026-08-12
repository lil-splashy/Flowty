package com.flowty.controller;

import com.flowty.dto.StampCardResponse;
import com.flowty.service.StampCardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/stamp-cards")
public class StampCardController {

    private final StampCardService stampCardService;

    public StampCardController(StampCardService stampCardService) {
        this.stampCardService = stampCardService;
    }

    @GetMapping
    public ResponseEntity<List<StampCardResponse>> getStampCards(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(stampCardService.getUserStampCards(principal.getUsername()));
    }

    @GetMapping("/active")
    public ResponseEntity<StampCardResponse> getActiveCard(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(stampCardService.getOrCreateActiveCard(principal.getUsername()));
    }

    @PostMapping("/{cardId}/stamp")
    public ResponseEntity<StampCardResponse> addStamp(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID cardId) {
        return ResponseEntity.ok(stampCardService.addStamp(principal.getUsername(), cardId));
    }

    @PostMapping("/{cardId}/redeem")
    public ResponseEntity<StampCardResponse> redeemCard(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID cardId) {
        return ResponseEntity.ok(stampCardService.redeemCard(principal.getUsername(), cardId));
    }
}
