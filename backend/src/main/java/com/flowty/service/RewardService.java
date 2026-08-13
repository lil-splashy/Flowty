package com.flowty.service;

import com.flowty.model.RewardTransaction;
import com.flowty.model.RewardTransaction.TransactionType;
import com.flowty.model.User;
import com.flowty.repository.RewardTransactionRepository;
import com.flowty.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RewardService {

    private final RewardTransactionRepository rewardTransactionRepository;
    private final UserRepository userRepository;

    @Transactional
    public RewardTransaction awardPoints(User user, int points, TransactionType type) {
        RewardTransaction transaction = new RewardTransaction();
        transaction.setUser(user);
        transaction.setPoints(points);
        transaction.setType(type);

        rewardTransactionRepository.save(transaction);

        userRepository.addPoints(user.getUsername(), points);

        return transaction;
    }

    @Transactional
    public RewardTransaction spendPoints(User user, int points, String itemName) {
        int updated = userRepository.deductPoints(user.getUsername(), points);
        if (updated == 0) {
            throw new RuntimeException("Insufficient points");
        }

        RewardTransaction transaction = new RewardTransaction();
        transaction.setUser(user);
        transaction.setPoints(-points);
        transaction.setType(TransactionType.PURCHASE);
        transaction.setHabitName(itemName);

        rewardTransactionRepository.save(transaction);

        return transaction;
    }

    public int getBalance(User user) {
        return user.getTotalPoints();
    }

    public List<RewardTransaction> getHistory(User user) {
        return rewardTransactionRepository.findByUserOrderByCreatedAtDesc(user);
    }
}