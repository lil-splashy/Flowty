package com.flowty.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SpendResponse {
    private int previousBalance;
    private int newBalance;
    private int pointsSpent;
    private String itemName;
}