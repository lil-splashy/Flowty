package com.projectcozy.model;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("HABIT")
public class HabitItem extends ToDoListItem {

    @Column(nullable = false)
    private String frequency;

    private Integer currentStreak = 0;

    private Integer longestStreak = 0;

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
}
