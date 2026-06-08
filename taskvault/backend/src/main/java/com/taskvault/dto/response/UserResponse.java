package com.taskvault.dto.response;

import com.taskvault.enums.Role;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email,
        Role role,
        boolean isActive,
        Instant createdAt,
        long taskCount
) {
}
