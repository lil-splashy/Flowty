package com.flowty.repository;

import com.flowty.model.StampCard;
import com.flowty.model.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StampCardRepository extends JpaRepository<StampCard, UUID> {
    List<StampCard> findByUserOrderByCreatedAtDesc(User user);
    Optional<StampCard> findFirstByUserAndRedeemedFalseOrderByCreatedAtDesc(User user);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM StampCard c WHERE c.id = :id")
    Optional<StampCard> findByIdForUpdate(@Param("id") UUID id);
}