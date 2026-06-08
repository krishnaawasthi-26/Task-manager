package com.taskvault.service;

import com.taskvault.dto.request.TaskRequest;
import com.taskvault.dto.response.PagedResponse;
import com.taskvault.dto.response.TaskResponse;
import com.taskvault.entity.Category;
import com.taskvault.entity.Task;
import com.taskvault.entity.User;
import com.taskvault.enums.Role;
import com.taskvault.enums.TaskPriority;
import com.taskvault.enums.TaskStatus;
import com.taskvault.exception.ResourceNotFoundException;
import com.taskvault.exception.UnauthorizedException;
import com.taskvault.repository.CategoryRepository;
import com.taskvault.repository.TaskRepository;
import com.taskvault.repository.UserRepository;
import jakarta.persistence.criteria.JoinType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ResponseMapper mapper;

    public PagedResponse<TaskResponse> list(User user, int page, int size, TaskStatus status, TaskPriority priority, UUID categoryId, String search, String sortBy, String sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC, normalizeSort(sortBy)));
        Specification<Task> spec = Specification.where(null);
        if (user.getRole() != Role.ADMIN) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("user"), user));
        }
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (priority != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("priority"), priority));
        }
        if (categoryId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.join("category", JoinType.LEFT).get("id"), categoryId));
        }
        if (search != null && !search.isBlank()) {
            String term = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), term),
                    cb.like(cb.lower(root.get("description")), term)
            ));
        }
        Page<Task> tasks = taskRepository.findAll(spec, pageable);
        boolean includeUser = user.getRole() == Role.ADMIN;
        return new PagedResponse<>(tasks.map(task -> mapper.toTask(task, includeUser)).toList(), "Tasks fetched", page, size, tasks.getTotalElements(), tasks.getTotalPages(), tasks.isLast());
    }

    @Transactional
    public TaskResponse create(TaskRequest request, User user) {
        Category category = request.categoryId() == null ? null : validateCategory(request.categoryId(), user);
        Task task = Task.builder()
                .title(request.title().trim())
                .description(request.description())
                .status(request.status() == null ? TaskStatus.TODO : request.status())
                .priority(request.priority() == null ? TaskPriority.MEDIUM : request.priority())
                .dueDate(request.dueDate())
                .category(category)
                .user(user)
                .build();
        return mapper.toTask(taskRepository.save(task), user.getRole() == Role.ADMIN);
    }

    public TaskResponse get(UUID id, User user) {
        return mapper.toTask(findAccessible(id, user), user.getRole() == Role.ADMIN);
    }

    @Transactional
    public TaskResponse update(UUID id, TaskRequest request, User user) {
        Task task = findAccessible(id, user);
        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setStatus(request.status() == null ? TaskStatus.TODO : request.status());
        task.setPriority(request.priority() == null ? TaskPriority.MEDIUM : request.priority());
        task.setDueDate(request.dueDate());
        task.setCategory(request.categoryId() == null ? null : validateCategory(request.categoryId(), user));
        return mapper.toTask(task, user.getRole() == Role.ADMIN);
    }

    @Transactional
    public TaskResponse patch(UUID id, TaskRequest request, User user) {
        Task task = findAccessible(id, user);
        if (request.title() != null && !request.title().isBlank()) {
            task.setTitle(request.title().trim());
        }
        if (request.description() != null) {
            task.setDescription(request.description());
        }
        if (request.status() != null) {
            task.setStatus(request.status());
        }
        if (request.priority() != null) {
            task.setPriority(request.priority());
        }
        if (request.dueDate() != null) {
            task.setDueDate(request.dueDate());
        }
        if (request.categoryId() != null) {
            task.setCategory(validateCategory(request.categoryId(), user));
        }
        return mapper.toTask(task, user.getRole() == Role.ADMIN);
    }

    @Transactional
    public void delete(UUID id, User user) {
        taskRepository.delete(findAccessible(id, user));
    }

    public Map<String, Object> stats() {
        long total = taskRepository.count();
        Map<String, Long> byStatus = Map.of(
                "todo", taskRepository.countByStatus(TaskStatus.TODO),
                "inProgress", taskRepository.countByStatus(TaskStatus.IN_PROGRESS),
                "done", taskRepository.countByStatus(TaskStatus.DONE)
        );
        Map<String, Long> byPriority = Map.of(
                "low", taskRepository.countByPriority(TaskPriority.LOW),
                "medium", taskRepository.countByPriority(TaskPriority.MEDIUM),
                "high", taskRepository.countByPriority(TaskPriority.HIGH)
        );
        List<Map<String, Object>> byCategory = taskRepository.countByCategory().stream()
                .map(row -> Map.<String, Object>of("categoryName", row[0], "count", row[1]))
                .toList();
        Instant since = Instant.now().minusSeconds(7 * 24 * 60 * 60L);
        List<Map<String, Object>> last7 = taskRepository.countCreatedSince(since).stream()
                .map(row -> Map.<String, Object>of("date", row[0].toString(), "count", row[1]))
                .toList();
        List<Map<String, Object>> topUsers = taskRepository.topUsersByTaskCount().stream()
                .limit(5)
                .map(row -> Map.<String, Object>of("userId", row[0], "name", row[1], "taskCount", row[2]))
                .toList();
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalTasks", total);
        stats.put("tasksByStatus", byStatus);
        stats.put("tasksByPriority", byPriority);
        stats.put("tasksByCategory", byCategory);
        stats.put("last7Days", last7);
        stats.put("topUsers", topUsers);
        stats.put("totalUsers", userRepository.count());
        stats.put("activeUsers", userRepository.countByIsActiveTrue());
        return stats;
    }

    private Task findAccessible(UUID id, User user) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        if (user.getRole() != Role.ADMIN && !task.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You cannot access this task");
        }
        return task;
    }

    private Category validateCategory(UUID categoryId, User user) {
        Category category = categoryRepository.findById(categoryId).orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        if (!category.isGlobal() && user.getRole() != Role.ADMIN && (category.getCreatedBy() == null || !category.getCreatedBy().getId().equals(user.getId()))) {
            throw new UnauthorizedException("Category is not visible to this user");
        }
        return category;
    }

    private String normalizeSort(String sortBy) {
        if (sortBy == null) {
            return "createdAt";
        }
        return switch (sortBy) {
            case "dueDate", "title", "priority", "createdAt" -> sortBy;
            default -> "createdAt";
        };
    }
}
