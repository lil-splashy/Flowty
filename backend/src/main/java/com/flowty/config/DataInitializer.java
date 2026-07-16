package com.flowty.config;

import com.flowty.model.Chore;
import com.flowty.model.User;
import com.flowty.model.enums.ChoreCategory;
import com.flowty.repository.ChoreRepository;
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
    private final ChoreRepository choreRepository;
    private final PasswordEncoder passwordEncoder;

    private static final List<ChoreSeed> DEFAULT_CHORES = List.of(
            new ChoreSeed(1, "Sweep & mop the floors", ChoreCategory.CHORE),
            new ChoreSeed(2, "Scrub bathroom — toilet, sink, tub", ChoreCategory.CHORE),
            new ChoreSeed(3, "Do dishes & wipe down kitchen", ChoreCategory.CHORE),
            new ChoreSeed(4, "Wash, dry & fold laundry", ChoreCategory.CHORE),
            new ChoreSeed(5, "Take out all trash & recycling", ChoreCategory.CHORE),
            new ChoreSeed(6, "Wipe down windows & mirrors", ChoreCategory.CHORE),
            new ChoreSeed(7, "Change & wash bed sheets", ChoreCategory.CHORE),
            new ChoreSeed(8, "Clean counters & stovetop", ChoreCategory.CHORE),
            new ChoreSeed(9, "Water all indoor plants", ChoreCategory.CHORE),
            new ChoreSeed(10, "Declutter one drawer or shelf", ChoreCategory.CHORE),
            new ChoreSeed(11, "Restock bathroom supplies", ChoreCategory.CHORE),
            new ChoreSeed(12, "Vacuum all carpets & rugs", ChoreCategory.CHORE),
            new ChoreSeed(13, "Clean out the fridge", ChoreCategory.CHORE),
            new ChoreSeed(14, "Fix one small broken thing", ChoreCategory.CHORE),
            new ChoreSeed(15, "Read for 30 min (book or article)", ChoreCategory.STUDY),
            new ChoreSeed(16, "Rewrite notes from last week", ChoreCategory.STUDY),
            new ChoreSeed(17, "Make or drill 20 flashcards", ChoreCategory.STUDY),
            new ChoreSeed(18, "Work through 10 practice problems", ChoreCategory.STUDY),
            new ChoreSeed(19, "Outline or draft an essay section", ChoreCategory.STUDY),
            new ChoreSeed(20, "Natural 20 — your choice or a break!", ChoreCategory.LEGENDARY)
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

        List<Chore> chores = DEFAULT_CHORES.stream()
                .map(seed -> Chore.builder()
                        .user(demoUser)
                        .rollNumber(seed.rollNumber)
                        .description(seed.description)
                        .category(seed.category)
                        .build())
                .toList();
        choreRepository.saveAll(chores);
    }

    private record ChoreSeed(int rollNumber, String description, ChoreCategory category) {}
}