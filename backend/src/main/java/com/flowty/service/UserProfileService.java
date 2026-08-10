package com.flowty.service;

import com.flowty.dto.WidgetPlacementsRequest;
import com.flowty.model.User;
import com.flowty.model.WidgetPlacement;
import com.flowty.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<WidgetPlacement> getWidgetPlacements(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getWidgetPlacements();
    }

    @Transactional
    public List<WidgetPlacement> saveWidgetPlacements(String username, WidgetPlacementsRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setWidgetPlacements(request.getPlacements());
        userRepository.save(user);
        return user.getWidgetPlacements();
    }
}
