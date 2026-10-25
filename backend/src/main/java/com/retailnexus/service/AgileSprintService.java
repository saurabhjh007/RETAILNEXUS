package com.retailnexus.service;

import com.retailnexus.dto.AgileSprintDto;
import com.retailnexus.entity.AgileSprint;
import com.retailnexus.exception.ResourceNotFoundException;
import com.retailnexus.repository.AgileSprintRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AgileSprintService {

    private final AgileSprintRepository agileSprintRepository;
    private final AuditService auditService;

    public AgileSprintService(AgileSprintRepository agileSprintRepository, AuditService auditService) {
        this.agileSprintRepository = agileSprintRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<AgileSprintDto> getAllSprints() {
        return agileSprintRepository.findAllByOrderBySprintNumberAsc().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public AgileSprintDto updateSprintProgress(Integer sprintNumber, String status, Integer completedPoints) {
        AgileSprint sprint = agileSprintRepository.findById(sprintNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint " + sprintNumber + " not found"));

        if (status != null && !status.isBlank()) {
            sprint.setStatus(status.toUpperCase());
        }
        if (completedPoints != null && completedPoints >= 0) {
            sprint.setStoryPointsCompleted(completedPoints);
        }

        AgileSprint saved = agileSprintRepository.save(sprint);
        auditService.record("AgileSprint", "Sprint-" + sprintNumber, "UPDATE_PROGRESS",
            "Updated Sprint " + sprintNumber + ": Status=" + saved.getStatus() + ", CompletedPoints=" + saved.getStoryPointsCompleted());

        return mapToDto(saved);
    }

    public AgileSprintDto mapToDto(AgileSprint sprint) {
        AgileSprintDto dto = new AgileSprintDto();
        dto.setSprintNumber(sprint.getSprintNumber());
        dto.setName(sprint.getName());
        dto.setGoal(sprint.getGoal());
        dto.setStatus(sprint.getStatus());
        dto.setStoryPointsPlanned(sprint.getStoryPointsPlanned());
        dto.setStoryPointsCompleted(sprint.getStoryPointsCompleted());
        dto.setStartDate(sprint.getStartDate());
        dto.setEndDate(sprint.getEndDate());
        return dto;
    }
}
