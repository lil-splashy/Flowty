package com.flowty.model;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("CHORE")
public class ChoreItem extends ToDoListItem {

    private Integer rollNumber;

    private String category;

    private Integer estimatedMinutes;

    public Integer getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(Integer rollNumber) {
        this.rollNumber = rollNumber;
    }

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
