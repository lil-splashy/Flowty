package com.flowty.dto;

import lombok.Data;

@Data
public class HabitRequest {
    private String name;
    private String description;
    private String frequency;
}