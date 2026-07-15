package com.projectcozy.model;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("CHORE")
public class ChoreItem extends ToDoListItem {

    private String category;

    private Integer estimatedMinutes;

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getEstimatedMinutes() {
        return estimatedMinutes;
    }

    public void setEstimatedMinutes(Integer estimatedMinutes) {
        this.estimatedMinutes = estimatedMinutes;
    }
}
