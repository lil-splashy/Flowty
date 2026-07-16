package com.flowty.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ChoreRequest {
    private int rollNumber;
    private String description;
    private String category;
}