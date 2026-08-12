package com.flowty.repository;

import com.flowty.model.RewardTransaction;
import com.flowty.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RewardTransactionRepository extends JpaRepository<RewardTransaction, Long> {
    List<RewardTransaction> findByUserOrderByCreatedAtDesc(User user);
}