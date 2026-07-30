package com.flowty.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HabitResponse {
    private Long id;
    private String name;
    private String description;
    private String frequency;
    private Boolean completed;
}