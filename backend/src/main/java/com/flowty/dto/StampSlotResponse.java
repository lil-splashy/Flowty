package com.flowty.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StampSlotResponse {
    private int slotNumber;
    private boolean filled;
}