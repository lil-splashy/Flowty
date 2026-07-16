package com.flowty.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class ChoreResponse {
    private UUID id;
    private int rollNumber;
    private String description;
    private String category;
    private boolean completed;
}