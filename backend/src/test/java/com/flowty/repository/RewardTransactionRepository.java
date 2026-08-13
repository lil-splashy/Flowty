package com.flowty.repository;

import com.flowty.model.RewardTransaction;
import com.flowty.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RewardTransactionRepository extends JpaRepository<RewardTransaction, Long> {
    List<RewardTransaction> findByUserOrderByTimestampDesc(User user);
}
