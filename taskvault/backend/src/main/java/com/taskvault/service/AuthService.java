package com.taskvault.service;

import com.taskvault.dto.request.LoginRequest;
import com.taskvault.dto.request.RefreshTokenRequest;
import com.taskvault.dto.request.RegisterRequest;
import com.taskvault.dto.response.AuthResponse;
import com.taskvault.dto.response.UserResponse;
import com.taskvault.entity.RefreshToken;
import com.taskvault.entity.User;
import com.taskvault.enums.Role;
import com.taskvault.exception.DuplicateEmailException;
import com.taskvault.exception.TokenRefreshException;
import com.taskvault.exception.UnauthorizedException;
import com.taskvault.repository.RefreshTokenRepository;
import com.taskvault.repository.UserRepository;
import com.taskvault.security.JwtService;
import com.taskvault.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ResponseMapper mapper;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEmailException("Email already exists");
        }
        User user = User.builder()
                .name(request.name().trim())
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .isActive(true)
                .build();
        userRepository.save(user);
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        if (!user.isActive() || !passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }
        refreshTokenRepository.deleteByUser(user);
        refreshTokenRepository.flush();
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken current = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new TokenRefreshException("Refresh token not found"));
        if (current.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(current);
            throw new TokenRefreshException("Refresh token expired");
        }
        User user = current.getUser();
        UserPrincipal principal = new UserPrincipal(user);
        if (!jwtService.isRefreshTokenValid(request.refreshToken(), principal)) {
            refreshTokenRepository.delete(current);
            throw new TokenRefreshException("Refresh token invalid");
        }
        refreshTokenRepository.delete(current);
        refreshTokenRepository.flush();
        return issueTokens(user);
    }

    @Transactional
    public void logout(RefreshTokenRequest request) {
        refreshTokenRepository.deleteByToken(request.refreshToken());
    }

    public UserResponse me(User user) {
        return mapper.toUser(user);
    }

    private AuthResponse issueTokens(User user) {
        UserPrincipal principal = new UserPrincipal(user);
        String accessToken = jwtService.generateAccessToken(principal);
        String refreshToken = jwtService.generateRefreshToken(principal);
        refreshTokenRepository.save(RefreshToken.builder()
                .token(refreshToken)
                .user(user)
                .expiresAt(Instant.now().plusMillis(jwtService.getRefreshExpiryMs()))
                .build());
        return new AuthResponse(mapper.toUser(user), accessToken, refreshToken);
    }
}
