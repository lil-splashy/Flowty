package com.projectcozy.model;

import jakarta.persistence.*;

@Entity
@Table(name = "timer_configs")
public class TimerConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    private Integer workMinutes = 25;
    private Integer shortBreakMinutes = 5;
    private Integer longBreakMinutes = 15;
    private Integer longBreakInterval = 4;
    private Boolean autoStartBreak = false;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Integer getWorkMinutes() { return workMinutes; }
    public void setWorkMinutes(Integer workMinutes) { this.workMinutes = workMinutes; }

    public Integer getShortBreakMinutes() { return shortBreakMinutes; }
    public void setShortBreakMinutes(Integer shortBreakMinutes) { this.shortBreakMinutes = shortBreakMinutes; }

    public Integer getLongBreakMinutes() { return longBreakMinutes; }
    public void setLongBreakMinutes(Integer longBreakMinutes) { this.longBreakMinutes = longBreakMinutes; }

    public Integer getLongBreakInterval() { return longBreakInterval; }
    public void setLongBreakInterval(Integer longBreakInterval) { this.longBreakInterval = longBreakInterval; }

    public Boolean getAutoStartBreak() { return autoStartBreak; }
    public void setAutoStartBreak(Boolean autoStartBreak) { this.autoStartBreak = autoStartBreak; }
}
