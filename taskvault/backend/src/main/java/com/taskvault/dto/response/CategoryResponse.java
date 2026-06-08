package com.taskvault.dto.response;

import java.time.Instant;
import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        String description,
        String color,
        String icon,
        boolean isGlobal,
        long taskCount,
        String createdBy,
        Instant createdAt,
        Instant updatedAt
) {
}
