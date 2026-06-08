package com.taskvault.service;

import com.taskvault.dto.request.RoleUpdateRequest;
import com.taskvault.dto.request.StatusUpdateRequest;
import com.taskvault.dto.response.PagedResponse;
import com.taskvault.dto.response.UserResponse;
import com.taskvault.entity.User;
import com.taskvault.enums.Role;
import com.taskvault.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import com.taskvault.exception.UnauthorizedException;
import com.taskvault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final ResponseMapper mapper;

    public PagedResponse<UserResponse> listUsers(String search, Role role, Boolean isActive, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> users = userRepository.searchUsers(blankToNull(search), role, isActive, pageable);
        return new PagedResponse<>(users.map(mapper::toUser).toList(), "Users fetched", page, size, users.getTotalElements(), users.getTotalPages(), users.isLast());
    }

    public UserResponse getUser(UUID id) {
        return mapper.toUser(find(id));
    }

    @Transactional
    public UserResponse changeRole(UUID id, RoleUpdateRequest request, User currentUser) {
        if (currentUser.getId().equals(id)) {
            throw new UnauthorizedException("Admins cannot change their own role");
        }
        User user = find(id);
        user.setRole(request.role());
        return mapper.toUser(user);
    }

    @Transactional
    public UserResponse changeStatus(UUID id, StatusUpdateRequest request, User currentUser) {
        if (currentUser.getId().equals(id)) {
            throw new UnauthorizedException("Admins cannot change their own status");
        }
        User user = find(id);
        user.setActive(request.isActive());
        return mapper.toUser(user);
    }

    @Transactional
    public void softDelete(UUID id, User currentUser) {
        if (currentUser.getId().equals(id)) {
            throw new UnauthorizedException("Admins cannot delete themselves");
        }
        User user = find(id);
        user.setActive(false);
    }

    private User find(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
