package com.taskvault.dto.response;

import com.taskvault.enums.TaskPriority;
import com.taskvault.enums.TaskStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        LocalDate dueDate,
        Instant createdAt,
        Instant updatedAt,
        CategoryResponse category,
        UserSummary user
) {
    public record UserSummary(UUID id, String name) {
    }
}
