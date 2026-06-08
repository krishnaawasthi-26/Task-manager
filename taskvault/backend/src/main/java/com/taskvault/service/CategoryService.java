package com.taskvault.service;

import com.taskvault.dto.request.CategoryRequest;
import com.taskvault.dto.response.CategoryResponse;
import com.taskvault.dto.response.PagedResponse;
import com.taskvault.entity.Category;
import com.taskvault.entity.Task;
import com.taskvault.entity.User;
import com.taskvault.enums.Role;
import com.taskvault.exception.ResourceNotFoundException;
import com.taskvault.exception.UnauthorizedException;
import com.taskvault.repository.CategoryRepository;
import com.taskvault.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final TaskRepository taskRepository;
    private final ResponseMapper mapper;

    public PagedResponse<CategoryResponse> listVisible(User user, String search, int page, int size) {
        Page<Category> categories = categoryRepository.findVisible(user, blankToNull(search), PageRequest.of(page, size));
        return new PagedResponse<>(categories.map(mapper::toCategory).toList(), "Categories fetched", page, size, categories.getTotalElements(), categories.getTotalPages(), categories.isLast());
    }

    public PagedResponse<CategoryResponse> adminAll(String search, int page, int size) {
        Page<Category> categories = categoryRepository.findAllAdmin(blankToNull(search), PageRequest.of(page, size));
        return new PagedResponse<>(categories.map(mapper::toCategory).toList(), "All categories fetched", page, size, categories.getTotalElements(), categories.getTotalPages(), categories.isLast());
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request, User user) {
        boolean global = Boolean.TRUE.equals(request.isGlobal());
        if (global && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can create global categories");
        }
        Category category = Category.builder()
                .name(request.name().trim())
                .description(request.description())
                .color(request.color() == null ? "#6366F1" : request.color())
                .icon(request.icon() == null ? "tag" : request.icon())
                .isGlobal(global)
                .createdBy(user)
                .build();
        return mapper.toCategory(categoryRepository.save(category));
    }

    public CategoryResponse get(UUID id, User user) {
        return mapper.toCategory(accessible(id, user));
    }

    @Transactional
    public CategoryResponse update(UUID id, CategoryRequest request, User user) {
        Category category = accessible(id, user);
        ensureOwnerOrAdmin(category, user);
        category.setName(request.name().trim());
        category.setDescription(request.description());
        category.setColor(request.color() == null ? "#6366F1" : request.color());
        category.setIcon(request.icon() == null ? "tag" : request.icon());
        if (request.isGlobal() != null) {
            if (user.getRole() != Role.ADMIN && request.isGlobal()) {
                throw new UnauthorizedException("Only admins can mark categories global");
            }
            category.setGlobal(user.getRole() == Role.ADMIN && request.isGlobal());
        }
        return mapper.toCategory(category);
    }

    @Transactional
    public void delete(UUID id, User user) {
        Category category = accessible(id, user);
        ensureOwnerOrAdmin(category, user);
        List<Task> tasks = taskRepository.findByCategoryId(category.getId());
        tasks.forEach(task -> task.setCategory(null));
        taskRepository.saveAll(tasks);
        categoryRepository.delete(category);
    }

    public Category accessible(UUID id, User user) {
        if (user.getRole() == Role.ADMIN) {
            return categoryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        }
        return categoryRepository.findVisibleById(id, user).orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private void ensureOwnerOrAdmin(Category category, User user) {
        if (user.getRole() == Role.ADMIN) {
            return;
        }
        if (category.getCreatedBy() == null || !category.getCreatedBy().getId().equals(user.getId())) {
            throw new UnauthorizedException("You cannot modify this category");
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
