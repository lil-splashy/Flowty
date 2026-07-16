package com.flowty.repository;

import com.flowty.model.StampCard;
import com.flowty.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StampCardRepository extends JpaRepository<StampCard, UUID> {
    List<StampCard> findByUserOrderByCreatedAtDesc(User user);
    Optional<StampCard> findFirstByUserAndRedeemedFalseOrderByCreatedAtDesc(User user);
}