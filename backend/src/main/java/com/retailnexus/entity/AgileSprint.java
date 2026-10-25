package com.retailnexus.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "agile_sprints")
public class AgileSprint {

    @Id
    @Column(name = "sprint_number")
    private Integer sprintNumber;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String goal;

    @Column(nullable = false, length = 50)
    private String status = "PLANNED"; // PLANNED, IN_PROGRESS, COMPLETED

    @Column(name = "story_points_planned", nullable = false)
    private int storyPointsPlanned = 0;

    @Column(name = "story_points_completed", nullable = false)
    private int storyPointsCompleted = 0;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public AgileSprint() {}

    public Integer getSprintNumber() { return sprintNumber; }
    public void setSprintNumber(Integer sprintNumber) { this.sprintNumber = sprintNumber; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getStoryPointsPlanned() { return storyPointsPlanned; }
    public void setStoryPointsPlanned(int storyPointsPlanned) { this.storyPointsPlanned = storyPointsPlanned; }

    public int getStoryPointsCompleted() { return storyPointsCompleted; }
    public void setStoryPointsCompleted(int storyPointsCompleted) { this.storyPointsCompleted = storyPointsCompleted; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
