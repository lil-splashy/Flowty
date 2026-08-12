package com.flowty.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ChoreRequest {
    private String description;
    private Integer rollNumber;
    private String category;
}