package com.flowty.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChoreResponse {
    private Long id;
    private Integer rollNumber;
    private String description;
    private String category;
    private Boolean completed;
}