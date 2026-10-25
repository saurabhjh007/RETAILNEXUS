package com.retailnexus.dto;

import java.time.LocalDate;

public class AgileSprintDto {
    private Integer sprintNumber;
    private String name;
    private String goal;
    private String status;
    private int storyPointsPlanned;
    private int storyPointsCompleted;
    private LocalDate startDate;
    private LocalDate endDate;
    private double completionPercentage;

    public AgileSprintDto() {}

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

    public double getCompletionPercentage() {
        if (storyPointsPlanned == 0) return 0.0;
        return Math.round(((double) storyPointsCompleted / storyPointsPlanned * 100) * 10.0) / 10.0;
    }
}
