package com.taskvault.repository;

import com.taskvault.entity.Category;
import com.taskvault.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    boolean existsByNameIgnoreCaseAndCreatedBy(String name, User createdBy);

    @Query("""
            select c from Category c
            where (c.isGlobal = true or c.createdBy = :user)
              and (:search is null or lower(c.name) like lower(concat('%', :search, '%')))
            order by c.isGlobal desc, c.name asc
            """)
    Page<Category> findVisible(@Param("user") User user, @Param("search") String search, Pageable pageable);

    @Query("""
            select c from Category c
            where c.id = :id and (c.isGlobal = true or c.createdBy = :user)
            """)
    Optional<Category> findVisibleById(@Param("id") UUID id, @Param("user") User user);

    @Query("""
            select c from Category c
            where (:search is null or lower(c.name) like lower(concat('%', :search, '%')))
            order by c.createdAt desc
            """)
    Page<Category> findAllAdmin(@Param("search") String search, Pageable pageable);
}
