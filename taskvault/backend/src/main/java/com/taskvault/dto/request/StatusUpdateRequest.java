package com.taskvault.dto.request;

import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(@NotNull Boolean isActive) {
}
