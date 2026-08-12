package com.flowty.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "stamp_slots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StampSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stamp_card_id", nullable = false)
    private StampCard stampCard;

    @Column(name = "slot_number", nullable = false)
    private int slotNumber;

    @Column(nullable = false)
    @Builder.Default
    private boolean filled = false;

    @Column(name = "filled_at")
    private Instant filledAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habit_item_id")
    private HabitItem habitItem;
}
