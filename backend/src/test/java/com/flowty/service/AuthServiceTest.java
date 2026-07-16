package com.flowty.service;

import com.flowty.dto.LoginRequest;
import com.flowty.dto.SignUpRequest;
import com.flowty.model.User;
import com.flowty.repository.UserRepository;
import com.flowty.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        lenient().when(passwordEncoder.encode(any())).thenReturn("hashed");
    }

    @Test
    void signupCreatesUserAndReturnsToken() {
        SignUpRequest req = new SignUpRequest("testuser", "test@test.com", "password");
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@test.com")).thenReturn(false);
        when(jwtTokenProvider.generateToken("testuser")).thenReturn("jwt-token");

        var resp = authService.signup(req);

        assertThat(resp.getToken()).isEqualTo("jwt-token");
        assertThat(resp.getUsername()).isEqualTo("testuser");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void signupRejectsDuplicateUsername() {
        SignUpRequest req = new SignUpRequest("testuser", "test@test.com", "password");
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(req))
                .hasMessageContaining("already taken");
    }

    @Test
    void loginReturnsTokenOnSuccess() {
        LoginRequest req = new LoginRequest("testuser", "password");
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("testuser");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtTokenProvider.generateToken("testuser")).thenReturn("jwt-token");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(
                User.builder().username("testuser").email("test@test.com").password("hashed").build()));

        var resp = authService.login(req);

        assertThat(resp.getToken()).isEqualTo("jwt-token");
        assertThat(resp.getUsername()).isEqualTo("testuser");
    }
}