package com.flowty.repository;

import com.flowty.model.TimerState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TimerStateRepository extends JpaRepository<TimerState, Long> {
}
