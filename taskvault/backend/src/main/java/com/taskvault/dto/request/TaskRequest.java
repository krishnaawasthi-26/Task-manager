package com.taskvault.dto.request;

import com.taskvault.enums.TaskPriority;
import com.taskvault.enums.TaskStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record TaskRequest(
        @NotBlank @Size(min = 3, max = 255) String title,
        @Size(max = 5000) String description,
        TaskStatus status,
        TaskPriority priority,
        @Future LocalDate dueDate,
        UUID categoryId
) {
}
