package com.flowty.dto;

import com.flowty.model.TimerMode;
import com.flowty.model.TimerState;

public class TimerStateDto {

    private int workDuration;
    private int workRemaining;
    private int breakDuration;
    private int breakRemaining;
    private TimerMode mode;
    private boolean running;
    private int completedSessions;
    private String timerDisplay;
    private double progress;
    private boolean isBreak;

    public static TimerStateDto from(TimerState state) {
        TimerStateDto dto = new TimerStateDto();
        dto.workDuration = state.getWorkDuration();
        dto.workRemaining = state.getWorkRemaining();
        dto.breakDuration = state.getBreakDuration();
        dto.breakRemaining = state.getBreakRemaining();
        dto.mode = state.getMode();
        dto.running = state.isRunning();
        dto.completedSessions = state.getCompletedSessions();
        dto.isBreak = state.getMode() == TimerMode.BREAK;

        int remaining = dto.isBreak ? state.getBreakRemaining() : state.getWorkRemaining();
        int total = dto.isBreak ? state.getBreakDuration() : state.getWorkDuration();

        int mins = remaining / 60;
        int secs = remaining % 60;
        dto.timerDisplay = String.format("%02d:%02d", mins, secs);

        dto.progress = total > 0 ? (double) remaining / (double) total : 0.0;

        return dto;
    }

    public int getWorkDuration() {
        return workDuration;
    }

    public int getWorkRemaining() {
        return workRemaining;
    }

    public int getBreakDuration() {
        return breakDuration;
    }

    public int getBreakRemaining() {
        return breakRemaining;
    }

    public TimerMode getMode() {
        return mode;
    }

    public boolean isRunning() {
        return running;
    }

    public int getCompletedSessions() {
        return completedSessions;
    }

    public String getTimerDisplay() {
        return timerDisplay;
    }

    public double getProgress() {
        return progress;
    }

    public boolean isBreak() {
        return isBreak;
    }
}
