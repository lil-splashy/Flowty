package com.flowty.service;

import com.flowty.model.TimerMode;
import com.flowty.model.TimerState;
import com.flowty.repository.TimerStateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class TimerService {

    private final TimerStateRepository timerStateRepository;

    public TimerState getState() {
        return timerStateRepository.findById(1L)
                .orElseGet(() -> {
                    TimerState state = new TimerState();
                    return timerStateRepository.save(state);
                });
    }

    @Transactional
    public void start() {
        TimerState state = getState();
        tick(state);
        state.setRunning(true);
        state.setLastTick(Instant.now());
        timerStateRepository.save(state);
    }

    @Transactional
    public void pause() {
        TimerState state = getState();
        tick(state);
        state.setRunning(false);
        timerStateRepository.save(state);
    }

    @Transactional
    public void reset() {
        TimerState state = getState();
        state.setRunning(false);
        state.setMode(TimerMode.WORK);
        state.setWorkRemaining(state.getWorkDuration());
        state.setBreakRemaining(state.getBreakDuration());
        state.setLastTick(Instant.now());
        timerStateRepository.save(state);
    }

    @Transactional
    public void clearSessions() {
        TimerState state = getState();
        state.setCompletedSessions(0);
        timerStateRepository.save(state);
    }

    @Transactional
    public void editDuration(int seconds) {
        TimerState state = getState();
        state.setWorkDuration(seconds);
        state.setWorkRemaining(seconds);
        state.setRunning(false);
        state.setMode(TimerMode.WORK);
        state.setLastTick(Instant.now());
        timerStateRepository.save(state);
    }

    private void tick(TimerState state) {
        if (!state.isRunning()) {
            return;
        }

        Instant now = Instant.now();
        long elapsed = now.getEpochSecond() - state.getLastTick().getEpochSecond();

        if (elapsed <= 0) {
            return;
        }

        int remaining = state.getMode() == TimerMode.BREAK
                ? state.getBreakRemaining()
                : state.getWorkRemaining();

        remaining -= (int) elapsed;

        if (remaining <= 0) {
            if (state.getMode() == TimerMode.WORK) {
                state.setCompletedSessions(state.getCompletedSessions() + 1);
                state.setMode(TimerMode.BREAK);
                state.setBreakRemaining(state.getBreakDuration());
                state.setWorkRemaining(state.getWorkDuration());
            } else {
                state.setMode(TimerMode.WORK);
                state.setWorkRemaining(state.getWorkDuration());
                state.setBreakRemaining(state.getBreakDuration());
            }
        } else {
            if (state.getMode() == TimerMode.BREAK) {
                state.setBreakRemaining(remaining);
            } else {
                state.setWorkRemaining(remaining);
            }
        }

        state.setLastTick(now);
    }
}