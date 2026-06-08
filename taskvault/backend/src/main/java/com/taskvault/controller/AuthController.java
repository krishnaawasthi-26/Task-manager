package com.taskvault.controller;

import com.taskvault.dto.request.LoginRequest;
import com.taskvault.dto.request.RefreshTokenRequest;
import com.taskvault.dto.request.RegisterRequest;
import com.taskvault.dto.response.ApiResponse;
import com.taskvault.dto.response.AuthResponse;
import com.taskvault.dto.response.UserResponse;
import com.taskvault.entity.User;
import com.taskvault.service.AuthService;
import com.taskvault.service.CurrentUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Registration, login, refresh, logout, and current user")
public class AuthController {
    private final AuthService authService;
    private final CurrentUserService currentUserService;

    @PostMapping("/register")
    @Operation(summary = "Register user", description = "Creates a new user and returns access and refresh tokens.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User registered"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Email already exists")
    })
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(authService.register(request), "Registered successfully"));
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticates a user with email/password.")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(request), "Logged in"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh tokens", description = "Rotates a valid refresh token and returns a new token pair.")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.refresh(request), "Token refreshed"));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Deletes the supplied refresh token.")
    public ResponseEntity<ApiResponse<Void>> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out"));
    }

    @GetMapping("/me")
    @Operation(summary = "Current user", description = "Returns the authenticated user's profile.")
    public ResponseEntity<ApiResponse<UserResponse>> me(@Parameter(hidden = true) User ignored) {
        User current = currentUserService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(authService.me(current), "Current user fetched"));
    }
}
