package com.taskvault.service;

import com.taskvault.entity.User;
import com.taskvault.exception.ResourceNotFoundException;
import com.taskvault.repository.UserRepository;
import com.taskvault.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {
    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            return userRepository.findByEmail(userPrincipal.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
        }
        throw new ResourceNotFoundException("Current user not found");
    }
}
