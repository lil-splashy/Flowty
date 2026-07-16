package com.flowty.model;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("CHORE")
public class ChoreItem extends ToDoListItem {

    private String category;

    private Integer estimatedMinutes;

    @Column(name = "roll_number")
    private Integer rollNumber;

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

    public Integer getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(Integer rollNumber) {
        this.rollNumber = rollNumber;
    }
}