package com.flowty.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class StampCardResponse {
    private UUID id;
    private int totalStamps;
    private boolean redeemed;
    private List<StampSlotResponse> slots;
}