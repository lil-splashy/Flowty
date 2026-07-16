package com.flowty.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "stamp_cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StampCard {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "total_stamps", nullable = false)
    @Builder.Default
    private int totalStamps = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean redeemed = false;

    @OneToMany(mappedBy = "stampCard", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StampSlot> slots = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
