package com.taskvault.controller;

import com.taskvault.dto.request.CategoryRequest;
import com.taskvault.dto.response.ApiResponse;
import com.taskvault.dto.response.CategoryResponse;
import com.taskvault.dto.response.PagedResponse;
import com.taskvault.entity.User;
import com.taskvault.service.CategoryService;
import com.taskvault.service.CurrentUserService;
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

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Global and user-owned task categories")
@SecurityRequirement(name = "bearerAuth")
public class CategoryController {
    private final CategoryService categoryService;
    private final CurrentUserService currentUserService;

    @GetMapping
    @Operation(summary = "List visible categories", description = "Returns global categories plus the current user's own categories.")
    public ResponseEntity<PagedResponse<CategoryResponse>> list(@RequestParam(required = false) String search,
                                                               @RequestParam(defaultValue = "0") int page,
                                                               @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(categoryService.listVisible(currentUserService.getCurrentUser(), search, page, size));
    }

    @PostMapping
    @Operation(summary = "Create category", description = "Creates a personal category, or a global category when the caller is an admin.")
    public ResponseEntity<ApiResponse<CategoryResponse>> create(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(categoryService.create(request, currentUserService.getCurrentUser()), "Category created"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Read category", description = "Reads a category if it is global, owned by the caller, or caller is admin.")
    public ResponseEntity<ApiResponse<CategoryResponse>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.get(id, currentUserService.getCurrentUser()), "Category fetched"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update category", description = "Fully updates a category. Only owner or admin can update.")
    public ResponseEntity<ApiResponse<CategoryResponse>> update(@PathVariable UUID id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.update(id, request, currentUserService.getCurrentUser()), "Category updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete category", description = "Deletes a category after setting related tasks category to null.")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        categoryService.delete(id, currentUserService.getCurrentUser());
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted"));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin list all categories", description = "Returns all categories across all users.")
    public ResponseEntity<PagedResponse<CategoryResponse>> adminAll(@RequestParam(required = false) String search,
                                                                    @RequestParam(defaultValue = "0") int page,
                                                                    @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(categoryService.adminAll(search, page, size));
    }
}
