package com.projectcozy.repository;

import com.projectcozy.model.PomodoroSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PomodoroSessionRepository extends JpaRepository<PomodoroSession, Long> {
    List<PomodoroSession> findByUserIdOrderByStartTimeDesc(Long userId);
}
