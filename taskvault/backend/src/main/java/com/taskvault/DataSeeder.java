package com.taskvault;

import com.taskvault.entity.Category;
import com.taskvault.entity.User;
import com.taskvault.enums.Role;
import com.taskvault.repository.CategoryRepository;
import com.taskvault.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataSeeder {
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin-email}")
    private String adminEmail;

    @Value("${app.seed.admin-password}")
    private String adminPassword;

    @PostConstruct
    @Transactional
    public void seed() {
        User admin = userRepository.findByEmail(adminEmail).orElseGet(() -> userRepository.save(User.builder()
                .name("TaskVault Admin")
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .isActive(true)
                .build()));
        seedCategory("Work", "Professional projects and delivery tasks", "#6366F1", "briefcase", admin);
        seedCategory("Personal", "Personal errands and planning", "#8B5CF6", "home", admin);
        seedCategory("Health", "Fitness, appointments, and wellness", "#10B981", "heart-pulse", admin);
        seedCategory("Finance", "Budgets, invoices, and money tracking", "#F59E0B", "wallet", admin);
        seedCategory("Learning", "Courses, notes, and growth goals", "#EC4899", "graduation-cap", admin);
    }

    private void seedCategory(String name, String description, String color, String icon, User admin) {
        if (!categoryRepository.existsByNameIgnoreCaseAndCreatedBy(name, admin)) {
            categoryRepository.save(Category.builder()
                    .name(name)
                    .description(description)
                    .color(color)
                    .icon(icon)
                    .isGlobal(true)
                    .createdBy(admin)
                    .build());
        }
    }
}
