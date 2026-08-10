package com.flowty.dto;

import com.flowty.model.WidgetPlacement;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WidgetPlacementsRequest {
    private List<WidgetPlacement> placements;
}
