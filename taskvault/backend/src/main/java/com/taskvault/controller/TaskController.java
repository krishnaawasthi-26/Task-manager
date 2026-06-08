package com.taskvault.controller;

import com.taskvault.dto.request.TaskRequest;
import com.taskvault.dto.response.ApiResponse;
import com.taskvault.dto.response.PagedResponse;
import com.taskvault.dto.response.TaskResponse;
import com.taskvault.enums.TaskPriority;
import com.taskvault.enums.TaskStatus;
import com.taskvault.service.CurrentUserService;
import com.taskvault.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task CRUD, filters, pagination, and admin stats")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {
    private final TaskService taskService;
    private final CurrentUserService currentUserService;

    @GetMapping
    @Operation(summary = "List tasks", description = "Users see own tasks; admins see all tasks. Supports search, filters, sorting, and pagination.")
    public ResponseEntity<PagedResponse<TaskResponse>> list(@RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "10") int size,
                                                            @RequestParam(required = false) TaskStatus status,
                                                            @RequestParam(required = false) TaskPriority priority,
                                                            @RequestParam(required = false) UUID categoryId,
                                                            @RequestParam(required = false) String search,
                                                            @RequestParam(defaultValue = "createdAt") String sortBy,
                                                            @RequestParam(defaultValue = "desc") String sortDir) {
        return ResponseEntity.ok(taskService.list(currentUserService.getCurrentUser(), page, size, status, priority, categoryId, search, sortBy, sortDir));
    }

    @PostMapping
    @Operation(summary = "Create task", description = "Creates a task after validating optional category visibility.")
    public ResponseEntity<ApiResponse<TaskResponse>> create(@Valid @RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(taskService.create(request, currentUserService.getCurrentUser()), "Task created"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Read task", description = "Users can read own tasks; admins can read any task.")
    public ResponseEntity<ApiResponse<TaskResponse>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(taskService.get(id, currentUserService.getCurrentUser()), "Task fetched"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update task", description = "Fully updates an owned/admin-accessible task.")
    public ResponseEntity<ApiResponse<TaskResponse>> update(@PathVariable UUID id, @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(ApiResponse.success(taskService.update(id, request, currentUserService.getCurrentUser()), "Task updated"));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Patch task", description = "Partially updates provided task fields.")
    public ResponseEntity<ApiResponse<TaskResponse>> patch(@PathVariable UUID id, @RequestBody TaskRequest request) {
        return ResponseEntity.ok(ApiResponse.success(taskService.patch(id, request, currentUserService.getCurrentUser()), "Task patched"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete task", description = "Hard deletes an owned/admin-accessible task.")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        taskService.delete(id, currentUserService.getCurrentUser());
        return ResponseEntity.ok(ApiResponse.success(null, "Task deleted"));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin task stats", description = "Returns totals, status and priority breakdowns, category counts, last 7 days, and top users.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> stats() {
        return ResponseEntity.ok(ApiResponse.success(taskService.stats(), "Task stats fetched"));
    }
}
