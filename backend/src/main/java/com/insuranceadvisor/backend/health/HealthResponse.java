package com.insuranceadvisor.backend.health;

import java.time.Instant;
import java.util.Map;

public record HealthResponse(
    HealthStatus status,
    String service,
    Instant timestamp,
    Map<String, DependencyStatusResponse> dependencies
) {
}
