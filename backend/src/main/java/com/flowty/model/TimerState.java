package com.flowty.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "timer_state")
public class TimerState {

    @Id
    private Long id = 1L;

    @Column(nullable = false)
    private int workDuration = 3600;

    @Column(nullable = false)
    private int workRemaining = 3600;

    @Column(nullable = false)
    private int breakDuration = 300;

    @Column(nullable = false)
    private int breakRemaining = 300;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TimerMode mode = TimerMode.WORK;

    @Column(nullable = false)
    private boolean running = false;

    @Column(nullable = false)
    private int completedSessions = 0;

    @Column(nullable = false)
    private Instant lastTick = Instant.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getWorkDuration() {
        return workDuration;
    }

    public void setWorkDuration(int workDuration) {
        this.workDuration = workDuration;
    }

    public int getWorkRemaining() {
        return workRemaining;
    }

    public void setWorkRemaining(int workRemaining) {
        this.workRemaining = workRemaining;
    }

    public int getBreakDuration() {
        return breakDuration;
    }

    public void setBreakDuration(int breakDuration) {
        this.breakDuration = breakDuration;
    }

    public int getBreakRemaining() {
        return breakRemaining;
    }

    public void setBreakRemaining(int breakRemaining) {
        this.breakRemaining = breakRemaining;
    }

    public TimerMode getMode() {
        return mode;
    }

    public void setMode(TimerMode mode) {
        this.mode = mode;
    }

    public boolean isRunning() {
        return running;
    }

    public void setRunning(boolean running) {
        this.running = running;
    }

    public int getCompletedSessions() {
        return completedSessions;
    }

    public void setCompletedSessions(int completedSessions) {
        this.completedSessions = completedSessions;
    }

    public Instant getLastTick() {
        return lastTick;
    }

    public void setLastTick(Instant lastTick) {
        this.lastTick = lastTick;
    }
}
