package com.taskvault.controller;

import com.taskvault.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Health", description = "Application health")
public class HealthController {
    private final HealthEndpoint healthEndpoint;

    @GetMapping("/api/health")
    @Operation(summary = "Health check", description = "Returns app, database, timestamp, and version health data.")
    public ApiResponse<Map<String, Object>> health() {
        return ApiResponse.success(Map.of(
                "status", "UP",
                "timestamp", Instant.now(),
                "dbStatus", healthEndpoint.health().getStatus().getCode(),
                "version", "1.0.0"
        ), "Health fetched");
    }
}
