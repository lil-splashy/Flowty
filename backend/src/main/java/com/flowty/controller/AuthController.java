package com.flowty.controller;

import com.flowty.dto.AuthResponse;
import com.flowty.dto.LoginRequest;
import com.flowty.dto.SignUpRequest;
import com.flowty.dto.WidgetPlacementsRequest;
import com.flowty.model.WidgetPlacement;
import com.flowty.service.AuthService;
import com.flowty.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserProfileService userProfileService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignUpRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentUser(authentication.getName()));
    }

    @GetMapping("/me/widget-placements")
    public ResponseEntity<List<WidgetPlacement>> getWidgetPlacements(Authentication authentication) {
        return ResponseEntity.ok(userProfileService.getWidgetPlacements(authentication.getName()));
    }

    @PutMapping("/me/widget-placements")
    public ResponseEntity<List<WidgetPlacement>> updateWidgetPlacements(
            Authentication authentication,
            @Valid @RequestBody WidgetPlacementsRequest request) {
        return ResponseEntity.ok(userProfileService.saveWidgetPlacements(authentication.getName(), request));
    }
}
