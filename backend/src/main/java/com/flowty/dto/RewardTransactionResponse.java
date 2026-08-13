package com.flowty.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RewardTransactionResponse {
    private Long id;
    private String type;
    private int points;
    private String habitName;
    private String createdAt;
}