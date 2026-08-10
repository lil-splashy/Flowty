package com.flowty.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WidgetPlacement {
    private String widgetId;
    private double x;
    private double y;
    private int zIndex;
}
