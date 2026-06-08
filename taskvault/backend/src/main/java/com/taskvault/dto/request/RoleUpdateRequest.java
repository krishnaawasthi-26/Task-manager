package com.taskvault.dto.request;

import com.taskvault.enums.Role;
import jakarta.validation.constraints.NotNull;

public record RoleUpdateRequest(@NotNull Role role) {
}
