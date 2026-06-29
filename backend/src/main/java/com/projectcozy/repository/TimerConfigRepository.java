package com.projectcozy.repository;

import com.projectcozy.model.TimerConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TimerConfigRepository extends JpaRepository<TimerConfig, Long> {
    Optional<TimerConfig> findByUserId(Long userId);
}
