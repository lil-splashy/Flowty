package com.flowty.service;

import com.flowty.model.RewardTransaction;
import com.flowty.model.RewardTransaction.RewardReason;
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
    public RewardTransaction awardPoints(User user, int amount, RewardReason reason, Long referenceId) {
        RewardTransaction transaction = new RewardTransaction();
        transaction.setUser(user);
        transaction.setAmount(amount);
        transaction.setReason(reason);
        transaction.setReferenceId(referenceId);

        rewardTransactionRepository.save(transaction);

        int current = user.getRewardBalance() == null ? 0: user.getRewardBalance();
    user.setRewardBalance(current + amount);
        userRepository.save(user);

        return transaction;
    }

    public int getBalance(User user) {
        return user.getRewardBalance();
    }

    public List<RewardTransaction> getHistory(User user) {
        return rewardTransactionRepository.findByUserOrderByTimestampDesc(user);
    }
}
