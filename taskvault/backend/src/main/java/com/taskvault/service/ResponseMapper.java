package com.taskvault.service;

import com.taskvault.dto.response.CategoryResponse;
import com.taskvault.dto.response.TaskResponse;
import com.taskvault.dto.response.UserResponse;
import com.taskvault.entity.Category;
import com.taskvault.entity.Task;
import com.taskvault.entity.User;
import com.taskvault.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ResponseMapper {
    private final TaskRepository taskRepository;

    public UserResponse toUser(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isActive(), user.getCreatedAt(), taskRepository.countByUser(user));
    }

    public CategoryResponse toCategory(Category category) {
        String createdBy = category.getCreatedBy() == null ? "System" : category.getCreatedBy().getName();
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getColor(),
                category.getIcon(),
                category.isGlobal(),
                category.getTasks() == null ? 0 : category.getTasks().size(),
                createdBy,
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }

    public TaskResponse toTask(Task task, boolean includeUser) {
        TaskResponse.UserSummary user = includeUser && task.getUser() != null
                ? new TaskResponse.UserSummary(task.getUser().getId(), task.getUser().getName())
                : null;
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                task.getCategory() == null ? null : toCategory(task.getCategory()),
                user
        );
    }
}
