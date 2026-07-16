package com.flowty.controller;

import com.flowty.dto.TimerStateDto;
import com.flowty.service.TimerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/timer")
public class TimerController {

    private final TimerService timerService;

    public TimerController(TimerService timerService) {
        this.timerService = timerService;
    }

    @GetMapping("/state")
    public ResponseEntity<TimerStateDto> getState() {
        return ResponseEntity.ok(TimerStateDto.from(timerService.getState()));
    }

    @PostMapping("/start")
    public ResponseEntity<Map<String, String>> start() {
        timerService.start();
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/pause")
    public ResponseEntity<Map<String, String>> pause() {
        timerService.pause();
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/reset")
    public ResponseEntity<Map<String, String>> reset() {
        timerService.reset();
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/clear")
    public ResponseEntity<Map<String, String>> clear() {
        timerService.clearSessions();
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/edit")
    public ResponseEntity<Map<String, String>> edit(@RequestParam("seconds") int seconds) {
        timerService.editDuration(seconds);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}