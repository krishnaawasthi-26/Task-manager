package com.taskvault.repository;

import com.taskvault.entity.User;
import com.taskvault.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByIsActiveTrue();
    long countByRole(Role role);

    @Query("""
            select u from User u
            where (:search is null or lower(u.name) like lower(concat('%', :search, '%')) or lower(u.email) like lower(concat('%', :search, '%')))
              and (:role is null or u.role = :role)
              and (:isActive is null or u.isActive = :isActive)
            """)
    Page<User> searchUsers(@Param("search") String search, @Param("role") Role role, @Param("isActive") Boolean isActive, Pageable pageable);
}
