package com.taskvault.repository;

import com.taskvault.entity.Task;
import com.taskvault.entity.User;
import com.taskvault.enums.TaskPriority;
import com.taskvault.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID>, JpaSpecificationExecutor<Task> {
    long countByUser(User user);
    long countByStatus(TaskStatus status);
    long countByPriority(TaskPriority priority);
    long countByUserAndStatus(User user, TaskStatus status);

    @Query("select t from Task t where t.category.id = :categoryId")
    List<Task> findByCategoryId(@Param("categoryId") UUID categoryId);

    @Query("select t.category.name, count(t) from Task t where t.category is not null group by t.category.name order by count(t) desc")
    List<Object[]> countByCategory();

    @Query("select t.user.id, t.user.name, count(t) from Task t group by t.user.id, t.user.name order by count(t) desc")
    List<Object[]> topUsersByTaskCount();

    @Query("select cast(t.createdAt as localdate), count(t) from Task t where t.createdAt >= :since group by cast(t.createdAt as localdate) order by cast(t.createdAt as localdate)")
    List<Object[]> countCreatedSince(@Param("since") Instant since);
}
