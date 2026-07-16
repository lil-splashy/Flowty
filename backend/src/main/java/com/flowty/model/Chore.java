package com.flowty.model;

import com.flowty.model.enums.ChoreCategory;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "chores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chore {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "roll_number", nullable = false)
    private int rollNumber;

    @Column(nullable = false, length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ChoreCategory category;

    @Column(nullable = false)
    @Builder.Default
    private boolean completed = false;
}
