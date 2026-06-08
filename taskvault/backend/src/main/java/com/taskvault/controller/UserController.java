package com.taskvault.controller;

import com.taskvault.dto.request.RoleUpdateRequest;
import com.taskvault.dto.request.StatusUpdateRequest;
import com.taskvault.dto.response.ApiResponse;
import com.taskvault.dto.response.PagedResponse;
import com.taskvault.dto.response.UserResponse;
import com.taskvault.enums.Role;
import com.taskvault.service.CurrentUserService;
import com.taskvault.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Users", description = "Admin-only user management")
@SecurityRequirement(name = "bearerAuth")
public class UserController {
    private final UserService userService;
    private final CurrentUserService currentUserService;

    @GetMapping
    @Operation(summary = "List users", description = "Paginated users with optional search, role, and active filters.")
    public ResponseEntity<PagedResponse<UserResponse>> list(@RequestParam(required = false) String search,
                                                            @RequestParam(required = false) Role role,
                                                            @RequestParam(required = false) Boolean isActive,
                                                            @RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(userService.listUsers(search, role, isActive, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Read user", description = "Reads one user with task count.")
    public ResponseEntity<ApiResponse<UserResponse>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUser(id), "User fetched"));
    }

    @PatchMapping("/{id}/role")
    @Operation(summary = "Change role", description = "Changes a user's role. Admin cannot change own role.")
    public ResponseEntity<ApiResponse<UserResponse>> role(@PathVariable UUID id, @Valid @RequestBody RoleUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.changeRole(id, request, currentUserService.getCurrentUser()), "Role updated"));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Change status", description = "Activates/deactivates a user. Admin cannot deactivate self.")
    public ResponseEntity<ApiResponse<UserResponse>> status(@PathVariable UUID id, @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.changeStatus(id, request, currentUserService.getCurrentUser()), "Status updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete user", description = "Sets isActive=false. Admin cannot delete self.")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        userService.softDelete(id, currentUserService.getCurrentUser());
        return ResponseEntity.ok(ApiResponse.success(null, "User deactivated"));
    }
}
