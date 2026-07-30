package com.flowty.model;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("HABIT")
public class HabitItem extends ToDoListItem {

    @Column
    private String frequency;

    private Integer currentStreak = 0;

    private Integer longestStreak = 0;

    @Column(name = "active")
    private Boolean active = true;

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public Integer getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(Integer currentStreak) {
        this.currentStreak = currentStreak;
    }

    public Integer getLongestStreak() {
        return longestStreak;
    }

    public void setLongestStreak(Integer longestStreak) {
        this.longestStreak = longestStreak;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}