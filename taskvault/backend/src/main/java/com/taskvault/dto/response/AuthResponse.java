package com.taskvault.dto.response;

public record AuthResponse(
        UserResponse user,
        String accessToken,
        String refreshToken
) {
}
