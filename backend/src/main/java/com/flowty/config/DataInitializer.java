package com.flowty.config;

import com.flowty.model.ChoreItem;
import com.flowty.model.User;
import com.flowty.repository.ToDoListItemRepository;
import com.flowty.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ToDoListItemRepository toDoListItemRepository;
    private final PasswordEncoder passwordEncoder;

    private static final List<ChoreSeed> DEFAULT_CHORES = List.of(
            new ChoreSeed(1, "Sweep & mop the floors", "CHORE"),
            new ChoreSeed(2, "Scrub bathroom — toilet, sink, tub", "CHORE"),
            new ChoreSeed(3, "Do dishes & wipe down kitchen", "CHORE"),
            new ChoreSeed(4, "Wash, dry & fold laundry", "CHORE"),
            new ChoreSeed(5, "Take out all trash & recycling", "CHORE"),
            new ChoreSeed(6, "Wipe down windows & mirrors", "CHORE"),
            new ChoreSeed(7, "Change & wash bed sheets", "CHORE"),
            new ChoreSeed(8, "Clean counters & stovetop", "CHORE"),
            new ChoreSeed(9, "Water all indoor plants", "CHORE"),
            new ChoreSeed(10, "Declutter one drawer or shelf", "CHORE"),
            new ChoreSeed(11, "Restock bathroom supplies", "CHORE"),
            new ChoreSeed(12, "Vacuum all carpets & rugs", "CHORE"),
            new ChoreSeed(13, "Clean out the fridge", "CHORE"),
            new ChoreSeed(14, "Fix one small broken thing", "CHORE"),
            new ChoreSeed(15, "Read for 30 min (book or article)", "STUDY"),
            new ChoreSeed(16, "Rewrite notes from last week", "STUDY"),
            new ChoreSeed(17, "Make or drill 20 flashcards", "STUDY"),
            new ChoreSeed(18, "Work through 10 practice problems", "STUDY"),
            new ChoreSeed(19, "Outline or draft an essay section", "STUDY"),
            new ChoreSeed(20, "Natural 20 — your choice or a break!", "LEGENDARY")
    );

    @Override
    public void run(String... args) {
        if (userRepository.existsByUsername("demo")) {
            return;
        }

        User demoUser = User.builder()
                .username("demo")
                .email("demo@d20dashboard.local")
                .password(passwordEncoder.encode("password"))
                .build();
        userRepository.save(demoUser);

        List<ChoreItem> choreItems = DEFAULT_CHORES.stream()
                .map(seed -> {
                    ChoreItem item = new ChoreItem();
                    item.setUser(demoUser);
                    item.setTitle(seed.description);
                    item.setDescription(seed.description);
                    item.setRollNumber(seed.rollNumber);
                    item.setCategory(seed.category);
                    return item;
                })
                .toList();
        toDoListItemRepository.saveAll(choreItems);
    }

    private record ChoreSeed(int rollNumber, String description, String category) {}
}